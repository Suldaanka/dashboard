import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(request, context) {
  const params = await context.params;
  const id = params.id;

  try {
    // Simulate delete operation

    // Replace with DB delete logic if needed

    const DeleteExpense = await prisma.expense.delete({
      where: {
        id: id,
      },
    })

    if (!DeleteExpense) {
      return NextResponse.json(
        { error: `Expense with ID ${id} not found.` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: `Expense with ID ${DeleteExpense.id} deleted successfully.` },
      { status: 200 }
    )
  } catch (error) {
    // Error handled with response
    return NextResponse.json(
      { error: 'Failed to delete expense.' },
      { status: 500 }
    )
  }
}

export const DELETE = withRoleCheck(handler, ['admin', 'manager']);
