import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"; // Adjust path if your prisma.js is elsewhere
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(request, context) {
    // Next.js 15 requires asynchronous access to params
    // Next.js 15 requires asynchronous access to params
    const { id: userId } = await context.params;

    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        const User = await prisma.user.findUnique({ where: { clerkId: userId } });

        if (!User) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(User, { status: 200 });
    } catch (error) {
        // Error handled with response
        return NextResponse.json(
            { error: "Something went wrong", details: error.message || error.toString() },
            { status: 500 }
        );
    }
}

export const GET = withRoleCheck(handler, ['ADMIN', 'MANAGER', 'WAITER']);
