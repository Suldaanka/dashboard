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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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


export   const columns  = (queryClient) => [

  
  
  { accessorKey: "name", header: "Full Name" },
  { accessorKey: "email", header: "Email" },
   {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <RoleBadge role={row.original.role} />
  },
  {
    accessorKey: "actions", header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      const id = user.clerkId; // Use clerkId as the user ID

      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [selectedRole, setSelectedRole] = useState(user.role);

      const handleEditRole = async () => {
        const res = await fetch(`/api/users/update/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: selectedRole }),
        });

        const data = await res.json();

        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          setIsEditDialogOpen(false);
        } else {
          alert(data.message || "Failed to update role");
        }
      };

      const handleDelete = async () => {
        const res = await fetch(`/api/users/delete/${id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["users"] });
        } else {
          alert(data.error || "Failed to delete");
        }
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit Role</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(user.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Role for {user.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="MANAGER">MANAGER</SelectItem>
                    <SelectItem value="WAITER">WAITER</SelectItem>
                    {/* Add other roles as needed */}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleEditRole}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
