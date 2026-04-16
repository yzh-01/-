import React, { useState, useEffect } from 'react';

const plantStages = [
  { emoji: '🫘', name: '种子' },
  { emoji: '🌱', name: '发芽' },
  { emoji: '🌿', name: '成长' },
  { emoji: '🌸', name: '开花' },
  { emoji: '🌳', name: '大树' }
];

function WellnessPage() {
  const [wellness, setWellness] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchWellness();
  }, []);

  const fetchWellness = async () => {
    try {
      const res = await fetch('/api/wellness');
      const data = await res.json();
      setWellness(data);
      
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = data.find(w => w.date === today);
      setTodayData(todayEntry || { completed: 0, plantStage: 0 });
    } catch (error) {
      console.error('获取打卡数据失败:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await fetch('/api/wellness/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      
      if (data.success) {
        showToast(`打卡成功！${data.tip}`);
        fetchWellness();
      } else {
        showToast(data.message || '今日已打卡');
      }
    } catch (error) {
      console.error('打卡失败:', error);
      showToast('打卡失败，请重试');
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="wellness-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="card">
        <h2>🌿 今日打卡</h2>
        
        <div className="plant-display">
          <div className="plant-emoji">
            {plantStages[Math.min(todayData?.plantStage || 0, plantStages.length - 1)]?.emoji}
          </div>
          <div className="plant-stage">
            当前阶段：{plantStages[Math.min(todayData?.plantStage || 0, plantStages.length - 1)]?.name}
          </div>
          
          {todayData?.tip && (
            <div className="plant-tip">
              💡 {todayData.tip}
            </div>
          )}
        </div>

        <button 
          className="btn" 
          onClick={handleCheckIn}
          disabled={todayData?.completed === 1}
          style={{
            opacity: todayData?.completed === 1 ? 0.6 : 1,
            cursor: todayData?.completed === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          {todayData?.completed === 1 ? '✅ 今日已打卡' : '🌱 立即打卡'}
        </button>
      </div>

      <div className="card">
        <h2>打卡记录</h2>
        
        {wellness.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
            还没有打卡记录，今天开始吧~
          </p>
        ) : (
          <ul className="mood-list">
            {wellness.map((record) => (
              <li key={record.id} className="mood-item">
                <div className="mood-emoji">
                  {plantStages[Math.min(record.plantStage, plantStages.length - 1)]?.emoji}
                </div>
                <div className="mood-content">
                  <div className="mood-date">{formatDate(record.date)}</div>
                  <div className="mood-note">
                    {record.completed === 1 ? '✅ 已完成打卡' : '⏳ 未打卡'}
                  </div>
                  {record.tip && (
                    <div className="mood-reply">
                      💡 {record.tip}
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

export default WellnessPage;
