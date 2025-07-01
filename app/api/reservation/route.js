import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Ignore time portion

        const bookings = await prisma.booking.findMany({
            include: { room: true },
            orderBy: { createdAt: "desc" },
        });

        for (const booking of bookings) {
            const checkOutDate = new Date(booking.checkOut);
            checkOutDate.setHours(0, 0, 0, 0); // Ignore time portion

            const isSameDay = checkOutDate.getTime() === today.getTime();

            if (isSameDay && booking.status !== "COMPLETED") {
                // Update booking status
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { status: "COMPLETED" },
                });

                // Update room status
                await prisma.room.update({
                    where: { id: booking.roomId },
                    data: { status: "AVAILABLE" },
                });
            }
        }

        return NextResponse.json(bookings, { status: 200 });
    } catch (error) {
        // Error handled with response
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
