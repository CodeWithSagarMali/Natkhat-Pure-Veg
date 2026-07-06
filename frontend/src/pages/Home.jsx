import React from 'react';
import Icon from '../components/Icons';

export const Home = ({ setCurrentTab }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '4rem' }} className="animate-fade-in">
      
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
        color: '#fff',
        padding: '5rem 2rem',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
            100% PURE VEGETARIAN RESTAURANT
          </span>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-family-title)', color: '#fff', lineHeight: '1.1' }}>
            Where Traditional Flavor Meets Elegant Dining
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: '0.9', maxWidth: '600px' }}>
            Savor the richness of authentic South Indian crispy dosas, rich North Indian paneer delicacies, healthy Jain specialities, and organic beverages.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setCurrentTab('menu')} className="btn" style={{ backgroundColor: '#fff', color: 'var(--color-primary)' }}>
              <Icon name="menu" size={18} /> View Digital Menu
            </button>
            <button onClick={() => setCurrentTab('table_reserve')} className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
              <Icon name="clipboard" size={18} /> Reserve a Table
            </button>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ color: 'var(--color-primary)' }}>
              <Icon name="utensils" size={32} />
            </div>
            <h3>Jain Food Specialities</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              We offer a dedicated Jain menu prepared strictly in accordance with Jain dietary rules, without any root vegetables (no onions, no garlic).
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ color: 'var(--color-primary)' }}>
              <Icon name="clipboard" size={32} />
            </div>
            <h3>Table QR Ordering</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              No queues. Simply scan the QR code located on your table, customize your food, place the order directly, and request the bill instantly!
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ color: 'var(--color-primary)' }}>
              <Icon name="award" size={32} />
            </div>
            <h3>Loyalty Perks</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Earn 10% back in Loyalty points on every online and dine-in transaction. Unlock exclusive Gold & Platinum membership tiers for free desserts!
            </p>
          </div>

        </div>
      </section>

      {/* Promotional Highlights / Todays Specials */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2>Today's Gourmet Specials</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Handpicked specialties prepared by our premium executive chefs</p>
        </div>

        <div className="grid-cards">
          
          {/* Card 1 */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ height: '180px', backgroundColor: '#e2ede2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="utensils" size={48} color="var(--color-primary)" />
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                <span className="veg-badge" title="Pure Veg"></span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px' }}>Bestseller</span>
              </div>
              <h4 style={{ fontSize: '1.1rem' }}>Paneer Butter Masala</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
                Rich cottage cheese simmered in a creamy butter gravy with crushed cashews and traditional spices.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.1rem' }}>₹204.00</span>
                <button onClick={() => setCurrentTab('menu')} className="btn btn-primary btn-sm">Order Now</button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ height: '180px', backgroundColor: '#e2ede2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="utensils" size={48} color="var(--color-primary)" />
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                <span className="jain-badge" title="Jain Available"></span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--color-warning)', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>Jain Option</span>
              </div>
              <h4 style={{ fontSize: '1.1rem' }}>Masala Dosa</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
                Super crispy fermented rice crepe folded with mashed spicy potatoes, served with authentic coconut chutney.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.1rem' }}>₹108.00</span>
                <button onClick={() => setCurrentTab('menu')} className="btn btn-primary btn-sm">Order Now</button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ height: '180px', backgroundColor: '#e2ede2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="utensils" size={48} color="var(--color-primary)" />
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                <span className="veg-badge" title="Pure Veg"></span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px' }}>Recommended</span>
              </div>
              <h4 style={{ fontSize: '1.1rem' }}>Royal Maharaja Thali</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
                A royal multi-dish Indian platter with curries, rice, tandoori rotis, desserts, roasted papad and buttermilk.
              </p>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.1rem' }}>₹288.00</span>
                <button onClick={() => setCurrentTab('menu')} className="btn btn-primary btn-sm">Order Now</button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Quick Service */}
      <section className="container" style={{ margin: '1rem auto' }}>
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderLeft: '5px solid var(--color-primary)', padding: '2rem' }}>
          <div>
            <h3>Dining at our restaurant right now?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Skip the queue! You can order directly using QR code ordering or call a waiter for immediate assistance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                alert("Simulating Table QR Scan! Routing to Dine-in QR Menu for Table T3.");
                setCurrentTab('menu');
                window.location.hash = '#table=T3';
              }} 
              className="btn btn-primary"
            >
              <Icon name="search" size={18} /> Scan Table QR
            </button>
            <button 
              onClick={() => {
                alert("Bell Rang! Waiter has been requested to Table T3. Staff will arrive shortly.");
              }} 
              className="btn btn-outline"
            >
              <Icon name="bell" size={18} /> Call Waiter
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
