import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, amount, status } = body;

    // Validate required fields
    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        status: status || "PENDING",
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: `Error creating payment: ${error.message}` },
      { status: 500 }
    );
  }
}