# Plan : intégrer les contenus CR et naturalisation

Objectif : que les profils **CR** (carte de résident) et **NAT** (naturalisation) aient leur propre formation, entraînement, révision et examen blanc, avec la même exigence que le profil CSP : aucune question publiée sans réponse vérifiée sur une source institutionnelle, énoncés copiés à l'identique depuis la liste officielle, énoncé douteux laissé dehors.

## 1. Point de départ (13/10/2026)

| Profil | Liste officielle | Énoncés | Par thème (PV / SI / DD / HC / VS) | Publié |
| ------ | ---------------- | ------- | ---------------------------------- | ------ |
| CSP    | page ministère   | 191     | 37 / 46 / 30 / 47 / 31             | 178    |
| CR     | page ministère   | 209     | 40 / 50 / 38 / 49 / 32             | 170    |
| NAT    | PDF ministère    | 244     | 35 / 54 / 36 / 76 / 43             | 201    |

- Extractions reproductibles : `scripts/extract_official_list.py` → `data/reference-audit-cr.json`, `data/reference-audit-nat.json` (hors bundle, empreinte SHA-256 conservée).
- NAT : 1 doublon exact conservé dans l'audit (publié une seule fois) ; une cellule « ? » vide du PDF ignorée.
- Chaque liste ne donne que les énoncés. Les propositions QCM, explications et corrigés sont créés par RCIVIC+ (pédagogiques), jamais présentés comme officiels.

## 2. Méthode

1. **Reprise automatique** : un énoncé identique (à l'espace près) à un énoncé CSP déjà publié est cloné vers CR / NAT avec un nouvel identifiant, son niveau et sa source de liste (`cr-list` / `nat-list`) ; sa réponse, ses sources et ses explications sont déjà vérifiées. 31 énoncés CR et 34 NAT sont dans ce cas.
2. **Vérification par agents** : les 387 autres énoncés sont répartis en 21 lots de 15 à 25. Chaque agent lit une fiche institutionnelle (formation-civique.interieur.gouv.fr, vie-publique, Service Public, Légifrance, institutions) pour chaque énoncé et produit un JSON dans le scratchpad, **sans toucher au dépôt**. Règles :
   - réponse non certaine, source illisible ou énoncé trop ouvert → différé avec motif, jamais de devinette ;
   - énoncé ouvert avec plusieurs bonnes réponses défendables → QCM à **réponses multiples** (2 ou 3 bonnes réponses, chacune sourcée, il faut toutes les cocher) ;
   - valeurs variables (Smic, taux, durées) → valeur à la date du jour avec source datée, sinon différé ;
   - titres de sources lus sur la page, jamais déduits d'une URL.
3. **Situations d'entraînement** : l'examen blanc exige 12 situations originales par profil. Deux agents en rédigent 12 pour CR et 12 pour NAT (type `EXERCICE_ENTRAINEMENT`, réponse sourcée, mention « exercice de mise en situation »).
4. **Fusion par l'orchestrateur** (jamais par les agents) : contrôle de chaque sortie, dédoublonnage des sources par URL, attribution des identifiants `CR-PV-NNN`, `NAT-HC-NNN`…, mise à jour de `questions.json` et `sources.json`.
5. **Arbitrage humain** pour les différés : liste des énoncés ambigus avec cases à cocher, comme `docs/QUESTIONS_A_COMPLETER.md` ; seuls les énoncés tranchés par l'utilisateur sont ajoutés.

## 3. Lots

| Profil   | Thème                         | Lots                      | Énoncés à vérifier |
| -------- | ----------------------------- | ------------------------- | ------------------ |
| CR       | principes et valeurs          | cr-pv1, cr-pv2            | 32                 |
| CR       | institutions                  | cr-si1, cr-si2            | 32                 |
| CR       | droits et devoirs             | cr-dd1, cr-dd2            | 33                 |
| CR       | histoire, géographie, culture | cr-hc1, cr-hc2            | 49                 |
| CR       | vie en société                | cr-vs1, cr-vs2            | 32                 |
| NAT      | principes et valeurs          | nat-pv1, nat-pv2          | 31                 |
| NAT      | institutions                  | nat-si1, nat-si2          | 43                 |
| NAT      | droits et devoirs             | nat-dd1, nat-dd2          | 35                 |
| NAT      | histoire, géographie, culture | nat-hc1, nat-hc2, nat-hc3 | 65                 |
| NAT      | vie en société                | nat-vs1, nat-vs2          | 35                 |
| CR / NAT | situations d'entraînement     | sit-cr, sit-nat           | 12 + 12 créées     |

## 4. Livrables et validation

- `src/data/questions.json` et `src/data/sources.json` enrichis ; compteurs de `tests/data.test.ts`, `PROJECT_STATUS.md`, `docs/SOURCES.md`, `README.md` et `CLAUDE.md` mis à jour.
- Validation avant chaque commit : `npm run format`, `npm run check`, `npm run test:e2e`.
- Commits atomiques par profil, push sur `master`. **Aucune release** sans demande explicite.
- Contrôle attendu à la fin : pour chaque profil, nombre publié + nombre différé = total de la liste officielle (moins le doublon) ; examen blanc disponible pour un profil seulement s'il compte 28 énoncés officiels et 12 situations.

## 5. Risques et limites

- **Sources illisibles** (pages 403/404, sites sans texte exploitable) : des énoncés seront différés ; ils ne sont pas devinés.
- **Fiabilité de lecture** : les agents lisent les pages via un outil de résumé. Les contrôles de l'orchestrateur (titres, réponses déduites, sources faibles) restent nécessaires ; aucune relecture humaine n'est attestée (`humanReviewed: false`).
- **Niveau** : la liste CR est d'un niveau de difficulté supérieur à la CSP ; les propositions doivent rester plausibles et non ambiguës à ce niveau.
- **Naturalisation** : le PDF provient du ministère (version 20251212) ; une nouvelle version exigerait une nouvelle extraction.
- **Séparation des profils** : un énoncé repris de la CSP doit rester vrai pour le profil cible ; les agents signalent tout cas où la réponse dépendrait du titre de séjour ou de la procédure.

## 6. Résultat (13/10/2026)

- 23 agents ont traité les 21 lots d'énoncés et les 2 lots de situations ; la fusion et les contrôles ont été faits par l'orchestrateur.
- **CR : 170 publiés** (dont 31 repris de la CSP), 39 différés. **Naturalisation : 201 publiés** (dont 34 repris), 42 différés + 1 doublon exact. 12 situations originales par profil.
- Contrôle qualité : titres des 110 nouvelles sources comparés mécaniquement au titre réel des pages (seules des différences d'apostrophes, une page anglaise de l'Élysée corrigée, 6 pages illisibles ou PDF non vérifiables mécaniquement) ; 9 réponses signalées comme fragiles par les agents retirées (source faible, énoncé trop ouvert) ; 7 sources devenues orphelines supprimées.
- Les énoncés différés sont listés avec leur motif dans `docs/QUESTIONS_A_COMPLETER_CR_NAT.md` pour arbitrage humain.
- Reste à faire : arbitrage des différés, relecture éditoriale humaine (tous les corrigés sont en `humanReviewed: false`), vérification humaine des sources lues par résumé.
