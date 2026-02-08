import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import type { ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const risk = searchParams.get('risk')

    const threads = await prisma.thread.findMany({
      where: {
        ...(status && { status }),
        ...(clientId && { clientId }),
      },
      include: {
        property: {
          include: {
            pmsAccount: true,
            client: true,
          },
        },
        messages: {
          orderBy: { receivedAt: 'desc' },
          take: 1,
          include: {
            analysis: true,
          },
        },
      },
      orderBy: {
        lastReceivedAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json<ApiResponse>({
      ok: true,
      results: threads,
    })
  } catch (error) {
    console.error('Inbox API error:', error)
    return NextResponse.json<ApiResponse>(
      { ok: false, error: 'Failed to fetch inbox' },
      { status: 500 }
    )
  }
}
