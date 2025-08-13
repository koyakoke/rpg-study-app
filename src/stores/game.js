import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const statuses = ref([])
const quests = ref([])
const weapons = ref([])
const loading = ref(false)

export const useGame = () => {
  const addStatus = async (name, value = 0) => {
    // ローカルストレージに保存
    const newStatus = {
      id: Date.now().toString(),
      name,
      value: Math.max(0, Math.min(1000, parseInt(value) || 0)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    statuses.value.push(newStatus)
    localStorage.setItem('rpg_statuses', JSON.stringify(statuses.value))
    return { data: newStatus, error: null }
  }

  const updateStatus = async (id, updates) => {
    const index = statuses.value.findIndex(s => s.id === id)
    if (index !== -1) {
      // 値が数値の場合のみ処理
      if (updates.value !== undefined) {
        updates.value = Math.max(0, Math.min(1000, parseInt(updates.value) || 0))
      }
      statuses.value[index] = {
        ...statuses.value[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      localStorage.setItem('rpg_statuses', JSON.stringify(statuses.value))
      return { data: statuses.value[index], error: null }
    }
    return { data: null, error: { message: 'Status not found' } }
  }

  const deleteStatus = async (id) => {
    statuses.value = statuses.value.filter(s => s.id !== id)
    localStorage.setItem('rpg_statuses', JSON.stringify(statuses.value))
    return { error: null }
  }

  // ローカルストレージからデータを読み込み
  const fetchStatuses = async () => {
    loading.value = true
    const stored = localStorage.getItem('rpg_statuses')
    if (stored) {
      statuses.value = JSON.parse(stored)
    }
    loading.value = false
    return { data: statuses.value, error: null }
  }

  // クエスト関連
  const fetchQuests = async () => {
    loading.value = true
    const stored = localStorage.getItem('rpg_quests')
    if (stored) {
      quests.value = JSON.parse(stored)
    }
    loading.value = false
    return { data: quests.value, error: null }
  }

  const addQuest = async (questData) => {
    const newQuest = {
      id: Date.now().toString(),
      ...questData,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      quest_rewards: questData.rewards || []
    }
    
    quests.value.unshift(newQuest)
    localStorage.setItem('rpg_quests', JSON.stringify(quests.value))
    return { data: newQuest, error: null }
  }

  const completeQuest = async (questId) => {
    const quest = quests.value.find(q => q.id === questId)
    if (!quest) return { error: { message: 'Quest not found' } }
    
    // クエストを完了状態に更新
    quest.is_completed = true
    quest.updated_at = new Date().toISOString()
    
    // ステータスを更新
    if (quest.quest_rewards) {
      for (const reward of quest.quest_rewards) {
        const status = statuses.value.find(s => s.name === reward.status_name)
        if (status) {
          const newValue = Math.min(1000, status.value + reward.increase_value)
          await updateStatus(status.id, { value: newValue })
        }
      }
    }
    
    // 武器を追加
    await addWeapon(quest.name, questId)
    
    localStorage.setItem('rpg_quests', JSON.stringify(quests.value))
    return { error: null }
  }

  const deleteQuest = async (id) => {
    quests.value = quests.value.filter(q => q.id !== id)
    localStorage.setItem('rpg_quests', JSON.stringify(quests.value))
    return { error: null }
  }

  // 武器関連
  const fetchWeapons = async () => {
    loading.value = true
    const stored = localStorage.getItem('rpg_weapons')
    if (stored) {
      weapons.value = JSON.parse(stored)
    }
    loading.value = false
    return { data: weapons.value, error: null }
  }

  const addWeapon = async (name, questId) => {
    const newWeapon = {
      id: Date.now().toString(),
      name,
      quest_id: questId,
      obtained_at: new Date().toISOString()
    }
    
    weapons.value.unshift(newWeapon)
    localStorage.setItem('rpg_weapons', JSON.stringify(weapons.value))
    return { data: newWeapon, error: null }
  }

  return {
    // State
    statuses: computed(() => statuses.value),
    quests: computed(() => quests.value),
    weapons: computed(() => weapons.value),
    loading: computed(() => loading.value),
    
    // Status methods
    fetchStatuses,
    addStatus,
    updateStatus,
    deleteStatus,
    
    // Quest methods
    fetchQuests,
    addQuest,
    completeQuest,
    deleteQuest,
    
    // Weapon methods
    fetchWeapons,
    addWeapon
  }
}

// 以下の古いSupabase依存のコードを削除
/*
  // ステータス関連
  const fetchStatuses = async () => {
    loading.value = true
    const { data, error } = await supabase
      .from('statuses')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (!error) {
      statuses.value = data || []
    }
    loading.value = false
    return { data, error }
  }

  // クエスト関連
  const fetchQuests = async () => {
    loading.value = true
    const { data, error } = await supabase
      .from('quests')
      .select(`
        *,
        quest_rewards (*)
      `)
      .order('created_at', { ascending: false })
    
    if (!error) {
      quests.value = data || []
    }
    loading.value = false
    return { data, error }
  }

  const addQuest = async (questData) => {
    const userId = (await supabase.auth.getUser()).data.user.id
    
    // クエストを作成
    const { data: questResult, error: questError } = await supabase
      .from('quests')
      .insert([{ 
        ...questData, 
        user_id: userId,
        quest_rewards: undefined 
      }])
      .select()
    
    if (questError) return { error: questError }
    
    const quest = questResult[0]
    
    // 報酬を追加
    if (questData.rewards && questData.rewards.length > 0) {
      const { error: rewardsError } = await supabase
        .from('quest_rewards')
        .insert(
          questData.rewards.map(reward => ({
            quest_id: quest.id,
            status_name: reward.status_name,
            increase_value: reward.increase_value
          }))
        )
      
      if (rewardsError) return { error: rewardsError }
    }
    
    // 最新データを取得
    await fetchQuests()
    return { data: quest, error: null }
  }

  const completeQuest = async (questId) => {
    // クエストを完了状態に更新
    const { error: questError } = await supabase
      .from('quests')
      .update({ is_completed: true, updated_at: new Date().toISOString() })
      .eq('id', questId)
    
    if (questError) return { error: questError }
    
    // クエストの報酬を取得
    const { data: rewards, error: rewardsError } = await supabase
      .from('quest_rewards')
      .select('*')
      .eq('quest_id', questId)
    
    if (rewardsError) return { error: rewardsError }
    
    // ステータスを更新
    for (const reward of rewards) {
      const status = statuses.value.find(s => s.name === reward.status_name)
      if (status) {
        const newValue = Math.min(1000, status.value + reward.increase_value)
        await updateStatus(status.id, { value: newValue })
      }
    }
    
    // 武器を取得
    const quest = quests.value.find(q => q.id === questId)
    if (quest) {
      await addWeapon(quest.name, questId)
    }
    
    // データを再取得
    await fetchQuests()
    return { error: null }
  }
*/
