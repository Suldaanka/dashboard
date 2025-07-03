import { filterNavigationItems } from "@/utils/permissions";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

        // console.log("Role received:", role); // Remove console logs as they are not visible

        const fullNavItems = [
      { title: "Dashboard", url: "/", icon: "home", permissionKey: "dashboard" },
      { title: "Rooms", url: "/rooms", icon: "bed", permissionKey: "rooms" },
      { title: "Reservations", url: "/reservation", icon: "calendar", permissionKey: "reservation" },
      { title: "Menu", url: "/menu", icon: "utensils", permissionKey: "menu" },
      { title: "Tables", url: "/tables", icon: "chair", permissionKey: "tables" },
      { title: "Orders", url: "/orders", icon: "receipt", permissionKey: "orders" },
      { title: "Expenses", url: "/expenses", icon: "dollarSign", permissionKey: "expenses" },
      { title: "Users", url: "/users", icon: "users", permissionKey: "users" },
      { title: "Employees", url: "/employees", icon: "users", permissionKey: "employees" },
      { title: "Settings", url: "/settings", icon: "settings", permissionKey: "settings" },
      { title: "Profile", url: "/profile", icon: "user", permissionKey: "profile" },
    ];

    // Map permission keys to the pagePathMap in utils/permissions.js
    const navItemsWithMappedKeys = fullNavItems.map(item => ({
      ...item,
      // permissionKey is already defined in fullNavItems, but adding this for clarity if structure changes
    }));

        // console.log("Full navigation items before filtering:", fullNavItems); // Remove console logs as they are not visible

    // Bypass permission filtering to display all items
    return NextResponse.json({ items: fullNavItems });
  } catch (error) {
    console.error("Error filtering navigation items:", error);
    return NextResponse.json(
      { error: "Failed to filter navigation items" },
      { status: 500 }
    );
  }
}