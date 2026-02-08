import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/kb-learning/stats
 * Get KB usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalEntries, recentEntries] = await Promise.all([
      prisma.kbEntry.count(),
      prisma.kbEntry.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      stats: {
        totalEntries,
        recentEntries,
      },
    });
  } catch (error) {
    console.error('KB stats error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
