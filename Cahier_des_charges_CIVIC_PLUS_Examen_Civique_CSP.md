# CAHIER DES CHARGES — APPLICATION DE PRÉPARATION À L’EXAMEN CIVIQUE CSP

**Nom de travail : CIVIC+**  
**Version : 1.0 — Octobre 2026**  
**Cible principale : candidats à l’examen civique — niveau Carte de Séjour Pluriannuelle (CSP)**  
**Format cible : Web App HTML5 / CSS3 / JavaScript — PWA mobile-first**

---

## 1. Objet du projet

Créer une application web moderne, pédagogique et gamifiée permettant de préparer efficacement l’examen civique exigé dans le cadre de certaines premières demandes de carte de séjour pluriannuelle (CSP).

L’application ne doit pas être conçue comme une simple base de questions-réponses. Elle doit fonctionner comme un **coach d’apprentissage personnel**, avec :

- apprentissage progressif ;
- QCM ;
- répétition des erreurs ;
- révision intelligente ;
- examens blancs ;
- statistiques ;
- progression ;
- récompenses virtuelles ;
- explications pédagogiques ;
- mises en situation d’entraînement ;
- fonctionnement mobile-first ;
- possibilité de fonctionnement hors connexion via PWA.

L’objectif UX principal est :

> **Donner envie de revenir apprendre chaque jour, tout en restant fidèle aux informations officielles.**

---

# 2. Références et périmètre réglementaire

## 2.1 Sources prioritaires

Le produit doit être construit à partir des sources institutionnelles françaises, avec priorité aux sources suivantes :

1. Ministère de l’Intérieur — Formation civique
2. Direction générale des étrangers en France (DGEF)
3. Service-Public.fr
4. Vie-publique.fr
5. autres sites institutionnels français lorsque nécessaire

La liste officielle CSP publiée par le ministère constitue la référence principale pour les questions de connaissance.

## 2.2 Format officiel de l’examen

D’après le ministère de l’Intérieur :

- 40 questions ;
- 45 minutes maximum ;
- QCM en français ;
- 4 propositions ;
- une seule bonne réponse ;
- 28 questions de connaissance ;
- 12 mises en situation ;
- 5 thématiques ;
- réussite à partir de 32 bonnes réponses, soit 80 %.

Les 5 thématiques sont :

1. Principes et valeurs de la République française
2. Système institutionnel et politique
3. Droits et devoirs
4. Histoire, géographie et culture
5. Vivre dans la société française

L’examen doit être passé avant le dépôt de la demande de titre concernée et l’attestation de réussite n’a pas de durée de validité selon les informations officielles consultées.

## 2.3 Contrainte essentielle sur les mises en situation

Le ministère précise que les questions de mises en situation ne sont pas rendues publiques.

L’application NE DOIT donc PAS présenter ses propres scénarios comme étant :

- « les 12 questions officielles » ;
- « les vraies questions secrètes » ;
- « les questions exactes de l’examen ».

Elle doit les présenter comme :

> **Mises en situation d’entraînement inspirées des thèmes et objectifs officiels.**

---

# 3. Corpus fourni par le client

Le document `Reponses_Examen_Civique_CSP.docx` constitue une base de contenu importante.

Il contient notamment les cinq grands domaines et des réponses synthétiques, par exemple :

- principes et valeurs ;
- système institutionnel et politique ;
- droits et devoirs ;
- histoire, géographie et culture ;
- vivre dans la société française.

Ce document doit être considéré comme une **base de travail à vérifier**, et non comme la source réglementaire finale.

Chaque élément utilisé dans l’application devra être rapproché de la source officielle correspondante.

---

# 4. Objectifs fonctionnels

L’application doit permettre à l’utilisateur de :

### O1 — Découvrir

Comprendre les connaissances nécessaires.

### O2 — Apprendre

Étudier une question avec sa réponse et une explication.

### O3 — S’entraîner

Répondre à des QCM.

### O4 — Corriger ses erreurs

Revoir automatiquement les questions mal répondues.

### O5 — Mémoriser

Utiliser la répétition espacée.

