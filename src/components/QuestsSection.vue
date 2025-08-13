<template>
  <div class="space-y-6">
    <!-- ヘッダー -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
          <Target class="w-6 h-6 text-purple-400" />
          クエスト管理
        </h2>
        <p class="text-gray-400 mt-1">学習目標を設定して達成しましょう</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="generateAIQuest"
          :disabled="loading || aiGenerating"
          class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles :class="['w-4 h-4', aiGenerating ? 'animate-spin' : '']" />
          {{ aiGenerating ? 'AI生成中...' : 'AI生成' }}
        </button>
        <button
          @click="showAddForm = true"
          class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          手動作成
        </button>
      </div>
    </div>

    <!-- クエスト追加フォーム -->
    <div v-if="showAddForm" class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 class="text-lg font-semibold text-white mb-4">新しいクエストを作成</h3>
      <form @submit.prevent="handleAddQuest" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            クエスト名
          </label>
          <input
            v-model="newQuest.name"
            type="text"
            required
            placeholder="例: AWS SAA資格取得、Reactでポートフォリオサイト作成"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            説明
          </label>
          <textarea
            v-model="newQuest.description"
            rows="3"
            placeholder="クエストの詳細を記述してください"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          ></textarea>
        </div>
        
        <!-- 報酬設定 -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            クリア報酬
          </label>
          <div class="space-y-2">
            <div
              v-for="(reward, index) in newQuest.rewards"
              :key="index"
              class="flex gap-2 items-center"
            >
              <select
                v-model="reward.status_name"
                class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">ステータスを選択</option>
                <option
                  v-for="status in statuses"
                  :key="status.id"
                  :value="status.name"
                >
                  {{ status.name }}
                </option>
              </select>
              <input
                v-model.number="reward.increase_value"
                type="number"
                min="1"
                max="500"
                placeholder="増加値"
                class="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                @click="removeReward(index)"
                class="text-red-400 hover:text-red-300 p-1"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              @click="addReward"
              class="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
            >
              <Plus class="w-3 h-3" />
              報酬を追加
            </button>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="loading"
            class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors duration-200"
          >
            作成
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

    <!-- クエスト一覧 -->
    <div class="grid gap-4">
      <div
        v-for="quest in quests"
        :key="quest.id"
        :class="[
          'bg-gray-800 rounded-lg p-6 border transition-all duration-200',
          quest.is_completed 
            ? 'border-green-500 bg-green-900/20' 
            : 'border-gray-700 hover:border-purple-500'
        ]"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-lg font-semibold text-white">{{ quest.name }}</h3>
              <span
                v-if="quest.is_completed"
                class="bg-green-600 text-white text-xs px-2 py-1 rounded-full"
              >
                完了
              </span>
            </div>
            <p v-if="quest.description" class="text-gray-400 text-sm mb-3">
              {{ quest.description }}
            </p>
          </div>
          <div class="flex gap-2 ml-4">
            <button
              v-if="!quest.is_completed"
              @click="handleCompleteQuest(quest.id)"
              class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-200 flex items-center gap-1"
            >
              <CheckCircle class="w-3 h-3" />
              完了
            </button>
            <button
              @click="handleDeleteQuest(quest.id)"
              class="text-red-400 hover:text-red-300 p-1 rounded transition-colors duration-200"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 報酬表示 -->
        <div v-if="quest.quest_rewards && quest.quest_rewards.length > 0" class="space-y-2">
          <h4 class="text-sm font-medium text-gray-300">獲得報酬:</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="reward in quest.quest_rewards"
              :key="reward.id"
              class="bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-600/30"
            >
              {{ reward.status_name }} +{{ reward.increase_value }}
            </span>
          </div>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-if="quests.length === 0" class="text-center py-12">
        <Target class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-400 mb-2">クエストがありません</h3>
        <p class="text-gray-500 mb-4">最初のクエストを作成して学習を始めましょう！</p>
        <button
          @click="showAddForm = true"
          class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          クエストを作成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Target, Plus, X, CheckCircle, Trash2, Sparkles } from 'lucide-vue-next'
import { useGame } from '../stores/game'
import { supabase } from '../lib/supabase'

const { 
  statuses, 
  quests, 
  loading, 
  fetchStatuses, 
  fetchQuests, 
  addQuest, 
  completeQuest, 
  deleteQuest 
} = useGame()

const showAddForm = ref(false)
const aiGenerating = ref(false)
const newQuest = ref({
  name: '',
  description: '',
  rewards: []
})

