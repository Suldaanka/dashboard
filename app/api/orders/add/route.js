import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path if needed
import { Decimal } from "@prisma/client/runtime/library"; // required for Decimal type

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, tableId, roomId, items, total, status } = body;

    console.log("Received request with body:", body);

    // --- Input Validation ---
    if (!Array.isArray(items) || items.length === 0 || total === undefined || total === null) {
      return NextResponse.json({ error: "Invalid order data: items array cannot be empty and total is required." }, { status: 400 });
    }

    // Ensure either tableId or roomId (but not both) is provided
    if (!tableId && !roomId) {
      return NextResponse.json({ error: "Order must be associated with either a table or a room." }, { status: 400 });
    }
    if (tableId && roomId) {
      // Depending on your business logic, you might allow this or not.
      // For now, let's assume an order is either for a table OR a room.
      return NextResponse.json({ error: "Order cannot be associated with both a table and a room simultaneously." }, { status: 400 });
    }

    let orderData = {
      userId,
      status: status || "PENDING",
      total: new Decimal(total),
    };

    let associatedEntityId = null; // To store the ID of the table or room
    let associatedEntityType = null; // To store 'table' or 'room'

    if (tableId) {
      associatedEntityId = tableId;
      associatedEntityType = 'table';
      orderData.tableId = tableId; // Add tableId to order data
      // Optional: Verify if the table exists before proceeding
      const existingTable = await prisma.table.findUnique({
        where: { id: tableId },
      });
      if (!existingTable) {
        return NextResponse.json({ error: `Table with ID ${tableId} not found.` }, { status: 404 });
      }
      // You had a check for OCCUPIED/RESERVED table status.
      // If you want to prevent new orders on such tables, uncomment this:
      /*
      if (existingTable.status === "OCCUPIED" || existingTable.status === "RESERVED") {
          return NextResponse.json({ error: `Table ${tableId} is already ${existingTable.status}. Cannot create new order.` }, { status: 409 });
      }
      */
    } else if (roomId) { // This is the new block for room orders
      associatedEntityId = roomId;
      associatedEntityType = 'room';
      orderData.roomId = roomId; // Add roomId to order data
      // Optional: Verify if the room exists before proceeding
      const existingRoom = await prisma.room.findUnique({
        where: { id: roomId },
      });
      if (!existingRoom) {
        return NextResponse.json({ error: `Room with ID ${roomId} not found.` }, { status: 404 });
      }
      // You might also want to check room status (e.g., if it's already occupied by another order)
      // This logic depends on how rooms are managed in your hotel system.
      // For example, if a room can only have one active order at a time:
      /*
      if (existingRoom.status === "OCCUPIED") { // Assuming you have a status field for rooms
          return NextResponse.json({ error: `Room ${roomId} is already occupied.` }, { status: 409 });
      }
      */
    }

    // --- Logic for finding existing active order ---
    let activeOrder;
    if (associatedEntityType === 'table') {
        activeOrder = await prisma.order.findFirst({
            where: {
                tableId: associatedEntityId,
                status: { in: ["PENDING", "IN_PROGRESS", "SERVED"] },
            },
            include: { items: true },
        });
    } else if (associatedEntityType === 'room') {
        activeOrder = await prisma.order.findFirst({
            where: {
                roomId: associatedEntityId,
                status: { in: ["PENDING", "IN_PROGRESS", "SERVED"] },
            },
            include: { items: true },
        });
    }


    if (activeOrder) {
      // --- Update existing order ---
      console.log("Found active order, updating items...");
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
              // Ensure price update logic is correct for accumulating (price per item * quantity)
              // If newItem.price is total for the new quantity, you might adjust this
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
              price: new Decimal(newItem.price) // Ensure this is per-item price or total for this quantity
            }
          });
        }
      }

      // Recalculate order total from all order items
      const allOrderItems = await prisma.orderItem.findMany({
        where: { orderId: activeOrder.id }
      });
      // The sum should be quantity * price_per_item
      const recalculatedTotal = allOrderItems.reduce((sum, item) => sum.plus(new Decimal(item.price)), new Decimal(0));


      const updatedOrder = await prisma.order.update({
        where: { id: activeOrder.id },
        data: {
          total: recalculatedTotal
        },
        include: { items: true }
      });
      console.log("Order updated:", updatedOrder);
      return NextResponse.json(updatedOrder, { status: 200 });

    } else {
      // --- Create a new order ---
      console.log("No active order found, creating a new one...");
      const order = await prisma.order.create({
        data: {
          ...orderData, // Spread userId, tableId/roomId, status, total
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

      // Update status of associated entity
      if (associatedEntityType === 'table') {
        await prisma.table.update({
          where: { id: associatedEntityId },
          data: { status: "OCCUPIED" },
        });
      } else if (associatedEntityType === 'room') {
        // You might have a similar status for rooms, e.g., "OCCUPIED" or "HAS_ACTIVE_ORDER"
        // Adjust this based on your room status management in the schema
        await prisma.room.update({
            where: { id: associatedEntityId },
            data: { status: "OCCUPIED" }, // Assuming a 'status' field for Room model
        });
      }

      console.log("New order created:", order);
      return NextResponse.json(order, { status: 201 });
    }

  } catch (error) {
    console.error("Error creating/updating order:", error); // Log the full error for debugging

    if (error.code === 'P2002') { // Prisma unique constraint violation code
      return NextResponse.json({ error: "Duplicate entry or constraint violation." }, { status: 409 });
    }
    // Handle specific Prisma errors if needed, e.g., P2025 for not found
    if (error.code === 'P2025') {
        return NextResponse.json({ error: "A record needed for this operation could not be found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Something went wrong during order processing.", details: error.message }, { status: 500 });
  }
}