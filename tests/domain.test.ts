import { describe, expect, it } from 'vitest';
import { profileContent, questions } from '../src/data/content';
import { progressSchema } from '../src/domain/schema';
import {
  correctIndices,
  correctText,
  isCorrectAnswer,
  isMultiple,
  selectedIndices,
  toStoredAnswer,
} from '../src/domain/answers';
import {
  startQuiz,
  getCurrentQuestion,
  submitAnswer,
  nextQuestion,
  finishQuiz,
  getResult,
  selectExamQuestions,
} from '../src/domain/quiz';
import {
  createProgress,
  recordAnswer,
  completeLesson,
  completeSession,
  getStatistics,
  getStreak,
  getBadges,
} from '../src/domain/progress';
import { selectReview, updateQuestionStats } from '../src/domain/review';

const now = new Date('2026-10-11T12:00:00Z');
const question = questions[0]!;

function completed(mode: 'training' | 'exam' = 'training', count = 3) {
  const pool = Array.from({ length: count }, (_, index) => ({ ...question, id: `TEST-${index}` }));
  let session = startQuiz(pool, mode, now, () => 0.5);
  for (let index = 0; index < count; index++) {
    const current = getCurrentQuestion(session);
    session = submitAnswer(session, current.correctAnswer, now);
    if (index < count - 1) session = nextQuestion(session);
  }
  return finishQuiz(session, now);
}

