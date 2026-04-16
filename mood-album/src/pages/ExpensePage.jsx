import React, { useState, useEffect } from 'react';

const expenseCategories = ['🍜 餐饮', '🛒 购物', '🚗 出行', '🏠 住房', '💊 医疗', '🎮 娱乐', '📚 学习', '💰 其他'];
const incomeCategories = ['💵 工资', '🎁 奖金', '📈 理财', '🎊 其他'];

function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('🍜 餐饮');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error('获取记账记录失败:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/expenses/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      showToast('请输入有效金额');
      return;
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          category,
          amount: parseFloat(amount),
          note
        })
      });

      if (res.ok) {
        showToast('记录成功！💰');
        setAmount('');
        setNote('');
        fetchExpenses();
        fetchStats();
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
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="expense-page">
      {toast && <div className="toast">{toast}</div>}

      {stats && (
        <div className="card">
          <h2>📊 本月统计</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">收入</div>
              <div className="stat-value income">¥{stats.totalIncome.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">支出</div>
              <div className="stat-value expense">¥{stats.totalExpense.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">结余</div>
              <div className={`stat-value ${stats.balance >= 0 ? 'income' : 'expense'}`}>
                ¥{stats.balance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>💰 记一笔</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="expense-type-selector">
            <button
              type="button"
              className={`type-btn ${type === 'income' ? 'active income' : ''}`}
              onClick={() => {
                setType('income');
                setCategory('💵 工资');
              }}
            >
              💵 收入
            </button>
            <button
              type="button"
              className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
              onClick={() => {
                setType('expense');
                setCategory('🍜 餐饮');
              }}
            >
              💸 支出
            </button>
          </div>

          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="number"
            className="input"
            placeholder="金额"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />

          <input
            type="text"
            className="input"
            placeholder="备注（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button type="submit" className="btn">
            确认记录
          </button>
        </form>
      </div>

      <div className="card">
        <h2>记账明细</h2>
        
        {expenses.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
            还没有记账记录，开始记录第一笔吧~
          </p>
        ) : (
          <ul className="mood-list">
            {expenses.map((exp) => (
              <li key={exp.id} className="mood-item">
                <div className="mood-emoji" style={{ fontSize: '24px' }}>
                  {exp.type === 'income' ? '💵' : '💸'}
                </div>
                <div className="mood-content">
                  <div className="mood-date">{formatDate(exp.createdAt)}</div>
                  <div className="mood-note">
                    {exp.category} {exp.note && `· ${exp.note}`}
                  </div>
                </div>
                <div className={`stat-value ${exp.type === 'income' ? 'income' : 'expense'}`} style={{ fontSize: '16px' }}>
                  {exp.type === 'income' ? '+' : '-'}¥{exp.amount.toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ExpensePage;