### O6 — Mesurer son niveau

Voir son taux de réussite par thème.

### O7 — Simuler l’examen

Effectuer un examen blanc de 40 questions / 45 minutes.

### O8 — Se motiver

Gagner XP, badges, niveaux et séries.

### O9 — Réviser intelligemment

Obtenir automatiquement des sessions ciblées sur ses faiblesses.

---

# 5. Public cible

## 5.1 Utilisateur principal

Personne étrangère résidant en France et préparant une première demande de CSP ou concernée par le niveau CSP.

Profils possibles :

- niveau de français variable ;
- usage principalement smartphone ;
- faible familiarité avec les démarches numériques ;
- besoin d’explications simples ;
- besoin de répétition ;
- temps d’apprentissage disponible variable.

## 5.2 Utilisateurs secondaires

- organismes de formation ;
- associations ;
- accompagnateurs sociaux ;
- enseignants ;
- structures d’intégration.

Une future version pourra proposer un espace formateur.

---

# 6. Principes UX

L’application doit respecter les principes suivants :

### Simplicité

Une action principale claire par écran.

### Progressivité

Ne jamais noyer l’utilisateur dans une grande quantité de texte.

### Feedback immédiat

Chaque réponse doit produire un retour clair.

### Motivation

La progression doit être visible.

### Bienveillance

Une erreur ne doit jamais être présentée comme un échec humiliant.

### Accessibilité

L’application doit être utilisable par des personnes ayant des niveaux numériques et linguistiques différents.

### Transparence

Les contenus officiels doivent être distingués des contenus pédagogiques créés par l’application.

---

# 7. Architecture générale de l’application

```text
CIVIC+
│
├── Accueil
│
├── Apprendre
│   ├── Principes et valeurs
│   ├── Institutions
│   ├── Droits et devoirs
│   ├── Histoire / géographie / culture
│   └── Vie en société
│
├── S'entraîner
│   ├── Toutes les questions
│   ├── Par thème
│   ├── Questions difficiles
│   ├── Mes erreurs
│   └── Révision intelligente
│
├── Situations
│   └── Exercices de mise en situation
│
├── Examen blanc
│
├── Progression
│
├── Badges
│
└── Paramètres
```

---

# 8. Écran d’accueil

L’accueil doit immédiatement montrer :

- progression globale ;
- XP ;
- série actuelle ;
- objectif ;
- dernière activité ;
- bouton « Continuer » ;
- accès aux cinq thèmes ;
- accès examen blanc.

Exemple :

```text
Bonjour 👋

Ton objectif
Préparer l’examen civique

████████████████░░░░ 78 %

🎯 Niveau actuel : 31 / 40
🔥 Série : 6 jours
⭐ 1 280 XP

[ CONTINUER ]

📚 Apprendre
🎯 S'entraîner
🏆 Examen blanc

Mes thèmes
🇫🇷 République       91 %
🏛 Institutions       84 %
⚖ Droits             73 %
🗺 Histoire           66 %
🏠 Société            79 %
```

---

# 9. Onboarding

Au premier lancement :

### Écran 1

Bienvenue dans CIVIC+

### Écran 2

Quel examen prépares-tu ?

- Carte de séjour pluriannuelle (CSP)
- Carte de résident (CR) — future extension

### Écran 3

Quel est ton niveau ?

- Je commence
- J’ai déjà étudié
- Je veux surtout m’entraîner
- Mon examen approche

### Écran 4

Combien de temps veux-tu apprendre ?

- 5 min/jour
- 10 min/jour
- 20 min/jour
- 30 min/jour

### Écran 5

Objectif :

> Atteindre au moins 32/40 et maintenir un niveau de préparation confortable.

---

# 10. Module APPRENDRE

Chaque thème est découpé en micro-leçons.

Exemple :

## Laïcité

### Question

Une personne a-t-elle le droit de ne pas croire en une religion ?

### Réponse

Oui.

### Explication

Le principe de laïcité garantit notamment la liberté de conscience, qui comprend la liberté de croire ou de ne pas croire.

### À retenir

> Liberté de conscience = croire, changer de religion ou ne pas croire.

