import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // Check if the room exists
    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Check if room has any bookings
    const bookings = await prisma.booking.findMany({
      where: { roomId: id },
    });

    if (bookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete room with existing bookings" },
        { status: 400 }
      );
    }

    // Delete the room
    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Room deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: `Error deleting room: ${error.message}` },
      { status: 500 }
    );
  }
}