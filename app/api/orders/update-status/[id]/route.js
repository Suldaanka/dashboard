import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/orders/update-status/:id
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const { status } = await req.json();

    const validStatuses = [
      "PENDING",
      "IN_PROGRESS",
      "SERVED",
      "CANCELLED",
      "IS_PAYED"
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { table: true, payment: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Handle side effects when paid
    if (status === "IS_PAYED") {
      const updates = [];

      if (existingOrder.tableId) {
        updates.push(
          prisma.table.update({
            where: { id: existingOrder.tableId },
            data: { status: "AVAILABLE" },
          })
        );
      }

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

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status", message: error.message },
      { status: 500 }
    );
  }
}
