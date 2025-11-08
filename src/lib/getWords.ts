import { BASE_API_URL } from "@/constants";
import { Word } from "@/types/word";
import { cookies } from "next/headers";
import { auth } from "../../auth";
import { db } from "@/lib/db";

// Direct DB connection functions for production environment
async function getWordsFromDB(): Promise<Word[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const words = await db.word.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return words;
  } catch (error) {
    console.error("Error fetching words from DB:", error);
    return [];
  }
}

async function getWordFromDB(id: string): Promise<Word | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const word = await db.word.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    return word;
  } catch (error) {
    console.error("Error fetching word from DB:", error);
    return null;
  }
}

// API-based functions for development environment
async function getWordsFromAPI(): Promise<Word[]> {
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
    console.error("Error fetching words from API:", error);
    return [];
  }
}

async function getWordFromAPI(id: string): Promise<Word | null> {
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
    console.error("Error fetching word from API:", error);
    return null;
  }
}

export async function getWords(): Promise<Word[]> {
  // Use direct DB connection in production to avoid Vercel auth issues
  // Use API calls in development for ISR benefits
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return getWordsFromDB();
  } else {
    return getWordsFromAPI();
  }
}

export async function getWordById(id: string): Promise<Word | null> {
  // Use direct DB connection in production to avoid Vercel auth issues
  // Use API calls in development for ISR benefits
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return getWordFromDB(id);
  } else {
    return getWordFromAPI(id);
  }
}

export async function getSuggestions(initialWords: Word[]) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add cookies for server-side authentication
    if (typeof window === "undefined") {
      const cookieStore = await cookies();
      headers["Cookie"] = cookieStore.toString();
    }

    const suggestions = await fetch(
      `${BASE_API_URL}/suggestion-word/gemini/`,
      {
        method: "POST",
        headers,
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
      
      // In production, gracefully handle auth errors
      if (suggestions.status === 401 && (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production')) {
        console.warn("Authentication error in production - returning empty suggestions");
        return [];
      }
      
      return [];
    }

    const words: Word[] = await suggestions.json();
    return words;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}
