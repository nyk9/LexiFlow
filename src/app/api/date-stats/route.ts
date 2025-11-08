import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dateRecords = await db.dateRecord.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "asc",
      },
    });

    const dateStats = dateRecords.map((record) => ({
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
