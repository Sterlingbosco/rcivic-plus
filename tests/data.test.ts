import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { questions, sources, themes } from '../src/data/content';
import { questionSchema, validateCorpus, progressSchema } from '../src/domain/schema';
import { createProgress } from '../src/domain/progress';

it('valide tout le corpus, les IDs et les liens vers les sources', () => {
  expect(() => validateCorpus(questions, sources)).not.toThrow();
  expect(themes).toHaveLength(5);
  expect(questions.filter((q) => q.type === 'QUESTION_OFFICIELLE')).toHaveLength(159);
  expect(questions.filter((q) => q.type === 'EXERCICE_ENTRAINEMENT')).toHaveLength(12);
  expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  for (const theme of ['principes_valeurs', 'histoire_culture', 'vie_societe']) {
    expect(
      questions.filter((q) => q.type === 'QUESTION_OFFICIELLE' && q.theme === theme).length,
    ).toBeGreaterThan(0);
  }
  expect(
    questions.filter((q) => q.type === 'QUESTION_OFFICIELLE' && q.theme === 'droits_devoirs'),
  ).toHaveLength(29);
  expect(
    questions.filter((q) => q.type === 'QUESTION_OFFICIELLE' && q.theme === 'principes_valeurs'),
  ).toHaveLength(37);
  expect(
    questions.filter((q) => q.type === 'QUESTION_OFFICIELLE' && q.theme === 'histoire_culture'),
  ).toHaveLength(27);
  expect(
    questions.filter((q) => q.type === 'QUESTION_OFFICIELLE' && q.theme === 'vie_societe'),
  ).toHaveLength(20);
  expect(
    questions.filter((q) => q.type === 'QUESTION_OFFICIELLE' && q.theme === 'institutions'),
  ).toHaveLength(46);
  expect(questions.filter((q) => q.id === 'CSP-DD-002')).toHaveLength(0);
});

it('préserve les 191 énoncés officiels et les 189 réponses client', () => {
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
  const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
  for (const q of questions.filter((entry) => entry.type === 'QUESTION_OFFICIELLE')) {
    expect(
      reference.officialQuestions.some(
        (entry) => normalize(entry.question) === normalize(q.question),
      ),
      q.id,
    ).toBe(true);
  }
});

it('refuse ID dupliqué, choix identiques, source manquante, question vide et mauvaise réponse', () => {
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
