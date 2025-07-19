"use client"
import { MoreHorizontal } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { queryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Update } from "./update";



const RoleBadge = ({ status }) => {
  const getstatusColor = (status) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-red-500 hover:bg-red-600";
      case "CONFIRMED":
        return "bg-blue-500 hover:bg-blue-600";
      case "CANCELLED":
        return "bg-green-500 hover:bg-green-600";
      case "COMPLETED":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };


  return (
    <Badge className={`${getstatusColor(status)} text-white`}>
      {status}
    </Badge>
  );
};


export   const columns  = (queryClient) => [
  
  { accessorKey: "fullName", header: "Full Name" },
  { accessorKey: "room.number", header: "Room" },
  { accessorKey: "checkIn", header: "checkIn" },
  { accessorKey: "checkOut", header: "checkOut" },
  { 
    accessorKey: "status", 
    header: "Status",
     cell: ({ row }) => <RoleBadge status={row.original.status} />
  },
  
  {
    accessorKey: "actions", header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const reservation = row.original

      const id = row.original.id;

      const handleDelete = async () => {
        const res = await fetch(`/api/reservation/delete/${id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["reservation"] });
        } else {
          alert(data.error || "Failed to delete");
        }
      };
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Update reservation={reservation}/>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(reservation.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];
