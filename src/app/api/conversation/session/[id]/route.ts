import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT /api/conversation/session/[id] - End a conversation session
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify session belongs to user
    const conversationSession = await db.conversationSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!conversationSession) {
      return NextResponse.json(
        { error: "Conversation session not found" },
        { status: 404 }
      );
    }

    const endedAt = new Date();
    const durationMinutes = Math.round(
      (endedAt.getTime() - conversationSession.startedAt.getTime()) / 60000
    );

    const updatedSession = await db.conversationSession.update({
      where: { id },
      data: {
        endedAt,
        durationMinutes,
      },
    });

    return NextResponse.json({
      sessionId: updatedSession.id,
      endedAt: updatedSession.endedAt,
      durationMinutes: updatedSession.durationMinutes,
    });
  } catch (error) {
    console.error("Error ending conversation session:", error);
    return NextResponse.json(
      { error: "Failed to end conversation session" },
      { status: 500 }
    );
  }
}

// GET /api/conversation/session/[id] - Get specific conversation session
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const conversationSession = await db.conversationSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        topics: true,
        linguisticAnalysis: true,
        skillsAssessment: true,
        vocabularySuggestions: true,
      },
    });

    if (!conversationSession) {
      return NextResponse.json(
        { error: "Conversation session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(conversationSession);
  } catch (error) {
    console.error("Error fetching conversation session:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation session" },
      { status: 500 }
    );
  }
}
