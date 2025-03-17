import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "../types/product"; // ✅ Ensure this import exists

interface CartState {
  cart: CartItem[];
}

const initialState: CartState = {
  cart: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cart.find((item) => item._id === action.payload._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 }); // ✅ Ensure quantity is added
      }
    },
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cart.find((item) => item._id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const itemIndex = state.cart.findIndex((item) => item._id === action.payload);
      if (itemIndex !== -1) {
        if (state.cart[itemIndex].quantity > 1) {
          state.cart[itemIndex].quantity -= 1;
        } else {
          state.cart.splice(itemIndex, 1); // ✅ Use splice to remove item (Redux Toolkit handles immutability)
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item._id !== action.payload);
    },
    updateCartItem: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.cart.find((item) => item._id === action.payload.id);
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      } else {
        state.cart = state.cart.filter((item) => item._id !== action.payload.id); // ✅ Remove item if quantity is 0
      }
    },
  },
});

export const { addToCart, incrementQuantity, decrementQuantity, removeFromCart, updateCartItem } =
  cartSlice.actions;
export default cartSlice.reducer;
