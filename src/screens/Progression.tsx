import { useApp, useProfile } from '../app-context';
import { badges, themes } from '../data/content';
import { profileInfo } from '../domain/profiles';
import { getBadges, getStatistics, getStreak } from '../domain/progress';
import { Icon } from '../components/Icon';
import { PageHeading, ProgressBar } from '../components/Primitives';

export function Progression() {
  const { progress } = useApp();
  const content = useProfile();
  const info = profileInfo(content.profile);
  const officialQuestions = content.official;
  const stats = getStatistics(progress, officialQuestions, content.profile);
  const unlocked = getBadges(progress);
  return (
    <>
      <PageHeading
        eyebrow="VOS PETITES VICTOIRES"
        title="Vous construisez vos repères."
        description={`Profil ${info.shortName}. Des chiffres utiles pour savoir quoi pratiquer ensuite. Pas de promesse de réussite à partir d’un petit lot.`}
      />
      <div className="stats-grid">
        {[
          { label: 'XP cumulés', value: progress.xp },
          {
            label: 'Questions de connaissance pratiquées',
            value: `${stats.seen}/${officialQuestions.length}`,
          },
          {
            label: 'Précision sur vos tentatives',
            value: stats.accuracy === null ? 'À découvrir' : `${stats.accuracy} %`,
          },
          { label: 'Réponses correctes', value: stats.correct },
          { label: 'Réponses à reprendre', value: stats.incorrect },
          { label: 'Série actuelle', value: `${getStreak(progress.activityDays)} jours` },
          { label: 'Examens blancs complets', value: stats.exams },
          {
            label: 'Meilleur examen',
            value: stats.bestExam === null ? 'Pas encore' : `${stats.bestExam}/40`,
          },
          {
            label: 'Score moyen des examens',
            value: stats.averageExam === null ? 'Pas encore' : `${stats.averageExam}/40`,
          },
        ].map((metric) => (
          <div className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
      <section className="card">
        <h2>La couverture de votre lot introductif</h2>
        <p className="muted">
          La couverture mesure les notions pratiquées, pas leur maîtrise ni celle du corpus{' '}
          {info.shortName} complet.
        </p>
        <div className="theme-stat-list">
          {stats.byTheme.map((stat) => {
            const theme = themes.find((entry) => entry.id === stat.id)!;
            return (
              <div key={stat.id}>
                <span className={`icon-tile ${theme.tone}`}>
                  <Icon name={theme.icon} />
                </span>
                <div>
                  <strong>{theme.shortName}</strong>
                  <ProgressBar value={stat.coverage} label={`Couverture ${theme.shortName}`} />
                  <small>
                    {stat.seen}/{stat.total} notions vues · précision{' '}
                    {stat.accuracy === null ? 'non mesurée' : `${stat.accuracy} %`}
                  </small>
                </div>
                <a className="text-link" href={`#/theme/${theme.id}`}>
                  Apprendre
                  <Icon name="arrow" size={16} />
                </a>
              </div>
            );
          })}
        </div>
      </section>
      <section id="badges">
        <div className="section-title section-spaced">
          <div>
            <h2>Des étapes qui comptent</h2>
            <p>
              {unlocked.length} / {badges.length} badges obtenus
            </p>
          </div>
        </div>
        <div className="badges-grid">
          {badges.map((badge) => (
            <article
              className={`badge-card ${unlocked.includes(badge.id) ? 'unlocked' : 'locked'}`}
              key={badge.id}
            >
              <span className={`icon-tile large ${badge.tone}`}>
                <Icon name={badge.icon} size={30} />
              </span>
              <h3>{badge.name}</h3>
              <p>{badge.description}</p>
              <span className="tag">{unlocked.includes(badge.id) ? 'Obtenu' : 'À découvrir'}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="card history-card">
        <h2>Votre évolution, session après session</h2>
        {progress.history.some((entry) => entry.profile === content.profile) ? (
          <ol>
            {progress.history
              .filter((entry) => entry.profile === content.profile)
              .slice()
              .reverse()
              .map((entry) => (
                <li key={entry.id}>
                  <span>
                    {new Date(entry.finishedAt).toLocaleDateString('fr-FR')} ·{' '}
                    {entry.mode === 'exam'
                      ? 'Examen blanc'
                      : entry.mode === 'review'
                        ? 'Révision'
                        : 'Entraînement'}
                  </span>
                  <strong>
                    {entry.score}/{entry.total}
                  </strong>
                </li>
              ))}
          </ol>
        ) : (
          <p className="muted">Votre première session terminée apparaîtra ici.</p>
        )}
      </section>
    </>
  );
}
