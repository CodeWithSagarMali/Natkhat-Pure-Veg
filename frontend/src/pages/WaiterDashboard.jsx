import React, { useState, useEffect } from 'react';
import Icon from '../components/Icons';

export const WaiterDashboard = () => {
  const [tables, setTables] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [calls, setCalls] = useState([
    { id: 1, table_number: 'T3', type: 'Call Waiter', time: '11:28 AM', status: 'pending' },
    { id: 2, table_number: 'T5', type: 'Request Bill', time: '11:30 AM', status: 'pending' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTablesAndOrders();
  }, []);

  const fetchTablesAndOrders = async () => {
    try {
      const resT = await fetch('/api/tables');
      const resO = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (resT.ok && resO.ok) {
        setTables(await resT.json());
        setActiveOrders(await resO.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    try {
      const res = await fetch(`/api/tables/${tableId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchTablesAndOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearCall = (callId) => {
    setCalls(prev => prev.filter(c => c.id !== callId));
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1.5rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h2>Waiter Service Control</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage table statuses, active service requests, and order deliveries</p>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Side: Tables status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Tables Occupancy & Layout</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {tables.map(t => {
                let statusColor = 'var(--color-success)';
                if (t.status === 'occupied') statusColor = 'var(--color-danger)';
                else if (t.status === 'reserved') statusColor = 'var(--color-warning)';
                else if (t.status === 'cleaning') statusColor = 'var(--color-info)';

                return (
                  <div key={t.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: `4px solid ${statusColor}` }}>
                    <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Table {t.table_number}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cap: {t.capacity}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      Status: <strong style={{ color: statusColor }}>{t.status}</strong>
                    </div>

                    {/* Status updater buttons */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      <button onClick={() => handleUpdateTableStatus(t.id, 'available')} className="btn btn-outline btn-sm" style={{ padding: '2px 6px', fontSize: '0.65rem', flex: 1 }}>Free</button>
                      <button onClick={() => handleUpdateTableStatus(t.id, 'occupied')} className="btn btn-outline btn-sm" style={{ padding: '2px 6px', fontSize: '0.65rem', flex: 1 }}>Occupy</button>
                      <button onClick={() => handleUpdateTableStatus(t.id, 'cleaning')} className="btn btn-outline btn-sm" style={{ padding: '2px 6px', fontSize: '0.65rem', flex: 1 }}>Clean</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Service Orders */}
          <div>
            <h3 style={{ marginBottom: '1rem' }}>My Active Table Orders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeOrders.filter(o => o.order_type === 'dine-in' && o.status !== 'served' && o.status !== 'cancelled').length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No active table orders at this moment.</p>
              ) : (
                activeOrders.filter(o => o.order_type === 'dine-in' && o.status !== 'served' && o.status !== 'cancelled').map(order => (
                  <div key={order.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justify: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <div>
                        <strong>Order #{order.id}</strong> (Table: {order.table_number || 'N/A'})
                      </div>
                      <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                        {order.status}
                      </span>
                    </div>
                    <div>
                      {order.items?.map(i => (
                        <div key={i.id} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {i.quantity} x {i.item_name}
                        </div>
                      ))}
                    </div>
                    {order.status === 'ready' && (
                      <button 
                        onClick={async () => {
                          const res = await fetch(`/api/orders/${order.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({ status: 'served' })
                          });
                          if (res.ok) fetchTablesAndOrders();
                        }} 
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '0.5rem' }}
                      >
                        Mark Served
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Waiter Calls */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="bell" color="var(--color-primary)" /> Table Call Requests
          </h3>
          {calls.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No pending service requests.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {calls.map(c => (
                <div key={c.id} style={{
                  borderLeft: '4px solid var(--color-warning)',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem' }}>Table {c.table_number}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600' }}>{c.type}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{c.time}</span>
                  </div>
                  <button onClick={() => handleClearCall(c.id)} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default WaiterDashboard;
