import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface KBSearchQuery {
  query?: string;
  limit?: number;
}

/**
 * GET /api/kb-learning/search
 * Search KB with advanced filters
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
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    const results = await prisma.kbEntry.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        createdAt: true,
        _count: { select: { sources: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const processedResults = results.map(entry => ({
      ...entry,
      sourcesCount: entry._count.sources,
      preview: entry.content ? entry.content.substring(0, 150) + '...' : '',
    }));

    return NextResponse.json({
      ok: true,
      results: processedResults,
      total: processedResults.length,
      searchQuery: query,
    });
  } catch (error) {
    console.error('KB search error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to search KB' },
      { status: 500 }
    );
  }
}

