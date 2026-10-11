import { useEffect, useState } from 'react';
import { navigate, useApp } from '../app-context';
import { getCurrentQuestion, submitAnswer, nextQuestion, finishQuiz } from '../domain/quiz';
import { completeSession, recordAnswer } from '../domain/progress';
import { AudioButton, PageHeading, ProgressBar, SourceLink } from '../components/Primitives';
import { Icon } from '../components/Icon';
import { stop } from '../platform/audio';

export function Quiz() {
  const { progress, commit, saving } = useApp();
  const session = progress.activeSession;
  const [selected, setSelected] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const question = session ? getCurrentQuestion(session) : null;
  const submitted = session?.answers[session.index] ?? null;
  const isExam = session?.mode === 'exam';
  const remaining = session?.deadline
    ? Math.max(0, Math.ceil((Date.parse(session.deadline) - now) / 1000))
    : null;
  useEffect(() => {
    setSelected(null);
    setError('');
    stop();
    document.querySelector<HTMLElement>('h1')?.focus();
  }, [session?.id, session?.index]);
  useEffect(() => {
    if (submitted !== null && !isExam) document.getElementById('answer-feedback')?.focus();
  }, [submitted, isExam]);
  useEffect(() => {
    if (!isExam || session?.finishedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isExam, session?.finishedAt]);
  useEffect(() => {
    if (remaining !== 0 || !session || session.finishedAt || saving) return;
    void commit(completeSession(progress, finishQuiz(session))).then(() => navigate('resultat'));
  }, [remaining, session, progress, saving, commit]);
  if (!session || !question)
    return (
      <>
        <PageHeading eyebrow="ENTRAÎNEMENT" title="Choisissez votre prochain thème." />
        <a className="button button-primary" href="#/themes">
          Explorer les thèmes
        </a>
      </>
    );
  if (session.finishedAt)
    return (
      <>
        <PageHeading eyebrow="SESSION TERMINÉE" title="Votre résultat vous attend." />
        <a className="button button-primary" href="#/resultat">
          Voir mon résultat
        </a>
      </>
    );
  async function answer() {
    if (selected === null || !session || !question || saving) return;
    try {
      let answered = submitAnswer(session, selected);
      let updated = isExam
        ? progress
        : recordAnswer(
            progress,
            session.id,
            question,
            selected === question.correctAnswer,
            session.mode,
            new Date(),
            session.index,
          );
      if (isExam) {
        if (session.index + 1 < session.questions.length) answered = nextQuestion(answered);
        else {
          answered = finishQuiz(answered);
          updated = completeSession(updated, answered);
        }
      }
      await commit({ ...updated, activeSession: answered });
      if (answered.finishedAt) navigate('resultat');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'La réponse n’a pas pu être enregistrée.');
    }
  }
  async function advance() {
    if (!session || saving) return;
    if (session.index + 1 === session.questions.length) {
      await commit(completeSession(progress, finishQuiz(session)));
      navigate('resultat');
    } else await commit({ ...progress, activeSession: nextQuestion(session) });
  }
  const correct = submitted === question.correctAnswer;
  const checked = submitted ?? selected;
  return (
    <div className="study-container">
      <div className="quiz-top">
        <a className="back-link" href="#/accueil">
          <Icon name="back" size={18} />
          Pause et accueil
        </a>
        <span className="tag">
          {isExam
            ? 'EXAMEN BLANC PÉDAGOGIQUE'
            : session.mode === 'review'
              ? 'RÉVISION INTELLIGENTE'
              : 'ENTRAÎNEMENT'}
        </span>
        {remaining !== null && (
          <span className="timer" role="timer" aria-label="Temps restant">
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
          </span>
        )}
      </div>
      <div className="study-header">
        <span className="eyebrow">
          QUESTION {session.index + 1} / {session.questions.length}
        </span>
        <span className="muted">
          {isExam ? 'Résultat uniquement à la fin' : 'Comprendre compte autant que répondre'}
        </span>
      </div>
      <ProgressBar
        value={Math.round((session.index / session.questions.length) * 100)}
        label="Avancement du quiz"
      />
      <section className="question-card">
        <div className="lesson-card-top">
          <span
            className={
              question.type === 'QUESTION_OFFICIELLE' ? 'tag tag-blue' : 'tag tag-training'
            }
          >
            {question.type === 'QUESTION_OFFICIELLE'
              ? 'ÉNONCÉ OFFICIEL CSP'
              : 'EXERCICE D’ENTRAÎNEMENT'}
          </span>
          <AudioButton text={`${question.question} ${question.answers.join('. ')}`} />
        </div>
        {question.type === 'EXERCICE_ENTRAINEMENT' && (
          <p className="content-disclaimer">
            Exercice de mise en situation pour l’entraînement. Ce n’est pas une question officielle
            de mise en situation.
          </p>
        )}
        <h1 tabIndex={-1}>{question.question}</h1>
        <p className="question-help">
          Une seule réponse.{' '}
          {question.type === 'QUESTION_OFFICIELLE' &&
            'Propositions d’entraînement créées par RCIVIC+.'}
        </p>
        <fieldset className="answers" disabled={submitted !== null || saving}>
          <legend className="sr-only">Choisissez votre réponse</legend>
          {question.answers.map((text, index) => (
            <label
              key={`${question.id}-${text}`}
              className={`answer-option ${checked === index ? 'selected' : ''} ${submitted !== null && !isExam && index === question.correctAnswer ? 'correct' : ''} ${submitted !== null && !isExam && checked === index && !correct ? 'incorrect' : ''}`}
            >
              <input
                type="radio"
                name="answer"
                value={index}
                checked={checked === index}
                onChange={() => setSelected(index)}
              />
              <span className="answer-letter">{'ABCD'[index]}</span>
              <span className="answer-text">{text}</span>
              {submitted !== null && !isExam && index === question.correctAnswer && (
                <Icon name="check" size={19} />
              )}
            </label>
          ))}
        </fieldset>
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        {submitted !== null && !isExam ? (
          <div
            id="answer-feedback"
            tabIndex={-1}
            className={`feedback ${correct ? 'success' : 'retry'}`}
            role="status"
          >
            <div className="feedback-title">
              <Icon name={correct ? 'check' : 'review'} />
              <h2>{correct ? 'Bien compris.' : 'Pas encore. Voici l’explication.'}</h2>
              {correct && <span className="tag">+10 XP</span>}
            </div>
            <p>
              <strong>La réponse à retenir : {question.answers[question.correctAnswer]}</strong>
            </p>
            <p>{question.explanation}</p>
            <div className="feedback-key">{question.keyPoint}</div>
            {!correct && <p>Cette notion rejoint vos révisions. Aucune perte d’XP.</p>}
            <SourceLink id={question.answerSourceId} />
            <button
              className="button button-primary"
              disabled={saving}
              onClick={() => void advance()}
            >
              {session.index + 1 === session.questions.length
                ? 'Voir mon résultat'
                : 'Question suivante'}
              <Icon name="arrow" size={18} />
            </button>
          </div>
        ) : (
          <div className="question-actions">
            <span className="muted">
              {saving
                ? 'Enregistrement…'
                : checked === null
                  ? 'Choisissez une réponse pour continuer.'
                  : 'Vous pouvez encore changer votre choix.'}
            </span>
            <button
              className="button button-primary"
              disabled={selected === null || saving || remaining === 0}
              onClick={() => void answer()}
            >
              Valider ma réponse
              <Icon name="arrow" size={18} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
