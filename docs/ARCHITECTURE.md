# Architecture RCIVIC+

## Décision technique

Application statique React + TypeScript strict + Vite. React est retenu pour les écrans interdépendants (apprentissage, quiz, correction, résultats, révision), les états et la réutilisation accessible des composants. Vanilla TypeScript aurait un bundle inférieur mais imposerait ici de maintenir manuellement les rendus et transitions. Un framework serveur serait inutile sans comptes ni backend. CSS natif, polices système, icônes SVG originales, pas de bibliothèque UI, pas de routeur tiers.

Vite 6 est compatible avec Node 20.11 installé ; Vite 7 nécessite un Node plus récent. Versions fixées et lockfile. Vitest pour les fonctions pures, Playwright pour l’intégration navigateur et les parcours, ESLint et Prettier pour la qualité. Aucun service payant ou clé API.

## Frontières

- `src/data` : corpus publié, thèmes, badges, sources ; JSON importé au build et validé avant distribution.
- `src/domain` : schémas, quiz indépendant de React, révision, récompenses et statistiques. Temps et aléa injectables pour les tests.
- `src/platform` : IndexedDB, SpeechSynthesis et intégration PWA.
- `src/components` : navigation, icônes, progression et présentation réutilisable.
- `src/screens` : accueil, thèmes, étude, quiz, résultats, révision, progression, paramètres et sources.
- `data/reference-audit.json` : matière première intégrale, non incluse dans le bundle public.
- `scripts` : extraction DOCX/corpus et préparation du service worker de production.
- `tests` : tests unitaires et E2E, corpus synthétique non publié.

## Flux

Données validées → sélection de questions → moteur de session → rendu. La réponse soumise produit une nouvelle session et une mise à jour idempotente de la progression. L’état utilisateur est validé puis écrit dans IndexedDB avant confirmation durable. Les erreurs de stockage sont affichées sans prétendre que la sauvegarde a réussi. Les pages sont adressables par hash ; les sessions actives sont sauvegardées pour reprise.

## Hors connexion

Le build embarque les données et les ressources. Service worker limité aux ressources de même origine, cache versionné généré à partir du build, activation contrôlée. Les liens institutionnels restent externes et nécessitent une connexion. La synthèse vocale dépend des voix installées sur l’appareil.

## Limites produit

Premier lot introductif, pas corpus complet. Examen blanc non activé tant que 28 connaissances et 12 scénarios distincts vérifiés ne sont pas disponibles. Aucun score projeté /40 à partir d’un petit quiz. Pas de synchronisation entre appareils ou entre onglets ouverts simultanément ; utiliser un seul onglet pour étudier dans ce lot introductif. Le navigateur peut effacer ses données locales. Revue éditoriale humaine requise avant diffusion publique large.
