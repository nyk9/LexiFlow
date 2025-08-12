import { getWords } from "@/lib/getWords";
import WordList from "@/features/reviewWords/components/word-list";

export default async function Home() {
  const words = await getWords();

  return (
    <div>
      <WordList initialWords={words} />
    </div>
  );
}
