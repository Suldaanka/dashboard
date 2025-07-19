// components/withRoleAccess.jsx
"use client"

import React from "react"
import { useUser } from "@clerk/nextjs"
import AccessDenied from "./accessDenied"


export default function withRoleAccess(WrappedComponent, allowedRoles = []) {
  return function ProtectedComponent(props) {
    const { user, isLoaded } = useUser()

    if (!isLoaded) return null

    const role = user?.publicMetadata?.role

    if (!allowedRoles.includes(role)) {
      return <AccessDenied role={role} />
    }

    return <WrappedComponent {...props} />
  }
}
