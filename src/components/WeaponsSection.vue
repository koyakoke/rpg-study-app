<template>
  <div class="space-y-6">
    <!-- ヘッダー -->
    <div>
      <h2 class="text-2xl font-bold text-white flex items-center gap-2">
        <Sword class="w-6 h-6 text-purple-400" />
        武器コレクション
      </h2>
      <p class="text-gray-400 mt-1">クエスト完了で獲得した武器を確認できます</p>
    </div>

    <!-- 武器一覧 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="weapon in weapons"
        :key="weapon.id"
        class="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
      >
        <div class="text-center">
          <!-- 武器アイコン -->
          <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sword class="w-8 h-8 text-white" />
          </div>
          
          <!-- 武器名 -->
          <h3 class="text-lg font-semibold text-white mb-2">{{ weapon.name }}</h3>
          
          <!-- 獲得日時 -->
          <p class="text-sm text-gray-400 mb-3">
            獲得日: {{ formatDate(weapon.obtained_at) }}
          </p>
          
          <!-- レアリティ表示 -->
          <div class="flex justify-center">
            <span class="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-3 py-1 rounded-full">
              ⭐ レジェンダリー
            </span>
          </div>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-if="weapons.length === 0" class="col-span-full text-center py-12">
        <Sword class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-400 mb-2">武器がありません</h3>
        <p class="text-gray-500 mb-4">クエストを完了して最初の武器を獲得しましょう！</p>
        <div class="text-sm text-gray-600">
          💡 ヒント: クエストを完了すると自動的に武器が追加されます
        </div>
      </div>
    </div>

    <!-- 統計情報 -->
    <div v-if="weapons.length > 0" class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Award class="w-5 h-5 text-yellow-400" />
        コレクション統計
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-400">{{ weapons.length }}</div>
          <div class="text-sm text-gray-400">総武器数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-400">{{ recentWeapons }}</div>
          <div class="text-sm text-gray-400">今週獲得</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-400">{{ Math.floor(weapons.length / 5) + 1 }}</div>
          <div class="text-sm text-gray-400">コレクターレベル</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Sword, Award } from 'lucide-vue-next'
import { useGame } from '../stores/game'

const { weapons, fetchWeapons } = useGame()

const recentWeapons = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  return weapons.value.filter(weapon => 
    new Date(weapon.obtained_at) > oneWeekAgo
  ).length
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchWeapons()
})
</script>