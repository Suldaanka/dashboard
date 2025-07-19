// store/orderSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Add item to order
    addItem: (state, action) => {
      // Check if item already exists
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        // If item exists, increase quantity
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        // Otherwise add new item
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1
        });
      }
    },
    
    // Update item quantity
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        item.quantity = quantity;
      }
    },
    
    // Remove item from order
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    // Clear entire order
    clearOrder: (state) => {
      state.items = [];
    },
    
    // Set order status
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    
    // Store order in history after placement
    placeOrder: (state, action) => {
      // You might want to store this in a separate slice for order history
      state.status = 'succeeded';
      // Clear the cart after order is placed
      state.items = [];
    }
  }
});

export const { 
  addItem, 
  updateQuantity, 
  removeItem, 
  clearOrder, 
  setStatus,
  placeOrder
} = orderSlice.actions;

export default orderSlice.reducer;