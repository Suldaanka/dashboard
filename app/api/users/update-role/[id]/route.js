// /app/api/users/update-role/[id]/route.js

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend"; // ✅ Modern way

// ✅ Create backend Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function PUT(req, context) {
  try {
    const { id } = context.params;
    const { role } = await req.json();

    const validRoles = ["ADMIN", "STAFF", "USER", "WAITER", "KITCHEN"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // ✅ Update in your database
    const updatedUser = await prisma.user.update({
      where: { clerkId: id },
      data: { role },
    });

    // ✅ Update in Clerk metadata
    try {
      await clerkClient.users.updateUser(id, {
        publicMetadata: { role },
      });

      return NextResponse.json({
        message: "User role updated successfully",
        user: updatedUser,
      });
    } catch (clerkError) {
      console.error("Clerk metadata update failed:", clerkError);
      return NextResponse.json(
        {
          message: "Role updated in DB, but Clerk metadata update failed",
          user: updatedUser,
          clerkError: clerkError.message,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
