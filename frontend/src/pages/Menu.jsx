import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import Icon from '../components/Icons';

export const Menu = () => {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [jainFilter, setJainFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Customization modal state
  const [activeItem, setActiveItem] = useState(null);
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [extraButter, setExtraButter] = useState(false);
  const [extraCheese, setExtraCheese] = useState(false);
  const [noOnion, setNoOnion] = useState(false);
  const [noGarlic, setNoGarlic] = useState(false);
  const [isJainOption, setIsJainOption] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [itemQty, setItemQty] = useState(1);

  // Toast State
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategory, searchQuery, jainFilter]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/menu/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      let url = `/api/menu/items?`;
      if (selectedCategory) url += `category_id=${selectedCategory}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (jainFilter) url += `jain=true&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Open modal with default customizations
  const handleOpenCustomize = (item) => {
    setActiveItem(item);
    setSpiceLevel('medium');
    setExtraButter(false);
    setExtraCheese(false);
    // Auto toggle onion/garlic-free if Jain item
    setNoOnion(item.is_jain_available === 1);
    setNoGarlic(item.is_jain_available === 1);
    setIsJainOption(item.is_jain_available === 1);
    setSpecialInstructions('');
    setItemQty(1);
  };

  const handleAddToCart = () => {
    if (!activeItem) return;

    // Calculate added price for customizations
    let addedPrice = 0;
    if (extraButter) addedPrice += 15;
    if (extraCheese) addedPrice += 25;

    const finalItem = {
      ...activeItem,
      offer_price: activeItem.offer_price + addedPrice
    };

    const customizations = {
      spiceLevel,
      extraButter,
      extraCheese,
      noOnion: noOnion || isJainOption,
      noGarlic: noGarlic || isJainOption,
      isJain: isJainOption,
      specialInstructions
    };

    addToCart(finalItem, itemQty, customizations);
    setActiveItem(null);
    showToast(`Added ${itemQty} x ${activeItem.name} to cart!`);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {toastMessage && (
        <div className="toast success" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1100 }}>
          <Icon name="check" size={16} color="#fff" />
          <span style={{ color: '#fff', fontWeight: '500' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header and Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Explore Gourmet Veg Menu</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Fresh ingredients, cooked with passion</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', width: '100%', maxWidth: '400px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Icon name="search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
          </div>
          <button 
            onClick={() => setJainFilter(!jainFilter)}
            className={`btn ${jainFilter ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <span className="jain-badge" style={{ verticalAlign: 'middle', marginRight: '4px' }}></span> Jain Only
          </button>
        </div>
      </div>

      {/* Categories Horizontal Scroller */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setSelectedCategory('')}
          className={`btn ${selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="glass-card" style={{ height: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ height: '140px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-md)' }} className="spinner"></div>
              <div style={{ height: '20px', width: '60%', backgroundColor: 'var(--border-color)' }}></div>
              <div style={{ height: '40px', backgroundColor: 'var(--border-color)' }}></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Icon name="utensils" size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No vegetarian dishes found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search query or category filters.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {items.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform var(--transition-fast)' }}>
              {/* Image */}
              <div style={{ height: '150px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {(() => {
                  let imgUrl = '';
                  if (Array.isArray(item.images)) {
                    imgUrl = item.images[0] || '';
                  } else {
                    try {
                      const parsed = JSON.parse(item.images || '[]');
                      imgUrl = Array.isArray(parsed) ? (parsed[0] || '') : parsed;
                    } catch (e) {
                      imgUrl = item.images || '';
                    }
                  }
                  if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
                    return <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                  } else {
                    return <Icon name="utensils" size={40} color="var(--color-primary)" opacity="0.4" />;
                  }
                })()}
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '4px', zIndex: 1 }}>
                  <span className="veg-badge" title="Pure Veg" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1.5px solid var(--veg-border)' }}></span>
                  {item.is_jain_available === 1 && (
                    <span className="jain-badge" title="Jain Option Available" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1.5px solid var(--jain-border)' }}></span>
                  )}
                </div>
                {item.is_bestseller === 1 && (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem', backgroundColor: 'var(--color-success)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', zIndex: 1 }}>Bestseller</span>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{item.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Icon name="clock" size={12} /> {item.prep_time}m
                  </span>
                  {item.calories && (
                    <span>🔥 {item.calories} kcal</span>
                  )}
                </div>

                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <div>
                    {item.discount > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{item.price.toFixed(2)}</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.1rem' }}>₹{item.offer_price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.1rem' }}>₹{item.price.toFixed(2)}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleOpenCustomize(item)} 
                    className="btn btn-primary btn-sm"
                  >
                    <Icon name="plus" size={14} /> Customize
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customization Modal */}
      {activeItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>Customize: {activeItem.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Base Price: ₹{activeItem.offer_price.toFixed(2)}</p>
              </div>
              <button onClick={() => setActiveItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Customizations Body */}
            <div>
              {/* Spice Level */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="form-label">Spice Level</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['mild', 'medium', 'spicy'].map(level => (
                    <button
                      key={level}
                      onClick={() => setSpiceLevel(level)}
                      className={`btn btn-sm ${spiceLevel === level ? 'btn-primary' : 'btn-outline'}`}
                      style={{ flex: 1, textTransform: 'capitalize' }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="form-label">Premium Add-ons</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={extraButter} onChange={e => setExtraButter(e.target.checked)} />
                      Extra Butter
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>+ ₹15.00</span>
                  </label>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" checked={extraCheese} onChange={e => setExtraCheese(e.target.checked)} />
                      Extra Cheese
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>+ ₹25.00</span>
                  </label>
                </div>
              </div>

              {/* Veg / Jain Exclusions */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="form-label">Exclusions & Dietary Preference</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {activeItem.is_jain_available === 1 && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="checkbox" checked={isJainOption} onChange={e => {
                        setIsJainOption(e.target.checked);
                        if (e.target.checked) {
                          setNoOnion(true);
                          setNoGarlic(true);
                        }
                      }} />
                      <span className="jain-badge" style={{ marginRight: '4px' }}></span> Jain Option (No Onion, No Garlic)
                    </label>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={noOnion} onChange={e => setNoOnion(e.target.checked)} disabled={isJainOption} />
                    No Onion
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={noGarlic} onChange={e => setNoGarlic(e.target.checked)} disabled={isJainOption} />
                    No Garlic
                  </label>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="form-group">
                <label className="form-label">Special Cooking Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Make it extra crisp, less salt, etc."
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                />
              </div>

              {/* Quantity */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1.5px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button onClick={() => setItemQty(prev => Math.max(1, prev - 1))} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', borderRadius: '50%' }}>
                    <Icon name="minus" size={14} />
                  </button>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{itemQty}</span>
                  <button onClick={() => setItemQty(prev => prev + 1)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', borderRadius: '50%' }}>
                    <Icon name="plus" size={14} />
                  </button>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textAlign: 'right' }}>Total Price</span>
                  <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                    ₹{((activeItem.offer_price + (extraButter ? 15 : 0) + (extraCheese ? 25 : 0)) * itemQty).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={handleAddToCart} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Add to Basket
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default Menu;
