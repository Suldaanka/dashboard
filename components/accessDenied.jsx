"use client";

import React from "react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/**
 * @param {string[]} allowedRoutes  routes the user IS allowed to open
 */
export default function AccessDenied({ allowedRoutes = [] }) {
  /* Convert route path → readable label */
  const label = (route) => {
    if (route === "/") return "Dashboard";
    if (route.startsWith("/orders/")) return "Order Details";
    if (route.startsWith("/users/profile")) return "Profile";

    const seg = route.replace(/^\//, "");
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  };

  const hasWildcard = allowedRoutes.includes("*");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-center relative">
      {/* translucent backdrop using slate palette */}
      <div className="absolute inset-0 backdrop-blur-sm bg-slate-200/70 dark:bg-slate-900/70" />

      <div
        className="
          relative z-10 max-w-md w-full p-10 text-center rounded-2xl shadow-2xl backdrop-blur-lg
          bg-white/80 ring-1 ring-slate-900/10
          dark:bg-slate-800/60 dark:ring-slate-300/20
        "
      >
        <h1 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-100">
          Access Denied
        </h1>

        <p className="text-lg mb-2 text-slate-600 dark:text-slate-300">
          You don’t have permission to view this page.
        </p>

        {hasWildcard ? (
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            You can still access other parts of the system.
          </p>
        ) : (
          <>
            <p className="mb-4 text-slate-600 dark:text-slate-300">
              Pages you can access:
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {allowedRoutes.map((r) => (
                <Button
                  key={r}
                  asChild
                  variant="outline"
                  className="
                    bg-white/60 hover:bg-white/80
                    dark:bg-slate-700/40 dark:hover:bg-slate-700/60
                    border-slate-300/70 dark:border-slate-600/40
                    backdrop-blur-sm
                  "
                >
                  <Link href={r}>{label(r)}</Link>
                </Button>
              ))}
            </div>
          </>
        )}

        <SignOutButton>
          <Button variant="destructive" size="lg">
            Sign&nbsp;Out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
