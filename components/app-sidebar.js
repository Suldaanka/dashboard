"use client"

import * as React from "react"
import {
  Users,
  House,
  BedDouble,
  Utensils,
  LayoutDashboard,
  CircleDollarSign,
  User,
} from "lucide-react"

import { useUser } from "@clerk/nextjs"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"

const data = {
  navMain: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard, isActive: true },
    { title: "Rooms", url: "/rooms", icon: House, isActive: true },
    { title: "Reservations", url: "/reservation", icon: BedDouble, isActive: true },
    {
      title: "Restaurent",
      url: "#",
      icon: Utensils,
      hasDropdown: true,
      items: [
        { title: "Menu", url: "/menu" },
        { title: "Tables", url: "/tables" },
        { title: "Orders", url: "/orders" },
      ],
    },
    { title: "Expenses", url: "/expenses", icon: CircleDollarSign, hasDropdown: false },
    { title: "Users", url: "/users", icon: User, hasDropdown: false },
    { title: "Employees", url: "/employees", icon: Users, hasDropdown: false },
  ],
  teams: [
    {
      name: "Iftin Hotels",
      logo: "/logo.png",
      plan: "Enterprise",
    },
  ],
}

export function AppSidebar(props) {
  const { user: clerkUser, isLoaded } = useUser()

  // Avoid flash while Clerk is loading
  if (!isLoaded) return null

  const role = clerkUser?.publicMetadata?.role // "ADMIN", "WAITER", "KITCHEN"

  // ------- role‑based nav filtering -------
  let filteredNavMain = []

  if (role === "ADMIN") {
    filteredNavMain = data.navMain
  } else if (role === "WAITER") {
    const restaurent = data.navMain.find(i => i.title === "Restaurent")
    if (restaurent) {
      filteredNavMain = [
        {
          ...restaurent,
          items: restaurent.items.filter(sub =>
            ["Menu", "Tables", "Orders"].includes(sub.title)
          ),
        },
      ]
    }
  } else if (role === "KITCHEN") {
    const restaurent = data.navMain.find(i => i.title === "Restaurent")
    if (restaurent) {
      filteredNavMain = [
        {
          ...restaurent,
          items: restaurent.items.filter(sub => sub.title === "Orders"),
        },
      ]
    }
  }
  // ----------------------------------------

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
