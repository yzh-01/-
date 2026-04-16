# MoodAlbum 🌿 情感链接

一个温暖的小工具，让家人之间的关心变得更简单。

## 功能特色

### ❤️ 心情记录
- 选择表情记录每天的心情
- 添加心情笔记
- 家人可以回复你的心情

### 🌱 养生打卡
- 每日打卡养成小植物
- 从种子 🫘 到大树 🌳 的成长过程
- 每日养生小贴士

### 📒 记账本
- 简单好用的记账功能
- 支持收入和支出
- 自动分类统计
- 本月收支一览

### 🔔 管理后台
- 口令验证登录
- 查看家人心情动态
- 回复关心消息

## 快速开始

### 安装依赖
```bash
cd mood-album
npm install
```

### 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，设置管理口令
```

### 启动开发模式
```bash
# 方式 1: 同时启动前后端（需要确保 8787 端口未被占用）
npm run dev

# 方式 2: 分别启动
npm run server    # 后端 (端口 8787)
npm run build     # 构建前端
npm start         # 生产模式
```

### 访问应用
- 前端：http://localhost:5173
- 后端 API：http://localhost:8787
- 管理后台口令：`123456`（可在 .env 中修改）

## 项目结构

```
mood-album/
├── src/              # React 前端源码
│   ├── App.jsx       # 主应用组件
│   ├── App.css       # 全局样式
│   ├── main.jsx      # 入口文件
│   └── pages/        # 页面组件
│       ├── MoodPage.jsx      # 心情记录
│       ├── WellnessPage.jsx  # 养生打卡
│       ├── ExpensePage.jsx   # 记账本
│       └── AdminPage.jsx     # 管理后台
├── server/           # Express 后端
│   ├── index.js      # 服务器入口
│   └── data/         # SQLite 数据库
├── public/           # 静态资源
├── .env              # 环境变量
├── .env.example      # 环境变量模板
├── package.json
├── vite.config.js
└── README.md
```

## 技术栈

- **前端**: React 18 + Vite 6
- **后端**: Express 4
- **数据库**: sql.js (SQLite JavaScript 实现)
- **样式**: 手写 CSS，毛玻璃风格

## API 接口

### 心情
- `GET /api/moods` - 获取所有心情记录
- `POST /api/moods` - 添加心情记录
- `POST /api/moods/:id/reply` - 回复心情

### 养生打卡
- `GET /api/wellness` - 获取打卡记录
- `POST /api/wellness/checkin` - 今日打卡

### 记账
- `GET /api/expenses` - 获取记账记录
- `POST /api/expenses` - 添加记账记录
- `GET /api/expenses/stats` - 获取统计数据

### 管理后台
- `POST /api/admin/login` - 登录验证
- `GET /api/admin/dashboard` - 获取管理面板数据

## 打包为 Android APK

### 方式 1: 使用构建脚本（推荐）

```bash
# 赋予执行权限
chmod +x build-apk.sh

# 运行构建脚本（需要 JDK 17 和 Android SDK）
./build-apk.sh
```

### 方式 2: 手动构建

详见 [BUILD_APK.md](BUILD_APK.md) 完整指南。

### 方式 3: PWA（无需 APK）

1. 部署到服务器
2. 手机浏览器打开
3. "添加到主屏幕"

## 许可证

MIT License
