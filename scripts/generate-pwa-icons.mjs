import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'public/favicon.svg')
const svgBuffer = readFileSync(svgPath)

const icons = [
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
]

async function generate() {
  // Standard icons
  for (const { name, size } of icons) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(resolve(root, 'public', name))
    console.log(`  ✓ ${name}`)
  }

  // Maskable icon (add 20% padding on each side for safe area)
  const maskableSize = 512
  const innerSize = Math.round(maskableSize * 0.8)
  const padding = Math.round((maskableSize - innerSize) / 2)
  const innerPng = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: '#7c3aed',
    },
  })
    .composite([{ input: innerPng, left: padding, top: padding }])
    .png()
    .toFile(resolve(root, 'public', 'maskable-icon-512x512.png'))
  console.log('  ✓ maskable-icon-512x512.png')

  // favicon.ico — create a 48x48 PNG and save as .ico
  // Modern browsers accept PNG-in-ICO format
  const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer()

  // ICO file format: header + directory entry + PNG data
  const icoHeader = Buffer.alloc(6)
  icoHeader.writeUInt16LE(0, 0) // reserved
  icoHeader.writeUInt16LE(1, 2) // ICO type
  icoHeader.writeUInt16LE(1, 4) // 1 image

  const icoEntry = Buffer.alloc(16)
  icoEntry.writeUInt8(48, 0) // width
  icoEntry.writeUInt8(48, 1) // height
  icoEntry.writeUInt8(0, 2) // color palette
  icoEntry.writeUInt8(0, 3) // reserved
  icoEntry.writeUInt16LE(1, 4) // color planes
  icoEntry.writeUInt16LE(32, 6) // bits per pixel
  icoEntry.writeUInt32LE(ico48.length, 8) // image size
  icoEntry.writeUInt32LE(22, 12) // offset (6 header + 16 entry)

  const icoBuffer = Buffer.concat([icoHeader, icoEntry, ico48])
  writeFileSync(resolve(root, 'public', 'favicon.ico'), icoBuffer)
  console.log('  ✓ favicon.ico')

  console.log('\nAll PWA icons generated successfully!')
}

generate().catch(console.error)
