"use client";

import React, { Suspense, useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { toast } from "sonner";

import Link from "next/link";
import { Package2 } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import Orderside from "./(restaurant)/menu/_components/Orderside";
import { AppSidebar } from "@/components/app-sidebar";
import AccessDenied from "@/components/accessDenied";

/* ------------ which base routes each role *can* open ------------- */
const ROLE_ACCESS = {
  ADMIN: ["*"],                                  // full access
  WAITER: [
    "/menu",
    "/tables",
    "/orders",
    "/users/profile",                            // profile pages only
  ],
  KITCHEN: [
    "/orders",
    "/users/profile",
  ],
};
/* ----------------------------------------------------------------- */

/* ---------- Client‑only helper to read & act on search params ----- */
function SearchParamsHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("access_denied") === "true") {
      toast.error(
        "Access denied. You don't have permission to view that page."
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("access_denied");
      window.history.replaceState({}, "", url);
    }
  }, [searchParams]);

  return null;
}
/* ----------------------------------------------------------------- */

export default function Layout({ children }) {
  /* -------- Clerk auth & user -------- */
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();

  /* -------- Next navigation hooks ---- */
  const router = useRouter();
  const path = usePathname();

  /* -------- Page‑title state --------- */
  const [pageTitle, setPageTitle] = useState("");

  /* 1. Redirect to sign‑in when logged out */
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  /* 2. Compute page title from pathname */
  useEffect(() => {
    if (!path) return;
    const segs = path.split("/").filter(Boolean);
    const last = segs.at(-1);
    const prev = segs.at(-2);

    if (prev === "orders" && last.length > 10) setPageTitle("Order Details");
    else if (prev === "profile") setPageTitle("Profile");
    else if (prev === "menu") setPageTitle("Update Menu Item");
    else setPageTitle(last ? last[0].toUpperCase() + last.slice(1) : "");
  }, [path]);

  /* 3. Wait for Clerk to finish loading */
  if (!isLoaded || !isSignedIn || !isUserLoaded) return null;

  /* 4. Role‑based route guard */
  const role = clerkUser.publicMetadata.role;
  const allowedBases = ROLE_ACCESS[role] || [];
  const hasWildcard = allowedBases.includes("*");
  const allowed =
    hasWildcard || allowedBases.some((base) => path.startsWith(base));

  if (!allowed) {
    return <AccessDenied allowedRoutes={allowedBases} />;
  }

  /* 5. Normal layout */
  return (
    <div className="flex flex-col h-screen">
      {/* Handle ?access_denied param safely on client side */}
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>

      <SidebarProvider>
        <div className="flex flex-row h-full w-full">
          {/* Left sidebar */}
          <AppSidebar />

          {/* Main area */}
          <SidebarInset className="flex-1 flex flex-col">
            {/* Top bar */}
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

            {/* Scrollable body */}
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-auto p-4">{children}</div>
            </div>
          </SidebarInset>

          {/* Optional right‑hand order sidebar */}
          {(path?.includes("/menu") || path?.includes("/restaurant")) && (
            <Orderside />
          )}
        </div>
      </SidebarProvider>
    </div>
  );
}
