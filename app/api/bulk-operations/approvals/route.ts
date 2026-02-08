import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface BulkApprovalRequest {
  messageIds: string[];
  action: 'approve' | 'reject';
  reason?: string;
}

/**
 * POST /api/bulk-operations/approvals
 * Approve or reject multiple messages at once
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

    const body: BulkApprovalRequest = await request.json();
    const { messageIds, action, reason } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messageIds' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get approval requests for these messages
    const approvalRequests = await prisma.approvalRequest.findMany({
      where: {
        messageId: { in: messageIds },
        status: 'pending',
      },
      select: { id: true },
    });

    if (approvalRequests.length === 0) {
      return NextResponse.json(
        { error: 'No pending approval requests found' },
        { status: 404 }
      );
    }

    const approvalIds = approvalRequests.map(a => a.id);

    // Update all approval requests
    const updated = await prisma.approvalRequest.updateMany({
      where: { id: { in: approvalIds } },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: new Date(),
        notes: reason,
        reviewerId: userId,
      },
    });

    // Create audit log for bulk operation
    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: `BULK_${action.toUpperCase()}`,
        entityType: 'ApprovalRequest',
        entityId: messageIds.join(','),
        meta: {
          description: `Bulk ${action} ${messageIds.length} approval requests`,
          count: messageIds.length,
          reason,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      processed: updated.count,
      action,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Bulk operations error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to process bulk operation' },
      { status: 500 }
    );
  }
}
