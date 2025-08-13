/*
  # RPG風勉強管理アプリケーション データベーススキーマ

  1. 新しいテーブル
    - `statuses` - ユーザーのステータス管理（プログラミング力、AWS知識など）
      - `id` (uuid, primary key)
      - `user_id` (uuid, 外部キー)
      - `name` (text, ステータス名)
      - `value` (integer, ステータス値 0-1000)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quests` - クエスト管理
      - `id` (uuid, primary key)
      - `user_id` (uuid, 外部キー)
      - `name` (text, クエスト名)
      - `description` (text, クエスト説明)
      - `is_completed` (boolean, 完了フラグ)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quest_rewards` - クエスト報酬設定
      - `id` (uuid, primary key)
      - `quest_id` (uuid, 外部キー)
      - `status_name` (text, 対象ステータス名)
      - `increase_value` (integer, 増加値)
    
    - `weapons` - 武器管理
      - `id` (uuid, primary key)
      - `user_id` (uuid, 外部キー)
      - `name` (text, 武器名)
      - `quest_id` (uuid, 取得元クエスト)
      - `obtained_at` (timestamp, 取得日時)

  2. セキュリティ
    - 全テーブルでRLSを有効化
    - 認証済みユーザーが自分のデータのみアクセス可能なポリシーを設定
*/

-- ステータステーブル
CREATE TABLE IF NOT EXISTS statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  value integer DEFAULT 0 CHECK (value >= 0 AND value <= 1000),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- クエストテーブル
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- クエスト報酬テーブル
CREATE TABLE IF NOT EXISTS quest_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE,
  status_name text NOT NULL,
  increase_value integer DEFAULT 0 CHECK (increase_value >= 0)
);

-- 武器テーブル
CREATE TABLE IF NOT EXISTS weapons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  quest_id uuid REFERENCES quests(id),
  obtained_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE weapons ENABLE ROW LEVEL SECURITY;

-- ポリシー設定
CREATE POLICY "Users can manage own statuses"
  ON statuses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own quests"
  ON quests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage quest rewards for own quests"
  ON quest_rewards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quests 
      WHERE quests.id = quest_rewards.quest_id 
      AND quests.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quests 
      WHERE quests.id = quest_rewards.quest_id 
      AND quests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own weapons"
  ON weapons
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_statuses_user_id ON statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_rewards_quest_id ON quest_rewards(quest_id);
CREATE INDEX IF NOT EXISTS idx_weapons_user_id ON weapons(user_id);