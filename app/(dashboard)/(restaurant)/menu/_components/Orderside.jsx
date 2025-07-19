"use client"

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearOrder, removeItem, updateQuantity } from '@/redux/features/order/orderSlice'
import { useMutate } from '@/hooks/useMutate'
import { useFetch } from '@/hooks/useFetch'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Orderside() {
  const orders = useSelector((state) => state.order.items)
  const user = useSelector((state) => state.user.user)
  const [destination, setDestination] = useState('table')
  const [destinationNumber, setDestinationNumber] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  const subtotal = orders.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax

  const userId = user?.id
  const dispatch = useDispatch()
  const { mutate } = useMutate(`/api/orders/add`, ['orders'], { method: 'POST' })
  const { data: tables } = useFetch('/api/table', ['tables'])
  const { data: rooms } = useFetch('/api/rooms', ['rooms'])

  const toggleCollapse = () => setCollapsed(!collapsed)

  const addOrder = () => {
    const orderData = {
      userId,
      tableId: destination === 'table' ? destinationNumber : null,
      roomId: destination === 'room' ? destinationNumber : null,
      status: 'PENDING',
      total: parseFloat(total.toFixed(2)),
      items: orders.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price)
      }))
    }

    mutate(orderData, {
      onSuccess: () => {
        toast.success('Order placed successfully!')
        dispatch(clearOrder())
        setDestinationNumber('')
      },
      onError: (error) => {
        // Error already handled with toast
        toast.error('Failed to place order')
      }
    })
  }

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.png";

    try {
      // Parse the JSON string array and get the first image
      const imageArray = JSON.parse(imageUrl);
      return Array.isArray(imageArray) && imageArray.length > 0 ? imageArray[0] : "/placeholder.png";
    } catch (error) {
      // If parsing fails, assume it's already a direct string
      return imageUrl || "/placeholder.png";
    }
  }

  return (
    <div
      className={cn(
        "border-l bg-sidebar flex flex-col h-full transition-all duration-300",
        collapsed ? "w-12" : "w-96"
      )}
    >
      <div className={cn(
        "py-4 flex items-center",
        collapsed ? "justify-center" : "px-3 justify-between"
      )}>
        {!collapsed && <h2 className="text-lg font-semibold">Order Summary</h2>}
        <Button variant="ghost" size="icon" onClick={toggleCollapse}>
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {!collapsed && (
        <>
          <div className="px-3 py-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Destination</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-2">
                <div
                  onClick={() => setDestination('table')}
                  className={`cursor-pointer px-2 py-1 rounded hover:bg-muted ${destination === 'table' ? 'bg-muted font-semibold' : ''}`}
                >
                  Table
                </div>
                <div
                  onClick={() => setDestination('room')}
                  className={`cursor-pointer px-2 py-1 rounded hover:bg-muted ${destination === 'room' ? 'bg-muted font-semibold' : ''}`}
                >
                  Room
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="px-2">
            <select
              className="w-full p-2 border rounded bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              value={destinationNumber}
              onChange={(e) => setDestinationNumber(e.target.value)}
            >
              <option value="" className="text-muted-foreground">Select {destination === 'table' ? 'Table' : 'Room'} Number</option>
              {(destination === 'table' ? tables : rooms)?.map((num) => (
                <option key={num.id} value={num.id} className="text-foreground">
                  {destination === 'table' ? `Table ${num.number}` : `Room ${num.number}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-grow overflow-auto px-3 mt-4">
            {orders.length > 0 ? (
              orders.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 border-b">
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover border"
                    onError={(e) => {
                      e.target.src = "/placeholder.png"; // Fallback if image fails to load
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${item.price} x {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}>-</Button>
                    <span>{item.quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>+</Button>
                    <Button variant="ghost" size="sm" onClick={() => dispatch(removeItem(item.id))}>✕</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No items in order</div>
            )}
          </div>

          <div className="mt-auto border-t p-3 space-y-4">
            <div className="text-right text-sm">
              <div>Sub Total: ${subtotal.toFixed(2)}</div>
              <div>Tax 5%: ${tax.toFixed(2)}</div>
              <div className="font-bold text-lg">Total: ${total.toFixed(2)}</div>
            </div>

            <Button
              className="w-full"
              onClick={addOrder}
              disabled={orders.length === 0 || !destinationNumber}
            >
              Place Order
            </Button>
          </div>
        </>
      )}

      {collapsed && orders.length > 0 && (
        <div className="mt-2 flex justify-center">
          <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold cursor-pointer">
            {orders.length}
          </div>
        </div>
      )}
    </div>
  )
}
