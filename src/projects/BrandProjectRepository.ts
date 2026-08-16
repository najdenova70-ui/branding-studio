import { cloneBrandConfig, DEFAULT_BRAND_CONFIG } from '../brand/BrandConfig'
import type { BrandProject, BrandProjectState } from './types'
import { MOBILE_APP_DEFAULT_TEMPLATE } from './BrandTemplate'

export interface BrandProjectRepository {
  load(): Promise<BrandProjectState>
  save(state: BrandProjectState): Promise<void>
}

export const BRAND_PROJECTS_STORAGE_KEY = 'branding-studio.projects.v1'

function now() {
  return new Date().toISOString()
}

function projectId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createBrandProject(name: string): BrandProject {
  const id = projectId()
  const timestamp = now()
  return {
    id,
    name,
    templateId: MOBILE_APP_DEFAULT_TEMPLATE.id,
    createdAt: timestamp,
    updatedAt: timestamp,
    brandConfig: MOBILE_APP_DEFAULT_TEMPLATE.createBrandConfig(id, name),
    projectStatus: 'draft',
    exportMetadata: { schemaVersion: '1.0' },
  }
}

export function createInitialState(): BrandProjectState {
  const timestamp = now()
  const brandConfig = cloneBrandConfig(DEFAULT_BRAND_CONFIG)
  const project: BrandProject = {
    id: 'ekvio-default',
    name: 'Эквио',
    templateId: MOBILE_APP_DEFAULT_TEMPLATE.id,
    createdAt: timestamp,
    updatedAt: timestamp,
    brandConfig,
    projectStatus: 'ready',
    exportMetadata: { schemaVersion: '1.0' },
  }
  return { schemaVersion: '1.0', selectedProjectId: project.id, projects: [project] }
}

function isState(value: unknown): value is BrandProjectState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<BrandProjectState>
  return state.schemaVersion === '1.0' && typeof state.selectedProjectId === 'string' && Array.isArray(state.projects) && state.projects.length > 0
}

function normalizeState(state: BrandProjectState): BrandProjectState {
  return {
    ...state,
    projects: state.projects.map((project) => ({
      ...project,
      brandConfig: cloneBrandConfig(project.brandConfig),
    })),
  }
}

export class LocalStorageBrandProjectRepository implements BrandProjectRepository {
  async load(): Promise<BrandProjectState> {
    try {
      const raw = localStorage.getItem(BRAND_PROJECTS_STORAGE_KEY)
      if (!raw) return createInitialState()
      const parsed: unknown = JSON.parse(raw)
      return isState(parsed) ? normalizeState(parsed) : createInitialState()
    } catch {
      return createInitialState()
    }
  }

  async save(state: BrandProjectState) {
    localStorage.setItem(BRAND_PROJECTS_STORAGE_KEY, JSON.stringify(state))
  }
}

const DB_NAME = 'branding-studio'
const DB_STORE = 'state'
const DB_KEY = 'brand-projects'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB is unavailable.'))
  })
}

/** IndexedDB is the primary store because uploaded PNGs can exceed localStorage quotas. */
export class IndexedDbBrandProjectRepository implements BrandProjectRepository {
  private readonly fallback = new LocalStorageBrandProjectRepository()

  async load(): Promise<BrandProjectState> {
    if (typeof indexedDB === 'undefined') return this.fallback.load()
    try {
      const database = await openDatabase()
      const stored = await new Promise<unknown>((resolve, reject) => {
        const request = database.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(DB_KEY)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      database.close()
      if (isState(stored)) return normalizeState(stored)
      const migrated = await this.fallback.load()
      await this.save(migrated)
      localStorage.removeItem(BRAND_PROJECTS_STORAGE_KEY)
      return migrated
    } catch {
      return this.fallback.load()
    }
  }

  async save(state: BrandProjectState): Promise<void> {
    if (typeof indexedDB === 'undefined') return this.fallback.save(state)
    const database = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(DB_STORE, 'readwrite')
      transaction.objectStore(DB_STORE).put(state, DB_KEY)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error('Не удалось сохранить проект.'))
      transaction.onabort = () => reject(transaction.error ?? new Error('Сохранение проекта отменено.'))
    })
    database.close()
  }
}
