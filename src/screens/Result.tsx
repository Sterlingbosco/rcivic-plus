import { useApp } from '../app-context';
import { correctText, selectedIndices } from '../domain/answers';
import { getResult } from '../domain/quiz';
import { themes } from '../data/content';
import { Icon } from '../components/Icon';
import { PageHeading, SourceLink } from '../components/Primitives';

export function Result() {
  const { progress } = useApp();
  const session = progress.activeSession;
  if (!session?.finishedAt)
    return (
      <>
        <PageHeading eyebrow="VOTRE SESSION" title="La pratique d’abord, le résultat ensuite." />
        <a className="button button-primary" href={session ? '#/quiz' : '#/themes'}>
          {session ? 'Reprendre ma session' : 'Choisir un thème'}
        </a>
      </>
    );
  const result = getResult(session);
  return (
    <>
      <PageHeading
        eyebrow="SESSION TERMINÉE"
        title={
          result.errors.length
            ? 'Chaque réponse vous fait avancer.'
            : 'Une belle étape de franchie.'
        }
        description="Ce résultat vous aide à choisir quoi revoir. Il ne prédit pas votre réussite à l’examen officiel."
      />
      <section className="result-card">
        <span className="result-medal">
          <Icon name="award" size={44} />
        </span>
        <span className="eyebrow">
          {session.mode === 'exam' ? 'EXAMEN BLANC' : 'VOTRE SESSION'}
        </span>
        <div className="result-score">
          {result.score}
          <span> / {result.total}</span>
        </div>
        <p>{result.percent} % de réponses correctes</p>
        {result.unanswered > 0 && (
          <p>
            {result.unanswered} question(s) sans réponse : elles valent zéro dans ce score, sans
            ajouter de fausses tentatives à votre progression. Reprenez les notions recommandées
            ci-dessous.
          </p>
        )}
        {session.mode === 'exam' && result.total === 40 && (
          <strong>
            {result.passed
              ? 'Objectif pédagogique 32/40 atteint'
              : 'Des notions à revoir pour atteindre 32/40'}
          </strong>
        )}
        <div className="result-rewards">
          <span>
            <Icon name="spark" size={19} />+{progress.xp - session.xpAtStart} XP gagnés pendant le
            quiz
          </span>
          <span>
            <Icon name="review" size={19} />
            {result.errors.length} notion(s) à revoir
          </span>
        </div>
        <div className="button-row">
          <a
            className="button button-primary"
            href={result.answeredErrors ? '#/erreurs' : '#/themes'}
          >
            {result.answeredErrors
              ? 'Revoir mes erreurs'
              : result.unanswered
                ? 'Apprendre les notions non répondues'
                : 'Découvrir un autre thème'}
            <Icon name="arrow" size={18} />
          </a>
          <a className="button button-secondary" href="#/accueil">
            Retour à mon espace
          </a>
        </div>
      </section>
      <section className="card">
        <h2>Vos repères par thème</h2>
        <div className="result-themes">
          {themes
            .filter((theme) => result.byTheme[theme.id].total)
            .map((theme) => (
              <div key={theme.id}>
                <span className={`icon-tile ${theme.tone}`}>
                  <Icon name={theme.icon} />
                </span>
                <strong>{theme.shortName}</strong>
                <span>
                  {result.byTheme[theme.id].correct} / {result.byTheme[theme.id].total}
                </span>
              </div>
            ))}
        </div>
      </section>
      {result.recommendations.length > 0 && (
        <section className="card">
          <h2>Votre prochaine étape</h2>
          <p className="muted">
            Reprenez d’abord les thèmes les plus fragiles de cette session. Ce conseil ne mesure pas
            votre maîtrise du corpus complet.
          </p>
          <div className="button-row">
            {result.recommendations.map((recommendation) => {
              const theme = themes.find((entry) => entry.id === recommendation.theme)!;
              return (
                <a className="button button-secondary" key={theme.id} href={`#/theme/${theme.id}`}>
                  Reprendre : {theme.shortName}
                  <Icon name="arrow" size={18} />
                </a>
              );
            })}
          </div>
        </section>
      )}
      {result.errors.length > 0 && (
        <details className="card source-details">
          <summary>Comprendre mes {result.errors.length} réponses à consolider</summary>
          <div className="review-list">
            {result.errors.map((question) => {
              const index = session.questions.findIndex((entry) => entry.id === question.id);
              const selected = session.answers[index];
              return (
                <article className="review-item" key={question.id}>
                  <div>
                    <span className="tag">
                      {question.type === 'QUESTION_OFFICIELLE'
                        ? 'ÉNONCÉ OFFICIEL · CORRECTION PÉDAGOGIQUE'
                        : question.type === 'QUESTION_PEDAGOGIQUE'
                          ? 'QUESTION D’ENTRAÎNEMENT REFORMULÉE'
                          : 'EXERCICE D’ENTRAÎNEMENT'}
                    </span>
                    <h3>{question.question}</h3>
                    <p>
                      Votre réponse :{' '}
                      {selected === null || selected === undefined
                        ? 'Sans réponse'
                        : selectedIndices(question, selected)
                            .map((choice) => question.answers[choice])
                            .join(' · ')}
                    </p>
                    <p>
                      <strong>À retenir : {correctText(question)}</strong>
                    </p>
                    <p>{question.explanation}</p>
                    {[question.answerSourceId, ...(question.extraSourceIds ?? [])].map((id) => (
                      <SourceLink key={id} id={id} />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </details>
      )}
    </>
  );
}
