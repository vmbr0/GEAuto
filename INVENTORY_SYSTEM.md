# Système d'Inventaire - Documentation

## 📋 Schéma Prisma Mis à Jour

### Modèles Ajoutés

#### InventoryVehicle
```prisma
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
```

#### AdminConfig
```prisma
model AdminConfig {
  id                String   @id @default(cuid())
  key               String   @unique
  value             String   @db.Text
  description       String?
  updatedAt         DateTime @updatedAt
  updatedBy         String?

  @@map("admin_configs")
}
```

#### CocPrice
```prisma
model CocPrice {
  id        String   @id @default(cuid())
  brand     String   @unique
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("coc_prices")
}
```

#### PriceComparison
```prisma
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
```

#### Nouvel Enum
```prisma
enum VehicleStatus {
  AVAILABLE
  RESERVED
  SOLD
}
```

---

## 📁 Structure des Dossiers

```
app/
├── inventory/
│   ├── page.tsx                    # Page publique d'inventaire
│   └── [slug]/
│       └── page.tsx                # Page de détail véhicule
├── admin/
│   └── inventory/
│       ├── page.tsx                # Liste admin (table)
│       ├── create/
│       │   └── page.tsx            # Formulaire de création
│       └── [id]/
│           └── edit/
│               └── page.tsx        # Formulaire d'édition
└── api/
    ├── inventory/
    │   ├── route.ts                # GET: Liste avec filtres
    │   └── [slug]/
    │       └── route.ts            # GET: Détails véhicule
    └── admin/
        ├── inventory/
        │   ├── route.ts            # POST: Créer véhicule
        │   ├── upload/
        │   │   └── route.ts        # POST: Upload images
        │   └── [id]/
        │       ├── route.ts        # GET/PUT/DELETE: Gérer véhicule
        │       └── compare-price/
        │           └── route.ts    # POST: Comparer prix
        └── config/
            └── route.ts            # GET: Configuration admin

components/
├── inventory/
│   ├── VehicleCard.tsx             # Carte véhicule (public)
│   └── FilterSidebar.tsx           # Sidebar filtres (public)
└── admin/
    └── inventory/
        └── VehicleForm.tsx         # Formulaire création/édition

services/
├── inventory/
│   └── import-cost-calculator.ts   # Calcul coûts importation
└── scraping/
    └── price-comparison.ts         # Comparaison prix multi-sites

lib/
├── validations/
│   └── inventory.ts                # Schémas Zod
└── utils/
    └── inventory.ts                # Utilitaires (slug, validation)

types/
└── inventory.ts                    # Types TypeScript
```

---

## 🎯 Fonctionnalités Implémentées

### 1. Page Liste Admin (`/admin/inventory`)
- ✅ Table avec toutes les colonnes requises
- ✅ Filtres par statut et marque
- ✅ Tri personnalisable
- ✅ Pagination
- ✅ Toggle rapide du statut
- ✅ Boutons Edit/Delete
- ✅ Modal de confirmation suppression
- ✅ Design professionnel et minimal

### 2. Formulaire Création/Édition
- ✅ Tous les champs requis
- ✅ Upload multiple d'images (stockage local)
- ✅ Prévisualisation des images
- ✅ Suppression d'images
- ✅ Validation Zod complète
- ✅ Calcul automatique en temps réel :
  - Carte grise = CV × Prix par CV
  - Coût import = Prix achat + Carte grise + COC + Plaque + Transport
  - Marge potentielle = Prix revente - Coût import
- ✅ Affichage preview des calculs
- ✅ Gestion d'erreurs

### 3. Calculs Automatiques
- ✅ Recalcul automatique quand :
  - Prix d'achat change
  - CV fiscaux change
  - Prix de revente change
- ✅ Utilise la configuration admin
- ✅ Affichage visuel des résultats

### 4. Upload d'Images
- ✅ Stockage local dans `/public/uploads/vehicles/`
- ✅ Validation type et taille
- ✅ Génération nom unique
- ✅ Retour chemin relatif pour DB

---

## 🔧 Configuration Requise

### Dépendances à Installer

```bash
npm install react-hook-form @hookform/resolvers
```

### Variables d'Environnement

Aucune nouvelle variable requise. Le système utilise la configuration stockée en DB.

---

## 📊 Logique de Calcul

### Carte Grise
```
carteGrise = cvFiscaux × regionPricePerCV
```

### Coût d'Importation
```
importCost = 
  purchasePrice
  + carteGrise
  + cocPrice (par marque)
  + germanTempPlateCost
  + transportCost
```

### Marge Potentielle
```
potentialMargin = resalePrice - importCost
```

---

## 🎨 Design

- **Style**: Dashboard professionnel
- **Animations**: Subtiles avec Framer Motion
- **Badges**: Couleurs selon statut
- **Table**: Responsive avec hover effects
- **Formulaires**: Validation en temps réel
- **Modals**: Confirmations élégantes

---

## ✅ Prochaines Étapes

1. Installer les dépendances manquantes
2. Créer le panneau de configuration admin (PART 5)
3. Tester le système complet
4. Ajouter la gestion des images (suppression fichiers)