### Actions

[🔊 Écouter] [✓ J’ai compris]

---

# 11. Module QCM

L’écran de question doit être extrêmement lisible.

```text
QUESTION 17 / 40

Quel est l’hymne national français ?

○ Le Chant du départ
○ La Marseillaise
○ La Marseillaise européenne
○ La Marseillaise française régionale

[ VALIDER ]
```

Contraintes :

- une seule réponse sélectionnable ;
- gros boutons tactiles ;
- pas de texte minuscule ;
- progression visible ;
- possibilité de passer à la question suivante après correction.

---

# 12. Feedback après réponse

## Bonne réponse

```text
✓ BRAVO !

La bonne réponse est :
La Marseillaise

💡 À retenir
La Marseillaise est l’hymne national français.

+10 XP
🔥 Série +1
```

## Mauvaise réponse

```text
Pas encore !

La bonne réponse est :
La Marseillaise

💡 À retenir
La Marseillaise est l’hymne national français.

Cette question sera ajoutée à tes révisions.
```

Ne pas utiliser de formulation culpabilisante.

---

# 13. Système de maîtrise

Chaque question possède un niveau de maîtrise :

```text
0 = jamais vue
1 = découverte
2 = fragile
3 = en apprentissage
4 = maîtrisée
5 = très bien maîtrisée
```

Exemple :

```text
Laïcité
██████████ 90 %

Institutions
████████░░ 82 %

Histoire
██████░░░░ 61 %
```

---

# 14. Révision intelligente

Le moteur sélectionne les questions en fonction de :

- erreurs récentes ;
- fréquence des erreurs ;
- ancienneté de la dernière réponse ;
- niveau de maîtrise ;
- thème faible ;
- temps depuis la dernière révision.

Priorité :

1. erreurs répétées ;
2. questions récemment ratées ;
3. questions anciennes non révisées ;
4. connaissances fragiles ;
5. questions maîtrisées.

---

# 15. Répétition espacée

Proposition initiale :

```text
Erreur
↓
J+1
↓
J+3
↓
J+7
↓
J+14
↓
J+30
```

Une nouvelle erreur réduit l’intervalle.

Une bonne réponse répétée augmente l’intervalle.

Le moteur doit être configurable sans modifier le contenu.

---

# 16. Module « MES ERREURS »

Écran :

```text
TES QUESTIONS À REVOIR

🔴 8 erreurs importantes

Laïcité
3 erreurs

Institutions
2 erreurs

Histoire
2 erreurs

Société
1 erreur

[ COMMENCER LA RÉVISION ]
```

---

# 17. Module EXAMEN BLANC

Mode spécial.

### Paramètres

- 40 questions ;
- 45 minutes ;
- 4 propositions ;
- une seule bonne réponse ;
- score sur 40 ;
- seuil de réussite : 32.

### Interface

```text
EXAMEN BLANC

Question 17 / 40

Temps restant
28:42

[ question ]

○ Réponse A
○ Réponse B
○ Réponse C
○ Réponse D

[ VALIDER ]
```

Pendant l’examen :

- pas d’XP par question ;
- pas de correction immédiate ;
- pas de feedback « bonne/mauvaise réponse » ;
- chronomètre ;
- score uniquement à la fin.

---

# 18. Résultat examen blanc

```text
EXAMEN TERMINÉ

35 / 40
87,5 %

✓ OBJECTIF ATTEINT

Principes             9/10
Institutions          8/8
Droits                7/8
Histoire              6/7
Société               5/7

Tes points forts
✓ Institutions
✓ Principes

À améliorer
⚠ Société
⚠ Histoire

[ RÉVISER MES ERREURS ]
[ REFAIRE UN EXAMEN ]
```

---

# 19. Évaluation de préparation

Le moteur doit produire un indicateur :

### Non prêt

< 70 %

### En progression

70–79 %

### Objectif atteint

80–89 %

### Bien préparé

90–94 %

### Très bien préparé

≥ 95 %

Ce score est un **indicateur pédagogique**, et ne doit jamais être présenté comme une garantie de réussite à l’examen officiel.

