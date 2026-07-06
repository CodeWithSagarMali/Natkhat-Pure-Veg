import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CashierDashboard from './pages/CashierDashboard';
import WaiterDashboard from './pages/WaiterDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import Icon from './components/Icons';

const MainAppContent = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');

  // Route guarding / auto-tab redirects on auth state changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'admin') setCurrentTab('admin_dashboard');
        else if (user.role === 'manager') setCurrentTab('manager_dashboard');
        else if (user.role === 'cashier') setCurrentTab('cashier_dashboard');
        else if (user.role === 'waiter') setCurrentTab('waiter_dashboard');
        else if (user.role === 'kitchen') setCurrentTab('kitchen_dashboard');
        else if (user.role === 'delivery') setCurrentTab('delivery_dashboard');
        else setCurrentTab('menu');
      } else {
        // Safe fallback when logging out
        setCurrentTab('home');
      }
    }
  }, [user, loading]);

  // Booking page content inside shell
  const renderTableReservation = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [guests, setGuests] = useState(2);
    const [time, setTime] = useState('');
    const [tableId, setTableId] = useState('');
    const [tables, setTables] = useState([]);
    const [booked, setBooked] = useState(false);

    useEffect(() => {
      fetch('/api/tables')
        .then(res => res.json())
        .then(data => setTables(data))
        .catch(err => console.error(err));
    }, []);

    const handleReserve = async (e) => {
      e.preventDefault();
      if (!tableId) {
        alert('Please choose a table.');
        return;
      }
      try {
        const res = await fetch('/api/tables/reserve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: user?.id,
            name,
            phone,
            table_id: tableId,
            guests_count: guests,
            reservation_time: time
          })
        });
        if (res.ok) {
          setBooked(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (booked) {
      return (
        <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '460px', margin: 'auto' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '1rem', borderRadius: '50%' }}>
              <Icon name="check" size={32} />
            </div>
            <h2>Table Booking Confirmed!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              We have reserved your table. A confirmation text/email has been simulated to your contact detail.
            </p>
            <button onClick={() => setBooked(false)} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>Book Another Table</button>
          </div>
        </div>
      );
    }

    return (
      <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '600px', margin: 'auto' }}>
        <div className="glass-card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2>Reserve a Fine-Dine Table</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Book in advance to enjoy premium 100% vegetarian courses without queues</p>
          </div>
          <form onSubmit={handleReserve} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Your Name</label>
              <input type="text" className="form-input" placeholder="Enter name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-input" placeholder="Enter phone" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Number of Guests</label>
                <input type="number" className="form-input" min="1" max="10" value={guests} onChange={e => setGuests(parseInt(e.target.value))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date & Time</label>
                <input type="datetime-local" className="form-input" value={time} onChange={e => setTime(e.target.value)} required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Available Table</label>
              <select className="form-input" value={tableId} onChange={e => setTableId(e.target.value)} required>
                <option value="">-- Choose Table --</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id} disabled={t.status !== 'available'}>
                    Table {t.table_number} (Capacity: {t.capacity}) - {t.status === 'available' ? 'Available' : 'Unavailable'}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Confirm Reservation</button>
          </form>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home setCurrentTab={setCurrentTab} />;
      case 'menu':
        return <Menu />;
      case 'cart':
        return <Cart setCurrentTab={setCurrentTab} />;
      case 'login':
        return <Login setCurrentTab={setCurrentTab} />;
      case 'table_reserve':
        return renderTableReservation();
      case 'customer_orders':
        return <CustomerDashboard />;
      case 'admin_dashboard':
        return <AdminDashboard />;
      case 'manager_dashboard':
        return <ManagerDashboard />;
      case 'cashier_dashboard':
        return <CashierDashboard />;
      case 'waiter_dashboard':
        return <WaiterDashboard />;
      case 'kitchen_dashboard':
        return <KitchenDashboard />;
      case 'delivery_dashboard':
        return <DeliveryDashboard />;
      default:
        return <Home setCurrentTab={setCurrentTab} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation Panel */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      {/* Main Container */}
      <div className="main-content">
        <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
