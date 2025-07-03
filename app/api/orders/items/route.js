import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
    const orderId = params.orderId;

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