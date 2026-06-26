'use client'

import { useEffect, useState } from 'react'

const SESSION_KEY = 'petgotchi-live-session'

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const getLiveSessionId = (): string => {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = createSessionId()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export default function useLiveSession() {
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    setSessionId(getLiveSessionId())
  }, [])

  return sessionId
}
