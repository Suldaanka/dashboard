import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req, context) {
  try {
    const { id } = context.params;
    const data = await req.json();
    
    // Validate the ID
    if (!id) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }
    
    // Get current room to check if it exists
    const currentRoom = await prisma.room.findUnique({
      where: { id }
    });
    
    if (!currentRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    
    // Build update data object with only fields that are provided
    const updateData = {};
        
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    
    // Update the room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({
      success: true,
      data: updatedRoom,
      message: "Room updated successfully"
    });
    
  } catch (error) {
    // Error handled with response
    return NextResponse.json({
      success: false,
      error: "Failed to update room",
      details: error.message
    }, { status: 500 });
  }
}