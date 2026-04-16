import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import initSqlJs from 'sql.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库路径
const dbPath = path.join(__dirname, 'data', 'mood.db');

// 初始化数据库
let db;

async function initDB() {
  const SQL = await initSqlJs();
  
  // 如果数据库文件存在，加载它
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  
  // 创建数据表
  db.run(`
    CREATE TABLE IF NOT EXISTS moods (
      id TEXT PRIMARY KEY,
      emoji TEXT NOT NULL,
      label TEXT,
      note TEXT,
      createdAt TEXT NOT NULL,
      reply TEXT,
      repliedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS wellness (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      completed INTEGER DEFAULT 0,
      plantStage INTEGER DEFAULT 0,
      tip TEXT
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      createdAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL
    );
  `);
  
  // 初始化今日打卡数据
  const today = new Date().toISOString().split('T')[0];
  const existingToday = db.exec(`SELECT * FROM wellness WHERE date = '${today}'`);
  if (existingToday.length === 0) {
    db.run(`INSERT INTO wellness (id, date, completed, plantStage) VALUES ('${uuidv4()}', '${today}', 0, 0)`);
  }
  
  saveDB();
  console.log('✅ 数据库初始化完成');
}

// 保存数据库
function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// 自动保存（每 30 秒）
setInterval(saveDB, 30000);

// ============ API 路由 ============

// 获取所有心情记录
app.get('/api/moods', (req, res) => {
  const result = db.exec('SELECT * FROM moods ORDER BY createdAt DESC');
  if (result.length === 0) {
    return res.json([]);
  }
  
  const columns = result[0].columns;
  const values = result[0].values;
  const moods = values.map(row => {
    const mood = {};
    columns.forEach((col, i) => {
      mood[col] = row[i];
    });
    return mood;
  });
  
  res.json(moods);
});

// 添加心情记录
app.post('/api/moods', (req, res) => {
  const { emoji, label, note } = req.body;
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  db.run(
    'INSERT INTO moods (id, emoji, label, note, createdAt) VALUES (?, ?, ?, ?, ?)',
    [id, emoji, label || '', note || '', createdAt]
  );
  saveDB();
  
  res.json({ success: true, id });
});

// 回复心情（管理后台）
app.post('/api/moods/:id/reply', (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  const repliedAt = new Date().toISOString();
  
  db.run(
    'UPDATE moods SET reply = ?, repliedAt = ? WHERE id = ?',
    [reply, repliedAt, id]
  );
  saveDB();
  
  res.json({ success: true });
});

// 获取养生打卡状态
app.get('/api/wellness', (req, res) => {
  const result = db.exec('SELECT * FROM wellness ORDER BY date DESC');
  if (result.length === 0) {
    return res.json([]);
  }
  
  const columns = result[0].columns;
  const values = result[0].values;
  const wellness = values.map(row => {
    const record = {};
    columns.forEach((col, i) => {
      record[col] = row[i];
    });
    return record;
  });
  
  res.json(wellness);
});

// 今日打卡
app.post('/api/wellness/checkin', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const existing = db.exec(`SELECT * FROM wellness WHERE date = '${today}'`);
  
  if (existing.length > 0 && existing[0].values[0][3] === 1) {
    return res.json({ success: false, message: '今日已打卡' });
  }
  
  // 养生小贴士
  const tips = [
    '🍵 多喝温水，保持身体水分',
    '🚶 散步 30 分钟，促进血液循环',
    '😴 早睡早起，保证 7-8 小时睡眠',
    '🥗 多吃蔬菜水果，补充维生素',
    '🧘 深呼吸，放松心情',
    '☀️ 晒太阳 15 分钟，补充维生素 D',
    '💪 做做伸展运动，缓解疲劳',
    '📚 读一本书，充实心灵'
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  
  // 植物成长阶段：0=种子，1=发芽，2=成长，3=开花，4=大树
  let newStage = 1;
  if (existing.length > 0) {
    const currentStage = existing[0].values[0][4];
    newStage = Math.min(currentStage + 1, 4);
    db.run(
      'UPDATE wellness SET completed = 1, plantStage = ?, tip = ? WHERE date = ?',
      [newStage, tip, today]
    );
  } else {
    db.run(
      'INSERT INTO wellness (id, date, completed, plantStage, tip) VALUES (?, ?, 1, ?, ?)',
      [uuidv4(), today, newStage, tip]
    );
  }
  
  saveDB();
  
  res.json({ 
    success: true, 
    plantStage: newStage,
    tip 
  });
});

