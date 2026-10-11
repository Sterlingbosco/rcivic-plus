import { navigate, useApp } from '../app-context';
import { officialQuestions, questionsForTheme, themes } from '../data/content';
import { getStatistics, getStreak, dayKey } from '../domain/progress';
import { Icon } from '../components/Icon';
import { LearningArt, PageHeading, ProgressBar } from '../components/Primitives';

export function Home() {
  const { progress } = useApp();
  const stats = getStatistics(progress, officialQuestions);
  const nextTheme =
    themes.find((theme) =>
      questionsForTheme(theme.id).some((question) => !progress.understood.includes(question.id)),
    ) ?? themes[0]!;
  const ongoing = progress.activeSession && !progress.activeSession.finishedAt;
  const lastActivity = progress.activityDays.at(-1);
  const streak = getStreak(progress.activityDays);
  return (
    <>
      <PageHeading
        eyebrow="CHAQUE PETIT PAS COMPTE"
        title="Bonjour, prêt à avancer ?"
        description="Un peu de pratique aujourd’hui, plus de confiance demain."
      />
      <div className="home-grid">
        <section className="hero-card">
          <div className="hero-copy">
            <span className="tag tag-blue">
              <span className="tiny-dot" />
              VOTRE OBJECTIF · CSP
            </span>
            <h2>
              Comprendre la France.
              <br />
              <span>Préparer votre avenir.</span>
            </h2>
            <p>
              Des notions claires, des exercices courts et un parcours qui s’adapte à vos progrès.
            </p>
            <button
              className="button button-primary"
              onClick={() => navigate(ongoing ? 'quiz' : `lecon/${nextTheme.id}`)}
            >
              {ongoing
                ? 'Reprendre ma session'
                : progress.understood.length
                  ? 'Continuer mon parcours'
                  : 'Commencer mon parcours'}
              <Icon name="arrow" size={18} />
            </button>
            <span className="hero-hint">
              <Icon name="clock" size={15} />À votre rythme · {nextTheme.duration} min environ
            </span>
          </div>
          <LearningArt />
          <div className="hero-progress">
            <div>
              <span>Votre parcours introductif</span>
              <strong>
                {stats.seen} / {officialQuestions.length} notions pratiquées
              </strong>
            </div>
            <ProgressBar value={stats.coverage} label="Couverture du lot introductif" />
            <small>Ce premier lot ne représente pas encore le corpus CSP complet.</small>
          </div>
        </section>
        <aside className="daily-card">
          <div className="section-title">
            <h2>Votre rythme</h2>
            <span className="icon-tile peach">
              <Icon name="flame" />
            </span>
          </div>
          <strong className="daily-number">
            {streak}
            <span> jour{streak > 1 ? 's' : ''}</span>
          </strong>
          <p>de pratique consécutive</p>
          <div className="week-strip" aria-label="Activité des sept derniers jours">
            {Array.from({ length: 7 }, (_, index) => {
              const date = new Date();
              date.setDate(date.getDate() - 6 + index);
              const key = dayKey(date);
              const studied = progress.activityDays.includes(key);
              return (
                <span
                  key={key}
                  className={studied ? 'day studied' : 'day'}
                  aria-label={`${date.toLocaleDateString('fr-FR')}${studied ? ', activité enregistrée' : ', pas d’activité'}`}
                >
                  <small>{date.toLocaleDateString('fr-FR', { weekday: 'narrow' })}</small>
                  <i>{studied ? <Icon name="check" size={14} /> : ''}</i>
                </span>
              );
            })}
          </div>
          <div className="daily-goal">
            <Icon name="target" size={19} />
            <span>
              Votre intention quotidienne
              <strong>{progress.preferences.dailyGoal} minutes pour apprendre</strong>
            </span>
          </div>
          <small className="daily-caption">
            Pas de pression : chaque reprise est un bon début.
          </small>
        </aside>
      </div>
      <div className="metrics-row">
        <div>
          <span className="icon-tile blue">
            <Icon name="spark" />
          </span>
          <p>
            <strong>{progress.xp} XP</strong>
            <span>Votre expérience</span>
          </p>
        </div>
        <div>
          <span className="icon-tile green">
            <Icon name="chart" />
          </span>
          <p>
            <strong>{stats.accuracy === null ? 'À découvrir' : `${stats.accuracy} %`}</strong>
            <span>Précision de vos réponses</span>
          </p>
        </div>
        <div>
          <span className="icon-tile violet">
            <Icon name="award" />
          </span>
          <p>
            <strong>Niveau {Math.floor(progress.xp / 200) + 1}</strong>
            <span>Votre niveau d’apprentissage</span>
          </p>
        </div>
      </div>
      <section>
        <div className="section-title section-spaced">
          <div>
            <h2>Votre prochaine découverte</h2>
            <p>Cinq thèmes pour comprendre l’essentiel.</p>
          </div>
          <a className="text-link" href="#/themes">
            Tous les thèmes <Icon name="arrow" size={16} />
          </a>
        </div>
        <div className="theme-grid">
          {themes.map((theme, index) => {
            const pool = questionsForTheme(theme.id);
            const completed = pool.filter((question) =>
              progress.understood.includes(question.id),
            ).length;
            return (
              <a key={theme.id} className="theme-card" href={`#/theme/${theme.id}`}>
                <div className="theme-card-top">
                  <span className={`icon-tile ${theme.tone}`}>
                    <Icon name={theme.icon} size={25} />
                  </span>
                  <span className="theme-index">0{index + 1}</span>
                </div>
                <h3>{theme.shortName}</h3>
                <p>{theme.description}</p>
                <div className="theme-card-bottom">
                  <span>
                    {completed}/{pool.length} notions comprises
                  </span>
                  <Icon name="arrow" size={17} />
                </div>
                <ProgressBar
                  value={Math.round((completed / pool.length) * 100)}
                  label={`Leçons comprises : ${theme.shortName}`}
                />
              </a>
            );
          })}
        </div>
      </section>
      <div className="home-bottom">
        <section className="review-callout">
          <span className="icon-tile green">
            <Icon name="review" size={25} />
          </span>
          <div>
            <h2>Une erreur ? Une occasion d’apprendre.</h2>
            <p>
              {stats.errors.length
                ? `${stats.errors.length} notion(s) à reprendre, avec des explications pour progresser.`
                : 'Vos prochaines révisions se prépareront à partir de vos réponses.'}
            </p>
            <a className="text-link" href="#/revision">
              Ma révision intelligente <Icon name="arrow" size={16} />
            </a>
          </div>
        </section>
        <a className="exam-callout" href="#/examen">
          <Icon name="target" size={26} />
          <div>
            <h2>L’objectif : 32 / 40</h2>
            <p>Comprendre le format de l’examen blanc</p>
          </div>
          <Icon name="arrow" size={20} />
        </a>
      </div>
      <p className="activity-note">
        {lastActivity
          ? `Dernière activité : ${new Date(`${lastActivity}T12:00:00`).toLocaleDateString('fr-FR')}.`
          : 'Votre progression commence ici. Aucune activité inventée.'}{' '}
        <a href="#/sources">Des sources identifiables, un apprentissage transparent.</a>
      </p>
    </>
  );
}
