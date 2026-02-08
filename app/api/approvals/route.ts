import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/approvals
 * Fetch approval requests with filters
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
    const status = searchParams.get('status') || 'pending';
    const clientId = searchParams.get('clientId');

    const approvals = await prisma.approvalRequest.findMany({
      where: {
        status,
        ...(clientId && {
          message: {
            thread: {
              clientId,
            },
          },
        }),
      },
      include: {
        message: {
          include: {
            thread: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                  },
                },
              },
            },
            analysis: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({ ok: true, results: approvals });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/approvals/:id
 * Approve or reject an approval request
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
    const { approvalId, action, notes, finalReply } = body;

    if (!approvalId || !action) {
      return NextResponse.json(
        { error: 'Missing approvalId or action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get user record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get approval request
    const approval = await prisma.approvalRequest.findUnique({
      where: { id: approvalId },
      include: {
        message: {
          include: {
            thread: true,
            analysis: true,
          },
        },
      },
    });

    if (!approval) {
      return NextResponse.json(
        { error: 'Approval request not found' },
        { status: 404 }
      );
    }

    if (approval.status !== 'pending') {
      return NextResponse.json(
        { error: 'Approval request already processed' },
        { status: 400 }
      );
    }

    // Update approval status
    const updatedApproval = await prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewerId: user.id,
        notes: notes || null,
        updatedAt: new Date(),
      },
    });

    // If approved and finalReply provided, send the message
    if (action === 'approve' && finalReply) {
      // Create send log
      await prisma.sendLog.create({
        data: {
          messageId: approval.message.id,
          threadId: approval.message.threadId,
          finalReply,
          channel: 'pms',
          providerResponse: {
            success: true,
            sentAt: new Date().toISOString(),
            note: 'Sent via approval workflow',
          },
          sentByUserId: user.id,
        },
      });

      // Update thread status
      await prisma.thread.update({
        where: { id: approval.message.threadId },
        data: { status: 'sent' },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: 'message_approved_and_sent',
          entityType: 'approval',
          entityId: approvalId,
          meta: {
            messageId: approval.message.id,
            threadId: approval.message.threadId,
            finalReply: finalReply.substring(0, 100),
          },
        },
      });
    } else if (action === 'reject') {
      // Update thread status to declined
      await prisma.thread.update({
        where: { id: approval.message.threadId },
        data: { status: 'declined' },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: 'message_rejected',
          entityType: 'approval',
          entityId: approvalId,
          meta: {
            messageId: approval.message.id,
            threadId: approval.message.threadId,
            notes: notes || '',
          },
        },
      });
    }

    return NextResponse.json({
      ok: true,
      result: updatedApproval,
    });
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update approval' },
      { status: 500 }
    );
  }
}
