import { NextResponse } from 'next/server';
import { hasPagePermission, getPermissionsForRole, pagePathMap } from '@/utils/permissions';

export async function POST(req) {
  try {
    const { type, userRole, pathname } = await req.json();

    if (type === 'hasPagePermission') {
      const hasPermission = await hasPagePermission(userRole, pathname);
      return NextResponse.json({ hasPermission });
    } else if (type === 'getPermissionsForRole') {
      const permissions = await getPermissionsForRole(userRole);
      return NextResponse.json({ permissions });
    } else {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}