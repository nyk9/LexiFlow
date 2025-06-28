export interface Word {
  id: string
  word: string
  meaning: string
  translation: string
  category: string
  part_of_speech: string
  example?: string
  created_at: string
  updated_at: string
}

export interface CreateWordRequest {
  word: string
  meaning: string
  translation: string
  category: string
  part_of_speech: string
  example?: string
}

export interface UpdateWordRequest {
  word?: string
  meaning?: string
  translation?: string
  category?: string
  part_of_speech?: string
  example?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface LearningActivity {
  id: string
  activity_type: string
  date: string
  count: number
  created_at: string
}

export interface Statistics {
  total_words: number
  words_by_category: Record<string, number>
  daily_activities: LearningActivity[]
  learning_streak: number
}

export interface WordsResponse {
  words: Word[]
  total: number
  page: number
  per_page: number
}

export interface ApiError {
  message: string
  details?: string
}