# Mission Communauto-CC - Refactoring Ultra Clean

## 🎯 Mission Principale

Bâtir ce nouveau projet **communauto-v2** en partant du projet **communauto-nss** existant, en appliquant les plus hauts standards de code et d'architecture moderne.

### Objectifs
- **Refactoring complet** : Reconstruire le projet avec une architecture ultra clean
- **Standards élevés** : Respecter les meilleures pratiques Next.js et Supabase
- **Amélioration continue** : Optimiser le code partout où c'est possible
- **Respect des règles métier** : Conserver absolument toutes les règles business de communauto-nss

⚠️ **IMPORTANT** : En cas de doute sur une règle métier, TOUJOURS poser la question avant de procéder.

## 🏗️ Étape 1 - Scope Initial (en cours)

Focus sur 3 composants core :
1. **Gestion des comptes utilisateurs**
2. **Extraction des PDFs Communauto** 
3. **Sauvegarde des données extraites**

## 📋 Standards de Code & Architecture

### Frontend (Next.js 14+)
- **App Router** exclusivement
- **TypeScript strict** avec types complets
- **Tailwind CSS** pour tout le styling
- **Shadcn/ui** comme base de composants
- **Architecture modulaire** avec séparation claire des responsabilités
- **Server Components** par défaut, Client Components seulement quand nécessaire

### Backend (Supabase)
- **Row Level Security (RLS)** sur toutes les tables
- **Migrations versionnées** avec rollback possible
- **Edge Functions** pour la logique métier complexe
- **Types TypeScript** générés automatiquement
- **Policies granulaires** par rôle utilisateur

### Qualité Code
```typescript
// ✅ Préférer les early returns
const processUser = (user: User) => {
  if (!user.id) return null;
  if (!user.isActive) return null;
  
  return processActiveUser(user);
}

// ✅ Consts au lieu de functions
const handleSubmit = async (data: FormData) => {
  // logic here
}

// ✅ Noms descriptifs avec prefixes
const handleFileUpload = () => {};
const handleUserDelete = () => {};
```

### Règles Issues de communauto-nss
- Early returns systématiques pour la lisibilité
- Tailwind exclusivement (pas de CSS custom)
- Variables et fonctions descriptives
- Prefix "handle" pour les event handlers
- Consts au lieu de functions
- Accessibilité (tabindex, aria-label, etc.)
- Types TypeScript stricts

## 🔐 Règles Métier Critiques

### 🚨 Règles Communauto (IMMUABLES)
Ces règles sont définies par Communauto et ne peuvent PAS être modifiées :
- **Format PDF** : Structure exacte des factures Communauto
- **Données facture** : Champs, format, positions dans le PDF
- **Grille tarifaire** : Calculs, taux, frais selon les règles Communauto

### 🔧 Règles Application (ÉVOLUTIVES) 
Ces règles sont définies par notre application et peuvent être améliorées :
- **Onboarding obligatoire** : Une fois son compte créé, forcer l'upload d'une première facture
- **Validation compte** : Extraire le No d'abonné de la première facture afin de l'associer au user
- **Workflow utilisateur** : Processus d'inscription, validation, utilisation

### Gestion Utilisateurs
- **Compte unique** : Un seul compte utilisateur pour l'abonné principal
- **Co-abonnés intégrés** : Les données des co-abonnés sont incluses dans le compte utilisateur de l'abonné principal
- **Structure facture** : Le header contient toujours le "No de compte" de l'abonné principal
- **Trajets mixtes** : Les trajets peuvent avoir différents "No d'usagers" (principal + co-abonnés)
- **Sécurité** : RLS policies basées sur l'abonné principal qui possède toutes les données

### Extraction PDF
- **Format Communauto strict** : Respecter exactement le parsing existant dans communauto-nss
- **Données structurées** : Respecter exactement la strcuture existant dans communauto-nss
- **Validation** : Vérifier l'intégrité des données extraites
- **Historique** : Conserver trace de tous les imports

### Architecture Données
```
Users (auth.users)
├── UserProfiles (public.user_profiles)
├── FileUploads (public.file_uploads)
├── Invoices (public.invoices)
├── Trips (public.trips)
├── Transactions (public.transactions)
└── SubscriberGroups (public.subscriber_groups)
```

## 🛠️ Stack Technique

### Core Stack
- **Next.js 14+** (App Router)
- **TypeScript 5+** (strict mode)
- **Supabase** (Database + Auth + Storage + Edge Functions)
- **Tailwind CSS 3+**
- **Shadcn/ui**

### Dev Tools
- **ESLint** + **Prettier** avec configs strictes
- **Husky** pour pre-commit hooks
- **TypeScript strict** mode
- **Supabase CLI** pour migrations

### Testing (à implémenter)
- **Vitest** pour unit tests
- **Playwright** pour E2E
- **Testing Library** pour composants

## 🏗️ ARCHITECTURE HYBRIDE OBLIGATOIRE

### 📁 Structure Officielle (STRICTEMENT RESPECTÉE)

