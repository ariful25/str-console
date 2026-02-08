const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample data
const PROPERTIES = [
  { name: 'Sunset Villa', address: '123 Ocean Drive, Miami, FL' },
  { name: 'Beach House', address: '456 Sandy Lane, Key West, FL' },
  { name: 'Mountain Retreat', address: '789 Peak Road, Aspen, CO' },
  { name: 'City Loft', address: '321 Urban Ave, New York, NY' },
  { name: 'Desert Oasis', address: '555 Cactus Drive, Scottsdale, AZ' },
];

const GUESTS = [
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Smith', email: 'jane@example.com' },
  { name: 'Robert Johnson', email: 'robert@example.com' },
  { name: 'Emily Williams', email: 'emily@example.com' },
  { name: 'Michael Brown', email: 'michael@example.com' },
  { name: 'Sarah Davis', email: 'sarah@example.com' },
];

const SAMPLE_MESSAGES = [
  'What is the check-in time?',
  'Is there parking available?',
  'Can we have early check-in?',
  'How do we access the WiFi?',
  'Where are the keys?',
  'Is there a washer/dryer in the unit?',
  'Can I bring my pet?',
  'What is your cancellation policy?',
  'Need to change my arrival date',
  'The air conditioning is not working',
  'This place is amazing! Thank you!',
  'Can you recommend nearby restaurants?',
  'How do I turn on the hot tub?',
  'When is checkout?',
  'Is there a gym nearby?',
];

const USERS = [
  { clerkId: 'user_admin_001', email: 'admin@example.com', name: 'Admin User', role: 'admin' },
  { clerkId: 'user_manager_001', email: 'manager@example.com', name: 'Manager User', role: 'manager' },
  { clerkId: 'user_staff_001', email: 'staff@example.com', name: 'Staff Member 1', role: 'staff' },
  { clerkId: 'user_staff_002', email: 'staff2@example.com', name: 'Staff Member 2', role: 'staff' },
];

