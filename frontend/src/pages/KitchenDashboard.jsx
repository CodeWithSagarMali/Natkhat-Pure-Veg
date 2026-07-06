import React, { useState, useEffect } from 'react';
import Icon from '../components/Icons';

export const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Simulated preparation timers per order
  const [timers, setTimers] = useState({});

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  // Update timer seconds every second
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(orderId => {
          next[orderId] = next[orderId] + 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter pending, cooking, ready
        const kitchenList = data.filter(o => o.status === 'pending' || o.status === 'cooking' || o.status === 'ready');
        setOrders(kitchenList);

        // Initialize timers for orders that don't have one
        setTimers(prev => {
          const next = { ...prev };
          kitchenList.forEach(o => {
            if (next[o.id] === undefined) {
              // Calculate elapsed seconds from order creation time
              const elapsed = Math.floor((Date.now() - new Date(o.created_at).getTime()) / 1000);
              next[o.id] = Math.max(0, elapsed);
            }
          });
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchKitchenOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintKOT = (order) => {
    const kotWindow = window.open('', '_blank', 'width=350,height=500');
    const itemsText = order.items.map(i => `
      <tr>
        <td style="padding:4px 0; font-size:14px;"><strong>${i.item_name}</strong></td>
        <td style="text-align:right; font-size:14px;"><strong>x${i.quantity}</strong></td>
      </tr>
      ${i.customizations ? `
      <tr>
        <td colspan="2" style="font-size:11px; padding-bottom:6px; color:#555; font-style:italic;">
          Spice: ${JSON.parse(i.customizations).spiceLevel || 'medium'} 
          ${JSON.parse(i.customizations).isJain ? ' • JAIN' : ''} 
          ${JSON.parse(i.customizations).extraCheese ? ' • +Cheese' : ''}
          ${JSON.parse(i.customizations).noOnion ? ' • NO ONION' : ''}
        </td>
      </tr>` : ''}
    `).join('');

    kotWindow.document.write(`
      <div style="font-family:'Courier New', monospace; width:280px; padding:10px; margin:auto;">
        <h2 style="text-align:center; margin:0 0 5px 0; font-size:20px;">KOT - KITCHEN TICKET</h2>
        <div style="text-align:center; font-size:12px; margin-bottom:10px;">Order #${order.id} | ${order.order_type.toUpperCase()}</div>
        <hr style="border-top:1px dashed #000;"/>
        <div style="font-size:12px; margin:5px 0;">
          <strong>Table:</strong> ${order.table_number || 'DELIVERY/PICKUP'}<br/>
          <strong>Time:</strong> ${new Date(order.created_at).toLocaleTimeString()}<br/>
        </div>
        <hr style="border-top:1px dashed #000;"/>
        <table style="width:100%; border-collapse:collapse;">
          ${itemsText}
        </table>
        <hr style="border-top:1px dashed #000;"/>
        ${order.instructions ? `<div style="font-size:12px; margin-top:5px;"><strong>Note:</strong> "${order.instructions}"</div>` : ''}
        <div style="text-align:center; font-size:10px; margin-top:15px; border:1px solid #000; padding:4px;">Gourmet Veg Oasis</div>
      </div>
    `);
    kotWindow.document.close();
    kotWindow.print();
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1.5rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Kitchen Display System (KDS)</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Live food preparation queues and order KOT triggers</p>
        </div>
        <button onClick={fetchKitchenOrders} className="btn btn-secondary btn-sm">
          <Icon name="refresh" size={16} /> Refresh Queue
        </button>
      </div>

      {/* KDS Lanes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Lane 1: Incoming / Pending */}
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ borderBottom: '2.5px solid var(--color-danger)', paddingBottom: '0.5rem', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem' }}>Incoming Queue</h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--color-danger)', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
              {orders.filter(o => o.status === 'pending').length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '300px' }}>
            {orders.filter(o => o.status === 'pending').map(order => (
              <div key={order.id} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--color-danger)' }}>
                <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <span>Order #{order.id}</span>
                  <span style={{ color: 'var(--color-danger)' }}>🕒 {formatTimer(timers[order.id] || 0)}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Type: {order.order_type.toUpperCase()} {order.table_number && `• Table ${order.table_number}`}
                </div>
                
                {/* Items */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  {order.items?.map(i => (
                    <div key={i.id} style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                      {i.quantity} x {i.item_name}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button onClick={() => handleUpdateStatus(order.id, 'cooking')} className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: '0.75rem' }}>
                    Start Cook
                  </button>
                  <button onClick={() => handlePrintKOT(order)} className="btn btn-outline btn-sm" title="Print KOT Ticket">
                    <Icon name="clipboard" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lane 2: Cooking */}
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ borderBottom: '2.5px solid var(--color-warning)', paddingBottom: '0.5rem', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem' }}>Cooking Lane</h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--color-warning)', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
              {orders.filter(o => o.status === 'cooking').length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '300px' }}>
            {orders.filter(o => o.status === 'cooking').map(order => (
              <div key={order.id} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--color-warning)' }}>
                <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <span>Order #{order.id}</span>
                  <span style={{ color: 'var(--color-warning)' }}>🕒 {formatTimer(timers[order.id] || 0)}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Type: {order.order_type.toUpperCase()} {order.table_number && `• Table ${order.table_number}`}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  {order.items?.map(i => (
                    <div key={i.id} style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                      {i.quantity} x {i.item_name}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button onClick={() => handleUpdateStatus(order.id, 'ready')} className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: '0.75rem' }}>
                    Mark Ready
                  </button>
                  <button onClick={() => handlePrintKOT(order)} className="btn btn-outline btn-sm">
                    <Icon name="clipboard" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lane 3: Ready for Pickup/Delivery */}
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ borderBottom: '2.5px solid var(--color-success)', paddingBottom: '0.5rem', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem' }}>Ready / Packed</h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--color-success)', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
              {orders.filter(o => o.status === 'ready').length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '300px' }}>
            {orders.filter(o => o.status === 'ready').map(order => (
              <div key={order.id} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--color-success)' }}>
                <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <span>Order #{order.id}</span>
                  <span style={{ color: 'var(--color-success)' }}>Done ✓</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Type: {order.order_type.toUpperCase()} {order.table_number && `• Table ${order.table_number}`}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  {order.items?.map(i => (
                    <div key={i.id} style={{ fontSize: '0.85rem' }}>
                      {i.quantity} x {i.item_name}
                    </div>
                  ))}
                </div>

                {order.order_type !== 'delivery' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'served')} 
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Served / Delivered
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default KitchenDashboard;
