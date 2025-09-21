import { BASE_API_URL } from "@/constants";
import { Word } from "@/types/word";
import { cookies } from "next/headers";

// Server Component用の認証ヘッダー取得関数
async function getServerAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('auth_token')?.value;
  
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

// API-based functions for Rust backend
async function getWords(): Promise<Word[]> {
  try {
    // Server Component用の認証ヘッダーを取得
    const headers = await getServerAuthHeaders();

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

async function getWordById(id: string): Promise<Word | null> {
  try {
    // Server Component用の認証ヘッダーを取得
    const headers = await getServerAuthHeaders();

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

// Export the functions directly
export { getWords, getWordById };

export async function getSuggestions(initialWords: Word[]) {
  try {
    // Server Component用の認証ヘッダーを取得
    const headers = await getServerAuthHeaders();

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
      
      // Gracefully handle auth errors
      if (suggestions.status === 401) {
        console.warn("Authentication error - returning empty suggestions");
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
