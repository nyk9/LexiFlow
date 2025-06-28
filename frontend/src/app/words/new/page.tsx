'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { wordsApi } from '@/lib/api'
import type { CreateWordRequest } from '@/types'

const wordSchema = z.object({
  word: z.string().min(1, 'Word is required').max(255, 'Word must be less than 255 characters'),
  meaning: z.string().min(1, 'Meaning is required').max(1000, 'Meaning must be less than 1000 characters'),
  translation: z.string().min(1, 'Translation is required').max(1000, 'Translation must be less than 1000 characters'),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  part_of_speech: z.string().min(1, 'Part of speech is required').max(50, 'Part of speech must be less than 50 characters'),
  example: z.string().max(2000, 'Example must be less than 2000 characters').optional(),
})

type WordFormData = z.infer<typeof wordSchema>

export default function NewWordPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WordFormData>({
    resolver: zodResolver(wordSchema),
  })

  const createWordMutation = useMutation({
    mutationFn: (data: CreateWordRequest) => wordsApi.createWord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] })
      router.push('/words')
    },
    onError: (error) => {
      console.error('Failed to create word:', error)
      setIsSubmitting(false)
    },
  })

  const onSubmit = async (data: WordFormData) => {
    setIsSubmitting(true)
    createWordMutation.mutate({
      ...data,
      example: data.example || undefined,
    })
  }

  const partOfSpeechOptions = [
    'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 
    'conjunction', 'interjection', 'article', 'determiner'
  ]

  const categoryOptions = [
    'General', 'Business', 'Technology', 'Academic', 'Travel', 'Daily Life'
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/words">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Words
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Add New Word
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Expand your vocabulary by adding a new word
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Word Information</CardTitle>
          <CardDescription>
            Fill in the details for your new vocabulary word
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="word">Word *</Label>
                <Input
                  id="word"
                  {...register('word')}
                  placeholder="Enter the word"
                />
                {errors.word && (
                  <p className="text-sm text-red-600">{errors.word.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="part_of_speech">Part of Speech *</Label>
                <select
                  id="part_of_speech"
                  {...register('part_of_speech')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select part of speech</option>
                  {partOfSpeechOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.part_of_speech && (
                  <p className="text-sm text-red-600">{errors.part_of_speech.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                {...register('category')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="meaning">Meaning *</Label>
              <Textarea
                id="meaning"
                {...register('meaning')}
                placeholder="Enter the meaning or definition"
                rows={3}
              />
              {errors.meaning && (
                <p className="text-sm text-red-600">{errors.meaning.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="translation">Translation *</Label>
              <Textarea
                id="translation"
                {...register('translation')}
                placeholder="Enter the translation"
                rows={3}
              />
              {errors.translation && (
                <p className="text-sm text-red-600">{errors.translation.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="example">Example (Optional)</Label>
              <Textarea
                id="example"
                {...register('example')}
                placeholder="Enter an example sentence"
                rows={3}
              />
              {errors.example && (
                <p className="text-sm text-red-600">{errors.example.message}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Word
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}