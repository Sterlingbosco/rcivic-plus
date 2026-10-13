export type ThemePreference = 'auto' | 'light' | 'dark';

const KEY = 'rcivic-theme';
const COLORS = { light: '#172554', dark: '#0d1424' } as const;

export function getThemePreference(): ThemePreference {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : 'auto';
  } catch {
    return 'auto';
  }
}

export function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === 'auto') delete root.dataset.theme;
  else root.dataset.theme = preference;
  const dark =
    preference === 'dark' ||
    (preference === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? COLORS.dark : COLORS.light);
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === 'auto') window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, preference);
  } catch {
    // Préférence d'affichage seulement : l'application reste utilisable sans stockage.
  }
  applyTheme(preference);
}
