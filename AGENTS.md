# 面试答题系统 (Interview Quiz System) 设计方案

## 概述

类 Anki 卡牌面试答题系统，正面展示问题，背面展示参考答案。前端采用 Vue 3 + TypeScript + pnpm，集成 Chatbot 功能，统一配置系统参数。数据存储在本地 JSON 文件中。

---

## 一、数据模型

### Question 数据结构

```typescript
// src/types/index.ts

interface Question {
  id: string                    // UUID，唯一标识
  category: string              // 问题类别（如 "JavaScript"、"Vue"、"CSS" 等）
  question: string              // 问题内容（卡牌正面）
  answer: string                // 参考答案（卡牌背面）
  createdAt: string             // 创建时间 ISO 字符串
  updatedAt: string             // 更新时间 ISO 字符串
}
```

### 存储文件

```json
// src/data/questions.json
[
  {
    "id": "a1b2c3d4-...",
    "category": "JavaScript",
    "question": "解释 JavaScript 中的闭包是什么？",
    "answer": "闭包是指一个函数可以访问其外部函数作用域中的变量...",
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z"
  }
]
```

---

## 二、系统架构

### 分层架构

```
┌─────────────────────────────────────────────────┐
│                   UI 层 (Vue Components)          │
│  QuestionCard │ QuestionForm │ ChatBot │ Nav    │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                组合式 API (Composables)            │
│  useQuestions() │ useChatbot() │ useConfig()     │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                工具层 (Utils)                     │
│  storage.ts (JSON 读写) │ id.ts (UUID)           │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                数据层 (Data)                      │
│  src/data/questions.json (本地持久化)             │
└─────────────────────────────────────────────────┘
```

### 项目目录结构

```
quiz_interview/
├── src/
│   ├── assets/                    # 静态资源
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue      # 顶部导航栏
│   │   │   └── AppSidebar.vue     # 侧边栏（类别切换 + Chatbot 入口）
│   │   ├── question/
│   │   │   ├── QuestionCard.vue   # 翻转卡牌组件（正面问题/背面答案）
│   │   │   ├── QuestionForm.vue   # 新增/编辑表单弹窗
│   │   │   ├── QuestionList.vue   # 数据表格视图（管理用）
│   │   │   └── CategoryNav.vue    # 类别导航组件
│   │   └── chatbot/
│   │       └── ChatBot.vue        # Chatbot 侧边面板
│   ├── composables/
│   │   ├── useQuestions.ts        # 问题数据状态管理 + CRUD
│   │   ├── useChatbot.ts          # Chatbot API 交互逻辑
│   │   └── useConfig.ts           # 系统配置读取/更新
│   ├── config/
│   │   └── index.ts               # 统一系统配置（默认值）
│   ├── data/
│   │   └── questions.json         # 本地数据存储文件
│   ├── router/
│   │   └── index.ts               # Vue Router 路由配置
│   ├── types/
│   │   └── index.ts               # TypeScript 类型定义
│   ├── utils/
│   │   ├── storage.ts             # JSON 文件读取/写入工具
│   │   └── id.ts                  # UUID 生成器
│   ├── views/
│   │   ├── HomeView.vue           # 首页：所有类别概览
│   │   ├── CategoryView.vue       # 单类别页面：卡牌模式
│   │   └── AdminView.vue          # 管理页面：表格 CRUD
│   ├── App.vue                    # 根组件（布局容器）
│   ├── main.ts                    # 入口文件
│   └── style.css                  # 全局样式
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── AGENTS.md                      # 本设计文档
└── README.md
```

---

## 三、路由设计

| 路径 | 视图组件 | 功能说明 |
|------|---------|---------|
| `/` | HomeView | 所有类别概览页，显示每个类别的卡牌数量，点击进入对应类别 |
| `/category/:name` | CategoryView | 指定类别的卡牌浏览，支持翻转查看答案、随机抽题 |
| `/category/:name/flashcard` | CategoryView (flashcard 模式) | 全屏卡牌模式，单张卡牌正反面切换 |
| `/admin` | AdminView | 管理后台，表格展示所有数据，支持增删改查 |
| `/admin/category/:name` | AdminView (筛选) | 按类别筛选的管理视图 |

---

## 四、组件设计

### 4.1 QuestionCard.vue（核心组件）

