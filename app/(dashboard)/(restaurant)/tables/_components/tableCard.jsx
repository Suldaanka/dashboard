import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Delete, DeleteIcon, Trash } from 'lucide-react';
import { useMutate } from '@/hooks/useMutate';

export default function TableCard({ data, onStatusChange }) {
 
  // Check if data is an array
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
        <AlertDescription className="text-center">
          No tables available
        </AlertDescription>
      </Alert>
    );
  }

  // Function to render a single table card with editable status
  const TableCardItem = ({ table }) => {
    const [status, setStatus] = useState(table.status);
    const [isEditing, setIsEditing] = useState(false);
    
    const handleStatusChange = async (newStatus) => {
      setStatus(newStatus);
      setIsEditing(false);
      try {
        const response = await fetch(`/api/table/updateStatus/${table.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) {
          throw new Error("Failed to update table status");
        }
      } catch (error) {
        // Error already handled with toast
      }
      // Call the parent handler if provided
      if (onStatusChange) {
        onStatusChange(table.id, newStatus);
      }
    };

    const mutate = useMutate();
    
    const handleDelete = async () => {
      try {
        const response = await fetch(`/api/table/delete/${table.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete table');
        }

        alert(`Table ${table.id} deleted successfully`);
        
        // Refresh the page or update state as needed
        window.location.reload();
        
      } catch (error) {
        // Error already handled with toast
        alert('Failed to delete table');
      }
    };

    // Table and chair styles based on status
    // Using semantic colors that work with theme
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
    
    // Determine table shape based on capacity
    let tableShape;
    let chairPositions = [];
    
    if (table.capacity <= 2) {
      // Small round table for 2
      tableShape = "rounded-full w-16 h-16";
      chairPositions = [
        {top: "-6", left: "4", rotate: "0"}, // top
        {top: "16", left: "4", rotate: "180"}, // bottom
      ];
    } else if (table.capacity <= 4) {
      // Square table for 4
      tableShape = "rounded-md w-20 h-20";
      chairPositions = [
        {top: "-16", left: "26", rotate: "0"}, // top
        {top: "80", left: "26", rotate: "180"}, // bottom
        {top: "30", left: "-22", rotate: "-90"}, // left
        {top: "30", left: "70", rotate: "90"}, // right
      ];
    } else if (table.capacity <= 6) {
      // Rectangle table for 6
      tableShape = "rounded-md w-32 h-20";
      chairPositions = [
        {top: "-16", left: "18", rotate: "0"}, // top left
        {top: "-16", left: "80", rotate: "0"}, // top right
        {top: "80", left: "16", rotate: "180"}, // bottom left
        {top: "80", left: "80", rotate: "180"}, // bottom right
        {top: "30", left: "-23", rotate: "-90"}, // left
        {top: "30", left: "120", rotate: "90"}, // right
      ];
    } else {
      // Large rectangle table for 8+
      tableShape = "rounded-md w-40 h-24";
      chairPositions = [
        {top: "-6", left: "4", rotate: "0"},  // top 1
        {top: "-6", left: "16", rotate: "0"}, // top 2
        {top: "-6", left: "28", rotate: "0"}, // top 3
        {top: "24", left: "4", rotate: "180"},  // bottom 1
        {top: "24", left: "16", rotate: "180"}, // bottom 2
        {top: "24", left: "28", rotate: "180"}, // bottom 3
        {top: "8", left: "-6", rotate: "-90"},  // left 1
        {top: "8", left: "40", rotate: "90"},   // right 1
      ];
    }
    
    // Limit displayed chairs to actual capacity
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
            {/* Render chairs */}
            {chairPositions.map((pos, index) => (
              <div 
                key={index}
                className={`absolute ${getChairColor()} w-8 h-4 rounded-t-lg border shadow-sm`}
                style={{
                  top: `${pos.top}px`,
                  left: `${pos.left}px`,
                  transform: `rotate(${pos.rotate}deg)`,
                  transition: 'background-color 0.3s'
                }}
              />
            ))}
            
            {/* Render table */}
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
             <div className='flex items-center'>
               <svg className="w-4 h-4 text-muted-foreground mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span className="text-sm font-medium text-muted-foreground">{table.capacity}</span>
             </div>
              <div>
                <Trash size={18} onClick={() => handleDelete(table.id)}/>
              </div>
            </div>
            {table.reservation && (
              <span className="text-xs text-primary font-medium">Reserved</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-2 rounded-xl">
      <div className="flex flex-wrap gap-6">
        {data.map((table) => (
          <TableCardItem key={table.id} table={table} />
        ))}
      </div>
    </div>
  );
}