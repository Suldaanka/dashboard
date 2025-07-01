"use client"
import { Edit, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { UpdateUserRoleDialog } from "./UpdateUserRoleDialog";

// Format role as badge with appropriate color
const RoleBadge = ({ role }) => {
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-500 hover:bg-red-600";
      case "writer":
        return "bg-blue-500 hover:bg-blue-600";
      case "staff":
        return "bg-green-500 hover:bg-green-600";
      case "kitchen":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Badge className={`${getRoleColor(role)} text-white`}>
      {role}
    </Badge>
  );
};

export const columns = (queryClient) => [

  { accessorKey: "name", header: "Full Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <RoleBadge role={row.original.role} />
  },
  { accessorKey: "createdAt", header: "CreatedAt" },
  {
    accessorKey: "actions",
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

      const handleDelete = async () => {
        const res = await fetch(`/api/users/delete/${user.id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          toast({
            title: "User deleted",
            description: "User has been deleted successfully",
          });
        } else {
          toast({
            title: "Delete failed",
            description: data.error || "Failed to delete user",
            variant: "destructive",
          });
        }
      };

      const handleRoleUpdate = (newRole) => {
        queryClient.setQueryData(["users"], (oldData) => {
          if (!oldData || !Array.isArray(oldData.pages)) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              users: Array.isArray(page.users)
                ? page.users.map(u =>
                  u.id === user.id ? { ...u, role: newRole } : u
                )
                : []
            })),
          };
        });

        queryClient.invalidateQueries({ queryKey: ["users"] });
      };


      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>View</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsRoleDialogOpen(true)}>
                Edit User Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isRoleDialogOpen && (
            <UpdateUserRoleDialog
              isOpen={isRoleDialogOpen}
              onClose={() => setIsRoleDialogOpen(false)}
              user={user}
              onRoleUpdate={handleRoleUpdate}
            />
          )}
        </>
      )
    },
  },
];