"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderDetails } from "./orderdetails";
import { useSelector } from "react-redux";
import { Eye, XCircle } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";
import OrderRecipt from "./orderRecipt";

export default function OrderCardList({ data = [] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Client-side state for dates to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/orders/update-status/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update order status");
      }
  
      await res.json();
  
      // ✅ Refetch updated orders
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };
  
  

  // Navigate to order items page
  const orderView = (id) => {
    // Validate id before navigation to prevent [object Object] errors
    if (id && typeof id === 'string') {
      router.push(`/orders/${id}`)
    } else {
      // Handle invalid ID gracefully
      toast.error("Invalid order ID for navigation")
    }
  }

  // Format date safely, only on client-side
  const formatDate = (dateString) => {
    if (!dateString) return "";
    if (!isClient) return ""; // Return empty on server to avoid hydration mismatch

    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return "";
    }
  };

  // Check if data exists and is an array before mapping
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }


  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {data.map((order) => (
        <Card key={order?.id || 'unknown'}>
          <CardHeader>
            <CardTitle className="text-lg">
              Order #{order?.id ? order.id.slice(0, 6) : 'N/A'}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {isClient ? formatDate(order?.createdAt) : "Loading..."}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge
                variant={
                  order?.status === "PENDING"
                    ? "default"
                    : order?.status === "IN_PROGRESS"
                      ? "secondary"
                      : order?.status === "SERVED"
                        ? "success"
                        : "destructive"
                }
              >
                {order?.status || "UNKNOWN"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Total:</span>
              <span className="font-bold">
                ${order?.total ? parseFloat(order.total).toFixed(2) : '0.00'}
              </span>
            </div>
            {order?.roomId && (
              <div className="flex items-center justify-between">
                <span>Room:</span>
                <span>0{order.room.number}</span>
              </div>
            )}
            {order?.tableId && (
              <div className="flex items-center justify-between">
                <span>Table:</span>
                <span>0{order.table.number}</span>
              </div>
            )}
             <div className="flex items-center justify-between">
                <span>Waiter:</span>
                <span>{order?.user?.name || 'Unknown'}</span>
              </div>
            <div className="flex flex-col gap-2">
              {/* Status update buttons */}
              <div className="flex gap-2 justify-between">
                {order?.status === "PENDING" && (
                  <Button
                    variant="secondary"
                    onClick={() => order?.id && updateOrderStatus(order.id, "IN_PROGRESS")}
                  >
                    Mark In Progress
                  </Button>
                )}
                {order?.status === "IN_PROGRESS" && (
                  <Button
                    variant="success"
                    onClick={() => order?.id && updateOrderStatus(order.id, "SERVED")}
                  >
                    Mark Served
                  </Button>
                )}
                <div className="flex items-center justify-between gap-2">
                  {/* View Order Icon */}
                  <Eye
                    className="text-blue-500 cursor-pointer hover:scale-105 transition"
                    size={22}
                    onClick={() => orderView(order.id)}
                  />
                   {/* Cancel Order Icon */}
                   {
                    order?.status === "PENDING" ? (
                      <XCircle
                        className="text-red-500 cursor-pointer hover:scale-105 transition"
                        size={22}
                        onClick={() => order?.id && updateOrderStatus(order.id, "CANCELLED")}
                      />
                    ) : null
                  }
                  <OrderRecipt data={order} />
                </div>

              </div>


            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}