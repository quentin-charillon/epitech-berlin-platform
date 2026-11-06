# Epitech Berlin | Plateforme étudiante

Une plateforme web full-stack conçue pour aider les étudiants à découvrir Epitech Berlin, explorer la vie sur le campus et accéder à des informations pratiques grâce à un système de gestion de contenu personnalisable.

Développée dans le cadre d'un projet étudiant collaboratif à Epitech.

## Présentation

La plateforme étudiante Epitech Berlin a pour objectif de centraliser les informations utiles aux étudiants actuels et futurs, notamment concernant le logement, les transports, les activités sur le campus et la vie quotidienne à Berlin.

Au-delà d'un site web informatif traditionnel, le projet comprend un système de gestion de contenu (CMS) personnalisé, permettant aux administrateurs de créer et de gérer des pages, de personnaliser l'apparence du site et d'organiser le contenu grâce à un éditeur visuel interactif.

La plateforme combine un site destiné aux étudiants et une interface d'administration, offrant à la fois une expérience utilisateur accessible et des outils flexibles de gestion de contenu.

## Fonctionnalités principales

### Site étudiant

- Informations sur Epitech Berlin et la vie sur le campus
- Guides pratiques sur le logement, les transports et les activités étudiantes
- Pages dynamiques alimentées par un CMS personnalisé
- Interfaces responsive et composants interactifs
- Identité visuelle cohérente et navigation intuitive

### Système de gestion de contenu (CMS) personnalisé

- Création, modification et gestion de pages web dynamiques
- Éditeur visuel de pages avec des blocs de contenu personnalisables
- Outils de modification de textes et d'images
- Positionnement et redimensionnement des contenus par glisser-déposer
- Personnalisation des en-têtes, pieds de page et mises en page
- Paramètres des pages et organisation du contenu
- Outils d'édition interactifs et menus contextuels

### Interface d'administration

- Authentification des administrateurs
- Protection des routes d'administration
- Tableau de bord administrateur
- Interface de gestion des pages
- Interface de gestion des utilisateurs
- Gestion de l'apparence et des paramètres du site web

## Technologies utilisées

| Catégorie | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styles | CSS |
| Backend | Node.js, Express.js |
| Base de données | MongoDB, Mongoose |
| Authentification | JWT, bcrypt |
| Tests frontend | Vitest |
| Développement | Docker, Docker Compose |

## Mes contributions

Dans le cadre de ce projet collaboratif à Epitech, j'étais responsable du développement frontend, du design UI/UX, du système de gestion de contenu visuel et des interfaces d'administration.

Mon travail comprenait à la fois l'implémentation technique et la conception visuelle de la plateforme.

### Développement frontend

- Développement du site destiné aux étudiants avec React et TypeScript.
- Création de composants réutilisables et d'interfaces utilisateur interactives.
- Implémentation de l'affichage dynamique des pages et de la navigation frontend.
- Intégration des fonctionnalités frontend avec l'API backend développée par les autres membres de l'équipe.
- Amélioration de l'adaptabilité aux différents écrans et de l'ergonomie de la plateforme.

### Design UI/UX

- Conception de l'identité visuelle et de l'apparence générale du site.
- Définition des mises en page, des palettes de couleurs, de la typographie et du style des composants.
- Création d'une navigation intuitive et d'interfaces cohérentes.
- Conception du site étudiant et des interfaces d'administration.
- Attention particulière portée à l'accessibilité, à la lisibilité et à l'expérience utilisateur.

### Développement du CMS personnalisé

- Développement de l'éditeur visuel permettant de créer et de personnaliser les pages du site.
- Implémentation de textes, d'images et de blocs de contenu modifiables.
- Création d'outils interactifs pour positionner, redimensionner et modifier les éléments.
- Développement de menus contextuels et de contrôles d'édition.
- Implémentation de fonctionnalités de personnalisation du site, notamment les en-têtes, les pieds de page et les mises en page.

### Interface d'administration

- Développement du tableau de bord administrateur et des interfaces de gestion.
- Création d'interfaces pour gérer les pages, les utilisateurs et les paramètres du site.
- Implémentation des interactions frontend pour les fonctionnalités administratives.
- Intégration des composants d'administration avec les services backend de l'application.

### Tests et débogage

- Tests des composants frontend et des interactions.
- Identification et correction des bugs d'interface.
- Amélioration de la stabilité et de la maintenabilité des fonctionnalités frontend.

