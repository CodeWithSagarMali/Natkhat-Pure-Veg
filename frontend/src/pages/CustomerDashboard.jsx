import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icons';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review form states
  const [selectedItemId, setSelectedItemId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  // Live Chat simulation states
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Welcome to Natkhat Pure Veg Support! How can I assist you today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [userMsg, setUserMsg] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!selectedItemId) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ menu_item_id: selectedItemId, rating, comment })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMessage('Thank you! Your review has been submitted for moderation.');
        setSelectedItemId('');
        setComment('');
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!userMsg.trim()) return;

    const newMsg = {
      sender: 'user',
      text: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setUserMsg('');

    // Simulated reply from staff
    setTimeout(() => {
      let replyText = "I have notified our kitchen team to check on your preparation. We will update you shortly!";
      if (userMsg.toLowerCase().includes('bill') || userMsg.toLowerCase().includes('pay')) {
        replyText = "We accept UPI and cash at the desk. You can pay via the app or ask the waiter to print the invoice.";
      } else if (userMsg.toLowerCase().includes('table')) {
        replyText = "Your table status is checked. To merge tables, please contact our manager on duty.";
      }
      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '5px solid var(--color-primary)' }}>
        <div>
          <h2>Namaste, {user?.username}!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to your Personal Dining Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Membership Tier</span>
            <span style={{ fontWeight: '800', color: 'var(--color-primary)', fontSize: '1.2rem' }}>{user?.membership_level || 'Bronze'}</span>
          </div>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Loyalty Points</span>
            <span style={{ fontWeight: '800', color: 'var(--color-primary)', fontSize: '1.2rem' }}>💎 {user?.loyalty_pts || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Side: Orders Tracking & Table bookings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Active Orders tracking */}
          <div>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="clock" color="var(--color-primary)" /> Active Orders
            </h3>

            {loading ? (
              <div className="spinner"></div>
            ) : orders.filter(o => o.status !== 'served' && o.status !== 'delivered' && o.status !== 'cancelled').length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No active orders at the moment. Order from our fresh menu!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.filter(o => o.status !== 'served' && o.status !== 'delivered' && o.status !== 'cancelled').map(order => (
                  <div key={order.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justify: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Order #{order.id}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>Type: {order.order_type.toUpperCase()}</span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: order.status === 'cooking' ? 'var(--color-warning)' : 'var(--color-primary-light)',
                        color: order.status === 'cooking' ? '#fff' : 'var(--color-primary)'
                      }}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div>
                      {order.items?.map(i => (
                        <div key={i.id} style={{ display: 'flex', justify: 'space-between', fontSize: '0.9rem', margin: '4px 0' }}>
                          <span>{i.quantity} x {i.item_name}</span>
                          <span>₹{(i.price * i.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress tracking indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '1rem' }}>
                      {['pending', 'cooking', 'ready', order.order_type === 'delivery' ? 'delivered' : 'served'].map((step, idx) => {
                        const steps = ['pending', 'cooking', 'ready', order.order_type === 'delivery' ? 'delivered' : 'served'];
                        const currentIdx = steps.indexOf(order.status);
                        const isActive = idx <= currentIdx;
                        
                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--border-color)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 'bold'
                            }}>
                              {idx + 1}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', textTransform: 'capitalize', marginTop: '4px' }}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                      {/* Line connector */}
                      <div style={{
                        position: 'absolute',
                        top: '11px',
                        left: '12%',
                        right: '12%',
                        height: '2px',
                        backgroundColor: 'var(--border-color)',
                        zIndex: 1
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Orders History */}
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Order History</h3>
            {orders.filter(o => o.status === 'served' || o.status === 'delivered' || o.status === 'cancelled').length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No completed orders found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.filter(o => o.status === 'served' || o.status === 'delivered' || o.status === 'cancelled').map(order => (
                  <div key={order.id} className="glass-card" style={{ display: 'flex', justify: 'space-between', alignItems: 'center', padding: '0.75rem 1rem' }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>Order #{order.id} - ₹{order.final_amount.toFixed(2)}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString()} • {order.order_type.toUpperCase()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a href={`/api/billing/receipt/${order.id}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Receipt</a>
                      <button 
                        onClick={() => {
                          setSelectedItemId(order.items[0]?.menu_item_id || '');
                          setReviewMessage('');
                        }} 
                        className="btn btn-outline btn-sm"
                      >
                        Rate Food
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Chat & Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Review form */}
          {selectedItemId && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Submit Food Rating</h3>
              {reviewMessage && <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginBottom: '0.5rem' }}>{reviewMessage}</p>}
              
              <form onSubmit={handlePostReview} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Rating (1-5)</label>
                  <select className="form-input" value={rating} onChange={e => setRating(parseInt(e.target.value))}>
                    <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                    <option value="4">⭐⭐⭐⭐ (Good)</option>
                    <option value="3">⭐⭐⭐ (Average)</option>
                    <option value="2">⭐⭐ (Poor)</option>
                    <option value="1">⭐ (Unsatisfactory)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Review Comment</label>
                  <textarea
                    className="form-input"
                    placeholder="Tell us what you liked/disliked..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows="3"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Submit</button>
                  <button type="button" onClick={() => setSelectedItemId('')} className="btn btn-outline btn-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Live Chat Support */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '360px', padding: '0', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="chat" size={18} color="#fff" />
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.9rem' }}>Natkhat Helpdesk</h4>
                <span style={{ fontSize: '0.65rem', opacity: '0.8' }}>Online • Virtual Assistant</span>
              </div>
            </div>
            
            {/* Chat Messages Logs */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? 'var(--color-primary-light)' : 'var(--bg-secondary)',
                  color: msg.sender === 'user' ? 'var(--color-primary-dark)' : 'var(--text-primary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  maxWidth: '85%',
                  fontSize: '0.8rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <p>{msg.text}</p>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', textAlign: 'right', marginTop: '2px' }}>{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input field */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', borderTop: '1px solid var(--border-color)', padding: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ask about table status, billing..."
                value={userMsg}
                onChange={e => setUserMsg(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderTopRightRadius: '0', borderBottomRightRadius: '0' }}
              />
              <button type="submit" className="btn btn-primary" style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0', padding: '0.4rem 1rem' }}>Send</button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
export default CustomerDashboard;
