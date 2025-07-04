import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler() {
  try {
    await prisma.$connect();
    const expenses = await prisma.ExpenseCategory.findMany();

    if (!expenses.length) {
      return NextResponse.json({ message: "No expenses found" }, { status: 404 });
    }

    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    // Error handled with response
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export const GET = withRoleCheck(handler, ['admin', 'manager', 'waiter']);