import { Word } from "@/types/word";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { withCache, generateCacheKey, CACHE_CONFIG } from "@/lib/cache";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_GEMINI_API_KEY,
}); // Assumes GEMINI_API_KEY is set

export async function POST(req: NextRequest) {
  try {
    const { vocabulary } = await req.json();
    console.log(vocabulary);
    const wordCount: number = vocabulary.length;
    // vocabulary: Word[]の中から categoryだけを取り出した配列
    const categories: string[] = vocabulary.map((voc: Word) => voc.category);
    const existingWords: Word[] = vocabulary;

    // Generate cache key based on vocabulary data
    const cacheKey = generateCacheKey(CACHE_CONFIG.AI_SUGGESTIONS.keyPrefix, {
      wordCount,
      categories: categories.sort(), // Sort for consistent key generation
      wordList: existingWords.map((w) => w.word).sort(), // Use word list for caching
    });

    // Try to get cached result first
    const cachedResult = await withCache(
      cacheKey,
      async () => {
        const prompt = `
          # Role and Goal
          You are an expert English vocabulary tutor for Japanese learners. Your goal is to analyze the user's current vocabulary and recommend 5 new, relevant English words that will help them expand their knowledge effectively towards a B2 proficiency level.

          # User's Current Vocabulary Data
          - **Total Words Learned:** ${wordCount}
          - **Category Distribution:** ${JSON.stringify(categories)}
          - **Existing Word List:**
            \`\`\`json
            ${JSON.stringify(existingWords, null, 2)}
            \`\`\`

          # Recommendation Criteria
          1.  **No Duplicates:** Do not suggest any words from the "Existing Word List".
          2.  **Appropriate Difficulty:** Target a B2 English level. The words should be slightly challenging but achievable.
          3.  **Practicality:** Prioritize words that are highly useful in everyday conversation and business contexts.
          4.  **Thematic Connection:** Suggest words that are semantically related to the user's existing vocabulary to encourage systematic learning.
          5.  **Memorability:** Choose words that are distinctive and easy to remember.

          # Output Requirements
          - **Format:** Your response MUST be a single, valid JSON object. Do not include any text or markdown formatting (like \`\`\`json) before or after the JSON object.
          - **Content:** The JSON object must conform to the following structure. Provide all specified fields for each recommended word.

          {
            "recommendations": [
              {
                "word": "The recommended English word",
                "part_of_speech": "The part of speech (e.g., noun, verb, adjective)",
                "phonetic": "The phonetic symbol (IPA)",
                "meaning": "A concise definition in English, explaining why this word is recommended based on the user's existing words.",
                "translation": "The Japanese translation",
                "category": "A relevant category for the word (e.g., Business, Travel, Technology)",
                "example": "A clear example sentence in English demonstrating the word's usage."
              }
            ],
            "learningAdvice": "Provide personalized learning advice in Japanese based on the user's current vocabulary."
          }
          `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
        });

        return { text: response.text };
      },
      CACHE_CONFIG.AI_SUGGESTIONS.ttl,
    );

    return NextResponse.json(cachedResult);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
