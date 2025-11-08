"use client";

import { useState } from "react";
import { Word } from "@/types/word";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FlashCardProps {
  word: Word;
  onDelete: (id: string) => void;
  isPending: boolean;
}

export default function FlashCard({
  word,
  onDelete,
  isPending,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleFlip();
    }
  };

  // Get category color for visual distinction
  const getCategoryColor = (category: string | null) => {
    if (!category) return "border-gray-300";
    const colors = {
      greetings: "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
      farewells: "border-purple-400 bg-purple-50 dark:bg-purple-950/30",
      gratitude: "border-green-400 bg-green-50 dark:bg-green-950/30",
      politeness: "border-pink-400 bg-pink-50 dark:bg-pink-950/30",
      testing: "border-orange-400 bg-orange-50 dark:bg-orange-950/30",
    };
    return (
      colors[category as keyof typeof colors] ||
      "border-gray-400 bg-gray-50 dark:bg-gray-950/30"
    );
  };

  return (
    <div className="flashcard-container">
      <div
        className={`flashcard ${isFlipped ? "flipped" : ""} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Flashcard for word ${word.word}. ${isFlipped ? "Showing answer" : "Press space or enter to reveal answer"}`}
        aria-pressed={isFlipped}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
        }}
      >
        {/* Front Side */}
        <div
          className={`flashcard-face flashcard-front ${getCategoryColor(word.category)} cursor-pointer`}
          onClick={handleFlip}
        >
          <div className="h-full flex flex-col justify-center items-center p-6 rounded-xl border-2 shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
              {word.word}
            </h2>
            <div className="text-sm text-muted-foreground px-3 py-1 rounded-full border bg-background/80">
              {word.category || "未分類"}
            </div>
            <div className="absolute bottom-4 text-xs text-muted-foreground">
              クリックして答えを見る
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className={`flashcard-face flashcard-back ${getCategoryColor(word.category)}`}
        >
          <div className="h-full flex flex-col p-4 rounded-xl border-2 shadow-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              <div>
                <h3 className="font-semibold text-base mb-1 text-foreground">
                  意味
                </h3>
                <p className="text-sm leading-relaxed text-foreground break-words">
                  {word.meaning}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-1 text-foreground">
                  翻訳
                </h3>
                <p className="text-sm text-foreground">{word.translation}</p>
              </div>

              {word.example && (
                <div>
                  <h3 className="font-semibold text-base mb-1 text-foreground">
                    例文
                  </h3>
                  <p className="text-sm italic text-muted-foreground leading-relaxed break-words">
                    {word.example}
                  </p>
                </div>
              )}

              {word.partOfSpeech && (
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-foreground">
                    品詞
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(word.partOfSpeech)
                      ? word.partOfSpeech.join(", ")
                      : word.partOfSpeech}
                  </p>
                </div>
              )}
            </div>

            <div
              className="flex gap-2 mt-auto flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(word.id);
                }}
                disabled={isPending}
                className="flex-1"
              >
                {isPending ? "削除中..." : "削除"}
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link
                  href={`/update/${word.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  更新
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
