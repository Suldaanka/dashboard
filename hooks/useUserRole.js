import { useUser } from "@clerk/nextjs";

export default function useUserRole() {
  const { user, isLoaded } = useUser();
  
  // Wait for user data to load and provide default values
  const userRole = user?.publicMetadata?.role || "USER";
  const isAdmin = userRole === "ADMIN";
  
  return { 
    userRole, 
    isAdmin,
    isLoaded, // Also return loading state in case you need it
    user 
  };
}