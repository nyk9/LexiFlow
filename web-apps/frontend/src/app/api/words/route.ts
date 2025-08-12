import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCache, generateCacheKey, CACHE_CONFIG, invalidateCache } from "@/lib/cache";

// For demo purposes, using a hardcoded user ID
const DEMO_USER_ID = "demo-user-001";

export async function GET() {
  try {
    const cacheKey = generateCacheKey(CACHE_CONFIG.WORDS_LIST.keyPrefix, DEMO_USER_ID);
    
    const words = await withCache(
      cacheKey,
      async () => {
        return await db.word.findMany({
          where: {
            userId: DEMO_USER_ID,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      },
      CACHE_CONFIG.WORDS_LIST.ttl
    );
    
    return NextResponse.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      word,
      meaning,
      translation,
      partOfSpeech,
      phonetic,
      example,
      category,
    } = await request.json();

    const newWord = await db.word.create({
      data: {
        word,
        meaning,
        translation: translation || null,
        partOfSpeech: partOfSpeech || [],
        phonetic: phonetic || null,
        example: example || null,
        category: category || null,
        userId: DEMO_USER_ID,
      },
    });
    
    // Invalidate word list cache when new word is created
    invalidateCache(CACHE_CONFIG.WORDS_LIST.keyPrefix);
    
    return NextResponse.json(newWord);
  } catch (error) {
    console.error("Error creating word:", error);
    return NextResponse.json(
      { error: "Failed to create word" },
      { status: 500 },
    );
  }
}
