'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Thread {
  id: string;
  guestName: string;
  property: {
    name: string;
  };
}

interface Analysis {
  intent: string;
  risk: string;
  urgency: string;
  suggestedReply: string;
  threadSummary: string;
}

export default function AITestPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    message: any;
    analysis: Analysis | null;
  } | null>(null);

  useEffect(() => {
    // Fetch threads
    fetch('/api/inbox')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.results) {
          setThreads(data.results);
          if (data.results.length > 0) {
            setSelectedThread(data.results[0].id);
          }
        }
      });
  }, []);

  const sendTestMessage = async () => {
    if (!selectedThread || !messageText.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Send the message
      const messageRes = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThread,
          senderType: 'guest',
          text: messageText,
        }),
      });

      const message = await messageRes.json();

      // Wait 3 seconds for AI analysis to complete
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Fetch the analysis
      const analysisRes = await fetch(
        `/api/messages?threadId=${selectedThread}`
      );
      const messages = await analysisRes.json();
      const latestMessage = messages[messages.length - 1];

      setResult({
        message: latestMessage,
        analysis: latestMessage.analysis || null,
      });

      setMessageText('');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message or fetch analysis');
    } finally {
      setLoading(false);
    }
  };

  const testScenarios = [
    {
      label: 'Check-in Question',
      text: 'Hi! What time is check-in tomorrow? Can we arrive early?',
    },
    {
      label: 'Complaint',
      text: 'The WiFi is not working and the AC is broken. This is unacceptable!',
    },
    {
      label: 'Cancellation',
      text: 'I need to cancel my reservation due to a family emergency.',
    },
    {
      label: 'Simple Question',
      text: 'Do you have parking available?',
    },
  ];

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">🤖 AI Message Analysis Test</h1>
        <p className="text-gray-600 mb-6">
          Send test guest messages and see how OpenAI analyzes them with intent
          classification, risk assessment, and suggested replies.
        </p>

        <div className="space-y-4">
          {/* Thread Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Thread:
            </label>
            <select
              value={selectedThread}
              onChange={(e) => setSelectedThread(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {threads.map((thread) => (
                <option key={thread.id} value={thread.id}>
                  {thread.guestName} - {thread.property.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Test Scenarios */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Quick Test Scenarios:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {testScenarios.map((scenario) => (
                <Button
                  key={scenario.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessageText(scenario.text)}
                >
                  {scenario.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Guest Message:
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a guest message..."
              className="w-full p-2 border rounded h-24"
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={sendTestMessage}
            disabled={loading || !messageText.trim()}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Send & Analyze Message'}
          </Button>

          {/* Results */}
          {result && (
            <div className="mt-6 space-y-4">
              <div className="border-t pt-4">
                <h2 className="font-semibold mb-2">✅ Message Sent</h2>
                <p className="text-sm text-gray-600">{result.message.text}</p>
              </div>

              {result.analysis ? (
                <div className="bg-green-50 p-4 rounded space-y-3">
                  <h2 className="font-semibold text-green-800">
                    🤖 AI Analysis Results
                  </h2>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-600">
                        INTENT
                      </div>
                      <div className="text-lg font-semibold capitalize">
                        {result.analysis.intent}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-600">
                        RISK
                      </div>
                      <div
                        className={`text-lg font-semibold capitalize ${
                          result.analysis.risk === 'critical'
                            ? 'text-red-600'
                            : result.analysis.risk === 'high'
                            ? 'text-orange-600'
                            : result.analysis.risk === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {result.analysis.risk}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-600">
                        URGENCY
                      </div>
                      <div className="text-lg font-semibold capitalize">
                        {result.analysis.urgency}
                      </div>
                    </div>
                  </div>

                  {result.analysis.threadSummary && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        SUMMARY
                      </div>
                      <div className="text-sm">
                        {result.analysis.threadSummary}
                      </div>
                    </div>
                  )}

                  {result.analysis.suggestedReply && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        SUGGESTED REPLY
                      </div>
                      <div className="text-sm bg-white p-3 rounded border">
                        {result.analysis.suggestedReply}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm text-yellow-800">
                    ⏳ AI analysis is processing... Refresh to see results.
                  </p>
                </div>
              )}

              {/* Check Auto-Rules */}
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Check the{' '}
                  <a href="/approvals" className="underline">
                    Approvals page
                  </a>{' '}
                  to see if any Auto-Rules were triggered!
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
