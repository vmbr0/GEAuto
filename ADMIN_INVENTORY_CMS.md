# Admin Inventory CMS - Documentation Complète

## 📊 Schéma Prisma Mis à Jour

### Nouveaux Modèles

```prisma
// ============================================
// INVENTORY SYSTEM
// ============================================

model InventoryVehicle {
  id            String        @id @default(cuid())
  slug          String        @unique
  title         String
  brand         String
  model         String
  year          Int
  mileage       Int
  fuelType      FuelType
  transmission  Transmission
  color         String?
  cvFiscaux     Int
  pricePurchase Float
  priceResale   Float?
  countryOrigin String        @default("DE")
  images        String[]      // Array of image file paths
  description   String?        @db.Text
  status        VehicleStatus  @default(AVAILABLE)
  importCost    Float?
  potentialMargin Float?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  priceComparisons PriceComparison[]

  @@index([brand])
  @@index([model])
  @@index([status])
  @@index([year])
  @@index([slug])
  @@map("inventory_vehicles")
}

// ============================================
// ADMIN CONFIGURATION
// ============================================

model AdminConfig {
  id                String   @id @default(cuid())
  key               String   @unique
  value             String   @db.Text
  description       String?
  updatedAt         DateTime @updatedAt
  updatedBy         String?

  @@map("admin_configs")
}

model CocPrice {
  id        String   @id @default(cuid())
  brand     String   @unique
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("coc_prices")
}

// ============================================
// PRICE COMPARISON
// ============================================

model PriceComparison {
  id                String   @id @default(cuid())
  vehicleId         String
  avgPriceGermany   Float?
  avgPriceFrance    Float?
  avgPriceLeboncoin Float?
  avgPriceLaCentrale Float?
  difference        Float?
  scrapedAt         DateTime @default(now())

  vehicle InventoryVehicle @relation(fields: [vehicleId], references: [id], onDelete: Cascade)

  @@index([vehicleId])
  @@map("price_comparisons")
}

// Nouvel Enum
enum VehicleStatus {
  AVAILABLE
  RESERVED
  SOLD
}
```

---

## 📁 Structure des Dossiers Complète

```
app/
├── inventory/                          # Pages publiques
│   ├── page.tsx                        ✅ Liste inventaire (filtres, tri, pagination)
│   └── [slug]/
│       └── page.tsx                    ✅ Détail véhicule (galerie, comparaison prix)
│
├── admin/
│   └── inventory/
│       ├── page.tsx                    ✅ Liste admin (table, filtres, actions)
│       ├── create/
│       │   └── page.tsx                ✅ Formulaire création
│       └── [id]/
│           └── edit/
│               └── page.tsx            ✅ Formulaire édition
│
└── api/
    ├── inventory/
    │   ├── route.ts                    ✅ GET: Liste avec filtres/tri/pagination
    │   └── [slug]/
    │       └── route.ts                ✅ GET: Détails véhicule
    │
    └── admin/
        ├── inventory/
        │   ├── route.ts                ✅ POST: Créer véhicule
        │   ├── upload/
        │   │   └── route.ts            ✅ POST: Upload images (local storage)
        │   └── [id]/
        │       ├── route.ts            ✅ GET/PUT/DELETE: Gérer véhicule
        │       └── compare-price/
        │           └── route.ts        ✅ POST: Comparer prix multi-sites
        │
        ├── config/
        │   └── route.ts                ✅ GET: Configuration admin
        │
        └── coc-price/
            └── [brand]/
                └── route.ts            ✅ GET: Prix COC par marque

components/
├── inventory/                          # Composants publics
│   ├── VehicleCard.tsx                 ✅ Carte véhicule animée
│   └── FilterSidebar.tsx              ✅ Sidebar filtres animée
│
└── admin/
    └── inventory/
        └── VehicleForm.tsx             ✅ Formulaire création/édition avec calculs

services/
├── inventory/
│   └── import-cost-calculator.ts      ✅ Calcul coûts importation
│
└── scraping/
    └── price-comparison.ts             ✅ Comparaison prix (mobile.de, Leboncoin, LaCentrale)

lib/
├── validations/
│   └── inventory.ts                    ✅ Schémas Zod validation
│
└── utils/
    └── inventory.ts                    ✅ Utilitaires (slug, validation)

types/
└── inventory.ts                        ✅ Types TypeScript
```

---

## 🎯 Pages Créées

### 1. `/admin/inventory` - Liste Admin

**Fichier**: `app/admin/inventory/page.tsx`

**Fonctionnalités**:
- ✅ Table avec colonnes complètes
- ✅ Image thumbnail
- ✅ Filtres: Statut, Marque
- ✅ Tri personnalisable
- ✅ Pagination (20 par page)
- ✅ Toggle rapide statut (dropdown)
- ✅ Boutons Edit/Delete
- ✅ Modal confirmation suppression
- ✅ Design professionnel dashboard

