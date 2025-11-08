import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWords } from "@/lib/getWords";
import { SuggestionWord } from "./suggestion-word";
import { Suspense } from "react";

export default async function WordList() {
  const initialWords = await getWords();

  return (
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
        <CardFooter>
          <Suspense fallback={<div>Loading...</div>}>
            <SuggestionWord initialWords={initialWords} />
          </Suspense>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
