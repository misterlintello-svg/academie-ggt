# 🌍 ACADEMIE GGT — Académie de Géométrie Topographique (Production)

> **Plateforme Académique et Système de Gestion Intégré** pour les étudiants en **BTS 2e Année Génie Civil — Option Géomètre Topographe** (Yamoussoukro, Côte d'Ivoire).

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/misterlintello-svg/academie-ggt)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/misterlintello-svg/academie-ggt)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-black.svg?logo=flask)](https://flask.palletsprojects.com)

---

## 🚀 Déploiement Immédiat sur Netlify

### 1. Déploiement 1-Clic via GitHub (Recommandé — Mise à jour continue)
Cliquez directement sur ce lien pour connecter le dépôt GitHub `academie-ggt` à votre compte Netlify et générer votre lien public en moins de 30 secondes :

👉 **[Déployer ACADEMIE GGT sur Netlify en 1 clic](https://app.netlify.com/start/deploy?repository=https://github.com/misterlintello-svg/academie-ggt)**

### 2. Déploiement Instantané par Glisser-Déposer (Netlify Drop)
Une archive prête pour la production **`academie-ggt-netlify.zip`** est disponible à la racine du projet :
1. Ouvrez **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
2. Glissez-déposez le fichier `academie-ggt-netlify.zip` (ou le dossier du projet).
3. Votre lien `https://...netlify.app` est immédiatement actif avec les routes propres `/admin`, `/etudiant` et `/inscription`.

---

## 🧭 Vue d'ensemble de la Version Production

1. **🌐 Accueil Vitrine (`index.html`)**
   - **Planète Topographique 3D** interactive et carrousel des 7 thématiques essentielles du BTS 2 GC-GT.
   - **Formulaire d'inscription directe** connecté à la base de données et à la boîte de réception Administrateur.

2. **🎓 Espace Étudiants (`etudiant.html` ou `/etudiant`)**
   - Inscription dédiée aux étudiants de BTS 2 GC-GT de Yamoussoukro (*INP-HB/ESTP, ESBTP, EPI-YAKRO, ESETEC, 2IFTP*).
   - Connexion sécurisée par identifiant mensuel unique (`<Initiales>-<JJMMAAAA>-BTS2GCGT`, validité 1 mois exact).
   - Vérification automatique du statut de dossier par email et demande de renouvellement en 1 clic.
   - Accès aux **5 Cours & Sujets Types Corrigés PDF officiels** et au **Forum d'entraide académique**.

3. **🛡️ Console Administrateur Principal (`admin.html` ou `/admin`)**
   - **Transitions & Animations fluides** : compteurs animés, camembert SVG dynamique, tiroir d'ajout d'étudiant fluide, notifications toast flottantes et transitions de sections.
   - **Suivi Budgétaire & Encaissement Réel** : calcul automatique des cotisations encaissées (10 000 FCFA / étudiant validé) et en attente.
   - **Gestion Complète** : validation d'accès mensuel (génération d'identifiant + envoi d'email), renouvellement, suppression d'étudiants, publication/suppression de PDF, modération du forum et messagerie intégrée.
