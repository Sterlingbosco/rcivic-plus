import { useApp } from '../app-context';
import { getResult } from '../domain/quiz';
import { themes } from '../data/content';
import { Icon } from '../components/Icon';
import { PageHeading } from '../components/Primitives';

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
            href={result.errors.length ? '#/erreurs' : '#/themes'}
          >
            {result.errors.length ? 'Revoir mes erreurs' : 'Découvrir un autre thème'}
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
    </>
  );
}
