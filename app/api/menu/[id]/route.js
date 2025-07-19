import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Menu item ID is required" },
      { status: 400 }
    );
  }

  try {
    const menu = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menu) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu item", details: error.message },
      { status: 500 }
    );
  }
}
