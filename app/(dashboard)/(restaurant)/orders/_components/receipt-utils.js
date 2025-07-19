"use client";

/**
 * Prints an order receipt in a new window
 * @param {Object} orderData Order details including items, prices, and customer information
 * @returns {Promise} A promise that resolves when printing is complete
 */
export const printReceipt = (orderData) => {
  return new Promise((resolve) => {
    // Create a new window with just the receipt content
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      // Error with print window - likely pop-up blocked
      resolve();
      return;
    }

    const {
      items,
      locationType,
      locationNumber,
      subtotal,
      tax,
      total,
      paymentMethod,
      specialInstructions
    } = orderData;

    // Format date with a static approach to avoid hydration issues
    const now = new Date();
    const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const formattedDate = `${dateString} ${timeString}`;

    // Generate item rows
    const itemRows = items.map(item => `
      <div class="item">
        <div>${item.quantity} x ${item.name}</div>
        <div>$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');

    // Get formatted payment method
    const formattedPaymentMethod = paymentMethod
      ? paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)
      : "Cash";

    // Prepare special instructions section if present
    const instructionsSection = specialInstructions 
      ? `
        <div class="divider"></div>
        <div class="instructions">
          <div class="bold">Special Instructions:</div>
          <div>${specialInstructions}</div>
        </div>
      `
      : '';

    // Create the receipt HTML
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.2; }
            .receipt-container { width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 10px; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .totals { margin-top: 10px; }
            .total-line { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
            .instructions { margin: 5px 0; }
            @media print {
              @page { margin: 0; size: 80mm 200mm; }
              body { margin: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h2>RESTAURANT NAME</h2>
              <p>123 Restaurant St, City</p>
              <p>Tel: (123) 456-7890</p>
              <p>${formattedDate}</p>
              <p>${locationType.charAt(0).toUpperCase() + locationType.slice(1)}: ${locationNumber}</p>
            </div>
            <div class="divider"></div>
            <div class="items">
              ${itemRows}
            </div>
            <div class="divider"></div>
            <div class="totals">
              <div class="total-line">
                <div>Subtotal:</div>
                <div>$${subtotal.toFixed(2)}</div>
              </div>
              <div class="total-line">
                <div>Tax (10%):</div>
                <div>$${tax.toFixed(2)}</div>
              </div>
              <div class="total-line bold">
                <div>Total:</div>
                <div>$${total.toFixed(2)}</div>
              </div>
              <div class="total-line">
                <div>Payment Method:</div>
                <div>${formattedPaymentMethod}</div>
              </div>
            </div>
            ${instructionsSection}
            <div class="divider"></div>
            <div class="footer">
              <p>Thank you for your visit!</p>
              <p>Please come again</p>
              <p>Order #: ${generateOrderNumber()}</p>
            </div>
          </div>
          <script>
            // Auto-print when loaded
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Resolve the promise after a short delay
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

/**
 * Generates a unique order number
 * @returns {string} A unique order number
 */
function generateOrderNumber() {
  // Using a combination of date and random number to create a unique order number
  // This avoids using Math.random() directly which can cause hydration issues
  const now = new Date();
  const dateStr = 
    now.getFullYear().toString().slice(-2) + 
    (now.getMonth() + 1).toString().padStart(2, '0') + 
    now.getDate().toString().padStart(2, '0');
  const timeStr = 
    now.getHours().toString().padStart(2, '0') + 
    now.getMinutes().toString().padStart(2, '0');
  
  // Use a combination that will be consistent between server and client
  // for the same second but still provide uniqueness
  return `${dateStr}-${timeStr}-${(now.getSeconds() * 1000 + now.getMilliseconds()).toString().padStart(5, '0')}`;
}