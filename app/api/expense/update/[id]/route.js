import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    // Validate the id
    if (!id) {
      return NextResponse.json({ error: "Invalid expense ID" }, { status: 400 });
    }
    
    // Validate required fields
    if (!data.description || !data.amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Format the data - adjusted to match your schema
    const updateData = {
      description: data.description,
      amount: parseFloat(data.amount),
      type: data.type,
      // Remove updatedAt as it doesn't exist in your schema
      // Only include date if provided
      ...(data.date && { date: new Date(data.date) }),
    };
    
    // Handle category relationship properly
    if (data.category) {
      // If category is an ID
      updateData.category = {
        connect: { id: data.category }
      };
    }
    
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json(updatedExpense);
  } catch (error) {
    // Error handled with response
    return NextResponse.json({ 
      error: "Failed to update expense", 
      details: error.message 
    }, { status: 500 });
  }
}