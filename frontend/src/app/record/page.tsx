import { cookies } from "next/headers";
import { RecordChart } from "./record-chart";

export const dynamic = 'force-dynamic';

interface DateRecord {
  date: string;
  add: number;
  update: number;
  quiz?: number;
}

async function getDateStats(): Promise<DateRecord[]> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/date-stats`,
      {
        cache: "no-store",
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch date stats");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching date stats:", error);
    return [];
  }
}

export default async function RecordPage() {
  const dateStats = await getDateStats();

  const sortedDates = [...dateStats].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const totals = {
    add: sortedDates.reduce((acc, curr) => acc + curr.add, 0),
    update: sortedDates.reduce((acc, curr) => acc + curr.update, 0),
    quiz: sortedDates.reduce((acc, curr) => acc + (curr.quiz || 0), 0),
  };

  return (
    <div className="p-4 md:p-8">
      <RecordChart dateStats={sortedDates} totals={totals} />
    </div>
  );
}
