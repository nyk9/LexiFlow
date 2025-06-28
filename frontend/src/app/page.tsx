import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, BarChart3, Plus } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to LexiFlow
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your modern vocabulary learning companion. Build, track, and master your vocabulary with powerful tools and insights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Manage Words
              </CardTitle>
              <CardDescription>
                Add, edit, and organize your vocabulary with categories and examples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/words">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  View Words
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Track Progress
              </CardTitle>
              <CardDescription>
                Monitor your learning progress with detailed statistics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button className="w-full" variant="outline">
                  View Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Add
              </CardTitle>
              <CardDescription>
                Quickly add new vocabulary words to your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/words/new">
                <Button className="w-full" variant="secondary">
                  Add Word
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}