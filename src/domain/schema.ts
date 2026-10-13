import { z } from 'zod';

export const themeSchema = z.enum([
  'principes_valeurs',
  'institutions',
  'droits_devoirs',
  'histoire_culture',
  'vie_societe',
]);
/** Profil d'examen civique : mention du ministère (CSP, CR) ou naturalisation. */
export const profileSchema = z.enum(['CSP', 'CR', 'NAT']);
const text = z.string().trim().min(1).max(4000);
const instant = z.string().datetime();
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  });
export const sourceSchema = z
  .object({
    id: text,
    organization: text,
    title: text,
    url: z
      .string()
      .url()
      .refine((url) => url.startsWith('https://')),
    checkedAt: day,
    updatedAt: day.nullable(),
    license: text,
    type: z.literal('institutional'),
  })
  .strict();
export const questionSchema = z
  .object({
    id: text,
    level: profileSchema,
    theme: themeSchema,
    subtheme: text,
    type: z.enum(['QUESTION_OFFICIELLE', 'QUESTION_PEDAGOGIQUE', 'EXERCICE_ENTRAINEMENT']),
    question: text,
    answers: z.tuple([text, text, text, text]),
    correctAnswer: z.number().int().min(0).max(3),
    correctAnswers: z.array(z.number().int().min(0).max(3)).min(2).max(3).optional(),
    explanation: text,
    keyPoint: text,
    sourceId: text.nullable(),
    answerSourceId: text,
    extraSourceIds: z.array(text).min(1).optional(),
    explanationType: z.literal('CONTENU_PEDAGOGIQUE'),
    choicesType: z.literal('EXERCICE_ENTRAINEMENT'),
    status: z.literal('source_checked'),
    humanReviewed: z.boolean(),
  })
  .strict()
  .superRefine((question, context) => {
    if (new Set(question.answers.map((answer) => answer.toLocaleLowerCase('fr'))).size !== 4) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Les quatre choix doivent être distincts.',
      });
    }
    if (question.type === 'QUESTION_OFFICIELLE' && !question.sourceId) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Source officielle obligatoire.' });
    }
    if (question.type !== 'QUESTION_OFFICIELLE' && question.sourceId !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Un exercice ou une reformulation ne doit pas avoir de source d’énoncé officiel.',
      });
    }
    if (question.correctAnswers) {
      const unique = new Set(question.correctAnswers);
      if (
        unique.size !== question.correctAnswers.length ||
        question.correctAnswer !== Math.min(...question.correctAnswers)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Réponses multiples incohérentes : indices distincts, correctAnswer = le plus petit.',
        });
      }
    }
  });
export const questionStatsSchema = z
  .object({
    attempts: z.number().int().nonnegative(),
    correct: z.number().int().nonnegative(),
    incorrect: z.number().int().nonnegative(),
    consecutiveCorrect: z.number().int().nonnegative(),
    mastery: z.number().min(0).max(1),
    lastCorrect: z.boolean(),
    lastAttempt: instant,
    nextReview: instant,
  })
  .strict()
  .refine(
    (stats) =>
      stats.attempts === stats.correct + stats.incorrect &&
      stats.consecutiveCorrect <= stats.correct,
  );
export const sessionSchema = z
  .object({
    id: text,
    mode: z.enum(['training', 'review', 'exam']),
    questions: z.array(questionSchema).min(1).max(100),
    index: z.number().int().nonnegative(),
    answers: z.array(z.number().int().min(0).max(15).nullable()),
    startedAt: instant,
    deadline: instant.nullable(),
    finishedAt: instant.nullable(),
    xpAtStart: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((session, context) => {
    if (
      session.index >= session.questions.length ||
      session.answers.length !== session.questions.length ||
      new Set(session.questions.map((q) => q.id)).size !== session.questions.length
    ) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Session incohérente.' });
    }
    if (session.mode === 'exam' && !session.deadline) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Échéance d’examen obligatoire.' });
    }
  });
export const historySchema = z
  .object({
    id: text,
    mode: z.enum(['training', 'review', 'exam']),
    score: z.number().int().nonnegative(),
    total: z.number().int().positive(),
    finishedAt: instant,
    profile: profileSchema.default('CSP'),
  })
  .strict()
  .refine((entry) => entry.score <= entry.total);
const examSummarySchema = z
  .object({
    count: z.number().int().nonnegative(),
    totalScore: z.number().int().nonnegative(),
    bestScore: z.number().int().min(0).max(40),
  })
  .strict();
export const progressSchema = z
  .object({
    version: z.literal(1),
    xp: z.number().int().nonnegative(),
    understood: z.array(text),
    rewardedEvents: z.array(text),
    activityDays: z.array(day),
    questionStats: z.record(questionStatsSchema),
    history: z.array(historySchema).max(50),
    earnedBadges: z.array(text).default([]),
    // Ancien format (avant les profils) : un seul résumé, qui concernait le profil CSP.
    examSummary: z.preprocess(
      (value) => (value && typeof value === 'object' && 'count' in value ? { CSP: value } : value),
      z.record(profileSchema, examSummarySchema).default({}),
    ),
    preferences: z
      .object({
        dailyGoal: z.union([z.literal(5), z.literal(10), z.literal(20), z.literal(30)]),
        audioRate: z.union([z.literal(0.8), z.literal(1), z.literal(1.2)]),
        onboarded: z.boolean(),
        profile: profileSchema.default('CSP'),
      })
      .strict(),
    activeSession: sessionSchema.nullable(),
  })
  .strict();
export type ThemeId = z.infer<typeof themeSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ExamSummary = z.infer<typeof examSummarySchema>;
export type Question = z.infer<typeof questionSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type QuestionStats = z.infer<typeof questionStatsSchema>;
export type QuizSession = z.infer<typeof sessionSchema>;
export type QuizMode = QuizSession['mode'];
export type Progress = z.infer<typeof progressSchema>;

export function validateCorpus(rawQuestions: unknown, rawSources: unknown) {
  const sources = z.array(sourceSchema).min(1).parse(rawSources);
  const questions = z.array(questionSchema).min(1).parse(rawQuestions);
  const sourceIds = new Set(sources.map((source) => source.id));
  if (
    sourceIds.size !== sources.length ||
    new Set(questions.map((question) => question.id)).size !== questions.length
  ) {
    throw new Error('Identifiants dupliqués dans le corpus.');
  }
  for (const question of questions) {
    if (
      !sourceIds.has(question.answerSourceId) ||
      (question.extraSourceIds ?? []).some((id) => !sourceIds.has(id)) ||
      (question.sourceId && !sourceIds.has(question.sourceId))
    ) {
      throw new Error(`Source inconnue : ${question.id}`);
    }
  }
  return { questions, sources };
}
