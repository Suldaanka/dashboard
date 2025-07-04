import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(request, context) {
  const params = await context.params;
  const id = params.id;

  try {
    // Simulate delete operation

    // Replace with DB delete logic if needed

    const DeleteTable = await prisma.table.delete({
      where: {
        id: id,
      },
    })

    if (!DeleteTable) {
      return NextResponse.json(
        { error: `Table with ID ${id} not found.` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: `Table with ID ${DeleteTable.id} deleted successfully.` },
      { status: 200 }
    )
  } catch (error) {
    // Error handled with response
    return NextResponse.json(
      { error: 'Failed to delete table.' },
      { status: 500 }
    )
  }
}

export const DELETE = withRoleCheck(handler, ['ADMIN', 'MANAGER']);
