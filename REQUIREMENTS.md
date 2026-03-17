# MeSame - Project Brief

> **"The AI that writes like me, for me."**
> MeSame est un méta-agent IA qui analyse localement votre empreinte linguistique pour transformer n'importe quel modèle (OpenAI, Claude, Ollama) en un double numérique fidèle.

---

## 1. Identité du Projet

- **Nom :** MeSame
- **Slogan :** Your personal style proxy.
- **Concept :** Une application desktop Electron tout-en-un qui vous permet de chatter directement avec votre double numérique. MeSame analyse localement votre empreinte linguistique et injecte votre "ADN stylistique" dans toutes vos interactions avec les LLMs. Le proxy reste également accessible pour les applications tierces (Chatbox, etc.).
- **Valeur Unique :** Confidentialité totale de l'analyse (locale), expérience de chat intégrée et interopérabilité universelle via un protocole API standard.

---

## 2. Expression des Besoins

### User Stories

- **Analyse Locale :** En tant qu'utilisateur, je veux que mes documents (PDF, MD, TXT) soient analysés sur ma machine pour garantir ma vie privée.
- **Profil Stylistique :** Je veux qu'un portrait-robot de mon écriture (ton, syntaxe, tics de langage) soit généré automatiquement.
- **Proxy Universel :** Je veux pouvoir utiliser mon double numérique dans n'importe quelle application tierce en changeant simplement l'URL de l'API (compatible OpenAI).
- **Liberté du Modèle :** Je veux pouvoir basculer entre GPT-4, Claude 3.5 ou des modèles locaux sans perdre ma personnalisation.

---

## 3. Stack Technique

| Composant | Technologie |
| :--- | :--- |
| **Langage** | TypeScript (Fullstack) |
| **Frontend** | React.js + Vite + Tailwind CSS + Shadcn/UI |
| **Backend** | Node.js + **Fastify** (Proxy & API) |
| **IA Orchestration** | **LangChain.js** |
| **NLP Local** | **Natural** & **Compromise.js** |
| **Desktop App** | **Electron** (embarque le serveur Fastify) |
| **Chat UI** | HTML / CSS / JS natif (intégrée dans l'app Electron) |
| **Base de Données** | **SQLite** + **Prisma ORM** |

---

## 4. Architecture Système

### A. MeSame Engine (Local)

Module de traitement des sources (les 50 contenus) :
1. **Extraction :** Analyse statistique des fréquences de mots (TF-IDF) et des expressions clés (N-Grams).
2. **Linguistique :** Calcul des métriques de structure (longueur des phrases, richesse lexicale).
3. **Prompt Generation :** Synthèse automatique d'un *System Prompt* de style.

### B. MeSame Proxy (Gateway)

Serveur intermédiaire compatible OpenAI :
1. **Intercept :** Reçoit les requêtes `POST /v1/chat/completions`.
2. **Inject :** Ajoute le profil stylistique au contexte.
3. **Route :** Transmet au LLM cible (Cloud ou Local via Ollama).
4. **Stream :** Gère le flux de réponse en temps réel (Server-Sent Events).

### C. MeSame App (Desktop)

Application Electron tout-en-un :
1. **Tout-en-un :** L'app Electron embarque le serveur Fastify (proxy) au démarrage — aucune installation séparée nécessaire.
2. **Interface de chat :** L'utilisateur converse directement avec le LLM qui adopte son style d'écriture.
3. **Proxy accessible :** Le serveur reste accessible sur `localhost` pour les applications tierces (Chatbox, etc.).

---

## 5. Interface

### A. Interface de Chat (principale)

Conversation directe avec le double numérique dans l'app Electron :
- **Chat temps réel :** Envoi de messages et réception des réponses en streaming.
- **Personnalité adoptée :** Le LLM répond en utilisant le style d'écriture de l'utilisateur.
- **Historique :** Consultation des conversations précédentes.

### B. Dashboard Admin (secondaire)

Gestion et configuration de MeSame :
- **Gestion des Sources :** Dashboard pour importer/analyser les contenus de référence.
- **Visualisation du Style :** Feedback visuel sur les patterns détectés (tics de langage, ton détecté).
- **Settings Proxy :**
    - Choix du modèle actif (OpenAI, Anthropic, Ollama).
    - Gestion sécurisée des clés API (stockage local).
- **Live Logs :** Visualisation des requêtes passant par le proxy pour débogage.

---

## 6. Confidentialité & Sécurité

- **Zero-Cloud Analysis :** L'analyse des documents sources est strictement locale.
- **Anonymisation :** Possibilité d'activer des règles de remplacement (Regex) pour masquer des données sensibles avant l'envoi au LLM.
- **Local Proxy :** Le serveur ne répond qu'aux appels locaux (`127.0.0.1`).

---

## 7. Roadmap de Développement

### Phase 1 : Fondations (Core) ✅

- Initialisation du Monorepo TypeScript.
- Configuration du serveur Fastify et schéma Prisma (SQLite).
- Route proxy de base (`POST /v1/chat/completions`) avec streaming SSE.
- Injection de style via system prompt (service `styleInjector`).

### Phase 2 : Application Desktop (Electron) ✅

- App Electron embarquant le serveur Fastify au démarrage.
- Page statut serveur (dashboard minimal).
- Configuration du packaging multi-plateforme (AppImage, DMG, NSIS).

### Phase 3 : API Sources & Import

- Endpoints REST pour la gestion des sources (`POST/GET/DELETE /v1/sources`).
- Import de fichiers texte (MD, TXT) avec stockage dans la table `Source`.
- Support PDF (extraction de texte).

### Phase 4 : Moteur NLP (Style Analyzer)

- Analyse statistique TF-IDF (fréquences de mots) avec la lib `natural`.
- Extraction N-Grams (expressions récurrentes).
- Métriques linguistiques (longueur de phrases, richesse lexicale) avec `compromise`.
- Pipeline : lecture des sources → analyse → stockage des métriques dans `StyleProfile`.

### Phase 5 : Génération du Persona Prompt

- Algorithme de synthèse des résultats NLP en system prompt.
- Sauvegarde automatique dans `StyleProfile.personaPrompt`.
- Pipeline complet de bout en bout : import → analyse → génération → injection.

### Phase 6 : Interface de Chat (Electron)

- Remplacement du dashboard statut par une vraie interface de chat.
- Envoi de messages vers le proxy local avec affichage streaming.
- Historique des conversations.

### Phase 7 : Intégration LangChain (Multi-Provider)

- Remplacement du `fetch` brut du proxy par LangChain.js.
- Support natif OpenAI / Anthropic / Ollama via les adapters.
- Gestion unifiée du streaming et du switching de provider.

### Phase 8 : Dashboard Admin (React)

- Interface React (Vite + Tailwind + Shadcn/UI) pour la gestion.
- Gestion des sources (import, suppression, relance d'analyse).
- Visualisation du profil stylistique détecté.
- Settings (provider, modèle, clés API) et live logs du proxy.

---

## 8. Aperçu du Modèle de Données (Prisma)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
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
  id              Int      @id @default(1)
  personaPrompt   String   // Le prompt système généré
  metrics         String   // JSON des stats (avg sentence length, etc.)
  updatedAt       DateTime @updatedAt
}

model Config {
  id          Int     @id @default(1)
  provider    String  @default("openai") // openai, anthropic, ollama
  targetModel String  @default("gpt-4o")
  apiKey      String?
}
```

---

## Prochaines Étapes

1. `npm init` du projet.
2. Installer les dépendances : `fastify`, `@prisma/client`, `langchain`, `natural`.
3. Coder le prototype de l'analyseur de style.
