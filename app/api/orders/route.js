import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
                room: true,
                table: true,
                user: true,
            },
            take: 10,
            skip: 0,
            orderBy: { createdAt: 'desc' },
        });


        return NextResponse.json(orders, { status: 200 });
    } catch (error) {
        // Error handled with response

        return NextResponse.json(
            { error: "Failed to fetch orders", details: error.message },
            { status: 500 }
        );
    }
}

export const GET = withRoleCheck(handler, ['ADMIN', 'MANAGER']);