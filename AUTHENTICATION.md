# Authentification - Documentation

## ✅ Étape 4 Complétée

L'authentification NextAuth avec JWT et contrôle d'accès basé sur les rôles a été implémentée.

---

## 📁 Structure des Fichiers Créés

```
app/
├── api/
│   └── auth/
│       ├── [...nextauth]/
│       │   └── route.ts          # Route NextAuth API
│       └── register/
│           └── route.ts          # API d'inscription
├── auth/
│   ├── login/
│   │   └── page.tsx              # Page de connexion
│   └── register/
│       └── page.tsx              # Page d'inscription
├── dashboard/
│   ├── layout.tsx                # Layout protégé USER/ADMIN
│   └── page.tsx                  # Page dashboard
└── admin/
    ├── layout.tsx                # Layout protégé ADMIN uniquement
    └── page.tsx                  # Page admin

components/
├── ui/
│   ├── Input.tsx                 # Composant input premium
│   ├── Button.tsx                # Composant bouton avec animations
│   └── Alert.tsx                 # Composant alert pour erreurs
└── LogoutButton.tsx              # Bouton de déconnexion

lib/
├── auth.ts                       # Configuration NextAuth
├── auth-helpers.ts               # Helpers (requireRole, getCurrentUser, etc.)
├── validations/
│   └── auth.ts                   # Schémas Zod pour validation
└── prisma.ts                     # Client Prisma

middleware.ts                     # Protection des routes
types/
└── next-auth.d.ts                # Types TypeScript pour NextAuth
```

---

## 🔐 Configuration NextAuth

**Fichier:** `lib/auth.ts`

- ✅ **Strategy:** JWT (pas de sessions database)
- ✅ **Provider:** Credentials (email + password)
- ✅ **Password hashing:** bcryptjs avec salt rounds 12
- ✅ **Role dans JWT:** Le rôle utilisateur est stocké dans le token JWT
- ✅ **Session maxAge:** 30 jours

### Callbacks

- **JWT callback:** Ajoute `id` et `role` au token
- **Session callback:** Ajoute `id` et `role` à la session

---

## 🛡️ Middleware de Protection

**Fichier:** `middleware.ts`

### Routes Protégées

1. **`/dashboard`** → Accessible par USER et ADMIN
   - Redirige vers `/auth/login` si non authentifié
   
2. **`/admin`** → Accessible uniquement par ADMIN
   - Redirige vers `/dashboard` si rôle USER
   - Redirige vers `/auth/login` si non authentifié

### Routes Publiques

- `/auth/*` (login, register)
- `/` (page d'accueil)
- `/services/*`
- `/request/*`

---

## 🔧 Helpers d'Authentification

**Fichier:** `lib/auth-helpers.ts`

### Fonctions Disponibles

```typescript
// Obtenir la session actuelle
await getSession()

// Obtenir l'utilisateur actuel
await getCurrentUser()

// Exiger l'authentification (redirige si non connecté)
await requireAuth()

// Exiger un rôle spécifique (redirige si rôle incorrect)
await requireRole(UserRole.ADMIN)
await requireRole(UserRole.USER)

// Vérifier si l'utilisateur a un rôle
await hasRole(UserRole.ADMIN)

// Vérifier si l'utilisateur est admin
await isAdmin()
```

---

## ✅ Validation Zod

**Fichier:** `lib/validations/auth.ts`

### Schémas de Validation

1. **`loginSchema`**
   - Email: requis, format valide
   - Password: requis, minimum 6 caractères

2. **`registerSchema`**
   - Name: requis, 2-50 caractères
   - Email: requis, format valide
   - Password: requis, minimum 8 caractères, doit contenir majuscule, minuscule et chiffre
   - ConfirmPassword: doit correspondre au password

---

## 🎨 Interface Utilisateur

### Pages d'Authentification

**Design Premium:**
- ✅ Layout centré avec animations Framer Motion
- ✅ Inputs Apple-style avec focus states
- ✅ Boutons avec micro-interactions (hover, active)
- ✅ États de chargement avec spinner
- ✅ Messages d'erreur avec composant Alert
- ✅ Validation en temps réel
- ✅ Transitions fluides

### Composants UI

1. **`Input`** - Input premium avec label et gestion d'erreurs
2. **`Button`** - Bouton avec variants (primary, secondary, outline) et état de chargement
3. **`Alert`** - Alert avec variants (error, success, info) et animations

---

## 🔒 Sécurité

### Implémenté

- ✅ Mots de passe hashés avec bcrypt (12 rounds)
- ✅ Validation Zod côté client et serveur
- ✅ Prévention des emails dupliqués à l'inscription
- ✅ Protection CSRF via NextAuth
- ✅ JWT sécurisé avec secret
- ✅ Middleware de protection des routes
- ✅ Contrôle d'accès basé sur les rôles

### Variables d'Environnement Requises

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
DATABASE_URL=postgresql://...
```

---

## 📝 API Routes

### POST `/api/auth/register`

**Body:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Réponses:**
- `201` - Compte créé avec succès
- `400` - Email déjà utilisé ou validation échouée
- `500` - Erreur serveur

### POST `/api/auth/[...nextauth]`

Route NextAuth standard pour la connexion.

---

## 🚀 Utilisation

### Dans les Pages/Layouts Serveur

```typescript
import { requireRole, getCurrentUser } from "@/lib/auth-helpers";
import { UserRole } from "@prisma/client";

// Exiger un rôle spécifique
export default async function AdminPage() {
  await requireRole(UserRole.ADMIN);
  // ...
}

// Obtenir l'utilisateur actuel
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  // ...
}
```

### Dans les Composants Client

```typescript
"use client";

import { signIn, signOut, useSession } from "next-auth/react";

// Connexion
await signIn("credentials", { email, password });

// Déconnexion
signOut({ callbackUrl: "/auth/login" });

// Session
const { data: session } = useSession();
```

---

## ✅ Checklist Complétée

- [x] NextAuth avec JWT strategy
- [x] Credentials provider (email + password)
- [x] bcrypt pour hashage des mots de passe
- [x] RBAC (USER / ADMIN)
- [x] Middleware pour protection des routes
- [x] Role dans JWT et session
- [x] Helper `requireRole(role: UserRole)`
- [x] Validation Zod pour inputs
- [x] Prévention emails dupliqués
- [x] Gestion d'erreurs propre
- [x] UI premium avec animations

---

## 📌 Prochaines Étapes

L'authentification est complète et prête. Vous pouvez maintenant :

1. Tester l'inscription et la connexion
2. Vérifier la protection des routes `/dashboard` et `/admin`
3. Continuer avec l'étape 5 : Système de design et layouts
