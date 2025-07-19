import { prisma } from "@/lib/prisma"; // Ensure this path correctly exports your Prisma client
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Note: It's generally not necessary to explicitly call $connect() and $disconnect()
    // within each API route if you're using a global Prisma client instance (recommended pattern).
    // The connection is managed by the client itself. Removing $connect and $disconnect for cleaner code.
    // await prisma.$connect(); 

    // Get counts for various entities
    const roomsCount = await prisma.room.count();
    const occupiedRoomsCount = await prisma.room.count({
      where: { status: "OCCUPIED" }
    });
    const availableRoomsCount = await prisma.room.count({
      where: { status: "AVAILABLE" }
    });
    const maintenanceRoomsCount = await prisma.room.count({
      where: { status: "MAINTENANCE" }
    });

    const tablesCount = await prisma.table.count();
    const occupiedTablesCount = await prisma.table.count({
      where: { status: "OCCUPIED" }
    });

    const ordersCount = await prisma.order.count();
    const pendingOrdersCount = await prisma.order.count({
      where: { status: "PENDING" }
    });

    const bookingsCount = await prisma.booking.count();

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        table: true,
        room: true,
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        room: true
      }
    });

    // --- Calculate Total Revenue (Orders + Bookings) ---

    // 1. Calculate Revenue from Orders
    const ordersForRevenue = await prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" } // Include all non-cancelled orders
      },
      select: {
        total: true,
        createdAt: true,
        tableId: true,
        roomId: true
      }
    });

    let totalRestaurantOrderRevenue = 0;
    let totalRoomOrderRevenue = 0; // Orders made in rooms (restaurant orders)

    // Using reduce to be explicit about summing up from order.total
    const totalOrderRevenue = ordersForRevenue.reduce((sum, order) => {
      const orderTotal = Number(order.total); // Ensure conversion
      if (order.tableId !== null) {
        totalRestaurantOrderRevenue += orderTotal;
      }
      if (order.roomId !== null) {
        totalRoomOrderRevenue += orderTotal; // This might be restaurant orders served to rooms
      }
      return sum + orderTotal;
    }, 0);

    // 2. Calculate Revenue from Bookings (Hotel Revenue)
    const bookingsForRevenue = await prisma.booking.findMany({
      where: {
        status: "COMPLETED", // Only count completed bookings for revenue
      },
      include: {
        room: {
          select: {
            price: true // Select room price for calculation
          }
        }
      }
    });

    let totalBookingRevenue = 0;
    bookingsForRevenue.forEach(booking => {
      if (booking.room && booking.room.price) {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
        const nights = timeDiff > 0 ? Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) : 0; // At least 1 night if checkOut > checkIn

        const roomPrice = typeof booking.room.price === 'string'
          ? parseFloat(booking.room.price)
          : booking.room.price.toNumber(); // Handle Decimal type from Prisma

        totalBookingRevenue += roomPrice * nights;
      }
    });

    // Combine all revenues
    const overallTotalRevenue = totalOrderRevenue + totalBookingRevenue;


    // --- Calculate Today's Revenue ---
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Use UTC to match database timestamps if they are UTC

    const todayOrders = ordersForRevenue.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    });

    const todayOrderRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);

    const todayBookings = bookingsForRevenue.filter(booking => {
      // Assuming today's revenue from bookings means check-out is today or after checkIn and before end of today
      const checkOutDate = new Date(booking.checkOut);
      // For simplicity, let's say revenue is recognized if check-out is today.
      // More complex logic might distribute revenue across days.
      return checkOutDate.setUTCHours(0,0,0,0) === today.getTime();
    });

    let todayBookingRevenue = 0;
    todayBookings.forEach(booking => {
        if (booking.room && booking.room.price) {
            const checkInDate = new Date(booking.checkIn);
            const checkOutDate = new Date(booking.checkOut);
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const nights = timeDiff > 0 ? Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) : 0;
            const roomPrice = typeof booking.room.price === 'string'
              ? parseFloat(booking.room.price)
              : booking.room.price.toNumber();
            todayBookingRevenue += roomPrice * nights;
        }
    });

    const overallTodayRevenue = todayOrderRevenue + todayBookingRevenue;


    return NextResponse.json({
      counts: {
        rooms: roomsCount,
        occupiedRooms: occupiedRoomsCount,
        availableRooms: availableRoomsCount,
        maintenanceRooms: maintenanceRoomsCount,
        tables: tablesCount,
        occupiedTables: occupiedTablesCount,
        orders: ordersCount,
        pendingOrders: pendingOrdersCount,
        bookings: bookingsCount
      },
      recentOrders,
      recentBookings,
      revenue: {
        total: overallTotalRevenue, // Combined total revenue from orders and bookings
        today: overallTodayRevenue, // Combined today's revenue
        restaurant: totalRestaurantOrderRevenue, // Restaurant orders (table orders + room service orders)
        room: totalBookingRevenue // Hotel room booking revenue
      }
    }, { status: 200 });
  } catch (error) {
    // Error handled with response
    return NextResponse.json(
      { error: "Failed to load dashboard data", details: error.message || error.toString() },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Removing explicit disconnect if using global instance
  }
}

