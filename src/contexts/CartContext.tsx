import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product } from '@/types/store';

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, size?: string, color?: any, customizations?: Record<string, any>) => void;
  removeFromCart: (index: number) => void;
  updateCartItem: (index: number, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  cartTotal: number;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const addToCart = (product: Product, size?: string, color?: any, customizations?: Record<string, any>) => {
    const basePrice = product.price;
    let totalPrice = basePrice;
    
    // Add customization costs
    if (customizations && product.customizationOptions) {
      Object.entries(customizations).forEach(([optionId, value]) => {
        const option = product.customizationOptions?.find(opt => opt.id === optionId);
        if (option) {
          totalPrice += option.priceModifier;
        }
      });
    }

    const cartItem: CartItem = {
      productId: product.id,
      quantity: 1,
      selectedSize: size,
      selectedColor: color,
      customizations,
      totalPrice
    };

    setCart(prev => {
      // Check if item already exists with same configuration
      const existingIndex = prev.findIndex(item => 
        item.productId === product.id &&
        item.selectedSize === size &&
        JSON.stringify(item.selectedColor) === JSON.stringify(color) &&
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
      );

      if (existingIndex >= 0) {
        // Update quantity if item exists
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        // Add new item
        return [...prev, cartItem];
      }
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartItem = (index: number, updates: Partial<CartItem>) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      toggleWishlist,
      cartTotal,
      cartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}