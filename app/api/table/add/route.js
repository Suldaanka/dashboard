import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("Received body:", body);
        
        const { number, capacity, status } = body;
        
        // Validate required fields
        if (!number || !capacity || !status) {
            return NextResponse.json(
                { error: "Missing required fields: number, price, status, and type are required" },
                { status: 400 }
            );
        }
        
        const table = await prisma.table.create({
            data: {
                number, 
                capacity,
                status: status.toUpperCase(),
                createdAt: new Date(),
            },
        });
                
        return NextResponse.json(table, { status: 201 });
    } catch (error) {
        console.error("Error creating table:", error);
        return NextResponse.json(
            { error: `Error creating table: ${error.message}` },
            { status: 500 }
        );
    }
}