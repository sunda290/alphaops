'use client'

export type WikiFolder = 'conversas' | 'propostas'

export type SaveResult =
  | { mode: 'fs' }
  | { mode: 'download'; folder: WikiFolder }

type FsPermissionMode = 'read' | 'readwrite'

interface FsPermissionDescriptor {
  mode: FsPermissionMode
}

interface DirHandleWithPerm extends FileSystemDirectoryHandle {
  queryPermission?: (opts: FsPermissionDescriptor) => Promise<PermissionState>
  requestPermission?: (opts: FsPermissionDescriptor) => Promise<PermissionState>
}

interface DirPickerOptions {
  mode?: FsPermissionMode
  id?: string
  startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos'
}

type WindowWithFsPicker = Window & {
  showDirectoryPicker?: (opts?: DirPickerOptions) => Promise<DirHandleWithPerm>
}

const DB_NAME = 'alphaops-wiki'
const DB_VERSION = 1
const STORE = 'handles'

function handleKey(folder: WikiFolder): string {
  return `wiki-handle-${folder}`
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function idbGet(key: string): Promise<DirHandleWithPerm | undefined> {
  return openDb().then(db => new Promise<DirHandleWithPerm | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result as DirHandleWithPerm | undefined)
    req.onerror = () => reject(req.error)
  }))
}

function idbSet(key: string, value: DirHandleWithPerm): Promise<void> {
  return openDb().then(db => new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  }))
}

function idbDelete(key: string): Promise<void> {
  return openDb().then(db => new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  }))
}

export function slugify(input: string): string {
  const base = (input || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || 'lead-sem-nome'
}

function hasFsPicker(): boolean {
  return typeof window !== 'undefined' && typeof (window as WindowWithFsPicker).showDirectoryPicker === 'function'
}

async function ensurePermission(handle: DirHandleWithPerm): Promise<boolean> {
  if (!handle.queryPermission || !handle.requestPermission) return true
  const current = await handle.queryPermission({ mode: 'readwrite' })
  if (current === 'granted') return true
  const next = await handle.requestPermission({ mode: 'readwrite' })
  return next === 'granted'
}

async function pickAndStore(folder: WikiFolder): Promise<DirHandleWithPerm> {
  const win = window as WindowWithFsPicker
  if (!win.showDirectoryPicker) throw new Error('FS Access API indisponível')
  const handle = await win.showDirectoryPicker({ mode: 'readwrite', id: `alphaops-wiki-${folder}`, startIn: 'documents' })
  await idbSet(handleKey(folder), handle)
  return handle
}

async function writeFile(handle: DirHandleWithPerm, filename: string, content: string): Promise<void> {
  const fileHandle = await handle.getFileHandle(filename, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()
}

function downloadFallback(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function saveToWikiFolder(
  folder: WikiFolder,
  filename: string,
  content: string,
): Promise<SaveResult> {
  if (!hasFsPicker()) {
    downloadFallback(filename, content)
    return { mode: 'download', folder }
  }

  try {
    let handle = await idbGet(handleKey(folder))
    if (handle) {
      const ok = await ensurePermission(handle)
      if (!ok) {
        await idbDelete(handleKey(folder))
        handle = undefined
      }
    }
    if (!handle) handle = await pickAndStore(folder)

    await writeFile(handle, filename, content)
    return { mode: 'fs' }
  } catch (err) {
    const aborted = err instanceof DOMException && (err.name === 'AbortError' || err.name === 'NotAllowedError')
    if (!aborted) console.error('[wiki-export] falha no FS, usando fallback:', err)
    downloadFallback(filename, content)
    return { mode: 'download', folder }
  }
}