describe('quiz indépendant de l’UI', () => {
  it('sélectionne sans doublons et mélange les réponses sans perdre la bonne réponse', () => {
    const session = startQuiz(questions.slice(0, 4), 'training', now, () => 0.2);
    expect(new Set(session.questions.map((q) => q.id)).size).toBe(4);
    for (const q of session.questions) {
      const original = questions.find((candidate) => candidate.id === q.id)!;
      expect(q.answers[q.correctAnswer]).toBe(original.answers[original.correctAnswer]);
    }
  });
  it('refuse les sessions vides, doublons, réponses invalides et doubles soumissions', () => {
    expect(() => startQuiz([], 'training', now)).toThrow();
    expect(() => startQuiz([question, question], 'training', now)).toThrow();
    const session = startQuiz([question], 'training', now);
    expect(() => submitAnswer(session, -1, now)).toThrow();
    expect(() => submitAnswer(session, 1.5, now)).toThrow();
    expect(() => nextQuestion(session)).toThrow();
    const answered = submitAnswer(session, 0, now);
    expect(() => submitAnswer(answered, 1, now)).toThrow();
  });
  it('calcule le score exact et refuse un résultat avant la fin', () => {
    expect(getResult(completed()).score).toBe(3);
    expect(() => getResult(startQuiz([question], 'training', now))).toThrow();
  });
  it('termine un examen complet de 40 questions sans XP par réponse', () => {
    const session = completed('exam', 40);
    const result = getResult(session);
    expect(result.score).toBe(40);
    expect(result.passed).toBe(true);
    let progress = createProgress();
    session.questions.forEach((q, index) => {
      progress = recordAnswer(progress, session.id, q, true, 'exam', now, index);
    });
    expect(progress.xp).toBe(0);
  });
  it('ne transforme pas les questions sans réponse en fausses tentatives d’apprentissage', () => {
    const exam = startQuiz(selectExamQuestions(questions), 'exam', now);
    const expired = new Date(now.getTime() + 45 * 60000);
    const finished = finishQuiz(exam, expired);
    const progress = completeSession(createProgress(), finished, expired);
    expect(getResult(finished).score).toBe(0);
    expect(getResult(finished).unanswered).toBe(40);
    expect(getResult(finished).answeredErrors).toBe(0);
    expect(progress.xp).toBe(100);
    expect(getStatistics(progress, questions, 'CSP').attempts).toBe(0);
    expect(getStatistics(progress, questions, 'CSP').seen).toBe(0);
  });
  it('ne permet pas de répondre après l’échéance et compte les questions non répondues', () => {
    const session = startQuiz([question], 'exam', now);
    const expired = new Date(now.getTime() + 45 * 60 * 1000);
    expect(() => submitAnswer(session, 0, expired)).toThrow();
    const result = getResult(finishQuiz(session, expired));
    expect(result.score).toBe(0);
    expect(result.total).toBe(1);
  });
  it('applique exactement le seuil 32/40 et recommande les thèmes fragiles', () => {
    const session = completed('exam', 40);
    const withScore = (score: number) => ({
      ...session,
      answers: session.questions.map((entry, index) =>
        index < score ? entry.correctAnswer : (entry.correctAnswer + 1) % 4,
      ),
    });
    expect(getResult(withScore(31)).passed).toBe(false);
    expect(getResult(withScore(32)).passed).toBe(true);
    expect(getResult(withScore(31)).recommendations[0]?.theme).toBe(question.theme);
    expect(getResult(withScore(40)).recommendations).toHaveLength(0);
  });
  it('refuse un examen blanc avec un corpus insuffisant', () => {
    expect(() => selectExamQuestions(questions.slice(0, 14))).toThrow(/corpus/i);
  });
  it('compose un examen avec le corpus publié, sans questions synthétiques ni doublons', () => {
    const selected = selectExamQuestions(questions);
    expect(selected).toHaveLength(40);
    expect(new Set(selected.map((entry) => entry.id)).size).toBe(40);
    expect(selected.filter((entry) => entry.type === 'QUESTION_OFFICIELLE')).toHaveLength(28);
    expect(selected.filter((entry) => entry.type === 'EXERCICE_ENTRAINEMENT')).toHaveLength(12);
  });
  it('sélectionne exactement 28 connaissances et 12 situations distinctes sur cinq thèmes', () => {
    const themes = [
      'principes_valeurs',
      'institutions',
      'droits_devoirs',
      'histoire_culture',
      'vie_societe',
    ] as const;
    const knowledge = Array.from({ length: 35 }, (_, index) => ({
      ...question,
      id: `KNOW-${index}`,
      theme: themes[index % 5]!,
    }));
    const training = Array.from({ length: 15 }, (_, index) => ({
      ...questions.at(-1)!,
      id: `SCENARIO-${index}`,
      theme: themes[index % 5]!,
    }));
    const selected = selectExamQuestions([...knowledge, ...training]);
    expect(new Set(selected.map((q) => q.id)).size).toBe(40);
    expect(selected.filter((q) => q.type === 'QUESTION_OFFICIELLE')).toHaveLength(28);
    expect(selected.filter((q) => q.type === 'EXERCICE_ENTRAINEMENT')).toHaveLength(12);
    expect(new Set(selected.map((q) => q.theme)).size).toBe(5);
  });
});

