import { themeSchema, type Question, type QuizMode, type QuizSession } from './schema';

export const EXAM_RULES = {
  questions: 40,
  knowledge: 28,
  situations: 12,
  minutes: 45,
  target: 32,
} as const;

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    const item = shuffled[index]!;
    shuffled[index] = shuffled[swapIndex]!;
    shuffled[swapIndex] = item;
  }
  return shuffled;
}

export function startQuiz(
  pool: Question[],
  mode: QuizMode,
  now = new Date(),
  random = Math.random,
): QuizSession {
  if (!pool.length || new Set(pool.map((question) => question.id)).size !== pool.length)
    throw new Error('Le quiz nécessite des questions distinctes.');
  const questions = shuffle(pool, random).map((question) => {
    const indices = shuffle([0, 1, 2, 3], random);
    return {
      ...question,
      answers: indices.map((index) => question.answers[index]!) as Question['answers'],
      correctAnswer: indices.indexOf(question.correctAnswer),
    };
  });
  return {
    id: crypto.randomUUID(),
    mode,
    questions,
    index: 0,
    answers: questions.map(() => null),
    startedAt: now.toISOString(),
    deadline:
      mode === 'exam' ? new Date(now.getTime() + EXAM_RULES.minutes * 60000).toISOString() : null,
    finishedAt: null,
    xpAtStart: 0,
  };
}

export function getCurrentQuestion(session: QuizSession): Question {
  const question = session.questions[session.index];
  if (!question) throw new Error('Question introuvable.');
  return question;
}

export function submitAnswer(
  session: QuizSession,
  answerIndex: number,
  now = new Date(),
): QuizSession {
  if (session.finishedAt || (session.deadline && now.getTime() >= Date.parse(session.deadline)))
    throw new Error('La session est terminée.');
  if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3)
    throw new Error('Réponse invalide.');
  if (session.answers[session.index] !== null)
    throw new Error('Cette réponse est déjà enregistrée.');
  const answers = [...session.answers];
  answers[session.index] = answerIndex;
  return { ...session, answers };
}

export function nextQuestion(session: QuizSession): QuizSession {
  if (
    session.finishedAt ||
    session.answers[session.index] === null ||
    session.index + 1 >= session.questions.length
  )
    throw new Error('Impossible de passer à la question suivante.');
  return { ...session, index: session.index + 1 };
}

export function finishQuiz(session: QuizSession, now = new Date()): QuizSession {
  if (session.finishedAt) return session;
  if (session.mode !== 'exam' && session.answers.some((answer) => answer === null))
    throw new Error('Terminez les questions avant de conclure.');
  return { ...session, finishedAt: now.toISOString() };
}

export function getResult(session: QuizSession) {
  if (!session.finishedAt) throw new Error('Le résultat est disponible uniquement à la fin.');
  const byTheme = Object.fromEntries(
    themeSchema.options.map((theme) => [theme, { correct: 0, total: 0 }]),
  ) as Record<Question['theme'], { correct: number; total: number }>;
  const errors: Question[] = [];
  let score = 0;
  session.questions.forEach((question, index) => {
    const correct = session.answers[index] === question.correctAnswer;
    if (correct) score++;
    else errors.push(question);
    byTheme[question.theme].total++;
    byTheme[question.theme].correct += Number(correct);
  });
  const total = session.questions.length;
  return {
    score,
    total,
    percent: Math.round((score / total) * 100),
    passed: session.mode === 'exam' && total === EXAM_RULES.questions && score >= EXAM_RULES.target,
    byTheme,
    errors,
  };
}

function balancedSelection(pool: Question[], count: number, random: () => number) {
  const buckets = themeSchema.options.map((theme) =>
    shuffle(
      pool.filter((question) => question.theme === theme),
      random,
    ),
  );
  const selected: Question[] = [];
  while (selected.length < count) {
    for (const bucket of buckets) {
      const question = bucket.pop();
      if (question) selected.push(question);
      if (selected.length === count) break;
    }
  }
  return selected;
}

export function selectExamQuestions(pool: Question[], random = Math.random) {
  const unique = [...new Map(pool.map((question) => [question.id, question])).values()];
  const knowledge = unique.filter((question) => question.type === 'QUESTION_OFFICIELLE');
  const situations = unique.filter((question) => question.type === 'EXERCICE_ENTRAINEMENT');
  if (
    knowledge.length < EXAM_RULES.knowledge ||
    situations.length < EXAM_RULES.situations ||
    themeSchema.options.some((theme) => !knowledge.some((question) => question.theme === theme))
  )
    throw new Error(
      'Corpus insuffisant : 28 connaissances, les cinq thèmes et 12 situations distinctes sont nécessaires.',
    );
  return [
    ...balancedSelection(knowledge, EXAM_RULES.knowledge, random),
    ...balancedSelection(situations, EXAM_RULES.situations, random),
  ];
}
