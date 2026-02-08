import { prisma } from '@/lib/prisma';
import type { AutoRule } from '@prisma/client';

export interface RuleEvaluationResult {
  ruleId: string;
  matched: boolean;
  action: string;
}

/**
 * Evaluate rules for a message
 * Rules are matched based on:
 * 1. Client ID (from thread)
 * 2. Property ID (from thread) - optional
 * 3. Intent (from AI analysis)
 * 4. Risk level
 * 
 * Rules will match if:
 * - They're enabled
 * - Intent matches (or rule has no specific intent)
 * - Risk level is at or below the rule's max
 * - They're scoped to the same property (or property-wide)
 */
export async function evaluateRulesForMessage(
  threadId: string,
  messageId: string,
  intent?: string,
  risk: string = 'low'
): Promise<RuleEvaluationResult[]> {
  try {
    // Get thread to find client and property
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { clientId: true, propertyId: true },
    });

    if (!thread) return [];

    // Find enabled rules for this client
    // Include both property-specific rules AND client-wide rules (propertyId=null)
    const rules = await prisma.autoRule.findMany({
      where: {
        clientId: thread.clientId,
        enabled: true,
        // Match rules that are either:
        // - Specific to this property, OR
        // - Property-wide (propertyId is null)
        OR: [
          { propertyId: thread.propertyId } as any,
          { propertyId: null } as any,
        ],
      },
    });

    const results: RuleEvaluationResult[] = [];

    for (const rule of rules) {
      // Check if rule intent matches
      const intentMatch = !rule.intent || rule.intent === intent;
      // Check if message risk is at or below rule's max risk
      const riskMatch = !rule.riskMax || isRiskLevelMatch(risk, rule.riskMax);

      if (intentMatch && riskMatch) {
        // Execute rule action
        if (rule.action === 'queue') {
          // Create approval request to flag for staff review
          await prisma.approvalRequest.create({
            data: {
              messageId,
              status: 'pending',
              notes: `Auto-flagged by rule: ${rule.intent || 'any intent'} (Property: ${thread.propertyId ? 'scoped' : 'client-wide'})`,
            },
          });
        } else if (rule.action === 'template' || rule.action === 'auto_send') {
          // Create approval request with suggested template
          const templateId = rule.conditions && typeof rule.conditions === 'object' 
            ? (rule.conditions as any).templateId 
            : undefined;
          
          await prisma.approvalRequest.create({
            data: {
              messageId,
              status: 'pending',
              notes: templateId 
                ? `Suggested template: ${templateId}` 
                : `Rule triggered (${rule.action})`,
            },
          });
        }

        results.push({
          ruleId: rule.id,
          matched: true,
          action: rule.action,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error evaluating rules:', error);
    return [];
  }
}

/**
 * Check if a message risk level matches a rule's max risk level
 * Returns true if message risk is at or below the rule's max risk
 * Example: if rule.riskMax='high', it matches messages with risk 'low', 'medium', 'high'
 */
function isRiskLevelMatch(messageRisk: string, ruleMaxRisk: string): boolean {
  const riskLevels = ['low', 'medium', 'high', 'critical'];
  const messageRiskIndex = riskLevels.indexOf(messageRisk.toLowerCase());
  const ruleMaxRiskIndex = riskLevels.indexOf(ruleMaxRisk.toLowerCase());

  if (messageRiskIndex === -1 || ruleMaxRiskIndex === -1) {
    return false; // Invalid risk level
  }

  return messageRiskIndex <= ruleMaxRiskIndex;
}
