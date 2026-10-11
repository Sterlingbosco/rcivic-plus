# RCIVIC+ — règles permanentes

## Produit et architecture

- Nom du produit : RCIVIC+. Conserver les clés historiques `civic-plus` d’IndexedDB et du cache PWA ainsi que l’ID du manifest pour préserver progression et installation lors du renommage.
- Application indépendante de préparation CSP, en français, mobile-first, sans compte ni backend en V1.
- Stack : React, TypeScript strict, Vite, CSS natif ; npm et package-lock.json. Node >=20.11.0. Sous Windows utiliser PowerShell et npm.cmd ; le shim npm sous Git Bash ne fonctionne pas sur ce poste.
- Séparer `src/domain` (moteurs purs), `src/data` (contenu), `src/platform` (IndexedDB/audio/PWA), `src/components` et `src/screens` (UI). Pas de logique métier critique ni de données officielles dans les templates.
- Modules courts, fonctions testables, composants réutilisables ; pas de `any`, de framework UI ou d’abstraction spéculative.
- Avant toute modification, lire les conventions et identifier les parcours existants. Ne jamais supprimer ni remplacer les documents client.

## Contenu

- Lire intégralement les deux références racine. Le DOCX est une matière première, pas une source officielle. Extraction reproductible : `py -3 scripts/audit_content.py Reponses_Examen_Civique_CSP.docx`.
- Trois catégories distinctes : QUESTION_OFFICIELLE, CONTENU_PEDAGOGIQUE, EXERCICE_ENTRAINEMENT. Les choix QCM, réponses rédigées et explications sont pédagogiques sauf preuve explicite contraire.
- Questions et sources uniquement dans les données. IDs stables, source de l’énoncé et source vérifiant la réponse séparées, dates et attribution enregistrées. Ne pas modifier silencieusement un énoncé officiel.
- Ne publier que le contenu vérifié. Préserver les 191 énoncés officiels et les 189 réponses client dans `data/reference-audit.json`, y compris les doublons et éléments en attente de revue.
- Utiliser en priorité ministère de l’Intérieur, DGEF, Service Public, Vie publique ; ne jamais inventer une source. Actualiser les informations variables avant publication.
- Les situations officielles ne sont pas publiques. Afficher « Exercice de mise en situation pour l’entraînement. » pour tout scénario original.
- Les statistiques pédagogiques ne garantissent jamais la réussite à l’examen officiel. Ne pas simuler 40 questions avec des répétitions lorsque le corpus est insuffisant.

## UX, accessibilité et confidentialité

- Une action principale claire, feedback bienveillant immédiat en entraînement, jamais de correction immédiate en examen.
- HTML sémantique, clavier complet, focus visible, labels, contraste AA, cibles tactiles >=44px, texte redimensionnable, `prefers-reduced-motion`.
- Aucune donnée administrative, aucun secret frontend, aucun traceur, aucune ressource externe obligatoire. Valider corpus et sauvegardes aux frontières.
- IndexedDB versionné, erreurs de sauvegarde visibles, aucune remise à zéro silencieuse. Une suppression de progression nécessite confirmation explicite.
- Préférer fonctions natives et dépendances stables, maintenues, sous licence compatible ; conserver les versions et le lockfile.

## Vérification et Git

- Sous Windows, arrêter les serveurs Vite avant `npm ci` : leur processus esbuild peut verrouiller `esbuild.exe` (EPERM). Ne pas modifier les permissions système ni supprimer manuellement les dépendances pour contourner ce verrou.
- npm 10.2.4 peut échouer lors de changements de dépendances avec l’erreur interne `edgesOut` : utiliser ponctuellement `npx.cmd --yes --package npm@10.9.4 npm install ...`, sans changer npm global ni contourner la résolution des pairs. Vitest 4.1.11 et typescript-eslint 8.50.1 sont compatibles avec ce runtime ; ne pas réintroduire les anciennes versions vulnérables.
- Commandes : `npm.cmd ci`, `npm.cmd run dev`, `npm.cmd run validate:data`, `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run format:check`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run test:e2e`.
- `npm.cmd run check` réunit validation, types, lint, format, tests et build. Tester le service worker sur le build de production, pas le serveur de développement.
- Tester sélection, correction, score, XP idempotents, badges, dates/séries, répétition espacée, statistiques, sauvegarde et parcours complet. Tests synthétiques séparés du corpus publié.
- Vérifier 320px, 390px, tablette, desktop, clavier, zoom, réduction des animations, erreurs console et fonctionnement hors ligne. Ne pas déclarer une conformité WCAG sans audit complet.
- Mettre à jour les contrats techniques et l’état produit lorsque leur réalité change ; garder les limites éditoriales explicites.
- Commits atomiques et messages expliquant l’intention ; validation avant commit. Ne pas modifier git config, ne pas commit/push sans demande, ne jamais écraser les modifications utilisateur.
