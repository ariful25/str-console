'use client';

import { useState } from 'react';
import { useMessages } from '@/lib/hooks/useMessageThread';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SimilarMessages } from '@/components/messages/similar-messages';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ui/use-toast';

interface MessageFormProps {
  threadId: string;
  onMessageSent?: () => void;
}

export function MessageForm({ threadId, onMessageSent }: MessageFormProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const { createMessage, loading, error } = useMessages();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to send messages',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const success = await createMessage(
        threadId,
        'staff', // Assuming staff is sending this
        text.trim()
      );

      if (success) {
        toast({
          title: 'Success',
          description: 'Message sent successfully',
        });
        setText('');
        onMessageSent?.();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Message
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            disabled={submitting || !user}
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={4}
          />
          {!user && (
            <p className="text-sm text-amber-600 mt-2">
              Please sign in to send messages
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {/* AI-Powered Similar Message Detection */}
        {text.trim().length > 20 && (
          <SimilarMessages
            threadId={threadId}
            currentMessage={text}
            onUseResponse={(response) => setText(response)}
          />
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={submitting || !user || !text.trim()}
            className="flex-1"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
