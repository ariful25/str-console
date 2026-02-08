import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { prisma } from '../lib/prisma';

const guestMessages = [
  'Hi, I noticed the wifi password changed. Can you provide the new one?',
  'There seems to be an issue with the shower. The water temperature is not regulating properly.',
  'We would like an early check-in if possible. Is that available?',
  'The air conditioning is not working in the master bedroom.',
  'Can we extend our stay for 2 more days?',
  'There is a strange noise coming from the living room. Can you check?',
];

const suggestedReplies = [
  'Thank you for reaching out. I will send you the WiFi password via email shortly.',
  'I apologize for the inconvenience. A technician will visit tomorrow at 10 AM to fix the shower.',
  'Early check-in is available from 2 PM today. Please let us know when you arrive.',
  'We are sorry to hear that. Our maintenance team will be there within 2 hours.',
  'Extension request approved! Your new checkout date is updated in the system.',
  'Thank you for reporting this. We will investigate immediately.',
];

const templateTexts = [
  'Thank you for reaching out. We will address this shortly. Please expect a response within 2-4 hours.',
  'We appreciate you bringing this to our attention. Our team is investigating and will update you soon.',
  'Your request has been noted. We will confirm availability and get back to you within 1 hour.',
  'We apologize for any inconvenience. Our maintenance team has been notified and will contact you shortly.',
];

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Create a test client
    let client = await prisma.client.findFirst({
      where: { name: 'Sunset Properties Group' },
    });
    
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: 'Sunset Properties Group',
        },
      });
    }
    console.log('✓ Created client:', client.name);

    // 2. Create a test user
    const user = await prisma.user.upsert({
      where: { clerkId: 'test-user-001' },
      update: {},
      create: {
        clerkId: 'test-user-001',
        email: 'manager@sunsetproperties.com',
        name: 'Sarah Johnson',
        role: 'manager',
      },
    });
    console.log('✓ Created user:', user.name);

    // 3. Create PMS account
    let pmsAccount = await prisma.pmsAccount.findFirst({
      where: { externalId: 'hostaway-test-001' },
    });
    
    if (!pmsAccount) {
      pmsAccount = await prisma.pmsAccount.create({
        data: {
          clientId: client.id,
          name: 'Hostaway Account',
          type: 'HOSTAWAY',
          externalId: 'hostaway-test-001',
          apiKey: 'test-api-key-123',
        },
      });
    }
    console.log('✓ Created PMS account:', pmsAccount.name);

    // 4. Create test properties
    let property1 = await prisma.property.findFirst({
      where: { listingMapId: 'test-beach-villa-001' },
    });

    if (!property1) {
      property1 = await prisma.property.create({
        data: {
          clientId: client.id,
          pmsAccountId: pmsAccount.id,
          listingMapId: 'test-beach-villa-001',
          name: 'Sunset Beach Villa',
          address: '123 Ocean Drive, Malibu, CA 90265',
          timezone: 'America/Los_Angeles',
        },
      });
    }
    console.log('✓ Created property 1:', property1.name);

    let property2 = await prisma.property.findFirst({
      where: { listingMapId: 'test-mountain-cabin-001' },
    });

    if (!property2) {
      property2 = await prisma.property.create({
        data: {
          clientId: client.id,
          pmsAccountId: pmsAccount.id,
          listingMapId: 'test-mountain-cabin-001',
          name: 'Alpine Mountain Retreat',
          address: '456 Pine Ridge Lane, Aspen, CO 81611',
          timezone: 'America/Denver',
        },
      });
    }
    console.log('✓ Created property 2:', property2.name);

    // 5. Create templates
    const templates = await Promise.all(
      templateTexts.map(async (text, index) => {
        const label = `template-${index + 1}`;
        const existing = await prisma.template.findFirst({
          where: { label, clientId: client.id },
        });

        if (existing) {
          return existing;
        }

        return prisma.template.create({
          data: {
            clientId: client.id,
            intent: ['maintenance', 'booking', 'amenity', 'general'][index],
            label,
            text: text,
            isActive: true,
          },
        });
      })
    );
    console.log(`✓ Created ${templates.length} templates`);

    // 6. Create auto rules
    const rule1 = await prisma.autoRule.upsert({
      where: { id: 'rule-maintenance-001' },
      update: {},
      create: {
        id: 'rule-maintenance-001',
        clientId: client.id,
        propertyId: property1.id,
        intent: 'maintenance',
        riskMax: 'high',
        action: 'queue',
        enabled: true,
        conditions: {
          template: templates[0].id,
        },
      },
    });
    console.log('✓ Created auto rule 1:', rule1.id);

    const rule2 = await prisma.autoRule.upsert({
      where: { id: 'rule-booking-001' },
      update: {},
      create: {
        id: 'rule-booking-001',
        clientId: client.id,
        intent: 'booking',
        riskMax: 'low',
        action: 'auto_send',
        enabled: true,
        conditions: {
          template: templates[2].id,
        },
      },
    });
    console.log('✓ Created auto rule 2:', rule2.id);

    // 7. Create threads and messages
    const threads = [];
    const guestNames = ['Alice Chen', 'Robert Martinez', 'Emma Thompson'];
    const guestEmails = [
      'alice@example.com',
      'robert@example.com',
      'emma@example.com',
    ];

    for (let i = 0; i < 3; i++) {
      const thread = await prisma.thread.upsert({
        where: { id: `thread-test-${i + 1}` },
        update: {},
        create: {
          id: `thread-test-${i + 1}`,
          clientId: client.id,
          propertyId: i < 2 ? property1.id : property2.id,
          guestName: guestNames[i],
          guestEmail: guestEmails[i],
          status: 'pending',
        },
      });
      threads.push(thread);
      console.log(`✓ Created thread ${i + 1}:`, thread.guestName);
    }

    // 8. Create messages and analyses
    const analyses = [];
    for (let i = 0; i < threads.length; i++) {
      const messageIndex = i % guestMessages.length;
      const message = await prisma.message.upsert({
        where: { id: `message-test-${i + 1}` },
        update: {},
        create: {
          id: `message-test-${i + 1}`,
          threadId: threads[i].id,
          senderType: 'guest',
          text: guestMessages[messageIndex],
        },
      });
      console.log(`✓ Created message ${i + 1}`);

      // Create analysis
      const riskLevels = ['low', 'medium', 'high'];
      const intents = ['maintenance', 'booking', 'amenity'];
      const urgencyLevels = ['normal', 'urgent', 'critical'];

      const analysis = await prisma.analysis.upsert({
        where: { messageId: message.id },
        update: {},
        create: {
          messageId: message.id,
          threadId: threads[i].id,
          intent: intents[i % intents.length],
          risk: riskLevels[i % riskLevels.length],
          urgency: urgencyLevels[i % urgencyLevels.length],
          threadSummary: `Guest ${threads[i].guestName} reported an issue. Response needed within 24 hours.`,
          suggestedReply: suggestedReplies[messageIndex],
        },
      });
      analyses.push(analysis);
      console.log(`✓ Created analysis for message ${i + 1}`);
    }

    // 9. Create approval requests in different states
    const approvals = [];

    // Pending approval
    const pendingApproval = await prisma.approvalRequest.upsert({
      where: { messageId: `message-test-1` },
      update: {},
      create: {
        messageId: `message-test-1`,
        status: 'pending',
      },
    });
    approvals.push(pendingApproval);
    console.log('✓ Created pending approval');

    // Approved approval
    const approvedApproval = await prisma.approvalRequest.upsert({
      where: { messageId: `message-test-2` },
      update: {},
      create: {
        messageId: `message-test-2`,
        status: 'approved',
        reviewerId: user.id,
        notes: 'Approved with suggested template response',
      },
    });
    approvals.push(approvedApproval);
    console.log('✓ Created approved approval');

    // Rejected approval
    const rejectedApproval = await prisma.approvalRequest.upsert({
      where: { messageId: `message-test-3` },
      update: {},
      create: {
        messageId: `message-test-3`,
        status: 'rejected',
        reviewerId: user.id,
        notes: 'Needs revision - response too informal',
      },
    });
    approvals.push(rejectedApproval);
    console.log('✓ Created rejected approval');

    // 10. Create send logs
    const sendLog = await prisma.sendLog.upsert({
      where: { id: 'sendlog-test-001' },
      update: {},
      create: {
        id: 'sendlog-test-001',
        messageId: `message-test-2`,
        threadId: threads[1].id,
        finalReply: suggestedReplies[1],
        channel: 'pms',
        sentByUserId: user.id,
        providerResponse: {
          success: true,
          sentAt: new Date().toISOString(),
          externalId: 'ext-msg-12345',
        },
      },
    });
    console.log('✓ Created send log');

    // 11. Create KB entries
    const kbEntry = await prisma.kbEntry.upsert({
      where: { id: 'kb-wifi-001' },
      update: {},
      create: {
        id: 'kb-wifi-001',
        clientId: client.id,
        propertyId: property1.id,
        title: 'WiFi Connectivity Guide',
        content:
          'Here is how to connect to the WiFi at Sunset Beach Villa. Network Name: SunsetGuest. Password: BeachLife2024. If you experience issues, restart your device and try again.',
        tags: ['wifi', 'connectivity', 'technical'],
        sources: {
          create: [
            {
              type: 'manual',
              ref: 'host-docs',
              meta: {
                createdBy: 'manager',
                version: 1,
              },
            },
          ],
        },
      },
    });
    console.log('✓ Created KB entry');

    // 12. Create audit logs
    const existingAuditLog1 = await prisma.auditLog.findFirst({
      where: {
        action: 'message_created',
        entityType: 'message',
        entityId: `message-test-1`,
      },
    });

    if (!existingAuditLog1) {
      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: 'message_created',
          entityType: 'message',
          entityId: `message-test-1`,
          meta: {
            guestName: guestNames[0],
            threadId: threads[0].id,
          },
        },
      });
      console.log('✓ Created audit log 1');
    }

    const existingAuditLog2 = await prisma.auditLog.findFirst({
      where: {
        action: 'message_approved_and_sent',
        entityType: 'approval',
        entityId: approvedApproval.id,
      },
    });

    if (!existingAuditLog2) {
      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: 'message_approved_and_sent',
          entityType: 'approval',
          entityId: approvedApproval.id,
          meta: {
            messageId: `message-test-2`,
            threadId: threads[1].id,
            reply: suggestedReplies[1].substring(0, 100),
          },
        },
      });
      console.log('✓ Created audit log 2');
    }

    const existingAuditLog3 = await prisma.auditLog.findFirst({
      where: {
        action: 'kb_entry_created',
        entityType: 'KbEntry',
        entityId: kbEntry.id,
      },
    });

    if (!existingAuditLog3) {
      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: 'kb_entry_created',
          entityType: 'KbEntry',
          entityId: kbEntry.id,
          meta: {
            title: kbEntry.title,
            tags: kbEntry.tags,
          },
        },
      });
      console.log('✓ Created audit log 3');
    }

    console.log('\n✅ Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Client: ${client.name}`);
    console.log(`   - Properties: ${[property1.name, property2.name].join(', ')}`);
    console.log(`   - Threads: ${threads.length}`);
    console.log(`   - Messages: ${threads.length}`);
    console.log(`   - Approvals: ${approvals.length} (Pending: 1, Approved: 1, Rejected: 1)`);
    console.log(`   - Templates: ${templates.length}`);
    console.log(`   - Auto Rules: 2`);
    console.log(`   - KB Entries: 1`);
    console.log(`   - Audit Logs: 3`);
    console.log('\n💡 Test user credentials:');
    console.log(`   - Clerk ID: ${user.clerkId}`);
    console.log(`   - Email: ${user.email}`);
  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
