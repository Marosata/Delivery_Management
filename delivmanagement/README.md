## Delivery Management – MVP

Application web de gestion de livreurs et d&apos;attribution intelligente de commandes, basée sur **Next.js (App Router)**, **Supabase** et **OpenStreetMap**.

### Architecture

- **Frontend** : `Next.js` (App Router), `TypeScript`, `TailwindCSS`, composants UI dans `components`, pages dans `app`.
- **Backend** : Supabase (PostgreSQL, Auth, RLS), services métier dans `services`, types partagés dans `types`.
- **Cartographie** : OpenStreetMap via `react-leaflet`, service d&apos;itinéraire basé sur OpenRouteService.

Arborescence principale :

- `app` : pages Next.js (`/login`, `/dashboard/admin`, `/dashboard/livreur`, `/client/commandes/new`, API routes).
- `components` : composants UI (par ex. `map/MapView`).
- `services` : logique métier (auth, livreurs, commandes, assignment, dashboard, routing).
- `types` : types TypeScript du domaine (`domain.ts`).
- `supabase` : script SQL de schéma + RLS (`schema.sql`).
- `lib` : clients techniques (`supabaseClient`).

### Variables d&apos;environnement

À définir dans `.env.local` à la racine :

- **Supabase**
  - `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé `anon` publique Supabase.
  - `SUPABASE_SERVICE_ROLE_KEY` : clé `service_role` (usage côté Supabase Studio / scripts, ne jamais exposer au client).
- **Routing / OpenStreetMap**
  - `OPENROUTESERVICE_API_KEY` : clé API OpenRouteService (ou autre provider compatible).
  - `ROUTING_API_BASE_URL` : `https://api.openrouteservice.org` (par défaut).
- **App**
  - `NEXT_PUBLIC_APP_URL` : URL publique de l&apos;application (ex. `http://localhost:3000` en dev).

### Installation & démarrage

- **1. Installer les dépendances**

```bash
npm install
```

- **2. Configurer Supabase**
  - Créer un projet Supabase.
  - Récupérer `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans **Settings → API**.
  - Récupérer `SUPABASE_SERVICE_ROLE_KEY` (clé serveur, à garder côté backend uniquement).
  - Coller ces valeurs dans `.env.local`.

- **3. Créer le schéma de base de données**
  - Ouvrir Supabase Studio → onglet **SQL**.
  - Copier le contenu de `supabase/schema.sql`.
  - Exécuter le script pour créer les tables (`profiles`, `livreurs`, `commandes`, `adresses`, etc.), les fonctions d&apos;aide et activer les politiques RLS.

- **4. Configurer OpenRouteService**
  - Créer un compte sur le provider d&apos;itinéraires (ex. OpenRouteService).
  - Générer une clé API et la renseigner dans `OPENROUTESERVICE_API_KEY`.

- **5. Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir `http://localhost:3000` dans le navigateur.

### Endpoints principaux

- **Pages**
  - `/` : landing de la plateforme.
  - `/login` : authentification (login/signup Supabase).
  - `/dashboard/admin` : dashboard admin (total commandes, temps moyen, taux de réussite).
  - `/dashboard/livreur` : dashboard livreur (livraisons effectuées, temps moyen).
  - `/client/commandes/new` : création de commande avec visualisation de l&apos;itinéraire sur carte OSM.

- **API (Next.js App Router)**
  - `POST /api/commandes/create` : création d&apos;une commande client.
  - `POST /api/commandes/assign` : attribution intelligente à un livreur disponible.
  - `POST /api/commandes/status` : mise à jour du statut d&apos;une commande.
  - `POST /api/livreurs/status` : mise à jour du statut/position du livreur connecté.
  - `GET /api/dashboard/admin` : stats globales admin.
  - `GET /api/dashboard/livreur?livreurId=…` : stats pour un livreur.
  - `POST /api/routes/route` : calcul d&apos;itinéraire (distance, durée, géométrie) via le service de routing.

### Règles de sécurité & RLS

- RLS activé sur toutes les tables (`profiles`, `livreurs`, `commandes`, `adresses`, etc.).
- Fonctions d&apos;aide dans `schema.sql` :
  - `current_user_role()`, `is_admin()`, `is_livreur()`, `is_client()`.
- Politiques principales :
  - **Client** : ne voit que ses commandes, peut créer et modifier ses propres commandes.
  - **Livreur** : ne voit que les commandes qui lui sont assignées, peut mettre à jour leurs statuts.
  - **Admin** : accès complet à toutes les données.

### Notes d&apos;architecture

- Toute la logique métier (assignation, calculs de stats, gestion de disponibilité, création de commandes, routing) est regroupée dans `services`.
- Les composants React ne font que :
  - Afficher l&apos;UI.
  - Appeler les routes API exposées.
  - Gérer les états de chargement / erreur côté client.
- Le projet est prêt pour évoluer vers :
  - Multi-commandes / tournées.
  - Tracking temps réel des livreurs.
  - Optimisation avancée et IA prédictive.

