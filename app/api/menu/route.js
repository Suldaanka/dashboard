import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler() {
    try {
        const menu = await prisma.menuItem.findMany();
        return NextResponse.json(menu, {status: 200});
    } catch (error) {
        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        );
    }
}

export const GET = withRoleCheck(handler, ['ADMIN', 'MANAGER', 'WAITER']);