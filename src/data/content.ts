import { z } from 'zod';
import rawQuestions from './questions.json' with { type: 'json' };
import rawSources from './sources.json' with { type: 'json' };
import rawThemes from './themes.json' with { type: 'json' };
import rawBadges from './badges.json' with { type: 'json' };
import { themeSchema, validateCorpus, type ThemeId } from '../domain/schema';

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
export const officialQuestions = questions.filter(
  (question) => question.type === 'QUESTION_OFFICIELLE',
);
export const situations = questions.filter((question) => question.type === 'EXERCICE_ENTRAINEMENT');
export const officialThemeTotals: Record<ThemeId, number> = {
  principes_valeurs: 37,
  institutions: 46,
  droits_devoirs: 30,
  histoire_culture: 47,
  vie_societe: 31,
};
export function getSource(id: string) {
  const source = sources.find((entry) => entry.id === id);
  if (!source) throw new Error(`Source inconnue : ${id}`);
  return source;
}
export function questionsForTheme(id: ThemeId) {
  return officialQuestions.filter((question) => question.theme === id);
}
