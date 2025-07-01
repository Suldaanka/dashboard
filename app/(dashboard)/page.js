// app/dashboard/page.jsx
"use client";

import React, { useEffect } from 'react';
// Reverting to alias path for useFetch, assuming "@/hooks" is configured in jsconfig.json/tsconfig.json
import { useFetch } from '@/hooks/useFetch'; 
// Reverting to alias path for Loading, assuming "@/components" is configured
import Loading from '@/components/Loading'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Shadcn UI components
import { Badge } from '@/components/ui/badge'; // Shadcn UI Badge component
import SummaryCard from './_components/summaryCard'; // Relative path should be correct if summaryCard is in _components
import { BChart } from './_components/barChart'; // Relative path should be correct
import { LnChart } from './_components/lineChart'; // Relative path should be correct
// Lucide React Icons
import { DollarSign, Hotel, Utensils, Users, BedDouble, Table, Clock, ListOrdered } from 'lucide-react'; // Added more icons for new summary cards

export default function DashboardPage() {
  // Fetch dashboard data from your API endpoint
  const { data, isLoading, isError } = useFetch('/api/dashboard', ['dashboard']);

  // Fetch rooms data from your API endpoint for the RoomCard
  // Assuming /api/rooms returns a list of room objects that RoomCard can consume
  const { data: roomsData, isLoading: roomsLoading, isError: roomsError } = useFetch('/api/rooms', ['rooms']);

  // --- Loading and Error States ---
  if (isLoading || roomsLoading) {
    return <Loading />; // Display a loading spinner or message
  }

  if (isError || roomsError) {
    // Handle error state, display a user-friendly message
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        Error loading dashboard data. Please try again later.
      </div>
    );
  }

  // --- Destructure and provide default values if data is not yet available or null ---
  // The '|| {}' and '|| []' provide fallback empty objects/arrays
  // This helps prevent crashes if data is briefly null/undefined after loading,
  // though the isLoading check above should handle most cases.
  const {
    counts = {
      rooms: 0,
      occupiedRooms: 0,
      availableRooms: 0,
      maintenanceRooms: 0,
      tables: 0,
      occupiedTables: 0,
      orders: 0,
      pendingOrders: 0,
      bookings: 0,
    },
    recentOrders = [],
    recentBookings = [],
    revenue = {
      total: 0,
      today: 0,
      room: 0, // Ensure your API returns 'room' and 'restaurant' revenue
      restaurant: 0,
    },
  } = data || {};

  // Safely access revenue properties and format them
  const hotelRevenue = revenue.room || 0;
  const restaurantRevenue = revenue.restaurant || 0;
  const totalRevenue = revenue.total || 0;
  const todayRevenue = revenue.today || 0; // Displayed in a new card now


  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Dashboard Overview</h1>

      {/* --- Summary Cards Section (Revenue and Bookings) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          change="+20.1%" // Static, consider making dynamic
          isPositive={true}
          period="from last month"
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"
        />
        <SummaryCard
          title="Revenue Today"
          value={`$${todayRevenue.toFixed(2)}`}
          change="+5.5%" // Static, consider making dynamic
          isPositive={true}
          period="from yesterday"
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md"
        />
        <SummaryCard
          title="Hotel Revenue"
          value={`$${hotelRevenue.toFixed(2)}`}
          change="+15.0%" // Static
          isPositive={true}
          period="from last month"
          icon={<Hotel className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600 shadow-md"
        />
        <SummaryCard
          title="Restaurant Revenue"
          value={`$${restaurantRevenue.toFixed(2)}`}
          change="+10.5%" // Static
          isPositive={true}
          period="from last month"
          icon={<Utensils className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600 shadow-md"
        />
      </div>

      {/* --- Summary Cards Section (Counts) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Rooms"
          value={counts.rooms.toLocaleString()}
          change="" // No change data provided for counts
          isPositive={true} // Default to true, or add logic for change status
          period="overall"
          icon={<BedDouble className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600 shadow-md"
        />
        <SummaryCard
          title="Occupied Rooms"
          value={counts.occupiedRooms.toLocaleString()}
          change=""
          isPositive={false} // Might be considered negative if less available
          period="current"
          icon={<Hotel className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-red-500 to-red-600 shadow-md"
        />
        <SummaryCard
          title="Available Rooms"
          value={counts.availableRooms.toLocaleString()}
          change=""
          isPositive={true}
          period="current"
          icon={<BedDouble className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md"
        />
        <SummaryCard
          title="Maintenance Rooms"
          value={counts.maintenanceRooms.toLocaleString()}
          change=""
          isPositive={false}
          period="current"
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-gray-500 to-gray-600 shadow-md"
        />
        <SummaryCard
          title="Total Tables"
          value={counts.tables.toLocaleString()}
          change=""
          isPositive={true}
          period="overall"
          icon={<Table className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-md"
        />
        <SummaryCard
          title="Occupied Tables"
          value={counts.occupiedTables.toLocaleString()}
          change=""
          isPositive={false}
          period="current"
          icon={<Table className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-rose-500 to-rose-600 shadow-md"
        />
        <SummaryCard
          title="Total Orders"
          value={counts.orders.toLocaleString()}
          change=""
          isPositive={true}
          period="overall"
          icon={<ListOrdered className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md"
        />
        <SummaryCard
          title="Pending Orders"
          value={counts.pendingOrders.toLocaleString()}
          change=""
          isPositive={false}
          period="current"
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-amber-500 to-amber-600 shadow-md"
        />
        <SummaryCard
          title="Total Bookings"
          value={counts.bookings.toLocaleString()}
          change="+5.0%" // Static, assuming this was intentional from original code
          isPositive={true}
          period="from last month"
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"
        />
      </div>


      {/* --- Chart Section (Placeholders) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LnChart />
        <BChart />
      </div>
      {/* --- Recent Activity (Bookings and Orders) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Recent Orders</CardTitle>
            <CardDescription>Latest restaurant and room service orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {order.table ? `Table #${order.table.number}` :
                         order.room ? `Room #${order.room.number}` : 'Takeaway'}
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          by {order.user?.name || 'Guest'}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Items: {order.items.map(item => `${item.quantity}x ${item.menuItem?.name || 'Unknown'}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">${Number(order.total).toFixed(2)}</p>
                      <Badge
                        className="mt-1"
                        variant={
                          order.status === 'PENDING' ? 'secondary' :
                          order.status === 'IN_PROGRESS' ? 'default' :
                          order.status === 'SERVED' ? 'outline' : 'destructive' // Assuming 'SERVED' is default success
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No recent orders to display.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Recent Bookings</CardTitle>
            <CardDescription>Latest room reservations and their status.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{booking.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        Room #{booking.room?.number || 'N/A'} &bull; From{' '}
                        {new Date(booking.checkIn).toLocaleDateString()} to{' '}
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Guests: {booking.guest} &bull; Phone: {booking.phoneNumber}
                      </p>
                    </div>
                    <Badge
                      className="mt-1"
                      variant={
                        booking.status === 'PENDING' ? 'secondary' :
                        booking.status === 'CONFIRMED' ? 'default' :
                        booking.status === 'COMPLETED' ? 'outline' : 'destructive' // Assuming 'COMPLETED' is default success
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No recent bookings to display.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
