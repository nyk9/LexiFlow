"use server";

import { BASE_API_URL } from "@/constants";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { WordFormData } from "@/types/forms";

// Server Action用の認証ヘッダー取得関数
async function getServerAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("lexiflow_access_token")?.value;

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

export async function createWord(formData: WordFormData) {
  try {
    // cookiesからアクセストークンを確認
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("lexiflow_access_token")?.value;

    console.log("Access token available:", !!accessToken);
    console.log(
      "Access token (first 20 chars):",
      accessToken?.substring(0, 20),
    );

    if (!accessToken) {
      throw new Error("Unauthorized: User not authenticated");
    }

    // Server Action用の認証ヘッダーを取得
    const headers = await getServerAuthHeaders();
    console.log("Auth headers prepared:", Object.keys(headers));

    // Rustバックエンドの期待するフィールド名に変換
    const wordData = {
      word: formData.word,
      meaning: formData.meaning,
      translation: formData.translation || null,
      part_of_speech: formData.partOfSpeech, // キャメルケース → スネークケース
      phonetic: formData.phonetic || null,
      example: formData.example || null,
      category: formData.category || null,
    };

    console.log("Sending word data:", wordData);

    const response = await fetch(`${BASE_API_URL}/words`, {
      method: "POST",
      headers,
      body: JSON.stringify(wordData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to create word - API response:",
        response.status,
        response.statusText,
        errorText,
      );
      console.error("Request URL:", `${BASE_API_URL}/words`);
      console.error("Request headers:", headers);
      console.error("Request body:", JSON.stringify(wordData));
      throw new Error(
        `Failed to create word: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    revalidateTag("words");
    revalidateTag("date-stats");
  } catch (error) {
    console.error("Failed to create word:", error);
    throw new Error("Failed to create word");
  }
}

export async function updateWord(id: string, formData: WordFormData) {
  try {
    // cookiesからアクセストークンを確認
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("lexiflow_access_token")?.value;

    if (!accessToken) {
      throw new Error("Unauthorized: User not authenticated");
    }

    // Server Action用の認証ヘッダーを取得
    const headers = await getServerAuthHeaders();

    // Rustバックエンドの期待するフィールド名に変換
    const wordData = {
      word: formData.word,
      meaning: formData.meaning,
      translation: formData.translation || null,
      part_of_speech: formData.partOfSpeech, // キャメルケース → スネークケース
      phonetic: formData.phonetic || null,
      example: formData.example || null,
      category: formData.category || null,
    };

    const response = await fetch(`${BASE_API_URL}/words/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(wordData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to update word - API response:",
        response.status,
        errorText,
      );
      throw new Error(`Failed to update word: ${response.status} ${errorText}`);
    }

    revalidateTag("words");
    revalidateTag("date-stats");
  } catch (error) {
    console.error("Failed to update word:", error);
    throw new Error("Failed to update word");
  }
}

export async function deleteWord(id: string) {
  try {
    // cookiesからアクセストークンを確認
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("lexiflow_access_token")?.value;

    if (!accessToken) {
      throw new Error("Unauthorized: User not authenticated");
    }

    // Server Action用の認証ヘッダーを取得
    const headers = await getServerAuthHeaders();

    const response = await fetch(`${BASE_API_URL}/words/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to delete word - API response:",
        response.status,
        errorText,
      );
      throw new Error(`Failed to delete word: ${response.status} ${errorText}`);
    }

    revalidateTag("words");
  } catch (error) {
    console.error("Failed to delete word:", error);
    throw new Error("Failed to delete word");
  }
}

// TODO: Rustバックエンドに移行後に再実装
export async function recordQuizActivity() {
  //   // Rustバックエンドのstatistics APIを使用予定
}
