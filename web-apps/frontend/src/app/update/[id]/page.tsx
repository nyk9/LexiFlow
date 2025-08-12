import { getWordById } from "@/lib/getWords";
import AddVocabularyForm from "@/features/vocabulary/components/vocabulary-form";
import { redirect } from "next/navigation";

export default async function UpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const word = await getWordById(id);

  if (!word) {
    redirect("/");
  }
  if (!id) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10 min-w-96 min-h-96">
      <AddVocabularyForm mode="更新" wordId={Number(id)} initialData={word} />
    </div>
  );
}
