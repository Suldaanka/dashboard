"use client";

import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash } from "lucide-react";

export default function TableCard({ data, onStatusChange, isAdmin }) {
  if (!Array.isArray(data)) {
    return (
      <div className="flex justify-center items-center h-64 w-full border rounded-lg">
        <div className="text-center p-6">
          <div className="animate-pulse w-16 h-16 mb-4 rounded-full bg-muted mx-auto"></div>
          <p className="text-muted-foreground">Loading tables...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Alert variant="default" className="h-64 flex items-center justify-center">
        <AlertDescription className="text-center">No tables available</AlertDescription>
      </Alert>
    );
  }

  const TableCardItem = ({ table, isAdmin }) => {
    const [status, setStatus] = useState(table.status);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    // const mutate = useMutate(); // Uncomment if useMutate is actively used

    const handleStatusChange = async (newStatus) => {
      setStatus(newStatus);
      setIsEditing(false);
      try {
        const response = await fetch(`/api/table/updateStatus/${table.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            throw new Error("Failed to update status");
        }

        if (onStatusChange) onStatusChange(table.id, newStatus);
      } catch (error) {
        alert("Failed to update status");
        console.error("Error updating table status:", error);
        // Optionally revert status if update fails
        // setStatus(table.status); 
      }
    };

    const handleDelete = async () => {
      try {
        const response = await fetch(`/api/table/delete/${table.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete table");
        }

        alert(`Table ${table.id} deleted successfully`);
        window.location.reload(); // This will refresh the page to reflect the deletion
      } catch (error) {
        alert("Failed to delete table");
        console.error("Error deleting table:", error);
      } finally {
        setShowConfirm(false);
      }
    };

    const getTableColor = () => {
      return status === "OCCUPIED"
        ? "bg-destructive/20 border-destructive/50"
        : "bg-success/20 border-success/50";
    };

    const getChairColor = () => {
      return status === "OCCUPIED"
        ? "bg-destructive/30 border-destructive/50"
        : "bg-success/30 border-success/50";
    };

    let tableShape;
    let chairPositions = [];

    if (table.capacity <= 2) {
      tableShape = "rounded-full w-16 h-16";
      chairPositions = [
        { top: "-6", left: "4", rotate: "0" },
        { top: "16", left: "4", rotate: "180" },
      ];
    } else if (table.capacity <= 4) {
      tableShape = "rounded-md w-20 h-20";
      chairPositions = [
        { top: "-16", left: "26", rotate: "0" },
        { top: "80", left: "26", rotate: "180" },
        { top: "30", left: "-22", rotate: "-90" },
        { top: "30", left: "70", rotate: "90" },
      ];
    } else if (table.capacity <= 6) {
      tableShape = "rounded-md w-32 h-20";
      chairPositions = [
        { top: "-16", left: "18", rotate: "0" },
        { top: "-16", left: "80", rotate: "0" },
        { top: "80", left: "16", rotate: "180" },
        { top: "80", left: "80", rotate: "180" },
        { top: "30", left: "-23", rotate: "-90" },
        { top: "30", left: "120", rotate: "90" },
      ];
    } else {
      tableShape = "rounded-md w-40 h-24";
      chairPositions = [
        { top: "-6", left: "4", rotate: "0" },
        { top: "-6", left: "16", rotate: "0" },
        { top: "-6", left: "28", rotate: "0" },
        { top: "24", left: "4", rotate: "180" },
        { top: "24", left: "16", rotate: "180" },
        { top: "24", left: "28", rotate: "180" },
        { top: "8", left: "-6", rotate: "-90" },
        { top: "8", left: "40", rotate: "90" },
      ];
    }

    // Ensure we only render chairs up to the table's capacity
    chairPositions = chairPositions.slice(0, table.capacity);

    return (
      <div className="border rounded-lg shadow-sm p-4 hover:shadow transition-all duration-300 w-64 bg-card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg text-card-foreground">Table #{table.number}</h3>
          {isEditing ? (
            <div className="flex gap-1">
              <button
                onClick={() => handleStatusChange("AVAILABLE")}
                className="px-2 py-1 text-xs bg-success text-success-foreground rounded hover:bg-success/80"
              >
                Available
              </button>
              <button
                onClick={() => handleStatusChange("OCCUPIED")}
                className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/80"
              >
                Occupied
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                status === "OCCUPIED"
                  ? "bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground"
                  : "bg-green-500 hover:bg-success/30 text-success-foreground"
              }`}
            >
              {status}
            </button>
          )}
        </div>

        <div className="flex flex-col items-center pt-8 pb-4">
          <div className="relative">
            {chairPositions.map((pos, index) => (
              <div
                key={index}
                className={`absolute ${getChairColor()} w-8 h-4 rounded-t-lg border shadow-sm`}
                style={{
                  top: `${pos.top}px`,
                  left: `${pos.left}px`,
                  transform: `rotate(${pos.rotate}deg)`,
                  transition: "background-color 0.3s",
                }}
              />
            ))}
            <div
              className={`${getTableColor()} ${tableShape} border shadow-sm flex items-center justify-center transition-colors duration-300`}
            >
              <span className="text-xs font-bold text-card-foreground">#{table.number}</span>
            </div>
          </div>
        </div>

        <div className="mt-2 text-center border-t border-border pt-2">
          <div className="flex items-center">
            <div className="flex justify-between w-full">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-muted-foreground mr-1" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span className="text-sm font-medium text-muted-foreground">{table.capacity}</span>
              </div>
              {isAdmin && ( // Only show delete button if isAdmin is true
                <button onClick={() => setShowConfirm(true)} aria-label="Delete Table" className="text-red-500 hover:text-red-700">
                  <Trash size={18} />
                </button>
              )}
            </div>
          </div>

          {table.reservation && (
            <span className="text-xs text-primary font-medium">Reserved</span>
          )}
        </div>

        {showConfirm && (
          <ConfirmDialog
            title="Delete Table"
            description="Are you sure you want to delete this table? This action cannot be undone."
            onConfirm={handleDelete}
            confirmText="Delete"
            cancelText="Cancel"
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="mt-2 rounded-xl">
      <div className="flex flex-wrap gap-6">
        {data.map((table) => (
          <TableCardItem key={table.id} table={table} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}