```
┌─────────────────────┐
│                     │
│       问题标题       │  ← 正面（question）
│                     │
│   "什么是闭包？"     │
│                     │
│   ──── 点击翻转 ──── │
│                     │
│       参考答案       │  ← 背面（answer）
│                     │
│   "闭包是指..."      │
│                     │
│  [编辑] [删除]      │
└─────────────────────┘
```

- Props: `question: Question`, `flipped: boolean`
- Emits: `flip`, `edit`, `delete`
- 支持 CSS 3D 翻转动画
- 点击卡牌正面/背面切换显示

### 4.2 QuestionForm.vue（表单弹窗）

- Props: `modelValue: boolean`（弹窗开关）, `question: Question | null`（编辑模式）
- Emits: `submit`, `close`
- 字段：类别（下拉选择或输入）、问题（文本域）、答案（富文本/文本域）
- 支持新增和编辑两种模式

### 4.3 QuestionList.vue（管理表格）

- 表格列：序号、类别、问题（截断）、答案（截断）、创建时间、操作
- 操作：编辑、删除
- 支持按类别筛选、按问题搜索
- 分页功能

### 4.4 ChatBot.vue

```
┌─────────────────────┐
│  AI 面试助手  [×]   │  ← 头部
├─────────────────────┤
│                     │
│  用户: 什么是闭包？  │
│  助手: 闭包是...    │  ← 对话记录
│                     │
│                     │
├─────────────────────┤
│ [输入框......] [发送]│  ← 输入区
└─────────────────────┘
```

- 可拖拽/可切换的侧边面板
- 可配置 API（OpenAI 兼容接口）
- 自动带入当前卡牌问题作为上下文
- Markdown 渲染响应内容
- 对话历史保存在 sessionStorage

### 4.5 CategoryNav.vue

- 从所有问题中提取唯一类别列表
- 显示每个类别的卡牌数量
- 当前选中类别高亮
- 支持新增类别

---

## 五、组合式 API 设计

### 5.1 useQuestions.ts

```typescript
// 核心状态管理
function useQuestions() {
  // 状态
  const questions: Ref<Question[]>
  const categories: ComputedRef<string[]>
  const loading: Ref<boolean>

  // CRUD 操作
  async function fetchQuestions(): Promise<void>        // 从 JSON 读取数据
  async function addQuestion(data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>
  async function updateQuestion(id: string, data: Partial<Question>): Promise<void>
  async function deleteQuestion(id: string): Promise<void>

  // 查询
  function getQuestionsByCategory(category: string): Question[]
  function getQuestionById(id: string): Question | undefined
  function getRandomQuestion(category?: string): Question | undefined

  // 返回
  return {
    questions, categories, loading,
    fetchQuestions, addQuestion, updateQuestion, deleteQuestion,
    getQuestionsByCategory, getQuestionById, getRandomQuestion
  }
}
```

### 5.2 useChatbot.ts

```typescript
function useChatbot() {
  const messages: Ref<ChatMessage[]>
  const isOpen: Ref<boolean>
  const isLoading: Ref<boolean>

  async function sendMessage(content: string): Promise<void>
  function setContext(question: Question): void        // 设置当前问题上下文
  function toggle(): void
  function clearHistory(): void

  return { messages, isOpen, isLoading, sendMessage, setContext, toggle, clearHistory }
}
```

### 5.3 useConfig.ts

```typescript
function useConfig() {
  const config: Ref<AppConfig>

  function updateConfig(partial: Partial<AppConfig>): void
  function resetConfig(): void

  return { config, updateConfig, resetConfig }
}
```

---

## 六、统一系统参数配置

```typescript
// src/config/index.ts
interface AppConfig {
  // 应用基本信息
  app: {
    title: string               // 应用标题
    lang: 'zh-CN' | 'en'       // 语言
  }

  // Chatbot 配置
  chatbot: {
    enabled: boolean            // 是否启用 Chatbot
    apiEndpoint: string         // API 地址（OpenAI 兼容）
    apiKey: string              // API 密钥
    model: string               // 模型名称
    systemPrompt: string        // 系统提示词
    temperature: number         // 温度参数
  }

  // 卡牌 UI 配置
  ui: {
    theme: 'light' | 'dark' | 'auto'
    cardFlipAnimation: 'flip' | 'fade' | 'slide'
    cardsPerPage: number
    showAnswerOnClick: boolean  // 点击翻转还是悬停
  }

  // 存储配置
  storage: {
    filePath: string            // 数据文件路径
    autoSave: boolean           // 是否自动保存
    backupEnabled: boolean      // 是否启用备份
  }
}
```

