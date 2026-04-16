import React, { useState, useEffect } from 'react';

function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session) {
      setIsLoggedIn(true);
      fetchDashboard();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });

      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('adminSession', data.sessionId);
        setIsLoggedIn(true);
        fetchDashboard();
        showToast('登录成功！');
      } else {
        showToast(data.message || '口令错误');
      }
    } catch (error) {
      console.error('登录失败:', error);
      showToast('登录失败，请重试');
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      setDashboard(data);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  const handleReply = async (moodId) => {
    const reply = replyText[moodId];
    if (!reply) {
      showToast('请输入回复内容');
      return;
    }

    try {
      const res = await fetch(`/api/moods/${moodId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply })
      });

      if (res.ok) {
        showToast('回复成功！💌');
        setReplyText({ ...replyText, [moodId]: '' });
        fetchDashboard();
      }
    } catch (error) {
      console.error('回复失败:', error);
      showToast('回复失败，请重试');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setIsLoggedIn(false);
    setDashboard(null);
    showToast('已退出登录');
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-page">
        {toast && <div className="toast">{toast}</div>}
        
        <div className="card login-form">
          <h2>🔐 管理后台</h2>
          <p style={{ color: '#888', marginTop: '10px' }}>
            请输入管理口令
          </p>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="input passcode-input"
              placeholder="口令"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              maxLength={10}
            />
            
            <button type="submit" className="btn">
              登录
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>📋 管理面板</h2>
          <button 
            className="btn btn-secondary" 
            style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }}
            onClick={handleLogout}
          >
            退出
          </button>
        </div>
      </div>

      {dashboard && (
        <>
          <div className="card">
            <h2>❤️ 心情动态 ({dashboard.moods.length})</h2>
            
            {dashboard.moods.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                还没有心情记录
              </p>
            ) : (
              <ul className="mood-list">
                {dashboard.moods.map((mood) => (
                  <li key={mood.id} className="mood-item" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div className="mood-emoji">{mood.emoji}</div>
                      <div className="mood-content">
                        <div className="mood-date">{formatDate(mood.createdAt)}</div>
                        {mood.note && <div className="mood-note">{mood.note}</div>}
                        {mood.reply && (
                          <div className="mood-reply">
                            💌 已回复：{mood.reply}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!mood.reply && (
                      <div style={{ marginTop: '12px' }}>
                        <input
                          type="text"
                          className="input"
                          placeholder="写下你的关心..."
                          value={replyText[mood.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [mood.id]: e.target.value })}
                          style={{ marginBottom: '8px' }}
                        />
                        <button
                          className="btn"
                          style={{ padding: '8px 16px', fontSize: '14px' }}
                          onClick={() => handleReply(mood.id)}
                        >
                          回复
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2>🌿 打卡统计</h2>
            <p style={{ color: '#888' }}>
              总打卡次数：{dashboard.wellness.filter(w => w.completed === 1).length}
            </p>
            <p style={{ color: '#888', marginTop: '8px' }}>
              连续记录：{dashboard.wellness.length} 天
            </p>
          </div>

          <div className="card">
            <h2>📒 记账统计</h2>
            <p style={{ color: '#888' }}>
              总记录数：{dashboard.expenses.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminPage;
