import type { Question } from './schema';

type Gradable = Pick<Question, 'answers' | 'correctAnswer' | 'correctAnswers'>;

export function correctIndices(question: Gradable): number[] {
  return question.correctAnswers ?? [question.correctAnswer];
}

export function isMultiple(question: Gradable): boolean {
  return (question.correctAnswers?.length ?? 0) > 1;
}

/** Réponse enregistrée : index (0-3) en choix unique, masque de bits (1-15) en choix multiple. */
export function toStoredAnswer(question: Gradable, selected: readonly number[]): number {
  return isMultiple(question)
    ? selected.reduce((mask, index) => mask | (1 << index), 0)
    : selected[0]!;
}

export function selectedIndices(question: Gradable, stored: number | null): number[] {
  if (stored === null) return [];
  return isMultiple(question)
    ? [0, 1, 2, 3].filter((index) => (stored & (1 << index)) !== 0)
    : [stored];
}

export function isValidStoredAnswer(question: Gradable, stored: number): boolean {
  return (
    Number.isInteger(stored) &&
    stored >= (isMultiple(question) ? 1 : 0) &&
    stored <= (isMultiple(question) ? 15 : 3)
  );
}

/** Toutes les bonnes réponses doivent être cochées, et aucune autre. */
export function isCorrectAnswer(question: Gradable, stored: number | null): boolean {
  if (stored === null) return false;
  const expected = toStoredAnswer(question, correctIndices(question));
  return stored === expected;
}

export function correctText(question: Gradable): string {
  return correctIndices(question)
    .map((index) => question.answers[index]!)
    .join(' · ');
}
