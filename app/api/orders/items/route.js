import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(request) {
    const orderId = request.nextUrl.searchParams.get('orderId');

    if (!orderId) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
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
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order', details: error.message || error.toString() }, { status: 500 });
    }
}

export const GET = withRoleCheck(handler, ['ADMIN', 'MANAGER', 'WAITER']);