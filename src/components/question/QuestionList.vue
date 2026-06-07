<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Question } from '../../types'

const props = defineProps<{
  questions: Question[]
}>()

const emit = defineEmits<{
  edit: [question: Question]
  delete: [id: string]
  add: []
}>()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10

const filteredQuestions = computed(() => {
  if (!searchQuery.value.trim()) return props.questions
  const q = searchQuery.value.trim().toLowerCase()
  return props.questions.filter(
    (item) =>
      item.question.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q)
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredQuestions.value.length / pageSize))
)

const pagedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredQuestions.value.slice(start, start + pageSize)
})

function goToPage(page: number) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
}
</script>

<template>
  <div class="list-container">
    <div class="list-toolbar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索问题..."
      />
      <button class="btn btn-primary" @click="emit('add')">+ 新增问题</button>
    </div>

    <div v-if="pagedQuestions.length === 0" class="empty-state">
      {{ searchQuery ? '未找到匹配的问题' : '暂无问题数据' }}
    </div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th class="col-num">#</th>
          <th class="col-cat">类别</th>
          <th class="col-q">问题</th>
          <th class="col-a">参考答案</th>
          <th class="col-time">创建时间</th>
          <th class="col-actions">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in pagedQuestions" :key="item.id">
          <td class="col-num">{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
          <td class="col-cat">
            <span class="category-tag">{{ item.category }}</span>
          </td>
          <td class="col-q">
            <span class="cell-text">{{ item.question }}</span>
          </td>
          <td class="col-a">
            <span class="cell-text">{{ item.answer }}</span>
          </td>
          <td class="col-time">
            {{ new Date(item.createdAt).toLocaleDateString('zh-CN') }}
          </td>
          <td class="col-actions">
            <button class="action-btn edit-btn" @click="emit('edit', item)">编辑</button>
            <button class="action-btn delete-btn" @click="emit('delete', item.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
      >
        &laquo;
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button
        class="page-btn"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
      >
        &raquo;
      </button>
    </div>
  </div>
</template>

<style scoped>
.list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-h);
  background: var(--bg);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  white-space: nowrap;
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

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  text-align: left;
  padding: 12px 8px;
  font-weight: 600;
  color: var(--text);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--border);
}

.data-table td {
  padding: 12px 8px;
  border-bottom: 1px solid var(--border);
  color: var(--text-h);
  vertical-align: top;
}

.data-table tr:hover td {
  background: var(--accent-bg);
}

.col-num {
  width: 40px;
  text-align: center;
  color: var(--text);
}

.col-cat {
  width: 100px;
}

.col-time {
  width: 100px;
  color: var(--text);
  white-space: nowrap;
}

.col-actions {
  width: 120px;
  white-space: nowrap;
}

.category-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 12px;
  font-weight: 500;
}

.cell-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.action-btn {
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--text);
  margin-right: 6px;
  transition: all 0.15s;
}

.edit-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.delete-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: var(--text);
  font-size: 15px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}

.page-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  cursor: pointer;
  color: var(--text);
  font-size: 14px;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: var(--text);
}
</style>