---

# 20. Mises en situation

Créer un module séparé :

> **Situations d’entraînement**

Mention explicite :

> Ces exercices sont des entraînements pédagogiques inspirés des thèmes officiels. Ils ne constituent pas les questions officielles de mise en situation de l’examen.

Exemple :

```text
Vous êtes témoin d’un accident grave.

Que devez-vous faire ?

A. Quitter immédiatement les lieux
B. Filmer la scène
C. Porter assistance et/ou appeler les secours
D. Attendre qu’une autre personne intervienne
```

Objectif :

- raisonnement ;
- compréhension ;
- application pratique des principes.

---

# 21. Gamification

## XP

Proposition :

| Action | XP |
|---|---:|
| Bonne réponse | +10 |
| Leçon terminée | +30 |
| Révision d’une erreur | +15 |
| Série de 5 | +25 |
| Série de 10 | +50 |
| Examen blanc terminé | +100 |
| Score ≥ 32/40 | badge |
| Score ≥ 36/40 | badge |
| 40/40 | badge spécial |

Les récompenses doivent rester secondaires par rapport à l’apprentissage.

---

# 22. Badges

### 🌱 Premier pas

Première leçon terminée.

### 📚 Apprenant régulier

100 questions étudiées.

### 🔥 Série de 7

7 jours d’apprentissage consécutifs.

### 🇫🇷 République

Thème République ≥ 90 %.

### 🏛 Institutions

Thème Institutions ≥ 90 %.

### ⚖ Droits

Thème Droits ≥ 90 %.

### 🗺 Mémoire de France

Thème Histoire ≥ 90 %.

### 🏠 Vie française

Thème Société ≥ 90 %.

### 🎯 Objectif 32

32/40 ou plus.

### 🏆 Sans faute

40/40.

---

# 23. Système de niveaux

Proposition :

1. 🌱 Découverte
2. 📖 Apprenti
3. 🧠 En progression
4. 🎯 Préparation avancée
5. 🏆 Prêt pour l’examen
6. 💎 Maîtrise

---

# 24. Données utilisateur

Pour la V1, aucune donnée administrative sensible n’est nécessaire.

Stocker localement :

```json
{
  "xp": 1280,
  "level": 4,
  "streak": 6,
  "questionsAnswered": 312,
  "questionsCorrect": 267,
  "questionStats": {},
  "badges": [],
  "lastStudyDate": "2026-10-07"
}
```

Ne jamais demander :

- numéro de passeport ;
- numéro de titre de séjour ;
- numéro ANEF ;
- données administratives inutiles.

---

# 25. Modèle de données question

Chaque question doit avoir une structure robuste :

```json
{
  "id": "CSP-PV-001",
  "level": "CSP",
  "theme": "principes_valeurs",
  "subtheme": "symboles",
  "question": "Quel est le nom de l'hymne national ?",
  "answers": [
    "La Marseillaise",
    "Le Chant du départ",
    "Le Temps des cerises",
    "Autre réponse"
  ],
  "correctAnswer": 0,
  "explanation": "La Marseillaise est l'hymne national français.",
  "keyPoint": "La Marseillaise = hymne national",
  "source": {
    "type": "official",
    "organization": "Ministère de l'Intérieur",
    "url": "...",
    "checkedAt": "2026-10-07"
  },
  "official": true,
  "status": "validated"
}
```

---

# 26. Classification des contenus

Chaque contenu doit être identifié par :

```text
OFFICIAL_QUESTION
OFFICIAL_ANSWER
OFFICIAL_EXPLANATION
PEDAGOGICAL_EXPLANATION
TRAINING_SCENARIO
UI_CONTENT
```

Une mise en situation créée par l'application ne doit jamais avoir le statut `OFFICIAL_QUESTION`.

---

# 27. Gestion des sources

Chaque connaissance importante doit posséder :

- organisme ;
- URL ;
- titre de la page ;
- date de consultation ;
- date de dernière vérification ;
- version du contenu ;
- statut de validation.

Exemple :

