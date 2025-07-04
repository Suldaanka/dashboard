import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withRoleCheck } from '@/lib/withRoleCheck';

const prisma = new PrismaClient();

async function handler(request, context) {
  try {
    const { id } = context.params;
    const { status } = await request.json();

    const validStatuses = [
      "PENDING",
      "IN_PROGRESS",
      "SERVED",
      "CANCELLED",
      "IS_PAYED", // ✅ Allow this
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        payment: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // ✅ If status is IS_PAYED:
    if (status === "IS_PAYED") {
      const updates = [];

      // 1. Update table status to AVAILABLE
      if (existingOrder.tableId) {
        updates.push(
          prisma.table.update({
            where: { id: existingOrder.tableId },
            data: { status: "AVAILABLE" },
          })
        );
      }

      // 2. Update payment status to COMPLETED
      if (existingOrder.paymentId) {
        updates.push(
          prisma.payment.update({
            where: { id: existingOrder.paymentId },
            data: { status: "COMPLETED" },
          })
        );
      }

      await Promise.all(updates);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    // Error handled with response
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

export const PATCH = withRoleCheck(handler, ['admin', 'manager', 'waiter']);

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        Allow: "PATCH, OPTIONS",
      },
    }
  );
}
