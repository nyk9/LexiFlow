import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    sessionId: string;
  }>;
}

// PUT /api/conversation/suggestions/[sessionId] - Update suggestion status
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const { word, status } = await req.json();

    if (!word || !status) {
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

    // Update suggestion status
    const updatedSuggestion = await db.vocabularySuggestion.updateMany({
      where: {
        sessionId,
        suggestedWord: word,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      updated: updatedSuggestion.count,
    });
  } catch (error) {
    console.error("Error updating suggestion status:", error);
    return NextResponse.json(
      { error: "Failed to update suggestion status" },
      { status: 500 }
    );
  }
}

// GET /api/conversation/suggestions/[sessionId] - Get suggestions for session
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

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

    // Get suggestions
    const suggestions = await db.vocabularySuggestion.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
