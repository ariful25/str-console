import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/metrics
 * Fetch key system metrics for dashboard
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

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalMessages,
      messagesThisMonth,
      messagesToday,
      totalApprovals,
      approvedCount,
      rejectedCount,
      pendingCount,
      responseTimeAvg,
      highRiskMessages,
      avgApprovalTime,
    ] = await Promise.all([
      // Total messages
      prisma.message.count(),

      // Messages this month
      prisma.message.count({
        where: {
          receivedAt: { gte: thirtyDaysAgo },
        },
      }),

      // Messages today
      prisma.message.count({
        where: {
          receivedAt: { gte: todayStart },
        },
      }),

      // Total approval requests
      prisma.approvalRequest.count(),

      // Approved count
      prisma.approvalRequest.count({
        where: { status: 'approved' },
      }),

      // Rejected count
      prisma.approvalRequest.count({
        where: { status: 'rejected' },
      }),

      // Pending count
      prisma.approvalRequest.count({
        where: { status: 'pending' },
      }),

      // Average response time (from message to first approval/send)
      prisma.$queryRaw`
        SELECT AVG(EXTRACT(EPOCH FROM (a."createdAt" - m."receivedAt"))) as avg_seconds
        FROM "ApprovalRequest" a
        JOIN "Message" m ON a."messageId" = m.id
        WHERE m."receivedAt" > NOW() - INTERVAL '30 days'
      ` as any,

      // High risk messages (last 30 days)
      prisma.analysis.count({
        where: {
          risk: { in: ['high', 'critical'] },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      // Average approval time
      prisma.$queryRaw`
        SELECT AVG(EXTRACT(EPOCH FROM (a."updatedAt" - a."createdAt"))) as avg_seconds
        FROM "ApprovalRequest" a
        WHERE a."status" != 'pending'
        AND a."updatedAt" > NOW() - INTERVAL '30 days'
      ` as any,
    ]);

    const approvalRate = totalApprovals > 0 
      ? Math.round((approvedCount / totalApprovals) * 100) 
      : 0;

    const responseTimeSeconds = responseTimeAvg?.[0]?.avg_seconds 
      ? Math.round(responseTimeAvg[0].avg_seconds) 
      : 0;

    const approvalTimeSeconds = avgApprovalTime?.[0]?.avg_seconds 
      ? Math.round(avgApprovalTime[0].avg_seconds) 
      : 0;

    const metrics = {
      messages: {
        total: totalMessages,
        thisMonth: messagesThisMonth,
        today: messagesToday,
      },
      approvals: {
        total: totalApprovals,
        approved: approvedCount,
        rejected: rejectedCount,
        pending: pendingCount,
        approvalRate,
      },
      performance: {
        avgResponseTimeSeconds: responseTimeSeconds,
        avgApprovalTimeSeconds: approvalTimeSeconds,
      },
      risks: {
        highRiskThisMonth: highRiskMessages,
      },
    };

    return NextResponse.json({
      ok: true,
      metrics,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
