import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/knowledge-base
 * Fetch KB entries with optional filters
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
    const clientId = searchParams.get('clientId');
    const propertyId = searchParams.get('propertyId');
    const tag = searchParams.get('tag');

    const entries = await prisma.kbEntry.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(propertyId && { propertyId }),
        ...(tag && { tags: { has: tag } }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        sources: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ ok: true, results: entries });
  } catch (error) {
    console.error('Error fetching KB entries:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch knowledge base entries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge-base
 * Create a new KB entry
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

    const body = await request.json();
    const { clientId, propertyId, title, content, tags } = body;

    // Validation
    if (!clientId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, title, content' },
        { status: 400 }
      );
    }

    const entry = await prisma.kbEntry.create({
      data: {
        clientId,
        propertyId: propertyId || null,
        title,
        content,
        tags: tags || [],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json(
      { ok: true, result: entry },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating KB entry:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create knowledge base entry' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/knowledge-base
 * Update an existing KB entry
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { entryId, title, content, tags } = body;

    if (!entryId) {
      return NextResponse.json(
        { error: 'Missing entryId' },
        { status: 400 }
      );
    }

    const entry = await prisma.kbEntry.update({
      where: { id: entryId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(tags && { tags }),
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, result: entry });
  } catch (error) {
    console.error('Error updating KB entry:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update knowledge base entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge-base
 * Delete a KB entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json(
        { error: 'Missing entryId' },
        { status: 400 }
      );
    }

    await prisma.kbEntry.delete({
      where: { id: entryId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting KB entry:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete knowledge base entry' },
      { status: 500 }
    );
  }
}
