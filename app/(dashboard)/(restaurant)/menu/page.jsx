"use client";

import React, { useEffect, useState } from "react";
import MenuCard from "./_components/menuCard";
import { useFetch } from "@/hooks/useFetch";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { AddMenuItem } from "./_components/addMenuItem";
import { ArrowLeft, PlusCircle, Search } from "lucide-react";
import Orderside from "./_components/Orderside";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs"
import AccessDenied from "@/components/accessDenied";

export default function Page({ sidebarCollapsed, orderSideCollapsed }) {
  const { data: menuItems, isLoading, isError, mutate } = useFetch("/api/menu", ["menu"]);
  const [addMenu, setAddMenu] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { user, isLoaded } = useUser()

  // Extract unique categories when data loads
  const categories = menuItems && menuItems.length > 0 ?
    ["all", ...new Set(menuItems.map(item => item.category))] :
    ["all"];

  // Update filtered items when category changes or data loads
  useEffect(() => {
    if (menuItems) {
      let itemsToFilter = menuItems;
      if (activeCategory !== "all") {
        itemsToFilter = itemsToFilter.filter(item => item.category === activeCategory);
      }
      if (searchTerm) {
        itemsToFilter = itemsToFilter.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredItems(itemsToFilter);
    }
  }, [activeCategory, menuItems, searchTerm]);


const handleDeleteMenu = async (id) => {
  try {
    const res = await fetch(`/api/menu/delete/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      toast.success(data.message || "Menu item deleted");
      mutate(); // ✅ This now refetches updated list
    } else {
      toast.error(data.error || "Failed to delete");
    }
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Error deleting menu item");
  }
};


  if (isLoading) return <Loading />;
  const isEmpty = !menuItems || menuItems.length === 0;


  if (!isLoaded) return null

  const role = user?.publicMetadata?.role
  if (!["ADMIN", "WAITER"].includes(role)) return <AccessDenied />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1">
        <div className="pb-7 flex justify-between items-center">
          {addMenu ? (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAddMenu(!addMenu)}>
              <ArrowLeft className="cursor-pointer" /> <span>Back to Menu</span>
            </div>
          ) : (
            menuItems?.length > 0 && (
              <Button onClick={() => setAddMenu(true)}>Add Menu Item</Button>
            )
          )}
        </div>

        {!addMenu && !isEmpty && (
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="w-full md:basis-[70%]">
              <Tabs
                defaultValue="all"
                value={activeCategory}
                onValueChange={setActiveCategory}
                className="w-full"
              >
                <TabsList className="flex flex-wrap h-auto p-1 rounded-md bg-muted">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors duration-200 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="w-full md:basis-[40%] relative">
              <Search className="absolute left-3 top-5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search menu items..."
                className="p-5 pl-12 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {addMenu ? (
          <AddMenuItem setAddMenu={setAddMenu} mutate={mutate} />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <PlusCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No menu items found</h3>
            <p className="text-gray-500 mb-4 max-w-md">
              Your menu is currently empty. Add your first menu item to get started.
            </p>
            <Button onClick={() => setAddMenu(true)}>
              Add Your First Menu Item
            </Button>
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error fetching menu items. Please try again later.</p>
          </div>
        ) : (
          <MenuCard menuItems={filteredItems} onDeleteMenu={handleDeleteMenu} />
        )}
      </div>
    </div>
  );
}