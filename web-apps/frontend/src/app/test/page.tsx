import WordList from "@/features/suggestionWord/components/word-list";
import { Suspense } from "react";

export default function ApiTest() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <WordList />
      </Suspense>
    </div>
  );
}
