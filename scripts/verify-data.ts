import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { prisma } from '../lib/prisma';

async function verifyTestData() {
  console.log('🔍 Verifying test data in database...\n');

  try {
    // Check clients
    const clients = await prisma.client.count();
    console.log(`✓ Clients: ${clients}`);

    // Check users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, clerkId: true }
    });
    console.log(`✓ Users: ${users.length}`);
    users.forEach(u => console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`));

    // Check properties
    const properties = await prisma.property.findMany({
      select: { id: true, name: true, address: true }
    });
    console.log(`\n✓ Properties: ${properties.length}`);
    properties.forEach(p => console.log(`  - ${p.name}: ${p.address}`));

    // Check threads
    const threads = await prisma.thread.findMany({
      select: { 
        id: true, 
        guestName: true, 
        status: true,
        property: { select: { name: true } }
      }
    });
    console.log(`\n✓ Threads: ${threads.length}`);
    threads.forEach(t => console.log(`  - ${t.guestName} at ${t.property.name} (Status: ${t.status})`));

    // Check messages with analysis
    const messages = await prisma.message.findMany({
      include: {
        analysis: true,
        thread: { select: { guestName: true } }
      }
    });
    console.log(`\n✓ Messages: ${messages.length}`);
    messages.forEach(m => {
      console.log(`  - From ${m.thread.guestName}: "${m.text.substring(0, 50)}..."`);
      if (m.analysis) {
        console.log(`    Analysis: Intent=${m.analysis.intent}, Risk=${m.analysis.risk}, Urgency=${m.analysis.urgency}`);
      }
    });

    // Check approvals
    const approvals = await prisma.approvalRequest.findMany({
      include: {
        message: {
          include: {
            thread: { select: { guestName: true } },
            analysis: true
          }
        },
        reviewer: { select: { name: true } }
      }
    });
    console.log(`\n✓ Approvals: ${approvals.length}`);
    approvals.forEach(a => {
      console.log(`  - ${a.status.toUpperCase()}: ${a.message.thread.guestName}`);
      console.log(`    Message: "${a.message.text.substring(0, 50)}..."`);
      if (a.reviewer) {
        console.log(`    Reviewer: ${a.reviewer.name}`);
      }
      if (a.message.analysis?.suggestedReply) {
        console.log(`    Suggested Reply: "${a.message.analysis.suggestedReply.substring(0, 60)}..."`);
      }
    });

    // Check templates
    const templates = await prisma.template.count();
    console.log(`\n✓ Templates: ${templates}`);

    // Check auto rules
    const rules = await prisma.autoRule.findMany({
      select: { 
        id: true, 
        intent: true, 
        action: true, 
        enabled: true,
        property: { select: { name: true } }
      }
    });
    console.log(`✓ Auto Rules: ${rules.length}`);
    rules.forEach(r => {
      const scope = r.property ? `Property: ${r.property.name}` : 'Client-wide';
      console.log(`  - ${r.intent} → ${r.action} (${scope}, Enabled: ${r.enabled})`);
    });

    // Check send logs
    const sendLogs = await prisma.sendLog.count();
    console.log(`\n✓ Send Logs: ${sendLogs}`);

    // Check KB entries
    const kbEntries = await prisma.kbEntry.findMany({
      select: { 
        id: true, 
        title: true, 
        tags: true,
        sources: { select: { type: true } }
      }
    });
    console.log(`✓ KB Entries: ${kbEntries.length}`);
    kbEntries.forEach(kb => {
      console.log(`  - ${kb.title}`);
      console.log(`    Tags: ${kb.tags.join(', ')}`);
      console.log(`    Sources: ${kb.sources.length}`);
    });

    // Check audit logs
    const auditLogs = await prisma.auditLog.findMany({
      select: {
        action: true,
        entityType: true,
        createdAt: true,
        actor: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log(`\n✓ Audit Logs: Recent 5 entries`);
    auditLogs.forEach(log => {
      const actor = log.actor?.name || 'System';
      console.log(`  - ${log.action} on ${log.entityType} by ${actor}`);
    });

    console.log('\n✅ Test data verification complete!');
    console.log('\n📋 Summary:');
    console.log(`   Total Clients: ${clients}`);
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Total Properties: ${properties.length}`);
    console.log(`   Total Threads: ${threads.length}`);
    console.log(`   Total Messages: ${messages.length}`);
    console.log(`   Total Approvals: ${approvals.length}`);
    console.log(`   Total Templates: ${templates}`);
    console.log(`   Total Auto Rules: ${rules.length}`);
    console.log(`   Total Send Logs: ${sendLogs}`);
    console.log(`   Total KB Entries: ${kbEntries.length}`);
    
    // Approval breakdown
    const pendingCount = approvals.filter(a => a.status === 'pending').length;
    const approvedCount = approvals.filter(a => a.status === 'approved').length;
    const rejectedCount = approvals.filter(a => a.status === 'rejected').length;
    console.log(`\n📊 Approval Breakdown:`);
    console.log(`   Pending: ${pendingCount}`);
    console.log(`   Approved: ${approvedCount}`);
    console.log(`   Rejected: ${rejectedCount}`);

  } catch (error) {
    console.error('❌ Error verifying test data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTestData();
