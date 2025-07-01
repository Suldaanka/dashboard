"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { Package2 } from "lucide-react";
import Link from "next/link";
import Orderside from "./(restaurant)/menu/_components/Orderside";

export default function Layout({ children }) {
  // ✅ Always call all hooks unconditionally
  const { isSignedIn, isLoaded } = useAuth();
  const path = usePathname(); // always call
  const router = useRouter(); // always call
  const [pageTitle, setPageTitle] = useState("");

  // ✅ Redirect as a side-effect only after all hooks are called
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // ✅ Set page title
  useEffect(() => {
  if (!path) return;

  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const secondLast = segments[segments.length - 2];

  if (segments.length >= 2 && secondLast === "orders" && last.length > 10) {
    setPageTitle("Order Details");
  } else if (segments.length >= 2 && secondLast === "profile") {
    setPageTitle("Profile");
  } else if (segments.length >= 2 && secondLast === "menu") {
    // This will match /menu/someId
    setPageTitle("Update Menu Item");
  } else {
    if (last) {
      setPageTitle(last.charAt(0).toUpperCase() + last.slice(1));
    } else {
      setPageTitle("");
    }
  }
}, [path]);

  // ✅ Optionally show nothing while loading
  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="flex flex-col h-screen">
      <SidebarProvider>
        <div className="flex flex-row h-full w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
              </div>
              <div className="flex-1">{pageTitle}</div>
              <div className="flex items-center gap-2 px-4">
                <Link href="/menu" className="text-gray-400">
                  <Package2 size={18} />
                </Link>
                <ModeToggle />
                <UserButton />
              </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-auto p-4">{children}</div>
            </div>
          </SidebarInset>

          {(path?.includes("/menu") || path?.includes("/restaurant")) && (
            <Orderside />
          )}
        </div>
      </SidebarProvider>
    </div>
  );
}
