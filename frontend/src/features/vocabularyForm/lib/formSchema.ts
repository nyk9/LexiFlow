import { z } from "zod";
export const formSchema = z.object({
  word: z.string().min(2).max(100),
  meaning: z.string().min(2).max(1000),
  translation: z.string().min(2).max(100),
  exampleSentence: z.string().min(2).max(1000),
  category: z.string(),
  phonetic: z.string().min(1).max(50),
  partOfSpeech: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
});

export type FormSchema = z.infer<typeof formSchema>;
