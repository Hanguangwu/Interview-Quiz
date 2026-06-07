<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Question, QuestionFormData } from '../../types'
import { useQuestions } from '../../composables/useQuestions'

const props = defineProps<{
  modelValue: boolean
  question: Question | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: []
}>()

const { categories, addQuestion, updateQuestion } = useQuestions()

const form = ref<QuestionFormData>({
  category: '',
  question: '',
  answer: '',
})

const isEditing = ref(false)
const saving = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.question) {
        form.value = {
          category: props.question.category,
          question: props.question.question,
          answer: props.question.answer,
        }
        isEditing.value = true
      } else {
        form.value = { category: '', question: '', answer: '' }
        isEditing.value = false
      }
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

async function handleSubmit() {
  if (!form.value.category.trim() || !form.value.question.trim()) return
  saving.value = true
  try {
    if (isEditing.value && props.question) {
      await updateQuestion(props.question.id, form.value)
    } else {
      await addQuestion(form.value)
    }
    emit('submit')
    close()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="form-modal">
        <div class="form-header">
          <h3>{{ isEditing ? '编辑问题' : '新增问题' }}</h3>
          <button class="close-btn" @click="close">&times;</button>
        </div>
        <form @submit.prevent="handleSubmit" class="form-body">
          <div class="form-group">
            <label class="form-label">类别</label>
            <div class="category-input-group">
              <input
                v-model="form.category"
                class="form-input"
                placeholder="输入类别名称"
                list="category-list"
              />
              <datalist id="category-list">
                <option v-for="cat in categories" :key="cat" :value="cat" />
              </datalist>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">问题</label>
            <textarea
              v-model="form.question"
              class="form-textarea"
              placeholder="输入面试问题"
              rows="3"
            />
          </div>
          <div class="form-group">
            <label class="form-label">参考答案</label>
            <textarea
              v-model="form.answer"
              class="form-textarea"
              placeholder="输入参考答案"
              rows="6"
            />
          </div>
          <div class="form-footer">
            <button type="button" class="btn btn-cancel" @click="close">取消</button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!form.category.trim() || !form.question.trim() || saving"
            >
              {{ saving ? '保存中...' : isEditing ? '更新' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-modal {
  background: var(--bg);
  border-radius: 12px;
  width: 540px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.form-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text);
  padding: 4px;
  line-height: 1;
}

.close-btn:hover {
  color: var(--text-h);
}

.form-body {
  padding: 20px 24px 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h);
  margin-bottom: 6px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-h);
  background: var(--bg);
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}

.btn:hover {
  border-color: var(--accent);
  color: var(--accent);
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel:hover {
  border-color: var(--text);
  color: var(--text-h);
}
</style>
