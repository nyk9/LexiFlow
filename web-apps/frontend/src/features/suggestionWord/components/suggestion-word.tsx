"use client";

import { useState } from "react";
import { Word } from "@/types/word";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SuggestionWordProps {
  initialWords: Word[];
}

export function SuggestionWord({ initialWords }: SuggestionWordProps) {
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGetSuggestions = async () => {
    setLoading(true);
    const recent_five_words = initialWords.slice(-5);
    try {
      const response = await fetch("/api/suggestion-word/gemini/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vocabulary: recent_five_words }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      let data = await response.json();
      console.log("Raw API response:", data);
      
      // Parse the JSON string from the text field
      if (data.text) {
        try {
          // Remove any markdown formatting and parse the JSON
          const cleanText = data.text.replace(/```json\n?|\n?```/g, '').trim();
          const parsedData = JSON.parse(cleanText);
          setRecommendations(parsedData);
          console.log("Parsed recommendations:", parsedData);
        } catch (parseError) {
          console.error("Failed to parse JSON from text:", parseError);
          setError("APIレスポンスの解析に失敗しました");
          return;
        }
      } else {
        setRecommendations(data);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to get suggestions:", err);
      setError(`推薦の取得に失敗しました: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">単語推薦APIテスト</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>現在の単語リスト ({initialWords.length}単語)</CardTitle>
          <CardDescription>サーバーから取得した単語リスト</CardDescription>
        </CardHeader>
        <CardContent>
          {initialWords.length > 0 ? (
            <ul className="space-y-2">
              {initialWords.slice(0, 5).map((word, index) => (
                <li key={index} className="p-2 rounded">
                  <strong>{word.word}</strong> - {word.translation} (
                  {word.category || "未分類"})
                </li>
              ))}
              {initialWords.length > 5 && (
                <li className="">...その他 {initialWords.length - 5} 単語</li>
              )}
            </ul>
          ) : (
            <p>単語が見つかりません</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleGetSuggestions} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                推薦取得中...
              </>
            ) : (
              "単語推薦を取得"
            )}
          </Button>
        </CardFooter>
      </Card>

      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>おすすめの単語</CardTitle>
            <CardDescription>AIが推薦する次に学ぶべき単語</CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations.recommendations ? (
              <div className="space-y-4">
                {recommendations.recommendations.map((word: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-blue-600">
                        {word.word}
                      </h3>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                        {word.category}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm">
                      <p><strong>品詞:</strong> {word.part_of_speech}</p>
                      <p><strong>発音:</strong> {word.phonetic}</p>
                    </div>
                    
                    <p className="text-gray-700 mb-2">
                      <strong>意味:</strong> {word.meaning}
                    </p>
                    
                    <p className="text-gray-700 mb-2">
                      <strong>日本語:</strong> {word.translation}
                    </p>
                    
                    <p className="text-gray-600 italic">
                      <strong>例文:</strong> {word.example}
                    </p>
                  </div>
                ))}
                
                {recommendations.learningAdvice && (
                  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
                    <h4 className="font-semibold text-blue-800 mb-2">学習アドバイス</h4>
                    <p className="text-blue-700">{recommendations.learningAdvice}</p>
                  </div>
                )}
              </div>
            ) : (
              <pre className="bg-gray-100 text-black p-4 rounded overflow-auto">
                {JSON.stringify(recommendations, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <Link href="/">
          <Button variant="outline">ホームに戻る</Button>
        </Link>
      </div>
    </div>
  );
}
