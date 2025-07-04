import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path if needed
import { Decimal } from "@prisma/client/runtime/library"; // required for Decimal type
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(req) {
  try {
    const body = await req.json();
    const { userId, tableId, roomId, items, total, status } = body;

    // --- Input Validation ---
    if (!Array.isArray(items) || items.length === 0 || total === undefined || total === null) {
      return NextResponse.json({ error: "Invalid order data: items array cannot be empty and total is required." }, { status: 400 });
    }

    if (tableId) {
      // Optional: Verify if the table exists before proceeding
      const existingTable = await prisma.table.findUnique({
        where: { id: tableId },
      });

      if (!existingTable) {
        return NextResponse.json({ error: `Table with ID ${tableId} not found.` }, { status: 404 });
      }

      // Find an active order for this table (not cancelled or paid)
      const activeOrder = await prisma.order.findFirst({
        where: {
          tableId,
          status: { in: ["PENDING", "IN_PROGRESS", "SERVED"] },
        },
        include: { items: true },
      });

      if (activeOrder) {
        // Check for existing items and update quantities, or create new items
        for (const newItem of items) {
          const existingItem = await prisma.orderItem.findFirst({
            where: {
              orderId: activeOrder.id,
              menuItemId: newItem.menuItemId
            }
          });

          if (existingItem) {
            // Update existing item quantity and price
            await prisma.orderItem.update({
              where: { id: existingItem.id },
              data: {
                quantity: existingItem.quantity + newItem.quantity,
                price: new Decimal(existingItem.price).plus(new Decimal(newItem.price))
              }
            });
          } else {
            // Create new item
            await prisma.orderItem.create({
              data: {
                orderId: activeOrder.id,
                menuItemId: newItem.menuItemId,
                quantity: newItem.quantity,
                price: new Decimal(newItem.price)
              }
            });
          }
        }

        // Recalculate order total from all order items
        const allOrderItems = await prisma.orderItem.findMany({
          where: { orderId: activeOrder.id }
        });
        const recalculatedTotal = allOrderItems.reduce((sum, item) => sum.plus(new Decimal(item.price)), new Decimal(0));

        const updatedOrder = await prisma.order.update({
          where: { id: activeOrder.id },
          data: {
            total: recalculatedTotal
          },
          include: { items: true }
        });
        return NextResponse.json(updatedOrder, { status: 200 });
      } else {
        // No active order, create a new one
        const order = await prisma.order.create({
          data: {
            userId,
            tableId,
            roomId,
            status: status || "PENDING",
            total: new Decimal(total),
            items: {
              create: items.map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: new Decimal(item.price),
              })),
            },
          },
          include: {
            items: true,
          },
        });
        // Update table status to OCCUPIED
        await prisma.table.update({
          where: { id: tableId },
          data: { status: "OCCUPIED" },
        });
        return NextResponse.json(order, { status: 201 });
      }
    }

    // Optional: Prevent order if table is already occupied (depending on business logic)
    // Check if the table status is already OCCUPIED or RESERVED
    if (existingTable.status === "OCCUPIED" || existingTable.status === "RESERVED") {
      // Warning about table status handled with response
      // Uncomment the line below if you want to prevent placing an order on an already occupied/reserved table
      // return NextResponse.json({ error: `Table ${tableId} is already ${existingTable.status}.` }, { status: 409 });
    }
  } catch (error) {
    // Error handled with response

    // Differentiate error messages for better debugging
    if (error.code === 'P2002') { // Prisma unique constraint violation code
      return NextResponse.json({ error: "Duplicate entry or constraint violation." }, { status: 409 });
    }
    // Catch other specific Prisma errors if needed
    // if (error instanceof PrismaClientKnownRequestError) { ... }

    return NextResponse.json({ error: "Something went wrong during order processing." }, { status: 500 });
  }
}

export const POST = withRoleCheck(handler, ['ADMIN', 'MANAGER', 'WAITER']);