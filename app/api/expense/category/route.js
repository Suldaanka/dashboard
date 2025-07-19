import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$connect();
    const expenses = await prisma.ExpenseCategory.findMany();

    if (!expenses.length) {
      return NextResponse.json({ message: "No expenses found" }, { status: 404 });
    }

    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.error(error); // log the error for debugging purposes
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}