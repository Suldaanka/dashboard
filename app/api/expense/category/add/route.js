import { NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();

        const { name } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Missing required fields: name is required" },
                { status: 400 }
            );
        }

        // Create category with the correct fields according to your Prisma model
        const category = await prisma.expenseCategory.create({
            data: {
                name,
            },
        });

        return NextResponse.json(category , { status: 201 });

    } catch (error) {
        // Error handled with response
        return NextResponse.json(
            { error: `Error creating category: ${error.message}` },
            { status: 500 }
        );
    }
}