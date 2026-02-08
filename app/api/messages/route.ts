import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { analyzeMessage } from '@/lib/openai-service';
import { evaluateRulesForMessage } from '@/lib/rules-service';

const prisma = new PrismaClient();

/**
 * GET /api/messages
 * Fetch messages - optionally filtered by threadId
 * Query params: threadId (optional)
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
    const threadId = searchParams.get('threadId');

    if (threadId) {
      // Fetch messages for a specific thread
      const messages = await prisma.message.findMany({
        where: {
          threadId: threadId,
        },
        include: {
          thread: {
            select: {
              id: true,
              guestName: true,
              guestEmail: true,
            },
          },
          analysis: {
            select: {
              intent: true,
              risk: true,
              urgency: true,
              suggestedReply: true,
            },
          },
        },
        orderBy: {
          receivedAt: 'asc',
        },
      });

      return NextResponse.json(messages);
    } else {
      // Fetch all messages
      const messages = await prisma.message.findMany({
        include: {
          thread: {
            select: {
              id: true,
              guestName: true,
              guestEmail: true,
            },
          },
          analysis: {
            select: {
              intent: true,
              risk: true,
              urgency: true,
              suggestedReply: true,
            },
          },
        },
        orderBy: {
          receivedAt: 'desc',
        },
        take: 50, // Limit to last 50 messages
      });

      return NextResponse.json(messages);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Create a new message
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

    const body = await request.json();
    const { threadId, senderType, text } = body;

    // Validation
    if (!threadId || !senderType || !text) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: threadId, senderType, text' 
        },
        { status: 400 }
      );
    }

    // Verify thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        threadId,
        senderType,
        text,
        receivedAt: new Date(),
      },
      include: {
        thread: {
          select: {
            id: true,
            guestName: true,
            guestEmail: true,
            propertyId: true,
          },
        },
      },
    });

    // If guest message, generate AI analysis (async, don't wait)
    if (senderType === 'guest' && process.env.OPENAI_API_KEY) {
      // Fetch full thread context for better analysis
      prisma.thread.findUnique({
        where: { id: threadId },
        include: {
          property: {
            select: {
              name: true,
              address: true,
            },
          },
          messages: {
            orderBy: { receivedAt: 'desc' },
            take: 5, // Last 5 messages for context
            select: {
              senderType: true,
              text: true,
              receivedAt: true,
            },
          },
        },
      })
        .then(async (fullThread) => {
          if (!fullThread) return;

            // Fetch relevant KB entries for this property and client
            const kbEntries = await prisma.kbEntry.findMany({
              where: {
                clientId: fullThread.clientId,
                OR: [
                  { propertyId: fullThread.propertyId },
                  { propertyId: null }, // Client-wide entries
                ],
              },
              select: {
                title: true,
                content: true,
                tags: true,
              },
              take: 10, // Limit to 10 most relevant entries
            });

          // Analyze with full context
          const analysis = await analyzeMessage(text, {
            guestName: thread.guestName,
            propertyName: fullThread.property.name,
            propertyAddress: fullThread.property.address || undefined,
            previousMessages: fullThread.messages
              .reverse()
              .slice(0, -1), // Exclude current message
              knowledgeBase: kbEntries,
          });

          // Store analysis
          await prisma.analysis.create({
            data: {
              messageId: message.id,
              threadId,
              intent: analysis.intent,
              risk: analysis.risk,
              urgency: analysis.urgency,
              suggestedReply: analysis.suggestedReply,
              threadSummary: analysis.summary,
            },
          });

          // Evaluate auto-rules for this message
          await evaluateRulesForMessage(
            threadId,
            message.id,
            analysis.intent,
            analysis.risk
          );
        })
        .catch((error) => {
          console.error('Error analyzing message:', error);
        });
    }

    // Update thread's lastReceivedAt
    await prisma.thread.update({
      where: { id: threadId },
      data: { lastReceivedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
