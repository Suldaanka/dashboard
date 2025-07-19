import React from 'react'
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { PrinterIcon } from 'lucide-react';

export default function OrderRecipt({ data }) {
  const HotelInfo = () => (
    <div className="text-center mb-4">
      <h1 className="text-2xl font-bold">IFTIN HOTEL</h1>
      <p className="text-sm">Hobyo, Somalia</p>
      <p className="text-sm">+252-611-11-5999</p>
      <p className="text-sm">Email: info@iftinhotel.com</p>
    </div>
  );

  // Divider line
  const Divider = () => (
    <div className="border-t border-dashed border-gray-400 my-3 w-full"></div>
  );
  if (!data || !data.id) {
    return null; 
  }
  const contentRef = useRef()
  const reactToPrintFn = useReactToPrint({ contentRef });

  const formattedDate = new Date().toLocaleDateString();
  const formattedTime = new Date().toLocaleTimeString();


  const calculatedSubtotal = data.items.reduce((sum, item) => {
    return sum + (Number(item.price) * item.quantity);
  }, 0);

  const subtotal = calculatedSubtotal;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;
  return (
    <div className="max-w-md mx-auto">
      <PrinterIcon onClick={reactToPrintFn} className="text-green-500"/>

      <div
        ref={contentRef} 
        className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm w-80 mx-auto font-mono print:block hidden"
        style={{ minHeight: "500px"}}
      >
        <HotelInfo />

        <Divider />

        <div className="text-center mb-3">
          <h2 className="text-xl font-bold">ORDER RECEIPT</h2>
          <p className="text-xs mt-1">
            {formattedDate} | {formattedTime}
          </p>
          {data.table && (
            <p className="text-sm mt-1">Table #{data.table.number}</p>
          )}
          {data.room && (
            <p className="text-sm mt-1">Room #{data.room.number}</p>
          )}
          <p className="text-xs">Order #{data.id.slice(0, 6)}</p>
          <p className="text-xs">Waiter: {data?.user?.name || 'N/A'}</p>
        </div>

        <Divider />
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
          </div>

          {data.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm mb-1">
              <span className="w-1/2 truncate">{item.menuItem.name}</span>
              <span className="text-center w-1/6">{item.quantity}</span>
              <span className="text-right w-1/3">${Number(item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <Divider />

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Tax (5%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span>GRAND TOTAL:</span>
            <span>${grandTotal.toFixed(2)}</span>
            
          </div>
        </div>
        <Divider />

        <div className="flex justify-center mb-2">
          <QRCodeSVG value={data.id} />
        </div>

        <p className="text-center text-xs">Scan for order details</p>

        <div className="text-center mt-4">
          <p className="text-sm font-bold">THANK YOU FOR YOUR ORDER!</p>
          <p className="text-xs mt-1">We appreciate your business</p>
        </div>
      </div>
    </div>
  );
}