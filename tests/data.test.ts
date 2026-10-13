import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { questions, sources, themes } from '../src/data/content';
import { questionSchema, validateCorpus, progressSchema } from '../src/domain/schema';
import { createProgress } from '../src/domain/progress';

const THEMES = [
  'principes_valeurs',
  'institutions',
  'droits_devoirs',
  'histoire_culture',
  'vie_societe',
] as const;
// Ã‰noncÃ©s officiels publiÃ©s par profil et par thÃ¨me (PV / SI / DD / HC / VS) ; le reste est diffÃ©rÃ©.
const PUBLISHED = {
  CSP: [37, 46, 29, 43, 23],
  CR: [33, 48, 25, 38, 26],
  NAT: [27, 47, 21, 66, 40],
} as const;
// L'histoire existe sous deux préfixes (CSP-HG-… d'origine, CSP-HC-… ensuite) : seuls les ids doivent être uniques.
// L'histoire existe sous deux préfixes pour la CSP (CSP-HG-… d'origine, CSP-HC-… ensuite) : les ids
// restent opaques et seuls leur unicité et leur profil comptent (les badges lisent thème et profil).
const PREFIX = {
  principes_valeurs: ['PV'],
  institutions: ['SI'],
  droits_devoirs: ['DD'],
  histoire_culture: ['HC', 'HG'],
  vie_societe: ['VS'],
} as const;

it('valide tout le corpus, les IDs et les liens vers les sources', () => {
  expect(() => validateCorpus(questions, sources)).not.toThrow();
  expect(themes).toHaveLength(5);
  expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  for (const profile of ['CSP', 'CR', 'NAT'] as const) {
    const own = questions.filter((q) => q.level === profile);
    THEMES.forEach((theme, index) => {
      expect(
        own.filter((q) => q.type === 'QUESTION_OFFICIELLE' && q.theme === theme),
        `${profile} ${theme}`,
      ).toHaveLength(PUBLISHED[profile][index]!);
    });
    expect(
      own.filter((q) => q.type === 'EXERCICE_ENTRAINEMENT'),
      profile,
    ).toHaveLength(12);
    for (const q of own.filter((entry) => entry.type === 'QUESTION_OFFICIELLE')) {
      expect(
        PREFIX[q.theme].some((p) => q.id.startsWith(`${profile}-${p}-`)),
        q.id,
      ).toBe(true);
      expect(q.sourceId, q.id).toBe({ CSP: 'csp-list', CR: 'cr-list', NAT: 'nat-list' }[profile]);
    }
  }
  expect(questions.filter((q) => q.type === 'QUESTION_PEDAGOGIQUE')).toHaveLength(4);
  expect(
    questions.filter((q) => q.type === 'QUESTION_PEDAGOGIQUE' && q.sourceId !== null),
  ).toHaveLength(0);
  expect(questions.filter((q) => q.id === 'CSP-DD-002')).toHaveLength(0);
});

it('prÃ©serve les 191 Ã©noncÃ©s officiels et les 189 rÃ©ponses client', () => {
  const reference = JSON.parse(
    readFileSync(new URL('../data/reference-audit.json', import.meta.url), 'utf8'),
  ) as {
    officialQuestions: { question: string }[];
    clientContent: { answers: string[] }[];
  };
  expect(reference.officialQuestions).toHaveLength(191);
  expect(reference.clientContent.reduce((count, theme) => count + theme.answers.length, 0)).toBe(
    189,
  );
});

it('chaque Ã©noncÃ© officiel publiÃ© figure, Ã  lâ€™identique, dans la liste de son profil', () => {
  const audits = {
    CSP: ['reference-audit.json', 191],
    CR: ['reference-audit-cr.json', 209],
    NAT: ['reference-audit-nat.json', 244],
  } as const;
  const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
  for (const profile of ['CSP', 'CR', 'NAT'] as const) {
    const [file, total] = audits[profile];
    const reference = JSON.parse(
      readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'),
    ) as { officialQuestions: { question: string }[] };
    expect(reference.officialQuestions, profile).toHaveLength(total);
    const listed = new Set(reference.officialQuestions.map((entry) => normalize(entry.question)));
    const published = questions.filter(
      (q) => q.level === profile && q.type === 'QUESTION_OFFICIELLE',
    );
    for (const q of published) expect(listed.has(normalize(q.question)), q.id).toBe(true);
    expect(new Set(published.map((q) => normalize(q.question))).size, profile).toBe(
      published.length,
    );
  }
});

it('refuse ID dupliquÃ©, choix identiques, source manquante, question vide et mauvaise rÃ©ponse', () => {
  const q = questions[0]!;
  expect(() => validateCorpus([q, q], sources)).toThrow();
  expect(() => validateCorpus([{ ...q, sourceId: 'inconnue' }], sources)).toThrow();
  expect(questionSchema.safeParse({ ...q, question: '' }).success).toBe(false);
  expect(questionSchema.safeParse({ ...q, correctAnswer: 4 }).success).toBe(false);
  expect(questionSchema.safeParse({ ...q, answers: ['a', 'a', 'b', 'c'] }).success).toBe(false);
  expect(questionSchema.safeParse({ ...q, sourceId: null }).success).toBe(false);
});

it('valide la progression et refuse une sauvegarde corrompue', () => {
  expect(progressSchema.safeParse(createProgress()).success).toBe(true);
  expect(progressSchema.safeParse({ ...createProgress(), xp: -10 }).success).toBe(false);
});
