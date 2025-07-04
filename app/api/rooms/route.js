import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler() {
    try {
        await prisma.$connect();
        const rooms = await prisma.room.findMany();

        return NextResponse.json(rooms , { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }finally{
        prisma.$disconnect();
    }
}

export const GET = withRoleCheck(handler, ['ADMIN', 'MANAGER', 'WAITER']);