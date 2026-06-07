<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestions } from '../composables/useQuestions'
import QuestionList from '../components/question/QuestionList.vue'
import QuestionForm from '../components/question/QuestionForm.vue'
import type { Question } from '../types'

const route = useRoute()
const { questions, deleteQuestion } = useQuestions()

const showForm = ref(false)
const editingQuestion = ref<Question | null>(null)

const activeCategory = computed(() => route.params.name as string | undefined)

const filteredQuestions = computed(() => {
  if (!activeCategory.value) return questions.value
  return questions.value.filter((q) => q.category === activeCategory.value)
})

function startAdd() {
  editingQuestion.value = null

  if (activeCategory.value) {
    showForm.value = true
  } else {
    showForm.value = true
  }
}

function editQuestion(q: Question) {
  editingQuestion.value = q
  showForm.value = true
}

async function handleDelete(id: string) {
  if (confirm('确定要删除这道题吗？')) {
    await deleteQuestion(id)
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          {{ activeCategory ? `${activeCategory} - 管理` : '管理后台' }}
        </h2>
        <p class="page-desc">
          {{ activeCategory ? `当前筛选：${activeCategory}` : '所有问题的增删改查' }}
        </p>
      </div>
    </div>

    <QuestionList
      :questions="filteredQuestions"
      @add="startAdd"
      @edit="editQuestion"
      @delete="handleDelete"
    />

    <QuestionForm
      v-model="showForm"
      :question="editingQuestion"
      @submit="showForm = false"
    />
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-h);
  margin: 0 0 4px;
}

.page-desc {
  color: var(--text);
  font-size: 14px;
  margin: 0;
}
</style>
