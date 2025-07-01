"use client"


import * as React from "react"
import {
  Users,
  House,
  BedDouble,
  Settings2,
  Utensils,
  LayoutDashboard,
  CircleDollarSign,
  UserCog,
  User,
  GalleryVerticalEnd,
  AudioWaveform,
  Command
} from "lucide-react"

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
import { NavProjects } from "./nav-projects"
import Image from "next/image"



const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Rooms",
      url: "/rooms",
      icon: House,
      isActive: true,
    },
    {
      title: "Reservations",
      url: "/reservation",
      icon: BedDouble,
      isActive: true,
    },
    {
      title: "Restaurent",
      url: "#",
      icon: Utensils,
      hasDropdown: true,
      items: [
        {
          title: "Menu",
          url: "/menu",
        },
        {
          title: "Tables",
          url: "/tables",
        },
        {
          title: "Orders",
          url: "/orders",
        },
      ],
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: CircleDollarSign,
      hasDropdown: false
    },
    {
      title: "Users",
      url: "/users",
      icon: User,
      hasDropdown: false
    },
    {
      title: "Employees",
      url: "/employees",
      icon: Users,
      hasDropdown: false
    }
  ],
  teams: [
    {
      name: "Iftin Hotels",
      logo: "/logo.png",
      plan: "Enterprise",
    },
  ],
}

export function AppSidebar({ ...props }) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
       <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
