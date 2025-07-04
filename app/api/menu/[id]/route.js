import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust path if your prisma.js is elsewhere
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(req, context) {
    // Correct way: context.params is already an object, no need to await it.
    const id = context.params.id;

    if (!id) {
        return NextResponse.json({ error: "Menu item ID is required" }, { status: 400 });
    }

    try {
        const menu = await prisma.menuItem.findUnique({ where: { id: id } });

        if (!menu) {
            return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
        }
        return NextResponse.json({ menu }, { status: 200 });
    } catch (error) {
        // Error handled with response
        return NextResponse.json(
            { error: "Something went wrong", details: error.message || error.toString() },
            { status: 500 }
        );
    }
}

export const GET = withRoleCheck(handler, ['admin', 'manager', 'waiter']);