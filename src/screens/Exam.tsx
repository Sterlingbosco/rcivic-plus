import { useApp } from '../app-context';
import { questions, officialQuestions, situations } from '../data/content';
import { EXAM_RULES, selectExamQuestions } from '../domain/quiz';
import { Icon } from '../components/Icon';
import { PageHeading, SourceLink } from '../components/Primitives';

export function Exam() {
  const { startSession, saving } = useApp();
  const available =
    officialQuestions.length >= EXAM_RULES.knowledge && situations.length >= EXAM_RULES.situations;
  return (
    <>
      <PageHeading
        eyebrow="SE PRÉPARER AUX CONDITIONS DE L’EXAMEN"
        title="Un objectif clair : 32 sur 40."
        description="Une simulation pédagogique, jamais une reproduction garantie des questions de votre examen."
      />
      <section className="exam-intro card">
        <span className="icon-tile large blue">
          <Icon name="target" size={38} />
        </span>
        <h2>Le format de l’examen civique</h2>
        <div className="exam-rules">
          <div>
            <strong>40</strong>
            <span>questions</span>
          </div>
          <div>
            <strong>45</strong>
            <span>minutes maximum</span>
          </div>
          <div>
            <strong>32</strong>
            <span>bonnes réponses requises</span>
          </div>
        </div>
        <ul>
          <li>28 questions de connaissance et 12 mises en situation.</li>
          <li>4 propositions, une seule réponse correcte.</li>
          <li>En examen blanc : aucun feedback ni XP par réponse.</li>
          <li>Navigation séquentielle ; le résultat et les recommandations arrivent à la fin.</li>
        </ul>
        <SourceLink id="exam-rules" />
        {available ? (
          <button
            className="button button-primary"
            disabled={saving}
            onClick={() => void startSession(selectExamQuestions(questions), 'exam')}
          >
            Démarrer mon examen blanc
            <Icon name="arrow" size={18} />
          </button>
        ) : (
          <div className="notice">
            <Icon name="clock" />
            <div>
              <strong>Le véritable examen blanc n’est pas encore disponible.</strong>
              <p>
                Ce premier lot comporte {officialQuestions.length} connaissances et{' '}
                {situations.length} situations d’entraînement. Il faut au moins 28 connaissances et
                12 situations distinctes vérifiées. Nous ne remplissons pas un faux examen avec des
                répétitions.
              </p>
              <a className="button button-primary" href="#/themes">
                Commencer par les notions disponibles
                <Icon name="arrow" size={18} />
              </a>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
