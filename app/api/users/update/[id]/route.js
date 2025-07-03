import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function PATCH(request, context) {
  const { params } = context;
  const id = params.id; // ✅ Correct way to access dynamic param

  try {
    const body = await request.json();
    const { name, imageUrl, role } = body;

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const { sessionClaims } = await auth();
    const currentUserRole = sessionClaims?.metadata?.role || sessionClaims?.role;

    if (role && currentUserRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Only admins can update user roles' },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: id },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // ✅ Update user fields
    const updatedUser = await prisma.user.update({
      where: { clerkId: id },
      data: {
        name: name || existingUser.name,
        imageUrl: imageUrl || existingUser.imageUrl,
        role: role || existingUser.role, // ✅ Update role in DB too
      },
    });

    // ✅ Update Clerk user role metadata
    if (role) {
      try {
        await clerkClient.users.updateUser(id, {
          publicMetadata: {
            role,
          },
        });
      } catch (clerkError) {
        console.error('Error updating Clerk role:', clerkError);
        return NextResponse.json(
          {
            message: 'Failed to update role in Clerk',
            error: clerkError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ...updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Failed to update user', error: error.message },
      { status: 500 }
    );
  }
}
