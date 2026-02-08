'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

interface ConversationSummaryProps {
  threadId: string;
}

interface Summary {
  summary: string;
  lastStaffResponse: string | null;
  mainTopics: string[];
  guestSentiment: 'positive' | 'neutral' | 'negative';
}

const sentimentConfig = {
  positive: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  neutral: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
  negative: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export function ConversationSummary({ threadId }: ConversationSummaryProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadId, action: 'summarize' }),
        });
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [threadId]);

  if (loading) {
    return (
      <Card className="p-4 bg-blue-50">
        <p className="text-sm text-gray-600">Generating summary...</p>
      </Card>
    );
  }

  if (!summary) return null;

  const SentimentIcon = sentimentConfig[summary.guestSentiment].icon;

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${sentimentConfig[summary.guestSentiment].bg}`}
        >
          <SentimentIcon
            className={`h-5 w-5 ${sentimentConfig[summary.guestSentiment].color}`}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-2">Conversation Summary</h3>
          <p className="text-sm text-gray-700 mb-3">{summary.summary}</p>

          {summary.mainTopics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {summary.mainTopics.map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          {summary.lastStaffResponse && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Your Last Response:
              </p>
              <p className="text-sm text-gray-600 italic">
                "{summary.lastStaffResponse}"
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
