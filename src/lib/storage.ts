export interface Participant {
  id: string
  full_name: string
  cccd: string
  phone?: string
}

export interface Winner {
  id: string
  participant: Participant
  created_at: string
}

const PARTICIPANTS_KEY = 'lucky_wheel_participants'
const WINNERS_KEY = 'lucky_wheel_winners'

export function getParticipants(): Participant[] {
  const data = localStorage.getItem(PARTICIPANTS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveParticipants(participants: Participant[]): void {
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants))
}

export function getWinners(): Winner[] {
  const data = localStorage.getItem(WINNERS_KEY)
  return data ? JSON.parse(data) : []
}

export function addWinner(participant: Participant): Winner {
  const winners = getWinners()
  const winner: Winner = {
    id: crypto.randomUUID(),
    participant,
    created_at: new Date().toISOString(),
  }
  winners.unshift(winner)
  localStorage.setItem(WINNERS_KEY, JSON.stringify(winners))
  return winner
}

export function clearAll(): void {
  localStorage.removeItem(PARTICIPANTS_KEY)
  localStorage.removeItem(WINNERS_KEY)
}

export function clearWinners(): void {
  localStorage.removeItem(WINNERS_KEY)
}

export function removeParticipant(id: string): void {
  const participants = getParticipants()
  saveParticipants(participants.filter(p => p.id !== id))
}
