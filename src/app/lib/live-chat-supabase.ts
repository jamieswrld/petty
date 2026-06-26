import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js'

export type LiveChatMessage = {
  id: string
  username: string
  text: string
  sentAt: number
}

type ChatRow = {
  id: string | number
  username: string
  text: string
  sent_at: string
}

// Tables are created via supabase/live-chat.sql; keep client untyped for static export builds.
type LiveChatClient = SupabaseClient

let client: LiveChatClient | null = null

const getClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  if (!client) client = createClient(url, key)
  return client
}

export const isSupabaseLiveEnabled = () => Boolean(getClient())

export async function fetchSupabaseMessages( since = 0 ): Promise<LiveChatMessage[]> {
  const supabase = getClient()
  if (!supabase) return []

  const sinceIso = new Date(since || 0).toISOString()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, username, text, sent_at')
    .gt('sent_at', sinceIso)
    .order('sent_at', { ascending: true })
    .limit(150)

  if (error || !data) return []

  const rows = data as ChatRow[]
  return rows.map(( row ) => ({
    id: String(row.id),
    username: row.username,
    text: row.text,
    sentAt: new Date(row.sent_at).getTime(),
  }))
}

export async function sendSupabaseMessage(
  username: string,
  text: string,
): Promise<LiveChatMessage | null> {
  const supabase = getClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ username, text })
    .select('id, username, text, sent_at')
    .single()

  if (error || !data) return null

  const row = data as ChatRow
  return {
    id: String(row.id),
    username: row.username,
    text: row.text,
    sentAt: new Date(row.sent_at).getTime(),
  }
}

export function subscribeSupabaseMessages(
  onMessage: ( message: LiveChatMessage ) => void,
): () => void {
  const supabase = getClient()
  if (!supabase) return () => undefined

  let channel: RealtimeChannel | null = null

  channel = supabase
    .channel('petgotchi-live-chat')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      ( payload ) => {
        const row = payload.new as ChatRow
        onMessage({
          id: String(row.id),
          username: row.username,
          text: row.text,
          sentAt: new Date(row.sent_at).getTime(),
        })
      },
    )
    .subscribe()

  return () => {
    if (channel) void supabase.removeChannel(channel)
  }
}

export async function fetchSupabasePresenceCount(): Promise<number | null> {
  const supabase = getClient()
  if (!supabase) return null

  const { count, error } = await supabase
    .from('chat_presence')
    .select('*', { count: 'exact', head: true })

  if (error) return null
  return count ?? 0
}

export async function heartbeatSupabasePresence(
  sessionId: string,
  username: string,
): Promise<void> {
  const supabase = getClient()
  if (!supabase) return

  await supabase.from('chat_presence').upsert({
    session_id: sessionId,
    username,
    last_seen: new Date().toISOString(),
  })
}

export async function leaveSupabasePresence( sessionId: string ): Promise<void> {
  const supabase = getClient()
  if (!supabase) return

  await supabase.from('chat_presence').delete().eq('session_id', sessionId)
}
