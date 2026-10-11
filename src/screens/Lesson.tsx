import { useEffect, useState } from 'react';
import { useApp } from '../app-context';
import { questionsForTheme, themes } from '../data/content';
import { completeLesson } from '../domain/progress';
import type { ThemeId } from '../domain/schema';
import { Icon } from '../components/Icon';
import { AudioButton, PageHeading, ProgressBar, SourceLink } from '../components/Primitives';
import { stop } from '../platform/audio';

export function Lesson({ themeId }: { themeId: ThemeId }) {
  const { progress, commit, startSession, saving } = useApp();
  const pool = questionsForTheme(themeId);
  const firstNew = pool.findIndex((question) => !progress.understood.includes(question.id));
  const [index, setIndex] = useState(Math.max(0, firstNew));
  const [finished, setFinished] = useState(false);
  const question = pool[index]!;
  const theme = themes.find((entry) => entry.id === themeId)!;
  useEffect(() => {
    document.querySelector<HTMLElement>('h1')?.focus();
    stop();
  }, [index, finished]);
  async function understood() {
    await commit(completeLesson(progress, question.id));
    if (index < pool.length - 1) setIndex(index + 1);
    else setFinished(true);
  }
  if (finished)
    return (
      <>
        <PageHeading
          eyebrow="UNITÉ COMPRISE"
          title="Place à la pratique."
          description="Vous avez découvert les notions de cette unité. Un court quiz vous aide à les mémoriser."
        />
        <section className="finish-lesson card">
          <span className={`icon-tile large ${theme.tone}`}>
            <Icon name="check" size={36} />
          </span>
          <h2>{theme.unit}</h2>
          <p>Les erreurs sont utiles : vous recevrez une explication après chaque réponse.</p>
          <button
            className="button button-primary"
            disabled={saving}
            onClick={() => void startSession(pool, 'training')}
          >
            Commencer le quiz
            <Icon name="arrow" size={18} />
          </button>
          <a className="text-link" href="#/themes">
            Revenir aux thèmes
          </a>
        </section>
      </>
    );
  return (
    <>
      <a className="back-link" href={`#/theme/${themeId}`}>
        <Icon name="back" size={18} />
        {theme.shortName}
      </a>
      <div className="study-header">
        <span className="eyebrow">
          MICRO-LEÇON {index + 1} / {pool.length}
        </span>
        <span className="tag tag-blue">Comprendre avant de répondre</span>
      </div>
      <ProgressBar
        value={Math.round((index / pool.length) * 100)}
        label="Avancement dans les micro-leçons"
      />
      <article className="lesson-card">
        <div className="lesson-card-top">
          <span className="tag">ÉNONCÉ OFFICIEL CSP</span>
          <AudioButton
            text={`${question.question} ${question.answers[question.correctAnswer]} ${question.explanation}`}
          />
        </div>
        <h1 tabIndex={-1}>{question.question}</h1>
        <p className="answer-label">LA RÉPONSE À COMPRENDRE</p>
        <p className="lesson-answer">{question.answers[question.correctAnswer]}</p>
        <p className="lesson-explanation">{question.explanation}</p>
        <div className="key-point">
          <Icon name="spark" size={23} />
          <div>
            <strong>À retenir</strong>
            <p>{question.keyPoint}</p>
          </div>
        </div>
        <details className="source-details">
          <summary>Source et transparence du contenu</summary>
          <p>
            L’énoncé est officiel. La réponse formulée et l’explication sont pédagogiques, pas un
            corrigé officiel. Vérification documentaire du 11 octobre 2026 ; revue humaine non
            attestée.
          </p>
          <SourceLink id={question.sourceId!} />
          <SourceLink id={question.answerSourceId} />
        </details>
        <div className="lesson-actions">
          <button
            className="button button-primary"
            disabled={saving}
            onClick={() => void understood()}
          >
            <Icon name="check" size={18} />
            J’ai compris
          </button>
          <span className="muted">
            {progress.understood.includes(question.id)
              ? 'Déjà comprise · pas de double récompense'
              : '+30 XP pour cette découverte'}
          </span>
        </div>
      </article>
      <p className="study-note">
        Prenez le temps de comprendre. Vous pourrez revenir à cette notion dans vos révisions.
      </p>
    </>
  );
}
