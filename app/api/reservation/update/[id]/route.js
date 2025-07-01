// /api/reservation/update/[id]/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    // Validate the ID
    if (!id) {
      return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 });
    }

    // Get the current reservation
    const currentReservation = await prisma.booking.findUnique({
      where: { id },
    });

    if (!currentReservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // Prepare update data
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

    // Auto-set status to COMPLETED if checkOut < today and not CANCELLED
    if (data.status === undefined && data.checkOut !== undefined) {
      const currentDate = new Date();
      const checkOutDate = new Date(data.checkOut);

      if (checkOutDate < currentDate && currentReservation.status !== "CANCELLED") {
        updateData.status = "COMPLETED";
      }
    }


    // Update booking
    const updatedReservation = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    // ✅ If status was changed to COMPLETED, set room status to AVAILABLE
    if (updateData.status === "COMPLETED" && currentReservation.roomId) {
      await prisma.room.update({
        where: { id: currentReservation.roomId },
        data: { status: "AVAILABLE" },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: "Reservation updated successfully",
    });
  } catch (error) {
    // Error handled with response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update reservation",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
