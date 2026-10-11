import { useCallback, useEffect, useState } from 'react';
import { AppContext, navigate } from './app-context';
import { createProgress } from './domain/progress';
import { startQuiz } from './domain/quiz';
import { themeSchema, type Progress, type Question, type QuizMode } from './domain/schema';
import { loadProgress, saveProgress } from './platform/storage';
import { setRate, stop } from './platform/audio';
import { Layout } from './components/Layout';
import { Home } from './screens/Home';
import { Themes } from './screens/Themes';
import { Lesson } from './screens/Lesson';
import { Quiz } from './screens/Quiz';
import { Result } from './screens/Result';
import { Review } from './screens/Review';
import { Progression } from './screens/Progression';
import { Settings } from './screens/Settings';
import { Sources } from './screens/Sources';
import { Exam } from './screens/Exam';
import { Welcome } from './screens/Welcome';
import { PageHeading } from './components/Primitives';

function Screen({ route }: { route: string }) {
  const [name, id] = route.split('/');
  const theme = themeSchema.safeParse(id);
  if (name === 'accueil' || !name) return <Home />;
  if (name === 'themes') return <Themes />;
  if (name === 'theme' && theme.success) return <Themes themeId={theme.data} />;
  if (name === 'lecon' && theme.success) return <Lesson key={theme.data} themeId={theme.data} />;
  if (name === 'quiz') return <Quiz />;
  if (name === 'resultat') return <Result />;
  if (name === 'revision') return <Review />;
  if (name === 'erreurs') return <Review errorsOnly />;
  if (name === 'situations') return <Review training />;
  if (name === 'progression' || name === 'badges') return <Progression />;
  if (name === 'parametres') return <Settings />;
  if (name === 'sources' || name === 'apropos') return <Sources />;
  if (name === 'examen') return <Exam />;
  return (
    <>
      <PageHeading eyebrow="RCIVIC+" title="Ce chemin n’existe pas." />
      <a className="button button-primary" href="#/accueil">
        Retour à mon espace
      </a>
    </>
  );
}

export function App() {
  const [route, setRoute] = useState(window.location.hash.replace(/^#\/?/, '') || 'accueil');
  const [progress, setProgress] = useState<Progress | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [offlineError, setOfflineError] = useState(false);
  const load = useCallback(async () => {
    setLoadError('');
    try {
      setProgress((await loadProgress()) ?? createProgress());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Le stockage n’est pas accessible.');
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const update = () => setRoute(window.location.hash.replace(/^#\/?/, '') || 'accueil');
    const pwaError = () => setOfflineError(true);
    window.addEventListener('hashchange', update);
    window.addEventListener('civic-offline-error', pwaError);
    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener('civic-offline-error', pwaError);
    };
  }, []);
  useEffect(() => {
    setRate(progress?.preferences.audioRate ?? 1);
  }, [progress?.preferences.audioRate]);
  useEffect(() => {
    stop();
    document.querySelector<HTMLElement>('h1')?.focus();
    window.scrollTo(0, 0);
  }, [route, progress?.preferences.onboarded]);
  const commit = useCallback(async (next: Progress) => {
    setSaving(true);
    try {
      await saveProgress(next);
      setSaveError('');
    } catch (error) {
      setSaveError(
        `${error instanceof Error ? error.message : 'Sauvegarde indisponible.'} Les derniers progrès restent en mémoire, mais ne sont pas sauvegardés.`,
      );
    }
    setProgress(next);
    setSaving(false);
  }, []);
  const startSession = useCallback(
    async (pool: Question[], mode: QuizMode) => {
      if (!progress || saving) return;
      if (
        progress.activeSession &&
        !progress.activeSession.finishedAt &&
        !window.confirm(
          'Remplacer la session en cours ? Vos réponses déjà enregistrées restent dans votre progression, mais vous ne pourrez plus reprendre cette session.',
        )
      )
        return;
      const session = { ...startQuiz(pool, mode), xpAtStart: progress.xp };
      await commit({ ...progress, activeSession: session });
      navigate('quiz');
    },
    [progress, saving, commit],
  );
  if (!progress)
    return (
      <main className="startup">
        <div className="brand-mark">
          c<span>+</span>
        </div>
        <h1 tabIndex={-1}>RCIVIC+</h1>
        {loadError ? (
          <>
            <p role="alert">{loadError}</p>
            <p>Aucune donnée existante n’a été effacée.</p>
            <button className="button button-primary" onClick={() => void load()}>
              Réessayer sans effacer
            </button>
          </>
        ) : (
          <p role="status">Ouverture de votre espace d’apprentissage…</p>
        )}
      </main>
    );
  return (
    <AppContext.Provider value={{ progress, saving, commit, startSession }}>
      <Layout route={route}>
        {saveError && (
          <div className="notice error-notice" role="alert">
            <div>
              <p>{saveError}</p>
              <button
                className="button button-secondary"
                disabled={saving}
                onClick={() => void commit(progress)}
              >
                Réessayer la sauvegarde
              </button>
            </div>
          </div>
        )}
        {offlineError && (
          <p className="notice" role="status">
            Le mode hors connexion n’a pas pu être préparé. La progression locale reste disponible ;
            réessayez avec une connexion.
          </p>
        )}
        {progress.preferences.onboarded ? <Screen route={route} /> : <Welcome />}
      </Layout>
    </AppContext.Provider>
  );
}
