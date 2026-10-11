# Vérification du produit

## Commandes

PowerShell Windows : `npm.cmd ci`, `npm.cmd run dev`. Node >=20.11.0 ; npm >=10.2.4. Aucune clé nécessaire.

- `npm run validate:data` : schémas stricts et cohérence corpus/sources/énoncés officiels.
- `npm run typecheck` : TypeScript sans émission.
- `npm run lint` : ESLint.
- `npm run format:check` : Prettier ; `npm run format` pour formater.
- `npm test` : Vitest, moteurs et intégration de session.
- `npm run build` : compilation et ressources PWA.
- `npm run test:e2e` : Playwright sur le build servi localement ; installer Chromium avec `npx playwright install chromium` si nécessaire.
- `npm run check` : validation, types, lint, format, tests, build.

## Couverture attendue

Quiz : sélection sans doublons, choix mélangés, validation 0..3, double soumission refusée, aucune fuite de correction/score en examen, fin et score exacts. Récompenses : bonnes réponses +10, leçon +30 une seule fois, erreur sans pénalité, reprise sans doublon. Révision : erreurs répétées en tête, échéances, intervalles 1/3/7/14/30 jours, reset après erreur. Statistiques : couverture différente de précision, thèmes et série calculée en date locale.

Intégration : session du début au résultat, examen synthétique complet de 40 questions, fin à échéance et reprise, IndexedDB après rechargement, sauvegarde corrompue signalée sans effacement. Les questions synthétiques ne sont jamais publiées.

E2E : accueil → thème → leçon → quiz → erreur → correction → résultat → révision → progression. Vérifier formats 320, 390, 768, 1440px, absence de débordement, clavier et focus ; conserver les erreurs console et réseau. Vérifier absence de score inventé et garde du mode examen tant que corpus insuffisant.

PWA : manifest, icônes, installation disponible selon navigateur ; attente du service worker, rechargement hors ligne du build après premier chargement. Les sources distantes et certaines voix restent dépendantes du réseau/appareil.

## Portée

Les tests automatiques ne prouvent pas à eux seuls WCAG 2.2 AA. Validation lecteur d’écran humain et revue du corpus nécessaires avant publication générale. Ne cocher un contrôle qu’après son exécution réelle.

## Matrice du lot introductif

Contrôles exécutés le 11 octobre 2026 :

| Contrôle                                                                | Résultat                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| Réinstallation depuis le lockfile, après arrêt des serveurs Vite        | `npm ci` réussi                                               |
| Validation des données, types, lint sans avertissement, format et build | `npm run check` réussi                                        |
| Tests unitaires et données                                              | 18 tests réussis                                              |
| Parcours, persistance, responsive, clavier, examen synthétique et PWA   | 12 tests Chromium réussis                                     |
| Largeurs testées                                                        | 320, 390, 768, 1440 px                                        |
| Texte agrandi et reflow                                                 | 200 % sur les principaux écrans                               |
| Contrastes des contrôles principaux et étiquettes                       | ratio >=4,5:1                                                 |
| Sauvegarde corrompue                                                    | erreur visible, données conservées                            |
| Échec de sauvegarde simulé puis nouvelle tentative                      | progression non prétendue sauvegardée, reprise sans double XP |
| Audit des paquets                                                       | aucune vulnérabilité signalée par npm                         |
| Contrôle headless indépendant                                           | HTTP 200, titre attendu, aucun échec réseau ni erreur console |

Captures d’inspection indépendantes générées dans `.devin/qa` par `tests/browser-qa.mjs`. Les captures automatiques E2E restent dans `test-results`, ignoré par Git. Sur cet environnement, le lecteur peut refuser les fichiers ignorés même après autorisation de lecture ; ne pas modifier les exclusions pour contourner ce comportement.

Les tests d’examen utilisent exclusivement des données synthétiques isolées dans le navigateur de test. Ils ne rendent pas le corpus publié suffisant pour activer l’examen blanc public.
