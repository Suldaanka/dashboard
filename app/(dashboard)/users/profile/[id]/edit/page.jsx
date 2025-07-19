"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import EditUserProfile from "../../../_components/EditUserProfile";


export default function EditUserProfileWrapper() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found. Please log in.</div>;
  }

  return <EditUserProfile userId={user.id} currentUserRole={user.publicMetadata?.role || "USER"} />;
}
