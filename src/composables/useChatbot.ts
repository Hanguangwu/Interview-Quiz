import { ref } from 'vue'
import type { ChatMessage, Question, AppConfig } from '../types'
import { generateId } from '../utils/id'
import { loadConfig } from '../config'

const messages = ref<ChatMessage[]>([])
const isOpen = ref(false)
const isLoading = ref(false)
let currentQuestionContext: Question | null = null

export function useChatbot() {
  function loadHistory(): ChatMessage[] {
    try {
      const saved = sessionStorage.getItem('chat_history')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return []
  }

  function saveHistory(msgs: ChatMessage[]): void {
    sessionStorage.setItem('chat_history', JSON.stringify(msgs))
  }

  messages.value = loadHistory()

  async function sendMessage(content: string): Promise<void> {
    const config: AppConfig = loadConfig()
    if (!config.chatbot.enabled || !config.chatbot.apiEndpoint) {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '请在设置中配置 Chatbot API 端点并启用 Chatbot。',
        timestamp: new Date().toISOString(),
      }
      messages.value.push(errorMsg)
      saveHistory(messages.value)
      return
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    messages.value.push(userMsg)
    isLoading.value = true

    try {
      const systemContent = currentQuestionContext
        ? `${config.chatbot.systemPrompt}\n\n当前面试题：${currentQuestionContext.question}\n参考答案：${currentQuestionContext.answer}`
        : config.chatbot.systemPrompt

      const response = await fetch(config.chatbot.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.chatbot.apiKey}`,
        },
        body: JSON.stringify({
          model: config.chatbot.model,
          messages: [
            { role: 'system', content: systemContent },
            ...messages.value.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          temperature: config.chatbot.temperature,
        }),
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || '未获取到回复'

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      }
      messages.value.push(assistantMsg)
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `请求失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date().toISOString(),
      }
      messages.value.push(errorMsg)
    } finally {
      isLoading.value = false
      saveHistory(messages.value)
    }
  }

  function setContext(question: Question): void {
    currentQuestionContext = question
  }

  function toggle(): void {
    isOpen.value = !isOpen.value
  }

  function open(): void {
    isOpen.value = true
  }

  function close(): void {
    isOpen.value = false
  }

  function clearHistory(): void {
    messages.value = []
    currentQuestionContext = null
    sessionStorage.removeItem('chat_history')
  }

  return {
    messages,
    isOpen,
    isLoading,
    sendMessage,
    setContext,
    toggle,
    open,
    close,
    clearHistory,
  }
}
