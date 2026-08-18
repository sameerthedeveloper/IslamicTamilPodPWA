import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(dir, '../../public')

const icon = readFileSync(path.join(dir, 'icon.svg'))
const maskable = readFileSync(path.join(dir, 'maskable.svg'))

const targets = [
  { src: icon, size: 192, name: 'pwa-192.png' },
  { src: icon, size: 512, name: 'pwa-512.png' },
  { src: icon, size: 180, name: 'apple-touch-icon.png' },
  { src: maskable, size: 512, name: 'pwa-maskable-512.png' },
]

for (const { src, size, name } of targets) {
  await sharp(src).resize(size, size).png().toFile(path.join(outDir, name))
  console.log('wrote', name)
}
