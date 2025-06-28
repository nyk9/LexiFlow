import axios from 'axios'
import type { 
  Word, 
  CreateWordRequest, 
  UpdateWordRequest, 
  WordsResponse, 
  Category, 
  Statistics,
  LearningActivity 
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Words API
export const wordsApi = {
  getWords: async (params?: {
    page?: number
    per_page?: number
    search?: string
    category?: string
  }): Promise<WordsResponse> => {
    const response = await api.get('/words', { params })
    return response.data
  },

  getWord: async (id: string): Promise<Word> => {
    const response = await api.get(`/words/${id}`)
    return response.data
  },

  createWord: async (word: CreateWordRequest): Promise<Word> => {
    const response = await api.post('/words', word)
    return response.data
  },

  updateWord: async (id: string, word: UpdateWordRequest): Promise<Word> => {
    const response = await api.put(`/words/${id}`, word)
    return response.data
  },

  deleteWord: async (id: string): Promise<void> => {
    await api.delete(`/words/${id}`)
  },
}

// Categories API
export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories')
    return response.data
  },
}

// Statistics API
export const statisticsApi = {
  getStatistics: async (): Promise<Statistics> => {
    const response = await api.get('/statistics')
    return response.data
  },

  recordActivity: async (activity: {
    activity_type: string
    count: number
  }): Promise<LearningActivity> => {
    const response = await api.post('/statistics', activity)
    return response.data
  },
}

export default api