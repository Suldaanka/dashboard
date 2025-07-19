"use client";

import { useFetch } from "@/hooks/useFetch";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import { useSelector } from "react-redux";
import { Addroom } from "./_components/Add";
import RoomCard from "./_components/RoomCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useFetch("/api/rooms", ["rooms"]);

  const handleStatusChange = (roomId, newStatus) => {
    // Status change handler
  };

  if (isLoading) return <Loading />;
  if (isError) return <p>Error fetching Rooms</p>;

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none dark:border-0 dark:shadow-none dark:bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Rooms Management</CardTitle>
            <CardDescription>
              Manage hotel rooms and their availability status
            </CardDescription>
          </div>
          <Addroom />
        </CardHeader>
        <CardContent>
          <RoomCard data={data || []} onStatusChange={handleStatusChange} />
        </CardContent>
      </Card>
    </div>
  );
}