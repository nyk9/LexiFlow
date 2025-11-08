import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_GEMINI_API_KEY,
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AnalyzeRequest {
  sessionId: string;
  messages: Message[];
}

interface VocabularySuggestion {
  word: string;
  partOfSpeech: string;
  phonetic: string;
  meaning: string;
  translation: string;
  example: string;
  category: string;
  conversationContext: string;
  reason: string;
}

interface AnalysisResponse {
  suggestions: VocabularySuggestion[];
  topics: string[];
  skillsAssessment: {
    grammarAccuracy: number;
    vocabularyAppropriateness: number;
    sentenceComplexity: number;
    flowSmoothness: number;
    naturalPhraseUsage: number;
  };
  linguisticAnalysis: {
    avgSentenceLength: number;
    vocabularyLevel: string;
    grammarComplexity: string;
  };
  overallFeedback: string;
}

// POST /api/conversation/analyze - Analyze conversation and generate suggestions
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, messages }: AnalyzeRequest = await req.json();

    if (!sessionId || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const conversationSession = await db.conversationSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!conversationSession) {
      return NextResponse.json(
        { error: "Conversation session not found" },
        { status: 404 }
      );
    }

    // Get user's existing vocabulary to avoid duplicates
    const existingWords = await db.word.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        word: true,
      },
    });

    const existingWordList = existingWords.map((w) => w.word.toLowerCase());

    // Format conversation for analysis
    const conversationText = messages
      .map((msg) => {
        const role = msg.role === "user" ? "User" : "AI";
        return `${role}: ${msg.content}`;
      })
      .join("\n");

    const userMessages = messages.filter((m) => m.role === "user");

    const analysisPrompt = `You are an expert English language instructor analyzing a B2-level learner's conversation.

**Conversation Transcript:**
${conversationText}

**User's Existing Vocabulary (to avoid duplicates):**
${existingWordList.join(", ")}

**Analysis Tasks:**

1. **Vocabulary Suggestions**: Identify 5-8 vocabulary words the learner should know based on:
   - Words they struggled to express
   - More sophisticated alternatives to basic words they used
   - Key vocabulary related to conversation topics they discussed
   - EXCLUDE any words from their existing vocabulary list

2. **Topic Analysis**: Identify the main topics discussed (2-4 topics)

3. **Skills Assessment**: Evaluate (0-100 scale):
   - Grammar accuracy
   - Vocabulary appropriateness
   - Sentence complexity
   - Conversation flow smoothness
   - Natural phrase usage

4. **Linguistic Analysis**:
   - Average sentence length in user's messages
   - Overall vocabulary level (A2/B1/B2/C1)
   - Grammar complexity level (basic/intermediate/advanced)

5. **Overall Feedback**: Brief encouraging feedback in Japanese (2-3 sentences)

**Output Format (JSON only, no markdown):**
{
  "suggestions": [
    {
      "word": "suggested word",
      "partOfSpeech": "noun/verb/adjective/etc",
      "phonetic": "IPA phonetic",
      "meaning": "Clear English definition",
      "translation": "日本語訳",
      "example": "Example sentence using the word",
      "category": "Relevant category",
      "conversationContext": "Where/why this word would have been useful in the conversation",
      "reason": "Why learning this word will help (in Japanese)"
    }
  ],
  "topics": ["topic1", "topic2"],
  "skillsAssessment": {
    "grammarAccuracy": 85,
    "vocabularyAppropriateness": 75,
    "sentenceComplexity": 70,
    "flowSmoothness": 80,
    "naturalPhraseUsage": 65
  },
  "linguisticAnalysis": {
    "avgSentenceLength": 12.5,
    "vocabularyLevel": "B1-B2",
    "grammarComplexity": "intermediate"
  },
  "overallFeedback": "Japanese feedback here"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: analysisPrompt,
    });

    let analysisData: AnalysisResponse;

    try {
      // Clean response text
      let responseText = response.text.trim();

      // Remove markdown code blocks if present
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

      analysisData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", response.text);
      return NextResponse.json(
        { error: "Failed to parse analysis response" },
        { status: 500 }
      );
    }

    // Save analysis results to database
    try {
      // Save topics
      if (analysisData.topics && analysisData.topics.length > 0) {
        await db.conversationTopic.createMany({
          data: analysisData.topics.map((topic, index) => ({
            sessionId,
            topic,
            orderSequence: index,
            complexityLevel: analysisData.linguisticAnalysis.vocabularyLevel,
          })),
        });
      }

      // Save linguistic analysis
      if (analysisData.linguisticAnalysis) {
        await db.linguisticAnalysis.create({
          data: {
            sessionId,
            avgSentenceLength: analysisData.linguisticAnalysis.avgSentenceLength,
            vocabularyLevel: analysisData.linguisticAnalysis.vocabularyLevel,
            grammarComplexity: analysisData.linguisticAnalysis.grammarComplexity,
          },
        });
      }

      // Save skills assessment
      if (analysisData.skillsAssessment) {
        await db.skillsAssessment.create({
          data: {
            sessionId,
            grammarAccuracyScore: analysisData.skillsAssessment.grammarAccuracy,
            vocabularyAppropriatenessScore:
              analysisData.skillsAssessment.vocabularyAppropriateness,
            sentenceComplexityScore:
              analysisData.skillsAssessment.sentenceComplexity,
            flowSmoothnessScore: analysisData.skillsAssessment.flowSmoothness,
            naturalPhraseUsageScore:
              analysisData.skillsAssessment.naturalPhraseUsage,
            responseTimingAvg: null,
          },
        });
      }

      // Save vocabulary suggestions
      if (analysisData.suggestions && analysisData.suggestions.length > 0) {
        await db.vocabularySuggestion.createMany({
          data: analysisData.suggestions.map((suggestion) => ({
            sessionId,
            suggestedWord: suggestion.word,
            userWordUsed: null,
            conversationContext: suggestion.conversationContext,
            suggestionReason: suggestion.reason,
            status: "pending",
          })),
        });
      }
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Continue even if DB save fails - return the analysis
    }

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error("Error analyzing conversation:", error);
    return NextResponse.json(
      { error: "Failed to analyze conversation" },
      { status: 500 }
    );
  }
}