```text
Source:
Ministère de l'Intérieur

Type:
Question officielle CSP

Dernière vérification:
2026-10-07

Statut:
VALIDÉ
```

---

# 28. Pipeline éditorial

```text
SOURCE OFFICIELLE
       ↓
EXTRACTION
       ↓
NORMALISATION
       ↓
VÉRIFICATION
       ↓
RÉDACTION PÉDAGOGIQUE
       ↓
REVUE HUMAINE
       ↓
VALIDATION
       ↓
PUBLICATION
```

Aucune IA générative ne doit pouvoir modifier automatiquement une réponse officielle en production.

---

# 29. Architecture technique

## Frontend

V1 recommandée :

- HTML5
- CSS3
- JavaScript ES202x
- éventuellement Vite
- architecture modulaire

Framework possible :

- Vanilla JS pour simplicité et faible dépendance ;
- React/Vue si une équipe souhaite industrialiser davantage.

## PWA

Prévoir :

- manifest.json ;
- service worker ;
- cache des ressources ;
- IndexedDB ;
- mode hors connexion ;
- installation sur smartphone.

---

# 30. Arborescence technique proposée

```text
civic-plus/
│
├── index.html
├── manifest.json
├── service-worker.js
│
├── assets/
│   ├── icons/
│   ├── illustrations/
│   └── sounds/
│
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── components.css
│   ├── screens.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── router.js
│   ├── state.js
│   ├── storage.js
│   ├── questions.js
│   ├── quiz-engine.js
│   ├── exam-engine.js
│   ├── spaced-repetition.js
│   ├── gamification.js
│   ├── statistics.js
│   ├── accessibility.js
│   └── audio.js
│
├── data/
│   ├── questions-csp.json
│   ├── situations.json
│   ├── lessons.json
│   ├── badges.json
│   └── sources.json
│
└── docs/
    └── content-policy.md
```

---

# 31. Moteur de quiz

Le moteur doit être indépendant de l'interface.

API interne :

```javascript
QuizEngine.start({
  mode: "training",
  theme: "principes_valeurs",
  count: 10
});

QuizEngine.answer(questionId, answerIndex);

QuizEngine.next();

QuizEngine.getResult();
```

---

# 32. Moteur examen

```javascript
ExamEngine.start({
  level: "CSP",
  questions: 40,
  duration: 45 * 60
});
```

Le moteur doit :

- sélectionner 40 questions selon les règles définies ;
- démarrer le chronomètre ;
- empêcher la correction immédiate ;
- calculer le score ;
- produire une analyse par thème.

---

# 33. Sélection des questions d’examen blanc

Le moteur doit éviter :

- 40 questions du même thème ;
- répétition excessive ;
- distribution irréaliste.

La distribution doit être configurable.

Important :

> La composition exacte d'un examen blanc de l'application est une simulation pédagogique et ne doit pas être présentée comme une reproduction garantie de la sélection officielle.

---

# 34. Interface visuelle

Direction artistique :

> **Duolingo × application d’apprentissage moderne × examen numérique institutionnel**

Mais sans copier une marque existante.

### Style

- cartes arrondies ;
- profondeur légère ;
- typographie très lisible ;
- grandes zones tactiles ;
- illustrations simples ;
- icônes ;
- micro-animations ;
- progression très visible.

---

# 35. Palette indicative

```css
--primary: #172554;
--blue: #2563EB;
--success: #16A34A;
--warning: #F59E0B;
--danger: #DC2626;
--background: #F7F8FA;
--surface: #FFFFFF;
--text: #111827;
--muted: #64748B;
```

La palette doit rappeler subtilement la République sans produire une interface bleu/blanc/rouge trop littérale.

---

# 36. Responsive design

Priorité :

1. smartphone ;
2. tablette ;
3. ordinateur.

Breakpoints à définir avec une approche responsive réelle plutôt qu'en fonction d'un seul appareil.

---

# 37. Accessibilité

Objectif :

**WCAG 2.2 AA autant que possible.**

Prévoir :