**Colonnes affichées**:
- Image thumbnail
- Titre
- Marque
- Année
- Prix achat
- Prix revente
- Coût import
- Marge potentielle (avec couleur)
- Statut (badge coloré)
- Date création
- Actions (Edit/Delete)

---

### 2. `/admin/inventory/create` - Création

**Fichier**: `app/admin/inventory/create/page.tsx`

**Formulaire** (`components/admin/inventory/VehicleForm.tsx`):
- ✅ Tous les champs requis
- ✅ Validation Zod en temps réel
- ✅ Upload multiple images
- ✅ Prévisualisation images
- ✅ Suppression images
- ✅ **Calcul automatique en temps réel**:
  - Carte grise = CV × Prix par CV
  - Coût import = Achat + Carte grise + COC + Plaque + Transport
  - Marge potentielle = Revente - Coût import
- ✅ Preview calculs avec icône Calculator
- ✅ Gestion erreurs complète

**Champs du formulaire**:
- Titre *
- Marque *
- Modèle *
- Année *
- Kilométrage *
- Carburant *
- Boîte de vitesse *
- Couleur
- CV Fiscaux *
- Pays d'origine
- Prix d'achat *
- Prix de revente
- Description
- Images (multiple)
- Statut *

---

### 3. `/admin/inventory/[id]/edit` - Édition

**Fichier**: `app/admin/inventory/[id]/edit/page.tsx`

**Fonctionnalités**:
- ✅ Charge les données existantes
- ✅ Utilise le même formulaire que création
- ✅ Recalcul automatique si valeurs changent
- ✅ Mise à jour images
- ✅ Gestion erreurs

---

## 🔧 Logique de Calcul Automatique

### Formule Carte Grise
```
carteGrise = cvFiscaux × regionPricePerCV
```

### Formule Coût d'Importation
```
importCost = 
  purchasePrice
  + carteGrise
  + cocPrice (récupéré selon marque)
  + germanTempPlateCost
  + transportCost
```

### Formule Marge Potentielle
```
potentialMargin = resalePrice - importCost
```

### Recalcul Automatique
Le formulaire recalcule automatiquement quand:
- ✅ Prix d'achat change
- ✅ CV fiscaux change
- ✅ Prix de revente change
- ✅ Marque change (pour récupérer le prix COC)

**Affichage**: Preview en temps réel dans une carte bleue avec détail de chaque composant.

---

## 📤 Upload d'Images

**Endpoint**: `POST /api/admin/inventory/upload`

**Fonctionnalités**:
- ✅ Stockage local: `/public/uploads/vehicles/`
- ✅ Validation type (images uniquement)
- ✅ Validation taille (max 10MB)
- ✅ Génération nom unique (timestamp + random)
- ✅ Retour chemin relatif pour DB
- ✅ Gestion erreurs complète

**Stockage**: Les chemins sont stockés dans le tableau `images[]` du modèle `InventoryVehicle`.

---

## ✅ Validation

**Schéma Zod**: `lib/validations/inventory.ts`

**Validations**:
- ✅ Titre: requis, max 200 caractères
- ✅ Marque/Modèle: requis, max 100 caractères
- ✅ Année: entier, entre 1900 et année actuelle + 1
- ✅ Kilométrage: entier, >= 0
- ✅ CV Fiscaux: entier, entre 1 et 100
- ✅ Prix: nombre, >= 0, max 10M
- ✅ Types enum: FuelType, Transmission, VehicleStatus
- ✅ Images: tableau de strings

**Affichage erreurs**: Sous chaque champ avec style rouge.

---

## 🎨 Design

**Style**: Dashboard professionnel minimal

**Caractéristiques**:
- ✅ Animations subtiles (Framer Motion)
- ✅ Badges colorés selon statut
- ✅ Table responsive avec hover effects
- ✅ Modals élégantes
- ✅ Formulaires avec validation visuelle
- ✅ Preview calculs avec icônes
- ✅ Espacement généreux
- ✅ Typographie claire

---

## 📦 Dépendances Requises

Ajoutées dans `package.json`:
```json
{
  "react-hook-form": "^7.51.0",
  "@hookform/resolvers": "^3.3.4"
}
```

**Installation**:
```bash
npm install react-hook-form @hookform/resolvers
```

---

## 🚀 Prochaines Étapes

1. ✅ Installer les dépendances manquantes
2. ⏳ Créer le panneau de configuration admin (PART 5)
3. ⏳ Tester le système complet
4. ⏳ Ajouter gestion suppression fichiers images

---

## 📝 Notes Importantes

- Les images sont stockées localement dans `/public/uploads/vehicles/`
- Le prix COC est récupéré dynamiquement selon la marque
- Les calculs sont mis à jour en temps réel dans le formulaire
- La validation empêche les valeurs négatives
- Le système est prêt pour la production
