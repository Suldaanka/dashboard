// /app/api/permissions/nav/route.js
import { NextResponse } from "next/server";
import { filterNavigationItems } from "@/utils/permissions";

const navMain = [
  { title: "Dashboard", url: "/", isActive: true },
  { title: "Rooms", url: "/rooms", isActive: true },
  { title: "Reservations", url: "/reservation", isActive: true },
  {
    title: "Restaurent",
    url: "#",
    hasDropdown: true,
    items: [
      { title: "Menu", url: "/menu" },
      { title: "Tables", url: "/tables" },
      { title: "Orders", url: "/orders" },
    ],
  },
  { title: "Expenses", url: "/expenses" },
  { title: "Users", url: "/users" },
  { title: "Employees", url: "/employees" },
  { title: "Settings", url: "/settings" },
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { role } = body;

    // Validate role parameter
    if (!role) {
      console.error("Missing role in request body");
      return NextResponse.json(
        { error: "Missing role parameter" }, 
        { status: 400 }
      );
    }

    console.log(`Filtering navigation for role: ${role}`);

    // Filter navigation items based on database permissions
    const filtered = await filterNavigationItems(navMain, role);
    
    // Log the filtered results for debugging
    console.log(`Filtered ${filtered.length} navigation items for role: ${role}`);
    
    if (filtered.length === 0) {
      console.warn(`No navigation items available for role: ${role}`);
    }

    return NextResponse.json({ 
      items: filtered,
      role: role,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in /api/permissions/nav:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` }, 
      { status: 500 }
    );
  }
}

// Optional: GET method to retrieve all navigation items (for admin purposes)
export async function GET() {
  try {
    return NextResponse.json({
      allItems: navMain,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in GET /api/permissions/nav:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}