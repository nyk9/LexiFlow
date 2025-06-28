import { z } from 'zod'

export const createWordSchema = z.object({
  word: z.string().min(1, 'Word is required').max(255, 'Word must be less than 255 characters'),
  meaning: z.string().min(1, 'Meaning is required').max(1000, 'Meaning must be less than 1000 characters'),
  translation: z.string().min(1, 'Translation is required').max(1000, 'Translation must be less than 1000 characters'),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  part_of_speech: z.string().min(1, 'Part of speech is required').max(50, 'Part of speech must be less than 50 characters'),
  example: z.string().max(2000, 'Example must be less than 2000 characters').optional().or(z.literal('')),
})

export const updateWordSchema = z.object({
  word: z.string().max(255, 'Word must be less than 255 characters').optional(),
  meaning: z.string().max(1000, 'Meaning must be less than 1000 characters').optional(),
  translation: z.string().max(1000, 'Translation must be less than 1000 characters').optional(),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  part_of_speech: z.string().max(50, 'Part of speech must be less than 50 characters').optional(),
  example: z.string().max(2000, 'Example must be less than 2000 characters').optional().or(z.literal('')),
})

export const createActivitySchema = z.object({
  activity_type: z.string().min(1, 'Activity type is required').max(50, 'Activity type must be less than 50 characters'),
  count: z.number().min(1, 'Count must be at least 1'),
})

export type CreateWordData = z.infer<typeof createWordSchema>
export type UpdateWordData = z.infer<typeof updateWordSchema>
export type CreateActivityData = z.infer<typeof createActivitySchema>