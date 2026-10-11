import { navigate, useApp } from '../app-context';
import { questionsForTheme, themes } from '../data/content';
import type { ThemeId } from '../domain/schema';
import { Icon } from '../components/Icon';
import { PageHeading, ProgressBar } from '../components/Primitives';

export function Themes({ themeId }: { themeId?: ThemeId }) {
  const { progress, startSession, saving } = useApp();
  const selected = themes.find((theme) => theme.id === themeId);
  if (selected) {
    const pool = questionsForTheme(selected.id);
    const completed = pool.filter((question) => progress.understood.includes(question.id)).length;
    return (
      <>
        <a className="back-link" href="#/themes">
          <Icon name="back" size={18} />
          Tous les thèmes
        </a>
        <PageHeading
          eyebrow="APPRENDRE · LOT INTRODUCTIF"
          title={selected.name}
          description={selected.description}
        />
        <section className="unit-card">
          <span className={`icon-tile large ${selected.tone}`}>
            <Icon name={selected.icon} size={36} />
          </span>
          <span className="tag">UNITÉ 01</span>
          <h2>{selected.unit}</h2>
          <p>
            {pool.length} micro-leçons · {selected.duration} minutes environ · avancez à votre
            rythme.
          </p>
          <ProgressBar
            value={Math.round((completed / pool.length) * 100)}
            label="Notions comprises de cette unité"
          />
          <p className="muted">
            {completed} / {pool.length} notions comprises
          </p>
          <div className="button-row">
            <button
              className="button button-primary"
              onClick={() => navigate(`lecon/${selected.id}`)}
            >
              Apprendre cette unité
              <Icon name="arrow" size={18} />
            </button>
            <button
              className="button button-secondary"
              disabled={saving}
              onClick={() => void startSession(pool, 'training')}
            >
              M’entraîner directement
            </button>
          </div>
        </section>
        <div className="concept-list">
          {pool.map((question, index) => (
            <div key={question.id}>
              <span
                className={
                  progress.understood.includes(question.id)
                    ? 'concept-number completed'
                    : 'concept-number'
                }
              >
                {progress.understood.includes(question.id) ? (
                  <Icon name="check" size={18} />
                ) : (
                  index + 1
                )}
              </span>
              <p>{question.question}</p>
              <span className="tag">
                {question.subtheme === 'laicite' ? 'Laïcité' : 'Connaissance'}
              </span>
            </div>
          ))}
        </div>
        <p className="content-disclaimer">
          Énoncés ministériels. Réponses, explications et propositions d’entraînement rédigées par
          RCIVIC+. Ce lot n’est pas le corpus complet.
        </p>
      </>
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="VOTRE PARCOURS"
        title="Une notion à la fois."
        description="Choisissez un thème. Comprenez d’abord, pratiquez ensuite."
      />
      <div className="themes-list">
        {themes.map((theme) => (
          <a className="theme-list-card" href={`#/theme/${theme.id}`} key={theme.id}>
            <span className={`icon-tile large ${theme.tone}`}>
              <Icon name={theme.icon} size={30} />
            </span>
            <div>
              <span className="eyebrow">
                {questionsForTheme(theme.id).length} NOTIONS DISPONIBLES
              </span>
              <h2>{theme.name}</h2>
              <p>{theme.description}</p>
            </div>
            <Icon name="arrow" />
          </a>
        ))}
      </div>
    </>
  );
}