- contraste suffisant ;
- focus visible ;
- navigation clavier ;
- aria-labels ;
- tailles tactiles suffisantes ;
- texte redimensionnable ;
- alternative textuelle ;
- distinction erreur/succès non basée uniquement sur la couleur ;
- réduction des animations ;
- audio optionnel.

---

# 38. Audio

Chaque question peut proposer :

🔊 Écouter

La lecture doit être générée à partir du texte de la question et des réponses.

Prévoir un réglage :

```text
Vitesse :
0.8x
1x
1.2x
```

---

# 39. Aide linguistique

V1 :

- vocabulaire important ;
- définition simple ;
- audio.

V2 :

- aide multilingue contrôlée ;
- traduction des explications ;
- glossaire.

Important :

La traduction doit rester un support pédagogique et ne doit pas remplacer le texte français de l'examen.

---

# 40. Statistiques

Le tableau de bord doit afficher :

- questions vues ;
- questions réussies ;
- taux global ;
- taux par thème ;
- questions difficiles ;
- série ;
- temps d'étude ;
- examens blancs ;
- meilleur score ;
- score moyen ;
- évolution dans le temps.

---

# 41. Tableau de progression

```text
TA PROGRESSION

██████████████████░░ 89 %

République       █████████░ 91 %
Institutions     ████████░░ 84 %
Droits           ███████░░░ 73 %
Histoire         ██████░░░░ 66 %
Société          ████████░░ 79 %
```

---

# 42. Notifications

Optionnelles.

Exemples :

> 📚 10 questions sont prêtes pour ta révision.

> 🔥 Tu as étudié 7 jours de suite.

> 🎯 Encore 2 points pour atteindre ton meilleur score.

Les notifications doivent rester limitées et désactivables.

---

# 43. Confidentialité

Principe :

> **Privacy by design**

V1 :

- stockage local ;
- pas de compte obligatoire ;
- aucune donnée administrative ;
- aucune information liée au titre de séjour.

Si un backend est ajouté :

- minimisation des données ;
- consentement ;
- politique de confidentialité ;
- suppression du compte ;
- export des données ;
- conformité RGPD.

---

# 44. Contenu et propriété intellectuelle

Le produit doit clairement distinguer :

- questions officielles ;
- explications originales ;
- illustrations originales ;
- exercices originaux.

Ne pas présenter l'application comme :

> « application officielle du gouvernement »

sauf partenariat/autorisation explicite.

Mention recommandée :

> « Application indépendante de préparation à l’examen civique. Les questions officielles de connaissance sont issues des publications du ministère de l’Intérieur. »

---

# 45. Page SOURCES

Prévoir une page dédiée :

## Sources officielles

- Ministère de l'Intérieur — Formation civique
- Direction générale des étrangers en France
- Service-Public.fr
- Vie-publique.fr

Chaque question peut ouvrir sa source lorsque pertinent.

---

# 46. Page « À propos »

Doit expliquer :

- application indépendante ;
- objectif pédagogique ;
- différence entre contenu officiel et exercices d'entraînement ;
- date de dernière mise à jour ;
- sources.

---

# 47. Mode formateur — future extension

Prévoir l'architecture pour permettre plus tard :

```text
FORMATEUR
│
├── groupes
├── apprenants
├── progression
├── résultats
├── difficultés
└── statistiques
```

---

# 48. MVP

## Inclus

- accueil ;
- onboarding ;
- 5 thèmes ;
- corpus officiel CSP ;
- apprentissage ;
- QCM ;
- correction ;
- erreurs ;
- révision ;
- répétition espacée ;
- examen blanc ;
- score ;
- statistiques ;
- XP ;
- badges ;
- PWA ;
- hors ligne ;
- sources.

## Non inclus au premier MVP

- compte utilisateur obligatoire ;
- paiement ;
- backend complexe ;
- IA conversationnelle libre ;
- espace formateur ;
- synchronisation multi-appareils.

---

# 49. V2

- mises en situation avancées ;
- audio amélioré ;
- aide linguistique ;
- frise historique interactive ;
- cartes géographiques ;
- statistiques avancées ;
- synchronisation cloud ;
- compte utilisateur facultatif ;
- notifications ;
- mode intensif.

