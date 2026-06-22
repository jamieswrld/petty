export type OnlinePlayer = {
  id: string
  username: string
  lastSeen: number
}

export type ChatMessage = {
  id: string
  username: string
  text: string
  sentAt: number
}

const PRESENCE_TTL_MS = 90_000
const MAX_MESSAGES = 150
const MAX_MESSAGE_LENGTH = 200

type LiveHub = {
  online: Map<string, OnlinePlayer>
  messages: ChatMessage[]
}

const getHub = (): LiveHub => {
  const g = globalThis as typeof globalThis & { __petanaLiveHub?: LiveHub }
  if (!g.__petanaLiveHub) {
    g.__petanaLiveHub = { online: new Map(), messages: [] }
  }
  return g.__petanaLiveHub
}

const prunePresence = ( hub: LiveHub ) => {
  const cutoff = Date.now() - PRESENCE_TTL_MS
  hub.online.forEach(( player, id ) => {
    if (player.lastSeen < cutoff) hub.online.delete(id)
  })
}

export const liveHub = {
  heartbeat( id: string, username: string ) {
    const hub = getHub()
    const name = username.trim().slice(0, 24) || 'Guest'
    hub.online.set(id, { id, username: name, lastSeen: Date.now() })
    prunePresence(hub)
  },

  leave( id: string ) {
    getHub().online.delete(id)
  },

  getPresence() {
    const hub = getHub()
    prunePresence(hub)
    const players = Array.from(hub.online.values()).sort(( a, b ) => a.username.localeCompare(b.username))
    return { count: players.length, players }
  },

  addMessage( username: string, text: string ): ChatMessage | null {
    const body = text.trim().slice(0, MAX_MESSAGE_LENGTH)
    if (!body) return null

    const hub = getHub()
    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: username.trim().slice(0, 24) || 'Guest',
      text: body,
      sentAt: Date.now(),
    }
    hub.messages.push(message)
    if (hub.messages.length > MAX_MESSAGES) {
      hub.messages = hub.messages.slice(-MAX_MESSAGES)
    }
    return message
  },

  getMessages( since = 0 ) {
    return getHub().messages.filter(( m ) => m.sentAt > since)
  },
}
