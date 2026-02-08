import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/send-logs
 * Fetch send logs with optional filtering
 * Query params:
 *   - threadId: Filter by thread
 *   - userId: Filter by user who sent
 *   - channel: Filter by channel (pms, email, sms, etc)
 *   - startDate: Filter by date range (ISO string)
 *   - endDate: Filter by date range (ISO string)
 *   - search: Search in finalReply text
 *   - limit: Results per page (default 50)
 *   - page: Page number (default 1)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const threadId = searchParams.get('threadId');
    const userId_param = searchParams.get('userId');
    const channel = searchParams.get('channel');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (threadId) where.threadId = threadId;
    if (userId_param) where.sentByUserId = userId_param;
    if (channel) where.channel = channel;

    // Date range filtering
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Text search in finalReply
    if (search) {
      where.finalReply = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Fetch logs with related data
    const [logs, total] = await Promise.all([
      prisma.sendLog.findMany({
        where,
        include: {
          message: {
            select: {
              text: true,
              senderType: true,
            },
          },
          thread: {
            select: {
              id: true,
              guestName: true,
              guestEmail: true,
              property: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          sentByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sendLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      ok: true,
      results: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Send logs error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch send logs' },
      { status: 500 }
    );
  }
}
