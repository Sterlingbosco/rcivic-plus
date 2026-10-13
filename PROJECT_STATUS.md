# État produit RCIVIC+

Validation de RCIVIC+ 0.3.0 : 13 octobre 2026 (lot introductif initial en 0.2.0 le 11 octobre). Les cases ci-dessous portent sur cette première tranche exploitable, pas sur l’achèvement du cahier des charges complet.

- [x] environnement — Node 20.11 / npm 10.2 / Git audités ; références intégralement lues ; installation reproductible `npm ci` vérifiée
- [x] architecture — React / TypeScript strict / Vite ; séparation données, moteurs, plateforme et UI
- [x] design system — tokens, composants, feedbacks, graphismes originaux et rendu mobile/desktop examinés
- [x] données — 178 énoncés officiels vérifiés + 4 reformulations pédagogiques + 12 exercices originaux publiés ; thèmes Institutions (46/46) et Principes et valeurs (37/37) complets ; schémas et sources validés ; 191 énoncés + 189 réponses client intégralement préservés hors bundle
- [x] moteur quiz — sélection sans doublons, choix mélangés, validation, correction, score et reprise
- [x] apprentissage — cinq unités introductives, 182 micro-leçons, explications, notions clés, sources et audio navigateur
- [x] révision — erreurs persistées et sélection priorisée ; écran des erreurs et révision intelligente
- [x] répétition espacée — intervalles configurables 1/3/7/14/30 jours, reset après erreur et tests
- [x] gamification — XP idempotents, niveaux d’expérience, séries et dix badges présentés ; badges acquis conservés
- [x] examen blanc — 40 questions distinctes tirées du corpus publié (28 connaissances parmi 178 + 12 exercices), 45 minutes, seuil 32/40 ; sans feedback/XP avant la fin ; reprise, résultats par thème, recommandations et corrections finales vérifiés sur mobile
- [x] statistiques — couverture du lot, précision, tentatives, thèmes, historique et agrégats d’examens
- [x] mode sombre — thème automatique (préférence système) ou réglé dans Paramètres › Apparence (clair / sombre, mémorisé localement) ; toutes les couleurs passent par des variables CSS (`tokens.css`), valeurs sombres dans `dark.css` ; contraste AA du texte contrôlé automatiquement sur dix écrans dans les deux thèmes (`tests/contrast-scan.spec.ts`), pas d’audit humain
- [x] PWA — manifest, icônes PNG 192/512, service worker versionné ; rechargement, apprentissage et sauvegarde hors connexion testés après premier chargement
- [x] accessibilité — contrôles initiaux clavier, focus, radios, cibles tactiles, contrastes des contrôles, animations réduites et texte à 200 % ; conformité WCAG complète non certifiée
- [x] tests — 21 tests unitaires/de données et 14 tests Chromium passent ; lint, types, format, corpus, build et npm audit validés
- [x] documentation — règles et sept contrats produit dans docs, registre des sources et audit brut
- [x] audit final — lot introductif vérifié, prévisualisation HTTP 200, aucune erreur console/réseau dans le contrôle navigateur, limites explicites

## Vérifications reproductibles

`npm.cmd ci`, `npm.cmd run check`, `npm.cmd run test:e2e`, `npm.cmd audit`.

Build : JavaScript environ 344 kB brut / 99 kB gzip ; CSS environ 29 kB brut / 7 kB gzip. Corpus brut client/officiel non distribué au navigateur. Les tailles sont celles du lot introductif, pas un benchmark smartphone.

## Limites avant publication générale

- Les 13 autres énoncés officiels extraits n’ont pas encore de QCM publié avec réponse individuellement vérifiée ; l’énoncé CSP-DD-002 est différé (réponse ambiguë entre Constitution et DDHC).
- Revue éditoriale humaine non attestée ; les explications et choix ne sont pas un corrigé officiel.
- L’examen blanc reste une simulation sur un corpus en cours d’extension : il tire 28 connaissances parmi 178, avec mélange, mais ne mesure pas la préparation sur les 191 énoncés ; les situations ne sont pas officielles.
- Audit lecteur d’écran humain, téléphones réels et installation iOS/Android restent nécessaires. La présence d’un manifest n’atteste pas tous ces contrôles. Le site est publié sur GitHub Pages (HTTPS) ; l’installation sur téléphone réel reste à vérifier.
- Progression locale, sans compte, synchronisation ou import de sauvegarde ; export JSON disponible. Utiliser un seul onglet pour étudier : les modifications concurrentes entre onglets ne sont pas encore synchronisées.
- Node 20.11 et ESLint 9 sont un compromis de compatibilité du poste existant ; actualiser le runtime vers une LTS maintenue et les branches majeures des outils avant une maintenance longue durée. npm audit ne remplace pas le suivi de support.
- Commits atomiques créés localement, sans push. Documents originaux conservés.
