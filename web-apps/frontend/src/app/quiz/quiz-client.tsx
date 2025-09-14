"use client";

import { useState, useTransition } from "react";
import { Word } from "@/types/word";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { recordQuizActivity } from "@/lib/actions";

interface GradingResponse {
  score: number;
  feedback: string;
}

interface QuizClientProps {
  initialWords: Word[];
}

export function QuizClient({ initialWords }: QuizClientProps) {
  const [currentWord, setCurrentWord] = useState<Word>(
    initialWords[Math.floor(Math.random() * initialWords.length)],
  );
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [gradingResult, setGradingResult] = useState<GradingResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGradeAnswer = async () => {
    if (!currentWord || !userAnswer.trim()) {
      toast({
        title: "エラー",
        description: "解答を入力してください。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGradingResult(null);

    try {
      // Grade the answer
      const gradeResponse = await fetch("/api/grade-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: currentWord.word,
          meaning: currentWord.meaning,
          userAnswer: userAnswer,
        }),
      });

      if (!gradeResponse.ok) {
        throw new Error(`API responded with status: ${gradeResponse.status}`);
      }

      const result = (await gradeResponse.json()) as GradingResponse;
      setGradingResult(result);

      // Record quiz activity using Server Action
      startTransition(async () => {
        await recordQuizActivity();
      });
    } catch (err) {
      console.error("Failed to grade answer:", err);
      setError(`採点中にエラーが発生しました: ${err}`);
      toast({
        title: "採点エラー",
        description: `採点中にエラーが発生しました: ${err}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setUserAnswer("");
    setGradingResult(null);
    const randomIndex = Math.floor(Math.random() * initialWords.length);
    setCurrentWord(initialWords[randomIndex]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            クイズ
          </CardTitle>
          <CardDescription className="text-center">
            提示された単語の意味や使い方を記述してください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold">{currentWord.word}</h3>
            <p className="text-sm text-muted-foreground">
              ({currentWord.partOfSpeech.join(", ")})
            </p>
          </div>

          <Textarea
            placeholder="ここに解答を入力してください..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={5}
            disabled={isLoading || gradingResult !== null}
          />

          {isLoading && (
            <div className="flex flex-col items-center space-y-2">
              <Progress value={null} className="w-full" />
              <p className="text-sm text-muted-foreground">AIが採点中...</p>
            </div>
          )}

          {gradingResult && (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">
                採点結果: {gradingResult.score}点
              </h4>
              <p className="text-sm text-muted-foreground">
                {gradingResult.feedback}
              </p>
              <div className="mt-4 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h5 className="text-md font-semibold">正解例:</h5>
                <p className="text-sm">意味: {currentWord.meaning}</p>
                <p className="text-sm">翻訳: {currentWord.translation}</p>
                {currentWord.example && (
                  <p className="text-sm">例文: {currentWord.example}</p>
                )}
              </div>
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {gradingResult ? (
            <Button onClick={handleNextQuestion}>次の問題へ</Button>
          ) : (
            <Button
              onClick={handleGradeAnswer}
              disabled={isLoading || isPending}
            >
              採点する
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
