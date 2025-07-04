import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";


import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(request, context) {
  const params = await context.params;
  const id = params.id;

  try {
    // Simulate delete operation

    // Replace with DB delete logic if needed

    const DeleteOrder = await prisma.order.delete({
      where: {
        id: id,
      },
    })

    if (!DeleteOrder) {
      return NextResponse.json(
        { error: `Order with ID ${id} not found.` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: `Order with ID ${DeleteOrder.id} deleted successfully.` },
      { status: 200 }
    )
  } catch (error) {
    // Error handled with response
    return NextResponse.json(
      { error: 'Failed to delete order.' },
      { status: 500 }
    )
  }
}

export const DELETE = withRoleCheck(handler, ['ADMIN', 'MANAGER']);

