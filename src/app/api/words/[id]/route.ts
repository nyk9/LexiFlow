import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { invalidateCache, CACHE_CONFIG } from "@/lib/cache";
import { auth } from "../../../../../auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const word = await db.word.findUnique({ where: { id } });
  return NextResponse.json(word);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const word = await db.word.update({ where: { id }, data: body });

    // Record the word update activity
    await recordWordActivity(session.user.id, 'update');

    // Invalidate relevant caches when word is updated
    invalidateCache(CACHE_CONFIG.WORDS_LIST.keyPrefix);
    invalidateCache(CACHE_CONFIG.AI_SUGGESTIONS.keyPrefix);

    return NextResponse.json(word);
  } catch (error) {
    console.error("Error updating word:", error);
    return NextResponse.json(
      { error: "Failed to update word" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const word = await db.word.delete({ where: { id } });

  // Invalidate relevant caches when word is deleted
  invalidateCache(CACHE_CONFIG.WORDS_LIST.keyPrefix);
  invalidateCache(CACHE_CONFIG.AI_SUGGESTIONS.keyPrefix);

  return NextResponse.json(word);
}
