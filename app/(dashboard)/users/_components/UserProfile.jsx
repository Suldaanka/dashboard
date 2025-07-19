"use client";

import React from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Clock, 
  Edit2, 
  Settings,
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { SignedOut, SignOutButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { useFetch } from '@/hooks/useFetch';
import Loading from '@/components/Loading';

const UserProfile = () => {
  const { userId } = typeof window !== "undefined" ? useAuth() : { userId: null };

  const { data: userData, isLoading, isError, error } = typeof window !== "undefined" && userId ? useFetch(
    `/api/users/${userId}`,
    ['user', userId],
    userId
  ) : { data: null, isLoading: false, isError: false, error: null };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get initials from name for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role badge style
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'WAITER':
        return 'bg-green-100 text-green-800';
      case 'USER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (typeof window === "undefined" || isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <div className="p-4 pt-0 text-center text-red-500">Error: {error?.message || "Failed to load user data."}</div>;
  }

  if (!userData) {
    return <div className="p-4 pt-0 text-center">No user data found.</div>;
  }

  return (
    <div className="p-4 pt-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        
        <div className="flex space-x-2">
          <Link href="/settings">
            <Button variant="outline" size="sm" className="flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </Link>
          <Link href={`/users/profile/${userData.clerkId}/edit`}>
            <Button size="sm" className="flex items-center bg-blue-600 text-white hover:bg-blue-700">
              <Edit2 className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>
      
      <Card className="overflow-hidden pt-0">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
            <Avatar className="h-24 w-24 border-4 border-white">
              {userData.imageUrl ? (
                <img src={userData.imageUrl} alt={userData.name} className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                  {getInitials(userData.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="md:ml-6 mt-4 md:mt-0 text-white">
              <h2 className="text-3xl font-bold">{userData.name}</h2>
              <div className="flex flex-col md:flex-row md:items-center mt-2 space-y-2 md:space-y-0 md:space-x-4">
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="h-4 w-4 mr-1 opacity-75" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Shield className="h-4 w-4 mr-1 opacity-75" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(userData.role)}`}>
                    {userData.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Personal Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="mt-1">{userData.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="mt-1">{userData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="mt-1">{userData.role}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="mt-1">{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="mt-1">{formatDate(userData.updatedAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="mt-1 font-mono text-sm truncate">{userData.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">System Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-gray-800">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="flex justify-between md:block">
                  <dt className="font-medium text-gray-500">User ID</dt>
                  <dd className="md:mt-1 font-mono">{userData.id}</dd>
                </div>
                
                <div className="flex justify-between md:block">
                  <dt className="font-medium text-gray-500">Clerk ID</dt>
                  <dd className="md:mt-1 font-mono">{userData.clerkId}</dd>
                </div>
                
                <div className="flex justify-between md:block">
                  <dt className="font-medium text-gray-500">Account Created</dt>
                  <dd className="md:mt-1">{formatDate(userData.createdAt)}</dd>
                </div>
                
                <div className="flex justify-between md:block">
                  <dt className="font-medium text-gray-500">Account Age</dt>
                  <dd className="md:mt-1">
                    {userData.createdAt ? Math.floor((new Date() - new Date(userData.createdAt)) / (1000 * 60 * 60 * 24)) : 'N/A'} days
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <SignOutButton variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex items-center">
              <LogOut className="h-4 w-4 mr-1" />
            </SignOutButton>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;