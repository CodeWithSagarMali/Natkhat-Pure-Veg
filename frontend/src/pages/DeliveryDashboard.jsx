import React, { useState, useEffect } from 'react';
import Icon from '../components/Icons';

export const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);

  // Delivery simulation details
  const [gpsSim, setGpsSim] = useState('Standby at Gourmet Veg Oasis');
  
  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  const fetchDeliveryOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);

        // Calculate delivery partner earnings (e.g. flat ₹40 per delivery order they delivered)
        const completed = data.filter(o => o.order_type === 'delivery' && o.status === 'delivered').length;
        setEarnings(completed * 40);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeliveryStatus = async (orderId, newStatus) => {
    try {
      if (newStatus === 'delivered') {
        const enteredOtp = prompt("Enter security OTP from customer to verify delivery package:");
        if (!enteredOtp) return;
        
        // Find order and verify OTP
        const order = orders.find(o => o.id === orderId);
        if (order && order.delivery_otp !== enteredOtp) {
          alert("Security OTP mismatch! Delivery rejected.");
          return;
        }
      }

      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        if (newStatus === 'delivered') {
          setGpsSim('Delivery Complete. Returning to Oasis...');
        } else {
          setGpsSim(`Simulating Live GPS: Delivering package for Order #${orderId}...`);
        }
        fetchDeliveryOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1.5rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Overview stats */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '5px solid var(--color-primary)' }}>
        <div>
          <h2>Delivery Partner Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Accept packages, verify safety OTPs, and track your metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Simulated GPS Location</span>
            <span style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '0.9rem' }}>📍 {gpsSim}</span>
          </div>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Today's Earnings</span>
            <span style={{ fontWeight: '800', color: 'var(--color-primary)', fontSize: '1.2rem' }}>₹{earnings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Side: Delivery jobs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Pending Deliveries</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.filter(o => o.order_type === 'delivery' && (o.status === 'ready' || o.status === 'cooking')).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No pending delivery orders available at the kitchen.</p>
              ) : (
                orders.filter(o => o.order_type === 'delivery' && (o.status === 'ready' || o.status === 'cooking')).map(order => (
                  <div key={order.id} className="glass-card" style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>Order #{order.id}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: <span style={{ fontWeight: 'bold' }}>{order.status.toUpperCase()}</span></p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Items: {order.items?.length || 0} • Value: ₹{order.final_amount.toFixed(2)}</p>
                    </div>

                    <div>
                      {order.status === 'ready' && (
                        <button 
                          onClick={() => handleUpdateDeliveryStatus(order.id, 'delivered')}
                          className="btn btn-primary btn-sm"
                        >
                          Mark Delivered (Ask OTP)
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Delivery history */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Delivered Jobs History</h3>
          {orders.filter(o => o.order_type === 'delivery' && o.status === 'delivered').length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your delivered jobs history will appear here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {orders.filter(o => o.order_type === 'delivery' && o.status === 'delivered').map(order => (
                <div key={order.id} style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem' }}>Order #{order.id}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleTimeString()}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.85rem' }}>+ ₹40.00</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default DeliveryDashboard;
