'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Trash2, BookOpen } from 'lucide-react'
import { wordsApi } from '@/lib/api'

export default function WordDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const wordId = params.id as string

  const { data: word, isLoading, error } = useQuery({
    queryKey: ['word', wordId],
    queryFn: () => wordsApi.getWord(wordId),
    enabled: !!wordId,
  })

  const deleteWordMutation = useMutation({
    mutationFn: () => wordsApi.deleteWord(wordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] })
      router.push('/words')
    },
    onError: (error) => {
      console.error('Failed to delete word:', error)
      setIsDeleting(false)
    },
  })

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this word? This action cannot be undone.')) {
      setIsDeleting(true)
      deleteWordMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !word) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Word Not Found</h1>
          <p className="text-gray-600 mb-4">The word you're looking for doesn't exist.</p>
          <Link href="/words">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Words
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/words">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Words
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {word.word}
            </h1>
            <div className="flex gap-2 items-center">
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                {word.part_of_speech}
              </span>
              <span className="text-sm bg-secondary/50 text-secondary-foreground px-2 py-1 rounded">
                {word.category}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/words/${word.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Definition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Meaning
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {word.meaning}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Translation
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {word.translation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {word.example && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Example
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    "{word.example}"
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Created
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(word.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Last Updated
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(word.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Learning Actions</CardTitle>
          <CardDescription>
            Track your progress with this word
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              Mark as Learned
            </Button>
            <Button variant="outline">
              Practice
            </Button>
            <Button variant="outline">
              Add to Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}