import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_GEMINI_API_KEY,
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  sessionId: string;
  messages: Message[];
  userMessage: string;
}

// POST /api/conversation/chat - Send message and get AI response
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, messages, userMessage }: ChatRequest = await req.json();

    if (!userMessage || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build conversation history for context
    const conversationHistory = messages
      .map((msg) => {
        const role = msg.role === "user" ? "User" : "AI";
        return `${role}: ${msg.content}`;
      })
      .join("\n");

    const systemPrompt = `You are an English conversation partner helping a Japanese learner practice English at a B2 proficiency level.

Guidelines:
- Engage in natural, free-form conversation
- Use B2-level vocabulary and grammar
- Be encouraging and supportive
- Keep responses conversational (2-4 sentences usually)
- If the user asks about vocabulary or grammar, switch to tutor mode and provide detailed explanations
- Adapt your topics to the user's interests
- Ask follow-up questions to keep the conversation flowing

Conversation History:
${conversationHistory}

User's latest message: ${userMessage}

Respond naturally in English:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: systemPrompt,
    });

    const aiResponse = response.text;

    return NextResponse.json({
      response: aiResponse,
      sessionId,
    });
  } catch (error) {
    console.error("Error in conversation chat:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
