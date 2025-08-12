import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { invalidateCache, CACHE_CONFIG } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const word = await db.word.findUnique({ where: { id } });
  return NextResponse.json(word);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const word = await db.word.update({ where: { id }, data: body });
  
  // Invalidate relevant caches when word is updated
  invalidateCache(CACHE_CONFIG.WORDS_LIST.keyPrefix);
  invalidateCache(CACHE_CONFIG.AI_SUGGESTIONS.keyPrefix);
  
  return NextResponse.json(word);
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
