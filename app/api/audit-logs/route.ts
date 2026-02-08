import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/audit-logs
 * Fetch audit logs with optional filtering
 * Query params:
 *   - userId: Filter by actor user
 *   - action: Filter by action type
 *   - entityType: Filter by entity type (User, Client, Property, etc)
 *   - startDate: Filter by date range (ISO string)
 *   - endDate: Filter by date range (ISO string)
 *   - search: Search in action or details
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
    const userId_param = searchParams.get('userId');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (userId_param) where.actorUserId = userId_param;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    // Date range filtering
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Text search
    if (search) {
      where.OR = [
        {
          action: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          entityType: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          entityId: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Fetch logs with actor info
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
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
      prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const formattedLogs = logs.map((log) => ({
      ...log,
      timestamp: log.createdAt,
      details:
        typeof log.meta === 'object' && log.meta && 'description' in log.meta
          ? String((log.meta as Record<string, unknown>).description || '')
          : '',
    }));

    return NextResponse.json({
      ok: true,
      results: formattedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
