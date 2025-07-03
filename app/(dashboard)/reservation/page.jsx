"use client";

import { columns } from "./_components/columns";
import { DataTable } from "../expenses/data-table";
import { useFetch } from "@/hooks/useFetch";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/Loading";


export default function Page() {
  const queryClient = useQueryClient();
  const tableColumns = columns(queryClient);
  const { data, isLoading, isError } = useFetch("/api/reservation", ["reservation"]);

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading reservation data</div>;
  if (!data) return <div>No reservation data found</div>;


  const updatedReservations = data.map((reservation) => {
    // Create a safe date formatting function
    const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return "Invalid Date";
  }
};


    return {
      ...reservation,
      checkIn: formatDateTime(reservation.checkIn),
      checkOut: formatDateTime(reservation.checkOut),
    };
  });

  return (
    <div>
      <DataTable data={updatedReservations} columns={tableColumns} />
    </div>
  );
}