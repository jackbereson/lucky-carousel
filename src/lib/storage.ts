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

// ===== Game 3: Prize Wheel =====

export interface Prize {
  id: string
  name: string
  color: string
}

export interface PrizeResult {
  id: string
  prize: Prize
  created_at: string
}

const PRIZES_KEY = 'lucky_wheel_prizes'
const PRIZE_RESULTS_KEY = 'lucky_wheel_prize_results'

const DEFAULT_PRIZES: Prize[] = [
  { id: '1', name: 'iPhone 16', color: '#E63946' },
  { id: '2', name: 'Voucher 500K', color: '#457B9D' },
  { id: '3', name: 'Ao thun', color: '#2A9D8F' },
  { id: '4', name: 'Balo', color: '#E9C46A' },
  { id: '5', name: 'Binh nuoc', color: '#F4A261' },
  { id: '6', name: 'Voucher 100K', color: '#264653' },
  { id: '7', name: 'Non', color: '#6A4C93' },
  { id: '8', name: 'Chuc ban may man', color: '#1982C4' },
]

export function getPrizes(): Prize[] {
  const data = localStorage.getItem(PRIZES_KEY)
  if (!data) return DEFAULT_PRIZES
  return JSON.parse(data)
}

export function savePrizes(prizes: Prize[]): void {
  localStorage.setItem(PRIZES_KEY, JSON.stringify(prizes))
}

export function getPrizeResults(): PrizeResult[] {
  const data = localStorage.getItem(PRIZE_RESULTS_KEY)
  return data ? JSON.parse(data) : []
}

export function addPrizeResult(prize: Prize): PrizeResult {
  const results = getPrizeResults()
  const result: PrizeResult = {
    id: crypto.randomUUID(),
    prize,
    created_at: new Date().toISOString(),
  }
  results.unshift(result)
  localStorage.setItem(PRIZE_RESULTS_KEY, JSON.stringify(results))
  return result
}

export function clearPrizes(): void {
  localStorage.removeItem(PRIZES_KEY)
}

export function clearPrizeResults(): void {
  localStorage.removeItem(PRIZE_RESULTS_KEY)
}
