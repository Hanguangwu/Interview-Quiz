<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestions } from '../composables/useQuestions'

const router = useRouter()
const { questions, categories, loading } = useQuestions()

const categoryCards = computed(() => {
  return categories.value.map((cat) => {
    const catQuestions = questions.value.filter((q) => q.category === cat)
    return {
      name: cat,
      count: catQuestions.length,
      preview: catQuestions[0]?.question.slice(0, 60) + (catQuestions[0]?.question.length > 60 ? '...' : ''),
    }
  })
})

function goToCategory(category: string) {
  router.push(`/category/${encodeURIComponent(category)}`)
}

function goToAdmin() {
  router.push('/admin')
}
</script>

<template>
  <div class="home">
    <div class="home-header">
      <h2 class="home-title">面试答题系统</h2>
      <p class="home-subtitle">选择类别开始练习，或前往管理后台维护题目</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner" />
      <span>加载中...</span>
    </div>

    <div v-else-if="categories.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <h3>还没有题目</h3>
      <p>去管理后台添加你的第一道面试题吧</p>
      <button class="btn btn-primary" @click="goToAdmin">前往管理后台</button>
    </div>

    <div v-else class="category-grid">
      <div
        v-for="card in categoryCards"
        :key="card.name"
        class="category-card"
        @click="goToCategory(card.name)"
      >
        <div class="card-top">
          <span class="card-category">{{ card.name }}</span>
          <span class="card-count">{{ card.count }} 题</span>
        </div>
        <div v-if="card.preview" class="card-preview">
          {{ card.preview }}
        </div>
        <div class="card-action">
          <span class="card-link">开始练习 &rarr;</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
}

.home-header {
  text-align: center;
  margin-bottom: 40px;
}

.home-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-h);
  margin: 0 0 8px;
}

.home-subtitle {
  color: var(--text);
  font-size: 15px;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 0;
  color: var(--text);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 64px 16px;
  color: var(--text);
}

.empty-icon {
  margin-bottom: 16px;
  color: var(--text);
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 20px;
  color: var(--text-h);
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0 0 20px;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}

.btn-primary {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-primary:hover {
  opacity: 0.9;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.category-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-card:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-category {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-h);
}

.card-count {
  font-size: 13px;
  color: var(--text);
  background: var(--code-bg);
  padding: 2px 10px;
  border-radius: 10px;
}

.card-preview {
  font-size: 14px;
  color: var(--text);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-action {
  margin-top: auto;
}

.card-link {
  font-size: 14px;
  color: var(--accent);
  font-weight: 500;
}
</style>
