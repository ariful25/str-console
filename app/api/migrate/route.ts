import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Add propertyId column to AutoRule table
    await prisma.$executeRaw`
      ALTER TABLE "AutoRule" 
      ADD COLUMN IF NOT EXISTS "propertyId" TEXT;
    `;

    // Create index on propertyId
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AutoRule_propertyId_idx" 
      ON "AutoRule"("propertyId");
    `;

    // Create index on intent
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AutoRule_intent_idx" 
      ON "AutoRule"("intent");
    `;

    return NextResponse.json({
      success: true,
      message: 'Database schema updated successfully! propertyId column added to AutoRule table.',
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
