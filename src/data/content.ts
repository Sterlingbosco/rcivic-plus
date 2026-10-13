import { z } from 'zod';
import rawQuestions from './questions.json' with { type: 'json' };
import rawSources from './sources.json' with { type: 'json' };
import rawThemes from './themes.json' with { type: 'json' };
import rawBadges from './badges.json' with { type: 'json' };
import { themeSchema, validateCorpus, type Profile, type ThemeId } from '../domain/schema';

export const { questions, sources } = validateCorpus(rawQuestions, rawSources);
export const themes = z
  .array(
    z
      .object({
        id: themeSchema,
        name: z.string(),
        shortName: z.string(),
        description: z.string(),
        icon: z.string(),
        tone: z.string(),
        unit: z.string(),
        duration: z.number().positive(),
      })
      .strict(),
  )
  .length(5)
  .parse(rawThemes);
export const badges = z
  .array(
    z
      .object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        icon: z.string(),
        tone: z.string(),
      })
      .strict(),
  )
  .parse(rawBadges);
/**
 * Nombre d'énoncés des listes officielles du ministère, par profil et par thème.
 * CSP : liste CSP (191, extraite dans data/reference-audit.json). CR : liste CR (209), extraite de
 * la page officielle le 2026-10-13 dans data/reference-audit-cr.json. NAT : liste PDF du ministère (244, dont 1 doublon exact
 * conservé), extraite dans data/reference-audit-nat.json.
 */
export const officialThemeTotals: Record<Profile, Record<ThemeId, number>> = {
  CSP: {
    principes_valeurs: 37,
    institutions: 46,
    droits_devoirs: 30,
    histoire_culture: 47,
    vie_societe: 31,
  },
  CR: {
    principes_valeurs: 40,
    institutions: 50,
    droits_devoirs: 38,
    histoire_culture: 49,
    vie_societe: 32,
  },
  NAT: {
    principes_valeurs: 35,
    institutions: 54,
    droits_devoirs: 36,
    histoire_culture: 76,
    vie_societe: 43,
  },
};
export function getSource(id: string) {
  const source = sources.find((entry) => entry.id === id);
  if (!source) throw new Error(`Source inconnue : ${id}`);
  return source;
}
/** Tout le contenu publié d'un profil : énoncés officiels, reformulations, situations d'entraînement. */
export function profileContent(profile: Profile) {
  const all = questions.filter((question) => question.level === profile);
  const official = all.filter((question) => question.type === 'QUESTION_OFFICIELLE');
  const pedagogical = all.filter((question) => question.type === 'QUESTION_PEDAGOGIQUE');
  const situations = all.filter((question) => question.type === 'EXERCICE_ENTRAINEMENT');
  const totals = officialThemeTotals[profile];
  return {
    profile,
    all,
    official,
    pedagogical,
    situations,
    totals,
    officialTotal: Object.values(totals).reduce((sum, total) => sum + total, 0),
    /** Énoncés officiels puis reformulations du thème (exclues de l'examen blanc). */
    forTheme: (id: ThemeId) =>
      [...official, ...pedagogical].filter((question) => question.theme === id),
  };
}
export type ProfileContent = ReturnType<typeof profileContent>;
