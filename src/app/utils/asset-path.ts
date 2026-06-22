/** Root-relative public asset path (required for GitHub Pages routes like /game/). */
export const assetPath = ( path: string ) => {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path
  }
  return `/${path.replace(/^\.\//, '')}`
}
