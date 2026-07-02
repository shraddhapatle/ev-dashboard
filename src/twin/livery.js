import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Procedural Delta / EESL charger livery painted onto a 2D canvas and used as a
// 3D texture. Gives the white body + blue diagonal stripe + branding + screen
// + status row + vents that make the twin read as the real EESL fast-charger.
// ---------------------------------------------------------------------------

const DELTA = '#0f8fcf'
const DELTA_DK = '#0c6fa6'
const INK = '#143049'
const WHITE = '#eceef0'

function texFromCanvas(canvas) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

function deltaMark(ctx, x, y, s, color = DELTA) {
  // simplified Delta triangle mark
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y + s)
  ctx.lineTo(x + s, y + s)
  ctx.lineTo(x + s * 0.5, y)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = WHITE
  ctx.beginPath()
  ctx.arc(x + s * 0.5, y + s * 0.62, s * 0.16, 0, Math.PI * 2)
  ctx.fill()
}

function ecoLeaf(ctx, cx, cy, r) {
  ctx.fillStyle = '#5fb24a'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#eafff0'
  ctx.beginPath()
  ctx.ellipse(cx, cy, r * 0.34, r * 0.62, Math.PI / 4, 0, Math.PI * 2)
  ctx.fill()
}

function carIcon(ctx, x, y, w) {
  const h = w * 0.42
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.beginPath()
  ctx.roundRect(x, y + h * 0.35, w, h * 0.4, 6)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + w * 0.2, y + h * 0.4)
  ctx.quadraticCurveTo(x + w * 0.35, y, x + w * 0.62, y + h * 0.05)
  ctx.lineTo(x + w * 0.78, y + h * 0.4)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = DELTA
  for (const cx of [x + w * 0.25, x + w * 0.75]) {
    ctx.beginPath()
    ctx.arc(cx, y + h * 0.78, h * 0.18, 0, Math.PI * 2)
    ctx.fill()
  }
}

function qrSticker(ctx, x, y, s) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, s, s)
  ctx.fillStyle = '#111'
  const n = 11
  const c = s / (n + 2)
  let seed = 7
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      if (rnd() > 0.55) ctx.fillRect(x + c * (i + 1), y + c * (j + 1), c, c)
    }
  // finder squares
  const fin = (fx, fy) => {
    ctx.fillStyle = '#111'
    ctx.fillRect(fx, fy, c * 3, c * 3)
    ctx.fillStyle = '#fff'
    ctx.fillRect(fx + c, fy + c, c, c)
  }
  fin(x + c, y + c)
  fin(x + s - c * 4, y + c)
  fin(x + c, y + s - c * 4)
}

