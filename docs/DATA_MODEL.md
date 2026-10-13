# Contrats de données

## Question publiée

`id` stable PROFIL-TH-NNN (CSP-PV-001, CR-SI-004…) ; `level` = profil d’examen parmi CSP, CR, NAT (naturalisation) ; `theme` parmi principes_valeurs, institutions, droits_devoirs, histoire_culture, vie_societe ; `subtheme` ; `type` parmi QUESTION_OFFICIELLE, QUESTION_PEDAGOGIQUE (reformulation, sans `sourceId`) et EXERCICE_ENTRAINEMENT ; `question` ; quatre `answers` distinctes ; `correctAnswer` entier 0..3, et `correctAnswers` (2 à 3 indices) pour une question à réponses multiples (`correctAnswer` = le plus petit) ; `extraSourceIds` pour des sources supplémentaires ; `explanation`, `keyPoint` ; `explanationType: CONTENU_PEDAGOGIQUE` ; `choicesType: EXERCICE_ENTRAINEMENT` ; `sourceId` de l’énoncé pour une question officielle ; `answerSourceId` ; `status: source_checked` ; `humanReviewed: false` tant que la revue humaine n’est pas attestée.

Les questions officielles utilisent exactement l’énoncé publié, à la normalisation des espaces près. La source vérifie une connaissance, elle ne fournit pas nécessairement un corrigé. `source_checked` signifie vérification documentaire et non certification ministérielle ou validation humaine.

## Source

ID stable, organisme, titre, URL HTTPS consultée, date de consultation, date de modification lorsqu’elle est connue, licence et type institutionnel. Une URL de source est centralisée, pas recopiée dans les composants.

## Progression locale version 1

XP, leçons comprises (IDs), événements récompensés (IDs), dates locales d’activité, préférences (objectif quotidien, vitesse audio, onboarding), statistiques par question, historique limité aux 50 dernières sessions, `earnedBadges` conservés définitivement et `examSummary` cumulatif (nombre, somme des scores, meilleur score). Ces agrégats ne disparaissent pas quand une ancienne session sort de l’historique. `QuestionStats` : attempts, correct, incorrect, consecutiveCorrect, mastery (0..1), lastCorrect, lastAttempt, nextReview. Les tentatives d’examen ne révèlent rien avant la fin. La couverture (questions vues / corpus publié) et l’exactitude (bonnes réponses / tentatives) sont deux mesures différentes.

## Session

ID, mode training/review/exam, questions et choix mélangés, curseur, réponses nullables, startedAt, deadline pour examen, finishedAt. Aucun doublon, réponse unique et immuable après validation. Une session reprise conserve l’ordre et les réponses. `getResult` n’est disponible qu’après fin. Il expose score, pourcentage, seuil pédagogique, erreurs, résultats par thème et recommandations triées selon les thèmes sous 80 % de réponses correctes dans cette session. En examen, les tentatives et les 100 XP de complétion sont enregistrés seulement à la fin ; l’échéance de 45 minutes reste identique après rechargement. Les questions sans réponse valent zéro dans le score mais ne créent pas de tentatives ni d’erreurs d’apprentissage fictives ; `unanswered` et `answeredErrors` distinguent ces deux cas dans le résultat.

## Audit

Copie textuelle du DOCX intégral, empreinte SHA-256, 189 réponses réparties selon les cinq rubriques, 191 énoncés téléchargés avec URL/date. Aucun alignement automatique aveugle : une omission décale les positions suivantes. Le fichier d’audit brut reste une archive immuable. Le statut courant du contenu intégré est porté par `src/data/questions.json` ; les 163 énoncés non publiés restent à vérifier. L’enrichissement conserve les IDs, le schéma de progression version 1 et les sessions déjà sauvegardées.

## Validation

Schémas Zod stricts aux frontières du corpus et d’IndexedDB ; contrôle des références et unicité des IDs, quatre choix distincts, thèmes/types, réponse, dates, explications et correspondance avec les énoncés officiels. `npm run validate:data` doit échouer en présence de toute anomalie.

## Progression

`preferences.profile` (CSP par défaut) désigne le profil actif. `examSummary` est un enregistrement par profil ; chaque entrée d’`history` porte son `profile`. XP, série et badges sont communs à tous les profils. Les sauvegardes antérieures aux profils sont migrées à la lecture (résumé et historique rattachés à CSP).
