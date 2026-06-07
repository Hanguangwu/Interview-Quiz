import { ref, computed } from 'vue'
import type { Question, QuestionFormData } from '../types'
import { generateId } from '../utils/id'
import { initializeQuestions, writeQuestions } from '../utils/storage'

const questions = ref<Question[]>([])
const loading = ref(false)

function getNow(): string {
  return new Date().toISOString()
}

export function useQuestions() {
  const categories = computed(() => {
    const cats = new Set(questions.value.map((q) => q.category))
    return Array.from(cats).sort()
  })

  async function fetchQuestions(): Promise<void> {
    loading.value = true
    try {
      questions.value = await initializeQuestions()
    } finally {
      loading.value = false
    }
  }

  async function addQuestion(data: QuestionFormData): Promise<void> {
    const now = getNow()
    const question: Question = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    questions.value.push(question)
    await writeQuestions(questions.value)
  }

  async function updateQuestion(id: string, data: Partial<QuestionFormData>): Promise<void> {
    const index = questions.value.findIndex((q) => q.id === id)
    if (index === -1) return
    questions.value[index] = {
      ...questions.value[index],
      ...data,
      updatedAt: getNow(),
    }
    await writeQuestions(questions.value)
  }

  async function deleteQuestion(id: string): Promise<void> {
    questions.value = questions.value.filter((q) => q.id !== id)
    await writeQuestions(questions.value)
  }

  function getQuestionsByCategory(category: string): Question[] {
    return questions.value.filter((q) => q.category === category)
  }

  function getQuestionById(id: string): Question | undefined {
    return questions.value.find((q) => q.id === id)
  }

  function getRandomQuestion(category?: string): Question | undefined {
    const pool = category ? getQuestionsByCategory(category) : questions.value
    if (pool.length === 0) return undefined
    const idx = Math.floor(Math.random() * pool.length)
    return pool[idx]
  }

  return {
    questions,
    categories,
    loading,
    fetchQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionsByCategory,
    getQuestionById,
    getRandomQuestion,
  }
}
