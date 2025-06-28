'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, BookOpen, Calendar, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { statisticsApi, wordsApi } from '@/lib/api'

export default function DashboardPage() {
  const queryClient = useQueryClient()

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: () => statisticsApi.getStatistics(),
  })

  const { data: recentWords } = useQuery({
    queryKey: ['words', { page: 1, per_page: 5 }],
    queryFn: () => wordsApi.getWords({ page: 1, per_page: 5 }),
  })

  const recordActivityMutation = useMutation({
    mutationFn: (activity: { activity_type: string; count: number }) =>
      statisticsApi.recordActivity(activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
    },
  })

  const handleQuickActivity = (activityType: string) => {
    recordActivityMutation.mutate({
      activity_type: activityType,
      count: 1,
    })
  }

  if (statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Learning Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Track your vocabulary learning progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total_words || 0}</div>
            <p className="text-xs text-muted-foreground">
              Words in your vocabulary
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.learning_streak || 0}</div>
            <p className="text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(statistics?.words_by_category || {}).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Word categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.daily_activities?.slice(0, 7).reduce((sum, activity) => sum + activity.count, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Learning activities
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Words by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Words by Category</CardTitle>
            <CardDescription>
              Distribution of your vocabulary across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statistics?.words_by_category && Object.keys(statistics.words_by_category).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(statistics.words_by_category)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-muted-foreground">{count} words</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No words yet</p>
                <Link href="/words/new" className="mt-2 inline-block">
                  <Button size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Words
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Words */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Words</CardTitle>
            <CardDescription>
              Your latest vocabulary additions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentWords?.words && recentWords.words.length > 0 ? (
              <div className="space-y-3">
                {recentWords.words.slice(0, 5).map((word) => (
                  <div key={word.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{word.word}</p>
                      <p className="text-xs text-muted-foreground">{word.category}</p>
                    </div>
                    <Link href={`/words/${word.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No words yet</p>
                <Link href="/words/new" className="mt-2 inline-block">
                  <Button size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Your First Word
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common learning activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/words/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Word
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => handleQuickActivity('review')}
              disabled={recordActivityMutation.isPending}
            >
              Quick Review Session
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickActivity('practice')}
              disabled={recordActivityMutation.isPending}
            >
              Practice Words
            </Button>
            <Link href="/words">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse All Words
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}