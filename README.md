# 🌍 ACADEMIE GGT — Académie de Géométrie Topographique

> **Plateforme Académique et Système de Gestion Intégré** pour les étudiants en **BTS 2e Année Génie Civil — Option Géomètre Topographe** (Yamoussoukro, Côte d'Ivoire).

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/misterlintello-svg/academie-ggt)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-2563eb?logo=github)](https://misterlintello-svg.github.io/academie-ggt/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-black.svg?logo=flask)](https://flask.palletsprojects.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql)](https://postgresql.org)

---

## 🧭 Vue d'ensemble du Projet

L'ACADEMIE GGT propose une formation de renforcement académique et pratique pour préparer les futurs géomètres topographes aux épreuves du BTS d'État et aux exigences des chantiers d'aménagement du territoire en Côte d'Ivoire.

### 🌟 Interfaces & Fonctionnalités

1. **🌐 Accueil Vitrine (`index.html`)**
   - **Planète Topographique 3D** en apesanteur avec courbes de niveau et instruments de visée.
   - **Présentation de l'Organisateur** et méthodologie d'excellence terrain.
   - **Nos Thématiques Essentielles** : *Topographie générale, Calculs topométriques & polygonation, GNSS & Géodésie, Droit foncier & Cadastre, DAO / CAO (AutoCAD/Covadis), VRD & Projets routiers*.

2. **🎓 Espace Étudiants (`etudiant.html`)**
   - Inscription exclusive aux élèves de 2e année GC-GT de Yamoussoukro (*INP-HB/ESTP, ESBTP, EPI, ESETEC, 2IFTP*).
   - Validation d'accès avec identifiant unique mensuel (`<Initiales>-<JJMMAAAA>-GCGT`).
   - Consultation des **Cours PDF & Corrigés d'examen**.
   - **Forum d'entraide académique** interactif.

3. **🛡️ Console Administrateur Principal (`admin.html`)**
   - **Tableau de Bord Exécutif Bento** inspiré du design PinenMFB.
   - **Suivi Budgétaire & Encaissement** : 10.000 FCFA/mois par étudiant (simulation active de 10 inscriptions = 100.000 FCFA).
   - **Statistiques d'Activité** : Histogramme à barres animées des étudiants les plus actifs sur le forum.
   - **Validation & Clôture Mensuelle** : Approbation des paiements et génération des identifiants d'accès.
   - **Gestionnaire de Cours PDF** : Publication directe de nouveaux supports et exercices.
   - **Boîte Mail du Site** : Lecture et réponse directe aux messages des étudiants.

---

## 🚀 Déploiement en Ligne

### Option 1 : Déploiement 1-Clic sur Render (Backend Flask + PostgreSQL)
Cliquez sur le bouton ci-dessous pour déployer automatiquement le serveur Flask et la base de données PostgreSQL managée :

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/misterlintello-svg/academie-ggt)

*Le fichier `render.yaml` configure automatiquement le service web, l'environnement Python et la base PostgreSQL.*

### Option 2 : Déploiement Statique sur GitHub Pages
Le frontend fonctionne également de manière autonome grâce au moteur de persistance locale intégré dans `ggt-data.js`.
* URL GitHub Pages : **`https://misterlintello-svg.github.io/academie-ggt/`**

---

## 💻 Installation & Exécution en Local

### Prérequis
- Python 3.10 ou supérieur
- PostgreSQL (optionnel en mode local)

### 1. Cloner le dépôt
```bash
git clone https://github.com/misterlintello-svg/academie-ggt.git
cd academie-ggt
```

### 2. Installer les dépendances
```bash
python -m venv .venv
# Sur Windows :
.\.venv\Scripts\activate
# Sur Linux / macOS :
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Lancer le serveur
```bash
python app.py
```

Accédez ensuite à :
- **Accueil** : [http://localhost:5000/](http://localhost:5000/)
- **Espace Étudiants** : [http://localhost:5000/etudiant.html](http://localhost:5000/etudiant.html)
- **Espace Administrateur** : [http://localhost:5000/admin.html](http://localhost:5000/admin.html) *(Mot de passe : `Admin123`)*

---

## 🔐 Identifiants par défaut
| Rôle | Mot de passe | Accès |
|---|---|---|
| **Administrateur Principal** | `Admin123` | `admin.html` |
| **Étudiant (Exemple)** | `KD-15092026-GCGT` | `etudiant.html` |

---

## 📄 Licence
Projet réalisé sous licence MIT. Tous droits réservés ACADEMIE GGT.
