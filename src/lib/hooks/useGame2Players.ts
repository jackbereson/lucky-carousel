import { useState, useEffect } from 'react'
import { api } from '../api'
import { getSocket, joinSession } from '../socket'
import type { Game2Player } from '../types'

export function useGame2Players(sessionId: string) {
  const [players, setPlayers] = useState<Game2Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    api.get<Game2Player[]>(`/game2/players?session_id=${sessionId}`)
      .then(data => { setPlayers(data); setLoading(false) })
      .catch(() => setLoading(false))

    const socket = getSocket()
    joinSession(sessionId)

    const onAdded = (player: Game2Player) => {
      setPlayers(prev => [...prev, player])
    }

    socket.on('game2:player_added', onAdded)

    return () => {
      socket.off('game2:player_added', onAdded)
    }
  }, [sessionId])

  return { players, loading, count: players.length }
}
