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

Lot introductif enrichi : 28 connaissances vérifiées et 12 situations originales. L’examen blanc de 40 questions est activé ; ses sélections doivent toujours respecter 28 connaissances et 12 exercices distincts. Ce corpus minimal reprend les mêmes notions à chaque examen, avec un ordre et des propositions mélangés ; il ne mesure pas la maîtrise des 191 énoncés CSP. Aucun score projeté /40 à partir d’un petit quiz. Pas de synchronisation entre appareils ou entre onglets ouverts simultanément ; utiliser un seul onglet pour étudier dans ce lot introductif. Le navigateur peut effacer ses données locales. Revue éditoriale humaine requise avant diffusion publique large.

## Installation sur téléphone et publication

L’installation PWA exige HTTPS et un domaine accessible. En développement local, le téléphone ne peut pas installer l’application depuis `127.0.0.1` ; la prévisualisation reste utilisable via un tunnel de développement. Pour une installation réelle : publier le dossier `dist` sur un hébergement HTTPS statique, ouvrir l’URL avec Chrome/Edge sur Android ou Safari sur iOS, puis « Installer l’application » / « Ajouter à l’écran d’accueil ». Après le premier chargement en ligne, le contenu embarqué fonctionne hors connexion. La progression reste locale à l’appareil ; exporter la sauvegarde avant de changer d’appareil. Une publication publique nécessite la revue éditoriale et l’audit d’accessibilité prévus dans la feuille de route.

### Déploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` construit l’application (`npm run check`) et publie `dist` sur GitHub Pages à chaque push sur `master`. Le site est servi en HTTPS sous `https://sterlingbosco.github.io/rcivic-plus/` ; la base relative `./` du build rend le sous-chemin compatible avec le manifest et le service worker. Pages a été activé une fois via l’API (`build_type=workflow`) car le jeton du workflow ne peut pas créer le site ; les déploiements suivants sont automatiques. Après le premier chargement en ligne, installer depuis le téléphone. Le déploiement public reste soumis aux portes éditoriales ci-dessus.
