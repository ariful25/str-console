import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

/**
 * GET /api/threads
 * Fetch threads - optionally filtered by clientId or propertyId
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
    const status = searchParams.get('status');

    const whereConditions: any = {};
    if (clientId) whereConditions.clientId = clientId;
    if (propertyId) whereConditions.propertyId = propertyId;
    if (status) whereConditions.status = status;

    const threads = await prisma.thread.findMany({
      where: whereConditions,
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
        messages: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        lastReceivedAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/threads
 * Create a new thread
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
    const { clientId, propertyId, guestName, guestEmail, status } = body;

    // Validation
    if (!clientId || !propertyId || !guestName) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: clientId, propertyId, guestName' 
        },
        { status: 400 }
      );
    }

    // Verify client and property exist
    const [client, property] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientId } }),
      prisma.property.findUnique({ where: { id: propertyId } }),
    ]);

    if (!client || !property) {
      return NextResponse.json(
        { error: 'Client or Property not found' },
        { status: 404 }
      );
    }

    // Create the thread
    const thread = await prisma.thread.create({
      data: {
        clientId,
        propertyId,
        guestName,
        guestEmail: guestEmail || undefined,
        status: status || 'pending',
        lastReceivedAt: new Date(),
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

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/threads/[id]
 * Update a thread (in separate route file)
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    const thread = await prisma.thread.update({
      where: { id },
      data: { status },
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
          },
        },
      },
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    );
  }
}
