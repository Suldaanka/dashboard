import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req) {
  const monthStr = req.nextUrl.searchParams.get('month') // format: YYYY-MM
  if (!monthStr) return NextResponse.json({ error: 'Missing month param' }, { status: 400 })

  const [year, month] = monthStr.split('-').map(Number)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)

  // Fetch booking revenue
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

  const bookingRevenueMap = {}

  for (const booking of bookings) {
    const createdAt = new Date(booking.createdAt)
    const dateKey = createdAt.toISOString().split('T')[0] // format: YYYY-MM-DD

    const nights =
      (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    const revenue = booking.room.price * nights

    if (!bookingRevenueMap[dateKey]) {
      bookingRevenueMap[dateKey] = 0
    }
    bookingRevenueMap[dateKey] += revenue
  }

  // Fetch orders revenue
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
      status: 'SERVED',
    },
    include: {
      items: true,
    },
  })

  const orderRevenueMap = {}

  for (const order of orders) {
    const createdAt = new Date(order.createdAt)
    const dateKey = createdAt.toISOString().split('T')[0]

    const revenue = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    if (!orderRevenueMap[dateKey]) {
      orderRevenueMap[dateKey] = 0
    }
    orderRevenueMap[dateKey] += revenue
  }

  // Combine all dates from both revenue streams
  const allDates = new Set([
    ...Object.keys(bookingRevenueMap),
    ...Object.keys(orderRevenueMap)
  ])

  // Create combined daily revenue data
  const dailyRevenue = Array.from(allDates)
    .sort((a, b) => a.localeCompare(b))
    .map(date => ({
      date,
      bookingRevenue: bookingRevenueMap[date] || 0,
      orderRevenue: orderRevenueMap[date] || 0,
      totalRevenue: (bookingRevenueMap[date] || 0) + (orderRevenueMap[date] || 0)
    }))

  // Calculate totals
  const totalBookingRevenue = dailyRevenue.reduce((acc, cur) => acc + cur.bookingRevenue, 0)
  const totalOrderRevenue = dailyRevenue.reduce((acc, cur) => acc + cur.orderRevenue, 0)
  const totalRevenue = totalBookingRevenue + totalOrderRevenue

  return NextResponse.json({
    month: monthStr,
    dailyRevenue,
    totals: {
      booking: totalBookingRevenue,
      orders: totalOrderRevenue,
      combined: totalRevenue
    }
  })
}