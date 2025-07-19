'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useFetch } from "@/hooks/useFetch";
import OrderRecipt from './orderRecipt';
import Image from 'next/image';

export function OrderDetails({ id }) {
    const [isOpen, setIsOpen] = useState(false);
    const { data, isloading } = useFetch(isOpen ? `/api/orders/${id}/items` : null, ["items", id]);

    const orderItems = data?.items ?? [];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">View Order Items</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Order Items</DialogTitle>
                    <DialogDescription>Details of the items in this order</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    {isloading ? (
                        <div className="text-center">Loading order items...</div>
                    ) : orderItems.length === 0 ? (
                        <div className="text-center">No items found in this order.</div>
                    ) : (
                        orderItems.map((item) => {
                            let imageUrls = [];

                            try {
                                imageUrls = JSON.parse(item.menuItem.imageUrl || "[]");
                            } catch (error) {
                                // Error handled with fallback image
                            }

                            return (
                                <div key={item.id} className="border rounded-lg p-4 flex flex-row gap-5">
                                    {imageUrls.length > 0 && (
                                        <Image
                                            width={50}
                                            height={50}
                                            src={imageUrls[0]}
                                            alt={item.menuItem.name}
                                            className="mt-2 h-20 w-20 object-cover rounded"
                                        />
                                    )}
                                    <div className="w-full">
                                        <div className='flex flex-row justify-between'>
                                            <h3 className="font-medium">{item.menuItem.name}</h3>
                                            <span className="text-sm text-gray-500">x{item.quantity}</span>
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <p>Price: ${item.price}</p>
                                            <p>Category: {item.menuItem.category}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <DialogFooter>
                    {data && !isloading && (
                        <OrderRecipt data={data} />
                    )}
                    <Button type="button" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
