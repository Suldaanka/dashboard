import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(req) {
    try {
        const body = await req.json();
        
        const { description, category, amount, paidById, type } = body;
        
        // Validate required fields
        if (!description || !category || !amount || !paidById || !type) {
            return NextResponse.json(
                { error: "Missing required fields: description, category, amount, paidById, and type are required" },
                { status: 400 }
            );
        }
        
        const expenses = await prisma.expense.create({
            data: {
                description,
                categoryId: category, // ✅ Match the schema field name
                amount,
                paidById, // ✅ Direct assignment since it matches the schema field
                type,
                date: new Date(), // optional if you want to override default
                createdAt: new Date(), // optional if you want to override default
            },
        });
                
        return NextResponse.json(expenses, { status: 201 });
    } catch (error) {
        // Error handled with response
        return NextResponse.json(
            { error: `Error creating expense: ${error.message}` },
            { status: 500 }
        );
    }
}

export const POST = withRoleCheck(handler, ['ADMIN', 'MANAGER']);


 

