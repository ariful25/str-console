import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clientId = searchParams.get('clientId');
    const propertyId = searchParams.get('propertyId');

    if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 });

    if (id) {
      // Get single rule
      const rule = await prisma.autoRule.findUnique({ where: { id } });
      if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
      return NextResponse.json(rule);
    }

    // Get all rules for client, optionally filtered by property
    const rules = await prisma.autoRule.findMany({
      where: {
        clientId,
        ...(propertyId && { propertyId }),
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(rules);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 });

    const body = await req.json();

    const rule = await prisma.autoRule.create({
      data: {
        clientId,
        ...(body.propertyId && { propertyId: body.propertyId }),
        intent: body.intent || null,
        riskMax: body.riskMax || 'low',
        conditions: body.conditions || {},
        action: body.action,
        enabled: true,
      } as any,
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const body = await req.json();

    const rule = await prisma.autoRule.update({
      where: { id },
      data: {
        ...(body.propertyId !== undefined && { propertyId: body.propertyId }),
        ...(body.intent !== undefined && { intent: body.intent }),
        ...(body.riskMax !== undefined && { riskMax: body.riskMax }),
        ...(body.conditions !== undefined && { conditions: body.conditions }),
        ...(body.action !== undefined && { action: body.action }),
        ...(body.enabled !== undefined && { enabled: body.enabled }),
      } as any,
    });

    return NextResponse.json(rule);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.autoRule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
