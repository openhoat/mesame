# MeSame - Project Brief

> **"The AI that writes like me, for me."**
> MeSame est un méta-agent IA qui analyse localement votre empreinte linguistique pour transformer n'importe quel modèle (OpenAI, Claude, Ollama) en un double numérique fidèle.

---

## 1. Identité du Projet

- **Nom :** MeSame
- **Slogan :** Your personal style proxy.
- **Concept :** Un proxy local qui injecte votre "ADN stylistique" dans toutes vos interactions avec les LLMs.
- **Valeur Unique :** Confidentialité totale de l'analyse (locale) et interopérabilité universelle via un protocole API standard.

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

---

## 5. Spécifications de l'Interface Admin

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

### Phase 1 : Fondations (Core)

- Initialisation du Monorepo TS.
- Configuration du serveur Fastify et schéma Prisma.
- Setup de la route proxy de base.

### Phase 2 : Moteur d'Analyse (NLP)

- Développement du script d'extraction avec la lib `natural`.
- Algorithme de génération de "Portrait stylistique".
- Test d'analyse sur un set de 50 documents.

### Phase 3 : Proxy & LangChain

- Intégration de LangChain.js pour le multi-fournisseur.
- Gestion du streaming et de l'injection de prompt.
- Validation de la compatibilité avec un client tiers (ex: Chatbox).

### Phase 4 : Interface Utilisateur (UI)

- Création du dashboard React.
- Interface de gestion des sources et des clés API.
- Monitoring des appels proxy.

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
