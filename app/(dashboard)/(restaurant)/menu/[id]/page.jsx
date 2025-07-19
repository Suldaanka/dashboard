// app/menu/[id]/page.jsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { UpdateMenuItem } from "../_components/UpdateMenuItem";

export default function Page() {
  const params = useParams();
  const id = params?.id;

  if (!id || typeof id !== "string") {
    return <div className="text-red-500 p-4">Invalid item ID</div>;
  }

  return <UpdateMenuItem id={id} />;
}
