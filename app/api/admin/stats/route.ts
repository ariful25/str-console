import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stats
 * Fetch admin dashboard statistics
 * Requires admin authentication
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

    // Todo: Add admin role check
    // const currentUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    // if (currentUser?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Fetch all stats in parallel
    const [
      totalUsers,
      usersByRole,
      totalMessages,
      totalApprovals,
      pendingApprovals,
      totalClients,
      totalProperties,
      recentActivity,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Users grouped by role
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true,
        },
      }),

      // Total messages
      prisma.message.count(),

      // Total approvals
      prisma.approvalRequest.count(),

      // Pending approvals
      prisma.approvalRequest.count({
        where: { status: 'pending' },
      }),

      // Total clients
      prisma.client.count(),

      // Total properties
      prisma.property.count(),

      // Recent audit log activity (last 10)
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Format users by role
    const formattedUsersByRole = usersByRole.map((item) => ({
      role: item.role,
      count: item._count.role,
    }));

    // Format recent activity
    const formattedActivity = recentActivity.map((log) => ({
      id: log.id,
      action: log.action,
      details:
        typeof log.meta === 'object' && log.meta && 'description' in log.meta
          ? String((log.meta as Record<string, unknown>).description || '')
          : '',
      timestamp: log.createdAt,
      actorName: log.actor?.name || null,
    }));

    const stats = {
      totalUsers,
      usersByRole: formattedUsersByRole,
      totalMessages,
      totalApprovals,
      pendingApprovals,
      totalClients,
      totalProperties,
      recentActivity: formattedActivity,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
