export interface GameSession {
  id: string
  game_type: number
  title: string
  status: 'active' | 'paused' | 'completed'
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  session_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'text'
  options: string[]
  correct_answer: string
  time_limit_seconds: number
  sort_order: number
  created_at: string
}

export type Game2Phase = 'waiting' | 'question_active' | 'question_closed' | 'show_results' | 'finished'

export interface Game2State {
  id: string
  session_id: string
  active_question_id: string | null
  phase: Game2Phase
  countdown_start: string | null
  countdown_duration: number
  updated_at: string
}

export interface Game1Player {
  id: string
  session_id: string
  full_name: string
  cccd: string
  phone: string
  is_winner: boolean
  created_at: string
}

export interface Game2Player {
  id: string
  session_id: string
  name: string
  phone: string
  avatar_color: string
  created_at: string
}

export interface Game2Answer {
  id: string
  session_id: string
  question_id: string
  player_id: string
  answer_text: string
  is_correct: boolean
  answered_at: string
  time_taken_ms: number
}
