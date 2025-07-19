import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const bookings = await prisma.booking.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include:{
                room: true
            }
        });
        return NextResponse.json(bookings, {status: 200});
    } catch (error) {
        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        );
    }
}