import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  summarizeConversation,
  analyzeMessageIntent,
} from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { threadId, messageText, action } = body;

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    // Fetch thread messages
    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      include: {
        analysis: true,
      },
    });

    if (action === 'summarize') {
      // Generate conversation summary
      const summary = await summarizeConversation(
        messages.map((m) => ({
          text: m.text,
          senderType: m.senderType,
          createdAt: m.createdAt,
        }))
      );

      return NextResponse.json(summary);
    }

    if (action === 'analyze_intent' && messageText) {
      // Analyze message intent
      const intentResult = await analyzeMessageIntent(messageText);

      return NextResponse.json({
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        category: intentResult.category,
        similarMessages: [],
      });
    }

    return NextResponse.json(
      { error: 'Invalid action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Conversation analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze conversation' },
      { status: 500 }
    );
  }
}
