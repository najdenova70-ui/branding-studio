import sprite from '../assets/drawer-icons/drawer-icons.svg'

export type DrawerIconName = 'dashboard' | 'programs' | 'tasks' | 'courses' | 'video' | 'tests' |
  'knowledge' | 'message' | 'results' | 'team' | 'rating' | 'events' | 'gift' | 'settings' | 'logout'

const spriteIndex: Partial<Record<DrawerIconName, number>> = {
  dashboard: 0, programs: 1, tasks: 2, courses: 3, video: 4, tests: 5, knowledge: 6,
  message: 7, results: 8, team: 9, rating: 10, events: 11, gift: 12, logout: 13,
}

export default function DrawerIcon({ name }: { name: DrawerIconName }) {
  if (name === 'settings') {
    return (
      <span className="bs-drawer-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.64 5.64l1.7 1.7M16.66 16.66l1.7 1.7M18.36 5.64l-1.7 1.7M7.34 16.66l-1.7 1.7" /></svg>
      </span>
    )
  }
  const index = spriteIndex[name]
  return (
    <span className="bs-drawer-icon" aria-hidden="true" style={{
      backgroundImage: `url(${sprite})`, backgroundSize: '1400% 100%',
      backgroundPosition: `${(index ?? 0) / 13 * 100}% 0`,
    }} />
  )
}
