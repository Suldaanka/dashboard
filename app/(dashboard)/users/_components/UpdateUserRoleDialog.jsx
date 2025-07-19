"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const UpdateUserRoleDialog = ({ isOpen, onClose, user, onRoleUpdate }) => {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { value: "ADMIN", label: "ADMIN" },
    { value: "WAITER", label: "WAITER" },
    { value: "STAFF", label: "STAFF" },
    { value: "KITCHEN", label: "KITCHEN" },
  ];

  const handleRoleChange = async () => {
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/update-role/${user.clerkId}`, {
        method: "PUT", // Changed from PATCH to PUT to match backend
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          role: selectedRole 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Role updated successfully");
        onRoleUpdate(selectedRole);
        onClose();
      } else {
        toast.error(data.error || "Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("An error occurred while updating the role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update User Role for {user.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-2 text-sm text-gray-500">
            Current role: <span className="font-medium">{user.role}</span>
          </div>
          <Select
            defaultValue={user.role}
            value={selectedRole}
            onValueChange={setSelectedRole}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select new role" className="text-stone-800" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleRoleChange}
            disabled={isSubmitting || selectedRole === user.role}
            className={`${selectedRole === user.role ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};