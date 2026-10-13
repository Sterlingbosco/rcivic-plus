# RCIVIC+

Application web de **préparation pédagogique à l'examen civique** français (CSP / CR) : leçons courtes, quiz, révision espacée, examen blanc et suivi de progression. Sans compte, sans serveur, utilisable hors connexion après un premier chargement.

**En ligne : <https://sterlingbosco.github.io/rcivic-plus/>**

> RCIVIC+ est une application indépendante. Elle n'est ni éditée ni validée par le ministère de l'Intérieur. Les énoncés viennent de la liste ministérielle publique ; les propositions de réponse, explications et exercices sont créés pour l'entraînement et ne constituent pas un corrigé officiel. L'examen blanc est une simulation pédagogique, jamais « le vrai examen », et réussir l'entraînement ne garantit pas la réussite.

## Fonctionnalités

- Un profil par examen : **carte de séjour pluriannuelle (CSP)**, **carte de résident (CR)** et **naturalisation**. Leçons, entraînement, révision, examen blanc et statistiques suivent le profil choisi.
- Cinq thèmes de l'examen : principes et valeurs, institutions, droits et devoirs, histoire et culture, vie en société.
- Leçons, quiz avec correction bienveillante, réponses multiples (cocher toutes les bonnes réponses), révision intelligente des erreurs, répétition espacée.
- Examen blanc : 28 questions de connaissance + 12 mises en situation, 45 minutes, seuil 32/40, sans correction avant la fin.
- XP, séries et badges ; statistiques par thème.
- Mode clair / sombre (automatique ou réglé dans Paramètres), lecture audio par la voix du navigateur, texte redimensionnable jusqu'à 200 %.
- PWA installable ; progression stockée localement (IndexedDB) et exportable en JSON.

## Installer sur un téléphone

RCIVIC+ est une application web installable (PWA). Pour Android, un APK est aussi joint à chaque release ; il n'y a pas de publication sur un magasin d'applications.

**Android : APK (contenu embarqué, hors connexion dès l'installation)**

1. Télécharger `rcivic-plus-<version>-debug.apk` depuis la [dernière release](https://github.com/Sterlingbosco/rcivic-plus/releases/latest).
2. L'ouvrir sur le téléphone et autoriser l'installation depuis cette source si Android le demande.
3. Lancer RCIVIC+ : tout le contenu est dans l'application, sans connexion nécessaire.

L'APK est signé avec une clé de **debug** (adaptée à une installation directe, pas à un magasin d'applications) ; les mises à jour passent par un nouvel APK. Sa progression est **séparée** de celle de la version web : exportez puis refaites vos réglages plutôt que d'attendre une synchronisation. Il est construit par GitHub Actions (`.github/workflows/android.yml`) et n'a pas encore été testé sur un téléphone réel.

**Android (Chrome, sans APK)**

1. Ouvrir <https://sterlingbosco.github.io/rcivic-plus/> dans Chrome, **avec une connexion**.
2. Menu ⋮ → **Installer l'application** (ou **Ajouter à l'écran d'accueil**), puis confirmer.
3. Lancer RCIVIC+ depuis l'icône ainsi créée.

**iPhone / iPad (Safari)** : bouton Partager → **Sur l'écran d'accueil**.

**Hors connexion** : après ce premier chargement en ligne, le contenu (leçons, quiz, examen blanc) fonctionne sans réseau et la progression reste sur l'appareil. Seuls les liens vers les pages sources officielles demandent une connexion. Pensez à exporter votre progression (Paramètres) avant de changer d'appareil ou d'effacer les données du navigateur : elle n'est pas synchronisée.

Le fonctionnement hors connexion est vérifié par des tests automatisés sur navigateur ; l'installation sur des téléphones réels n'a pas encore été testée.

## État du contenu

**Profil CSP** : 178 des 191 énoncés officiels extraits sont publiés avec une réponse vérifiée sur une source institutionnelle (fiches de formation-civique.interieur.gouv.fr en priorité, puis Service Public, BnF, Légifrance, etc.). Les 13 autres attendent une source lisible ou un arbitrage éditorial. Toutes les réponses restent à relire par un humain (`humanReviewed: false`).

**Profils CR et naturalisation** : la structure est en place et leurs listes officielles sont extraites (209 énoncés pour la CR, 244 pour la naturalisation), mais aucun énoncé n'est encore publié ; ces profils affichent « contenu en préparation » plutôt que de reprendre des questions d'un autre niveau.

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
