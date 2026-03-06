import { useState, useEffect } from 'react'
import { api } from '../api'
import { getSocket, joinSession } from '../socket'
import type { Game1Player } from '../types'

export function useGame1Players(sessionId: string) {
  const [players, setPlayers] = useState<Game1Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    api.get<Game1Player[]>(`/game1/players?session_id=${sessionId}`)
      .then(data => { setPlayers(data); setLoading(false) })
      .catch(() => setLoading(false))

    const socket = getSocket()
    joinSession(sessionId)

    const onAdded = (player: Game1Player) => {
      setPlayers(prev => [...prev, player])
    }
    const onUpdated = (player: Game1Player) => {
      setPlayers(prev => prev.map(p => p.id === player.id ? player : p))
    }

    socket.on('game1:player_added', onAdded)
    socket.on('game1:player_updated', onUpdated)

    return () => {
      socket.off('game1:player_added', onAdded)
      socket.off('game1:player_updated', onUpdated)
    }
  }, [sessionId])

  const available = players.filter(p => !p.is_winner)
  const winners = players.filter(p => p.is_winner)

  return { players, available, winners, loading, count: players.length }
}
