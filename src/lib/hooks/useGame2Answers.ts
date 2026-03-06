import { useState, useEffect } from 'react'
import { api } from '../api'
import { getSocket, joinSession } from '../socket'
import type { Game2Answer } from '../types'

export function useGame2Answers(sessionId: string, questionId: string | null) {
  const [answers, setAnswers] = useState<Game2Answer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId || !questionId) {
      setAnswers([])
      setLoading(false)
      return
    }

    api.get<Game2Answer[]>(`/game2/answers?question_id=${questionId}`)
      .then(data => { setAnswers(data); setLoading(false) })
      .catch(() => setLoading(false))

    const socket = getSocket()
    joinSession(sessionId)

    const onAdded = (answer: Game2Answer) => {
      if (answer.question_id === questionId) {
        setAnswers(prev => [...prev, answer])
      }
    }

    socket.on('game2:answer_added', onAdded)

    return () => {
      socket.off('game2:answer_added', onAdded)
    }
  }, [sessionId, questionId])

  return { answers, loading, count: answers.length }
}
