# Communauto CC

Application Next.js 15 pour l'analyse et l'optimisation des coûts de co-voiturage Communauto.

## 🎯 Mission

Refactoring ultra clean de `communauto-nss` vers `communauto-cc` avec architecture moderne et standards élevés.

## 🏗️ Architecture

### Stack Technique
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **UI**: Shadcn/ui components
- **State**: TanStack Query + React Context
- **Forms**: React Hook Form + Zod validation

### Structure du Projet
```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                 # Shadcn/ui components (design system)
│   ├── features/           # Components métier par domaine
│   │   ├── auth/           # Authentification
│   │   ├── pdf-extraction/ # Extraction PDF
│   │   └── dashboard/      # Tableau de bord
│   └── layout/             # Components layout globaux
├── lib/                    # Services et logique métier
│   ├── auth/               # Services authentification
│   ├── pdf-extraction/     # Services extraction PDF
│   ├── supabase/           # Clients Supabase
│   └── shared/             # Utilitaires partagés
├── hooks/                  # Hooks globaux réutilisables
├── types/                  # Types TypeScript par domaine
└── middleware.ts           # Middleware Next.js
```

## 🚀 Phase 1 - Foundation ✅

### Composants Core Implémentés
1. **Gestion utilisateurs** ✅
   - Authentification Supabase
   - RLS policies granulaires
   - Profils utilisateurs

2. **Base de données** ✅
   - Schéma Communauto complet (7 tables)
   - Relations et index optimisés
   - Migrations versionnées

3. **Architecture Clean** ✅
   - Structure par domaine métier
   - Types TypeScript stricts
   - Standards de code respectés

### Tables Principales
- `user_profiles`: Profils utilisateurs étendus
- `file_uploads`: Fichiers PDF uploadés
- `trips`: Trajets extraits des factures
- `transactions`: Transactions financières
- `balance_summary`: Résumés de facturation
- `subscriber_groups`: Groupes d'abonnés (principal + co-abonnés)

## 🛠️ Développement

### Prérequis
- Node.js 18+
- Docker (pour Supabase local)
- Git

### Installation
```bash
# Cloner le projet
git clone https://github.com/username/communauto-cc.git
cd communauto-cc

# Installer les dépendances
npm install

# Démarrer Supabase local
supabase start

# Appliquer les migrations
supabase db push --local

# Générer les types TypeScript
npm run gen:types

# Démarrer le serveur de développement
npm run dev
```

### Scripts Utiles
```bash
# Développement
npm run dev                 # Serveur de développement
supabase start             # Démarrer Supabase local

# Code Quality
npm run lint               # ESLint + TypeScript check
npm run typecheck          # TypeScript uniquement

# Base de données
npm run gen:types          # Générer types depuis schéma DB
supabase db push --local   # Appliquer migrations
supabase db reset          # Reset DB avec migrations

# Tests
npm run test               # Tests unitaires (Vitest)
npm run test:e2e           # Tests E2E (Cypress)
```

### URLs Locales
- **Application**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **API Supabase**: http://localhost:54321

## 📊 Phase 2 - Core Features (À venir)

### Objectifs
1. **Service d'extraction PDF** (Edge Functions)
2. **Composants d'upload** et validation
3. **Services de persistance** données
4. **Migration calculateurs** de coûts depuis communauto-nss

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Policies granulaires par utilisateur
- Authentification Supabase avec JWT
- Variables d'environnement sécurisées

## 📝 Standards de Code

### Conventions
- **Fichiers**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Types**: PascalCase avec suffixes (`UserData`, `AuthError`)
- **Fonctions**: camelCase avec prefixes (`handleSubmit`, `validateUser`)

### Architecture Obligatoire
- ❌ **INTERDIT**: `lib/utils.ts` générique
- ❌ **INTERDIT**: Logique métier dans `app/`
- ✅ **OBLIGATOIRE**: Organisation par domaine métier
- ✅ **OBLIGATOIRE**: Types dans `src/types/`

## 🤝 Contribution

1. Respecter les règles définies dans `CLAUDE.md`
2. Valider avec `npm run lint` avant commit
3. Suivre les conventions de nommage
4. Documenter les changements significatifs

## 📄 Licence

MIT - Voir [LICENSE](LICENSE)

---

**Développé avec ❤️ et les standards les plus élevés pour Communauto**