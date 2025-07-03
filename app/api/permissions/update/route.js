import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  updateRolePermissions,
} from '@/utils/permissions';

export async function POST(request) {
  try {
    // Get and validate session
    const { sessionClaims } = await auth();
    const userRole = sessionClaims?.metadata?.role || sessionClaims?.role;

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can update permissions' }, { status: 403 });
    }

    // Get body
    const { permissions } = await request.json();

    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json({ error: 'Invalid permissions data' }, { status: 400 });
    }

    // Update permissions per role
    const results = {};

    for (const [role, rolePermissions] of Object.entries(permissions)) {
      const result = updateRolePermissions(role, rolePermissions); // no await needed
      results[role] = result;
    }

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
  }
}
