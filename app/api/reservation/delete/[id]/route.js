import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";


import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(request, context) {
  const params = await context.params;
  const id = params.id;

  try {
    // Simulate delete operation

    // Replace with DB delete logic if needed

    const DeleteBooking = await prisma.booking.delete({
      where: {
        id: id,
      },
    })

    if (!DeleteBooking) {
      return NextResponse.json(
        { error: `Booking with ID ${id} not found.` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: `Booking with ID ${DeleteBooking.id} deleted successfully.` },
      { status: 200 }
    )
  } catch (error) {
    // Error handled with response
    return NextResponse.json(
      { error: 'Failed to delete booking.' },
      { status: 500 }
    )
  }
}

export const DELETE = withRoleCheck(handler, ['ADMIN', 'MANAGER']);
