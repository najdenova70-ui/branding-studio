import type { BrandConfig } from '../brand/BrandConfig'

export type ProjectStatus = 'draft' | 'ready'

export interface ExportMetadata {
  lastExportedAt?: string
  schemaVersion: '1.0'
}

export interface BrandProject {
  id: string
  name: string
  templateId: string
  createdAt: string
  updatedAt: string
  brandConfig: BrandConfig
  projectStatus: ProjectStatus
  exportMetadata: ExportMetadata
}

export interface BrandProjectState {
  schemaVersion: '1.0'
  selectedProjectId: string
  projects: BrandProject[]
}
