// /api/orders/[id]/items/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(req, context) {
  const { id } = await context.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        table: true,
        room: true,
        user: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch order", details: error.message }, { status: 500 });
  }
}

export const GET = withRoleCheck(handler, ['ADMIN', 'MANAGER', 'WAITER']);
