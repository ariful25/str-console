'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, AlertTriangle } from 'lucide-react';

interface SimilarMessagesProps {
  threadId: string;
  currentMessage: string;
  onUseResponse?: (response: string) => void;
}

interface SimilarMessage {
  id: string;
  text: string;
  similarity: number;
  staffResponse: string | null;
}

interface AnalysisResult {
  intent: string;
  confidence: number;
  category: string;
  similarMessages: SimilarMessage[];
}

export function SimilarMessages({
  threadId,
  currentMessage,
  onUseResponse,
}: SimilarMessagesProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeSimilarity = async () => {
    if (!currentMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          messageText: currentMessage,
          action: 'analyze_intent',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error analyzing similarity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentMessage.trim()) return null;

  return (
    <div className="space-y-3">
      {!analysis && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={analyzeSimilarity}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : '🔍 Check for Similar Questions'}
        </Button>
      )}

      {analysis && (
        <>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">AI Analysis</h4>
              <Badge variant="secondary">
                {analysis.intent} ({Math.round(analysis.confidence * 100)}%)
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Category: {analysis.category}
            </p>
          </Card>

          {analysis.similarMessages.length > 0 && (
            <Card className="p-4 bg-yellow-50 border-yellow-300">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-yellow-900">
                    Similar Question Found!
                  </h4>
                  <p className="text-xs text-yellow-800">
                    You answered a similar question before.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {analysis.similarMessages.map((similar) => (
                  <div
                    key={similar.id}
                    className="bg-white p-3 rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-700">
                        Previous question:
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(similar.similarity * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 italic mb-2">
                      "{similar.text}"
                    </p>

                    {similar.staffResponse && (
                      <>
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Your previous response:
                        </p>
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <p className="text-sm text-gray-700">
                            {similar.staffResponse}
                          </p>
                        </div>
                        {onUseResponse && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full"
                            onClick={() => onUseResponse(similar.staffResponse!)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Use This Response
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {analysis.similarMessages.length === 0 && (
            <Card className="p-3 bg-green-50 border-green-200">
              <p className="text-sm text-green-800">
                ✓ No similar questions found. This seems like a new question.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
