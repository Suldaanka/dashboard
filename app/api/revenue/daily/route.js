// app/api/dashboard/revenue/daily/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req) {
  const dateStr = req.nextUrl.searchParams.get('date')
  if (!dateStr) return NextResponse.json({ error: 'Missing date param' }, { status: 400 })

  const start = new Date(dateStr)
  const end = new Date(dateStr)
  end.setDate(end.getDate() + 1)

  // Get booking revenue
  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
      status: 'CONFIRMED',
    },
    include: {
      room: true,
    },
  })

  let bookingRevenue = 0
  for (const booking of bookings) {
    const nights =
      (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    bookingRevenue += booking.room.price * nights
  }

  // Get order revenue
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
      status: 'SERVED', // or whatever your completed status is
    },
    include: {
      items: true,
    },
  })

  let orderRevenue = 0
  for (const order of orders) {
    orderRevenue += order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  return NextResponse.json({
    date: dateStr,
    revenue: {
      booking: bookingRevenue,
      order: orderRevenue,
      total: bookingRevenue + orderRevenue
    }
  })
}