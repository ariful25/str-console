import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all counts in parallel
    const [
      totalClients,
      totalProperties,
      totalMessages,
      totalThreads,
      threadsByStatus,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.property.count(),
      prisma.message.count(),
      prisma.thread.count(),
      prisma.thread.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Get active threads (not resolved or closed)
    const activeThreads = await prisma.thread.count({
      where: {
        status: { in: ['pending', 'open'] },
      },
    });

    // Get pending threads
    const pendingThreads = await prisma.thread.count({
      where: { status: 'pending' },
    });

    // Get resolved threads
    const resolvedThreads = await prisma.thread.count({
      where: { status: 'resolved' },
    });

    // Get top clients by thread count
    const topClients = await prisma.client.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            threads: true,
            properties: true,
          },
        },
      },
      orderBy: {
        threads: {
          _count: 'desc',
        },
      },
    });

    // Get recent messages
    const recentMessages = await prisma.message.findMany({
      take: 10,
      include: {
        thread: {
          select: {
            id: true,
            guestName: true,
            property: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get message count for each top client
    const clientMessageCounts = await Promise.all(
      topClients.map(async (client) => ({
        ...client,
        messageCount: await prisma.message.count({
          where: {
            thread: {
              clientId: client.id,
            },
          },
        }),
      }))
    );

    // Build status breakdown
    const statusBreakdown = {
      pending: pendingThreads,
      open: threadsByStatus.find((s) => s.status === 'open')?._count || 0,
      resolved: resolvedThreads,
      closed: threadsByStatus.find((s) => s.status === 'closed')?._count || 0,
    };

    const stats = {
      totalClients,
      totalProperties,
      totalMessages,
      totalThreads,
      activeThreads,
      pendingThreads,
      resolvedThreads,
      topClients: clientMessageCounts.map((client) => ({
        id: client.id,
        name: client.name,
        threadCount: client._count.threads,
        messageCount: client.messageCount,
      })),
      threadsByStatus: statusBreakdown,
      recentMessages: recentMessages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        senderType: msg.senderType as 'Staff' | 'Guest',
        threadId: msg.threadId,
        createdAt: msg.createdAt.toISOString(),
        thread: {
          guestName: msg.thread.guestName,
          property: {
            name: msg.thread.property.name,
          },
        },
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('GET dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
