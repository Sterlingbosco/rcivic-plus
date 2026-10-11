import { sources, officialQuestions, situations } from '../data/content';
import { PageHeading } from '../components/Primitives';
import { Icon } from '../components/Icon';

export function Sources() {
  return (
    <>
      <PageHeading
        eyebrow="LA CONFIANCE COMMENCE PAR LA TRANSPARENCE"
        title="Des repères. Des sources. Pas de confusion."
        description="RCIVIC+ est une application indépendante de préparation à l’examen civique CSP, sans affiliation gouvernementale."
      />
      <div className="content-types">
        <article className="card">
          <span className="tag tag-blue">QUESTION OFFICIELLE</span>
          <h2>L’énoncé publié</h2>
          <p>
            Repris de la liste ministérielle CSP. {officialQuestions.length} énoncés sont intégrés
            dans ce premier lot, sur 191 énoncés extraits de la publication consultée.
          </p>
        </article>
        <article className="card">
          <span className="tag">CONTENU PÉDAGOGIQUE</span>
          <h2>Pour mieux comprendre</h2>
          <p>
            Les réponses rédigées, résumés et explications sont créés par RCIVIC+ à partir de
            sources institutionnelles. Ce n’est pas un corrigé officiel.
          </p>
        </article>
        <article className="card">
          <span className="tag tag-training">EXERCICE D’ENTRAÎNEMENT</span>
          <h2>Pour mettre en pratique</h2>
          <p>
            Les propositions QCM et les {situations.length} situations originales sont pédagogiques.
            Les situations officielles de l’examen ne sont pas publiées.
          </p>
        </article>
      </div>
      <section className="notice">
        <Icon name="shield" />
        <p>
          <strong>Un premier lot, pas encore le corpus complet.</strong>
          <br />
          Vérification documentaire le 11 octobre 2026. Revue éditoriale humaine non attestée. Les
          scores de l’application ne garantissent pas la réussite à l’examen.
        </p>
      </section>
      <section className="sources-list">
        <h2>Les références consultées</h2>
        {sources.map((source) => (
          <article className="source-card" key={source.id}>
            <span className="icon-tile blue">
              <Icon name="link" size={20} />
            </span>
            <div>
              <span className="eyebrow">{source.organization}</span>
              <h3>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                  <span className="sr-only"> — nouvelle fenêtre</span>
                </a>
              </h3>
              <p>
                Consultée le {new Date(`${source.checkedAt}T12:00:00`).toLocaleDateString('fr-FR')}
                {source.updatedAt
                  ? ` · mise à jour indiquée : ${new Date(`${source.updatedAt}T12:00:00`).toLocaleDateString('fr-FR')}`
                  : ' · date de modification non indiquée'}
              </p>
              <small>{source.license}</small>
            </div>
          </article>
        ))}
      </section>
      <section className="card">
        <h2>Votre confidentialité</h2>
        <p>
          Pas de compte obligatoire, de publicité ni de suivi analytique. Aucune donnée
          administrative n’est demandée. Votre progression est conservée sur cet appareil.
          L’ouverture d’un lien externe vous amène sur le site de la source, avec ses propres règles
          de confidentialité.
        </p>
        <h2>À propos de cette version</h2>
        <p>
          RCIVIC+ 0.1.0 · parcours introductif CSP. Les graphismes sont originaux et les énoncés
          sont attribués au ministère de l’Intérieur. Les références client sont préservées ; aucune
          réponse non vérifiée n’est présentée comme officielle.
        </p>
      </section>
    </>
  );
}
