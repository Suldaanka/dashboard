// /app/api/users/me/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    // Get authentication data from Clerk
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      console.error('No userId found in auth');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching user data for userId:', userId);
    console.log('Session claims:', sessionClaims);

    // Try to get user role from multiple sources
    let userRole = null;

    // Method 1: From session claims (if stored there)
    userRole = sessionClaims?.metadata?.role || 
               sessionClaims?.role || 
               sessionClaims?.publicMetadata?.role ||
               sessionClaims?.privateMetadata?.role;

    // Method 2: From database (if you store user data in your database)
    if (!userRole) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { clerkId: userId },
          select: { role: true, name: true, email: true }
        });
        
        if (dbUser) {
          userRole = dbUser.role;
          console.log('Found user role from database:', userRole);
        }
      } catch (dbError) {
        console.warn('Database user lookup failed:', dbError.message);
        // Continue with fallback
      }
    }

    // Method 3: Fallback to default role
    if (!userRole) {
      userRole = 'WAITER'; // Default role
      console.warn(`No role found for user ${userId}, using default: ${userRole}`);
    }

    console.log(`Final user role for ${userId}: ${userRole}`);
    
    // Return user data including role
    return NextResponse.json({
      id: userId,
      role: userRole,
      sessionClaims: sessionClaims, // Include for debugging (remove in production)
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` }, 
      { status: 500 }
    );
  }
}

// Optional: Update user role (for admin functionality)
export async function PATCH(req) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin privileges
    const currentRole = sessionClaims?.metadata?.role || 
                       sessionClaims?.role || 
                       'waiter';

    if (currentRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' }, 
        { status: 403 }
      );
    }

    const body = await req.json();
    const { role, targetUserId } = body;

    if (!role || !targetUserId) {
      return NextResponse.json(
        { error: 'Role and target user ID are required' },
        { status: 400 }
      );
    }

    // Update user role in database
    try {
      const updatedUser = await prisma.user.update({
        where: { clerkId: targetUserId },
        data: { role: role },
        select: { clerkId: true, role: true, name: true, email: true }
      });

      console.log(`Updated user ${targetUserId} role to ${role}`);

      return NextResponse.json({
        success: true,
        user: updatedUser,
        timestamp: new Date().toISOString()
      });

    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to update user role in database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}