# 🌱 Seed Database - Utilisateurs de Test

## Identifiants de Test

### 👤 ADMIN
- **Email:** `admin@geautoimport.fr`
- **Password:** `password123`
- **Rôle:** ADMIN

### 👤 Utilisateurs Standards

#### User 1
- **Email:** `user1@example.com`
- **Password:** `password123`
- **Nom:** Jean Dupont

#### User 2
- **Email:** `user2@example.com`
- **Password:** `password123`
- **Nom:** Marie Martin

#### User 3
- **Email:** `user3@example.com`
- **Password:** `password123`
- **Nom:** Pierre Durand

---

## 🚀 Comment utiliser

1. **Créer la base de données:**
   ```bash
   npm run db:push
   ```

2. **Générer les utilisateurs de test:**
   ```bash
   npm run db:seed
   ```

3. **Se connecter:**
   - Aller sur http://localhost:3000/auth/login
   - Utiliser un des identifiants ci-dessus

---

## 📝 Notes

- Tous les utilisateurs ont le même mot de passe: `password123`
- Le mot de passe est hashé avec bcrypt (12 rounds)
- Les utilisateurs sont créés avec `upsert`, donc vous pouvez relancer le seed sans problème
