import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cloneBrandConfig, type BrandConfig } from '../brand/BrandConfig'
import { createBrandProject, createInitialState, IndexedDbBrandProjectRepository, type BrandProjectRepository } from './BrandProjectRepository'
import type { BrandProject, BrandProjectState, ProjectStatus } from './types'

export type SaveState = 'saved' | 'saving' | 'error'

interface BrandProjectsValue {
  projects: BrandProject[]
  currentProject: BrandProject
  saveState: SaveState
  createProject(name: string): string
  selectProject(id: string): void
  renameProject(id: string, name: string): void
  duplicateProject(id: string): string | undefined
  deleteProject(id: string): void
  setProjectStatus(id: string, status: ProjectStatus): void
  markCurrentExported(): void
  updateCurrentBrandConfig(config: BrandConfig): void
}

const Ctx = createContext<BrandProjectsValue | null>(null)

function cloneProject(project: BrandProject, name: string): BrandProject {
  const next = createBrandProject(name)
  next.brandConfig = cloneBrandConfig(project.brandConfig)
  next.brandConfig.brandId = next.id
  next.brandConfig.displayName = name
  next.projectStatus = 'draft'
  return next
}

export function BrandProjectsProvider({ children, repository = new IndexedDbBrandProjectRepository() }: {
  children: ReactNode
  repository?: BrandProjectRepository
}) {
  const repo = useRef(repository)
  const [state, setState] = useState<BrandProjectState>(() => createInitialState())
  const [hydrated, setHydrated] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('saved')

  useEffect(() => {
    let active = true
    void repo.current.load().then((loaded) => { if (active) { setState(loaded); setHydrated(true) } })
      .catch(() => { if (active) { setSaveState('error'); setHydrated(true) } })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      void repo.current.save(state).then(() => setSaveState('saved')).catch(() => setSaveState('error'))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [hydrated, state])

  const updateProject = useCallback((id: string, mutate: (project: BrandProject) => BrandProject) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === id ? mutate(project) : project),
    }))
  }, [])

  const value = useMemo<BrandProjectsValue>(() => {
    const currentProject = state.projects.find((project) => project.id === state.selectedProjectId) ?? state.projects[0]
    return {
      projects: state.projects,
      currentProject,
      saveState,
      createProject(name) {
        const project = createBrandProject(name.trim() || 'Новый проект')
        setState((current) => ({ ...current, selectedProjectId: project.id, projects: [...current.projects, project] }))
        return project.id
      },
      selectProject(id) {
        if (state.projects.some((project) => project.id === id)) setState((current) => ({ ...current, selectedProjectId: id }))
      },
      renameProject(id, name) {
        const clean = name.trim().slice(0, 60)
        if (!clean) return
        updateProject(id, (project) => ({
          ...project,
          name: clean,
          updatedAt: new Date().toISOString(),
        }))
      },
      duplicateProject(id) {
        const source = state.projects.find((project) => project.id === id)
        if (!source) return undefined
        const duplicate = cloneProject(source, `${source.name} — копия`)
        setState((current) => ({ ...current, selectedProjectId: duplicate.id, projects: [...current.projects, duplicate] }))
        return duplicate.id
      },
      deleteProject(id) {
        if (state.projects.length < 2) return
        setState((current) => {
          const projects = current.projects.filter((project) => project.id !== id)
          return { ...current, projects, selectedProjectId: current.selectedProjectId === id ? projects[0].id : current.selectedProjectId }
        })
      },
      setProjectStatus(id, projectStatus) {
        updateProject(id, (project) => ({ ...project, projectStatus, updatedAt: new Date().toISOString() }))
      },
      markCurrentExported() {
        const timestamp = new Date().toISOString()
        updateProject(currentProject.id, (project) => ({ ...project, exportMetadata: { ...project.exportMetadata, lastExportedAt: timestamp } }))
      },
      updateCurrentBrandConfig(config) {
        updateProject(currentProject.id, (project) => ({ ...project, brandConfig: cloneBrandConfig(config), updatedAt: new Date().toISOString() }))
      },
    }
  }, [saveState, state, updateProject])

  if (!hydrated) return <div className="bs-load-state"><div className="bs-loader" /><p>Загрузка проектов…</p></div>
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useBrandProjects() {
  const value = useContext(Ctx)
  if (!value) throw new Error('useBrandProjects must be used inside <BrandProjectsProvider>')
  return value
}
