import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import MoodPage from './pages/MoodPage';
import WellnessPage from './pages/WellnessPage';
import ExpensePage from './pages/ExpensePage';
import AdminPage from './pages/AdminPage';

function App() {
  const location = useLocation();

  return (
    <div className="app">
      <header className="header">
        <h1>🌿 MoodAlbum</h1>
        <p className="subtitle">情感链接 · 让关心更简单</p>
      </header>

      <nav className="nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          <span className="icon">❤️</span>
          <span>心情</span>
        </Link>
        <Link to="/wellness" className={location.pathname === '/wellness' ? 'active' : ''}>
          <span className="icon">🌱</span>
          <span>打卡</span>
        </Link>
        <Link to="/expense" className={location.pathname === '/expense' ? 'active' : ''}>
          <span className="icon">📒</span>
          <span>记账</span>
        </Link>
        <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
          <span className="icon">🔔</span>
          <span>后台</span>
        </Link>
      </nav>

      <main className="main">
        <Routes>
          <Route path="/" element={<MoodPage />} />
          <Route path="/wellness" element={<WellnessPage />} />
          <Route path="/expense" element={<ExpensePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>🌿 用心记录每一天</p>
      </footer>
    </div>
  );
}

export default App;
