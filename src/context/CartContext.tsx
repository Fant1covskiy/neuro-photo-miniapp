import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Style {
  id: number;
  name: string;
  description: string;
  price: number;
  preview_image: string | null;
  category_id: number;
}

interface CartContextType {
  cart: Style[];
  addToCart: (style: Style) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Style[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (style: Style) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.id === style.id);
      if (exists) {
        return prevCart;
      }
      return [...prevCart, style];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
