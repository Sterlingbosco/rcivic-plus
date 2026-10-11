# Registre des sources et audit

Consultation : 11 octobre 2026. Les URL exactes, organismes, titres et dates sont centralisés dans `src/data/sources.json` ; la matière première officielle et client est conservée dans `data/reference-audit.json`.

## Règles vérifiées

Ministère de l’Intérieur, Formation civique : https://formation-civique.interieur.gouv.fr/examen-civique/informations-g%C3%A9n%C3%A9rales-sur-lexamen-civique/

40 questions, 45 minutes, quatre propositions et une réponse correcte ; 28 connaissances et 12 mises en situation ; cinq thèmes ; réussite à 32/40. Depuis le 1er janvier 2026, certaines premières demandes CSP/CR sont concernées, avec exemptions ; le renouvellement n’exige pas l’attestation selon cette page. L’attestation n’a pas de durée de validité. RCIVIC+ ne détermine pas l’éligibilité administrative personnelle.

Liste officielle : https://formation-civique.interieur.gouv.fr/examen-civique/liste-officielle-des-questions-de-connaissance-csp/

191 énoncés extraits : 37 principes, 46 institutions, 30 droits, 47 histoire/géographie/culture, 31 société. Le site ne publie pas les réponses proposées ni les situations. Licence ouverte Etalab 2.0 sauf contenus de tiers signalés. Attribution et date obligatoires.

## Base client

DOCX lu intégralement, original inchangé et empreinte conservée. 189 réponses : 37/46/30/46/30. Une question historique (personnage français) manque ; les deux variantes officielles de « Pour qui l’école est-elle obligatoire ? » ne disposent que d’une réponse synthétique. Ne pas aligner les entrées suivantes sans tenir compte de ces omissions.

Les réponses du lot publié ont été rapprochées des fiches ministérielles (hymne, drapeau, devise, fête nationale, liberté de conscience, liberté et séparation des pouvoirs) et de Service Public pour 15/18. La fête nationale cite aussi 1790, absent du résumé client. Aucune réponse non revue du reste du corpus n’est publiée.

Le lot intégré contient désormais 28 énoncés officiels (8 principes, 6 institutions, 4 droits, 5 histoire/culture, 5 société) et 12 exercices originaux. Les ajouts ont été rapprochés des réponses client et vérifiés dans les fiches ministérielles Marianne, langue française, trois pouvoirs, liberté, Première Guerre mondiale, jours fériés, médecin généraliste et remboursement des soins. Les URL de ces fiches figurent dans le registre JSON. Les 163 autres énoncés restent hors du corpus publié.

Le nombre de situations est celui des exercices créés par RCIVIC+, pas celui de situations officielles récupérées. La composition de l’examen blanc est une simulation sur ce lot limité, sans garantie de représentativité de la banque complète.

## Indisponibilité

L’arrêté lié par le ministère, https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052381620, renvoie HTTP 403 au lecteur utilisé. Il n’est pas prétendu lu ni utilisé comme preuve complémentaire. Les règles ci-dessus ont été vérifiées dans la page ministérielle accessible. La page Vie publique sur le 11 novembre a demandé JavaScript/cookies, et celle d’Éduscol a renvoyé HTTP 403 ; elles ne sont pas utilisées comme preuve pour le lot ajouté. L’armistice et les dates de la Première Guerre mondiale ont été vérifiés dans les fiches accessibles du ministère de l’Intérieur.

## Statut éditorial

Vérification documentaire effectuée pour le lot introductif. Pas de revue humaine attestée, pas de certification officielle. Les explications, réponses formulées et distracteurs sont du contenu pédagogique original. Les 191 énoncés ne constituent pas 191 questions publiables sans vérification des réponses.
