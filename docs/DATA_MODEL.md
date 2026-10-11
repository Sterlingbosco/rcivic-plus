# Contrats de données

## Question publiée

`id` stable CSP-TH-NNN ; `level: CSP` ; `theme` parmi principes_valeurs, institutions, droits_devoirs, histoire_culture, vie_societe ; `subtheme` ; `type` parmi QUESTION_OFFICIELLE et EXERCICE_ENTRAINEMENT ; `question` ; quatre `answers` distinctes ; `correctAnswer` entier 0..3 ; `explanation`, `keyPoint` ; `explanationType: CONTENU_PEDAGOGIQUE` ; `choicesType: EXERCICE_ENTRAINEMENT` ; `sourceId` de l’énoncé pour une question officielle ; `answerSourceId` ; `status: source_checked` ; `humanReviewed: false` tant que la revue humaine n’est pas attestée.

Les questions officielles utilisent exactement l’énoncé publié, à la normalisation des espaces près. La source vérifie une connaissance, elle ne fournit pas nécessairement un corrigé. `source_checked` signifie vérification documentaire et non certification ministérielle ou validation humaine.

## Source

ID stable, organisme, titre, URL HTTPS consultée, date de consultation, date de modification lorsqu’elle est connue, licence et type institutionnel. Une URL de source est centralisée, pas recopiée dans les composants.

## Progression locale version 1

XP, leçons comprises (IDs), événements récompensés (IDs), dates locales d’activité, préférences (objectif quotidien, vitesse audio, onboarding), statistiques par question, historique limité aux 50 dernières sessions, `earnedBadges` conservés définitivement et `examSummary` cumulatif (nombre, somme des scores, meilleur score). Ces agrégats ne disparaissent pas quand une ancienne session sort de l’historique. `QuestionStats` : attempts, correct, incorrect, consecutiveCorrect, mastery (0..1), lastCorrect, lastAttempt, nextReview. Les tentatives d’examen ne révèlent rien avant la fin. La couverture (questions vues / corpus publié) et l’exactitude (bonnes réponses / tentatives) sont deux mesures différentes.

## Session

ID, mode training/review/exam, questions et choix mélangés, curseur, réponses nullables, startedAt, deadline pour examen, finishedAt. Aucun doublon, réponse unique et immuable après validation. Une session reprise conserve l’ordre et les réponses. `getResult` n’est disponible qu’après fin.

## Audit

Copie textuelle du DOCX intégral, empreinte SHA-256, 189 réponses réparties selon les cinq rubriques, 191 énoncés téléchargés avec URL/date. Aucun alignement automatique aveugle : une omission décale les positions suivantes. Les éléments non publiés restent à vérifier.

## Validation

Schémas Zod stricts aux frontières du corpus et d’IndexedDB ; contrôle des références et unicité des IDs, quatre choix distincts, thèmes/types, réponse, dates, explications et correspondance avec les énoncés officiels. `npm run validate:data` doit échouer en présence de toute anomalie.
