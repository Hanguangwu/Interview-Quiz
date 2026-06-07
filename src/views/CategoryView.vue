<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestions } from '../composables/useQuestions'
import { useChatbot } from '../composables/useChatbot'
import QuestionCard from '../components/question/QuestionCard.vue'
import QuestionForm from '../components/question/QuestionForm.vue'
import type { Question } from '../types'

const props = defineProps<{
  flashcardMode?: boolean
}>()

const route = useRoute()
const router = useRouter()
const { questions, getRandomQuestion, deleteQuestion } = useQuestions()
const { setContext, open: openChatbot } = useChatbot()

const categoryName = computed(() => route.params.name as string)
const categoryQuestions = computed(() =>
  questions.value.filter((q) => q.category === categoryName.value)
)

const currentIndex = ref(0)
const flipped = ref(false)
const showForm = ref(false)
const editingQuestion = ref<Question | null>(null)

const currentQuestion = computed(() => {
  if (categoryQuestions.value.length === 0) return undefined
  return categoryQuestions.value[currentIndex.value]
})

function flip() {
  flipped.value = !flipped.value
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    flipped.value = false
  }
}

function next() {
  if (currentIndex.value < categoryQuestions.value.length - 1) {
    currentIndex.value++
    flipped.value = false
  }
}

function random() {
  const q = getRandomQuestion(categoryName.value)
  if (q) {
    const idx = categoryQuestions.value.findIndex((item) => item.id === q.id)
    if (idx !== -1) {
      currentIndex.value = idx
      flipped.value = false
    }
  }
}

function editQuestion(q: Question) {
  editingQuestion.value = q
  showForm.value = true
}

function startAdd() {
  editingQuestion.value = null
  showForm.value = true
}

async function handleDelete(id: string) {
  if (confirm('确定要删除这道题吗？')) {
    await deleteQuestion(id)
    if (currentIndex.value >= categoryQuestions.value.length) {
      currentIndex.value = Math.max(0, categoryQuestions.value.length - 1)
    }
  }
}

function askChatbot() {
  if (currentQuestion.value) {
    setContext(currentQuestion.value)
    openChatbot()
  }
}

function goBack() {
  router.push('/')
}

watch(
  () => route.params.name,
  () => {
    currentIndex.value = 0
    flipped.value = false
  }
)
</script>

<template>
  <div class="category-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        返回
      </button>
      <h2 class="page-title">{{ categoryName }}</h2>
      <span class="page-count">{{ categoryQuestions.length }} 题</span>
    </div>

    <div v-if="categoryQuestions.length === 0" class="empty-state">
      <p>该类别暂无题目</p>
      <button class="btn btn-primary" @click="startAdd">新增题目</button>
    </div>

    <template v-else>
      <div v-if="currentQuestion" class="card-section">
        <QuestionCard
          :question="currentQuestion"
          :flipped="flipped"
          @flip="flip"
          @edit="editQuestion"
          @delete="handleDelete"
        />
      </div>

      <div class="card-controls">
        <div class="nav-controls">
          <button class="btn" :disabled="currentIndex <= 0" @click="prev">上一题</button>
          <span class="position-indicator">{{ currentIndex + 1 }} / {{ categoryQuestions.length }}</span>
          <button class="btn" :disabled="currentIndex >= categoryQuestions.length - 1" @click="next">下一题</button>
        </div>
        <div class="action-controls">
          <button class="btn btn-outline" @click="random">随机一题</button>
          <button class="btn btn-outline" @click="startAdd">新增</button>
          <button class="btn btn-accent" @click="askChatbot">AI 提问</button>
        </div>
      </div>
    </template>

    <QuestionForm
      v-model="showForm"
      :question="editingQuestion"
      @submit="showForm = false"
    />
  </div>
</template>

<style scoped>
.category-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.15s;
}

.back-btn:hover {
  background: var(--code-bg);
  color: var(--text-h);
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-h);
  margin: 0;
  flex: 1;
}

.page-count {
  font-size: 13px;
  color: var(--text);
  background: var(--code-bg);
  padding: 4px 12px;
  border-radius: 10px;
}

.empty-state {
  text-align: center;
  padding: 64px 0;
  color: var(--text);
}

.empty-state p {
  margin: 0 0 16px;
}

.card-section {
  margin-bottom: 16px;
}

.card-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.nav-controls,
.action-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  transition: all 0.15s;
}

.btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-primary:hover {
  opacity: 0.9;
  color: white;
}

.btn-outline {
  border-color: var(--border);
}

.btn-accent {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-accent:hover {
  opacity: 0.9;
  color: white;
}

.position-indicator {
  font-size: 14px;
  color: var(--text);
  min-width: 60px;
  text-align: center;
}
</style>
