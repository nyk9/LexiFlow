import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// POST /api/conversation/session - Start a new conversation session
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationSession = await db.conversationSession.create({
      data: {
        userId: session.user.id,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      sessionId: conversationSession.id,
      startedAt: conversationSession.startedAt,
    });
  } catch (error) {
    console.error("Error creating conversation session:", error);
    return NextResponse.json(
      { error: "Failed to create conversation session" },
      { status: 500 }
    );
  }
}

// GET /api/conversation/session - Get user's conversation sessions
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationSessions = await db.conversationSession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        startedAt: "desc",
      },
      take: 20, // Limit to recent 20 sessions
      include: {
        topics: true,
        linguisticAnalysis: true,
        skillsAssessment: true,
        vocabularySuggestions: {
          where: {
            status: "pending",
          },
        },
      },
    });

    return NextResponse.json(conversationSessions);
  } catch (error) {
    console.error("Error fetching conversation sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation sessions" },
      { status: 500 }
    );
  }
}
