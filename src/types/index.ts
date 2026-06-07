export interface Question {
  id: string
  category: string
  question: string
  answer: string
  createdAt: string
  updatedAt: string
}

export interface AppConfig {
  app: {
    title: string
    lang: 'zh-CN' | 'en'
  }
  chatbot: {
    enabled: boolean
    apiEndpoint: string
    apiKey: string
    model: string
    systemPrompt: string
    temperature: number
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    cardFlipAnimation: 'flip' | 'fade' | 'slide'
    cardsPerPage: number
    showAnswerOnClick: boolean
  }
  storage: {
    filePath: string
    autoSave: boolean
    backupEnabled: boolean
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type QuestionFormData = Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
