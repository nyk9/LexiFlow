"use client";

import { useState, useTransition } from "react";
import { Word } from "@/types/word";
import Link from "next/link";
import { deleteWord } from "@/lib/actions";
import FlashCard from "./flash-card";

interface WordListProps {
  initialWords: Word[];
}

export default function WordList({ initialWords }: WordListProps) {
  const [words, setWords] = useState<Word[]>(initialWords);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteWord = async (id: string) => {
    // Optimistic update - remove word immediately from UI
    const originalWords = words;
    setWords(words.filter((word) => word.id !== id));

    try {
      startTransition(async () => {
        await deleteWord(id);
      });
    } catch (error) {
      // Rollback optimistic update on error
      setWords(originalWords);
      console.error("Failed to delete word:", error);
      setError(`Error: ${error}`);
    }
  };

  return (
    <div className="p-4 w-full mx-auto max-w-7xl">
      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          単語帳 ({words.length})
        </h2>
        <p className="text-muted-foreground">
          カードをクリックして答えを確認しましょう
        </p>
      </div>

      {words.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {words.map((word) => (
            <FlashCard
              key={word.id}
              word={word}
              onDelete={handleDeleteWord}
              isPending={isPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-6">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            単語がありません
          </h3>
          <p className="text-muted-foreground mb-4">
            最初の単語を追加して学習を始めましょう！
          </p>
          <Link
            href="/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            単語を追加する
          </Link>
        </div>
      )}
    </div>
  );
}