const TEMPLATES = [
  {
    name: 'Welcome & Check-in Info',
    category: 'greeting',
    triggerIntent: 'checkin',
    content: 'Hi {guestName}! Welcome to {propertyName}. Your check-in time is 3:00 PM. Please find your keys in the lockbox near the front door. The WiFi password is "VacationRental2024". If you need anything, please don\'t hesitate to reach out!',
  },
  {
    name: 'WiFi Password',
    category: 'amenity',
    triggerIntent: 'question',
    content: 'Hi {guestName}! The WiFi password for {propertyName} is "VacationRental2024". If you\'re still having trouble connecting, please restart your router and try again.',
  },
  {
    name: 'Check-out Reminder',
    category: 'checkout',
    triggerIntent: 'checkout',
    content: 'Hi {guestName}! We hope you enjoyed your stay at {propertyName}. Please remember to check out by 11:00 AM. Please leave the keys in the lockbox and ensure all doors are locked. Thank you!',
  },
  {
    name: 'Complaint Resolution',
    category: 'complaint',
    triggerIntent: 'complaint',
    content: 'Hi {guestName}! We\'re sorry to hear about the issue at {propertyName}. We take your feedback seriously and would like to make it right. Please let us know how we can help improve your experience. We\'re happy to provide a discount on your next stay.',
  },
  {
    name: 'Parking Information',
    category: 'amenity',
    triggerIntent: null,
    content: 'Hi {guestName}! Parking at {propertyName} is available in the driveway (fits 2 cars). There is also street parking available in front of the property. Please note that parking permit may be required on weekdays.',
  },
  {
    name: 'Cancellation Policy',
    category: 'cancellation',
    triggerIntent: 'cancellation',
    content: 'Hi {guestName}! Thank you for letting us know about your cancellation. Per our cancellation policy, you are eligible for a full refund. We will process this within 3-5 business days. We hope to host you again in the future!',
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Create test users
    console.log('👥 Creating users...');
    const users = await Promise.all(
      USERS.map(user =>
        prisma.user.create({
          data: {
            clerkId: user.clerkId,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        })
      )
    );
    console.log(`✅ Created ${users.length} users\n`);

    // Create a sample client
    console.log('📋 Creating client...');
    const client = await prisma.client.create({
      data: {
        name: 'Vacation Rentals Inc',
      },
    });
    console.log(`✅ Client created: ${client.name}\n`);

    // Create properties
    console.log('🏠 Creating PMS account...');
    const pmsAccount = await prisma.pmsAccount.create({
      data: {
        clientId: client.id,
        name: 'Hostaway Integration',
        type: 'HOSTAWAY',
        externalId: 'ext-001',
        apiKey: 'test-api-key',
      },
    });
    console.log(`✅ PMS account created\n`);

    console.log('📝 Creating templates...');
    const templates = await Promise.all(
      TEMPLATES.map(template =>
        prisma.template.create({
          data: {
            clientId: client.id,
            name: template.name,
            category: template.category,
            triggerIntent: template.triggerIntent,
            content: template.content,
          },
        })
      )
    );
    console.log(`✅ Created ${templates.length} templates\n`);

    console.log('🏠 Creating properties...');
    const properties = await Promise.all(
      PROPERTIES.map(prop =>
        prisma.property.create({
          data: {
            clientId: client.id,
            pmsAccountId: pmsAccount.id,
            listingMapId: `LIST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            name: prop.name,
            address: prop.address,
            timezone: 'America/New_York',
          },
        })
      )
    );
    console.log(`✅ Created ${properties.length} properties\n`);

    // Create threads with messages
    console.log('💬 Creating threads and messages...');
    let threadCount = 0;
    let messageCount = 0;

    for (let i = 0; i < 3; i++) {
      const property = properties[i];
      const guest = GUESTS[i];

      // Create thread
      const thread = await prisma.thread.create({
        data: {
          clientId: client.id,
          propertyId: property.id,
          guestName: guest.name,
          guestEmail: guest.email,
          status: i === 0 ? 'pending' : i === 1 ? 'open' : 'resolved',
          lastReceivedAt: new Date(),
        },
      });
      threadCount++;

      // Create 3-5 messages per thread
      const messageCount_ = Math.floor(Math.random() * 3) + 3;
      for (let j = 0; j < messageCount_; j++) {
        const senderType = j % 2 === 0 ? 'guest' : 'staff';
        const messageText =
          senderType === 'guest'
            ? SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)]
            : `I'll help you with that! Please let me know if you need anything else.`;

        const message = await prisma.message.create({
          data: {
            threadId: thread.id,
            senderType,
            text: messageText,
            receivedAt: new Date(Date.now() - Math.random() * 86400000),
          },
        });
        messageCount++;

        // Occasionally add analysis to guest messages
        if (senderType === 'guest' && Math.random() > 0.5) {
          await prisma.analysis.create({
            data: {
              messageId: message.id,
              threadId: thread.id,
              intent: ['checkin', 'complaint', 'amenity', 'cancellation'][
                Math.floor(Math.random() * 4)
              ],
              risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
              urgency: ['normal', 'high'][Math.floor(Math.random() * 2)],
              suggestedReply: 'This is a suggested reply based on AI analysis.',
            },
          });
        }
      }
    }
    console.log(`✅ Created ${threadCount} threads\n`);
    console.log(`✅ Created ${messageCount} messages\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  • Users: ${users.length}`);
    console.log(`  • Clients: 1`);
    console.log(`  • Properties: ${properties.length}`);
    console.log(`  • Threads: ${threadCount}`);
    console.log(`  • Messages: ${messageCount}`);
    console.log('\n👤 Test Users Created:');
    users.forEach(user => {
      console.log(`  • ${user.name} (${user.role}) - ${user.email}`);
    });
    console.log('\n🚀 You can now:');
    console.log('  1. Visit http://localhost:3004');
    console.log('  2. Sign in with your Clerk account');
    console.log('  3. Go to Users to manage team members');
    console.log('  4. Go to Inbox to see the test data');
    console.log('  5. Click on a thread to view messages');
    console.log('  6. Reply to messages to test the system');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedDatabase();
