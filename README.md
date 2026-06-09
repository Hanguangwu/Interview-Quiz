# 面试答题系统 (Interview Quiz System)

类 Anki 卡牌面试答题系统 — 正面展示问题，背面展示参考答案。

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **包管理器**: pnpm
- **路由**: vue-router
- **存储**: 本地 JSON 文件

## 功能特性

- 🃏 **Anki 风格卡牌**: 点击翻转，正面问题 + 背面参考答案
- 📂 **按类别浏览**: 每个问题类别独立页面展示
- 🔍 **增删改查**: 完整的数据管理功能
- 🤖 **AI 面试助手**: 集成 Chatbot，可带入当前问题上下文
- ⚙️ **统一配置**: 系统参数集中管理
- 🌓 **深色模式**: 支持亮色/暗色主题

## 项目结构

```
public/
├── data/                # 本地 JSON 数据存储
│   └── questions.json   # 问题数据（初始种子数据）
└── ...
src/
├── components/
│   ├── layout/          # 布局组件（AppHeader, AppSidebar）
│   ├── question/        # 卡牌组件（QuestionCard, QuestionForm, QuestionList）
│   └── chatbot/         # Chatbot 组件
├── composables/         # 组合式 API（useQuestions, useChatbot, useConfig）
├── config/              # 统一系统配置
├── router/              # Vue Router 路由配置
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数（storage, id）
├── views/               # 页面视图（Home, Category, Admin）
├── App.vue
├── main.ts
└── style.css
```

## 路由

> 项目部署在 GitHub Pages 子路径 `/Interview-Quiz/` 下，所有路由相对于该基础路径。
> 开发环境 (`pnpm dev`) 自动处理基础路径，无需额外配置。

| 路径 | 说明 |
|------|------|
| `/` | 所有类别概览 |
| `/category/:name` | 指定类别卡牌浏览 |
| `/category/:name/flashcard` | 全屏卡牌模式 |
| `/admin` | 管理后台（CRUD） |
| `/admin/category/:name` | 按类别筛选管理 |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 设计文档

详见 [AGENTS.md](./AGENTS.md)。
