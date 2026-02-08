import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs'
import type { ApiResponse } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { finalReply } = await request.json()

    if (!finalReply || finalReply.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: 'Reply text is required' },
        { status: 400 }
      )
    }

    const message = await prisma.message.findUnique({
      where: { id: params.messageId },
      include: {
        analysis: true,
        thread: true,
      },
    })

    if (!message) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    // Safe send enforcement
    if (message.thread.status === 'sent' || message.thread.status === 'declined') {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: 'Cannot send: thread status is ' + message.thread.status },
        { status: 400 }
      )
    }

    // Get user record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // TODO: Actually send to PMS here
    const providerResponse = {
      success: true,
      sentAt: new Date().toISOString(),
    }

    // Create send log
    const sendLog = await prisma.sendLog.create({
      data: {
        messageId: message.id,
        threadId: message.threadId,
        finalReply,
        channel: 'pms',
        providerResponse,
        sentByUserId: user.id,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'message_sent',
        entityType: 'message',
        entityId: message.id,
        meta: {
          threadId: message.threadId,
          finalReply: finalReply.substring(0, 100),
        },
      },
    })

    // Update thread status
    await prisma.thread.update({
      where: { id: message.threadId },
      data: { status: 'sent' },
    })

    return NextResponse.json<ApiResponse>({
      ok: true,
      results: sendLog,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json<ApiResponse>(
      { ok: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
