export const isBrowser = () => typeof window !== 'undefined'

export const persistToStorage = ( key: string, value: string | null ) => {
  if (!isBrowser()) return
  if (value === null) localStorage.removeItem(key)
  else localStorage.setItem(key, value)
}
