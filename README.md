# CarthaGreen Backend API

## GROW THE GREEN SOUL

![CarthaGreen Logo](https://i.imgur.com/tzLxYIX.png)

## Description

Backend API pour CarthaGreen, une plateforme d'agriculture hydroponique intelligente. Développé avec NestJS et MongoDB, ce backend gère l'authentification des utilisateurs (JWT et Google OAuth), la vérification d'email, la gestion des profils avec upload de photos, et servira d'interface entre les systèmes IoT et l'application mobile. L'objectif est de fournir une infrastructure robuste pour une solution durable d'agriculture urbaine, optimisant la consommation d'eau et les rendements agricoles grâce à la surveillance en temps réel des paramètres de culture.

Notre mission est de démocratiser l'agriculture urbaine durable en fournissant des outils technologiques accessibles et efficaces pour la culture hydroponique.

## Fonctionnalités principales

- **Authentification sécurisée** :
  - Système complet d'inscription et de connexion
  - Authentification via Google OAuth
  - Vérification d'email
  - Récupération de mot de passe avec OTP

- **Gestion des profils utilisateurs** :
  - Upload de photos de profil
  - Mise à jour des informations personnelles
  - Changement de mot de passe

- **Gestion des données IoT** (à venir) :
  - Collecte et stockage des données des capteurs
  - Analyse en temps réel des paramètres de culture
  - Historique et visualisation des données

- **Système d'alertes** (à venir) :
  - Notifications en cas d'anomalies détectées
  - Alertes personnalisables selon les besoins des cultures

- **API RESTful** :
  - Endpoints documentés pour l'intégration avec l'application mobile
  - Sécurité JWT pour toutes les communications

## Technologies utilisées

- **Framework** : NestJS
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : Passport.js, JWT, Google OAuth
- **Email** : Nodemailer
- **Upload de fichiers** : Multer
- **Validation** : Class-validator
- **Documentation** : Swagger (à venir)

## Architecture

Le backend est structuré selon l'architecture modulaire de NestJS :

- **Modules d'authentification** : Gestion des connexions, inscriptions et vérifications
- **Module utilisateurs** : Gestion des profils et des préférences
- **Module d'upload** : Gestion des fichiers et images
- **Modules IoT** (à venir) : Gestion des appareils, capteurs et données
- **Module d'alertes** (à venir) : Configuration et envoi de notifications

## Installation et démarrage

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/carthagreen_backend.git

# Installer les dépendances
cd carthagreen_backend
npm install

# Configuration
cp .env.example .env
# Modifier le fichier .env avec vos propres variables d'environnement

# Lancer l'application en mode développement
npm run start:dev

# Lancer l'application en mode production
npm run start:prod
```

## Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
# Application
PORT=3000
APP_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/carthagreen

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1d

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@carthagreen.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Contribution

Nous accueillons favorablement les contributions à ce projet. Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Objectif du projet

CarthaGreen vise à créer une solution économique, durable et efficace pour l'agriculture urbaine, en réduisant la consommation d'eau et en optimisant les rendements agricoles. Notre système est particulièrement adapté aux environnements urbains et aux régions à ressources limitées, où l'accès à la terre arable et à l'eau peut être limité.

En combinant les technologies IoT avec une interface utilisateur intuitive, nous permettons aux utilisateurs de surveiller et contrôler leurs cultures hydroponiques à distance, recevant des alertes en cas d'anomalies et des conseils personnalisés pour optimiser leur production.

## Licence

Ce projet est sous licence [MIT](LICENSE).

## Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter à [carthagreen@gmail.com](mailto:carthagreen@gmail.com).

---

 2025 CarthaGreen - GROW THE GREEN SOUL
