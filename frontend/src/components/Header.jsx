import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import Icon from './Icons';

export const Header = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { cartItems } = useCart();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-primary-light)', padding: '0.4rem', borderRadius: 'var(--radius-md)' }}>
          <Icon name="utensils" color="var(--color-primary)" size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-family-title)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Natkhat Pure Veg <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-success)', color: '#fff', padding: '1px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>100% VEG</span>
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fine Dining & Smart Ordering</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} />
        </button>

        {/* Cart Trigger */}
        {(!user || user.role === 'customer') && (
          <button 
            onClick={() => setCurrentTab('cart')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative' }}
          >
            <Icon name="cart" />
            {totalCartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: 'var(--color-success)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignsItem: 'center',
                justifyContent: 'center',
                lineHeight: '18px'
              }}>
                {totalCartCount}
              </span>
            )}
          </button>
        )}

        {/* User profile dropdown & logout */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1.5px solid var(--border-color)', paddingLeft: '1.25rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.username}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
            </div>
            <button 
              onClick={logout} 
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem' }}
              title="Logout"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setCurrentTab('login')} 
            className="btn btn-primary btn-sm"
          >
            <Icon name="user" size={16} /> Login
          </button>
        )}
      </div>
    </header>
  );
};
export default Header;
