import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";


export async function DELETE(request, context) {
  const params = await context.params;
  const id = params.id;

  try {
    // Simulate delete operation
    console.log(`Deleting Booking with ID: ${id}`)

    // Replace with DB delete logic if needed

    const DeleteBooking = await prisma.booking.delete({
      where: {
        id: id,
      },
    })

    if (!DeleteBooking) {
      return NextResponse.json(
        { error: `Expense with ID ${id} not found.` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: `Booking with ID ${DeleteBooking.id} deleted successfully.` },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to delete expense.' },
      { status: 500 }
    )
  }
}
