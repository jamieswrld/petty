'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import usePlayer from '@component/app/hooks/usePlayer'
import useLiveSession from '@component/app/hooks/useLiveSession'
import { playSound } from '@component/app/utils/sounds'

import styles from './live-social.module.scss'

type ChatMessage = {
  id: string
  username: string
  text: string
  sentAt: number
}

// Shown count stays around 10 (9–11) with a slow drift so it feels live.
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
  const lastMessageAt = useRef(0)
  const messagesEndRef = useRef<HTMLLIElement>(null)
  const username = player?.username?.trim() || 'Guest'

  const sendPresence = useCallback(async ( leave = false ) => {
    if (!sessionId) return
    try {
      await fetch('/api/live/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionId, username, leave }),
      })
    } catch {
      //ignored
    }
  }, [sessionId, username])

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/chat?since=${lastMessageAt.current}`)
      if (!res.ok) return
      const data = await res.json() as { messages: ChatMessage[] }
      if (data.messages.length === 0) return
      lastMessageAt.current = Math.max(...data.messages.map(( m ) => m.sentAt))
      setMessages(( prev ) => {
        const ids = new Set(prev.map(( m ) => m.id))
        const next = [...prev, ...data.messages.filter(( m ) => !ids.has(m.id))]
        return next.slice(-150)
      })
    } catch {
      //ignored
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return
    sendPresence()
    const id = setInterval(() => sendPresence(), 30_000)
    return () => {
      clearInterval(id)
      void fetch('/api/live/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionId, leave: true }),
      })
    }
  }, [sessionId, sendPresence])

  useEffect(() => {
    const refresh = () => setOnlineCount(displayOnlineCount())
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!chatOpen) return
    void fetchMessages()
    const id = setInterval(() => void fetchMessages(), 3_000)
    return () => clearInterval(id)
  }, [chatOpen, fetchMessages])

  useEffect(() => {
    if (chatOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
      const res = await fetch('/api/live/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, text }),
      })
      if (res.ok) {
        setDraft('')
        await fetchMessages()
      }
    } catch {
      //ignored
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

          <ul className={styles.messages}>
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
            />
            <button type='submit' disabled={sending || !draft.trim()}>Send</button>
          </form>
        </div>
      )}
    </>
  )
}
