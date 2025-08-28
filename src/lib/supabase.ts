import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface Paragraph {
  id: string
  title: string
  content: string
  section: string
  order_index: number
  fill_blanks: FillBlank[]
  potential_qa: PotentialQA[]
  created_at: string
}

export interface FillBlank {
  text: string
  blank: string
  options: string[]
}

export interface PotentialQA {
  question: string
  answer: string
}

export interface UserProgress {
  id: string
  user_id: string
  paragraph_id: string
  mastery_level: number
  practice_count: number
  last_practiced: string
  training_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserParaphraseEvaluation {
  id: string
  user_id: string
  paragraph_id: string
  paraphrased_text: string
  evaluation_result: {
    score: number
    strengths: string[]
    improvements: string[]
    overall_feedback: string
    evaluation_type?: string
    accuracy_score?: number
    completeness_score?: number
    clarity_score?: number
    presentation_score?: number
    key_terms?: string[]
    presentation_tips?: string[]
  }
  score: number
  created_at: string
}