describe('récompenses, statistiques et dates', () => {
  it('récompense une leçon une seule fois et ne pénalise pas une erreur', () => {
    const first = completeLesson(createProgress(), question.id, now);
    expect(first.xp).toBe(30);
    expect(completeLesson(first, question.id, now).xp).toBe(30);
    const wrong = recordAnswer(first, 'session', question, false, 'training', now, 0);
    expect(wrong.xp).toBe(30);
    expect(wrong.questionStats[question.id]?.incorrect).toBe(1);
  });
  it('ne double pas l’XP ni les tentatives lors d’une reprise', () => {
    const first = recordAnswer(createProgress(), 's1', question, true, 'training', now, 0);
    expect(first.xp).toBe(10);
    const duplicate = recordAnswer(first, 's1', question, true, 'training', now, 0);
    expect(duplicate).toEqual(first);
    expect(getStatistics(first, questions, 'CSP').correct).toBe(1);
  });
  it('distingue couverture et précision et débloque le premier badge', () => {
    const first = completeLesson(createProgress(), question.id, now);
    expect(getBadges(first, now)).toContain('first-step');
    expect(getBadges(first, now)).not.toContain('principes_valeurs');
    expect(getStatistics(first, questions, 'CSP').accuracy).toBe(null);
    const answered = recordAnswer(first, 's1', question, true, 'training', now, 0);
    expect(getStatistics(answered, questions, 'CSP').accuracy).toBe(100);
    expect(getStatistics(answered, questions, 'CSP').seen).toBe(1);
  });
  it('récompense un examen une fois et conserve ses badges au-delà de 50 sessions', () => {
    const exam = completed('exam', 40);
    let progress = completeSession(createProgress(), exam, now);
    expect(progress.xp).toBe(100);
    expect(completeSession(progress, exam, now).xp).toBe(100);
    expect(getBadges(progress, now)).toEqual(expect.arrayContaining(['target-32', 'perfect']));
    for (let index = 0; index < 51; index++) progress = completeSession(progress, completed(), now);
    expect(progress.history).toHaveLength(50);
    expect(getBadges(progress, now)).toContain('perfect');
    expect(getStatistics(progress, questions, 'CSP').bestExam).toBe(40);
    expect(getStatistics(progress, questions, 'CSP').exams).toBe(1);
  });
  it('calcule les séries par jours, sans ajouter plusieurs jours pour une seule date', () => {
    expect(getStreak(['2026-10-09', '2026-10-10', '2026-10-11'], now)).toBe(3);
    expect(getStreak(['2026-10-09'], now)).toBe(0);
    expect(getStreak(['2026-10-10'], now)).toBe(1);
  });
});

describe('répétition espacée', () => {
  it('applique J+1 après erreur puis 3, 7, 14, 30 jours et reset après erreur', () => {
    let stats = updateQuestionStats(undefined, false, now);
    expect(stats.nextReview).toBe('2026-10-12T12:00:00.000Z');
    for (const days of [3, 7, 14, 30, 30]) {
      stats = updateQuestionStats(stats, true, now);
      expect(new Date(stats.nextReview).getTime() - now.getTime()).toBe(days * 86400000);
    }
    stats = updateQuestionStats(stats, false, now);
    expect(stats.consecutiveCorrect).toBe(0);
    expect(stats.nextReview).toBe('2026-10-12T12:00:00.000Z');
  });
  it('sélectionne les erreurs avant les questions jamais vues', () => {
    const wrong = questions[1]!;
    const stats = { [wrong.id]: updateQuestionStats(undefined, false, now) };
    expect(selectReview(questions, stats, now, 3)[0]?.id).toBe(wrong.id);
  });
});

describe('réponses multiples', () => {
  const base = questions.find((q) => q.type === 'QUESTION_OFFICIELLE')!;
  const multiple = {
    ...base,
    id: 'MULTI-1',
    answers: ['A', 'B', 'C', 'D'] as typeof base.answers,
    correctAnswer: 0,
    correctAnswers: [0, 2],
  };
  it('exige toutes les bonnes réponses et aucune autre', () => {
    expect(isMultiple(multiple)).toBe(true);
    const full = toStoredAnswer(multiple, [0, 2]);
    expect(isCorrectAnswer(multiple, full)).toBe(true);
    expect(isCorrectAnswer(multiple, toStoredAnswer(multiple, [0]))).toBe(false);
    expect(isCorrectAnswer(multiple, toStoredAnswer(multiple, [0, 1, 2]))).toBe(false);
    expect(isCorrectAnswer(multiple, null)).toBe(false);
    expect(selectedIndices(multiple, full)).toEqual([0, 2]);
    expect(correctText(multiple)).toBe('A · C');
  });
  it('garde les bonnes réponses après mélange et refuse une réponse invalide', () => {
    for (let seed = 0; seed < 20; seed++) {
      let state = seed + 1;
      const random = () => (state = (state * 48271) % 2147483647) / 2147483647;
      const session = startQuiz([multiple], 'training', new Date(), random);
      const shuffled = session.questions[0]!;
      expect(
        correctIndices(shuffled)
          .map((index) => shuffled.answers[index])
          .sort(),
      ).toEqual(['A', 'C']);
      expect(shuffled.correctAnswer).toBe(Math.min(...correctIndices(shuffled)));
      const answered = submitAnswer(session, toStoredAnswer(shuffled, correctIndices(shuffled)));
      expect(isCorrectAnswer(shuffled, answered.answers[0]!)).toBe(true);
    }
    const session = startQuiz([multiple], 'training');
    expect(() => submitAnswer(session, 0)).toThrow();
    expect(() => submitAnswer(session, 16)).toThrow();
  });
  it('exclut les reformulations pédagogiques du tirage de l’examen', () => {
    const pool = [
      ...Array.from({ length: 35 }, (_, i) => ({ ...base, id: `K-${i}`, theme: themeOf(i) })),
      ...Array.from({ length: 15 }, (_, i) => ({
        ...questions.at(-1)!,
        id: `S-${i}`,
        theme: themeOf(i),
      })),
      { ...base, id: 'PEDA-1', type: 'QUESTION_PEDAGOGIQUE' as const, sourceId: null },
    ];
    for (let run = 0; run < 20; run++)
      expect(selectExamQuestions(pool).some((q) => q.id === 'PEDA-1')).toBe(false);
  });
});

