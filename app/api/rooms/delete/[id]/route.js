import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";


export async function DELETE(request, context) {
  const params = await context.params;
  const id = params.id;

  try {
    // Simulate delete operation

    // Replace with DB delete logic if needed

    const DeleteRoom = await prisma.room.delete({
      where: {
        id: id,
      },
    })

    if (!DeleteRoom) {
      return NextResponse.json(
        { error: `Room with ID ${id} not found.` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: `Room with ID ${DeleteRoom.id} deleted successfully.` },
      { status: 200 }
    )
  } catch (error) {
    // Error handled with response
    return NextResponse.json(
      { error: 'Failed to delete room.' },
      { status: 500 }
    )
  }
}
