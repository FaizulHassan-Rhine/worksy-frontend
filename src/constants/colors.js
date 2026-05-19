/** Multicolor card palette — default *-50, hover *-100 */
export const TILE_COLORS = {
  green: {
    tile: 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 dark:bg-green-950/60 dark:border-green-900 dark:hover:bg-green-950/80',
    icon: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
    title: 'text-green-950 dark:text-green-50',
    subtitle: 'text-green-800/90 dark:text-green-300/90',
    active: 'bg-green-600 text-white border-green-600 shadow-sm dark:bg-green-500 dark:border-green-500',
  },
  red: {
    tile: 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 dark:bg-red-950/60 dark:border-red-900 dark:hover:bg-red-950/80',
    icon: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
    title: 'text-red-950 dark:text-red-50',
    subtitle: 'text-red-800/90 dark:text-red-300/90',
    active: 'bg-red-600 text-white border-red-600 shadow-sm dark:bg-red-500 dark:border-red-500',
  },
  purple: {
    tile: 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300 dark:bg-purple-950/60 dark:border-purple-900 dark:hover:bg-purple-950/80',
    icon: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
    title: 'text-purple-950 dark:text-purple-50',
    subtitle: 'text-purple-800/90 dark:text-purple-300/90',
    active: 'bg-purple-600 text-white border-purple-600 shadow-sm dark:bg-purple-500 dark:border-purple-500',
  },
  blue: {
    tile: 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-950/60 dark:border-blue-900 dark:hover:bg-blue-950/80',
    icon: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    title: 'text-blue-950 dark:text-blue-50',
    subtitle: 'text-blue-800/90 dark:text-blue-300/90',
    active: 'bg-blue-600 text-white border-blue-600 shadow-sm dark:bg-blue-500 dark:border-blue-500',
  },
  amber: {
    tile: 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300 dark:bg-amber-950/60 dark:border-amber-900 dark:hover:bg-amber-950/80',
    icon: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    title: 'text-amber-950 dark:text-amber-50',
    subtitle: 'text-amber-800/90 dark:text-amber-300/90',
    active: 'bg-amber-600 text-white border-amber-600 shadow-sm dark:bg-amber-500 dark:border-amber-500',
  },
  pink: {
    tile: 'bg-pink-50 border-pink-200 hover:bg-pink-100 hover:border-pink-300 dark:bg-pink-950/60 dark:border-pink-900 dark:hover:bg-pink-950/80',
    icon: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
    title: 'text-pink-950 dark:text-pink-50',
    subtitle: 'text-pink-800/90 dark:text-pink-300/90',
    active: 'bg-pink-600 text-white border-pink-600 shadow-sm dark:bg-pink-500 dark:border-pink-500',
  },
  sky: {
    tile: 'bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-300 dark:bg-sky-950/60 dark:border-sky-900 dark:hover:bg-sky-950/80',
    icon: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200',
    title: 'text-sky-950 dark:text-sky-50',
    subtitle: 'text-sky-800/90 dark:text-sky-300/90',
    active: 'bg-sky-600 text-white border-sky-600 shadow-sm dark:bg-sky-500 dark:border-sky-500',
  },
};

export const NAV_COLORS = {
  dashboard: 'purple',
  daily: 'green',
  tasks: 'blue',
  projects: 'amber',
  notes: 'pink',
  files: 'sky',
  chat: 'green',
  team: 'red',
  settings: 'purple',
};

/** Sidebar: colored icons only — neutral row backgrounds */
export const NAV_ICON_STYLES = {
  green: 'text-green-600 dark:text-green-400',
  red: 'text-red-600 dark:text-red-400',
  purple: 'text-purple-600 dark:text-purple-400',
  blue: 'text-blue-600 dark:text-blue-400',
  amber: 'text-amber-600 dark:text-amber-400',
  pink: 'text-pink-600 dark:text-pink-400',
  sky: 'text-sky-600 dark:text-sky-400',
};

export const PROJECT_CARD_COLORS = ['green', 'blue', 'purple', 'red', 'amber', 'pink'];

export function getProjectCardColor(projectId) {
  if (!projectId) return 'blue';
  let hash = 0;
  const str = String(projectId);
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PROJECT_CARD_COLORS[Math.abs(hash) % PROJECT_CARD_COLORS.length];
}
