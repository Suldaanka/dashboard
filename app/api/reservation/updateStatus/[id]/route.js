import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import path to your prisma client

// Replace default export handler with this:
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const reservationData = await request.json();
    
    // Get current reservation to check current status
    const currentReservation = await prisma.booking.findUnique({
      where: { id: id }
    });
    
    if (!currentReservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }
    
    // Status transition logic
    const currentDate = new Date();
    const checkOutDate = new Date(reservationData.checkOut || currentReservation.checkOut);
    
    // If checkout date is in the past and status isn't CANCELLED, mark as COMPLETED
    if (checkOutDate < currentDate && currentReservation.status !== 'CANCELLED') {
      reservationData.status = "COMPLETED";
    } 
    // If status is explicitly set to CANCELLED in the request, respect that
    else if (reservationData.status === 'CANCELLED') {
      reservationData.status = "CANCELLED";
    }
    // If current status is PENDING and we're updating, move to CONFIRMED (unless explicitly set)
    else if (currentReservation.status === 'PENDING' && !reservationData.status) {
      reservationData.status = "CONFIRMED";
    }
    // Otherwise, maintain existing status if not specified
    else if (!reservationData.status) {
      reservationData.status = currentReservation.status;
    }
    
    // Update the reservation in your database
    const updatedReservation = await prisma.booking.update({
      where: { id: id },
      data: reservationData
    });
    
    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
  }
}