---

# 50. V3

- version CR ;
- espace formateur ;
- administration du contenu ;
- CMS ;
- moteur pédagogique avancé ;
- coach IA contrôlé par le corpus validé ;
- recommandations personnalisées ;
- analytics anonymisés.

---

# 51. Coach IA — règles

Si une IA est ajoutée :

### Autorisé

- expliquer une notion existante ;
- reformuler simplement ;
- proposer une révision ;
- expliquer pourquoi une réponse est correcte ;
- générer des exercices pédagogiques à partir du corpus validé.

### Interdit

- inventer une règle administrative ;
- modifier une réponse officielle sans validation ;
- prétendre connaître les mises en situation officielles non publiées ;
- donner un conseil juridique personnalisé comme vérité certaine ;
- inventer une source.

Le modèle doit utiliser un corpus contrôlé.

---

# 52. Critères d'acceptation principaux

## CA01

L'utilisateur peut commencer une session en moins de 10 secondes après l'ouverture.

## CA02

Une question peut être répondue en quelques gestes sur smartphone.

## CA03

Chaque réponse reçoit un feedback immédiat en mode entraînement.

## CA04

Chaque erreur est enregistrée.

## CA05

Les erreurs réapparaissent dans les révisions.

## CA06

Un examen blanc comporte 40 questions et 45 minutes.

## CA07

Le score est calculé sur 40.

## CA08

32/40 est affiché comme seuil pédagogique de réussite.

## CA09

Le système affiche les performances par thème.

## CA10

L'utilisateur peut fonctionner hors connexion après installation/cache initial.

## CA11

Les sources officielles sont identifiables.

## CA12

Les mises en situation sont explicitement présentées comme entraînement.

## CA13

L'application fonctionne correctement sur smartphone.

## CA14

Aucune donnée administrative sensible n'est nécessaire.

---

# 53. Tests

Prévoir des tests :

### Fonctionnels

- sélection réponse ;
- correction ;
- score ;
- timer ;
- fin d'examen ;
- sauvegarde progression.

### Données

- aucune question sans réponse correcte ;
- aucune question avec deux bonnes réponses ;
- source renseignée ;
- thème valide ;
- identifiant unique.

### UX

- mobile ;
- tablette ;
- desktop.

### Accessibilité

- clavier ;
- contraste ;
- lecteur d'écran.

### PWA

- installation ;
- offline ;
- restauration session.

---

# 54. Qualité du contenu

Avant publication d'une question :

```text
[ ] question issue de la source officielle ou clairement identifiée comme pédagogique
[ ] réponse vérifiée
[ ] une seule réponse correcte
[ ] distracteurs plausibles
[ ] explication compréhensible
[ ] source enregistrée
[ ] date de vérification
[ ] thème correct
[ ] niveau CSP correct
[ ] absence d'ambiguïté
```

---

# 55. Règles pour les distracteurs

Les mauvaises réponses doivent être plausibles mais incontestablement fausses.

Éviter :

- réponses absurdes ;
- longueur révélatrice ;
- formulation grammaticalement différente ;
- indice visuel ;
- réponse correcte systématiquement en position B.

Le moteur doit équilibrer les positions A/B/C/D.

---

# 56. Équilibre des sessions

Pour l'entraînement :

- mélanger les thèmes ;
- respecter les préférences de l'utilisateur ;
- surpondérer les erreurs ;
- conserver un petit pourcentage de questions maîtrisées pour maintenir la confiance.

Proposition :

```text
50 % erreurs / fragiles
30 % apprentissage
20 % maîtrisées
```

Cette pondération doit être configurable.

---

# 57. Expérience émotionnelle

Le produit doit créer trois sensations :

### « Je comprends. »

Grâce aux explications.

### « Je progresse. »

Grâce aux statistiques.

### « Je peux réussir. »

Grâce aux examens blancs et à l'objectif 32/40.

---

# 58. Ton éditorial

Le ton doit être :

- chaleureux ;
- simple ;
- respectueux ;
- encourageant ;
- non infantilisant.

Exemples :

À éviter :

