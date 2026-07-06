import React, { useState, useEffect } from 'react';
import { LineChart, BarChart } from '../components/VisualCharts';
import Icon from '../components/Icons';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Settings edit state
  const [settings, setSettings] = useState({
    gst_percentage: '5.0',
    restaurant_name: 'Gourmet Veg Oasis',
    restaurant_phone: '+91 98765 43210',
    restaurant_email: 'contact@gourmetvegoasis.com',
    delivery_charge: '40.00'
  });
  const [settingsMsg, setSettingsMsg] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchUsersList();
    fetchSettings();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/reports/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await fetch('/api/employees', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsMsg('');
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
        setSettingsMsg('Settings updated successfully!');
      } else {
        alert('Failed to update settings');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !stats) {
    return <div className="container" style={{ padding: '4rem 1.5rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h2>System Administration</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Full restaurant configuration, analytics, and staff controls</p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL REVENUE</span>
          <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary)' }}>₹{stats.revenue.toFixed(2)}</span>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>COMPLETED ORDERS</span>
          <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary)' }}>{stats.orders}</span>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL CUSTOMERS</span>
          <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary)' }}>{stats.customers}</span>
        </div>
        {stats.lowStockItems > 0 && (
          <div className="glass-card" style={{ borderLeft: '4px solid var(--color-danger)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>LOW STOCK ITEMS</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-danger)' }}>{stats.lowStockItems}</span>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Sales Trend Line Chart */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Revenue Trends (Last 7 Days)</h3>
          <LineChart data={stats.salesTrend} height={180} />
        </div>

        {/* Top Dish Bar Chart */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Top Selling Items (Quantity Sold)</h3>
          <BarChart data={stats.topDishes} height={180} />
        </div>
      </div>

      {/* Tables layout / Users list and Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Users list */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Active Staff Members</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Username</th>
                  <th style={{ padding: '8px' }}>Role</th>
                  <th style={{ padding: '8px' }}>Email</th>
                  <th style={{ padding: '8px' }}>Phone</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px', fontWeight: '600' }}>{u.username}</td>
                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>
                      <span style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{u.phone || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Settings Form */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>System Settings</h3>
          {settingsMsg && <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginBottom: '0.75rem' }}>{settingsMsg}</p>}
          
          <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Restaurant Title</label>
              <input
                type="text"
                className="form-input"
                value={settings.restaurant_name}
                onChange={e => setSettings({ ...settings, restaurant_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">GST Tax (%)</label>
              <input
                type="text"
                className="form-input"
                value={settings.gst_percentage}
                onChange={e => setSettings({ ...settings, gst_percentage: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Delivery Fee (₹)</label>
              <input
                type="text"
                className="form-input"
                value={settings.delivery_charge}
                onChange={e => setSettings({ ...settings, delivery_charge: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Support Email</label>
              <input
                type="email"
                className="form-input"
                value={settings.restaurant_email}
                onChange={e => setSettings({ ...settings, restaurant_email: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Save Settings
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
export default AdminDashboard;
