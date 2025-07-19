import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 });
    }

    const currentReservation = await prisma.booking.findUnique({
      where: { id },
      include: { room: true } // Include the room to access roomId
    });

    if (!currentReservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const updateData = {};

    if (data.fullname !== undefined) {
      updateData.fullName = data.fullname;
    }

    if (data.phone !== undefined) {
      updateData.phoneNumber = data.phone;
    }

    if (data.guest !== undefined) {
      updateData.guests = parseInt(data.guest, 10);
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    // Auto-set status to COMPLETED if checkout is in the past and status not provided
    if (data.status === undefined && data.checkOut !== undefined) {
      const currentDate = new Date();
      const checkOutDate = new Date(data.checkOut);

      if (checkOutDate < currentDate && currentReservation.status !== 'CANCELLED') {
        updateData.status = "COMPLETED";
      }
    }

    // ✅ Update the reservation
    const updatedReservation = await prisma.booking.update({
      where: { id },
      data: updateData
    });

    // ✅ Update the related room status based on booking status
    if (data.status) {
      let roomStatus = null;

      if (["CANCELLED", "COMPLETED"].includes(data.status)) {
        roomStatus = "AVAILABLE";
      } else if (["PENDING", "CONFIRMED"].includes(data.status)) {
        roomStatus = "OCCUPIED";
      }

      if (roomStatus && currentReservation.roomId) {
        await prisma.room.update({
          where: { id: currentReservation.roomId },
          data: { status: roomStatus }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: "Reservation and room updated successfully"
    });

  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to update reservation",
      details: error.message
    }, { status: 500 });
  }
}
