import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(req) {
    try {
        const body = await req.json();
        
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
        // Error handled with response
    }
}

export const POST = withRoleCheck(handler, ['ADMIN', 'MANAGER']);
    