import { BASE_API_URL } from "@/constants";
import { Word } from "@/types/word";
import { cookies } from "next/headers";

export async function getWords(): Promise<Word[]> {
  try {
    const headers: Record<string, string> = {};

    // Add cookies for server-side authentication
    if (typeof window === "undefined") {
      const cookieStore = await cookies();
      headers["Cookie"] = cookieStore.toString();
    }

    const response = await fetch(`${BASE_API_URL}/words`, {
      // ISR configuration: revalidate every 60 seconds
      next: { 
        revalidate: 60,
        tags: ["words"] 
      },
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
    const headers: Record<string, string> = {};

    // Add cookies for server-side authentication
    if (typeof window === "undefined") {
      const cookieStore = await cookies();
      headers["Cookie"] = cookieStore.toString();
    }

    const response = await fetch(`${BASE_API_URL}/words/${id}`, {
      next: { 
        revalidate: 300, // 5 minutes for individual words
        tags: ["words", `word-${id}`] 
      },
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
  const suggestions = await fetch(
    `${BASE_API_URL}/suggestion-word/gemini/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 3600, // 1 hour for suggestions
      },
      body: JSON.stringify({ vocabulary: initialWords }),
    },
  );

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
