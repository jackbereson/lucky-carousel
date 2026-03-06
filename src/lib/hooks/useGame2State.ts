import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../api'
import { getSocket, joinSession } from '../socket'
import type { Game2State, Question } from '../types'

export function useGame2State(sessionId: string) {
  const [state, setState] = useState<Game2State | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const stateRef = useRef<Game2State | null>(null)

  useEffect(() => {
    if (!sessionId) return

    async function fetchAll() {
      try {
        const [stateData, questionsData] = await Promise.all([
          api.get<Game2State>(`/game2/state/${sessionId}`),
          api.get<Question[]>(`/game2/questions?session_id=${sessionId}`),
        ])
        if (stateData) { stateRef.current = stateData; setState(stateData) }
        if (questionsData) setQuestions(questionsData)
      } catch (e) { console.error(e) }
      setLoading(false)
    }

    fetchAll()

    const socket = getSocket()
    joinSession(sessionId)

    const onStateUpdated = (newState: Game2State) => {
      stateRef.current = newState
      setState(newState)
    }

    const onQuestionChanged = () => {
      api.get<Question[]>(`/game2/questions?session_id=${sessionId}`)
        .then(data => { if (data) setQuestions(data) })
    }

    socket.on('game2:state_updated', onStateUpdated)
    socket.on('game2:question_changed', onQuestionChanged)
    socket.on('game2:question_deleted', onQuestionChanged)

    // Polling fallback every 2s
    const poll = setInterval(async () => {
      try {
        const data = await api.get<Game2State>(`/game2/state/${sessionId}`)
        if (data && (!stateRef.current || data.updated_at !== stateRef.current.updated_at)) {
          stateRef.current = data
          setState(data)
        }
      } catch { /* ignore */ }
    }, 2000)

    return () => {
      socket.off('game2:state_updated', onStateUpdated)
      socket.off('game2:question_changed', onQuestionChanged)
      socket.off('game2:question_deleted', onQuestionChanged)
      clearInterval(poll)
    }
  }, [sessionId])

  const refetchQuestions = useCallback(() => {
    if (!sessionId) return
    api.get<Question[]>(`/game2/questions?session_id=${sessionId}`)
      .then(data => { if (data) setQuestions(data) })
  }, [sessionId])

  return { state, questions, loading, refetchQuestions }
}
