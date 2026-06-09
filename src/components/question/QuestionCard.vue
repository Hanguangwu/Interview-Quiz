<script setup lang="ts">
import { computed, ref } from 'vue'
import { marked } from 'marked'
import type { Question } from '../../types'
import { useConfig } from '../../composables/useConfig'
import { maskText, stripHtml } from '../../utils/mask'

const props = defineProps<{
  question: Question
  flipped: boolean
}>()

const emit = defineEmits<{
  flip: []
  edit: [question: Question]
  delete: [id: string]
}>()

const { config, updateConfig } = useConfig()
const maskVersion = ref<1 | 2>(1)
const showMaskSettings = ref(false)

const renderedQuestion = computed(() =>
  marked.parse(props.question.question, { async: false }) as string
)

const renderedAnswer = computed(() =>
  marked.parse(props.question.answer, { async: false }) as string
)

const resolvedInterval = computed(() => {
  if (config.value.ui.mask.interval === 'random') {
    return Math.floor(Math.random() * 6) + 1
  }
  return config.value.ui.mask.interval
})

const maskedResult = computed(() => {
  const plainText = stripHtml(renderedAnswer.value)
  return maskText(plainText, config.value.ui.mask.character, resolvedInterval.value)
})

const displayMaskedAnswer = computed(() => {
  return maskVersion.value === 1 ? maskedResult.value.version1 : maskedResult.value.version2
})

function handleFlip() {
  emit('flip')
}

function handleEdit() {
  emit('edit', props.question)
}

function handleDelete() {
  emit('delete', props.question.id)
}

function toggleMask() {
  updateConfig({
    ui: { ...config.value.ui, mask: { ...config.value.ui.mask, enabled: !config.value.ui.mask.enabled } },
  })
  maskVersion.value = 1
}

function toggleMaskVersion() {
  maskVersion.value = maskVersion.value === 1 ? 2 : 1
}

function setMaskCharacter(e: Event) {
  const target = e.target as HTMLInputElement
  const val = target.value.slice(0, 4) // limit to 4 chars
  target.value = val
  updateConfig({
    ui: { ...config.value.ui, mask: { ...config.value.ui.mask, character: val || 'X' } },
  })
}

function setMaskInterval(val: number | 'random') {
  updateConfig({
    ui: { ...config.value.ui, mask: { ...config.value.ui.mask, interval: val } },
  })
}
</script>

<template>
  <div class="card-container" :class="{ flipped }" @click="handleFlip">
    <div class="card-inner">
      <div class="card-front">
        <div class="card-label">问题</div>
        <div class="card-content md-body" v-html="renderedQuestion" />
        <div class="card-hint">点击翻转查看答案</div>
      </div>
      <div class="card-back">
        <div class="card-label">参考答案</div>

        <!-- 遮蔽模式 -->
        <template v-if="config.ui.mask.enabled">
          <div class="card-content mask-content">
            <div class="masked-text" v-text="displayMaskedAnswer" />
            <div class="mask-version-bar" @click.stop>
              <button class="version-btn" @click="toggleMaskVersion" :title="'切换至版本 ' + (maskVersion === 1 ? 2 : 1)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>版本 {{ maskVersion }}/2</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
          <div v-if="showMaskSettings" class="mask-settings" @click.stop>
            <div class="mask-setting-row">
              <label class="mask-label">遮蔽符</label>
              <input
                class="mask-input mask-input-short"
                :value="config.ui.mask.character"
                @input="setMaskCharacter"
                maxlength="4"
              />
            </div>
            <div class="mask-setting-row">
              <label class="mask-label">间隔</label>
              <div class="mask-interval-group">
                <button
                  v-for="n in [1, 2, 3, 4, 5, 6]"
                  :key="n"
                  class="interval-btn"
                  :class="{ active: config.ui.mask.interval === n }"
                  @click="setMaskInterval(n)"
                >{{ n }}</button>
                <button
                  class="interval-btn"
                  :class="{ active: config.ui.mask.interval === 'random' }"
                  @click="setMaskInterval('random')"
                >随机</button>
              </div>
            </div>
          </div>
        </template>

        <!-- 普通模式 -->
        <template v-else>
          <div class="card-content md-body" v-html="renderedAnswer" />
        </template>

        <div class="card-actions" @click.stop>
          <button
            class="btn btn-sm"
            :class="{ 'btn-active': config.ui.mask.enabled }"
            @click="toggleMask"
            :title="config.ui.mask.enabled ? '关闭遮蔽' : '开启遮蔽'"
          >
            <svg v-if="config.ui.mask.enabled" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            遮蔽
          </button>
          <button class="btn btn-sm btn-settings" v-if="config.ui.mask.enabled" @click="showMaskSettings = !showMaskSettings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
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
  min-height: 220px;
  height: auto;
}

