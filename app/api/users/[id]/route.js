import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust if needed

export async function GET(req, { params }) {
  const {id} = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