## Collaboration en équipe

Ce projet a été développé en collaboration avec d'autres étudiants d'Epitech.

Mes responsabilités étaient principalement axées sur le développement frontend, le design UI/UX, le CMS personnalisé et les interfaces d'administration. Le développement backend et la gestion de la base de données ont été assurés par les autres membres de l'équipe.

## Structure du projet

```text
epitech-berlin-platform/
├── front/               # Frontend React et interface CMS
├── back/                # API Express et modèles de base de données
├── docker-compose.yml   # Configuration Docker pour le développement
└── README.md
```

## Installation et démarrage

### Prérequis

- Node.js et npm
- Une base de données MongoDB (locale ou MongoDB Atlas)

### 1. Cloner le dépôt

```bash
git clone https://github.com/quentin-charillon/epitech-berlin-platform.git
cd epitech-berlin-platform
```

### 2. Configurer le backend

```bash
cd back
npm install
```

Copiez le fichier `.env.example` vers `.env` et configurez les variables d'environnement nécessaires :

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=Admin
```

Ne publiez jamais de véritables identifiants ou fichiers d'environnement dans le dépôt.

### 3. Démarrer le backend

```bash
npm run dev
```

### 4. Démarrer le frontend

Ouvrez un terminal séparé depuis la racine du dépôt :

```bash
cd front
npm install
npm run dev
```

Le frontend devrait être accessible à l'adresse :

http://localhost:5173

## Captures d'écran

### Page d'accueil

![Page d'accueil](screenshots/homepage.png)

### Vie étudiante

![Page d'accueil](screenshots/studentlife.png)

### Activités

![Page d'accueil](screenshots/activitypage.png)

### Page des musées

![Page d'accueil](museumspage.png)

### Tableau de bord administrateur

![Page d'accueil](dashboardpage.png)

### Éditeur visuel CMS

![Page d'accueil](editorpage.png)

## Statut du projet

Projet académique collaboratif développé à Epitech.

Ce dépôt présente l'architecture frontend de l'application, le CMS personnalisé, les interfaces d'administration et les services backend associés.

## Auteur et contributeurs

**Quentin Charillon**

Étudiant à Epitech | Développement frontend | Design UI/UX | Expérience en projet full-stack

**Contributions principales :** développement frontend, design UI/UX, CMS personnalisé et interfaces d'administration.

**Backend et base de données :** développés par les autres membres de l'équipe.

## 🌐 Démonstration en ligne et accès administrateur

La plateforme étudiante Epitech Berlin est déployée et accessible en ligne.

**Remarque :** ce projet utilise l'offre d'hébergement gratuite de Render pour le backend, qui se met automatiquement en veille après une période d'inactivité.

Par conséquent, lors de la première visite, le chargement des données peut prendre environ 30 à 60 secondes, le temps que le serveur se réveille.

Merci de votre patience ! Les requêtes suivantes devraient être beaucoup plus rapides.

### Site étudiant

🔗 **[Visiter la plateforme étudiante](https://epitech-berlin-platform.vercel.app/)**

Explorez le site web, découvrez la vie étudiante à Berlin et naviguez entre les différentes pages.

### 🛠️ Tester le tableau de bord administrateur

🔗 **Accéder au tableau de bord administrateur**

Vous souhaitez découvrir comment fonctionne la plateforme en coulisses ?

**[Visiter le coté admin(https://epitech-berlin-platform.vercel.app/admin)**

Un compte administrateur de démonstration est disponible pour les recruteurs, les développeurs et les visiteurs souhaitant tester le CMS personnalisé.

**Identifiants de démonstration :**

Email : quentin.charillon@epitech.eu

Mot de passe : Hermes2004

Avec ce compte, vous pouvez :

- Explorer le tableau de bord administrateur
- Créer et modifier des pages du site
- Personnaliser le contenu grâce à l'éditeur visuel CMS
- Modifier les textes, les images, les en-têtes et les pieds de page
- Tester les outils d'édition interactifs
- Explorer les paramètres du site et les fonctionnalités de personnalisation

N'hésitez pas à expérimenter avec le CMS et à découvrir ses fonctionnalités !

## Architecture de déploiement

**Frontend :** Vercel

**Backend :** Render

**Base de données :** MongoDB Atlas

## Profil GitHub
