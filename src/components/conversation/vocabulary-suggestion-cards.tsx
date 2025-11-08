"use client";

import { useState } from "react";
import { SwipeableCard } from "./swipeable-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface VocabularySuggestion {
  word: string;
  partOfSpeech: string;
  phonetic: string;
  meaning: string;
  translation: string;
  example: string;
  category: string;
  conversationContext: string;
  reason: string;
}

interface VocabularySuggestionCardsProps {
  suggestions: VocabularySuggestion[];
  sessionId: string;
  onComplete?: () => void;
}

export function VocabularySuggestionCards({
  suggestions,
  sessionId,
  onComplete,
}: VocabularySuggestionCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [acceptedWords, setAcceptedWords] = useState<string[]>([]);
  const [rejectedWords, setRejectedWords] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const currentCard = suggestions[currentIndex];
  const isComplete = currentIndex >= suggestions.length;

  // Handle swipe left (reject)
  const handleSwipeLeft = () => {
    if (currentCard) {
      setRejectedWords((prev) => [...prev, currentCard.word]);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Handle swipe right (accept)
  const handleSwipeRight = async () => {
    if (!currentCard) return;

    setAcceptedWords((prev) => [...prev, currentCard.word]);
    setCurrentIndex((prev) => prev + 1);

    // Add to vocabulary collection
    try {
      setIsAdding(true);

      const response = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: currentCard.word,
          meaning: currentCard.meaning,
          translation: currentCard.translation,
          partOfSpeech: [currentCard.partOfSpeech],
          phonetic: currentCard.phonetic,
          example: currentCard.example,
          category: currentCard.category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add word");
      }

      // Update vocabulary suggestion status
      await fetch(`/api/conversation/suggestions/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: currentCard.word,
          status: "accepted",
        }),
      });

      toast({
        title: "単語を追加しました！",
        description: `「${currentCard.word}」を単語帳に追加しました`,
      });
    } catch (error) {
      console.error("Error adding word:", error);
      toast({
        title: "エラー",
        description: "単語の追加に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Complete review
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push("/");
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">レビュー完了！</h2>
            <p className="text-muted-foreground mb-6">
              すべての単語推薦をレビューしました
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle2 className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {acceptedWords.length}
              </p>
              <p className="text-sm text-muted-foreground">追加した単語</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <XCircle className="w-8 h-8 mx-auto text-gray-500 mb-2" />
              <p className="text-2xl font-bold text-gray-600">
                {rejectedWords.length}
              </p>
              <p className="text-sm text-muted-foreground">スキップした単語</p>
            </div>
          </div>

          {acceptedWords.length > 0 && (
            <div className="mb-6 text-left">
              <h3 className="font-semibold mb-2">追加した単語:</h3>
              <div className="flex flex-wrap gap-2">
                {acceptedWords.map((word, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={handleComplete} size="lg" className="w-full">
              ホームに戻る
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/conversation")}
              size="lg"
              className="w-full"
            >
              新しい会話を始める
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Header */}
      <div className="w-full max-w-md mb-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2" />
            戻る
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {suggestions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${((currentIndex + 1) / suggestions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full max-w-md mb-4">
        <p className="text-center text-sm text-muted-foreground">
          👈 左にスワイプでスキップ / 右にスワイプで追加 👉
        </p>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-md h-[600px]">
        {suggestions.slice(currentIndex, currentIndex + 3).map((suggestion, idx) => {
          const isActive = idx === 0;
          const offset = idx * 4;

          return (
            <div
              key={currentIndex + idx}
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${offset}px) scale(${1 - idx * 0.02})`,
                zIndex: 10 - idx,
              }}
            >
              <SwipeableCard
                suggestion={suggestion}
                onSwipeLeft={isActive ? handleSwipeLeft : () => {}}
                onSwipeRight={isActive ? handleSwipeRight : () => {}}
                isActive={isActive && !isAdding}
              />
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="w-full max-w-md mt-4 flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium">{acceptedWords.length} 追加</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium">{rejectedWords.length} スキップ</span>
        </div>
      </div>
    </div>
  );
}
