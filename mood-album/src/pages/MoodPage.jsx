import React, { useState, useEffect } from 'react';

const moodEmojis = ['😊', '😄', '😌', '😔', '😢', '😠', '😴', '🤒', '🥳', '😍'];

function MoodPage() {
  const [moods, setMoods] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [note, setNote] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      const res = await fetch('/api/moods');
      const data = await res.json();
      setMoods(data);
    } catch (error) {
      console.error('获取心情记录失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmoji) {
      showToast('请先选择一个心情 😊');
      return;
    }

    try {
      const res = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emoji: selectedEmoji,
          note
        })
      });

      if (res.ok) {
        showToast('心情记录成功！✨');
        setSelectedEmoji(null);
        setNote('');
        fetchMoods();
      }
    } catch (error) {
      console.error('提交失败:', error);
      showToast('提交失败，请重试');
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (days === 1) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  return (
    <div className="mood-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="card">
        <h2>今天心情怎么样？</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="emoji-grid">
            {moodEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`emoji-btn ${selectedEmoji === emoji ? 'selected' : ''}`}
                onClick={() => setSelectedEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          <textarea
            className="textarea"
            placeholder="想记录点什么吗？（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button type="submit" className="btn">
            记录心情
          </button>
        </form>
      </div>

      <div className="card">
        <h2>心情记录</h2>
        
        {moods.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
            还没有心情记录，快来记录第一个吧~
          </p>
        ) : (
          <ul className="mood-list">
            {moods.map((mood) => (
              <li key={mood.id} className="mood-item">
                <div className="mood-emoji">{mood.emoji}</div>
                <div className="mood-content">
                  <div className="mood-date">{formatDate(mood.createdAt)}</div>
                  {mood.note && <div className="mood-note">{mood.note}</div>}
                  {mood.reply && (
                    <div className="mood-reply">
                      💌 {mood.reply}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MoodPage;
