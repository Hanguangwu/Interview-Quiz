<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useChatbot } from '../../composables/useChatbot'

const {
  messages,
  isOpen,
  isLoading,
  sendMessage,
  toggle,
  clearHistory,
} = useChatbot()

const inputText = ref('')
const messagesEnd = ref<HTMLElement | null>(null)

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return
  inputText.value = ''
  await sendMessage(text)
  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="chatbot-wrapper">
    <button class="chatbot-toggle" @click="toggle" :title="isOpen ? '关闭助手' : 'AI 面试助手'">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>

    <Transition name="slide">
      <div v-if="isOpen" class="chatbot-panel">
        <div class="chatbot-header">
          <span class="chatbot-title">AI 面试助手</span>
          <div class="chatbot-actions">
            <button class="header-btn" title="清空对话" @click="clearHistory">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
            <button class="header-btn" title="关闭" @click="toggle">&times;</button>
          </div>
        </div>

        <div class="chatbot-messages">
          <div v-if="messages.length === 0" class="welcome-msg">
            你好！我是 AI 面试助手，可以帮你解答面试问题。
            <br /><br />
            浏览题目时我会自动带入当前题目作为上下文。
          </div>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message"
            :class="msg.role"
          >
            <div class="msg-avatar">{{ msg.role === 'user' ? '我' : 'AI' }}</div>
            <div class="msg-content">{{ msg.content }}</div>
          </div>
          <div v-if="isLoading" class="message assistant">
            <div class="msg-avatar">AI</div>
            <div class="msg-content typing">思考中...</div>
          </div>
          <div ref="messagesEnd" />
        </div>

        <div class="chatbot-input">
          <textarea
            v-model="inputText"
            class="input-field"
            placeholder="输入问题..."
            rows="2"
            @keydown="handleKeydown"
          />
          <button
            class="send-btn"
            :disabled="!inputText.trim() || isLoading"
            @click="handleSend"
          >
            发送
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.chatbot-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 900;
}

.chatbot-toggle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.15s;
}

.chatbot-toggle:hover {
  transform: scale(1.05);
}

.chatbot-panel {
  position: absolute;
  bottom: 64px;
  right: 0;
  width: 380px;
  height: 520px;
  background: var(--bg);
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.chatbot-title {
  font-weight: 600;
  color: var(--text-h);
  font-size: 15px;
}

.chatbot-actions {
  display: flex;
  gap: 4px;
}

.header-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  padding: 4px 6px;
  font-size: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.header-btn:hover {
  background: var(--code-bg);
  color: var(--text-h);
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.welcome-msg {
  text-align: center;
  color: var(--text);
  font-size: 14px;
  padding: 32px 16px;
  line-height: 1.6;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.message.assistant .msg-avatar {
  background: var(--accent-bg);
  color: var(--accent);
}

.message.user .msg-avatar {
  background: var(--code-bg);
  color: var(--text-h);
}

.msg-content {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message.assistant .msg-content {
  background: var(--code-bg);
  color: var(--text-h);
  border-top-left-radius: 4px;
}

.message.user .msg-content {
  background: var(--accent);
  color: white;
  border-top-right-radius: 4px;
}

.typing {
  opacity: 0.6;
}

.chatbot-input {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.input-field {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  color: var(--text-h);
  background: var(--bg);
  font-family: inherit;
  line-height: 1.5;
}

.input-field:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.send-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-end;
  transition: opacity 0.15s;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