export function makeFrontLivery() {
  const W = 540
  const H = 1120
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // body
  ctx.fillStyle = WHITE
  ctx.fillRect(0, 0, W, H)

  // blue diagonal (two-tone)
  const grad = ctx.createLinearGradient(W * 0.3, 0, W, H)
  grad.addColorStop(0, DELTA)
  grad.addColorStop(1, DELTA_DK)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(W * 0.52, 0)
  ctx.lineTo(W, 0)
  ctx.lineTo(W, H)
  ctx.lineTo(W * 0.14, H)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  ctx.beginPath()
  ctx.moveTo(W * 0.52, 0)
  ctx.lineTo(W * 0.62, 0)
  ctx.lineTo(W * 0.24, H)
  ctx.lineTo(W * 0.14, H)
  ctx.closePath()
  ctx.fill()

  // header band (white) with branding
  deltaMark(ctx, W * 0.08, H * 0.03, 46)
  ctx.fillStyle = DELTA
  ctx.font = 'bold 46px Arial'
  ctx.textBaseline = 'top'
  ctx.fillText('Delta', W * 0.2, H * 0.035)
  ecoLeaf(ctx, W * 0.86, H * 0.06, 30)

  // EESL block
  ctx.fillStyle = DELTA
  ctx.fillRect(W * 0.08, H * 0.105, 96, 34)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 24px Arial'
  ctx.fillText('EESL', W * 0.08 + 14, H * 0.105 + 5)
  ctx.fillStyle = INK
  ctx.font = '15px Arial'
  ctx.fillText('ENERGY EFFICIENCY SERVICES LIMITED', W * 0.08, H * 0.145)
  ctx.font = '12px Arial'
  ctx.fillText('A JV of PSUs under the Ministry of Power', W * 0.08, H * 0.162)

  // touchscreen frame (3D screen overlays this)
  ctx.fillStyle = '#1a1f22'
  ctx.beginPath()
  ctx.roundRect(W * 0.24, H * 0.2, W * 0.5, H * 0.16, 14)
  ctx.fill()

  // status light sockets (3D LEDs overlay)
  const lc = ['#1f6b2e', '#6b5a1f', '#6b5a1f', '#6b2020', '#6b2020']
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = lc[i]
    ctx.beginPath()
    ctx.arc(W * 0.3 + i * 28, H * 0.39, 11, 0, Math.PI * 2)
    ctx.fill()
  }

  // e-stop ring (3D mushroom overlays)
  ctx.fillStyle = '#e9c200'
  ctx.beginPath()
  ctx.arc(W * 0.2, H * 0.44, 34, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#c01616'
  ctx.beginPath()
  ctx.arc(W * 0.2, H * 0.44, 24, 0, Math.PI * 2)
  ctx.fill()

  // QR sticker
  qrSticker(ctx, W * 0.6, H * 0.385, 92)

  // card reader slot
  ctx.fillStyle = '#15191b'
  ctx.beginPath()
  ctx.roundRect(W * 0.16, H * 0.5, 34, 90, 6)
  ctx.fill()

  // car icon on blue
  carIcon(ctx, W * 0.18, H * 0.55, 150)

  // tagline
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 30px Arial'
  ctx.fillText('Smarter,', W * 0.52, H * 0.66)
  ctx.fillText('Greener,', W * 0.52, H * 0.695)
  ctx.fillText('Together', W * 0.52, H * 0.73)

  // ventilation grille (bottom)
  ctx.fillStyle = '#cfd3d6'
  ctx.fillRect(W * 0.08, H * 0.84, W * 0.42, H * 0.1)
  ctx.strokeStyle = '#9aa0a4'
  ctx.lineWidth = 3
  for (let i = 0; i < 9; i++) {
    const yy = H * 0.85 + i * (H * 0.08) / 9
    ctx.beginPath()
    ctx.moveTo(W * 0.09, yy)
    ctx.lineTo(W * 0.49, yy)
    ctx.stroke()
  }

  // EESL plinth strip
  ctx.fillStyle = DELTA
  ctx.fillRect(0, H * 0.955, W, H * 0.045)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 22px Arial'
  ctx.fillText('EESL', W * 0.06, H * 0.963)

  return texFromCanvas(canvas)
}

export function makeSideLivery() {
  const W = 480
  const H = 1120
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = WHITE
  ctx.fillRect(0, 0, W, H)
  // blue diagonal corner
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, DELTA)
  grad.addColorStop(1, DELTA_DK)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(W * 0.55, 0)
  ctx.lineTo(W, 0)
  ctx.lineTo(W, H)
  ctx.lineTo(W * 0.2, H)
  ctx.closePath()
  ctx.fill()
  deltaMark(ctx, W * 0.1, H * 0.04, 40)
  ctx.fillStyle = DELTA
  ctx.font = 'bold 40px Arial'
  ctx.textBaseline = 'top'
  ctx.fillText('Delta', W * 0.22, H * 0.045)
  // bottom vent
  ctx.strokeStyle = '#9aa0a4'
  ctx.lineWidth = 3
  for (let i = 0; i < 9; i++) {
    const yy = H * 0.86 + i * (H * 0.09) / 9
    ctx.beginPath()
    ctx.moveTo(W * 0.1, yy)
    ctx.lineTo(W * 0.45, yy)
    ctx.stroke()
  }
  return texFromCanvas(canvas)
}

// Small green PCB texture for rectifier faces / control kernel.
export function makePcbTexture() {
  const W = 256
  const H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0f7a45'
  ctx.fillRect(0, 0, W, H)
  // traces
  ctx.strokeStyle = '#1aa05c'
  ctx.lineWidth = 2
  let s = 11
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < 26; i++) {
    ctx.beginPath()
    ctx.moveTo(rnd() * W, rnd() * H)
    ctx.lineTo(rnd() * W, rnd() * H)
    ctx.stroke()
  }
  // chips
  ctx.fillStyle = '#111'
  for (let i = 0; i < 7; i++) {
    const x = rnd() * W * 0.8
    const y = rnd() * H * 0.8
    ctx.fillRect(x, y, 26 + rnd() * 30, 18 + rnd() * 22)
  }
  // gold pads
  ctx.fillStyle = '#d8b14a'
  for (let i = 0; i < W; i += 10) ctx.fillRect(i + 2, H - 14, 5, 12)
  return texFromCanvas(canvas)
}
