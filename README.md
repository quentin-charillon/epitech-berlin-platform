
# 🇩🇪 Epitech Berlin | Plateforme étudiante

### Une plateforme web pour découvrir Epitech Berlin et faciliter la vie étudiante

**Epitech Berlin Student Platform** est une application web full-stack conçue pour aider les étudiants à découvrir le campus d'Epitech Berlin, explorer la vie étudiante et accéder à des informations pratiques.

Le projet comprend également un **système de gestion de contenu (CMS) personnalisé**, permettant aux administrateurs de modifier les pages et l'apparence du site grâce à un éditeur visuel interactif.

**Projet collaboratif développé dans le cadre de notre formation à Epitech.**

🌐 **[Découvrir la plateforme étudiante](https://epitech-berlin-platform.vercel.app/)**

---

## 📖 Présentation du projet

L'objectif de la plateforme est de centraliser les informations utiles aux étudiants actuels et futurs d'Epitech Berlin.

Elle regroupe notamment des informations sur :

- Le campus et la vie étudiante.
- Les logements et les possibilités d'hébergement.
- Les transports à Berlin.
- Les activités étudiantes.
- Les restaurants et les lieux à découvrir.
- Les informations pratiques du quotidien.

Au-delà d'un simple site informatif, le projet intègre un **CMS développé sur mesure**.

Ce système permet aux administrateurs de créer et modifier des pages, personnaliser l'apparence du site et organiser les contenus à travers un éditeur visuel.

La plateforme associe ainsi un site accessible aux étudiants et une interface d'administration complète.

---

## ✨ Fonctionnalités principales

### 🌍 Site étudiant

- Informations sur Epitech Berlin et la vie sur le campus.
- Guides pratiques sur les logements, les transports et les activités.
- Pages dynamiques alimentées par le CMS.
- Interface responsive adaptée aux différentes tailles d'écran.
- Composants interactifs.
- Navigation intuitive et identité visuelle cohérente.

### 🎨 Système de gestion de contenu (CMS)

Le CMS a été développé spécifiquement pour cette plateforme.

Il permet notamment de :

- Créer, modifier et gérer des pages dynamiques.
- Personnaliser les contenus avec un éditeur visuel.
- Ajouter et modifier des blocs de texte et des images.
- Positionner et redimensionner des éléments de manière interactive.
- Personnaliser les en-têtes, pieds de page et mises en page.
- Organiser les contenus et configurer les pages.
- Utiliser des menus contextuels et des outils d'édition interactifs.

### 🛠️ Interface d'administration

- Authentification des administrateurs.
- Protection des routes d'administration.
- Tableau de bord.
- Gestion des pages.
- Interface de gestion des utilisateurs.
- Personnalisation de l'apparence du site.
- Gestion des paramètres de la plateforme.

---

## 💻 Technologies utilisées

| Domaine | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styles | CSS |
| Backend | Node.js, Express.js |
| Base de données | MongoDB, Mongoose |
| Authentification | JWT, bcrypt |
| Tests frontend | Vitest |
| Développement | Docker, Docker Compose |
| Hébergement frontend | Vercel |
| Hébergement backend | Render |
| Base de données cloud | MongoDB Atlas |

---

## 👨‍💻 Mes contributions personnelles

Dans le cadre de ce projet collaboratif à Epitech, j'ai principalement été responsable du **développement frontend, du design UI/UX, du CMS visuel et des interfaces d'administration**.

Mon travail a porté à la fois sur l'implémentation technique et sur la conception graphique de la plateforme.

### 💻 Développement frontend

- Développement du site étudiant avec React et TypeScript.
- Création de composants réutilisables et d'interfaces interactives.
- Implémentation de l'affichage dynamique des pages.
- Gestion de la navigation frontend.
- Intégration des fonctionnalités avec l'API backend développée par les autres membres de l'équipe.
- Amélioration du responsive et de l'ergonomie générale.

### 🎨 Design UI/UX

- Conception de l'identité visuelle du site.
- Définition des mises en page, des couleurs et de la typographie.
- Création d'une navigation intuitive.
- Harmonisation des composants et des interfaces.
- Conception graphique du site étudiant et de l'administration.
- Travail sur l'accessibilité, la lisibilité et l'expérience utilisateur.

### 🧩 Développement du CMS personnalisé

- Développement de l'éditeur visuel permettant de créer et personnaliser les pages.
- Implémentation de blocs de texte et d'images modifiables.
- Création d'outils interactifs de positionnement et de redimensionnement.
- Développement de menus contextuels et de contrôles d'édition.
- Implémentation des fonctionnalités de personnalisation des en-têtes, pieds de page et mises en page.

### ⚙️ Interface d'administration

- Développement du tableau de bord administrateur.
- Création des interfaces de gestion des pages, utilisateurs et paramètres.
- Implémentation des interactions frontend liées aux fonctionnalités administratives.
- Intégration des composants d'administration avec les services backend.

### 🧪 Tests et débogage

- Tests des composants et des interactions frontend.
- Identification et correction de bugs d'interface.
- Amélioration de la stabilité des fonctionnalités.
- Travail sur la maintenabilité du code.

---

## 🤝 Travail en équipe

Ce projet a été réalisé en collaboration avec d'autres étudiants d'Epitech.

La répartition des responsabilités était la suivante :

**Mes responsabilités :**
- Développement frontend.
- Design UI/UX.
- Développement du CMS visuel.
- Interfaces d'administration.

**Responsabilités des autres membres de l'équipe :**
- Développement backend.
- Gestion de la base de données.
- Services et logique côté serveur.

Cette collaboration m'a permis de travailler sur une application full-stack tout en approfondissant mes compétences en développement frontend et en conception d'interfaces.

---

## 📁 Structure du projet

```text
epitech-berlin-platform/
├── front/               # Application React et CMS
├── back/                # API Express et modèles de données
├── docker-compose.yml   # Configuration Docker
└── README.md
```

---

## 🚀 Installation locale

### Prérequis

Avant de commencer, assurez-vous de disposer de :

- Node.js et npm.
- Une base de données MongoDB locale ou MongoDB Atlas.
- Git.

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

Copier le fichier `.env.example` vers `.env`, puis renseigner les variables d'environnement nécessaires :

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=Admin
```

**Attention :** ne jamais publier de véritables identifiants ou fichiers `.env` sur GitHub.

### 3. Démarrer le backend

```bash
npm run dev
```

### 4. Démarrer le frontend

Ouvrir un second terminal à la racine du projet :

```bash
cd front
npm install
npm run dev
```

Le frontend est alors accessible à l'adresse :

**http://localhost:5173**

---

## 📸 Captures d'écran

### 🏠 Page d'accueil

Présentation de la plateforme et accès aux principales rubriques.

![Page d'accueil](docs/screenshots/screenshot1.png)

### 🎓 Vie étudiante

Informations sur le campus et le quotidien des étudiants à Berlin.

![Vie étudiante](docs/screenshots/screenshot2.png)

### 🎉 Activités

Découverte des activités et des lieux à explorer à Berlin.

![Activités](docs/screenshots/screenshot3.png)

### 🏛️ Musées

Présentation des musées et des lieux culturels de Berlin.

![Page Musées](docs/screenshots/screenshot4.png)

### ⚙️ Tableau de bord administrateur

Interface permettant de gérer les contenus et les paramètres de la plateforme.

![Tableau de bord administrateur](docs/screenshots/screenshot5.png)

### 🎨 Éditeur visuel CMS

Outil permettant de modifier les pages et leurs contenus directement depuis l'interface d'administration.

![Éditeur visuel CMS](docs/screenshots/screenshot6.png)

---

## 🌐 Démonstration en ligne

La plateforme est actuellement déployée et accessible en ligne.

### 🎓 Site étudiant

**[🌍 Visiter Epitech Berlin Student Platform](https://epitech-berlin-platform.vercel.app/)**

Découvrez les différentes pages du site, les informations pratiques et les fonctionnalités destinées aux étudiants.

### 🛠️ Interface d'administration

Une interface d'administration permet de découvrir le fonctionnement du CMS et des outils de personnalisation.

Un compte de démonstration à permissions limitées peut être mis à disposition des recruteurs et développeurs souhaitant tester ces fonctionnalités.

Il permet notamment de découvrir :

- Le tableau de bord administrateur.
- La création et la modification de pages.
- L'éditeur visuel.
- La personnalisation des textes et images.
- La configuration des en-têtes et pieds de page.
- Les outils interactifs de mise en page.
- Les paramètres de personnalisation du site.

Les identifiants de démonstration doivent être communiqués de manière sécurisée et ne doivent pas donner accès à des données sensibles ou à des fonctions administratives critiques.

### ⏳ Temps de chargement

Le backend est hébergé sur l'offre gratuite de Render.

Après une période d'inactivité, le serveur peut être automatiquement mis en veille.

Lors de la première visite, le chargement des données peut prendre environ **30 à 60 secondes**, parfois davantage, le temps que le serveur redémarre.

Les requêtes suivantes sont généralement beaucoup plus rapides.

Merci de votre patience !

---

## ☁️ Architecture de déploiement

| Composant | Hébergement |
|---|---|
| Frontend React | Vercel |
| Backend Express | Render |
| Base de données MongoDB | MongoDB Atlas |

Cette architecture permet de séparer l'interface utilisateur, les services backend et le stockage des données.

---

## 📌 Statut du projet

**Projet académique collaboratif développé à Epitech.**

Ce dépôt met en valeur :

- L'architecture frontend de l'application.
- Le développement d'un CMS personnalisé.
- La conception des interfaces d'administration.
- L'intégration avec les services backend.
- La collaboration au sein d'une équipe de développement.

---

## 👨‍💻 Auteur et contributeurs

### Quentin Charillon

Étudiant à **Epitech Lyon**.

**Spécialisations et centres d'intérêt :**
- Développement frontend.
- Design UI/UX.
- Développement web full-stack.
- Intelligence artificielle.
- Conception d'interfaces interactives.

**Contributions principales au projet :** développement frontend, design UI/UX, CMS personnalisé et interfaces d'administration.

**Backend et base de données :** développés par les autres membres de l'équipe.

🐙 **[Mon profil GitHub](https://github.com/quentin-charillon)**

🌐 **[Découvrir la plateforme](https://epitech-berlin-platform.vercel.app/)**
