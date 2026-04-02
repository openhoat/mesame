# MeSame - Project Brief

> **"The AI that writes like me, for me."**
> MeSame est un méta-agent IA qui analyse localement votre empreinte linguistique pour transformer n'importe quel modèle (OpenAI, Claude, Ollama) en un double numérique fidèle.

---

## 1. Identité du Projet

- **Nom :** MeSame
- **Slogan :** Your personal style proxy.
- **Concept :** Une application web servie localement (via Fastify) ou empaquetée pour le bureau, qui vous permet de chatter directement avec votre double numérique. MeSame analyse localement votre empreinte linguistique et injecte votre "ADN stylistique" dans toutes vos interactions avec les LLMs. Le proxy reste également accessible pour les applications tierces via un point de terminaison compatible OpenAI.
- **Valeur Unique :** Confidentialité totale de l'analyse (locale), expérience de chat intégrée et interopérabilité universelle via un protocole API standard.

---

## 2. Expression des Besoins

### User Stories

- **Analyse Locale :** En tant qu'utilisateur, je veux que mes documents (PDF, MD, TXT) soient analysés sur ma machine pour garantir ma vie privée.
- **Profil Stylistique :** Je veux qu'un portrait-robot de mon écriture (ton, syntaxe, tics de langage) soit généré automatiquement.
- **Proxy Universel :** Je veux pouvoir utiliser mon double numérique dans n'importe quelle application tierce en changeant simplement l'URL de l'API (compatible OpenAI).
- **Liberté du Modèle :** Je veux pouvoir basculer entre GPT-4o, Claude 3.5 ou des modèles locaux (Ollama) sans perdre ma personnalisation.

---

## 3. Stack Technique

| Composant | Technologie |
| :--- | :--- |
| **Langage** | TypeScript (Fullstack) |
| **Frontend** | React.js 19 + Vite + Tailwind CSS 4 + Mantine 8 + Shadcn/UI |
| **Backend** | Node.js 22 + **Fastify 5** (Proxy & API) |
| **IA Orchestration** | **LangChain.js 0.3** |
| **NLP Local** | **Natural** & **Compromise.js** |
| **Desktop App** | CLI empaqueté (`bin/mesame`) servant une UI web locale |
| **I18n** | **react-i18next** (English / French) |
| **Base de Données** | **SQLite** + **Prisma ORM 6** |
| **Tests** | **Vitest** (Unit/Integration) + **Playwright** (E2E) |

---

## 4. Architecture Système

### A. MeSame Engine (Local)

Module de traitement des sources :
1. **Extraction :** Analyse statistique des fréquences de mots (TF-IDF) et des expressions clés (N-Grams) via `natural`.
2. **Linguistique :** Calcul des métriques de structure (longueur des phrases, richesse lexicale) via `compromise`.
3. **Prompt Generation :** Synthèse automatique d'un *System Prompt* de style.

### B. MeSame Proxy (Gateway)

Serveur intermédiaire compatible OpenAI :
1. **Intercept :** Reçoit les requêtes `POST /v1/chat/completions`.
2. **Inject :** Ajoute le profil stylistique au contexte (System Prompt).
3. **Route :** Transmet au LLM cible (Cloud ou Local via Ollama) via LangChain.
4. **Stream :** Gère le flux de réponse en temps réel (Server-Sent Events).

### C. MeSame App (Local Server + Web UI)

Application tout-en-un :
1. **Serveur Fastify :** Embarque le proxy et l'API de gestion au démarrage.
2. **Interface de chat :** L'utilisateur converse directement avec le LLM via une UI React moderne.
3. **Proxy accessible :** Le serveur reste accessible sur `localhost:3000` pour les applications tierces.

---

## 5. Interface

### A. Interface de Chat (principale)

Conversation directe avec le double numérique :
- **Chat temps réel :** Envoi de messages et réception des réponses en streaming avec curseur d'attente.
- **Historique :** Gestion des sessions de conversation multiples.
- **Contextualisation :** Le LLM répond en utilisant le style d'écriture extrait de vos sources.

### B. Dashboard Admin (secondaire)

Gestion et configuration de MeSame :
- **Gestion des Sources :** Import (Drag & Drop) de documents PDF, MD, TXT et analyse instantanée.
- **Profil Stylistique :** Visualisation des mots-clés (TF-IDF) et des expressions (N-Grams) détectés.
- **Settings Proxy :**
    - Choix du modèle actif et gestion des clés API.
    - Choix de la langue de l'interface (EN/FR).
- **Live Logs :** Visualisation en temps réel des requêtes transitant par le proxy.

---

## 6. Confidentialité & Sécurité

- **Zero-Cloud Analysis :** L'analyse des documents sources est strictement locale.
- **Anonymization :** Possibilité d'activer des règles de remplacement (Regex) pour masquer des données sensibles avant l'envoi au LLM.
- **Local Proxy :** Le serveur ne répond par défaut qu'aux appels locaux (`127.0.0.1`).

---

## 7. Roadmap de Développement

### Phase 1 : Fondations (Core) ✅
### Phase 2 : Architecture (Fastify + Prisma) ✅
### Phase 3 : API Sources & Import (PDF/MD/TXT) ✅
### Phase 4 : Moteur NLP (Style Analyzer) ✅
### Phase 5 : Génération du Persona Prompt ✅
### Phase 6 : Interface de Chat (React + Streaming) ✅
### Phase 7 : Intégration LangChain (Multi-Provider) ✅
### Phase 8 : Dashboard Admin (React + Mantine) ✅
### Phase 9 : Qualité & Internationalisation ✅

- Mise en place d'une suite de tests E2E avec **Playwright**.
- Support multi-langue (i18n) pour toute l'interface.
- Documentation technique automatisée via **VitePress**.
- Intégration continue (CI) et qualité de code (Biome).

### Phase 10 : Optimisation & Features Avancées ✅

- ✅ Design responsive pour smartphones et mobiles (2026-04-02)
- Amélioration de l'extraction de style (N-Grams plus fins).
- Export/Import de profils stylistiques.
- Support de nouveaux formats de sources (DOCX, URL).
- Interface de chat avec recherche dans l'historique.

---

## 8. Modèle de Données (Prisma)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Source {
  id        String   @id @default(uuid())
  title     String
  content   String
  createdAt DateTime @default(now())
}

model StyleProfile {
  id            Int      @id @default(1)
  personaPrompt String // Le prompt système généré
  metrics       String // JSON des stats (avg sentence length, etc.)
  updatedAt     DateTime @updatedAt
}

model Config {
  id                Int     @id @default(1)
  provider          String  @default("openai") // openai, anthropic, ollama
  targetModel       String  @default("gpt-4o")
  apiKey            String?
  preferredLanguage String  @default("en") // Langue préférée pour l'UI et les réponses
}

model Conversation {
  id        String   @id @default(uuid())
  title     String
  messages  String // JSON des messages (Array)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Prochaines Étapes

1. **Améliorer l'accessibilité** : Ajouter des labels ARIA et une navigation au clavier (voir KANBAN.md pour les tâches priorisées).
2. **Optimiser les performances** : Implémenter la mise en cache des prompts et optimiser les requêtes LLM.
3. **Étendre les sources** : Ajouter le support des fichiers DOCX et l'import depuis URL.
4. **Améliorer l'expérience utilisateur** : Implémenter le drag-and-drop, les raccourcis clavier, et le questionnaire interactif.
