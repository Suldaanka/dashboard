"use client"

import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMutate } from '@/hooks/useMutate';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import useUserRole from "@/hooks/useUserRole";
export default function RoomCard({ data, onStatusChange }) {
  const { userRole, isAdmin } = useUserRole();
  // Check if data is an array
  if (!Array.isArray(data)) {
    return (
      <div className="flex justify-center items-center h-64 w-full border rounded-lg">
        <div className="text-center p-6">
          <div className="animate-pulse w-16 h-16 mb-4 rounded-full bg-muted mx-auto"></div>
          <p className="text-muted-foreground">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Alert variant="default" className="h-64 flex items-center justify-center">
        <AlertDescription className="text-center">
          No rooms available
        </AlertDescription>
      </Alert>
    );
  }

  // Function to render a single room card with editable status
  const RoomCardItem = ({ room }) => {
    const [status, setStatus] = useState(room.status);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const { mutate: updateStatus } = useMutate(`/api/rooms/update/${room.id}`, ['rooms'], { method: 'PUT' });
    const { mutate: deleteRoom } = useMutate(`/api/rooms/delete/${room.id}`, ['rooms'], { method: 'DELETE' });
    
    const handleStatusChange = (newStatus) => {
      setStatus(newStatus);
      setIsStatusDialogOpen(false);
      
      // Update the room status in the database
      updateStatus({ status: newStatus }, {
        onSuccess: () => {
          toast.success("Room status updated successfully!");
          queryClient.invalidateQueries({ queryKey: ["rooms"] });
          
          // Call the parent handler if provided
          if (onStatusChange) {
            onStatusChange(room.id, newStatus);
          }
        },
        onError: (error) => {
          toast.error("Failed to update room status");
          setStatus(room.status); // Revert to original status on error
        }
      });
    };

    const handleDelete = () => {
      deleteRoom({}, {
        onSuccess: () => {
          toast.success("Room deleted successfully!");
          queryClient.invalidateQueries({ queryKey: ["rooms"] });
        },
        onError: (error) => {
          toast.error("Failed to delete room");
        }
      });
    };

    // Room styles based on status
    const getRoomColor = () => {
      switch (status) {
        case "OCCUPIED":
          return "bg-destructive/20 border-destructive/50";
        case "MAINTENANCE":
          return "bg-warning/20 border-warning/50";
        case "AVAILABLE":
        default:
          return "bg-success/20 border-success/50";
      }
    };
    
    // Determine room shape based on type
    let roomShape;
    let roomIcon;
    
    switch (room.type) {
      case "SINGLE":
        roomShape = "w-24 h-24";
        roomIcon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v11m0-7h18m0-4v11m-9-7v7" />
          </svg>
        );
        break;
      case "DOUBLE":
        roomShape = "w-32 h-24";
        roomIcon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v11m0-7h18m0-4v11m-12-7v7m6-7v7" />
          </svg>
        );
        break;
      case "SUITE":
        roomShape = "w-40 h-32";
        roomIcon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20M10 5v14" />
          </svg>
        );
        break;
      default:
        roomShape = "w-24 h-24";
        roomIcon = (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v11m0-7h18m0-4v11m-9-7v7" />
          </svg>
        );
    }
    
    return (
      <div className="border rounded-lg shadow-sm p-4 hover:shadow transition-all duration-300 w-64 bg-card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg text-card-foreground">Room #{room.number}</h3>
          <div className="flex items-center gap-2">
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
              <DialogTrigger asChild>
              <button
  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border-2 ${
    status === "OCCUPIED"
      ? "bg-red-200 hover:bg-red-300 text-red-800"
      : status === "MAINTENANCE"
      ? "bg-yellow-200 hover:bg-yellow-300 text-yellow-800"
      : "bg-green-200 hover:bg-green-300 text-green-800"
  }`}
>
  {status}
</button>

              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Room Status</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 p-2">
                  <button 
                    onClick={() => handleStatusChange("AVAILABLE")}
                    className="px-3 py-1.5 text-xs font-medium bg-success/10 text-success-foreground rounded-md hover:bg-success/20 transition-colors duration-200 flex items-center gap-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    Available
                  </button>
                  <button 
                    onClick={() => handleStatusChange("OCCUPIED")}
                    className="px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive-foreground rounded-md hover:bg-destructive/20 transition-colors duration-200 flex items-center gap-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-destructive"></span>
                    Occupied
                  </button>
                  <button 
                    onClick={() => handleStatusChange("MAINTENANCE")}
                    className="px-3 py-1.5 text-xs font-medium bg-warning/10 text-warning-foreground rounded-md hover:bg-warning/20 transition-colors duration-200 flex items-center gap-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-warning"></span>
                    Maintenance
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            {
              isAdmin &&(
                <button
                onClick={handleDelete}
                className="p-1.5 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete Room"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
              )
            }
          </div>
        </div>
        
        <div className="flex flex-col items-center pt-4 pb-4">
          <div className="relative">
            {/* Render room */}
            <div 
              className={`${getRoomColor()} ${roomShape} border shadow-sm rounded-md flex items-center justify-center transition-colors duration-300`}
            >
              <div className="flex flex-col items-center">
                {roomIcon}
                <span className="text-sm font-bold text-card-foreground mt-2">#{room.number}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-center border-t border-border pt-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium">{room.type}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm font-medium">${room.price}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-2 rounded-xl">
      <div className="flex flex-wrap gap-6">
        {data.map((room) => (
          <RoomCardItem key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}