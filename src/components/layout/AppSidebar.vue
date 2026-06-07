<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestions } from '../../composables/useQuestions'

const route = useRoute()
const router = useRouter()
const { questions, categories } = useQuestions()

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const cat of categories.value) {
    counts[cat] = questions.value.filter((q) => q.category === cat).length
  }
  return counts
})

const currentCategory = computed(() => {
  return route.params.name as string | undefined
})

function navigateToCategory(category: string) {
  router.push(`/category/${encodeURIComponent(category)}`)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <h3 class="sidebar-title">问题类别</h3>
      <div class="category-list">
        <button
          v-for="cat in categories"
          :key="cat"
          class="category-item"
          :class="{ active: currentCategory === cat }"
          @click="navigateToCategory(cat)"
        >
          <span class="category-name">{{ cat }}</span>
          <span class="category-count">{{ categoryCounts[cat] }}</span>
        </button>
      </div>
      <div v-if="categories.length === 0" class="empty-hint">
        暂无数据，请先在管理后台添加问题
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: 20px 0;
}

.sidebar-section {
  padding: 0 16px;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
  margin: 0 0 12px 8px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text);
  font-size: 14px;
  transition: all 0.15s;
  width: 100%;
  text-align: left;
}

.category-item:hover {
  background: var(--accent-bg);
  color: var(--text-h);
}

.category-item.active {
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 600;
}

.category-count {
  font-size: 12px;
  background: var(--code-bg);
  padding: 2px 8px;
  border-radius: 10px;
  color: var(--text);
}

.category-item.active .category-count {
  background: var(--accent-bg);
  color: var(--accent);
}

.empty-hint {
  font-size: 13px;
  color: var(--text);
  padding: 16px 8px;
  text-align: center;
}
</style>
