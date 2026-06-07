<script setup lang="ts">
import type { Question } from '../../types'

defineProps<{
  questions: Question[]
  currentCategory?: string
}>()

const emit = defineEmits<{
  select: [category: string]
}>()
</script>

<template>
  <nav class="category-nav">
    <button
      class="nav-chip"
      :class="{ active: !currentCategory }"
      @click="emit('select', '')"
    >
      全部
      <span class="chip-count">{{ questions.length }}</span>
    </button>
    <button
      v-for="cat in [...new Set(questions.map((q) => q.category))]"
      :key="cat"
      class="nav-chip"
      :class="{ active: currentCategory === cat }"
      @click="emit('select', cat)"
    >
      {{ cat }}
      <span class="chip-count">{{ questions.filter((q) => q.category === cat).length }}</span>
    </button>
  </nav>
</template>

<style scoped>
.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
}

.nav-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.nav-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.nav-chip.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.chip-count {
  font-size: 12px;
  background: var(--code-bg);
  padding: 0 6px;
  border-radius: 8px;
  color: var(--text);
  min-width: 18px;
  text-align: center;
}

.nav-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}
</style>
