import { Word } from "@/types/word";
import { cookies } from "next/headers";

export async function getWords(): Promise<Word[]> {
  try {
    // Use absolute URL for server-side rendering, relative for client-side
    const baseUrl =
      typeof window === "undefined"
        ? "http://localhost:3000" // Server-side: absolute URL
        : ""; // Client-side: relative URL

    const headers: Record<string, string> = {};

    // Add cookies for server-side authentication
    if (typeof window === "undefined") {
      const cookieStore = await cookies();
      headers["Cookie"] = cookieStore.toString();
    }

    const response = await fetch(`${baseUrl}/api/words`, {
      // Disable cache during development, enable revalidation tags for production
      cache: "no-store",
      next: { tags: ["words"] },
      headers,
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch words:",
        response.status,
        response.statusText,
      );
      return [];
    }

    const words: Word[] = await response.json();
    return words;
  } catch (error) {
    console.error("Error fetching words:", error);
    return [];
  }
}

export async function getWordById(id: string): Promise<Word | null> {
  try {
    const baseUrl =
      typeof window === "undefined" ? "http://localhost:3000" : "";

    const headers: Record<string, string> = {};

    // Add cookies for server-side authentication
    if (typeof window === "undefined") {
      const cookieStore = await cookies();
      headers["Cookie"] = cookieStore.toString();
    }

    const response = await fetch(`${baseUrl}/api/words/${id}`, {
      headers,
    });
    if (!response.ok) {
      return null;
    }
    const word: Word = await response.json();
    return word;
  } catch (error) {
    console.error("Error fetching word by id:", error);
    return null;
  }
}

export async function getSuggestions(initialWords: Word[]) {
  const baseUrl = typeof window === "undefined" ? "http://localhost:3000" : "";
  const suggestions = await fetch(`${baseUrl}/api/suggestion-word/gemini/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // next: {
    //   revalidate: 60 * 60 * 24, // 24 hours
    // },
    body: JSON.stringify({ vocabulary: initialWords }),
  });

  if (!suggestions.ok) {
    console.error(
      "Failed to fetch suggestions:",
      suggestions.status,
      suggestions.statusText,
    );
    return [];
  }

  const words: Word[] = await suggestions.json();
  return words;
}
