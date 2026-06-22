import { Pet } from '@component/app/types/pet'
import { formatThreshold, levelForEarned, rankForEarned } from '@component/app/shared-data/milestones'
import { logoPath, siteUrl } from '@component/app/shared-data/shared-data'
import { assetPath } from '@component/app/utils/asset-path'

type ShareInput = {
  pet: Pet
  username?: string
}

const loadImage = ( src: string ) =>
  new Promise<HTMLImageElement>(( resolve, reject ) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

export const composePetShareTweet = ( { pet, username }: ShareInput ) => {
  const totalEarned = pet.totalEarned ?? 0
  const rank = rankForEarned(totalEarned)
  const level = levelForEarned(totalEarned)
  const coins = formatThreshold(totalEarned)
  const trainer = username?.trim() || 'A grinder'

  return `${pet.name} is ${rank} rank on Petana! (Lv.${level})

${coins} coins earned · ${pet.alt} companion · trained by ${trainer}

Adopt your pixel pet → ${siteUrl}`
}

export const renderPetShareCard = async ( pet: Pet ) => {
  const totalEarned = pet.totalEarned ?? 0
  const rank = rankForEarned(totalEarned)
  const level = levelForEarned(totalEarned)
  const origin = typeof window !== 'undefined' ? window.location.origin : siteUrl

  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create share image')

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#7daffa')
  gradient.addColorStop(0.55, '#f4bda3')
  gradient.addColorStop(1, '#98D98E')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = '#4565e8'
  ctx.lineWidth = 6
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24)

  const [petImg, logoImg] = await Promise.all([
    loadImage(`${origin}${assetPath(pet.image)}`),
    loadImage(`${origin}${assetPath(logoPath)}`),
  ])

  ctx.imageSmoothingEnabled = false

  const logoSize = 44
  ctx.drawImage(logoImg, 28, 24, logoSize, logoSize)

  ctx.fillStyle = '#19162E'
  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  ctx.fillText(pet.name, canvas.width / 2, 52)

  ctx.font = '16px monospace'
  ctx.fillText(pet.alt, canvas.width / 2, 78)

  const petWidth = 240
  const petHeight = ( petImg.height / petImg.width ) * petWidth
  const petX = ( canvas.width - petWidth ) / 2
  const petY = 92
  ctx.drawImage(petImg, petX, petY, petWidth, petHeight)

  const badgeY = 318
  ctx.fillStyle = '#4565e8'
  ctx.beginPath()
  ctx.roundRect(150, badgeY, 300, 40, 10)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px monospace'
  ctx.fillText(`${rank} rank · Level ${level}`, canvas.width / 2, badgeY + 26)

  ctx.fillStyle = '#19162E'
  ctx.font = '15px monospace'
  ctx.fillText(`${formatThreshold(totalEarned)} coins earned`, canvas.width / 2, 378)

  ctx.font = '13px monospace'
  ctx.fillStyle = '#4565e8'
  ctx.fillText('playpetana.com', canvas.width / 2, 396)

  const blob = await new Promise<Blob>(( resolve, reject ) => {
    canvas.toBlob(( value ) => {
      if (value) resolve(value)
      else reject(new Error('Could not export share image'))
    }, 'image/png')
  })

  return blob
}

const downloadBlob = ( blob: Blob, filename: string ) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const sharePetOnX = async ( input: ShareInput ) => {
  const text = composePetShareTweet(input)
  const blob = await renderPetShareCard(input.pet)
  const filename = `petana-${input.pet.name.toLowerCase().replace(/\s+/g, '-')}.png`
  const file = new File([blob], filename, { type: 'image/png' })

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ text, files: [file] })
      return { mode: 'native' as const }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { mode: 'cancelled' as const }
      }
    }
  }

  downloadBlob(blob, filename)

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  window.open(tweetUrl, '_blank', 'noopener,noreferrer')

  return { mode: 'download' as const }
}
