"use client"

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearOrder, removeItem, updateQuantity } from '@/redux/features/order/orderSlice'
import { useMutate } from '@/hooks/useMutate'
import { useFetch } from '@/hooks/useFetch'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { ChevronLeft, ChevronRight, MoreVertical, X, ShoppingCart, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Orderside() {
  const orders = useSelector((state) => state.order.items)
  const user = useSelector((state) => state.user.user)
  const [destination, setDestination] = useState('table')
  const [destinationNumber, setDestinationNumber] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const subtotal = orders.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax

  const userId = user?.id
  const dispatch = useDispatch()
  const { mutate } = useMutate(`/api/orders/add`, ['orders'], { method: 'POST' })
  const { data: tables } = useFetch('/api/table', ['tables'])
  const { data: rooms } = useFetch('/api/rooms', ['rooms'])

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-collapse on mobile
      if (mobile) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleCollapse = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  const closeMobileSheet = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

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
        // Close mobile sheet after order
        if (isMobile) {
          setIsOpen(false)
        }
      },
      onError: (error) => {
        toast.error('Failed to place order')
      }
    })
  }

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.png";

    try {
      const imageArray = JSON.parse(imageUrl);
      return Array.isArray(imageArray) && imageArray.length > 0 ? imageArray[0] : "/placeholder.png";
    } catch (error) {
      return imageUrl || "/placeholder.png";
    }
  }

  // Mobile floating cart button
  const MobileFloatingButton = () => (
    isMobile && (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110",
          orders.length === 0 && "opacity-50 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          {orders.length > 0 && (
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold absolute -top-2 -right-2">
              {orders.length}
            </div>
          )}
        </div>
      </button>
    )
  )

  // Mobile bottom sheet backdrop
  const MobileBackdrop = () => (
    isMobile && isOpen && (
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={closeMobileSheet}
      />
    )
  )

  // Mobile bottom sheet
  const MobileBottomSheet = () => (
    isMobile && (
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <Button variant="ghost" size="icon" onClick={closeMobileSheet}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - scrollable area */}
        <div className="flex flex-col" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {/* Destination selector */}
          <div className="px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Destination</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {destination === 'table' ? 'Table' : 'Room'}
                    <MoreVertical className="w-4 h-4 ml-1" />
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

            <select
              className="w-full p-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={destinationNumber}
              onChange={(e) => setDestinationNumber(e.target.value)}
            >
              <option value="">Select {destination === 'table' ? 'Table' : 'Room'}</option>
              {(destination === 'table' ? tables : rooms)?.map((num) => (
                <option key={num.id} value={num.id}>
                  {destination === 'table' ? `Table ${num.number}` : `Room ${num.number}`}
                </option>
              ))}
            </select>
          </div>

          {/* Order items - scrollable */}
          <div className="flex-1 overflow-auto px-4">
            {orders.length > 0 ? (
              orders.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-4 border-b last:border-b-0">
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${item.price} each
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-8 h-8 p-0 rounded-full"
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-8 h-8 p-0 rounded-full"
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                    >
                      +
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-8 h-8 p-0 ml-2"
                      onClick={() => dispatch(removeItem(item.id))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items in cart</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with totals and place order button */}
        <div className="border-t bg-background p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (5%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={addOrder}
            disabled={orders.length === 0 || !destinationNumber}
          >
            Place Order • ${total.toFixed(2)}
          </Button>
        </div>
      </div>
    )
  )

  // Desktop version (unchanged)
  if (!isMobile) {
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
                      className="w-12 h-12 rounded object-cover border flex-shrink-0"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${item.price} x {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-7 h-7 p-0"
                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-7 h-7 p-0"
                        onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      >
                        +
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-7 h-7 p-0"
                        onClick={() => dispatch(removeItem(item.id))}
                      >
                        ✕
                      </Button>
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
          <div className="flex flex-col items-center gap-3 py-4">
            <div 
              className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={toggleCollapse}
            >
              {orders.length}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Mobile version - return mobile components
  return (
    <>
      <MobileBackdrop />
      <MobileBottomSheet />
      <MobileFloatingButton />
    </>
  )
}