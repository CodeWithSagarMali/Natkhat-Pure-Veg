import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [coupon, setCoupon] = useState(null);
  const [orderType, setOrderType] = useState('dine-in'); // dine-in, pickup, delivery
  const [tableId, setTableId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, upi, card, netbanking, wallet
  
  // Customizations state defaults
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [extraButter, setExtraButter] = useState(false);
  const [extraCheese, setExtraCheese] = useState(false);
  const [noOnion, setNoOnion] = useState(false);
  const [noGarlic, setNoGarlic] = useState(false);
  const [isJain, setIsJain] = useState(false);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, quantity = 1, customizations = {}) => {
    setCartItems(prev => {
      // Create a unique key for items with custom variations
      const customKey = `${item.id}-${customizations.isJain}-${customizations.extraCheese}-${customizations.extraButter}`;
      const existing = prev.find(i => i.customKey === customKey);

      if (existing) {
        return prev.map(i => i.customKey === customKey ? { ...i, quantity: i.quantity + quantity } : i);
      } else {
        return [...prev, { ...item, quantity, customizations, customKey }];
      }
    });
  };

  const removeFromCart = (customKey) => {
    setCartItems(prev => prev.filter(item => item.customKey !== customKey));
  };

  const updateQuantity = (customKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(customKey);
    } else {
      setCartItems(prev => prev.map(item => item.customKey === customKey ? { ...item, quantity } : item));
    }
  };

  const applyCoupon = async (code) => {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, amount: getSubtotal() })
      });
      const data = await response.json();
      if (response.ok) {
        setCoupon({ code, ...data });
        return data;
      } else {
        throw new Error(data.error || 'Invalid Coupon');
      }
    } catch (error) {
      setCoupon(null);
      throw error;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.offer_price * item.quantity, 0);
  };

  const getDiscount = () => {
    if (!coupon) return 0;
    return coupon.discount;
  };

  const getGst = () => {
    const sub = getSubtotal() - getDiscount();
    return parseFloat((sub * 0.05).toFixed(2)); // 5% GST for pure veg hotels
  };

  const getFinalTotal = () => {
    return parseFloat((getSubtotal() - getDiscount() + getGst()).toFixed(2));
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const placeOrder = async (userId) => {
    const items = cartItems.map(i => ({
      menu_item_id: i.id,
      quantity: i.quantity,
      customizations: i.customizations
    }));

    const body = {
      customer_id: userId || null,
      order_type: orderType,
      table_id: orderType === 'dine-in' ? tableId : null,
      items,
      payment_method: paymentMethod,
      spice_level: spiceLevel,
      extra_butter: extraButter,
      extra_cheese: extraCheese,
      no_onion: noOnion,
      no_garlic: noGarlic,
      is_jain: isJain,
      instructions,
      coupon_code: coupon?.code || null
    };

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Order failed');
    }

    clearCart();
    return data;
  };

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity,
      coupon, applyCoupon, removeCoupon,
      orderType, setOrderType,
      tableId, setTableId,
      paymentMethod, setPaymentMethod,
      spiceLevel, setSpiceLevel,
      extraButter, setExtraButter,
      extraCheese, setExtraCheese,
      noOnion, setNoOnion,
      noGarlic, setNoGarlic,
      isJain, setIsJain,
      instructions, setInstructions,
      getSubtotal, getDiscount, getGst, getFinalTotal,
      clearCart, placeOrder
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
