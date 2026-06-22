'use client'

import { useEffect, useState } from 'react'

const SESSION_KEY = 'petana-live-session'

export const getLiveSessionId = (): string => {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
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
