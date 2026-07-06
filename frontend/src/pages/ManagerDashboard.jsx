import React, { useState, useEffect } from 'react';
import Icon from '../components/Icons';

export const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('menu'); // menu, inventory, staff
  
  // Menu items states
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  
  // Inventory states
  const [inventory, setInventory] = useState([]);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustItem, setAdjustItem] = useState(null);

  // Staff States
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const resC = await fetch('/api/menu/categories');
      setCategories(await resC.json());

      if (activeTab === 'menu') {
        const resI = await fetch('/api/menu/items');
        setItems(await resI.json());
      } else if (activeTab === 'inventory') {
        const resInv = await fetch('/api/inventory', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setInventory(await resInv.json());
      } else if (activeTab === 'staff') {
        const resS = await fetch('/api/employees', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setStaff(await resS.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Adjust Inventory Stock In/Out
  const handleAdjustStock = async (type) => {
    if (!adjustItem || !adjustQty) return;
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: adjustItem.id, quantity: parseFloat(adjustQty), type })
      });
      if (res.ok) {
        setAdjustQty('');
        setAdjustItem(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const res = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...item, available: item.available === 1 ? 0 : 1 })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h2>Manager Console</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Supervise daily operations: menu listings, kitchen ingredients, and shift details</p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {['menu', 'inventory', 'staff'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'menu' && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem' }}>Menu Item Availability</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Dish Name</th>
                  <th style={{ padding: '8px' }}>Category</th>
                  <th style={{ padding: '8px' }}>Price</th>
                  <th style={{ padding: '8px' }}>Prep Time</th>
                  <th style={{ padding: '8px' }}>Veg/Jain Available</th>
                  <th style={{ padding: '8px' }}>Availability Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px', fontWeight: '600' }}>{item.name}</td>
                    <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{item.category_name}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>₹{item.offer_price.toFixed(2)}</td>
                    <td style={{ padding: '8px' }}>{item.prep_time} mins</td>
                    <td style={{ padding: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span className="veg-badge"></span>
                        {item.is_jain_available === 1 && <span className="jain-badge"></span>}
                      </div>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <button 
                        onClick={() => toggleAvailability(item)}
                        className={`btn btn-sm ${item.available === 1 ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                      >
                        {item.available === 1 ? 'Available' : 'Sold Out'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          {/* Inventory Table */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.25rem' }}>Stock Register</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Ingredient</th>
                    <th style={{ padding: '8px' }}>Category</th>
                    <th style={{ padding: '8px' }}>Quantity</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(inv => {
                    const isLow = inv.quantity <= inv.low_stock_threshold;
                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isLow ? 'var(--color-primary-light)' : 'transparent' }}>
                        <td style={{ padding: '8px', fontWeight: '600' }}>{inv.item_name}</td>
                        <td style={{ padding: '8px', textTransform: 'capitalize' }}>{inv.category}</td>
                        <td style={{ padding: '8px' }}>{inv.quantity} {inv.unit}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isLow ? 'var(--color-danger)' : 'var(--color-success)',
                            color: '#fff'
                          }}>
                            {isLow ? 'LOW STOCK' : 'IN STOCK'}
                          </span>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <button onClick={() => setAdjustItem(inv)} className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Adjust Stock Form */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem' }}>Adjust Ingredients Stock</h3>
            {adjustItem ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem' }}>Adjusting: <strong>{adjustItem.item_name}</strong> (Current: {adjustItem.quantity} {adjustItem.unit})</p>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Quantity ({adjustItem.unit})</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter amount"
                    value={adjustQty}
                    onChange={e => setAdjustQty(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleAdjustStock('in')} className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem' }}>Stock In</button>
                  <button onClick={() => handleAdjustStock('out')} className="btn btn-outline" style={{ flex: 1, fontSize: '0.85rem' }}>Stock Out</button>
                </div>
                <button onClick={() => setAdjustItem(null)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Cancel</button>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                Select an item from the stock register list to make changes.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem' }}>Employee Shifts & Attendance</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Staff Name</th>
                  <th style={{ padding: '8px' }}>Role</th>
                  <th style={{ padding: '8px' }}>Phone</th>
                  <th style={{ padding: '8px' }}>Today's Shift</th>
                  <th style={{ padding: '8px' }}>Mark Attendance</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(member => (
                  <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px', fontWeight: '600' }}>{member.username}</td>
                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{member.role}</td>
                    <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{member.phone || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>09:00 AM - 06:00 PM</td>
                    <td style={{ padding: '8px' }}>
                      <button 
                        onClick={async () => {
                          const date = new Date().toISOString().split('T')[0];
                          const res = await fetch('/api/employees/attendance', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({ user_id: member.id, date, status: 'present', check_in: '09:02' })
                          });
                          if (res.ok) alert(`Attendance marked PRESENT for ${member.username} on ${date}.`);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      >
                        Mark Present
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
export default ManagerDashboard;