.card-inner {
  position: relative;
  width: 100%;
  min-height: 220px;
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
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-h);
}

.card-hint {
  font-size: 12px;
  color: var(--text);
  margin-top: 16px;
  text-align: center;
  opacity: 0.6;
  flex-shrink: 0;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* ===== Markdown 正文样式 ===== */

.md-body {
  font-size: 15px;
  line-height: 1.75;
  color: var(--text-h);
  word-break: break-word;
}

/* 覆盖 scoped 限制，让 marked 生成的 HTML 也能继承样式 */
.md-body :deep(p) {
  margin: 0 0 12px;
}
.md-body :deep(p:last-child) {
  margin-bottom: 0;
}

/* 标题 */
.md-body :deep(h1),
.md-body :deep(h2),
.md-body :deep(h3),
.md-body :deep(h4) {
  margin: 20px 0 10px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-h);
}
.md-body :deep(h1) { font-size: 20px; }
.md-body :deep(h2) { font-size: 18px; }
.md-body :deep(h3) { font-size: 16px; }
.md-body :deep(h4) { font-size: 15px; }

/* 列表 */
.md-body :deep(ul),
.md-body :deep(ol) {
  padding-left: 22px;
  margin: 8px 0;
}
.md-body :deep(li) {
  margin-bottom: 4px;
}
.md-body :deep(li > ul),
.md-body :deep(li > ol) {
  margin: 2px 0;
}

/* 代码 */
.md-body :deep(code) {
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
  font-size: 0.875em;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--code-bg, #f0f0f0);
  color: var(--accent);
}

.md-body :deep(pre) {
  margin: 12px 0;
  padding: 16px;
  border-radius: 8px;
  background: var(--code-bg, #f5f5f5);
  overflow-x: auto;
  border: 1px solid var(--border);
}
.md-body :deep(pre code) {
  padding: 0;
  background: none;
  color: inherit;
  font-size: 0.85em;
  line-height: 1.6;
}

/* 引用 */
.md-body :deep(blockquote) {
  margin: 12px 0;
  padding: 8px 16px;
  border-left: 3px solid var(--accent);
  background: var(--accent-bg, rgba(0,0,0,0.02));
  border-radius: 0 6px 6px 0;
  color: var(--text);
}
.md-body :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

/* 加粗 / 斜体 */
.md-body :deep(strong) {
  font-weight: 700;
  color: var(--text-h);
}
.md-body :deep(em) {
  font-style: italic;
}

/* 链接 */
.md-body :deep(a) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.md-body :deep(a:hover) {
  opacity: 0.8;
}

/* 分割线 */
.md-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 16px 0;
}

/* 表格 */
.md-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 14px;
}
.md-body :deep(th),
.md-body :deep(td) {
  padding: 8px 12px;
  border: 1px solid var(--border);
  text-align: left;
}
.md-body :deep(th) {
  background: var(--code-bg, #f5f5f5);
  font-weight: 600;
}

/* 行内标记 */
.md-body :deep(del) {
  color: var(--text);
  opacity: 0.6;
}

/* 图片 */
.md-body :deep(img) {
  max-width: 100%;
  border-radius: 6px;
  margin: 8px 0;
}

/* ===== 遮蔽模式 ===== */

.mask-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.masked-text {
  font-size: 16px;
  line-height: 1.9;
  color: var(--text-h);
  word-break: break-all;
  letter-spacing: 0.5px;
  font-family: var(--mono);
  padding: 4px 0;
}

.mask-version-bar {
  display: flex;
  justify-content: center;
}

.version-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: var(--text);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}

.version-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.version-btn svg {
  opacity: 0.5;
}

.mask-settings {
  padding: 12px;
  margin: 0 0 8px;
  border-radius: 8px;
  background: var(--code-bg);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mask-setting-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mask-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  min-width: 44px;
  flex-shrink: 0;
}

.mask-input {
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-h);
  background: var(--bg);
  outline: none;
  font-family: var(--mono);
}

.mask-input:focus {
  border-color: var(--accent);
}

.mask-input-short {
  width: 64px;
  text-align: center;
}

.mask-interval-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.interval-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  font-size: 12px;
  min-width: 32px;
  text-align: center;
  transition: all 0.15s;
}

.interval-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.interval-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

/* 遮蔽按钮激活态 */
.btn-active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-active:hover {
  opacity: 0.9;
  color: white;
}

.btn-settings {
  display: flex;
  align-items: center;
}

/* 按钮 */
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
