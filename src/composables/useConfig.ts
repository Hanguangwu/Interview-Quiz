import { ref } from 'vue'
import type { AppConfig } from '../types'
import { loadConfig, saveConfig } from '../config'

const config = ref<AppConfig>(loadConfig())

export function useConfig() {
  function updateConfig(partial: Partial<AppConfig>): void {
    config.value = {
      ...config.value,
      ...partial,
      app: partial.app ? { ...config.value.app, ...partial.app } : config.value.app,
      chatbot: partial.chatbot ? { ...config.value.chatbot, ...partial.chatbot } : config.value.chatbot,
      ui: partial.ui ? { ...config.value.ui, ...partial.ui } : config.value.ui,
      storage: partial.storage ? { ...config.value.storage, ...partial.storage } : config.value.storage,
    }
    saveConfig(config.value)
  }

  function resetConfig(): void {
    config.value = loadConfig()
    saveConfig(config.value)
  }

  return {
    config,
    updateConfig,
    resetConfig,
  }
}
