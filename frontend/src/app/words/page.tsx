'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Filter, BookOpen } from 'lucide-react'
import { wordsApi } from '@/lib/api'
import type { Word } from '@/types'

export default function WordsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const { data: wordsData, isLoading, error } = useQuery({
    queryKey: ['words', { page, search, category }],
    queryFn: () => wordsApi.getWords({ 
      page, 
      per_page: 12,
      search: search || undefined,
      category: category || undefined 
    }),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Words</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vocabulary Words
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your vocabulary collection
          </p>
        </div>
        <Link href="/words/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Word
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search words, meanings, or translations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {wordsData?.words && wordsData.words.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {wordsData.words.map((word: Word) => (
              <Card key={word.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{word.word}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {word.part_of_speech}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {word.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Meaning:</strong> {word.meaning}
                    </p>
                    <p className="text-sm">
                      <strong>Translation:</strong> {word.translation}
                    </p>
                    {word.example && (
                      <p className="text-sm italic text-gray-600">
                        "{word.example}"
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-500">
                      {new Date(word.created_at).toLocaleDateString()}
                    </span>
                    <Link href={`/words/${word.id}`}>
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {Math.ceil((wordsData.total || 0) / 12)}
            </span>
            <Button 
              variant="outline"
              disabled={page >= Math.ceil((wordsData.total || 0) / 12)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No words found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Start building your vocabulary by adding your first word.
          </p>
          <Link href="/words/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Word
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}