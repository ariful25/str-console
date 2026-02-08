import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestRules() {
  console.log('🎯 Creating property-specific test rules...\n');

  try {
    // Get the client and properties
    const client = await prisma.client.findFirst({
      select: { id: true, name: true },
    });

    if (!client) {
      console.error('❌ No client found. Run seed script first.');
      process.exit(1);
    }

    console.log(`📋 Found client: ${client.name} (${client.id})\n`);

    const properties = await prisma.property.findMany({
      where: { clientId: client.id },
      select: { id: true, name: true, address: true },
    });

    console.log(`🏠 Found ${properties.length} properties:\n`);
    properties.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ${p.address}`);
    });
    console.log('');

    // Find Beach House and City Loft
    const beachHouse = properties.find(p => p.name === 'Beach House');
    const cityLoft = properties.find(p => p.name === 'City Loft');

    if (!beachHouse || !cityLoft) {
      console.error('❌ Could not find Beach House or City Loft');
      process.exit(1);
    }

    // Delete existing test rules to avoid duplicates
    await prisma.autoRule.deleteMany({
      where: { clientId: client.id },
    });
    console.log('🧹 Cleaned up existing rules\n');

    // RULE 1: Beach House - Auto-Queue Checkin Questions
    const rule1 = await prisma.autoRule.create({
      data: {
        clientId: client.id,
        propertyId: beachHouse.id,
        intent: 'checkin',
        riskMax: 'low',
        action: 'queue',
        enabled: true,
      },
    });
    console.log('✅ Created Rule 1:');
    console.log(`   Property: Beach House`);
    console.log(`   Trigger: Checkin questions`);
    console.log(`   Action: Queue for review`);
    console.log(`   Risk: Low\n`);

    // RULE 2: Beach House - Auto-Queue Complaints
    const rule2 = await prisma.autoRule.create({
      data: {
        clientId: client.id,
        propertyId: beachHouse.id,
        intent: 'complaint',
        riskMax: 'high',
        action: 'queue',
        enabled: true,
      },
    });
    console.log('✅ Created Rule 2:');
    console.log(`   Property: Beach House`);
    console.log(`   Trigger: Complaints`);
    console.log(`   Action: Queue for review`);
    console.log(`   Risk: High\n`);

    // RULE 3: City Loft - Auto-Queue All Questions
    const rule3 = await prisma.autoRule.create({
      data: {
        clientId: client.id,
        propertyId: cityLoft.id,
        intent: 'question',
        riskMax: 'medium',
        action: 'queue',
        enabled: true,
      },
    });
    console.log('✅ Created Rule 3:');
    console.log(`   Property: City Loft`);
    console.log(`   Trigger: Questions`);
    console.log(`   Action: Queue for review`);
    console.log(`   Risk: Medium\n`);

    // RULE 4: Client-Wide - Auto-Queue Cancellations
    const rule4 = await prisma.autoRule.create({
      data: {
        clientId: client.id,
        propertyId: null, // Client-wide!
        intent: 'cancellation',
        riskMax: 'critical',
        action: 'queue',
        enabled: true,
      },
    });
    console.log('✅ Created Rule 4:');
    console.log(`   Property: ALL PROPERTIES (Client-Wide)`);
    console.log(`   Trigger: Cancellation requests`);
    console.log(`   Action: Queue for review`);
    console.log(`   Risk: Critical\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Test rules created successfully!\n');
    console.log('📊 Summary:');
    console.log(`  • Beach House: 2 rules`);
    console.log(`  • City Loft: 1 rule`);
    console.log(`  • Client-Wide: 1 rule`);
    console.log(`  • Total: 4 rules`);
    console.log('\n🚀 Now visit:');
    console.log(`  http://localhost:3000/auto-rules?clientId=${client.id}`);
    console.log('\n✅ You should see all 4 rules with property badges');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Output the URL for easy access
    console.log(`🔗 Direct link:\n`);
    console.log(`   http://localhost:3000/auto-rules?clientId=${client.id}\n`);
  } catch (error) {
    console.error('❌ Error creating test rules:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestRules();
