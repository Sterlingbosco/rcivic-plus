# RCIVIC+

Application web de **préparation pédagogique à l'examen civique** français (CSP / CR) : leçons courtes, quiz, révision espacée, examen blanc et suivi de progression. Sans compte, sans serveur, utilisable hors connexion après un premier chargement.

**En ligne : <https://sterlingbosco.github.io/rcivic-plus/>**

> RCIVIC+ est une application indépendante. Elle n'est ni éditée ni validée par le ministère de l'Intérieur. Les énoncés viennent de la liste ministérielle publique ; les propositions de réponse, explications et exercices sont créés pour l'entraînement et ne constituent pas un corrigé officiel. L'examen blanc est une simulation pédagogique, jamais « le vrai examen », et réussir l'entraînement ne garantit pas la réussite.

## Fonctionnalités

- Cinq thèmes de l'examen : principes et valeurs, institutions, droits et devoirs, histoire et culture, vie en société.
- Leçons, quiz avec correction bienveillante, réponses multiples (cocher toutes les bonnes réponses), révision intelligente des erreurs, répétition espacée.
- Examen blanc : 28 questions de connaissance + 12 mises en situation, 45 minutes, seuil 32/40, sans correction avant la fin.
- XP, séries et badges ; statistiques par thème.
- Mode clair / sombre (automatique ou réglé dans Paramètres), lecture audio par la voix du navigateur, texte redimensionnable jusqu'à 200 %.
- PWA installable ; progression stockée localement (IndexedDB) et exportable en JSON.

## État du contenu

178 des 191 énoncés officiels extraits sont publiés avec une réponse vérifiée sur une source institutionnelle (fiches de formation-civique.interieur.gouv.fr en priorité, puis Service Public, BnF, Légifrance, etc.). Les 13 autres attendent une source lisible ou un arbitrage éditorial. Toutes les réponses restent à relire par un humain (`humanReviewed: false`).

Détail et limites : [PROJECT_STATUS.md](PROJECT_STATUS.md) et [docs/SOURCES.md](docs/SOURCES.md).

## Démarrer

Prérequis : Node.js 20.11 ou plus.

```powershell
npm.cmd ci
npm.cmd run dev        # serveur de développement
```

Sous Windows, utiliser PowerShell et `npm.cmd` (le shim npm de Git Bash ne fonctionne pas sur le poste de développement d'origine) ; ailleurs, `npm` suffit.

| Commande                | Rôle                                                   |
| ----------------------- | ------------------------------------------------------ |
| `npm run check`         | Corpus, types, lint, format, tests unitaires et build  |
| `npm run test:e2e`      | Tests Playwright (Chromium) sur le build de production |
| `npm run validate:data` | Validation du corpus uniquement                        |
| `npm run format`        | Prettier : à lancer avant de commiter                  |

Chaque push sur `master` reconstruit, valide et déploie sur GitHub Pages.

## Organisation du code

| Dossier           | Contenu                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `src/data/`       | Corpus : questions, thèmes, badges, sources (JSON, pas de code)         |
| `src/domain/`     | Moteurs purs : schémas, quiz, progression, révision, statistiques       |
| `src/platform/`   | IndexedDB, audio, service worker, thème                                 |
| `src/components/` | Composants accessibles et icônes SVG originales                         |
| `src/screens/`    | Écrans de l'application                                                 |
| `data/`           | Matière brute hors bundle : 191 énoncés officiels et réponses du client |
| `docs/`           | Architecture, modèle de données, sources, tests, UX, feuille de route   |

React, TypeScript strict, Vite, CSS natif ; pas de backend, de bibliothèque d'interface ni de service payant.

## Contribuer au contenu

Règle première : **aucune question publiée sans réponse vérifiée** sur une source institutionnelle, avec l'énoncé copié à l'identique depuis la liste officielle, et une réponse douteuse laissée de côté. La politique éditoriale est dans [docs/CONTENT_GUIDELINES.md](docs/CONTENT_GUIDELINES.md), le format des données dans [docs/DATA_MODEL.md](docs/DATA_MODEL.md). Un ajout touche `src/data/questions.json`, `src/data/sources.json`, les compteurs de `tests/data.test.ts`, `PROJECT_STATUS.md` et `docs/SOURCES.md`.

## Sources et licences

Les énoncés et fiches du ministère de l'Intérieur sont sous licence ouverte Etalab 2.0, sauf contenus de tiers signalés ; chaque réponse renvoie à sa source et à sa date de vérification. Aucune licence n'est encore définie pour le code de ce dépôt.
