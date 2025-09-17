export interface Word {
  id: string; // Changed from number to string to match Prisma cuid()
  word: string;
  meaning: string;
  translation: string | null; // Made nullable to match schema
  category: string | null; // Made nullable to match schema
  partOfSpeech: string[]; // Changed from PartOfSpeech[] to string[] to match schema
  phonetic?: string | null; // Added to match schema
  example?: string | null; // Made nullable to match schema
  userId: string; // Added to match schema
  createdAt: Date; // Added to match schema
  updatedAt: Date; // Added to match schema
}

export enum PartOfSpeech {
  Noun = "Noun",
  Verb = "Verb",
  Adjective = "Adjective",
  Adverb = "Adverb",
  Pronoun = "Pronoun",
  AuxiliaryVerb = "AuxiliaryVerb",
  Article = "Article",
  Conjunction = "Conjunction",
  Preposition = "Preposition",
  Interjection = "Interjection",
  Other = "Other",
}
