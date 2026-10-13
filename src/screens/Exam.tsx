import { useApp } from '../app-context';
import { questions, officialQuestions, situations, officialCorpusTotal } from '../data/content';
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
        title={`Un objectif clair : ${EXAM_RULES.target} sur ${EXAM_RULES.questions}.`}
        description="Une simulation pédagogique, jamais une reproduction garantie des questions de votre examen."
      />
      <section className="exam-intro card">
        <span className="icon-tile large blue">
          <Icon name="target" size={38} />
        </span>
        <h2>Le format de l’examen civique</h2>
        <div className="exam-rules">
          <div>
            <strong>{EXAM_RULES.questions}</strong>
            <span>questions</span>
          </div>
          <div>
            <strong>{EXAM_RULES.minutes}</strong>
            <span>minutes maximum</span>
          </div>
          <div>
            <strong>{EXAM_RULES.target}</strong>
            <span>bonnes réponses requises</span>
          </div>
        </div>
        <ul>
          <li>
            {EXAM_RULES.knowledge} questions de connaissance et {EXAM_RULES.situations} mises en
            situation.
          </li>
          <li>4 propositions, une seule réponse correcte.</li>
          <li>En examen blanc : aucun feedback ni XP par réponse.</li>
          <li>Navigation séquentielle ; le résultat et les recommandations arrivent à la fin.</li>
        </ul>
        <SourceLink id="exam-rules" />
        {available ? (
          <>
            <div className="notice">
              <Icon name="shield" />
              <p>
                <strong>Un examen blanc d’entraînement, sur un corpus encore limité.</strong>
                <br />
                Les {EXAM_RULES.situations} situations sont des exercices originaux, pas les
                situations officielles non publiées. Ce lot contient {officialQuestions.length}{' '}
                connaissances vérifiées : chaque examen en tire {EXAM_RULES.knowledge}, avec un
                ordre et des choix mélangés. Un score élevé ne prouve pas la maîtrise des{' '}
                {officialCorpusTotal} connaissances du corpus CSP.
              </p>
            </div>
            <button
              className="button button-primary"
              disabled={saving}
              onClick={() => void startSession(selectExamQuestions(questions), 'exam')}
            >
              Démarrer mon examen blanc
              <Icon name="arrow" size={18} />
            </button>
          </>
        ) : (
          <div className="notice">
            <Icon name="clock" />
            <div>
              <strong>Le véritable examen blanc n’est pas encore disponible.</strong>
              <p>
                Ce premier lot comporte {officialQuestions.length} connaissances et{' '}
                {situations.length} situations d’entraînement. Il faut au moins{' '}
                {EXAM_RULES.knowledge} connaissances et {EXAM_RULES.situations} situations
                distinctes vérifiées. Nous ne remplissons pas un faux examen avec des répétitions.
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
