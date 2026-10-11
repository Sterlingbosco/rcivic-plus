import { useApp } from '../app-context';
import { questions, situations } from '../data/content';
import { getStatistics } from '../domain/progress';
import { selectReview } from '../domain/review';
import { Icon } from '../components/Icon';
import { PageHeading } from '../components/Primitives';

export function Review({
  errorsOnly = false,
  training = false,
}: {
  errorsOnly?: boolean;
  training?: boolean;
}) {
  const { progress, startSession, saving } = useApp();
  const stats = getStatistics(progress, questions);
  const pool = training
    ? situations
    : errorsOnly
      ? stats.errors
      : selectReview(questions, progress.questionStats);
  const due = Object.values(progress.questionStats).filter(
    (stat) => Date.parse(stat.nextReview) <= Date.now(),
  ).length;
  return (
    <>
      <PageHeading
        eyebrow={training ? 'EXERCICES D’ENTRAÎNEMENT' : 'MÉMORISER, À VOTRE RYTHME'}
        title={
          training
            ? 'Les valeurs, dans la vie quotidienne.'
            : errorsOnly
              ? 'Vos erreurs sont des points de départ.'
              : 'La bonne notion, au bon moment.'
        }
        description={
          training
            ? 'Des situations originales pour comprendre et appliquer les notions étudiées.'
            : 'Les erreurs répétées passent en premier, puis les notions à échéance et les connaissances fragiles.'
        }
      />
      {training && (
        <div className="notice">
          <Icon name="shield" />
          <p>
            <strong>Exercice de mise en situation pour l’entraînement.</strong>
            <br />
            Les situations officielles ne sont pas rendues publiques. Ces exercices ne prétendent
            pas les reproduire.
          </p>
        </div>
      )}
      <section className="revision-hero card">
        <span className="icon-tile large green">
          <Icon name={training ? 'balance' : 'review'} size={35} />
        </span>
        <h2>
          {pool.length
            ? `${pool.length} notions pour votre prochaine session`
            : 'Aucune erreur à reprendre pour le moment'}
        </h2>
        <p>
          {training
            ? 'Deux exercices originaux, un retour pédagogique après chaque réponse.'
            : `${stats.errors.length} notion(s) à reprendre · ${due} révision(s) à échéance. Les nouvelles notions complètent la session si nécessaire.`}
        </p>
        {pool.length > 0 ? (
          <button
            className="button button-primary"
            disabled={saving}
            onClick={() => void startSession(pool, training ? 'training' : 'review')}
          >
            {training ? 'Pratiquer ces situations' : 'Commencer la révision'}
            <Icon name="arrow" size={18} />
          </button>
        ) : (
          <a className="button button-primary" href="#/themes">
            Continuer à apprendre
          </a>
        )}
        {!training && (
          <a className="text-link" href={errorsOnly ? '#/revision' : '#/erreurs'}>
            {errorsOnly ? 'Voir la révision intelligente' : 'Voir uniquement mes erreurs'}
          </a>
        )}
        {!training && (
          <a className="text-link" href="#/situations">
            Appliquer les notions en situation
          </a>
        )}
      </section>
      <div className="review-list">
        {pool.map((question) => {
          const stat = progress.questionStats[question.id];
          return (
            <article className="review-item" key={question.id}>
              <span className={`icon-tile ${stat && !stat.lastCorrect ? 'peach' : 'blue'}`}>
                <Icon name={stat && !stat.lastCorrect ? 'review' : 'book'} size={20} />
              </span>
              <div>
                <h3>{question.question}</h3>
                <p>
                  {question.type === 'EXERCICE_ENTRAINEMENT' ? 'Exercice d’entraînement · ' : ''}
                  {stat
                    ? `${stat.incorrect} erreur(s) sur ${stat.attempts} tentative(s) · prochaine révision ${new Date(stat.nextReview).toLocaleDateString('fr-FR')}`
                    : 'Une nouvelle notion à découvrir'}
                </p>
              </div>
            </article>
          );
        })}
      </div>
      <p className="content-disclaimer">
        Un intervalle simple : erreur → 1 jour, puis bonnes répétitions → 3, 7, 14 et 30 jours. Vous
        pouvez réviser avant l’échéance.
      </p>
    </>
  );
}
