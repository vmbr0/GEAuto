# 🔐 Identifiants de Test - GE Auto Import

## 📋 Utilisateurs Créés

### 👤 ADMIN (Accès Panel Admin)
```
Email:    admin@geautoimport.fr
Password: password123
Rôle:     ADMIN
```

**Accès:**
- Dashboard utilisateur: `/dashboard`
- Panel admin: `/admin`
- Gestion des demandes: `/admin/requests`
- Outils de scraping: `/admin/search/vehicle` et `/admin/search/parts`

---

### 👥 Utilisateurs Standards (3 utilisateurs)

#### User 1
```
Email:    user1@example.com
Password: password123
Nom:      Jean Dupont
Rôle:     USER
```

#### User 2
```
Email:    user2@example.com
Password: password123
Nom:      Marie Martin
Rôle:     USER
```

#### User 3
```
Email:    user3@example.com
Password: password123
Nom:      Pierre Durand
Rôle:     USER
```

**Accès:**
- Dashboard: `/dashboard`
- Créer demande véhicule: `/request/vehicle`
- Créer demande pièces: `/request/parts`
- Voir mes demandes: `/dashboard/requests`

---

## 🚀 Comment Créer ces Utilisateurs

### Option 1: Script de Seed (Recommandé)

1. **Assurez-vous que la base de données est créée:**
   ```bash
   npm run db:push
   ```

2. **Lancez le script de seed:**
   ```bash
   npm run db:seed
   ```

3. **C'est tout !** Les utilisateurs sont créés automatiquement.

---

### Option 2: Création Manuelle

1. Aller sur http://localhost:3000/auth/register
2. Créer un compte avec l'email souhaité
3. Pour créer un admin, modifier directement dans la base de données:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'votre-email@example.com';
   ```

---

## 📝 Notes Importantes

- ⚠️ **Mot de passe:** Tous les utilisateurs de test ont le même mot de passe: `password123`
- 🔒 **Sécurité:** Changez ces mots de passe en production !
- 🔄 **Réexécution:** Le script utilise `upsert`, vous pouvez le relancer sans problème
- ✅ **Hash:** Les mots de passe sont hashés avec bcrypt (12 rounds)

---

## 🎯 Utilisation

1. **Se connecter:**
   - Aller sur http://localhost:3000/auth/login
   - Utiliser un des identifiants ci-dessus

2. **Tester le panel admin:**
   - Connectez-vous avec `admin@geautoimport.fr`
   - Accédez à `/admin` pour voir le panel administrateur

3. **Tester le dashboard utilisateur:**
   - Connectez-vous avec `user1@example.com`
   - Créez des demandes de véhicules ou de pièces

---

## 🔧 Commandes Utiles

```bash
# Créer la base de données
npm run db:push

# Générer les utilisateurs de test
npm run db:seed

# Ouvrir Prisma Studio (interface graphique)
npm run db:studio

# Voir les utilisateurs dans la base
# Dans Prisma Studio, allez dans la table "users"
```

---

## 📌 Prochaines Étapes

Une fois les utilisateurs créés, vous pouvez:

1. ✅ Tester l'authentification
2. ✅ Créer des demandes de véhicules
3. ✅ Créer des demandes de pièces
4. ✅ Tester le panel admin
5. ✅ Tester les outils de scraping (nécessite configuration DB)

---

**Bon test ! 🚀**