```
communauto-cc/
├── src/
│   ├── app/                          # Next.js App Router (PAGES UNIQUEMENT)
│   │   ├── auth/                     # Pages auth
│   │   │   ├── login/page.tsx        
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── dashboard/page.tsx        # Pages dashboard
│   │   ├── onboarding/page.tsx       # Pages onboarding
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   │
│   ├── components/                   # Composants organisés
│   │   ├── ui/                       # Design system (shadcn UNIQUEMENT)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── card.tsx
│   │   ├── features/                 # Composants métier par domaine
│   │   │   ├── auth/                 # Composants auth spécifiques
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── register-form.tsx
│   │   │   ├── pdf-extraction/       # Composants PDF spécifiques
│   │   │   │   ├── file-upload.tsx
│   │   │   │   └── extraction-results.tsx
│   │   │   └── dashboard/            # Composants dashboard
│   │   └── layout/                   # Layout components globaux
│   │       ├── header.tsx
│   │       └── sidebar.tsx
│   │
│   ├── lib/                          # Services & logique métier par domaine
│   │   ├── auth/                     # Services auth
│   │   │   ├── actions.ts            # Server actions auth
│   │   │   ├── service.ts            # Logique métier auth
│   │   │   └── utils.ts              # Utilitaires auth
│   │   ├── pdf-extraction/           # Services PDF extraction
│   │   │   ├── service.ts            # Service extraction principal
│   │   │   ├── parser.ts             # Parsing PDF
│   │   │   └── validators.ts         # Validations PDF
│   │   ├── supabase/                 # Clients Supabase
│   │   │   ├── client.ts             # Client-side
│   │   │   └── server.ts             # Server-side
│   │   └── shared/                   # Utilitaires partagés
│   │       ├── utils.ts              # Utilitaires génériques
│   │       ├── constants.ts          # Constantes globales
│   │       └── validations.ts        # Schemas Zod partagés
│   │
│   ├── hooks/                        # Hooks globaux UNIQUEMENT
│   │   └── use-auth.ts               # Hook auth global
│   │
│   ├── types/                        # Types organisés par domaine
│   │   ├── auth.ts                   # Types auth
│   │   ├── pdf.ts                    # Types PDF extraction
│   │   ├── database.ts               # Types DB générés
│   │   └── common.ts                 # Types communs
│   │
│   └── middleware.ts                 # Middleware Next.js
│
├── tests/                            # Tests organisés
│   ├── __fixtures__/                 # Données de test
│   │   ├── pdfs/                     # PDFs de test
│   │   └── users/                    # Données utilisateurs test
│   ├── integration/                  # Tests d'intégration
│   │   ├── auth/                     # Tests auth
│   │   └── pdf-extraction/           # Tests extraction
│   ├── unit/                         # Tests unitaires
│   │   ├── lib/                      # Tests services
│   │   └── components/               # Tests composants
│   └── utils/                        # Utilitaires de test
│
├── supabase/
│   ├── functions/                    # Edge functions
│   │   └── extract-data-from-file/
│   └── migrations/                   # DB migrations
│
└── docs/                             # Documentation
    ├── architecture.md               # Architecture détaillée
    ├── pdf-extraction.md             # ✅ Config complète extraction PDF
    └── conventions.md                # Conventions de code
```

### 🚨 RÈGLES DE PLACEMENT OBLIGATOIRES

#### **1. Pages (src/app/)**
- **UNIQUEMENT** des pages Next.js App Router
- **AUCUNE** logique métier dans les pages
- **AUCUN** composant complexe dans les pages
- Import depuis `components/features/` ou `lib/`

#### **2. Composants (src/components/)**
- `ui/` : Composants shadcn UNIQUEMENT, AUCUNE modification
- `features/` : Composants métier organisés par domaine
- `layout/` : Composants layout globaux réutilisables
- **INTERDICTION** de mélanger UI et métier

#### **3. Services (src/lib/)**
- Organisation par domaine métier OBLIGATOIRE
- `auth/` : Tout ce qui concerne l'authentification
- `pdf-extraction/` : Tout ce qui concerne l'extraction PDF
- `shared/` : UNIQUEMENT utilitaires vraiment partagés
- **INTERDICTION** de créer `lib/utils.ts` fourre-tout

#### **4. Types (src/types/)**
- Organisation par domaine OBLIGATOIRE
- Types liés au domaine dans le fichier correspondant
- `common.ts` : UNIQUEMENT types vraiment communs
- **INTERDICTION** de types dans `lib/` ou `components/`

#### **5. Hooks (src/hooks/)**
- **UNIQUEMENT** hooks globaux réutilisables
- Hooks spécifiques → dans `lib/domaine/`
- **INTERDICTION** de hooks métier dans `hooks/`

## 🚨 RÈGLES CRITIQUES DE FICHIERS

### ⚠️ FICHIERS GÉNÉRÉS - INTERDICTION ABSOLUE DE MODIFICATION

Ces fichiers sont **GÉNÉRÉS AUTOMATIQUEMENT** et ne doivent **JAMAIS** être modifiés manuellement :

