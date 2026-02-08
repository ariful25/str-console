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
    const templateId = searchParams.get('templateId');
    const clientId = searchParams.get('clientId');
    const intent = searchParams.get('intent');
    const isActive = searchParams.get('isActive');

    if (templateId) {
      // Get single template
      const template = await prisma.template.findUnique({
        where: { id: templateId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ ok: true, result: template });
    }

    // Get multiple templates with optional filtering
    const templates = await prisma.template.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(intent && { intent }),
        ...(isActive && { isActive: isActive === 'true' }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { intent: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ ok: true, results: templates });
  } catch (error) {
    console.error('GET templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
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
    const { clientId, intent, label, text, isActive } = body;

    // Validate required fields
    if (!intent || !label || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: intent, label, text' },
        { status: 400 }
      );
    }

    // Verify client exists if clientId provided
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }
    }

    // Create template
    const template = await prisma.template.create({
      data: {
        clientId: clientId || null,
        intent,
        label,
        text,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, result: template }, { status: 201 });
  } catch (error) {
    console.error('POST template error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
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
    const { templateId, label, text, isActive } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Verify template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Update template
    const template = await prisma.template.update({
      where: { id: templateId },
      data: {
        ...(label && { label }),
        ...(text && { text }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, result: template });
  } catch (error) {
    console.error('PATCH template error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
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

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('templateId');

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Verify template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete template
    await prisma.template.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE template error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
