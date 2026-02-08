'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RefreshCw, Filter, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useThreads } from '@/lib/hooks/useMessageThread'
import { useUser } from '@clerk/nextjs'

export default function InboxPage() {
  const { user } = useUser()
  const { threads, loading, error, fetchThreads } = useThreads()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchThreads({ status: statusFilter || undefined })
  }, [statusFilter, fetchThreads])

  const filteredThreads = threads.filter(thread =>
    thread.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRiskBadge = (risk?: string) => {
    if (!risk) return null
    const variants: Record<string, any> = {
      low: { variant: 'secondary', className: 'bg-green-100 text-green-800' },
      medium: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      high: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
    }
    const style = variants[risk] || { variant: 'default' as const }
    return (
      <Badge variant={style.variant as any} className={style.className}>
        {risk}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'default',
      open: 'secondary',
      resolved: 'success',
      closed: 'outline',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please sign in to view your inbox</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground">
            {filteredThreads.length} conversation{filteredThreads.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchThreads()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button>New Message</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by guest name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      )}

      {loading ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">Loading conversations...</div>
        </Card>
      ) : filteredThreads.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredThreads.map((thread) => (
            <Link key={thread.id} href={`/inbox/${thread.id}`}>
              <Card className="transition-colors hover:bg-accent cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold truncate">{thread.guestName}</h3>
                        {getStatusBadge(thread.status)}
                      </div>
                      {thread.guestEmail && (
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.guestEmail}
                        </p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground flex-wrap">
                        {thread.property?.name && (
                          <>
                            <span>{thread.property.name}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{thread._count?.messages || 0} message(s)</span>
                        <span>•</span>
                        <span>
                          {new Date(thread.lastReceivedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
