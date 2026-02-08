import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const propertyId = searchParams.get('propertyId');

    if (propertyId) {
      // Get single property with full details
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          client: true,
          pmsAccount: true,
          _count: {
            select: {
              threads: true,
              autoRules: true,
            },
          },
        },
      });

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(property);
    }

    // Get multiple properties with optional filtering
    const properties = await prisma.property.findMany({
      where: clientId ? { clientId } : undefined,
      include: {
        client: {
          select: { id: true, name: true },
        },
        pmsAccount: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: {
            threads: true,
            autoRules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('GET properties error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, pmsAccountId, listingMapId, name, address } = body;

    // Validate required fields
    if (!clientId || !pmsAccountId || !listingMapId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, pmsAccountId, listingMapId, name' },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        clientId,
        pmsAccountId,
        listingMapId,
        name,
        address: address || null,
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
        pmsAccount: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: {
            threads: true,
            autoRules: true,
          },
        },
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('POST property error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, address, pmsAccountId, listingMapId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Verify property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Update property
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address !== undefined && { address: address || null }),
        ...(pmsAccountId !== undefined && { pmsAccountId: pmsAccountId || null }),
        ...(listingMapId !== undefined && { listingMapId }),
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
        pmsAccount: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: {
            threads: true,
            autoRules: true,
          },
        },
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('PATCH property error:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Verify property exists and check for threads
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        _count: {
          select: { threads: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (property._count.threads > 0) {
      return NextResponse.json(
        { error: `Cannot delete property with ${property._count.threads} thread(s)` },
        { status: 409 }
      );
    }

    // Delete property
    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE property error:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
