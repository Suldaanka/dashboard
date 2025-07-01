import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"; // Adjust path if your prisma.js is elsewhere


export async function PATCH(request, context) {
    const id = await context.params.id; // Correct way to access dynamic params in App Router

  try {
    const body = await request.json();
    const { name, imageUrl } = body;

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: id },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId: id },
      data: {
        name: name || existingUser.name,
        imageUrl: imageUrl || existingUser.imageUrl,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    // Error handled with response
    return NextResponse.json({ message: 'Failed to update user', error: error.message }, { status: 500 });
  }
}