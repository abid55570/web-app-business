/**
 * Minimal ZIP writer — store + deflate, no extra deps.
 *
 * Walks a directory recursively and emits a ZIP that any unzip tool can open.
 * Files are deflated; directories are skipped (most consumers reconstruct
 * paths from the file entries). Symbolic links and special files are not
 * supported — Phase 1 generated apps don't ship any.
 *
 * If the operator ever needs encryption, ZIP64, or symlinks, swap for
 * `archiver` or shell out to `zip`. Today's outputs are <5MB so a hand-rolled
 * writer is fine and keeps the dep graph clean.
 */
import { createReadStream } from 'node:fs'
import { readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import { createDeflateRaw } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import { Writable } from 'node:stream'
import { createHash } from 'node:crypto'

type Entry = {
  relPath: string
  compressedData: Buffer
  uncompressedSize: number
  crc32: number
  compressionMethod: 8 // deflate
  localHeaderOffset: number
}

const SIG_LOCAL = 0x04034b50
const SIG_CENTRAL = 0x02014b50
const SIG_END = 0x06054b50

export async function createZip(
  sourceDir: string,
  outputZipPath: string,
): Promise<{ files: number; bytes: number }> {
  const entries: Entry[] = []
  const files = await collectFiles(sourceDir, sourceDir)

  let cursor = 0
  const localChunks: Buffer[] = []

  for (const relPath of files) {
    const abs = path.join(sourceDir, relPath)
    const { compressed, crc32, uncompressedSize } = await readAndDeflate(abs)
    const nameBuf = Buffer.from(relPath.replace(/\\/g, '/'), 'utf-8')

    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(SIG_LOCAL, 0)
    localHeader.writeUInt16LE(20, 4) // version needed
    localHeader.writeUInt16LE(0x0800, 6) // bit 11 = UTF-8 names
    localHeader.writeUInt16LE(8, 8) // method: deflate
    localHeader.writeUInt16LE(0, 10) // file time
    localHeader.writeUInt16LE(0, 12) // file date
    localHeader.writeUInt32LE(crc32, 14)
    localHeader.writeUInt32LE(compressed.length, 18)
    localHeader.writeUInt32LE(uncompressedSize, 22)
    localHeader.writeUInt16LE(nameBuf.length, 26)
    localHeader.writeUInt16LE(0, 28) // extra length

    entries.push({
      relPath,
      compressedData: compressed,
      uncompressedSize,
      crc32,
      compressionMethod: 8,
      localHeaderOffset: cursor,
    })

    localChunks.push(localHeader, nameBuf, compressed)
    cursor += localHeader.length + nameBuf.length + compressed.length
  }

  const centralStart = cursor
  const centralChunks: Buffer[] = []
  for (const e of entries) {
    const nameBuf = Buffer.from(e.relPath.replace(/\\/g, '/'), 'utf-8')
    const cd = Buffer.alloc(46)
    cd.writeUInt32LE(SIG_CENTRAL, 0)
    cd.writeUInt16LE(20, 4) // version made by
    cd.writeUInt16LE(20, 6) // version needed
    cd.writeUInt16LE(0x0800, 8) // bit 11 = UTF-8
    cd.writeUInt16LE(8, 10) // method
    cd.writeUInt16LE(0, 12) // time
    cd.writeUInt16LE(0, 14) // date
    cd.writeUInt32LE(e.crc32, 16)
    cd.writeUInt32LE(e.compressedData.length, 20)
    cd.writeUInt32LE(e.uncompressedSize, 24)
    cd.writeUInt16LE(nameBuf.length, 28)
    cd.writeUInt16LE(0, 30) // extra
    cd.writeUInt16LE(0, 32) // comment
    cd.writeUInt16LE(0, 34) // disk #
    cd.writeUInt16LE(0, 36) // internal attr
    cd.writeUInt32LE(0, 38) // external attr
    cd.writeUInt32LE(e.localHeaderOffset, 42)

    centralChunks.push(cd, nameBuf)
    cursor += cd.length + nameBuf.length
  }
  const centralSize = cursor - centralStart

  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(SIG_END, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(entries.length, 8)
  eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(centralSize, 12)
  eocd.writeUInt32LE(centralStart, 16)
  eocd.writeUInt16LE(0, 20)

  const final = Buffer.concat([...localChunks, ...centralChunks, eocd])
  await writeFile(outputZipPath, final)
  return { files: entries.length, bytes: final.length }
}

async function collectFiles(
  baseDir: string,
  currentDir: string,
): Promise<string[]> {
  const out: string[] = []
  const entries = await readdir(currentDir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(currentDir, e.name)
    if (e.isDirectory()) {
      // Skip junk that shouldn't ship in a distributable.
      if (e.name === 'node_modules' || e.name === '__pycache__' || e.name === '.next') {
        continue
      }
      out.push(...(await collectFiles(baseDir, abs)))
    } else if (e.isFile()) {
      out.push(path.relative(baseDir, abs))
    }
  }
  return out
}

async function readAndDeflate(filePath: string): Promise<{
  compressed: Buffer
  crc32: number
  uncompressedSize: number
}> {
  const chunks: Buffer[] = []
  const collector = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk as Buffer)
      cb()
    },
  })
  // Read once to compute CRC32 + size, then again to deflate. For small
  // generated apps this double-pass is fine and avoids holding two streams.
  const stats = await stat(filePath)
  const crc = await computeCrc32(filePath)
  await pipeline(createReadStream(filePath), createDeflateRaw(), collector)
  return {
    compressed: Buffer.concat(chunks),
    crc32: crc,
    uncompressedSize: stats.size,
  }
}

// CRC32 lookup table (IEEE polynomial), built once at module load.
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }
  return table
})()

async function computeCrc32(filePath: string): Promise<number> {
  let crc = 0xffffffff
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath)
    stream.on('data', (chunk) => {
      const buf = chunk as Buffer
      for (let i = 0; i < buf.length; i++) {
        crc = (CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0
      }
    })
    stream.on('end', resolve)
    stream.on('error', reject)
  })
  return (crc ^ 0xffffffff) >>> 0
}

// Force `crypto` import to actually load (used elsewhere if we add SHA later).
void createHash
