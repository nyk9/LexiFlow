"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface SwipeableCardProps {
  suggestion: VocabularySuggestion;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isActive: boolean;
}

export function SwipeableCard({
  suggestion,
  onSwipeLeft,
  onSwipeRight,
  isActive,
}: SwipeableCardProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 100;

  // Handle drag start
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!isActive) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  // Handle drag move
  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isActive) return;

    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;

    setDragOffset({ x: deltaX, y: deltaY });
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging || !isActive) return;

    setIsDragging(false);

    if (dragOffset.x > SWIPE_THRESHOLD) {
      // Swipe right - Accept
      onSwipeRight();
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
      // Swipe left - Reject
      onSwipeLeft();
    } else {
      // Return to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Reset position when card becomes inactive
  useEffect(() => {
    if (!isActive) {
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isActive]);

  // Calculate rotation based on drag
  const rotation = dragOffset.x * 0.1;
  const opacity = isActive ? 1 : 0.3;

  // Speak the word
  const speakWord = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(suggestion.word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`absolute w-full max-w-md transition-all ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? "none" : "all 0.3s ease-out",
        pointerEvents: isActive ? "auto" : "none",
        zIndex: isActive ? 10 : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Card className="p-6 shadow-lg border-2">
        {/* Swipe indicators */}
        <div className="absolute top-4 left-4">
          <div
            className={`px-4 py-2 rounded-lg border-2 border-red-500 text-red-500 font-bold rotate-[-15deg] transition-opacity ${
              dragOffset.x < -30 ? "opacity-100" : "opacity-0"
            }`}
          >
            <ThumbsDown className="inline mr-2" />
            SKIP
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <div
            className={`px-4 py-2 rounded-lg border-2 border-green-500 text-green-500 font-bold rotate-[15deg] transition-opacity ${
              dragOffset.x > 30 ? "opacity-100" : "opacity-0"
            }`}
          >
            <ThumbsUp className="inline mr-2" />
            ADD
          </div>
        </div>

        {/* Card content */}
        <div className="mt-12">
          {/* Word and pronunciation */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold">{suggestion.word}</h2>
              <p className="text-muted-foreground">{suggestion.phonetic}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                speakWord();
              }}
            >
              <Volume2 />
            </Button>
          </div>

          {/* Part of speech and category */}
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {suggestion.partOfSpeech}
            </span>
            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
              {suggestion.category}
            </span>
          </div>

          {/* Meaning */}
          <div className="mb-4">
            <h3 className="font-semibold mb-1">Meaning:</h3>
            <p className="text-muted-foreground">{suggestion.meaning}</p>
          </div>

          {/* Translation */}
          <div className="mb-4">
            <h3 className="font-semibold mb-1">日本語:</h3>
            <p className="text-muted-foreground">{suggestion.translation}</p>
          </div>

          {/* Example */}
          <div className="mb-4">
            <h3 className="font-semibold mb-1">Example:</h3>
            <p className="italic text-muted-foreground">"{suggestion.example}"</p>
          </div>

          {/* Context */}
          <div className="mb-4">
            <h3 className="font-semibold mb-1">会話での使用例:</h3>
            <p className="text-sm text-muted-foreground">
              {suggestion.conversationContext}
            </p>
          </div>

          {/* Reason */}
          <div className="bg-muted p-3 rounded-lg">
            <h3 className="font-semibold mb-1 text-sm">なぜこの単語?</h3>
            <p className="text-sm">{suggestion.reason}</p>
          </div>
        </div>

        {/* Action buttons (mobile fallback) */}
        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onSwipeLeft();
            }}
          >
            <ThumbsDown className="mr-2" />
            スキップ
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-green-500 hover:bg-green-600"
            onClick={(e) => {
              e.stopPropagation();
              onSwipeRight();
            }}
          >
            <ThumbsUp className="mr-2" />
            追加
          </Button>
        </div>
      </Card>
    </div>
  );
}
