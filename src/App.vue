<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
    <!-- メインアプリケーション -->
    <div class="min-h-screen">
      <!-- ヘッダー -->
      <header class="bg-gray-800 border-b border-gray-700">
        <div class="max-w-6xl mx-auto px-8 py-6">
          <h1 class="text-xl font-bold text-white flex items-center gap-2 mb-4">
            ⚔️ RPG Study Quest
          </h1>
          
          <!-- 横並びタブナビゲーション -->
          <nav class="flex gap-1">
            <button
              @click="handleNavigate('statuses')"
              :class="[
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 relative',
                activeSection === 'statuses' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl border-4 border-purple-300 transform scale-110 z-10' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white bg-gray-800'
              ]"
              :style="activeSection === 'statuses' ? 'box-shadow: 0 0 30px rgba(147, 51, 234, 0.6)' : ''"
            >
              <div v-if="activeSection === 'statuses'" class="absolute -top-1 -left-1 -right-1 -bottom-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg -z-10 animate-pulse"></div>
              <TrendingUp class="w-5 h-5" />
              <span>ステータス</span>
            </button>
            <button
              @click="handleNavigate('quests')"
              :class="[
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 relative',
                activeSection === 'quests' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl border-4 border-purple-300 transform scale-110 z-10' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white bg-gray-800'
              ]"
              :style="activeSection === 'quests' ? 'box-shadow: 0 0 50px rgba(147, 51, 234, 0.9), 0 0 100px rgba(147, 51, 234, 0.5), 0 0 150px rgba(147, 51, 234, 0.3)' : ''"
            >
              <div v-if="activeSection === 'quests'" class="absolute -top-1 -left-1 -right-1 -bottom-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg -z-10 animate-pulse"></div>
              <Target class="w-5 h-5" />
              <span>クエスト</span>
            </button>
            <button
              @click="handleNavigate('weapons')"
              :class="[
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 relative',
                activeSection === 'weapons' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl border-4 border-purple-300 transform scale-110 z-10' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white bg-gray-800'
              ]"
              :style="activeSection === 'weapons' ? 'box-shadow: 0 0 50px rgba(147, 51, 234, 0.9), 0 0 100px rgba(147, 51, 234, 0.5), 0 0 150px rgba(147, 51, 234, 0.3)' : ''"
            >
              <div v-if="activeSection === 'weapons'" class="absolute -top-1 -left-1 -right-1 -bottom-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg -z-10 animate-pulse"></div>
              <Sword class="w-5 h-5" />
              <span>武器</span>
            </button>
          </nav>
        </div>
      </header>
      
      <main class="p-8">
        <div class="max-w-6xl mx-auto">
          <StatusesSection v-if="activeSection === 'statuses'" />
          <QuestsSection v-if="activeSection === 'quests'" />
          <WeaponsSection v-if="activeSection === 'weapons'" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TrendingUp, Target, Sword } from 'lucide-vue-next'
import StatusesSection from './components/StatusesSection.vue'
import QuestsSection from './components/QuestsSection.vue'
import WeaponsSection from './components/WeaponsSection.vue'

const activeSection = ref('statuses')

const handleNavigate = (section) => {
  activeSection.value = section
}
</script>