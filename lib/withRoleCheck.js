import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserRole } from './utils'; // Assuming you'll add a helper to get the user's role

export function withRoleCheck(handler, requiredRoles = []) {
  return async (req, { params }) => {
    try {
      const { userId, sessionClaims } = await auth();

      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const userRole = await getUserRole(userId, sessionClaims); // Implement this helper

      if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // If role check passes, execute the original handler
      return handler(req, { params });
    } catch (error) {
      console.error('Error in role check middleware:', error);
      return NextResponse.json(
        { error: `Internal server error: ${error.message}` },
        { status: 500 }
      );
    }
  };
}