import type { Question, QuestionStats } from './schema';

export const REVIEW_INTERVALS = [3, 7, 14, 30] as const;

export function updateQuestionStats(
  previous: QuestionStats | undefined,
  isCorrect: boolean,
  now = new Date(),
  intervals: readonly number[] = REVIEW_INTERVALS,
): QuestionStats {
  if (
    !intervals.length ||
    intervals.some((interval) => !Number.isInteger(interval) || interval < 1)
  )
    throw new Error('Intervalles de révision invalides.');
  const consecutiveCorrect = isCorrect ? (previous?.consecutiveCorrect ?? 0) + 1 : 0;
  const correct = (previous?.correct ?? 0) + Number(isCorrect);
  const incorrect = (previous?.incorrect ?? 0) + Number(!isCorrect);
  const attempts = correct + incorrect;
  const days = isCorrect ? intervals[Math.min(consecutiveCorrect - 1, intervals.length - 1)]! : 1;
  return {
    attempts,
    correct,
    incorrect,
    consecutiveCorrect,
    mastery: isCorrect
      ? Math.min(1, (correct / attempts) * Math.min(1, consecutiveCorrect / 3))
      : 0,
    lastCorrect: isCorrect,
    lastAttempt: now.toISOString(),
    nextReview: new Date(now.getTime() + days * 86400000).toISOString(),
  };
}

export function selectReview(
  questions: Question[],
  stats: Record<string, QuestionStats>,
  now = new Date(),
  count = 6,
): Question[] {
  const priority = (question: Question) => {
    const stat = stats[question.id];
    if (!stat) return 100;
    if (!stat.lastCorrect) return 1000 + stat.incorrect * 10;
    if (Date.parse(stat.nextReview) <= now.getTime()) return 600 + (1 - stat.mastery) * 100;
    return (
      200 * (1 - stat.mastery) +
      Math.min(50, (now.getTime() - Date.parse(stat.lastAttempt)) / 86400000)
    );
  };
  return [...questions]
    .sort((a, b) => priority(b) - priority(a) || a.id.localeCompare(b.id))
    .slice(0, Math.max(0, count));
}
