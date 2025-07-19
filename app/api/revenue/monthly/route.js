import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  // Get data for the last 6 months
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now)
    date.setMonth(now.getMonth() - i)
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      name: date.toLocaleString('default', { month: 'long' })
    }
  }).reverse()

  const revenueData = await Promise.all(months.map(async ({ year, month, name }) => {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 1)

    // Get booking revenue
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        status: 'CONFIRMED'
      },
      include: { room: true }
    })

    const bookingRevenue = bookings.reduce((sum, booking) => {
      const nights = (new Date(booking.checkOut) - new Date(booking.checkIn)) / (86400 * 1000)
      return sum + (booking.room.price * nights)
    }, 0)

    // Get order revenue
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        status: 'SERVED'
      },
      include: { items: true }
    })

    const orderRevenue = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0)
    }, 0)

    return {
      month: name,
      booking: bookingRevenue,
      order: orderRevenue
    }
  }))

  return NextResponse.json(revenueData)
}