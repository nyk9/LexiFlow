"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { VocabularySuggestionCards } from "@/components/conversation/vocabulary-suggestion-cards";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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

interface AnalysisData {
  suggestions: VocabularySuggestion[];
  topics: string[];
  skillsAssessment: {
    grammarAccuracy: number;
    vocabularyAppropriateness: number;
    sentenceComplexity: number;
    flowSmoothness: number;
    naturalPhraseUsage: number;
  };
  linguisticAnalysis: {
    avgSentenceLength: number;
    vocabularyLevel: string;
    grammarComplexity: string;
  };
  overallFeedback: string;
}

export default function ConversationSuggestionsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get analysis data from sessionStorage (passed from conversation page)
    const storedData = sessionStorage.getItem(`analysis_${sessionId}`);

    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setAnalysisData(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to parse stored analysis data:", err);
        setError("分析データの読み込みに失敗しました");
        setIsLoading(false);
      }
    } else {
      setError("分析データが見つかりません");
      setIsLoading(false);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="p-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">単語推薦を読み込んでいます...</p>
        </Card>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">エラー</h2>
          <p className="text-muted-foreground mb-4">
            {error || "分析データが見つかりません"}
          </p>
          <a href="/conversation" className="text-primary hover:underline">
            会話ページに戻る
          </a>
        </Card>
      </div>
    );
  }

  if (analysisData.suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">素晴らしい会話でした！</h2>
          <p className="text-muted-foreground mb-4">
            今回は新しい単語の推薦はありません。
            <br />
            引き続き会話練習を続けましょう！
          </p>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">全体フィードバック:</p>
            <p className="text-sm bg-muted p-3 rounded-lg">
              {analysisData.overallFeedback}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <a
              href="/conversation"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              新しい会話を始める
            </a>
            <a
              href="/"
              className="px-4 py-2 border rounded-lg hover:bg-muted"
            >
              ホームに戻る
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <VocabularySuggestionCards
      suggestions={analysisData.suggestions}
      sessionId={sessionId}
    />
  );
}
