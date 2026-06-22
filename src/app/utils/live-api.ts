export const liveApiUrl = ( path: string ) => {
  const base = process.env.NEXT_PUBLIC_LIVE_API_URL?.replace(/\/$/, '') ?? ''
  return `${base}${path}`
}

export const hasLiveApi = () =>
  Boolean(process.env.NEXT_PUBLIC_LIVE_API_URL) ||
  typeof window !== 'undefined'

export const hasSupabaseLive = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
