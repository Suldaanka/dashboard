import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await prisma.$connect();
        const rooms = await prisma.room.findMany();

        return NextResponse.json(rooms , { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }finally{
        prisma.$disconnect();
    }
}