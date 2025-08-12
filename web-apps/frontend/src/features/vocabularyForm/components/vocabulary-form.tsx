"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "../lib/formSchema";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { PartOfSpeech, Word } from "@/types/word";
import { Checkbox } from "@/components/ui/checkbox";
import { createWord, updateWord } from "@/lib/actions";
import { useRouter } from "next/navigation";

type VocabularyFormProps = {
  mode: "追加" | "更新";
  wordId?: number;
  initialData?: Word;
};

export default function AddVocabularyForm({
  mode = "追加",
  wordId,
  initialData,
}: VocabularyFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: initialData?.word || "",
      meaning: initialData?.meaning || "",
      translation: initialData?.translation || "",
      exampleSentence: initialData?.example || "",
      category: initialData?.category || "",
      partOfSpeech: initialData?.partOfSpeech || ([] as PartOfSpeech[]),
    },
  });

  const partOfSpeechOptions = Object.values(PartOfSpeech).map((pos) => ({
    value: pos,
    label: pos.replace(/([A-Z])/g, " $1").trim(), // CamelCase を空白で区切った表示に変換
  }));

  async function onSubmit(value: z.infer<typeof formSchema>) {
    const {
      word,
      meaning,
      translation,
      exampleSentence,
      category,
      partOfSpeech,
    } = value;

    startTransition(async () => {
      try {
        if (mode === "追加") {
          await createWord({
            word,
            meaning,
            translation,
            example: exampleSentence,
            category,
            partOfSpeech,
          });
          console.log("add_word が成功しました");
        } else if (mode === "更新" && wordId) {
          await updateWord(String(wordId), {
            word,
            meaning,
            translation,
            example: exampleSentence,
            category,
            partOfSpeech,
          });
        }

        // フォームの内容を""に初期化する
        form.reset({
          word: "",
          meaning: "",
          translation: "",
          exampleSentence: "",
          category: "",
          partOfSpeech: [] as PartOfSpeech[],
        });

        toast({
          title: `単語を${mode}しました`,
          description: `『${word}』を${mode}しました。`,
        });

        // Navigate back to home page after successful submission
        router.push("/");
      } catch (error) {
        console.error(`単語の${mode}に失敗しました:`, error);
        toast({
          title: "エラー",
          description: `単語の${mode}に失敗しました: ${error}`,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Card className="flex flex-col space-x-2 min-w-96">
      <CardHeader>
        <CardTitle>単語{mode}</CardTitle>
        <CardDescription>単語を{mode}します</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-1 px-2"
          >
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem className="space-y-6 p-1">
                  <FormLabel>単語</FormLabel>
                  <FormControl>
                    <Input placeholder="単語" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meaning"
              render={({ field }) => (
                <FormItem className="space-y-6 p-1">
                  <FormLabel>意味</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="意味"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="translation"
              render={({ field }) => (
                <FormItem className="space-y-6 p-1">
                  <FormLabel>翻訳</FormLabel>
                  <FormControl>
                    <Input placeholder="翻訳" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exampleSentence"
              render={({ field }) => (
                <FormItem className="space-y-6 p-1">
                  <FormLabel>例文</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="例文"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partOfSpeech"
              render={({ field }) => (
                <FormItem className="space-y-6 p-1">
                  <FormLabel>品詞</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      {partOfSpeechOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={field.value.includes(option.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, option.value]);
                              } else {
                                field.onChange(
                                  field.value.filter(
                                    (value) => value !== option.value,
                                  ),
                                );
                              }
                            }}
                          />
                          <label className="text-sm">{option.label}</label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-6 p-1">
                  <FormLabel>カテゴリー</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="カテゴリー" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="space-y-6 m-1"
              disabled={isPending}
            >
              {isPending ? "送信中..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
