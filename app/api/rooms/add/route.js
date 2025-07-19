import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("Received body:", body);
        
        const { number, price, status, type } = body;
        
        // Validate required fields
        if (!number || !price || !status || !type) {
            return NextResponse.json(
                { error: "Missing required fields: number, price, status, and type are required" },
                { status: 400 }
            );
        }
        
        const room = await prisma.room.create({
            data: {
                number, 
                price: parseFloat(price),
                status: status.toUpperCase(), 
                type: type.toUpperCase(),
                createdAt: new Date(),
            },
        });
                
        return NextResponse.json(room, { status: 201 });
    } catch (error) {
        console.error("Error creating room:", error);
        return NextResponse.json(
            { error: `Error creating room: ${error.message}` },
            { status: 500 }
        );
    }
}