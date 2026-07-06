import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icons';

export const Sidebar = ({ currentTab, setCurrentTab }) => {
  const { user } = useAuth();
  
  // Define sidebar menu options based on role
  const getMenuOptions = () => {
    const role = user?.role || 'customer';

    switch (role) {
      case 'admin':
        return [
          { id: 'admin_dashboard', label: 'Admin Dashboard', icon: 'dashboard' },
          { id: 'menu_manage', label: 'Menu Management', icon: 'menu' },
          { id: 'tables_manage', label: 'Tables Layout', icon: 'clipboard' },
          { id: 'inventory', label: 'Inventory Management', icon: 'settings' },
          { id: 'employees', label: 'Employee Directory', icon: 'user' },
          { id: 'admin_settings', label: 'System Settings', icon: 'settings' }
        ];
      case 'manager':
        return [
          { id: 'manager_dashboard', label: 'Manager Dashboard', icon: 'dashboard' },
          { id: 'menu_manage', label: 'Menu Management', icon: 'menu' },
          { id: 'tables_manage', label: 'Tables Layout', icon: 'clipboard' },
          { id: 'inventory', label: 'Inventory Control', icon: 'settings' },
          { id: 'employees', label: 'Employee Shift/Salary', icon: 'user' }
        ];
      case 'cashier':
        return [
          { id: 'cashier_dashboard', label: 'Cashier Dashboard', icon: 'dashboard' },
          { id: 'billing', label: 'Billing & POS', icon: 'credit-card' },
          { id: 'tables_manage', label: 'Live Tables Status', icon: 'clipboard' }
        ];
      case 'waiter':
        return [
          { id: 'waiter_dashboard', label: 'Waiter Dashboard', icon: 'dashboard' },
          { id: 'tables_manage', label: 'Table Orders', icon: 'clipboard' }
        ];
      case 'kitchen':
        return [
          { id: 'kitchen_dashboard', label: 'Kitchen KDS', icon: 'utensils' },
          { id: 'inventory', label: 'Kitchen Inventory', icon: 'settings' }
        ];
      case 'delivery':
        return [
          { id: 'delivery_dashboard', label: 'Delivery Panel', icon: 'truck' }
        ];
      case 'customer':
      default:
        return [
          { id: 'home', label: 'Home / Welcome', icon: 'home' },
          { id: 'menu', label: 'Explore Menu', icon: 'menu' },
          { id: 'table_reserve', label: 'Table Booking', icon: 'clipboard' },
          { id: 'customer_orders', label: 'My Orders', icon: 'clock' }
        ];
    }
  };

  const menuOptions = getMenuOptions();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Icon name="utensils" color="var(--color-primary)" size={24} />
        <div>
          <h3 style={{ fontSize: '1rem', lineHeight: '1.2' }}>VEG OASIS</h3>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>DASHBOARD</span>
        </div>
      </div>
      <ul className="sidebar-menu">
        {menuOptions.map(option => (
          <li key={option.id}>
            <button
              onClick={() => setCurrentTab(option.id)}
              className={`sidebar-link ${currentTab === option.id ? 'active' : ''}`}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Icon name={option.icon} size={18} />
              <span>{option.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {user && (
        <div style={{ padding: '1rem', borderTop: '1.5px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          LoggedIn: <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{user.role.toUpperCase()}</span>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
