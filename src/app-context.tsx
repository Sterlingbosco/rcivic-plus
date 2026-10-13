import { createContext, useContext } from 'react';
import { profileContent } from './data/content';
import type { Progress, Question, QuizMode } from './domain/schema';

export function navigate(path: string) {
  window.location.hash = `/${path}`;
}
export type AppState = {
  progress: Progress;
  saving: boolean;
  commit: (next: Progress) => Promise<void>;
  startSession: (pool: Question[], mode: QuizMode) => Promise<void>;
};
export const AppContext = createContext<AppState | null>(null);
export function useApp() {
  const state = useContext(AppContext);
  if (!state) throw new Error('Contexte RCIVIC+ absent.');
  return state;
}
/** Contenu du profil d'examen choisi (CSP, CR ou naturalisation). */
export function useProfile() {
  const { progress } = useApp();
  return profileContent(progress.preferences.profile);
}
