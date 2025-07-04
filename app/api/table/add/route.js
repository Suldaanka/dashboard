import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(req) {
    try {
        const body = await req.json();
        
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
        // Error handled with response
    }
}

export const POST = withRoleCheck(handler, ['ADMIN', 'MANAGER']);