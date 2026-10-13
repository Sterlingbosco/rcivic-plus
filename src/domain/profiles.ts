import type { Profile } from './schema';

export type ProfileInfo = {
  id: Profile;
  name: string;
  shortName: string;
  description: string;
  /** Mention de l'examen civique correspondante, telle que nommée par le ministère. */
  mention: string;
};

export const PROFILES: readonly ProfileInfo[] = [
  {
    id: 'CSP',
    name: 'Carte de séjour pluriannuelle',
    shortName: 'CSP',
    description: 'Première carte de séjour pluriannuelle.',
    mention: 'mention CSP',
  },
  {
    id: 'CR',
    name: 'Carte de résident',
    shortName: 'CR',
    description: 'Première carte de résident. Niveau de difficulté plus élevé que la CSP.',
    mention: 'mention CR',
  },
  {
    id: 'NAT',
    name: 'Naturalisation',
    shortName: 'Naturalisation',
    description: 'Demande de naturalisation française.',
    mention: 'mention naturalisation',
  },
];

export function profileInfo(id: Profile): ProfileInfo {
  return PROFILES.find((profile) => profile.id === id)!;
}
