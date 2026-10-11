import { useEffect, useState } from 'react';
import { useApp } from '../app-context';
import { exportProgress } from '../platform/storage';
import { Icon } from '../components/Icon';
import { PageHeading } from '../components/Primitives';

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export function Settings() {
  const { progress, commit, saving } = useApp();
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  useEffect(() => {
    const ready = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    window.addEventListener('beforeinstallprompt', ready);
    return () => window.removeEventListener('beforeinstallprompt', ready);
  }, []);
  async function installApp() {
    if (!install) return;
    await install.prompt();
    await install.userChoice;
    setInstall(null);
  }
  return (
    <>
      <PageHeading
        eyebrow="UN ESPACE QUI VOUS RESSEMBLE"
        title="À votre rythme, sur votre appareil."
        description="Aucun compte et aucune information administrative à renseigner."
      />
      <section className="card settings-card">
        <h2>Votre intention quotidienne</h2>
        <p>Un repère pour apprendre, pas une obligation ni un compteur de temps.</p>
        <fieldset className="setting-options">
          <legend className="sr-only">Objectif quotidien</legend>
          {([5, 10, 20, 30] as const).map((goal) => (
            <label
              className={
                progress.preferences.dailyGoal === goal
                  ? 'setting-option selected'
                  : 'setting-option'
              }
              key={goal}
            >
              <input
                type="radio"
                name="dailyGoal"
                checked={progress.preferences.dailyGoal === goal}
                disabled={saving}
                onChange={() =>
                  void commit({
                    ...progress,
                    preferences: { ...progress.preferences, dailyGoal: goal },
                  })
                }
              />
              {goal} min
            </label>
          ))}
        </fieldset>
      </section>
      <section className="card settings-card">
        <h2>Lecture audio</h2>
        <p>
          Voix du navigateur en français. La disponibilité hors ligne dépend des voix installées.
        </p>
        <label className="select-label">
          Vitesse de lecture
          <select
            value={progress.preferences.audioRate}
            disabled={saving}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (value === 0.8 || value === 1 || value === 1.2)
                void commit({
                  ...progress,
                  preferences: { ...progress.preferences, audioRate: value },
                });
            }}
          >
            <option value="0.8">0,8 × — plus lent</option>
            <option value="1">1 × — normal</option>
            <option value="1.2">1,2 × — plus rapide</option>
          </select>
        </label>
      </section>
      <section className="card settings-card">
        <h2>Votre progression vous appartient</h2>
        <p>
          Elle reste dans le stockage local du navigateur. Faites une copie avant de changer
          d’appareil ou d’effacer les données de votre navigateur.
        </p>
        <button className="button button-secondary" onClick={() => exportProgress(progress)}>
          <Icon name="download" size={19} />
          Exporter ma progression
        </button>
        <p className="content-disclaimer">
          Export de sauvegarde uniquement ; l’import et la synchronisation ne sont pas encore
          disponibles.
        </p>
      </section>
      <section className="card settings-card">
        <h2>Installer RCIVIC+</h2>
        <p>
          Après un premier chargement en ligne, le contenu embarqué peut être utilisé hors
          connexion. Les pages sources externes nécessitent une connexion.
        </p>
        {install ? (
          <button className="button button-primary" onClick={() => void installApp()}>
            Installer sur cet appareil
          </button>
        ) : (
          <p className="muted">
            Si le navigateur le permet, utilisez son menu « Installer l’application » ou « Ajouter à
            l’écran d’accueil ». Sur iPhone : Partager → Sur l’écran d’accueil.
          </p>
        )}
      </section>
    </>
  );
}
