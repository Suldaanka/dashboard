import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path if needed
import { Decimal } from "@prisma/client/runtime/library"; // required for Decimal type

export async function POST(req) {
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

      // Optional: Prevent order if table is already occupied (depending on business logic)
      // Check if the table status is already OCCUPIED or RESERVED
      if (existingTable.status === "OCCUPIED" || existingTable.status === "RESERVED") {
        // Warning about table status handled with response
        // Uncomment the line below if you want to prevent placing an order on an already occupied/reserved table
        // return NextResponse.json({ error: `Table ${tableId} is already ${existingTable.status}.` }, { status: 409 });
      }
    }

    // --- Create the Order ---
    const order = await prisma.order.create({
      data: {
        userId,
        tableId,
        roomId,
        status: status || "PENDING", // Default status to PENDING if not provided
        total: new Decimal(total), // Ensure total is a Decimal type
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: new Decimal(item.price), // Ensure item price is Decimal
          })),
        },
      },
      include: {
        items: true, // Include the associated order items in the response
      },
    });

    // --- Update Table Status to Occupied (if a tableId was provided) ---
    if (tableId) {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: "OCCUPIED" }, // Update the 'status' field to 'OCCUPIED'
      });
    }

    return NextResponse.json(order, { status: 201 }); // Return the created order with a 201 Created status
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