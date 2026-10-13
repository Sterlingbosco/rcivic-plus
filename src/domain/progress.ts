import { officialThemeTotals } from '../data/content';
import { updateQuestionStats } from './review';
import { isCorrectAnswer } from './answers';
import { getResult } from './quiz';
import {
  themeSchema,
  type Progress,
  type Question,
  type QuizMode,
  type QuizSession,
} from './schema';

export function createProgress(): Progress {
  return {
    version: 1,
    xp: 0,
    understood: [],
    rewardedEvents: [],
    activityDays: [],
    questionStats: {},
    history: [],
    earnedBadges: [],
    examSummary: { count: 0, totalScore: 0, bestScore: 0 },
    preferences: { dailyGoal: 10, audioRate: 1, onboarded: false },
    activeSession: null,
  };
}

export function dayKey(now: Date) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function addActivity(progress: Progress, now: Date): Progress {
  return {
    ...progress,
    activityDays: [...new Set([...progress.activityDays, dayKey(now)])].sort(),
  };
}

function preserveBadges(progress: Progress, now: Date): Progress {
  return { ...progress, earnedBadges: getBadges(progress, now) };
}

function reward(progress: Progress, id: string, xp: number) {
  if (progress.rewardedEvents.includes(id)) return progress;
  return { ...progress, xp: progress.xp + xp, rewardedEvents: [...progress.rewardedEvents, id] };
}

export function completeLesson(progress: Progress, questionId: string, now = new Date()): Progress {
  if (progress.understood.includes(questionId)) return progress;
  return preserveBadges(
    addActivity(
      {
        ...reward(progress, `lesson:${questionId}`, 30),
        understood: [...progress.understood, questionId],
      },
      now,
    ),
    now,
  );
}

export function recordAnswer(
  progress: Progress,
  sessionId: string,
  question: Question,
  correct: boolean,
  mode: QuizMode,
  now = new Date(),
  index = 0,
): Progress {
  const event = `answer:${sessionId}:${index}`;
  if (progress.rewardedEvents.includes(event)) return progress;
  const updated = reward(progress, event, mode !== 'exam' && correct ? 10 : 0);
  return preserveBadges(
    addActivity(
      {
        ...updated,
        questionStats: {
          ...updated.questionStats,
          [question.id]: updateQuestionStats(updated.questionStats[question.id], correct, now),
        },
      },
      now,
    ),
    now,
  );
}

export function completeSession(
  progress: Progress,
  session: QuizSession,
  now = new Date(),
): Progress {
  const event = `session:${session.id}`;
  if (progress.rewardedEvents.includes(event)) return { ...progress, activeSession: session };
  const result = getResult(session);
  let updated = progress;
  if (session.mode === 'exam') {
    session.questions.forEach((question, index) => {
      if (session.answers[index] === null) return;
      updated = recordAnswer(
        updated,
        session.id,
        question,
        isCorrectAnswer(question, session.answers[index]!),
        'exam',
        now,
        index,
      );
    });
  }
  updated = reward(
    updated,
    event,
    session.mode === 'exam' && result.total === 40 ? 100 : session.mode === 'review' ? 15 : 0,
  );
  const examSummary =
    session.mode === 'exam' && result.total === 40
      ? {
          count: updated.examSummary.count + 1,
          totalScore: updated.examSummary.totalScore + result.score,
          bestScore: Math.max(updated.examSummary.bestScore, result.score),
        }
      : updated.examSummary;
  return preserveBadges(
    {
      ...updated,
      examSummary,
      activeSession: session,
      history: [
        ...updated.history,
        {
          id: session.id,
          mode: session.mode,
          score: result.score,
          total: result.total,
          finishedAt: session.finishedAt!,
        },
      ].slice(-50),
    },
    now,
  );
}

export function getStreak(activityDays: string[], now = new Date()) {
  const days = new Set(activityDays);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getStatistics(progress: Progress, questions: Question[]) {
  const entries = questions
    .map((question) => ({ question, stat: progress.questionStats[question.id] }))
    .filter((entry) => entry.stat !== undefined);
  const attempts = entries.reduce((sum, entry) => sum + entry.stat!.attempts, 0);
  const correct = entries.reduce((sum, entry) => sum + entry.stat!.correct, 0);
  const seen = entries.length;
  const byTheme = themeSchema.options.map((id) => {
    const themeEntries = entries.filter((entry) => entry.question.theme === id);
    const total = questions.filter((question) => question.theme === id).length;
    const themeAttempts = themeEntries.reduce((sum, entry) => sum + entry.stat!.attempts, 0);
    const themeCorrect = themeEntries.reduce((sum, entry) => sum + entry.stat!.correct, 0);
    return {
      id,
      seen: themeEntries.length,
      total,
      accuracy: themeAttempts ? Math.round((themeCorrect / themeAttempts) * 100) : null,
      coverage: total ? Math.round((themeEntries.length / total) * 100) : 0,
    };
  });
  const exams = progress.examSummary;
  return {
    seen,
    attempts,
    correct,
    incorrect: attempts - correct,
    accuracy: attempts ? Math.round((correct / attempts) * 100) : null,
    coverage: questions.length ? Math.round((seen / questions.length) * 100) : 0,
    errors: entries.filter((entry) => !entry.stat!.lastCorrect).map((entry) => entry.question),
    byTheme,
    exams: exams.count,
    bestExam: exams.count ? exams.bestScore : null,
    averageExam: exams.count ? Math.round((exams.totalScore / exams.count) * 10) / 10 : null,
  };
}

export function getBadges(progress: Progress, now = new Date()) {
  const unlocked: string[] = [...progress.earnedBadges];
  if (progress.understood.length) unlocked.push('first-step');
  if (Object.keys(progress.questionStats).length >= 100) unlocked.push('regular');
  if (getStreak(progress.activityDays, now) >= 7) unlocked.push('week');
  for (const theme of themeSchema.options) {
    const prefix = {
      principes_valeurs: 'PV',
      institutions: 'SI',
      droits_devoirs: 'DD',
      histoire_culture: 'HG',
      vie_societe: 'VS',
    }[theme];
    const mastery = Object.entries(progress.questionStats)
      .filter(([id]) => id.startsWith(`CSP-${prefix}-`))
      .reduce((sum, [, stat]) => sum + stat.mastery, 0);
    if (mastery / officialThemeTotals[theme] >= 0.9) unlocked.push(theme);
  }
  if (
    progress.history.some(
      (entry) => entry.mode === 'exam' && entry.total === 40 && entry.score >= 32,
    )
  )
    unlocked.push('target-32');
  if (
    progress.history.some(
      (entry) => entry.mode === 'exam' && entry.total === 40 && entry.score === 40,
    )
  )
    unlocked.push('perfect');
  return [...new Set(unlocked)];
}
