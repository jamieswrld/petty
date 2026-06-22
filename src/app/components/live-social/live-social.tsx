'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import usePlayer from '@component/app/hooks/usePlayer'
import useLiveSession from '@component/app/hooks/useLiveSession'
import { playSound } from '@component/app/utils/sounds'
import { liveApiUrl } from '@component/app/utils/live-api'
import {
  fetchSupabaseMessages,
  fetchSupabasePresenceCount,
  heartbeatSupabasePresence,
  isSupabaseLiveEnabled,
  leaveSupabasePresence,
  sendSupabaseMessage,
  subscribeSupabaseMessages,
} from '@component/app/lib/live-chat-supabase'

import styles from './live-social.module.scss'

type ChatMessage = {
  id: string
  username: string
  text: string
  sentAt: number
}

const displayOnlineCount = () => {
  const slot = Math.floor(Date.now() / 300_000)
  return 9 + ( slot % 3 )
}

export default function LiveSocial() {
  const { player } = usePlayer()
  const sessionId = useLiveSession()
  const [onlineCount, setOnlineCount] = useState(10)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [chatMode, setChatMode] = useState<'supabase' | 'api' | 'offline'>('offline')
  const lastMessageAt = useRef(0)
  const messagesEndRef = useRef<HTMLLIElement>(null)
  const messagesListRef = useRef<HTMLUListElement>(null)
  const username = player?.username?.trim() || 'Guest'
  const useSupabase = isSupabaseLiveEnabled()

  const mergeMessages = useCallback(( incoming: ChatMessage[] ) => {
    if (incoming.length === 0) return
    lastMessageAt.current = Math.max(...incoming.map(( m ) => m.sentAt), lastMessageAt.current)
    setMessages(( prev ) => {
      const ids = new Set(prev.map(( m ) => m.id))
      const next = [...prev, ...incoming.filter(( m ) => !ids.has(m.id))]
      return next.slice(-150)
    })
  }, [])

  const sendPresenceApi = useCallback(async ( leave = false ) => {
    if (!sessionId) return
    try {
      await fetch(liveApiUrl('/api/live/presence'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionId, username, leave }),
      })
    } catch {
      //ignored
    }
  }, [sessionId, username])

  const fetchMessagesApi = useCallback(async () => {
    try {
      const res = await fetch(liveApiUrl(`/api/live/chat?since=${lastMessageAt.current}`))
      if (!res.ok) return
      const data = await res.json() as { messages: ChatMessage[] }
      mergeMessages(data.messages)
    } catch {
      //ignored
    }
  }, [mergeMessages])

  useEffect(() => {
    if (useSupabase) {
      setChatMode('supabase')
      return
    }
    fetch(liveApiUrl('/api/live/chat?since=0'))
      .then(( r ) => setChatMode(r.ok ? 'api' : 'offline'))
      .catch(() => setChatMode('offline'))
  }, [useSupabase])

  useEffect(() => {
    if (!sessionId || chatMode === 'offline') return

    if (chatMode === 'supabase') {
      void heartbeatSupabasePresence(sessionId, username)
      const id = setInterval(() => void heartbeatSupabasePresence(sessionId, username), 30_000)
      return () => {
        clearInterval(id)
        void leaveSupabasePresence(sessionId)
      }
    }

    sendPresenceApi()
    const id = setInterval(() => sendPresenceApi(), 30_000)
    return () => {
      clearInterval(id)
      void sendPresenceApi(true)
    }
  }, [sessionId, username, chatMode, sendPresenceApi])

  useEffect(() => {
    if (chatMode === 'supabase') {
      const refresh = async () => {
        const count = await fetchSupabasePresenceCount()
        if (count != null && count > 0) setOnlineCount(Math.max(count, 9))
        else setOnlineCount(displayOnlineCount())
      }
      void refresh()
      const id = setInterval(() => void refresh(), 60_000)
      return () => clearInterval(id)
    }

    const refresh = () => setOnlineCount(displayOnlineCount())
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [chatMode])

  useEffect(() => {
    if (!chatOpen || chatMode === 'offline') return

    if (chatMode === 'supabase') {
      void fetchSupabaseMessages(lastMessageAt.current).then(mergeMessages)
      const unsubscribe = subscribeSupabaseMessages(( message ) => mergeMessages([message]))
      return unsubscribe
    }

    void fetchMessagesApi()
    const id = setInterval(() => void fetchMessagesApi(), 3_000)
    return () => clearInterval(id)
  }, [chatOpen, chatMode, fetchMessagesApi, mergeMessages])

  useEffect(() => {
    if (!chatOpen) return
    const list = messagesListRef.current
    if (!list) return
    list.scrollTop = list.scrollHeight
  }, [messages, chatOpen])

  const toggleChat = () => {
    playSound('click')
    setChatOpen(( open ) => !open)
  }

  const sendMessage = async ( e: React.FormEvent ) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setSending(true)
    playSound('click')

    try {
      if (chatMode === 'supabase') {
        const message = await sendSupabaseMessage(username, text)
        if (message) mergeMessages([message])
        else throw new Error('Could not send message')
      } else if (chatMode === 'api') {
        const res = await fetch(liveApiUrl('/api/live/chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, text }),
        })
        if (!res.ok) throw new Error('Could not send message')
        await fetchMessagesApi()
      } else {
        throw new Error('Chat is offline')
      }
      setDraft('')
    } catch {
      // keep draft so user can retry
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className={styles.bar} aria-live='polite'>
        <div className={styles.online}>
          <span className={styles.dot} aria-hidden='true'/>
          <span>{onlineCount} online</span>
        </div>
        <button type='button' className={styles['chat--toggle']} onClick={toggleChat}>
          {chatOpen ? 'Close chat' : 'Live chat'}
        </button>
      </div>

      {chatOpen && (
        <div className={styles.panel} role='dialog' aria-label='Live chat'>
          <div className={styles['panel--header']}>
            <h3>Live chat</h3>
            <span className={styles['panel--online']}>{onlineCount} playing now</span>
          </div>

          {chatMode === 'offline' && (
            <p className={styles['chat--offline']}>
              Live chat syncs when Supabase or the game API is connected.
            </p>
          )}

          <ul className={styles.messages} ref={messagesListRef}>
            {messages.length === 0 ? (
              <li className={styles.empty}>Say hi to other grinders!</li>
            ) : (
              messages.map(( m ) => (
                <li key={m.id} className={styles.message}>
                  <strong>{m.username}</strong>
                  <span>{m.text}</span>
                </li>
              ))
            )}
            <li ref={messagesEndRef}/>
          </ul>

          <form className={styles.composer} onSubmit={sendMessage}>
            <input
              type='text'
              value={draft}
              onChange={( e ) => setDraft(e.target.value)}
              placeholder={username === 'Guest' ? 'Chat as Guest…' : `Chat as ${username}…`}
              maxLength={200}
              autoFocus
              disabled={chatMode === 'offline'}
            />
            <button type='submit' disabled={sending || !draft.trim() || chatMode === 'offline'}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
