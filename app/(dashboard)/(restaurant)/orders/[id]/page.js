"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Loading from "@/components/Loading";
import OrderRecipt from "../_components/orderRecipt";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const tables = useSelector((state) => state.table.table);
  const rooms = useSelector((state) => state.room.room);
  const orderId = params?.id;

  // ✅ Include IS_PAYED
  const orderStatuses = ["PENDING", "IN_PROGRESS", "SERVED", "CANCELLED", "IS_PAYED"];

  // ✅ Label map for readability
  const orderStatusLabels = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    SERVED: "Served",
    CANCELLED: "Cancelled",
    IS_PAYED: "Paid",
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/update-status/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update order status");
      }

      toast.success("Order status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error) {
      toast.error("Failed to update order status.", {
        description: error.message,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (orderId) {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}/items`);
      if (!res.ok) throw new Error("Failed to fetch order items");
      return res.json();
    },
    enabled: !!orderId,
  });

  const formatDate = (dateString) => {
    if (!dateString || !isClient) return "";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "";
    }
  };

  const goBack = () => router.back();

  const getTableNumber = (id) => {
    const table = tables.find((t) => t.id === id);
    return table?.number || id;
  };

  const getRoomNumber = (id) => {
    const room = rooms.find((r) => r.id === id);
    return room?.number || id;
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-red-500 text-lg">Error loading order details</p>
        <Button onClick={goBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container m-auto py-8 pt-0 px-4 max-w-5xl">

      <div className="p-5">
        <Link href={`/orders`} className="text-2xl font-bold pb-5">
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Link>
      </div>
      <Card className="rounded-2xl shadow-sm border mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Order #{order.id.slice(0, 6) || "N/A"}</span>
            <div className="flex items-center space-x-2">
              <Select
                onValueChange={handleStatusChange}
                value={order.status}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {orderStatusLabels[status] || status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isUpdatingStatus && <span className="ml-2 text-sm">Updating...</span>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Placed At</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            {order.tableId && order.table ? (
              <div>
                <p className="text-muted-foreground">Table</p>
                <p className="font-medium">0{order.table.number}</p>
              </div>
            ) : null}
            {order.roomId && order.room ? (
              <div>
                <p className="text-muted-foreground">Room</p>
                <p className="font-medium">0{order.room.number}</p>
              </div>
            ) : null}
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-semibold text-lg text-foreground">
                ${parseFloat(order.total).toFixed(2)}
              </p>
          
            </div>
            <div className="mt-4 flex">
            <OrderRecipt data={order} className="textreen-500"/>
          </div>
          </div>
          {/* Print Order Receipt Button */}
          
        </CardContent>
      </Card>

      {/* Items */}
      <h2 className="text-xl font-semibold mb-4">Order Items</h2>
      {order.items && order.items.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {order.items.map((item) => (
            <Card key={item.id} className="rounded-xl border overflow-hidden pt-0">
              {item.menuItem?.imageUrl && (
                <Image
                  src={JSON.parse(item.menuItem.imageUrl)[0]}
                  alt={item.menuItem.name}
                  className="w-full h-32 object-cover"
                  width={400}
                  height={250}
                />
              )}
              <CardContent className="py-4 px-3 space-y-1">
                <h3 className="text-base font-semibold">
                  {item.menuItem?.name || "Unknown Item"}
                </h3>
                {item.notes && (
                  <p className="text-xs text-muted-foreground">{item.notes}</p>
                )}
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-muted-foreground">Qty: {item.quantity}</span>
                  <span className="font-medium text-foreground">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          No items found for this order
        </p>
      )}
    </div>
  );
}
