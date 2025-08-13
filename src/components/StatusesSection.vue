<template>
  <div class="space-y-6">
    <!-- ヘッダー -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp class="w-6 h-6 text-purple-400" />
          ステータス管理
        </h2>
        <p class="text-gray-400 mt-1">あなたの能力値を管理しましょう</p>
      </div>
      <button
        @click="showAddForm = true"
        class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        新しいステータス
      </button>
    </div>

    <!-- ステータス追加フォーム -->
    <div v-if="showAddForm" class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 class="text-lg font-semibold text-white mb-4">新しいステータスを追加</h3>
      <form @submit.prevent="handleAddStatus" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            ステータス名
          </label>
          <input
            v-model="newStatus.name"
            type="text"
            required
            placeholder="例: プログラミング力、AWS知識、英語力"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            初期値 (0-1000)
          </label>
          <input
            :value="newStatus.value"
            @input="handleValueInput"
            type="number"
            min="0"
            max="1000"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="loading"
            class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors duration-200"
          >
            追加
          </button>
          <button
            type="button"
            @click="cancelAdd"
            class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>

    <!-- ステータス一覧 -->
    <div class="grid gap-4">
      <div
        v-for="status in statuses"
        :key="status.id"
        class="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all duration-200"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">{{ status.name }}</h3>
          <div class="flex gap-2">
            <button
              @click="startEdit(status)"
              class="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors duration-200"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              @click="handleDeleteStatus(status.id)"
              class="text-red-400 hover:text-red-300 p-1 rounded transition-colors duration-200"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- ステータスバー -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-300 mb-2">
            <span>レベル {{ Math.floor(status.value / 100) + 1 }}</span>
            <span>{{ status.value }} / 1000</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-3">
            <div
              class="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              :style="{ width: `${(status.value / 1000) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- 編集フォーム -->
        <div v-if="editingStatus?.id === status.id" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              ステータス名
            </label>
            <input
              v-model="editingStatus.name"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              値 (0-1000)
            </label>
            <input
              v-model.lazy="editingStatus.value"
              type="number"
              min="0"
              max="1000"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div class="flex gap-2">
            <button
              @click="handleUpdateStatus"
              class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-200"
            >
              保存
            </button>
            <button
              @click="cancelEdit"
              class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors duration-200"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-if="statuses.length === 0" class="text-center py-12">
        <TrendingUp class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-400 mb-2">ステータスがありません</h3>
        <p class="text-gray-500 mb-4">最初のステータスを追加して冒険を始めましょう！</p>
        <button
          @click="showAddForm = true"
          class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          ステータスを追加
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TrendingUp, Plus, Edit, Trash2 } from 'lucide-vue-next'
import { useGame } from '../stores/game'

const { statuses, loading, fetchStatuses, addStatus, updateStatus, deleteStatus } = useGame()

const showAddForm = ref(false)
const newStatus = ref({ name: '', value: 0 })
const editingStatus = ref(null)

const handleAddStatus = async () => {
  if (!newStatus.value.name.trim()) return
  
  const { error } = await addStatus(newStatus.value.name, newStatus.value.value)
  if (!error) {
    newStatus.value = { name: '', value: 0 }
    showAddForm.value = false
  }
}

const cancelAdd = () => {
  newStatus.value = { name: '', value: 0 }
  showAddForm.value = false
}

const handleValueInput = (event) => {
  const inputValue = event.target.value
  const numValue = parseInt(inputValue) || 0
  newStatus.value.value = Math.max(0, Math.min(1000, numValue))
}

const handleEditValueInput = (event) => {
  const inputValue = event.target.value
  const numValue = parseInt(inputValue) || 0
  editingStatus.value.value = Math.max(0, Math.min(1000, numValue))
}

const startEdit = (status) => {
  editingStatus.value = { ...status }
}

const handleUpdateStatus = async () => {
  if (!editingStatus.value) return
  
  const { error } = await updateStatus(editingStatus.value.id, {
    name: editingStatus.value.name,
    value: editingStatus.value.value
  })
  
  if (!error) {
    editingStatus.value = null
  }
}

const cancelEdit = () => {
  editingStatus.value = null
}

const handleDeleteStatus = async (id) => {
  if (confirm('このステータスを削除しますか？')) {
    await deleteStatus(id)
  }
}

onMounted(() => {
  fetchStatuses()
})
</script>