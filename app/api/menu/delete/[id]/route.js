import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";
import { withRoleCheck } from '@/lib/withRoleCheck';

async function handler(request, context) {
  const params = await context.params;
  const id = params.id;

  try {
    // Simulate delete operation

    // Replace with DB delete logic if needed

    const DeteleMenu = await prisma.menuItem.delete({
      where: {
        id,
      },
    })

    if (!DeteleMenu) {
      return NextResponse.json(
        { error: `Menu with ID ${id} not found.` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: `Menu with ID ${DeteleMenu.id} deleted successfully.` },
      { status: 200 }
    )
  } catch (error) {
    // Error handled with response
    return NextResponse.json(
      { error: 'Failed to delete Menu.' },
      { status: 500 }
    )
  }
}

export const DELETE = withRoleCheck(handler, ['ADMIN', 'MANAGER']);
