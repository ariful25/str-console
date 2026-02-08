import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ConversationSummary {
  summary: string;
  lastStaffResponse: string | null;
  mainTopics: string[];
  guestSentiment: 'positive' | 'neutral' | 'negative';
}

export interface MessageIntent {
  intent: string;
  confidence: number;
  category: string;
  embeddings: number[];
}

/**
 * Generate a conversation summary from message history
 */
export async function summarizeConversation(
  messages: Array<{ text: string; senderType: string; createdAt: Date }>
): Promise<ConversationSummary> {
  try {
    const conversationText = messages
      .map((m) => `[${m.senderType}]: ${m.text}`)
      .join('\n');

    const prompt = `Analyze this guest-staff conversation and provide:
1. A brief summary (2-3 sentences)
2. Main topics discussed
3. Guest sentiment (positive/neutral/negative)

Conversation:
${conversationText}

Respond in JSON format:
{
  "summary": "...",
  "mainTopics": ["topic1", "topic2"],
  "guestSentiment": "positive|neutral|negative"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Find last staff response
    const lastStaffMessage = messages
      .reverse()
      .find((m) => m.senderType === 'staff');

    return {
      summary: result.summary || 'No summary available',
      lastStaffResponse: lastStaffMessage?.text || null,
      mainTopics: result.mainTopics || [],
      guestSentiment: result.guestSentiment || 'neutral',
    };
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    return {
      summary: 'Unable to generate summary',
      lastStaffResponse: null,
      mainTopics: [],
      guestSentiment: 'neutral',
    };
  }
}

/**
 * Detect intent and generate embeddings for a message
 */
export async function analyzeMessageIntent(
  messageText: string
): Promise<MessageIntent> {
  try {
    // Get intent classification
    const intentPrompt = `Classify this guest message into one of these intents:
- checkin: questions about check-in time, early check-in, keys, arrival
- checkout: questions about check-out time, late checkout, departure
- amenity: questions about WiFi, parking, appliances, facilities
- complaint: problems, issues, things not working
- cancellation: canceling or changing reservation
- question: general questions
- appreciation: thank you, positive feedback

Message: "${messageText}"

Respond in JSON format:
{
  "intent": "intent_name",
  "confidence": 0.0-1.0,
  "category": "intent_category"
}`;

    const [intentResponse, embeddingResponse] = await Promise.all([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: intentPrompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
      openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: messageText,
      }),
    ]);

    const intentResult = JSON.parse(
      intentResponse.choices[0].message.content || '{}'
    );

    return {
      intent: intentResult.intent || 'question',
      confidence: intentResult.confidence || 0.5,
      category: intentResult.category || 'general',
      embeddings: embeddingResponse.data[0].embedding,
    };
  } catch (error) {
    console.error('Error analyzing message intent:', error);
    return {
      intent: 'question',
      confidence: 0.5,
      category: 'general',
      embeddings: [],
    };
  }
}

/**
 * Find similar previous messages using embeddings
 */
export function calculateSimilarity(
  embedding1: number[],
  embedding2: number[]
): number {
  if (embedding1.length !== embedding2.length) return 0;

  // Cosine similarity
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Check if question was already asked (similarity check)
 */
export async function findSimilarMessages(
  currentMessageEmbedding: number[],
  previousMessages: Array<{ id: string; embeddings: number[] | null; text: string }>
): Promise<Array<{ id: string; similarity: number; text: string }>> {
  const similarities = previousMessages
    .filter((msg) => msg.embeddings && msg.embeddings.length > 0)
    .map((msg) => ({
      id: msg.id,
      text: msg.text,
      similarity: calculateSimilarity(
        currentMessageEmbedding,
        msg.embeddings as number[]
      ),
    }))
    .filter((s) => s.similarity > 0.7) // Only high similarity
    .sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, 3); // Top 3 similar messages
}
