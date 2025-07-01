import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, context) {
  const params = await context.params;

  try {
    const tableId = params.id;
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }
    if (!['AVAILABLE', 'OCCUPIED'].includes(status.toUpperCase())) {
      return NextResponse.json({ message: 'Status must be either "AVAILABLE" or "OCCUPIED"' }, { status: 400 });
    }
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { status: status.toUpperCase() },
    });
    return NextResponse.json(updatedTable, { status: 200 });
  } catch (error) {
    // Error handled with response
    return NextResponse.json({ message: 'Error updating table status', error: error.message }, { status: 500 });
  }
}