import fs from 'fs'

const info = fs.readFileSync('public/buttons/info-btn.svg', 'utf8')

const cols = [20.7378, 30.6558, 41.4753, 51.3936, 62.2131, 72.1311, 82.0491, 92.8689, 102.787, 113.606, 123.525, 134.344, 144.262]
const rows = [20.7377, 30.6557, 41.4755, 51.3935, 62.2131, 72.131, 82.0492, 92.8688, 102.787, 113.607, 123.525, 134.344, 144.262]

const cellPath = ( c, r, fill ) => {
  const x1 = cols[c]
  const x2 = cols[c + 1]
  const y1 = rows[r]
  const y2 = rows[r + 1]
  return `<path d="M${x1} ${y1}H${x2}V${y2}H${x1}Z" fill="${fill}"/>`
}

// Bold pixel X — 2px-wide arms, centered on the button face
const xCells = new Set([
  // top-left arm
  '4,4', '5,4', '5,5', '6,5', '6,6', '7,6', '7,7', '8,7', '8,8', '9,8', '9,9', '10,9', '10,10',
  // top-right arm
  '10,4', '9,4', '9,5', '8,5', '8,6', '7,6', '6,8', '5,8', '5,9', '4,9', '4,10',
])

const xCellList = [...xCells].map(( key ) => key.split(',').map(Number))

// Remove old icon pixels, restore pink under the question mark, then draw the X
let svg = info.replace(/<path d="([^"]+)" fill="#FFFCFE"\/>/g, ( _, d ) => {
  return `<path d="${d}" fill="#F1485D"/>`
})

const xPaths = xCellList.map(([c, r]) => cellPath(c, r, '#FFFCFE')).join('\n')
svg = svg.replace('</svg>', `${xPaths}\n</svg>`)

fs.writeFileSync('public/buttons/x-btn.svg', svg)
console.log('x-btn.svg written with', xCellList.length, 'X pixels')
