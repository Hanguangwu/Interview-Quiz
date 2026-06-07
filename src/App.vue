<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuestions } from './composables/useQuestions'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import ChatBot from './components/chatbot/ChatBot.vue'

const { fetchQuestions } = useQuestions()

onMounted(() => {
  fetchQuestions()
})
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="app-main">
        <router-view />
      </main>
    </div>
    <ChatBot />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  display: flex;
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.app-main {
  flex: 1;
  min-width: 0;
  padding: 0 24px;
  border-left: 1px solid var(--border);
}
</style>
