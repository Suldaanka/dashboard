"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPermissionsForRole } from "@/utils/permissions";

const allPages = [
  "Dashboard",
  "Rooms",
  "Tables",
  "Reservations",
  "Employees",
  "Users",
  "Orders",
  "Menu",
  "Order Details",
  "Settings"
];

const allRoles = ["ADMIN", "WAITER", "KITCHEN", "STAFF"];

const getInitialPermissions = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem("rolePermissions");
      if (stored) return JSON.parse(stored);
    } catch (err) {
      console.error("LocalStorage error:", err);
    }
  }

  return {
    ADMIN: getPermissionsForRole("ADMIN"),
    WAITER: getPermissionsForRole("WAITER"),
    KITCHEN: getPermissionsForRole("KITCHEN"),
    STAFF: getPermissionsForRole("STAFF")
  };
};

export default function SettingsPage() {
  const [permissions, setPermissions] = useState(getInitialPermissions());
  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { isLoaded, userId, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchUserRole() {
      if (!isLoaded || !userId) return;
      try {
        const token = await getToken({ template: "user_metadata" });
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role);
          if (data.role !== "ADMIN") {
            toast.error("Only admins can access settings");
            router.push("/");
          }
        }
      } catch (err) {
        console.error("Error fetching user role", err);
      }
    }

    fetchUserRole();
  }, [isLoaded, userId, getToken, router]);

  const handleToggle = (role, page) => {
    if (role === "ADMIN" && (page === "Dashboard" || page === "Settings")) return;
    setPermissions((prev) => {
      const has = prev[role].includes(page);
      return {
        ...prev,
        [role]: has ? prev[role].filter((p) => p !== page) : [...prev[role], page]
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getToken({ template: "user_metadata" });
      const res = await fetch("/api/permissions/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permissions })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update");
      }

      toast.success("Permissions updated");
      localStorage.setItem("rolePermissions", JSON.stringify(permissions));
    } catch (err) {
      toast.error(err.message || "Error saving permissions");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || userRole !== "ADMIN") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Access Control Settings</h1>
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Access Control Settings</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-4">
            Control which roles have access to each page in the system.
          </p>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  {allPages.map((page) => (
                    <TableHead key={page} className="text-center text-xs">{page}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(permissions).map((role) => (
                  <TableRow key={role}>
                    <TableCell className="font-medium">{role}</TableCell>
                    {allPages.map((page) => (
                      <TableCell key={page} className="text-center">
                        <Switch
                          checked={permissions[role].includes(page)}
                          onCheckedChange={() => handleToggle(role, page)}
                          disabled={
                            role === "ADMIN" &&
                            (page === "Dashboard" || page === "Settings")
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Notes:</h3>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Admins always have access to Dashboard and Settings</li>
            <li>Changes apply immediately to all users of that role</li>
            <li>Some combinations may be restricted by system rules</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
