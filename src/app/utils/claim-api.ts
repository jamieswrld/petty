export const claimApiUrl = ( path: string ) => {
  const base = process.env.NEXT_PUBLIC_CLAIM_API_URL?.replace(/\/$/, '') ?? ''
  return `${base}${path}`
}
