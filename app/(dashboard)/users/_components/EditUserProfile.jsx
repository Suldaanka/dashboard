"use client";

import React, { useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Save,
  ArrowLeft,
  Upload,
  Trash2
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link'; // Standard Next.js import
import { useRouter } from 'next/navigation'; // Standard Next.js import
// Adjusted paths for custom hooks, assuming they are in a 'hooks' directory
// that is a sibling to the 'app' directory at your project root.
import { useFetch } from "@/hooks/useFetch";
import { useMutate } from "@/hooks/useMutate";


// Add currentUserRole prop to control role editing permissions
const EditUserProfile = ({ userId, currentUserRole }) => {
  const router = useRouter();

  const { data: fetchedUserData, isLoading, isError, error: fetchError } = useFetch(
    typeof window !== "undefined" && userId ? `/api/users/${userId}` : null,
    ['user', userId],
    userId
  );

  const [userData, setUserData] = useState({
    id: "",
    clerkId: "",
    name: "",
    email: "",
    imageUrl: null,
    role: "USER",
    createdAt: "",
    updatedAt: ""
  });

  // Declare the missing 'error' state variable
  const [error, setError] = useState(null); 

  useEffect(() => {
    if (fetchedUserData) {
      setUserData(fetchedUserData);
    }
  }, [fetchedUserData]);

  const { execute: updateUser, isPending: isUpdating, isError: isUpdateError, error: updateError } = useMutate(
    typeof window !== "undefined" && userId ? `/api/users/update/${userId}` : null,
    ['user', userId],
    { method: 'PATCH' }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Determine if the role select should be disabled
  // It's disabled if the current user is NOT an ADMIN.
  const isRoleSelectDisabled = currentUserRole !== 'ADMIN';

  // Get initials from name for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value) => {
    // Only allow role change if not disabled by permissions
    if (!isRoleSelectDisabled) {
      setUserData(prev => ({
        ...prev,
        role: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // In a real app, you would upload this file to a server
      // and get back a URL to save in userData.imageUrl
      // For now, this preview won't actually update the backend imageUrl without an upload mechanism.
      // If you intend to save this image, you'll need to implement file upload logic here.
      // For demonstration, we'll assume imageUrl is updated externally or handled by another process.
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    // Also clear the imageUrl from userData if it should be removed from the backend
    setUserData(prev => ({
      ...prev,
      imageUrl: null
    }));
    // In a real implementation, you would also clear the file input
    // and potentially delete the image from storage if it exists
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Clear previous errors

    try {
      // Create a payload that only includes fields supported by the API.
      // The update API only supports updating name and imageUrl.
      const payload = {
        name: userData.name,
        imageUrl: userData.imageUrl // This would be the new URL after image upload
      };
      
      await updateUser(payload); // Pass the updated user data
      setSuccess(true);
      setTimeout(() => {
        // Validate clerkId before navigation to prevent [object Object] errors
        if (userData && userData.clerkId && typeof userData.clerkId === 'string') {
          router.push(`/users/profile/${userData.clerkId}`);
        } else {
          // Handle invalid ID gracefully
          toast.error("Invalid user ID for navigation");
          router.push('/users'); // Fallback to users list
        }
      }, 1500);
    } catch (err) {
      // Use err.message or a default message for display
      setError(err.message || "Failed to update profile. Please try again.");
      // Error already handled with setError
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500">
        <svg className="animate-spin h-8 w-8 text-blue-500 mr-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading user data...
      </div>
    );
  }

  // Ensure fetchError is properly handled and has a message property
  if (isError) {
    return <div className="p-4 pt-0 text-center text-red-500">Error: {fetchError?.message || "Failed to load user data."}</div>;
  }

  if (!userData.id) {
    return <div className="p-4 pt-0 text-center text-gray-500">No user data found.</div>;
  }

  return (
    <div className="p-4 pt-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
        
        <Button variant="outline" size="sm" className="flex items-center text-gray-700 hover:bg-gray-50" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </Button>
      </div>
      
      <Card className="overflow-hidden shadow-lg rounded-lg">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 flex flex-col items-center">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              {imagePreview || userData.imageUrl ? (
                <img 
                  src={imagePreview || userData.imageUrl} 
                  alt={userData.name} 
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/96x96/aabbcc/ffffff?text=N/A'; }} // Fallback for broken image
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-800 text-xl font-semibold">
                  {getInitials(userData.name)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="absolute -bottom-2 -right-2 flex space-x-1">
              <div className="relative">
                <input
                  type="file"
                  id="profile-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </label>
              </div>
              
              {(imagePreview || userData.imageUrl) && (
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="h-8 w-8 rounded-full shadow-md hover:bg-red-600 transition-colors"
                  onClick={removeImage}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-center text-white">
            <h2 className="text-xl font-semibold">{userData.name}</h2>
            <p className="text-blue-100 text-sm">{userData.email}</p>
          </div>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {success && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
              Profile updated successfully! Redirecting...
            </div>
          )}
          
          {(error || isUpdateError) && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
              {error || updateError?.message || "An unknown error occurred."}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center text-gray-700">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center text-gray-700">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="role" className="block mb-1 text-gray-700">
                  Role
                </Label>
                <Select
                  value={userData.role}
                  onValueChange={handleRoleChange}
                  disabled={isRoleSelectDisabled} /* Disable based on currentUserRole */
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="WAITER">Waiter</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Note: Changing roles may affect system permissions. Only administrators can change roles.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">System Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 font-mono text-gray-800">{userData.id}</dd>
                </div>

                <div>
                  <dt className="font-medium text-gray-500">Clerk ID</dt>
                  <dd className="mt-1 font-mono text-gray-800">{userData.clerkId}</dd>
                </div>

                <div>
                  <dt className="font-medium text-gray-500">Account Created</dt>
                  <dd className="mt-1 text-gray-800">
                    {new Date(userData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </dl>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              System information cannot be edited
            </p>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Link href={`/users/profile/${userData.clerkId}`}>
              <Button type="button" variant="outline" className="text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              disabled={isSubmitting || isUpdating}
            >
              {isSubmitting || isUpdating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditUserProfile;
