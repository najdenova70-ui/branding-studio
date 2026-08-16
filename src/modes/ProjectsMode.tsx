import { useState } from 'react'
import { MOBILE_APP_DEFAULT_TEMPLATE } from '../projects/BrandTemplate'
import { useBrandProjects } from '../projects/BrandProjectsContext'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function ProjectsMode() {
  const { projects, currentProject, createProject, selectProject, renameProject, duplicateProject, deleteProject, setProjectStatus } = useBrandProjects()
  const [name, setName] = useState('')

  return (
    <div className="bs-projects">
      <div className="bs-page-head">
        <div><span>Brand Projects</span><h1>Сборки клиентов</h1><p>Один шаблон приложения, отдельные брендовые настройки и файлы для каждого клиента.</p></div>
        <form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; createProject(name); setName('') }}>
          <input className="bs-input" value={name} maxLength={60} placeholder="Название клиента" onChange={(event) => setName(event.target.value)} />
          <button className="bs-btn bs-btn--primary" disabled={!name.trim()}>Создать проект</button>
        </form>
      </div>
      <div className="bs-template-note"><strong>Шаблон:</strong> {MOBILE_APP_DEFAULT_TEMPLATE.name}<span>Экраны и product UI общие для всех проектов.</span></div>
      <div className="bs-project-grid">
        {projects.map((project) => (
          <article key={project.id} className={project.id === currentProject.id ? 'is-current' : ''}>
            <div className="bs-project-card__top"><span className="bs-project-avatar">{project.name.slice(0, 1).toUpperCase()}</span><span className={`bs-project-status is-${project.projectStatus}`}>{project.projectStatus === 'ready' ? 'Ready' : 'Draft'}</span></div>
            <h2>{project.name}</h2>
            <dl><div><dt>Последнее изменение</dt><dd>{formatDate(project.updatedAt)}</dd></div><div><dt>Статус</dt><dd>{project.projectStatus === 'ready' ? 'Ready' : 'Draft'}</dd></div></dl>
            <div className="bs-project-card__actions">
              <button className="bs-btn bs-btn--primary" onClick={() => selectProject(project.id)}>{project.id === currentProject.id ? 'Открыт' : 'Открыть'}</button>
              <button className="bs-btn" onClick={() => { const next = prompt('Новое название проекта', project.name); if (next) renameProject(project.id, next) }}>Переименовать</button>
              <button className="bs-btn" onClick={() => duplicateProject(project.id)}>Дублировать</button>
              <button className="bs-btn" onClick={() => setProjectStatus(project.id, project.projectStatus === 'ready' ? 'draft' : 'ready')}>{project.projectStatus === 'ready' ? 'В Draft' : 'В Ready'}</button>
              <button className="bs-link bs-link--danger" disabled={projects.length < 2} onClick={() => { if (confirm(`Удалить проект «${project.name}»? Это действие нельзя отменить.`)) deleteProject(project.id) }}>Удалить</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
