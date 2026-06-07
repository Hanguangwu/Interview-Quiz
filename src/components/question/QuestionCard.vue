<script setup lang="ts">
import type { Question } from '../../types'

const props = defineProps<{
  question: Question
  flipped: boolean
}>()

const emit = defineEmits<{
  flip: []
  edit: [question: Question]
  delete: [id: string]
}>()

function handleFlip() {
  emit('flip')
}

function handleEdit() {
  emit('edit', props.question)
}

function handleDelete() {
  emit('delete', props.question.id)
}
</script>

<template>
  <div class="card-container" :class="{ flipped }" @click="handleFlip">
    <div class="card-inner">
      <div class="card-front">
        <div class="card-label">问题</div>
        <div class="card-content">{{ question.question }}</div>
        <div class="card-hint">点击翻转查看答案</div>
      </div>
      <div class="card-back">
        <div class="card-label">参考答案</div>
        <div class="card-content markdown-content">{{ question.answer }}</div>
        <div class="card-actions" @click.stop>
          <button class="btn btn-sm" @click="handleEdit">编辑</button>
          <button class="btn btn-sm btn-danger" @click="handleDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-container {
  perspective: 1000px;
  cursor: pointer;
  height: 320px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
  transform-style: preserve-3d;
}

.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 12px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  background: var(--bg);
  overflow-y: auto;
}

.card-back {
  transform: rotateY(180deg);
}

.card-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--accent);
  margin-bottom: 16px;
}

.card-content {
  flex: 1;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-h);
  white-space: pre-wrap;
}

.markdown-content {
  line-height: 1.8;
}

.card-hint {
  font-size: 12px;
  color: var(--text);
  margin-top: 16px;
  text-align: center;
  opacity: 0.6;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
}

.btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.btn-danger:hover {
  border-color: #ef4444;
  color: #ef4444;
}
</style>
