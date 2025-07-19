"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/nextjs";

import { useFetch } from "@/hooks/useFetch";
import Loading from "@/components/Loading";
import OrderCardList from "./_components/OrderCardList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { QrReader } from "react-qr-reader";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "SERVED", "CANCELLED", "IS_PAYED"];



const STATUS_COLORS = {
  PENDING: "bg-yellow-500 hover:bg-yellow-600",
  IN_PROGRESS: "bg-blue-500 hover:bg-blue-600", 
  SERVED: "bg-green-500 hover:bg-green-600",
  CANCELLED: "bg-red-500 hover:bg-red-600",
  IS_PAYED: "bg-purple-500 hover:bg-purple-600",
  all: "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
};

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { user: reduxUser, status: reduxStatus } = useSelector((state) => state.user);
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const { user: clerkUser, isLoaded: isClerkUserLoaded } = useUser();
  
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchId, setSearchId] = useState("");
  
  // Determine which user data to use
  let user = null;
  let userRole = null;
  
  if (reduxUser && reduxStatus === 'succeeded') {
    user = reduxUser;
    userRole = reduxUser.role;
  } else if (clerkUser && userId) {
    user = {
      id: clerkUser.id,
      name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      email: clerkUser.emailAddresses[0]?.emailAddress,
      image: clerkUser.imageUrl,
      role: clerkUser.publicMetadata?.role || 'USER'
    };
    userRole = clerkUser.publicMetadata?.role || 'USER';
  }
  
  // Only fetch orders if we have a user (from either source)
  const shouldFetchOrders = !!(user || (isAuthLoaded && userId));
  
  const { data, isLoading, isError } = useFetch(
    shouldFetchOrders ? "/api/orders" : null, 
    ["orders"]
  );
  
  // Show loading while authentication is still loading
  if (!isAuthLoaded || !isClerkUserLoaded) {
    return <Loading />;
  }
  
  // Show loading while user state is loading (but only if we don't have Clerk user as fallback)
  if (reduxStatus === 'loading' && !clerkUser) {
    return <Loading />;
  }
  
  // If no user data available from either source, redirect to login
  if (!user) {
    router.push('/sign-in');
    return null;
  }
  
  // Redirect immediately if user role is not allowed
  if (userRole !== 'WAITER' && userRole !== 'ADMIN') {
    router.push('/');
    return null;
  }
  
  if (isLoading) return <Loading />;
  
  if (isError) return (
    <Card className="m-4">
      <CardContent className="pt-6">
        <div className="text-center text-destructive">
          Error loading orders data
        </div>
      </CardContent>
    </Card>
  );
  
  if (!data) return (
    <Card className="m-4">
      <CardContent className="pt-6">
        <div className="text-center text-muted-foreground">
          No orders data found
        </div>
      </CardContent>
    </Card>
  );
  
  const filteredData = data.filter((order) => {
    const matchStatus =
      statusFilter === "all" || order.status === statusFilter;
    
    const matchSearch =
      searchId.trim() === "" ||
      order.id.toLowerCase().includes(searchId.trim().toLowerCase());
    
    return matchStatus && matchSearch;
  });

  const formatStatusText = (status) => {
    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Order Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Filter Buttons */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                className={cn(
                  statusFilter === "all" && STATUS_COLORS.all,
                  statusFilter === "all" ? "text-white dark:text-white light:text-black" : ""
                )}
              >
                All
                <Badge variant="secondary" className="ml-2">
                  {data.length}
                </Badge>
              </Button>
              
              {STATUS_OPTIONS.map((status) => {
                const count = data.filter(order => order.status === status).length;
                return (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      statusFilter === status && STATUS_COLORS[status],
                      statusFilter === status && "text-white dark:text-white light:text-black"
                    )}
                  >
                    {formatStatusText(status)}
                    <Badge 
                      variant={statusFilter === status ? "secondary" : "outline"} 
                      className="ml-2"
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Search Input and QR Scanner */}
            <div className="w-full md:w-64 flex gap-2 items-center">
              <Input
                type="text"
                placeholder="Search by order ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full"
              />
              <div style={{ width: 32, height: 32 }}>
                <QrReader
                  onResult={(result, error) => {
                    if (!!result) {
                      setSearchId(result?.text || "");
                    }
                  }}
                  constraints={{ facingMode: "environment" }}
                  containerStyle={{ width: "100%", height: "100%" }}
                  videoStyle={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredData.length} of {data.length} orders
            </span>
            {searchId && (
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => setSearchId("")}
              >
                Clear search
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p>
                {searchId 
                  ? `No orders match your search "${searchId}"` 
                  : `No orders with status "${formatStatusText(statusFilter)}"`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <OrderCardList data={filteredData} />
      )}
    </div>
  );
}