'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { MessageList } from '@/components/messages/message-list'
import { MessageForm } from '@/components/messages/message-form'
import { ConversationSummary } from '@/components/messages/conversation-summary'
import { useThreads } from '@/lib/hooks/useMessageThread'
import { useUser } from '@clerk/nextjs'

export default function ThreadDetailPage() {
  const { user } = useUser()
  const params = useParams()
  const threadId = params.threadId as string
  const { threads, fetchThreads } = useThreads()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const thread = threads.find(t => t.id === threadId)

  useEffect(() => {
    if (threadId) {
      fetchThreads()
    }
  }, [threadId, fetchThreads])

  if (!user) {
    return (
      <div className="space-y-6">
        <Link href="/inbox">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
        </Link>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please sign in to view this conversation</p>
        </Card>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="space-y-6">
        <Link href="/inbox">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
        </Link>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Conversation not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/inbox">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{thread.guestName}</h1>
            {thread.guestEmail && (
              <p className="text-muted-foreground text-sm">{thread.guestEmail}</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setRefreshTrigger(prev => prev + 1)}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Thread Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold mt-1">
                <Badge>{thread.status}</Badge>
              </p>
            </div>
            {thread.property && (
              <div>
                <p className="text-sm text-muted-foreground">Property</p>
                <p className="text-lg font-semibold mt-1">
                  {thread.property.name}
                </p>
                {thread.property.address && (
                  <p className="text-xs text-muted-foreground">
                    {thread.property.address}
                  </p>
                )}
              </div>
            )}
            {thread.client && (
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="text-lg font-semibold mt-1">
                  {thread.client.name}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Messages</p>
              <p className="text-lg font-semibold mt-1">
                {thread._count?.messages || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Powered Conversation Summary */}
      <ConversationSummary threadId={threadId} />

      {/* Messages Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Conversation</h2>
        <MessageList threadId={threadId} refreshTrigger={refreshTrigger} />
      </div>

      {/* Message Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reply</h2>
        <MessageForm
          threadId={threadId}
          onMessageSent={() => setRefreshTrigger(prev => prev + 1)}
        />
      </div>
    </div>
  )
}
