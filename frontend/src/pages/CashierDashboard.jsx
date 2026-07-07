import React, { useState, useEffect } from 'react';
import Icon from '../components/Icons';

export const CashierDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Billing calculation values
  const [splitCount, setSplitCount] = useState(1);

  useEffect(() => {
    fetchCashierData();
  }, []);

  const fetchCashierData = async () => {
    try {
      const resO = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const resT = await fetch('/api/tables');
      if (resO.ok && resT.ok) {
        setOrders(await resO.json());
        setTables(await resT.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettlePayment = async (orderId) => {
    try {
      // Mark as paid and served
      const resS = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'served', payment_status: 'paid' })
      });

      if (resS.ok) {
        alert(`Order #${orderId} has been successfully settled & marked PAID.`);
        setSelectedOrder(null);
        fetchCashierData();
      } else {
        alert('Failed to settle payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintReceipt = (orderId) => {
    window.open(`/api/billing/receipt/${orderId}`, '_blank', 'width=350,height=600');
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1.5rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h2>Billing & POS Terminal</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Process payments, finalize invoices, print receipts, and handle split bills</p>
      </div>

      {/* POS Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Unpaid active tables & orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Active Dine-In Unpaid Orders</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {orders.filter(o => o.order_type === 'dine-in' && o.payment_status === 'pending').length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No pending dine-in bills.</p>
              ) : (
                orders.filter(o => o.order_type === 'dine-in' && o.payment_status === 'pending').map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => { setSelectedOrder(order); setSplitCount(1); }}
                    className="glass-card" 
                    style={{ 
                      cursor: 'pointer', 
                      borderLeft: '4px solid var(--color-warning)',
                      boxShadow: selectedOrder?.id === order.id ? 'var(--shadow-focus)' : 'var(--shadow-sm)',
                      backgroundColor: selectedOrder?.id === order.id ? 'var(--color-primary-light)' : 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justify: 'space-between', fontWeight: 'bold' }}>
                      <span>Order #{order.id}</span>
                      <span>Table {order.table_number || 'N/A'}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Items: {order.items?.length || 0} • Total: ₹{order.final_amount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem' }}>Takeaway & Delivery Bills</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {orders.filter(o => o.order_type !== 'dine-in' && o.payment_status === 'pending').length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No pending pickup/delivery bills.</p>
              ) : (
                orders.filter(o => o.order_type !== 'dine-in' && o.payment_status === 'pending').map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => { setSelectedOrder(order); setSplitCount(1); }}
                    className="glass-card" 
                    style={{ 
                      cursor: 'pointer', 
                      borderLeft: '4px solid var(--color-info)',
                      boxShadow: selectedOrder?.id === order.id ? 'var(--shadow-focus)' : 'var(--shadow-sm)',
                      backgroundColor: selectedOrder?.id === order.id ? 'var(--color-primary-light)' : 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justify: 'space-between', fontWeight: 'bold' }}>
                      <span>Order #{order.id}</span>
                      <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{order.order_type}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Total Amount: ₹{order.final_amount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Invoice details, Split Billing & Print Preview panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '90px' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Invoice Details</h3>
          
          {selectedOrder ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <p style={{ fontWeight: 'bold' }}>Order #{selectedOrder.id}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Type: {selectedOrder.order_type.toUpperCase()} {selectedOrder.table_number && `• Table ${selectedOrder.table_number}`}</p>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
                {selectedOrder.items?.map(i => (
                  <div key={i.id} style={{ display: 'flex', justify: 'space-between', fontSize: '0.85rem' }}>
                    <span>{i.quantity} x {i.item_name}</span>
                    <span>₹{(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Splits calculation */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span className="form-label">Split Bill (No. of Persons)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => setSplitCount(prev => Math.max(1, prev - 1))} className="btn btn-outline btn-sm">-</button>
                  <span style={{ fontWeight: 'bold' }}>{splitCount}</span>
                  <button onClick={() => setSplitCount(prev => prev + 1)} className="btn btn-outline btn-sm">+</button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                    {splitCount > 1 && `₹${(selectedOrder.final_amount / splitCount).toFixed(2)} each`}
                  </span>
                </div>
              </div>

              {/* Tax Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justify: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{ display: 'flex', justify: 'space-between', color: 'var(--color-danger)' }}>
                    <span>Discount:</span>
                    <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justify: 'space-between' }}>
                  <span>GST (5%):</span>
                  <span>₹{selectedOrder.gst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justify: 'space-between', fontWeight: 'bold', fontSize: '1rem', color: 'var(--color-primary)', marginTop: '4px' }}>
                  <span>Grand Total:</span>
                  <span>₹{selectedOrder.final_amount.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => handleSettlePayment(selectedOrder.id)} className="btn btn-primary" style={{ flex: 1 }}>
                  Settle Paid
                </button>
                <button onClick={() => handlePrintReceipt(selectedOrder.id)} className="btn btn-outline" title="Print Invoice">
                  <Icon name="clipboard" size={18} /> Print
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
              <Icon name="credit-card" size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>Select an active unpaid order from the list to process billing details.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default CashierDashboard;
