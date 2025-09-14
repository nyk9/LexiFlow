import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  withCache,
  generateCacheKey,
  CACHE_CONFIG,
  invalidateCache,
} from "@/lib/cache";
import { auth } from "../../../../auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const cacheKey = generateCacheKey(
      CACHE_CONFIG.WORDS_LIST.keyPrefix,
      userId,
    );

    const words = await withCache(
      cacheKey,
      async () => {
        return await db.word.findMany({
          where: {
            userId: userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      },
      CACHE_CONFIG.WORDS_LIST.ttl,
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

async function recordWordActivity(userId: string, activityType: 'add' | 'update') {
  const today = new Date().toISOString().slice(0, 10);
  
  const updateData = activityType === 'add' 
    ? { add: { increment: 1 } }
    : { update: { increment: 1 } };

  await db.dateRecord.upsert({
    where: {
      date_userId: {
        date: today,
        userId: userId,
      },
    },
    create: {
      date: today,
      add: activityType === 'add' ? 1 : 0,
      update: activityType === 'update' ? 1 : 0,
      quiz: 0,
      userId: userId,
    },
    update: updateData,
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

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
        userId: userId,
      },
    });

    // Record the word addition activity
    await recordWordActivity(userId, 'add');

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
