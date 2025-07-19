"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addItem } from "@/redux/features/order/orderSlice";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

export default function MenuCard({ menuItems, onAddToOrder, onDeleteMenu }) {
  const dispatch = useDispatch()
  const router = useRouter()

  const EditMenu = (id)=>{
    // Validate id before navigation to prevent [object Object] errors
    if (id && typeof id === 'string') {
      router.push(`/menu/${id}`)
    } else {
      // Handle invalid ID gracefully
      toast.error("Invalid menu ID for navigation")
    }
  }

  const handleDelete = (id) => {
    if (onDeleteMenu) {
      onDeleteMenu(id);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {menuItems && menuItems.map((item) => {
        let imageUrls = [];

        if (typeof item.imageUrl === "string") {
          try {
            imageUrls = JSON.parse(item.imageUrl);
          } catch (error) {
            // Error handled with fallback image
          }
        } else if (Array.isArray(item.imageUrl)) {
          imageUrls = item.imageUrl;
        }

        const firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

        return (
          <Card
            key={item.id}
            className="shadow-lg p-0 hover:shadow-xl transition relative group"
          >
            <CardContent className="flex flex-col p-3">
              {firstImageUrl && (
                <div className="relative w-full h-[160px] rounded overflow-hidden mb-2">
                  <Image
                    src={firstImageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}

              <h2 className="text-lg font-semibold">{item.name}</h2>
              <span className="text-sm text-gray-500">{item.category}</span>
              <span className="text-sm font-bold text-primary">${item.price.toString()}</span>

              <div className="flex flex-row justify-between items-center mt-2 gap-2">
                <span
                  className={`text-xs ${
                    item.status === "AVAILABLE" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.status}
                </span>
                <div className="flex flex-row gap-2">
                  <Edit size={18} onClick={() => EditMenu(item.id)}/>
                  <Trash2 size={18} className="cursor-pointer text-red-500" onClick={() => handleDelete(item.id)} />
                    
                </div>
              </div>

              <Button
                className="mt-4 w-full"
                onClick={() => dispatch(addItem(item, item.id))}
                disabled={item.status !== "AVAILABLE"}
              >
                Add to Order
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