function themeOf(index: number) {
  return (
    [
      'principes_valeurs',
      'institutions',
      'droits_devoirs',
      'histoire_culture',
      'vie_societe',
    ] as const
  )[index % 5]!;
}

describe('profils d’examen', () => {
  const clone = <T>(value: T): T => structuredClone(value);
  it('migre une ancienne sauvegarde : profil CSP, résumé d’examen et historique rattachés au CSP', () => {
    const legacy = clone(createProgress()) as Record<string, unknown>;
    legacy.examSummary = { count: 2, totalScore: 70, bestScore: 38 };
    legacy.preferences = { dailyGoal: 10, audioRate: 1, onboarded: true };
    legacy.history = [
      { id: 'a', mode: 'exam', score: 32, total: 40, finishedAt: new Date().toISOString() },
    ];
    const parsed = progressSchema.parse(legacy);
    expect(parsed.preferences.profile).toBe('CSP');
    expect(parsed.examSummary).toEqual({ CSP: { count: 2, totalScore: 70, bestScore: 38 } });
    expect(parsed.history[0]!.profile).toBe('CSP');
    expect(getStatistics(parsed, questions, 'CSP').bestExam).toBe(38);
    expect(getStatistics(parsed, questions, 'CR').bestExam).toBe(null);
  });
  it('sépare le contenu par profil : CSP publié, CR et naturalisation vides sans mélange', () => {
    const csp = profileContent('CSP');
    expect(csp.official.length).toBeGreaterThan(100);
    expect(csp.official.every((q) => q.level === 'CSP')).toBe(true);
    for (const profile of ['CR', 'NAT'] as const) {
      const content = profileContent(profile);
      expect(content.all.every((q) => q.level === profile)).toBe(true);
      expect(content.official.some((q) => q.level !== profile)).toBe(false);
    }
    expect(profileContent('CR').officialTotal).toBe(209);
    expect(profileContent('NAT').officialTotal).toBe(244);
  });
  it('compte les résumés d’examen par profil', () => {
    const pool = questions.filter((q) => q.level === 'CSP').slice(0, 40);
    let session = startQuiz(pool, 'exam');
    for (let i = 0; i < 40; i++) {
      session = submitAnswer(
        session,
        toStoredAnswer(getCurrentQuestion(session), correctIndices(getCurrentQuestion(session))),
      );
      if (i < 39) session = nextQuestion(session);
    }
    const done = completeSession(createProgress(), finishQuiz(session));
    expect(done.examSummary.CSP?.count).toBe(1);
    expect(done.examSummary.CR).toBeUndefined();
    expect(done.history.at(-1)!.profile).toBe('CSP');
    expect(getStatistics(done, questions, 'CR').exams).toBe(0);
  });
});