配置参数将存储在 `localStorage` 中持久化，提供可视化配置页面。

---

## 七、数据流

```
用户操作 (点击翻转/编辑/删除)
       │
       ▼
Vue 组件 emit / event
       │
       ▼
Composable (useQuestions) — 更新响应式状态
       │
       ▼
storage.ts — 异步读写 questions.json
       │
       ▼
文件系统 (磁盘持久化)
       │
       ▼
下次加载时 → fetchQuestions() → 恢复到内存
```

### 文件读写策略

- **初始化**: `fetchQuestions()` 在 App.vue 的 `onMounted` 中调用
- **写入时机**: 每次 `add/update/delete` 操作后立即写入
- **写入方式**: 全量覆写（数据量较小，适合本地场景）
- **错误处理**: 读写失败时显示 Toast 提示，不影响 UI 操作
- **防丢失**: 操作内存状态始终优先，文件写入失败不阻断用户操作

---

## 八、路由与导航流程

```
首页 ──────────────────────────────────────────────
│                                                    │
├─ 类别卡片: JavaScript (12题)                        │
├─ 类别卡片: Vue (8题)                               │
├─ 类别卡片: CSS (5题)                               │
├─ 类别卡片: 计算机网络 (10题)                        │
└─ [管理后台]                                        │
                                                    │
点击类别卡片 ──→ 进入该类别的卡牌列表                  │
                 ├─ 卡牌翻转模式                       │
                 ├─ 随机抽题                           │
                 └─ 新增问题到此类别                    │
                                                    │
管理后台 ──→ 表格视图                                 │
           ├─ 按类别筛选                              │
           ├─ 搜索问题                                │
           ├─ 新增问题                                │
           ├─ 编辑问题                                │
           └─ 删除问题                                │
```

---

## 九、技术选型

| 技术 | 用途 | 版本 |
|------|------|------|
| Vue 3 | 前端框架 | ^3.5 |
| TypeScript | 类型安全 | ~6.0 |
| Vite | 构建工具 | ^8.0 |
| pnpm | 包管理器 | latest |
| vue-router | 前端路由 | ^4.x |
| nanoid | UUID 生成 | ^5.x |

**不需要的依赖**（保持轻量）:
- ❌ Pinia（Composable + provide/inject 足以管理状态）
- ❌ UI 组件库（使用自定义 CSS，保持可控性）
- ❌ Axios（Chatbot 直接使用 fetch）

---

## 十、实施计划

### 阶段一：基础架构 (Branch: step1-base)
1. 初始化 pnpm，安装 vue-router、nanoid
2. 创建目录结构（types、utils、config、router、data）
3. 实现 storage.ts（JSON 文件读写）
4. 实现 id.ts（UUID 生成）
5. 实现 types/index.ts（类型定义）
6. 创建 questions.json 示例数据
7. 实现 config/index.ts（统一配置）
8. 配置 vue-router（路由表）
9. 实现 layout 组件（AppHeader、AppSidebar）
10. 样式系统搭建

### 阶段二：核心功能 (Branch: step2-core)
1. 实现 useQuestions composable
2. 实现 QuestionCard.vue（翻转动画）
3. 实现 HomeView.vue（类别概览）
4. 实现 CategoryView.vue（卡牌浏览）
5. 实现 QuestionForm.vue（新增/编辑表单）
6. 实现 AdminView.vue（管理后台表格）
7. 实现 QuestionList.vue（数据表格）
8. 实现 CategoryNav.vue（类别导航）
9. CRUD 操作完整流程

### 阶段三：Chatbot + 配置 (Branch: step3-chatbot)
1. 实现 useChatbot composable
2. 实现 ChatBot.vue（对话面板）
3. 实现 useConfig composable
4. 实现配置管理页面
5. Chatbot 与当前题目的上下文联动

---

## 十一、关键设计决策

1. **JSON 文件作为数据库**: 适合单用户本地场景，零依赖、易迁移、可手动编辑
2. **Composable 替代 Pinia**: 数据量小、结构简单，Composable + provide/inject 足够
3. **全量覆写而非增量写入**: 数据量小（通常 < 1000 条），实现简单可靠
4. **CSS 3D 翻转而非 JS 动画**: 性能更好、更流畅，纯 CSS 实现
5. **Chatbot 使用 OpenAI 兼容 API**: 通用性强，可接入任何兼容 API（DeepSeek、通义千问等）
6. **没有 UI 组件库**: 保持最终 bundle 体积最小化，样式完全可控
