import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type MessageIntent = 
  | 'checkin'
  | 'checkout'
  | 'question'
  | 'complaint'
  | 'cancellation'
  | 'booking_inquiry'
  | 'maintenance'
  | 'amenity_request'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type UrgencyLevel = 'low' | 'normal' | 'high' | 'urgent';

export interface MessageAnalysis {
  intent: MessageIntent;
  risk: RiskLevel;
  urgency: UrgencyLevel;
  summary: string;
  suggestedReply: string;
  confidence: number;
}

export interface ThreadContext {
  guestName: string;
  propertyName: string;
  propertyAddress?: string;
  previousMessages?: Array<{
    senderType: string;
    text: string;
    receivedAt: Date;
  }>;
    knowledgeBase?: Array<{
      title: string;
      content: string;
      tags: string[];
    }>;
}

/**
 * Analyzes a guest message using OpenAI GPT-4o-mini
 * Returns intent classification, risk assessment, and AI-generated suggestions
 */
export async function analyzeMessage(
  messageText: string,
  context: ThreadContext
): Promise<MessageAnalysis> {
  try {
    const prompt = buildAnalysisPrompt(messageText, context);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping vacation rental property managers analyze guest messages. 
Your job is to classify the intent, assess risk level, determine urgency, and provide helpful suggestions.

Always respond with valid JSON matching this structure:
{
  "intent": "checkin" | "checkout" | "question" | "complaint" | "cancellation" | "booking_inquiry" | "maintenance" | "amenity_request" | "other",
  "risk": "low" | "medium" | "high" | "critical",
  "urgency": "low" | "normal" | "high" | "urgent",
  "summary": "Brief 1-2 sentence summary of the message",
  "suggestedReply": "Professional, friendly reply suggestion",
  "confidence": 0.0 to 1.0
}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content) as MessageAnalysis;

    // Validate and set defaults
    return {
      intent: analysis.intent || 'other',
      risk: analysis.risk || 'medium',
      urgency: analysis.urgency || 'normal',
      summary: analysis.summary || messageText.substring(0, 200),
      suggestedReply: analysis.suggestedReply || '',
      confidence: analysis.confidence || 0.5,
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    
    // Fallback analysis if OpenAI fails
    return {
      intent: 'other',
      risk: 'medium',
      urgency: 'normal',
      summary: messageText.substring(0, 200),
      suggestedReply: 'Thank you for your message. We will respond shortly.',
      confidence: 0.0,
    };
  }
}

/**
 * Builds the analysis prompt with message and context
 */
function buildAnalysisPrompt(messageText: string, context: ThreadContext): string {
  let prompt = `Analyze this guest message for a vacation rental property.\n\n`;
  
  prompt += `Property: ${context.propertyName}`;
  if (context.propertyAddress) {
    prompt += ` (${context.propertyAddress})`;
  }
  prompt += `\n`;
  
  prompt += `Guest: ${context.guestName}\n\n`;

    if (context.knowledgeBase && context.knowledgeBase.length > 0) {
      prompt += `Property Information (Knowledge Base):\n`;
      context.knowledgeBase.forEach((kb) => {
        prompt += `\n[${kb.title}]\n${kb.content}\n`;
      });
      prompt += `\n`;
    }

  if (context.previousMessages && context.previousMessages.length > 0) {
    prompt += `Previous conversation:\n`;
    context.previousMessages.slice(-3).forEach((msg) => {
      prompt += `${msg.senderType}: ${msg.text}\n`;
    });
    prompt += `\n`;
  }

  prompt += `Current message:\n${messageText}\n\n`;

  prompt += `Analyze this message and provide:
1. Intent classification (what does the guest want?)
2. Risk level (how urgent/serious is this?)
3. Urgency (how quickly does this need a response?)
4. Summary (brief overview)
5. Suggested reply (professional, friendly response)
6. Confidence (how confident are you in this analysis?)

Risk level guidance:
- LOW: Simple questions, routine requests
- MEDIUM: Important questions, minor issues
- HIGH: Complaints, urgent needs, payment issues
- CRITICAL: Emergencies, cancellations, safety concerns

Intent guidance:
- checkin: Questions about arrival, access codes, directions
- checkout: Questions about departure, checkout time
- question: General inquiries about amenities, location, etc.
- complaint: Issues, problems, dissatisfaction
- cancellation: Wants to cancel or modify reservation
- booking_inquiry: Questions before booking
- maintenance: Something broken or not working
- amenity_request: Requesting additional items/services
- other: Doesn't fit other categories`;

  return prompt;
}

/**
 * Generates embeddings for a text using OpenAI text-embedding-3-small
 * Used for semantic search of similar messages
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0]?.embedding || [];
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    return [];
  }
}

/**
 * Generates a summary of multiple messages in a thread
 */
export async function summarizeThread(
  messages: Array<{ senderType: string; text: string; receivedAt: Date }>
): Promise<string> {
  try {
    const conversationText = messages
      .map((msg) => `${msg.senderType}: ${msg.text}`)
      .join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes vacation rental guest conversations. Provide concise, professional summaries in 2-3 sentences.',
        },
        {
          role: 'user',
          content: `Summarize this conversation:\n\n${conversationText}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
    });

    return response.choices[0]?.message?.content || 'Conversation summary unavailable.';
  } catch (error) {
    console.error('OpenAI summary error:', error);
    return 'Conversation summary unavailable.';
  }
}