> « Mauvaise réponse ! »

Préférer :

> « Pas encore. Regarde l'explication. »

À éviter :

> « Tu ne maîtrises pas ce sujet. »

Préférer :

> « Ce thème mérite encore un peu de révision. »

---

# 59. Indicateurs produit

KPIs possibles :

- taux de complétion onboarding ;
- questions/jour ;
- sessions/semaine ;
- taux de retour à J+1 ;
- taux de retour à J+7 ;
- progression moyenne ;
- taux de réussite aux examens blancs ;
- nombre moyen de questions avant premier score ≥32 ;
- thèmes les plus difficiles.

---

# 60. Roadmap proposée

## Phase 0 — Audit contenu

1 semaine

- comparer document fourni ;
- récupérer corpus officiel ;
- vérifier chaque question ;
- identifier différences ;
- structurer JSON.

## Phase 1 — UX/UI

1 à 2 semaines

- wireframes ;
- design system ;
- prototype mobile ;
- tests UX.

## Phase 2 — MVP

2 à 4 semaines

- moteur QCM ;
- données ;
- progression ;
- examen ;
- PWA.

## Phase 3 — Gamification

1 semaine

- XP ;
- badges ;
- niveaux ;
- séries.

## Phase 4 — QA

1 à 2 semaines

- tests ;
- accessibilité ;
- responsive ;
- contenu.

---

# 61. Priorité absolue

Ordre de priorité :

```text
1. EXACTITUDE DU CONTENU
2. SIMPLICITÉ D'UTILISATION
3. QUALITÉ UX/UI
4. MOTEUR DE RÉVISION
5. EXAMEN BLANC
6. GAMIFICATION
7. AUDIO / AIDE LINGUISTIQUE
8. IA
```

Il ne faut pas inverser cet ordre.

Une belle application avec de mauvaises réponses serait un mauvais produit.

---

# 62. Vision finale

Le produit doit donner cette impression :

> « J'ouvre l'application 10 minutes par jour, je sais exactement quoi réviser, je vois mes progrès et je me rapproche de mon objectif. »

L'utilisateur doit pouvoir passer de :

```text
Je ne connais rien
        ↓
Je découvre
        ↓
Je m'entraîne
        ↓
Je corrige mes erreurs
        ↓
Je mémorise
        ↓
Je fais 28/40
        ↓
Je fais 32/40
        ↓
Je fais 36/40
        ↓
Je suis prêt
```

---

# 63. Livrables attendus du développement

Le développeur/agence devra livrer :

1. application HTML/CSS/JS ;
2. PWA installable ;
3. corpus JSON ;
4. moteur de quiz ;
5. moteur d'examen ;
6. moteur de répétition espacée ;
7. système XP/badges ;
8. stockage local ;
9. interface responsive ;
10. page sources ;
11. documentation technique ;
12. guide de mise à jour du contenu ;
13. tests ;
14. build de production ;
15. README complet.

---

# 64. Consigne destinée à l'équipe de développement

> Construire une application de préparation à l'examen civique CSP indépendante, moderne, mobile-first et pédagogique. Utiliser les questions officielles de connaissance publiées par le ministère de l'Intérieur comme corpus de référence. Ne jamais présenter les mises en situation générées par l'application comme les questions officielles de l'examen. Séparer strictement le contenu officiel, les explications pédagogiques et les exercices créés par l'application. Le produit doit être conçu comme un coach d'apprentissage gamifié, avec progression, révision intelligente, statistiques et examens blancs. La priorité absolue est l'exactitude du contenu, suivie de l'expérience utilisateur.

---

# 65. Références officielles vérifiées

- Ministère de l'Intérieur — Formation civique — Informations générales sur l'examen civique.
- Ministère de l'Intérieur — Formation civique — Liste officielle des questions de connaissance CSP.
- Direction générale des étrangers en France — L'examen civique pour demander un titre de séjour.
- Direction générale des étrangers en France — Livret « L'examen civique pour une demande de carte de séjour pluriannuelle (CSP) ou de carte de résident (CR) ».

Dernière vérification des sources : **7 octobre 2026**.