#### `src/types/database.ts`
- **Généré par** : `npm run types:generate` (Supabase CLI)
- **INTERDICTION** : Écrire du code custom dans ce fichier
- **Raison** : Écrasé à chaque génération des types
- **Alternative** : Utiliser `src/types/custom.ts` pour les types helpers

```bash
# Régénérer les types après changement de schéma
npm run types:generate

# Vérifier les types et erreurs TypeScript
npm run lint  # ✅ Recommandé pour vérification rapide
npm run build # ❌ Plus lourd, réservé pour production
```

### 📝 CONVENTIONS DE NOMMAGE STRICTES

#### **Fichiers & Dossiers**
```bash
# ✅ Correct
src/components/features/pdf-extraction/file-upload.tsx
src/lib/auth/actions.ts
src/types/pdf.ts

# ❌ Incorrect
src/components/FileUpload.tsx
src/lib/authActions.ts
src/types/pdfTypes.ts
```

#### **Imports & Exports**
```typescript
// ✅ Correct - Import depuis le domaine
import { authService } from '@/lib/auth/service'
import { PdfExtractionService } from '@/lib/pdf-extraction/service'
import { FileUpload } from '@/components/features/pdf-extraction/file-upload'

// ❌ Incorrect - Import direct depuis lib/
import { login } from '@/lib/auth/actions'
import { extractPdf } from '@/lib/pdf-extraction'
```

#### **Export Patterns**
```typescript
// ✅ Service exports (lib/domaine/service.ts)
export class AuthService {
  async login() { }
}
export const authService = new AuthService()

// ✅ Actions exports (lib/domaine/actions.ts)  
export async function login(formData: FormData) { }
export async function logout() { }

// ✅ Component exports
export function FileUpload() { }
export { FileUpload as default }
```

### ⚡ PATTERNS OBLIGATOIRES

#### **1. Structure de Service**
```typescript
// src/lib/domaine/service.ts
export class DomainService {
  private supabase = createClient()
  
  async methodName() {
    // Logique métier ici
  }
}

export const domainService = new DomainService()
```

#### **2. Structure de Component Feature**
```typescript
// src/components/features/domaine/component-name.tsx
'use client'

import { Button } from '@/components/ui/button'
import { domainService } from '@/lib/domaine/service'

export function ComponentName() {
  // Component logic
}
```

#### **3. Structure de Types**
```typescript
// src/types/domaine.ts
export interface DomainEntity {
  id: string
  // properties
}

export type DomainAction = 'create' | 'update' | 'delete'
```

### 🚫 INTERDICTIONS ABSOLUES

1. **JAMAIS** de logique métier dans `src/app/`
2. **JAMAIS** de composants UI modifiés dans `components/ui/`
3. **JAMAIS** de fichiers fourre-tout (utils.ts générique)
4. **JAMAIS** de types en dehors de `src/types/`
5. **JAMAIS** d'imports relatifs `../../../`
6. **JAMAIS** de hooks métier dans `src/hooks/`

## ⚡ Workflow de Développement

1. **Analyse** : Comprendre la fonctionnalité dans communauto-nss
2. **Design** : Concevoir l'architecture clean pour communauto-cc  
3. **Implémentation** : Coder avec les standards définis
4. **Test** : Valider le comportement vs communauto-nss
5. **Documentation** : Documenter les changements

## 🔍 Commandes Utiles

```bash
# Démarrage dev
npm run dev
supabase start

# Vérification code (PRIORITAIRE)
npm run lint      # ✅ Vérifier types + ESLint (rapide)
npm run build     # Production build (plus lourd)

# Types generation
npm run types:generate  # Après changement schéma DB

# Database
supabase db reset       # Réinitialiser DB avec migrations
supabase db push        # Appliquer migrations

# Tests (à implémenter)
npm run test
npm run test:e2e
```

### 🚀 **Workflow de développement recommandé**

1. **Modifier le code** → `npm run lint` ✅
2. **Changer schéma DB** → `npm run types:generate` puis `npm run lint`
3. **Avant commit** → `npm run lint` obligatoire
4. **Build production** → `npm run build` (CI/CD uniquement)

### ⚡ **Règle de vérification obligatoire**

**TRÈS IMPORTANT** : Quand vous terminez une tâche, vous DEVEZ exécuter `npm run lint` pour vérifier que le code est correct (types TypeScript + ESLint). N'utilisez `npm run build` que si spécifiquement demandé car c'est plus lourd.

## 📝 Notes Importantes

- **Priorité absolue** : Respecter les règles métier existantes
- **Question systématique** : En cas de doute, poser la question
- **Qualité maximale** : Viser l'excellence technique
- **Documentation** : Maintenir cette doc à jour

## 🔗 Documentation Spécialisée

- **📄 [PDF Extraction](docs/pdf-extraction.md)** - Configuration complète extraction PDF, Edge Function, storage privé
- **🏗️ Architecture** - Structure des tables, relations, RLS policies
- **📐 Conventions** - Standards de code, patterns obligatoires

---

*Mission Étape 1 TERMINÉE ✅ : Gestion utilisateurs + Extraction PDF + Sauvegarde données*