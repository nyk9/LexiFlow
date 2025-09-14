import { getWords } from "@/lib/getWords";
import { QuizClient } from "./quiz-client";

export default async function QuizPage() {
  const words = await getWords();

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">単語が登録されていません</h2>
          <p>まず単語を追加してください。</p>
        </div>
      </div>
    );
  }

  return <QuizClient initialWords={words} />;
}
