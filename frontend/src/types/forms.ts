// Unified form data types for word management

export interface WordFormData {
  word: string;
  meaning: string;
  translation: string;
  example?: string;
  category: string;
  phonetic?: string; // Optional to maintain backward compatibility
  partOfSpeech: string[];
}

export interface CreateWordFormData extends WordFormData {
  // Add any create-specific fields if needed
}

export interface UpdateWordFormData extends WordFormData {
  // Add any update-specific fields if needed
}