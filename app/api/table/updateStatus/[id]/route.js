import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const tableId = params.id;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    if (!['available', 'occupied'].includes(status.toLowerCase())) {
      return NextResponse.json({ message: 'Status must be either "available" or "occupied"' }, { status: 400 });
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { status: status.toUpperCase() },
    });

    return NextResponse.json(updatedTable, { status: 200 });
  } catch (error) {
    console.error('Error updating table status:', error);
    return NextResponse.json({ message: 'Error updating table status', error: error.message }, { status: 500 });
  }
}