import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { checkIn, checkOut, roomType, user, fullname, phone, guests } = body;

    console.log("Body received:", body);

    // --- Input Validation ---
    if (!checkIn || !checkOut || !roomType || !user || !fullname) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // --- Find an available room ---
    // Find an available room of the requested type that is not booked in the given date range
    const availableRoom = await prisma.room.findFirst({
      where: {
        type: roomType.toUpperCase(),
        // Check for 'AVAILABLE' status initially
        status: "AVAILABLE",
        bookings: {
          none: {
            OR: [
              {
                // Existing booking starts before requested checkout and ends after requested checkin
                checkIn: {
                  lt: checkOutDate,
                },
                checkOut: {
                  gt: checkInDate,
                },
              },
            ],
          },
        },
      },
    });

    if (!availableRoom) {
      return NextResponse.json({ error: "No available rooms for selected type and dates" }, { status: 404 });
    }

    // --- Create the Booking ---
    const booking = await prisma.booking.create({
      data: {
        userId: user,
        roomId: availableRoom.id,
        fullName: fullname,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guest: guests,
        status: "PENDING", // Initial booking status
        phoneNumber: phone,
      },
    });

    // --- Update Room Status to OCCUPIED ---
    // After a successful booking, update the room's status
    await prisma.room.update({
      where: { id: availableRoom.id },
      data: { status: "OCCUPIED" }, // Set the room status to OCCUPIED
    });
    console.log(`Room ${availableRoom.id} (Type: ${roomType}) status updated to OCCUPIED.`);

    return NextResponse.json(booking, { status: 201 });

  } catch (error) {
    console.error("Booking or room status update error:", error);
    // You might want to differentiate errors, e.g., for Prisma client errors
    return NextResponse.json({ error: "Internal server error during booking process." }, { status: 500 });
  }
}
