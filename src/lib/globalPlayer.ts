import { api } from './api'

const GLOBAL_PLAYER_KEY = 'houze_player'

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
]

export interface GlobalPlayer {
  full_name: string
  phone: string
  company: string
  cccd: string
}

export function getGlobalPlayer(): GlobalPlayer | null {
  try {
    const raw = localStorage.getItem(GLOBAL_PLAYER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as GlobalPlayer
  } catch {
    return null
  }
}

export function saveGlobalPlayer(player: GlobalPlayer) {
  localStorage.setItem(GLOBAL_PLAYER_KEY, JSON.stringify(player))
}

/**
 * After registering for one game, auto-register for all other active game sessions.
 * @param registeredGameType - the game type that was just registered (1 or 2)
 * @param registeredSessionId - the session that was just registered for (to skip)
 */
export async function crossRegisterAllGames(player: GlobalPlayer, _registeredGameType: number, registeredSessionId: string) {
  try {
    // Register for all active sessions of all game types (skip the one just registered)
    for (const gameType of [1, 2]) {
      try {
        const sessions = await api.get<any[]>(`/game-sessions?game_type=${gameType}`)
        if (!sessions) continue

        const activeSessions = sessions.filter(
          (s: any) => s.status === 'active' && s.id !== registeredSessionId
        )

        for (const session of activeSessions) {
          try {
            if (gameType === 1) {
              // Check if already registered
              const existingKey = `game1_player_${session.id}`
              if (localStorage.getItem(existingKey)) continue

              const data = await api.post('/game1/players', {
                session_id: session.id,
                full_name: player.full_name,
                cccd: player.cccd || '',
                phone: player.phone || '',
              })
              if (data) {
                localStorage.setItem(existingKey, JSON.stringify(data))
              }
            } else if (gameType === 2) {
              const existingKey = `game2_player_${session.id}`
              if (localStorage.getItem(existingKey)) continue

              const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
              const data = await api.post('/game2/players', {
                session_id: session.id,
                name: player.full_name,
                phone: player.phone || '',
                company: player.company || '',
                avatar_color: avatarColor,
              })
              if (data) {
                localStorage.setItem(existingKey, data.id)
              }
            }
          } catch {
            // Skip failed individual registrations silently
          }
        }
      } catch {
        // Skip if can't fetch sessions for this game type
      }
    }
  } catch {
    // Cross-registration is best-effort, don't block main flow
  }
}
