"use server";

import { BASE_API_URL } from "@/constants";
import { db } from "./db";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "../../auth";
import { WordFormData } from "@/types/forms";

export async function createWord(formData: WordFormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized: User not authenticated");
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${BASE_API_URL}/words`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ ...formData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to create word - API response:",
        response.status,
        errorText,
      );
      throw new Error(`Failed to create word: ${response.status} ${errorText}`);
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
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized: User not authenticated");
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${BASE_API_URL}/words/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ ...formData }),
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
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized: User not authenticated");
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${BASE_API_URL}/words/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: cookieHeader,
      },
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

export async function recordQuizActivity() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized: User not authenticated");
    }

    const userId = session.user.id;
    const today = new Date().toISOString().slice(0, 10);
    
    await db.dateRecord.upsert({
      where: {
        date_userId: {
          date: today,
          userId: userId,
        },
      },
      create: {
        date: today,
        add: 0,
        update: 0,
        quiz: 1,
        userId: userId,
      },
      update: {
        quiz: {
          increment: 1,
        },
      },
    });

    revalidateTag("date-stats");
  } catch (error) {
    console.error("Failed to record quiz activity:", error);
    throw new Error("Failed to record quiz activity");
  }
}
