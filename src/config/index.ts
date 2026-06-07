import type { AppConfig } from '../types'

const DEFAULT_CONFIG: AppConfig = {
  app: {
    title: '面试答题系统',
    lang: 'zh-CN',
  },
  chatbot: {
    enabled: true,
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    systemPrompt: '你是一个面试助手。请根据用户的问题提供详细、准确的面试答案。',
    temperature: 0.7,
  },
  ui: {
    theme: 'auto',
    cardFlipAnimation: 'flip',
    cardsPerPage: 10,
    showAnswerOnClick: true,
  },
  storage: {
    filePath: '/src/data/questions.json',
    autoSave: true,
    backupEnabled: false,
  },
}

const CONFIG_KEY = 'quiz_app_config'

export function loadConfig(): AppConfig {
  try {
    const stored = localStorage.getItem(CONFIG_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AppConfig>
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        app: { ...DEFAULT_CONFIG.app, ...parsed.app },
        chatbot: { ...DEFAULT_CONFIG.chatbot, ...parsed.chatbot },
        ui: { ...DEFAULT_CONFIG.ui, ...parsed.ui },
        storage: { ...DEFAULT_CONFIG.storage, ...parsed.storage },
      }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_CONFIG }
}

export function saveConfig(config: AppConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export { DEFAULT_CONFIG }
