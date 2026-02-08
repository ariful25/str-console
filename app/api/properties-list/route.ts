import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 });

    // Get all properties for a client
    const properties = await prisma.property.findMany({
      where: { clientId },
      select: {
        id: true,
        name: true,
        address: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