// ランダムクエスト生成用のデータ
const questTemplates = [
  {
    category: 'プログラミング',
    quests: [
      {
        name: 'React Hooksをマスターせよ',
        description: 'useState、useEffect、useContextなどの基本的なHooksを理解し、実際のプロジェクトで活用できるようになる',
        rewards: [{ status_name: 'プログラミング力', increase_value: 80 }]
      },
      {
        name: 'TypeScriptの型システムを攻略せよ',
        description: 'インターフェース、ジェネリクス、ユニオン型などを使いこなし、型安全なコードを書けるようになる',
        rewards: [{ status_name: 'プログラミング力', increase_value: 100 }]
      },
      {
        name: 'APIを作成せよ',
        description: 'RESTful APIまたはGraphQL APIを設計・実装し、フロントエンドと連携させる',
        rewards: [{ status_name: 'プログラミング力', increase_value: 120 }]
      },
      {
        name: 'データベース設計をマスターせよ',
        description: '正規化、インデックス、リレーションシップを理解し、効率的なデータベース設計ができるようになる',
        rewards: [{ status_name: 'データベース知識', increase_value: 90 }]
      }
    ]
  },
  {
    category: 'クラウド',
    quests: [
      {
        name: 'AWS SAA資格を取得せよ',
        description: 'AWS Solutions Architect Associate資格を取得し、クラウドアーキテクチャの基礎を身につける',
        rewards: [{ status_name: 'AWS知識', increase_value: 150 }]
      },
      {
        name: 'Dockerをマスターせよ',
        description: 'コンテナ化技術を理解し、アプリケーションのDocker化とデプロイができるようになる',
        rewards: [{ status_name: 'インフラ知識', increase_value: 100 }]
      },
      {
        name: 'CI/CDパイプラインを構築せよ',
        description: 'GitHub ActionsやJenkinsを使用して自動テスト・デプロイの仕組みを作る',
        rewards: [{ status_name: 'インフラ知識', increase_value: 110 }]
      }
    ]
  },
  {
    category: '学習',
    quests: [
      {
        name: '技術書を読破せよ',
        description: '選んだ技術書を最後まで読み切り、重要なポイントをまとめる',
        rewards: [{ status_name: '知識力', increase_value: 70 }]
      },
      {
        name: 'オンライン講座を完走せよ',
        description: 'UdemyやCourseraなどのオンライン講座を最後まで受講し、課題をすべて完了する',
        rewards: [{ status_name: '学習力', increase_value: 80 }]
      },
      {
        name: '技術ブログを書け',
        description: '学んだ技術について詳細な記事を書き、他の開発者に共有する',
        rewards: [{ status_name: 'アウトプット力', increase_value: 90 }]
      }
    ]
  },
  {
    category: 'プロジェクト',
    quests: [
      {
        name: 'ポートフォリオサイトを作成せよ',
        description: '自分のスキルと作品を紹介するポートフォリオサイトを設計・開発・デプロイする',
        rewards: [
          { status_name: 'プログラミング力', increase_value: 60 },
          { status_name: 'デザイン力', increase_value: 40 }
        ]
      },
      {
        name: 'モバイルアプリを開発せよ',
        description: 'React NativeやFlutterを使用してモバイルアプリを開発し、ストアに公開する',
        rewards: [{ status_name: 'モバイル開発力', increase_value: 130 }]
      },
      {
        name: 'オープンソースに貢献せよ',
        description: 'GitHubのオープンソースプロジェクトにPull Requestを送り、マージされる',
        rewards: [
          { status_name: 'プログラミング力', increase_value: 50 },
          { status_name: 'コミュニケーション力', increase_value: 30 }
        ]
      }
    ]
  }
]

const generateAIQuest = async () => {
  if (statuses.value.length === 0) {
    alert('まずステータスを追加してください。')
    return
  }

  aiGenerating.value = true
  
  try {
    // ユーザーのステータス名を取得
    const userStatuses = statuses.value.map(s => s.name)
    
    // Supabase Edge Functionを呼び出し
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quest`
    
    console.log('Calling AI quest generation...', { userStatuses })
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userStatuses,
        difficulty: 'intermediate',
        category: null
      })
    })
    
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('HTTP error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const questData = await response.json()
    console.log('Generated quest data:', questData)
    
    if (questData.error) {
      throw new Error(questData.error)
    }
    
    // 生成されたクエストを追加
    const { error } = await addQuest(questData)
    if (!error) {
      console.log('AIクエストが生成されました:', questData.name)
    } else {
      throw new Error('クエストの追加に失敗しました')
    }
    
  } catch (error) {
    console.error('AI生成エラー:', error)
    
    // フォールバック: 従来のランダム生成を使用
    console.log('フォールバックでランダム生成を実行します')
    await generateRandomQuest()
  } finally {
    aiGenerating.value = false
  }
}

// フォールバック用の従来のランダム生成関数
const generateRandomQuest = async () => {
  const randomCategory = questTemplates[Math.floor(Math.random() * questTemplates.length)]
  const randomQuest = randomCategory.quests[Math.floor(Math.random() * randomCategory.quests.length)]
  
  const adjustedRewards = randomQuest.rewards.map(reward => {
    const existingStatus = statuses.value.find(s => s.name === reward.status_name)
    if (existingStatus) {
      return reward
    } else {
      if (statuses.value.length > 0) {
        const randomStatus = statuses.value[Math.floor(Math.random() * statuses.value.length)]
        return {
          status_name: randomStatus.name,
          increase_value: reward.increase_value
        }
      }
      return reward
    }
  })
  
  const questData = {
    name: randomQuest.name,
    description: randomQuest.description,
    rewards: adjustedRewards
  }

  const { error } = await addQuest(questData)
  if (!error) {
    console.log('ランダムクエストが生成されました:', questData.name)
  }
}

const handleAddQuest = async () => {
  if (!newQuest.value.name.trim()) return
  
  const { error } = await addQuest(newQuest.value)
  if (!error) {
    newQuest.value = {
      name: '',
      description: '',
      rewards: []
    }
    showAddForm.value = false
  }
}

const cancelAdd = () => {
  newQuest.value = {
    name: '',
    description: '',
    rewards: []
  }
  showAddForm.value = false
}

const addReward = () => {
  newQuest.value.rewards.push({
    status_name: '',
    increase_value: 50
  })
}

const removeReward = (index) => {
  newQuest.value.rewards.splice(index, 1)
}

const handleCompleteQuest = async (questId) => {
  if (confirm('このクエストを完了しますか？ステータスが更新され、武器を獲得します。')) {
    await completeQuest(questId)
  }
}

const handleDeleteQuest = async (id) => {
  if (confirm('このクエストを削除しますか？')) {
    await deleteQuest(id)
  }
}

onMounted(() => {
  fetchStatuses()
  fetchQuests()
})
</script>