import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Check if status is valid
    const validStatuses = ["PENDING", "COMPLETED", "FAILED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedPayment, { status: 200 });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: `Error updating payment status: ${error.message}` },
      { status: 500 }
    );
  }
}