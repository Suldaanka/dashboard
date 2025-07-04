import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

import prisma from '@/lib/prisma'; // Assuming prisma is exported from here

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export async function getUserRole(userId, sessionClaims) {
  let userRole = null;

  // Method 1: From session claims (if stored there)
  userRole = sessionClaims?.metadata?.role || 
             sessionClaims?.role || 
             sessionClaims?.publicMetadata?.role ||
             sessionClaims?.privateMetadata?.role;

  // Method 2: From database (if you store user data in your database)
  if (!userRole && prisma) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true }
      });
      
      if (dbUser) {
        userRole = dbUser.role;
        console.log('Found user role from database in getUserRole:', userRole);
      }
    } catch (dbError) {
      console.warn('Database user lookup failed in getUserRole:', dbError.message);
      // Continue with fallback
    }
  }

  // Method 3: Fallback to default role
  if (!userRole) {
    userRole = 'waiter'; // Default role
    console.warn(`No role found for user ${userId} in getUserRole, using default: ${userRole}`);
  }

  return userRole;
}
