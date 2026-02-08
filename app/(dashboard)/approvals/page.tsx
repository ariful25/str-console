'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface Approval {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  message: {
    id: string;
    text: string;
    receivedAt: string;
    thread: {
      id: string;
      guestName: string;
      property: {
        id: string;
        name: string;
        address: string | null;
      };
    };
    analysis: {
      intent: string | null;
      risk: string;
      urgency: string;
      suggestedReply: string | null;
      threadSummary: string | null;
    } | null;
  };
  reviewer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [customReply, setCustomReply] = useState<string>('');
  const [rejectionNotes, setRejectionNotes] = useState<string>('');

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/approvals?status=${filter}`);
      const data = await res.json();
      if (data.ok) {
        setApprovals(data.results);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch approvals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approval: Approval) => {
    if (!customReply && !approval.message.analysis?.suggestedReply) {
      toast({
        title: 'Error',
        description: 'Please provide a reply message',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId: approval.id,
          action: 'approve',
          finalReply: customReply || approval.message.analysis?.suggestedReply,
          notes: 'Approved via workflow',
        }),
      });

      const data = await res.json();
      if (data.ok) {
        toast({
          title: 'Approved',
          description: 'Message approved and sent successfully',
        });
        setSelectedApproval(null);
        setCustomReply('');
        fetchApprovals();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error approving:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve message',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (approval: Approval) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId: approval.id,
          action: 'reject',
          notes: rejectionNotes || 'Rejected via workflow',
        }),
      });

      const data = await res.json();
      if (data.ok) {
        toast({
          title: 'Rejected',
          description: 'Message rejected successfully',
        });
        setSelectedApproval(null);
        setRejectionNotes('');
        fetchApprovals();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error rejecting:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject message',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Approvals</h1>
        <p className="text-gray-600">Review and approve messages before they are sent</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          Approved
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading approvals...</p>
        </div>
      ) : approvals.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No {filter} approvals at this time</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <Card key={approval.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {approval.message.thread.guestName}
                    </h3>
                    <Badge variant="outline">
                      📍 {approval.message.thread.property.name}
                    </Badge>
                    {approval.message.analysis?.intent && (
                      <Badge className="capitalize">
                        {approval.message.analysis.intent}
                      </Badge>
                    )}
                    {approval.message.analysis && (
                      <Badge className={getRiskColor(approval.message.analysis.risk)}>
                        {approval.message.analysis.risk.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {new Date(approval.message.receivedAt).toLocaleString()}
                  </p>
                </div>
                <Badge
                  className={
                    approval.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : approval.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {approval.status.toUpperCase()}
                </Badge>
              </div>

              {/* Guest Message */}
              <div className="bg-gray-50 p-4 rounded mb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Guest Message:
                </p>
                <p className="text-gray-900">{approval.message.text}</p>
              </div>

              {/* AI Summary */}
              {approval.message.analysis?.threadSummary && (
                <div className="bg-blue-50 p-4 rounded mb-4">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    🤖 AI Summary:
                  </p>
                  <p className="text-blue-900 text-sm">
                    {approval.message.analysis.threadSummary}
                  </p>
                </div>
              )}

              {/* Actions for pending approvals */}
              {approval.status === 'pending' && (
                <div>
                  {selectedApproval?.id === approval.id ? (
                    <div className="space-y-4 border-t pt-4">
                      {/* Suggested Reply */}
                      {approval.message.analysis?.suggestedReply && (
                        <div className="bg-green-50 p-4 rounded">
                          <p className="text-sm font-medium text-green-800 mb-2">
                            💡 AI Suggested Reply:
                          </p>
                          <p className="text-green-900 text-sm">
                            {approval.message.analysis.suggestedReply}
                          </p>
                        </div>
                      )}

                      {/* Custom Reply */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Custom Reply (optional):
                        </label>
                        <textarea
                          value={customReply}
                          onChange={(e) => setCustomReply(e.target.value)}
                          placeholder={
                            approval.message.analysis?.suggestedReply
                              ? 'Leave empty to use AI suggestion'
                              : 'Enter your reply...'
                          }
                          className="w-full p-3 border rounded h-24"
                        />
                      </div>

                      {/* Rejection Notes */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Rejection Notes (optional):
                        </label>
                        <Input
                          value={rejectionNotes}
                          onChange={(e) => setRejectionNotes(e.target.value)}
                          placeholder="Why are you rejecting this?"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(approval)}
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading ? 'Processing...' : '✓ Approve & Send'}
                        </Button>
                        <Button
                          onClick={() => handleReject(approval)}
                          disabled={actionLoading}
                          variant="destructive"
                        >
                          {actionLoading ? 'Processing...' : '✗ Reject'}
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedApproval(null);
                            setCustomReply('');
                            setRejectionNotes('');
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedApproval(approval);
                        setCustomReply('');
                        setRejectionNotes('');
                      }}
                      variant="outline"
                    >
                      Review & Take Action
                    </Button>
                  )}
                </div>
              )}

              {/* Show reviewer info for processed approvals */}
              {approval.status !== 'pending' && approval.reviewer && (
                <div className="border-t pt-4 mt-4 text-sm text-gray-600">
                  <p>
                    {approval.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                    {approval.reviewer.name || approval.reviewer.email} on{' '}
                    {new Date(approval.createdAt).toLocaleString()}
                  </p>
                  {approval.notes && (
                    <p className="mt-1 italic">Notes: {approval.notes}</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