// 获取记账记录
app.get('/api/expenses', (req, res) => {
  const result = db.exec('SELECT * FROM expenses ORDER BY createdAt DESC');
  if (result.length === 0) {
    return res.json([]);
  }
  
  const columns = result[0].columns;
  const values = result[0].values;
  const expenses = values.map(row => {
    const exp = {};
    columns.forEach((col, i) => {
      exp[col] = row[i];
    });
    return exp;
  });
  
  res.json(expenses);
});

// 添加记账记录
app.post('/api/expenses', (req, res) => {
  const { type, category, amount, note } = req.body;
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  db.run(
    'INSERT INTO expenses (id, type, category, amount, note, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, type, category, amount, note || '', createdAt]
  );
  saveDB();
  
  res.json({ success: true, id });
});

// 获取统计数据
app.get('/api/expenses/stats', (req, res) => {
  const { month } = req.query;
  const currentMonth = month || new Date().toISOString().slice(0, 7);
  const startDate = `${currentMonth}-01`;
  const endDate = `${currentMonth}-31`;
  
  const result = db.exec(`
    SELECT * FROM expenses 
    WHERE createdAt >= '${startDate}' AND createdAt <= '${endDate}'
  `);
  
  const expenses = [];
  if (result.length > 0) {
    const columns = result[0].columns;
    const values = result[0].values;
    values.forEach(row => {
      const exp = {};
      columns.forEach((col, i) => {
        exp[col] = row[i];
      });
      expenses.push(exp);
    });
  }
  
  // 按分类统计
  const byCategory = {};
  let totalIncome = 0;
  let totalExpense = 0;
  
  expenses.forEach(exp => {
    if (!byCategory[exp.category]) {
      byCategory[exp.category] = 0;
    }
    byCategory[exp.category] += exp.amount;
    
    if (exp.type === 'income') {
      totalIncome += exp.amount;
    } else {
      totalExpense += exp.amount;
    }
  });
  
  res.json({
    expenses,
    byCategory,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense
  });
});

// 管理后台登录验证
app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  
  if (passcode === process.env.ADMIN_PASSCODE) {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    db.run(
      'INSERT INTO admin_sessions (id, createdAt, expiresAt) VALUES (?, ?, ?)',
      [id, createdAt, expiresAt]
    );
    saveDB();
    
    res.json({ success: true, sessionId: id });
  } else {
    res.status(401).json({ success: false, message: '口令错误' });
  }
});

// 获取管理后台数据
app.get('/api/admin/dashboard', (req, res) => {
  const moodsResult = db.exec('SELECT * FROM moods ORDER BY createdAt DESC LIMIT 50');
  const wellnessResult = db.exec('SELECT * FROM wellness ORDER BY date DESC LIMIT 30');
  const expensesResult = db.exec('SELECT * FROM expenses ORDER BY createdAt DESC LIMIT 50');
  
  const parseResult = (result) => {
    if (result.length === 0) return [];
    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  };
  
  res.json({ 
    moods: parseResult(moodsResult),
    wellness: parseResult(wellnessResult),
    expenses: parseResult(expensesResult)
  });
});

// 静态文件服务（生产环境）
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 启动服务器
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 MoodAlbum 服务器运行在 http://localhost:${PORT}`);
    console.log(`📱 管理后台口令：${process.env.ADMIN_PASSCODE}`);
  });
});
