import React, { useState, useEffect } from 'react';
import Icon from '../components/Icons';

// ==========================================
// 1. MENU MANAGEMENT PANEL
// ==========================================
export const MenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    discount: '0',
    prep_time: '15',
    calories: '',
    ingredients: '',
    allergens: '',
    images: '',
    is_jain_available: false,
    is_bestseller: false,
    is_recommended: false
  });

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const resC = await fetch('/api/menu/categories');
      const resI = await fetch('/api/menu/items');
      if (resC.ok && resI.ok) {
        setCategories(await resC.json());
        setItems(await resI.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailable = async (item) => {
    try {
      const res = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...item, available: item.available === 1 ? 0 : 1 })
      });
      if (res.ok) {
        fetchMenuData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/menu/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchMenuData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.category_id) {
      alert('Please select a category');
      return;
    }
    try {
      const res = await fetch('/api/menu/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newItem,
          price: parseFloat(newItem.price),
          discount: parseFloat(newItem.discount || 0),
          prep_time: parseInt(newItem.prep_time || 15),
          calories: newItem.calories ? parseInt(newItem.calories) : null,
          is_jain_available: newItem.is_jain_available ? 1 : 0,
          is_bestseller: newItem.is_bestseller ? 1 : 0,
          is_recommended: newItem.is_recommended ? 1 : 0,
          images: newItem.images || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60'
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewItem({
          name: '', description: '', category_id: '', price: '', discount: '0',
          prep_time: '15', calories: '', ingredients: '', allergens: '', images: '',
          is_jain_available: false, is_bestseller: false, is_recommended: false
        });
        fetchMenuData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add item');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = catFilter === '' || String(item.category_id) === String(catFilter);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Menu Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Add new dishes, manage pricing, and toggle availability</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Icon name="plus" size={18} /> Add New Dish
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem' }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search items..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select 
          className="form-input" 
          value={catFilter} 
          onChange={e => setCatFilter(e.target.value)} 
          style={{ width: '220px' }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner"></div></div>
      ) : (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Photo</th>
                  <th style={{ padding: '12px 16px' }}>Dish Name</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Price</th>
                  <th style={{ padding: '12px 16px' }}>Prep Time</th>
                  <th style={{ padding: '12px 16px' }}>Available</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  let imgUrl = '';
                  if (Array.isArray(item.images)) {
                    imgUrl = item.images[0] || '';
                  } else {
                    try {
                      const parsed = JSON.parse(item.images || '[]');
                      imgUrl = Array.isArray(parsed) ? (parsed[0] || '') : parsed;
                    } catch {
                      imgUrl = item.images || '';
                    }
                  }

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
                          {imgUrl ? (
                            <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Icon name="utensils" size={16} /></div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                        <div>
                          {item.name}
                          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                            {item.is_jain_available === 1 && <span className="jain-badge" title="Jain Option"></span>}
                            {item.is_bestseller === 1 && <span style={{ fontSize: '0.6rem', color: '#fff', backgroundColor: 'var(--color-success)', padding: '1px 4px', borderRadius: '3px' }}>Bestseller</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{item.category_name}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                        {item.discount > 0 ? (
                          <div>
                            <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '6px' }}>₹{item.price}</span>
                            <span>₹{item.offer_price}</span>
                          </div>
                        ) : (
                          <span>₹{item.price}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{item.prep_time}m</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button 
                          onClick={() => handleToggleAvailable(item)} 
                          className={`btn btn-sm ${item.available === 1 ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        >
                          {item.available === 1 ? 'Available' : 'Sold Out'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => handleDeleteItem(item.id)} className="btn btn-outline btn-sm" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', padding: '4px' }} title="Delete Item">
                          <Icon name="trash" size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No menu items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Add New Menu Dish</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Icon name="close" size={22} />
              </button>
            </div>

            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Dish Name*</label>
                  <input type="text" className="form-input" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category*</label>
                  <select className="form-input" value={newItem.category_id} onChange={e => setNewItem({ ...newItem, category_id: e.target.value })} required>
                    <option value="">-- Choose Category --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price (₹)*</label>
                  <input type="number" step="0.01" className="form-input" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Discount (%)</label>
                  <input type="number" className="form-input" value={newItem.discount} onChange={e => setNewItem({ ...newItem, discount: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Prep Time (min)</label>
                  <input type="number" className="form-input" value={newItem.prep_time} onChange={e => setNewItem({ ...newItem, prep_time: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Calories (kcal)</label>
                  <input type="number" className="form-input" value={newItem.calories} onChange={e => setNewItem({ ...newItem, calories: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label font-title">Photo Image URL</label>
                  <input type="text" className="form-input" placeholder="https://unsplash.com/..." value={newItem.images} onChange={e => setNewItem({ ...newItem, images: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ingredients</label>
                  <input type="text" className="form-input" placeholder="Rice, Dal, Butter..." value={newItem.ingredients} onChange={e => setNewItem({ ...newItem, ingredients: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Allergens</label>
                  <input type="text" className="form-input" placeholder="Gluten, Dairy, Nuts..." value={newItem.allergens} onChange={e => setNewItem({ ...newItem, allergens: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={newItem.is_jain_available} onChange={e => setNewItem({ ...newItem, is_jain_available: e.target.checked })} />
                  Jain Version Available
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={newItem.is_bestseller} onChange={e => setNewItem({ ...newItem, is_bestseller: e.target.checked })} />
                  Bestseller Dish
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={newItem.is_recommended} onChange={e => setNewItem({ ...newItem, is_recommended: e.target.checked })} />
                  Recommended by Chef
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Create Menu Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 2. TABLES LAYOUT & RESERVATIONS PANEL
// ==========================================
export const TablesLayout = () => {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    fetchTablesAndReservations();
  }, []);

  const fetchTablesAndReservations = async () => {
    setLoading(true);
    try {
      const resT = await fetch('/api/tables');
      const resR = await fetch('/api/tables/reservations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (resT.ok && resR.ok) {
        setTables(await resT.json());
        setReservations(await resR.json());
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
        setSelectedTable(null);
        fetchTablesAndReservations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReservationStatus = async (resId, newStatus) => {
    try {
      const res = await fetch(`/api/tables/reservations/${resId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchTablesAndReservations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <h2>Tables Layout & Reservations</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Supervise dine-in seating grids and manage customer advance bookings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Table layout grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '0.5rem' }}>Restaurant Floor Seating</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {tables.map(t => {
              let statusColor = 'var(--color-success)';
              if (t.status === 'occupied') statusColor = 'var(--color-danger)';
              else if (t.status === 'reserved') statusColor = 'var(--color-warning)';
              else if (t.status === 'cleaning') statusColor = 'var(--color-info)';

              return (
                <div 
                  key={t.id} 
                  className="glass-card" 
                  onClick={() => setSelectedTable(t)}
                  style={{ 
                    cursor: 'pointer', 
                    borderTop: `5px solid ${statusColor}`,
                    boxShadow: selectedTable?.id === t.id ? 'var(--shadow-focus)' : 'var(--shadow-sm)',
                    backgroundColor: selectedTable?.id === t.id ? 'var(--color-primary-light)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                    <span style={{ fontSize: '1.2rem' }}>Table {t.table_number}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cap: {t.capacity}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '10px', textTransform: 'capitalize' }}>
                    Status: <strong style={{ color: statusColor }}>{t.status}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Table status editor */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '90px' }}>
          <h3>Table Quick Controls</h3>
          {selectedTable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Table {selectedTable.table_number}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Capacity: {selectedTable.capacity} guests</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current: <strong style={{ textTransform: 'capitalize' }}>{selectedTable.status}</strong></p>
              </div>
              <div>
                <span className="form-label">Set Live Status</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button onClick={() => handleUpdateTableStatus(selectedTable.id, 'available')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>🟢 Set Available</button>
                  <button onClick={() => handleUpdateTableStatus(selectedTable.id, 'occupied')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>🔴 Set Occupied</button>
                  <button onClick={() => handleUpdateTableStatus(selectedTable.id, 'cleaning')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>🔵 Set Cleaning</button>
                  <button onClick={() => handleUpdateTableStatus(selectedTable.id, 'reserved')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>🟡 Set Reserved</button>
                </div>
              </div>
              <button onClick={() => setSelectedTable(null)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Cancel</button>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1.5rem 0' }}>
              Click on a floor layout table to view and edit its active occupancy status.
            </p>
          )}
        </div>
      </div>

      {/* Table Reservations Register */}
      <div>
        <h3 style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>Table Bookings Register</h3>
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Customer Name</th>
                  <th style={{ padding: '12px 16px' }}>Contact Phone</th>
                  <th style={{ padding: '12px 16px' }}>Reserved Table</th>
                  <th style={{ padding: '12px 16px' }}>Guests</th>
                  <th style={{ padding: '12px 16px' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => {
                  let statusBg = 'var(--color-warning)';
                  if (res.status === 'confirmed') statusBg = 'var(--color-primary)';
                  else if (res.status === 'completed') statusBg = 'var(--color-success)';
                  else if (res.status === 'cancelled') statusBg = 'var(--color-danger)';

                  return (
                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>{res.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{res.phone}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>Table {res.table_number || 'N/A'}</td>
                      <td style={{ padding: '12px 16px' }}>{res.guests_count}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {new Date(res.reservation_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', backgroundColor: statusBg, color: '#fff', textTransform: 'capitalize' }}>
                          {res.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {res.status === 'confirmed' && (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleUpdateReservationStatus(res.id, 'completed')} 
                              className="btn btn-primary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                            >
                              Complete
                            </button>
                            <button 
                              onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')} 
                              className="btn btn-outline btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.7rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {res.status === 'pending' && (
                          <button 
                            onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')} 
                            className="btn btn-primary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                          >
                            Confirm
                          </button>
                        )}
                        {(res.status === 'completed' || res.status === 'cancelled') && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No table bookings registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 3. INVENTORY MANAGEMENT PANEL
// ==========================================
export const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setInventory(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (type) => {
    if (!adjustItem || !adjustQty) return;
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: adjustItem.id,
          quantity: parseFloat(adjustQty),
          type
        })
      });
      if (res.ok) {
        setAdjustQty('');
        setAdjustItem(null);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2>Inventory Control Register</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Supervise kitchen raw ingredients, packing boxes, and warning thresholds</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Inventory listing */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Ingredient</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Current Stock</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(inv => {
                  const isLow = inv.quantity <= inv.low_stock_threshold;
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isLow ? 'var(--color-primary-light)' : 'transparent' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                        <div>
                          {inv.item_name}
                          {inv.supplier_name && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }}>Supplier: {inv.supplier_name}</div>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{inv.category}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{inv.quantity} {inv.unit}</td>
                      <td style={{ padding: '12px 16px' }}>
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
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => setAdjustItem(inv)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
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

        {/* Adjust Form */}
        <div className="glass-card" style={{ position: 'sticky', top: '90px' }}>
          <h3>Adjust Ingredient Stock</h3>
          {adjustItem ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.85rem' }}>Item: <strong>{adjustItem.item_name}</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current: {adjustItem.quantity} {adjustItem.unit} (Threshold: {adjustItem.low_stock_threshold} {adjustItem.unit})</p>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Adjust Quantity ({adjustItem.unit})*</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-input" 
                  placeholder="Enter amount" 
                  value={adjustQty} 
                  onChange={e => setAdjustQty(e.target.value)} 
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleAdjustStock('in')} className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem' }}>Stock In (+)</button>
                <button onClick={() => handleAdjustStock('out')} className="btn btn-outline" style={{ flex: 1, fontSize: '0.85rem' }}>Stock Out (-)</button>
              </div>
              <button onClick={() => setAdjustItem(null)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Cancel</button>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
              Select an ingredient from the register table to stock-in or stock-out values.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 4. EMPLOYEE DIRECTORY PANEL
// ==========================================
export const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/employees', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2>Employee Directory</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage restaurant staff, view roles, shifts, and log daily check-ins</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Directory table */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Staff Name</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Email Address</th>
                  <th style={{ padding: '12px 16px' }}>Contact Phone</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{emp.username}</td>
                    <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                      <span style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {emp.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{emp.email}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{emp.phone || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shift Details */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Shift Guidelines</h3>
          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong>☀️ Morning Shift:</strong>
              <p>08:00 AM - 04:00 PM (Waiter, Kitchen, Cashier)</p>
            </div>
            <div>
              <strong>🌆 Evening Shift:</strong>
              <p>04:00 PM - 11:00 PM (Waiter, Kitchen, Cashier, Delivery)</p>
            </div>
            <div>
              <strong>🛠️ Manager Shift:</strong>
              <p>09:00 AM - 07:00 PM (Daily supervision)</p>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
              <p>Staff check-ins are logged automatically via biometric console or marked manually by manager daily logs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 5. SYSTEM SETTINGS PANEL
// ==========================================
export const SystemSettings = () => {
  const [settings, setSettings] = useState({
    restaurant_name: '',
    restaurant_phone: '',
    restaurant_email: '',
    gst_percentage: '5.0',
    delivery_charge: '40.00',
    working_hours: '08:00 AM - 11:00 PM'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/settings/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '600px', margin: 'auto' }}>
      <div className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2>System Configuration</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Configure taxes, delivery settings, working hours, and contact details</p>
        </div>

        {message && <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>{message}</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Restaurant Title*</label>
            <input type="text" className="form-input" value={settings.restaurant_name} onChange={e => setSettings({ ...settings, restaurant_name: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">GST Tax Percentage (%)*</label>
              <input type="number" step="0.1" className="form-input" value={settings.gst_percentage} onChange={e => setSettings({ ...settings, gst_percentage: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Flat Delivery Charge (₹)*</label>
              <input type="number" step="0.01" className="form-input" value={settings.delivery_charge} onChange={e => setSettings({ ...settings, delivery_charge: e.target.value })} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Contact Phone Number*</label>
            <input type="text" className="form-input" value={settings.restaurant_phone} onChange={e => setSettings({ ...settings, restaurant_phone: e.target.value })} required />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Support Email Address*</label>
            <input type="email" className="form-input" value={settings.restaurant_email} onChange={e => setSettings({ ...settings, restaurant_email: e.target.value })} required />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Operation Working Hours*</label>
            <input type="text" className="form-input" placeholder="e.g. 08:00 AM - 11:00 PM" value={settings.working_hours} onChange={e => setSettings({ ...settings, working_hours: e.target.value })} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save System Settings</button>
        </form>
      </div>
    </div>
  );
};
