import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface TagRequest {
  name: string;
  color?: string;
  category?: string;
}

/**
 * GET /api/metadata/tags
 * List all available tags
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

    // Get all unique tags from KB entries
    const entries = await prisma.kbEntry.findMany({
      select: { tags: true },
    });

    const tags = new Map<string, { name: string; count: number; color: string }>();

    entries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        if (tags.has(tag)) {
          const existing = tags.get(tag)!;
          existing.count += 1;
        } else {
          tags.set(tag, {
            name: tag,
            count: 1,
            color: '#3B82F6',
          });
        }
      });
    });

    const tagList = Array.from(tags.values()).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      ok: true,
      tags: tagList,
      total: tagList.length,
    });
  } catch (error) {
    console.error('Tags error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/metadata/tags
 * Add a new tag
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: TagRequest = await request.json();
    const { name, color = '#3B82F6', category = 'general' } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name required' },
        { status: 400 }
      );
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'CREATE_TAG',
        entityType: 'Tag',
        entityId: name,
        meta: { description: `Created tag: ${name}`, category, color },
      },
    });

    return NextResponse.json({
      ok: true,
      tag: {
        name,
        color,
        category,
        count: 0,
      },
    });
  } catch (error) {
    console.error('Create tag error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
