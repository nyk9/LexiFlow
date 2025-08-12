import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// For demo purposes, using a hardcoded user ID
const DEMO_USER_ID = "demo-user-001";

export async function GET() {
  try {
    const dateRecords = await db.dateRecord.findMany({
      where: {
        userId: DEMO_USER_ID,
      },
      orderBy: {
        date: "asc",
      },
    });

    const dateStats = dateRecords.map(record => ({
      date: record.date,
      add: record.add,
      update: record.update,
      quiz: record.quiz,
    }));

    return NextResponse.json(dateStats);
  } catch (error) {
    console.error("Error fetching date stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch date stats" },
      { status: 500 },
    );
  }
}