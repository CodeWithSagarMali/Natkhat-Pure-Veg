import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icons';

export const Cart = ({ setCurrentTab }) => {
  const { user } = useAuth();
  const {
    cartItems, removeFromCart, updateQuantity,
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
    placeOrder
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [tables, setTables] = useState([]);
  
  // Checkout simulation
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Idle, 1: Processing, 2: Paid & Success
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (orderType === 'dine-in' && !tableId) {
      alert('Please select your dining Table number.');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutStep(1); // Processing Mock Gateway

    setTimeout(async () => {
      try {
        const res = await placeOrder(user?.id);
        setCreatedOrderId(res.orderId);
        setOtpCode(res.otp);
        setCheckoutStep(2); // Success
      } catch (error) {
        alert('Checkout failed: ' + error.message);
        setCheckoutStep(0);
        setIsCheckingOut(false);
      }
    }, 2000);
  };

  if (checkoutStep === 2) {
    return (
      <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '500px', margin: 'auto' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
            <Icon name="check" size={48} />
          </div>
          <h2>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Your order <strong>#{createdOrderId}</strong> is now registered. The kitchen has begun preparing your food.
          </p>

          {orderType === 'delivery' && (
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', width: '100%', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Delivery Security OTP</p>
              <h1 style={{ color: 'var(--color-primary)', letterSpacing: '4px', marginTop: '0.25rem' }}>{otpCode}</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Share this with your delivery partner to verify your package.</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
            <button 
              onClick={() => {
                if (user) {
                  setCurrentTab('customer_orders');
                } else {
                  setCurrentTab('menu');
                }
              }} 
              className="btn btn-primary" 
              style={{ flex: 1 }}
            >
              {user ? 'Track My Order' : 'Back to Menu'}
            </button>
            <a 
              href={`/api/billing/receipt/${createdOrderId}`} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-outline" 
              style={{ flex: 1 }}
            >
              View Receipt
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h2>Your Basket</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Review items, customize preferences, and pay securely</p>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Icon name="cart" size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>Your basket is empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Choose from our range of 100% pure vegetarian recipes.</p>
          <button onClick={() => setCurrentTab('menu')} className="btn btn-primary">Browse Menu</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map(item => (
              <div key={item.customKey} className="glass-card" style={{ display: 'flex', gap: '1.25rem', padding: '1rem', alignItems: 'center' }}>
                <div style={{ width: '70px', height: '70px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="utensils" color="var(--color-primary)" size={24} opacity="0.5" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '1rem' }}>{item.name}</h4>
                    {item.customizations.isJain && <span className="jain-badge" title="Jain Mode"></span>}
                  </div>
                  {/* Customizations display */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                      Spice: {item.customizations.spiceLevel}
                    </span>
                    {item.customizations.extraButter && <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '2px 6px', borderRadius: '4px' }}>+Butter</span>}
                    {item.customizations.extraCheese && <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '2px 6px', borderRadius: '4px' }}>+Cheese</span>}
                    {item.customizations.noOnion && <span style={{ fontSize: '0.7rem', color: '#c62828', backgroundColor: '#ffebee', padding: '2px 6px', borderRadius: '4px' }}>No Onion</span>}
                    {item.customizations.noGarlic && <span style={{ fontSize: '0.7rem', color: '#c62828', backgroundColor: '#ffebee', padding: '2px 6px', borderRadius: '4px' }}>No Garlic</span>}
                    {item.customizations.specialInstructions && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{item.customizations.specialInstructions}"</span>}
                  </div>
                </div>
                
                {/* Quantity adjustments */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button onClick={() => updateQuantity(item.customKey, item.quantity - 1)} className="btn btn-outline btn-sm" style={{ padding: '2px 6px' }}>-</button>
                  <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.customKey, item.quantity + 1)} className="btn btn-outline btn-sm" style={{ padding: '2px 6px' }}>+</button>
                </div>

                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--color-primary)' }}>₹{(item.offer_price * item.quantity).toFixed(2)}</span>
                </div>

                <button onClick={() => removeFromCart(item.customKey)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))}

            {/* Global Order Customization Options */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Global Kitchen Instructions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Order Type</label>
                  <select className="form-input" value={orderType} onChange={e => setOrderType(e.target.value)}>
                    <option value="dine-in">Dine-In (Table Service)</option>
                    <option value="pickup">Self-Pickup</option>
                    <option value="delivery">Home Delivery</option>
                  </select>
                </div>
                {orderType === 'dine-in' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Table Number</label>
                    <select className="form-input" value={tableId} onChange={e => setTableId(e.target.value)}>
                      <option value="">-- Choose Table --</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.id} disabled={t.status === 'occupied' || t.status === 'reserved'}>
                          Table {t.table_number} (Cap: {t.capacity}) - {t.status.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Global Spice Prefer</label>
                  <select className="form-input" value={spiceLevel} onChange={e => setSpiceLevel(e.target.value)}>
                    <option value="mild">Mild (Less Spicy)</option>
                    <option value="medium">Medium</option>
                    <option value="spicy">Spicy (Tandoor Traditional)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Additional Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Specify allergies or special instructions for chef..."
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing Calculations Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Summary Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', justify: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>₹{getSubtotal().toFixed(2)}</span>
              </div>
              
              {coupon ? (
                <div style={{ display: 'flex', justify: 'space-between', color: 'var(--color-success)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Coupon ({coupon.code})
                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', fontSize: '0.7rem' }}>[Remove]</button>
                  </span>
                  <span>- ₹{getDiscount().toFixed(2)}</span>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter Coupon"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm">Apply</button>
                </form>
              )}
              {couponError && <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{couponError}</span>}

              <div style={{ display: 'flex', justify: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>GST (5% tax)</span>
                <span>₹{getGst().toFixed(2)}</span>
              </div>
              
              {orderType === 'delivery' && (
                <div style={{ display: 'flex', justify: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
                  <span>₹40.00</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justify: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary)' }}>
              <span>Total Payable</span>
              <span>₹{(getFinalTotal() + (orderType === 'delivery' ? 40 : 0)).toFixed(2)}</span>
            </div>

            {/* Payment Method Select */}
            <div style={{ marginTop: '0.5rem' }}>
              <span className="form-label">Payment Option</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button onClick={() => setPaymentMethod('cash')} className={`btn btn-sm ${paymentMethod === 'cash' ? 'btn-primary' : 'btn-outline'}`}>
                  Cash
                </button>
                <button onClick={() => setPaymentMethod('upi')} className={`btn btn-sm ${paymentMethod === 'upi' ? 'btn-primary' : 'btn-outline'}`}>
                  UPI / Cards
                </button>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button 
              onClick={handleCheckoutSubmit} 
              className="btn btn-primary" 
              style={{ width: '100%', height: '46px' }}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }}></div> Processing Payment...
                </div>
              ) : (
                <>Place & Pay Order</>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
export default Cart;
