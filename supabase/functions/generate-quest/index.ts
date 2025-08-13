interface QuestGenerationRequest {
  userStatuses: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
}

interface QuestResponse {
  name: string;
  description: string;
  rewards: Array<{
    status_name: string;
    increase_value: number;
  }>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 高品質なクエストテンプレート
const questTemplates = {
  programming: [
    {
      name: "React Hooksの奥義を習得せよ",
      description: "useState、useEffect、useContext、useReducerなどの基本Hooksから、カスタムHooksの作成まで完全マスターし、実際のプロジェクトで効率的に活用できるようになる",
      baseReward: 85
    },
    {
      name: "TypeScript型システムの達人になれ",
      description: "ジェネリクス、条件型、マップ型、テンプレートリテラル型などの高度な型機能を駆使し、型安全で保守性の高いコードを書けるようになる",
      baseReward: 95
    },
    {
      name: "GraphQL APIアーキテクトへの道",
      description: "GraphQLスキーマ設計、リゾルバー実装、パフォーマンス最適化、セキュリティ対策まで包括的に学び、スケーラブルなAPIを構築する",
      baseReward: 110
    },
    {
      name: "マイクロサービス設計の極意",
      description: "ドメイン駆動設計、イベントソーシング、CQRS、サーキットブレーカーパターンなどを活用し、堅牢な分散システムを設計・実装する",
      baseReward: 130
    }
  ],
  cloud: [
    {
      name: "AWS Solutions Architect Professional制覇",
      description: "エンタープライズレベルのクラウドアーキテクチャ設計、コスト最適化、セキュリティベストプラクティス、災害復旧戦略を完全習得する",
      baseReward: 150
    },
    {
      name: "Kubernetes運用マスターへの挑戦",
      description: "Pod、Service、Deployment、StatefulSet、Ingress、RBAC、ネットワークポリシーなどを駆使し、本番環境でのK8s運用を完全制覇する",
      baseReward: 120
    },
    {
      name: "Infrastructure as Code の真髄",
      description: "Terraform、CloudFormation、Pulumi、Ansibleを使いこなし、再現可能で保守性の高いインフラ自動化を実現する",
      baseReward: 100
    },
    {
      name: "DevSecOps パイプライン構築の匠",
      description: "セキュリティテスト自動化、脆弱性スキャン、コンプライアンス監査を組み込んだCI/CDパイプラインを構築し、セキュアな開発フローを確立する",
      baseReward: 115
    }
  ],
  data: [
    {
      name: "機械学習エンジニアリングの頂点",
      description: "MLOps、モデルバージョニング、A/Bテスト、モニタリング、自動再学習システムを構築し、本番環境でのML運用を完全マスターする",
      baseReward: 140
    },
    {
      name: "ビッグデータアーキテクトの称号",
      description: "Apache Spark、Kafka、Elasticsearch、データレイク設計、リアルタイム処理パイプラインを駆使し、大規模データ基盤を構築する",
      baseReward: 125
    },
    {
      name: "データサイエンス実践の極意",
      description: "統計学、機械学習アルゴリズム、特徴量エンジニアリング、モデル評価、ビジネス価値創出まで一貫したデータ分析スキルを習得する",
      baseReward: 105
    }
  ],
  security: [
    {
      name: "サイバーセキュリティ防御の要塞",
      description: "ペネトレーションテスト、脆弱性診断、インシデント対応、フォレンジック調査、セキュリティ監査の実践スキルを完全習得する",
      baseReward: 135
    },
    {
      name: "ゼロトラストアーキテクチャの設計者",
      description: "アイデンティティ管理、マイクロセグメンテーション、継続的検証、最小権限の原則を実装し、次世代セキュリティ基盤を構築する",
      baseReward: 120
    }
  ],
  mobile: [
    {
      name: "クロスプラットフォーム開発の覇者",
      description: "React Native、Flutter、Xamarinを使いこなし、iOS/Android両対応の高品質モバイルアプリを効率的に開発する技術を習得する",
      baseReward: 110
    },
    {
      name: "モバイルアプリパフォーマンス最適化の達人",
      description: "メモリ管理、バッテリー最適化、ネットワーク効率化、UIレスポンス向上など、モバイル特有の制約下での最適化技術を完全マスターする",
      baseReward: 95
    }
  ]
};

// 難易度に応じた調整係数
const difficultyMultipliers = {
  beginner: 0.7,
  intermediate: 1.0,
  advanced: 1.3
};

// ランダムなバリエーションを追加する関数
function addVariation(baseQuest: any, userStatuses: string[], difficulty: string): QuestResponse {
  const multiplier = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] || 1.0;
  const variation = 0.8 + Math.random() * 0.4; // 0.8-1.2の範囲でランダム調整
  
  // ランダムにステータスを選択
  const selectedStatus = userStatuses[Math.floor(Math.random() * userStatuses.length)];
  const rewardValue = Math.round(baseQuest.baseReward * multiplier * variation);
  
  // 名前にバリエーションを追加
  const nameVariations = [
    baseQuest.name,
    baseQuest.name.replace('せよ', 'への挑戦'),
    baseQuest.name.replace('せよ', 'をマスターせよ'),
    baseQuest.name + ' - 上級編',
    baseQuest.name + ' - 実践編'
  ];
  
  const selectedName = nameVariations[Math.floor(Math.random() * nameVariations.length)];
  
  return {
    name: selectedName,
    description: baseQuest.description,
    rewards: [{
      status_name: selectedStatus,
      increase_value: Math.min(200, Math.max(30, rewardValue))
    }]
  };
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { userStatuses, difficulty = 'intermediate', category }: QuestGenerationRequest = await req.json();

    if (!userStatuses || userStatuses.length === 0) {
      return new Response(
        JSON.stringify({ error: "User statuses are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // カテゴリを選択（指定がない場合はランダム）
    const categories = Object.keys(questTemplates);
    const selectedCategory = category && categories.includes(category) 
      ? category 
      : categories[Math.floor(Math.random() * categories.length)];

    // 選択されたカテゴリからクエストをランダム選択
    const categoryQuests = questTemplates[selectedCategory as keyof typeof questTemplates];
    const selectedQuest = categoryQuests[Math.floor(Math.random() * categoryQuests.length)];

    // バリエーションを追加してクエストを生成
    const questData = addVariation(selectedQuest, userStatuses, difficulty);

    // 複数の報酬を追加する場合がある（20%の確率）
    if (Math.random() < 0.2 && userStatuses.length > 1) {
      const secondStatus = userStatuses.find(s => s !== questData.rewards[0].status_name);
      if (secondStatus) {
        questData.rewards.push({
          status_name: secondStatus,
          increase_value: Math.round(questData.rewards[0].increase_value * 0.6)
        });
      }
    }

    return new Response(
      JSON.stringify(questData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Quest generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate quest",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});