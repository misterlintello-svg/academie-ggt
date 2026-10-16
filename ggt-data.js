/* ═══════════════════════════════════════════════════════════════
   ACADEMIE GGT — Données partagées (mode secours hors serveur)
   Filière unique : BTS 2 · Génie Civil option Géomètre Topographe
   Utilisé par index.html, etudiant.html et admin.html
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const KEY = 'ggt_local_db_v3';
  const FILIERE_CODE = 'BTS 2 - GC-GT';
  const FILIERE_LABEL = 'BTS 2 · Génie Civil option Géomètre Topographe';

  // Écoles de Yamoussoukro proposant la filière (liste publique à faire valider par l'administration)
  const ECOLES = [
    'INP-HB — École Supérieure des Travaux Publics (ESTP)',
    'ESBTP Yamoussoukro',
    'EPI-YAKRO (École Polytechnique Internationale)',
    'ESETEC Yamoussoukro',
    '2IFTP (Institut International de Formation Technique et Professionnelle)',
    'Autre établissement de Yamoussoukro'
  ];

  const code = (name, d = '16102026') => {
    const ini = name.trim().split(/[\s\-']+/).filter(Boolean).map(p => p[0].toUpperCase()).join('');
    return `${ini}-${d}-BTS2GCGT`;
  };

  function defaultDB() {
    const st = (id, full_name, email, phone, ecole, status) => ({
      id, full_name, email, phone, classe: FILIERE_CODE, ecole,
      registered_at: '16/10/2026',
      student_code: status === 'active' ? code(full_name) : null,
      status,
      confirmed_at: status === 'active' ? '16/10/2026' : null,
      valid_until: status === 'active' ? '16/11/2026' : null
    });
    return {
      students: [
        st(1, 'Mohamed Sanogo', 'mohsanogo512@gmail.com', '+225 07 00 00 00 00', ECOLES[0], 'active'),
        st(2, 'Koné Aminata', 'aminata.kone@academie-ggt.ci', '+225 05 44 11 22 33', ECOLES[1], 'active'),
        st(3, 'Kouadio Marc-Arthur', 'marc.kouadio@academie-ggt.ci', '+225 07 58 91 02 14', ECOLES[0], 'active'),
        st(4, 'Yao Grâce Manuella', 'grace.yao@academie-ggt.ci', '+225 01 42 88 73 19', ECOLES[2], 'active'),
        st(5, 'Bamba Cheick Oumar', 'cheick.bamba@academie-ggt.ci', '+225 07 77 31 45 90', ECOLES[3], 'active'),
        st(6, "N'Guessan Aya Estelle", 'estelle.nguessan@academie-ggt.ci', '+225 05 66 20 18 44', ECOLES[1], 'active'),
        st(7, 'Diallo Ibrahim Khalil', 'ibrahim.diallo@academie-ggt.ci', '+225 07 08 55 12 67', ECOLES[4], 'active'),
        st(8, 'Touré Mariam Sofia', 'mariam.toure@academie-ggt.ci', '+225 05 04 92 81 10', ECOLES[2], 'pending'),
        st(9, 'Ouattara Jean-Luc', 'jeanluc.ouattara@academie-ggt.ci', '+225 07 89 40 33 21', ECOLES[3], 'pending'),
        st(10, 'Aka Christelle Aurore', 'christelle.aka@academie-ggt.ci', '+225 01 51 74 62 09', ECOLES[4], 'pending')
      ],
      resources: [
        { id: 1, title: 'Topographie générale & Levés au tachéomètre — Cours complet', category: 'cours', classe: FILIERE_CODE, subject: 'Topographie générale', filename: 'Cours_Topographie_Generale_Leves_BTS2_GCGT.pdf', url: 'uploads/pdfs/Cours_Topographie_Generale_Leves_BTS2_GCGT.pdf', created_at: '16/10/2026' },
        { id: 2, title: 'Exercices & Corrigés — Gisements, Coordonnées, Surfaces et Nivellement', category: 'exercice_corrige', classe: FILIERE_CODE, subject: 'Calculs topographiques', filename: 'Exercices_Corriges_Cheminements_BTS2_GCGT.pdf', url: 'uploads/pdfs/Exercices_Corriges_Cheminements_BTS2_GCGT.pdf', created_at: '16/10/2026' },
        { id: 3, title: 'GNSS, Géodésie & Systèmes de coordonnées — Cours', category: 'cours', classe: FILIERE_CODE, subject: 'Géodésie & GNSS', filename: 'Cours_GNSS_Geodesie_BTS2_GCGT.pdf', url: 'uploads/pdfs/Cours_GNSS_Geodesie_BTS2_GCGT.pdf', created_at: '16/10/2026' },
        { id: 4, title: 'Sujet Type BTS + Corrigé — Bornage, Foncier & Plan topographique', category: 'exercice_corrige', classe: FILIERE_CODE, subject: 'Foncier, cadastre & bornage', filename: 'Sujet_Corrige_Bornage_Foncier_BTS2_GCGT.pdf', url: 'uploads/pdfs/Sujet_Corrige_Bornage_Foncier_BTS2_GCGT.pdf', created_at: '16/10/2026' },
        { id: 5, title: 'DAO, Modèle Numérique de Terrain & Implantation de VRD — Cours', category: 'cours', classe: FILIERE_CODE, subject: 'DAO, VRD et implantation', filename: 'Cours_DAO_VRD_Implantation_BTS2_GCGT.pdf', url: 'uploads/pdfs/Cours_DAO_VRD_Implantation_BTS2_GCGT.pdf', created_at: '16/10/2026' }
      ],
      forum: [
        {
          id: 1, author_name: 'Administrateur Principal ACADEMIE GGT', author_role: 'admin', author_classe: 'Direction Académique',
          title: 'Bienvenue sur le Forum des Géomètres Topographes de Yamoussoukro',
          content: 'Posez ici vos questions sur les cours PDF, les calculs de cheminement, le GNSS, le bornage et la préparation du BTS 2 Génie Civil option Géomètre Topographe.',
          created_at: '16/10/2026 08:00',
          replies: [
            { id: 101, author_name: 'Mohamed Sanogo', author_role: 'etudiant', author_classe: FILIERE_CODE, content: 'Merci ! Le corrigé sur les gisements et les coordonnées est très clair.', created_at: '16/10/2026 09:15' },
            { id: 102, author_name: 'Koné Aminata', author_role: 'etudiant', author_classe: FILIERE_CODE, content: 'Le cours GNSS m\'aide beaucoup pour comprendre le RTK.', created_at: '16/10/2026 09:40' }
          ]
        },
        {
          id: 2, author_name: 'Kouadio Marc-Arthur', author_role: 'etudiant', author_classe: FILIERE_CODE,
          title: 'Fermeture angulaire d\'un cheminement fermé : comment la répartir ?',
          content: 'Dans l\'exercice 1 du PDF, comment répartir l\'erreur de fermeture angulaire sur les angles mesurés avant de calculer les gisements ?',
          created_at: '16/10/2026 10:05',
          replies: [
            { id: 103, author_name: 'Administrateur Principal ACADEMIE GGT', author_role: 'admin', author_classe: 'Direction Académique', content: 'Vérifiez d\'abord que f_a est inférieure à la tolérance, puis appliquez la correction - f_a / n sur chaque angle (voir chapitre 3 du cours).', created_at: '16/10/2026 10:18' }
          ]
        }
      ],
      mailbox: [
        { id: 1, sender: 'Touré Mariam Sofia', email: 'mariam.toure@academie-ggt.ci', classe: FILIERE_CODE, subject: 'Règlement cotisation 10.000 FCFA & demande de validation', date: "Aujourd'hui, 10:42", unread: true, body: "Bonjour Monsieur l'Administrateur,\n\nJe viens d'effectuer le règlement de ma cotisation mensuelle de 10.000 FCFA pour les cours de renforcement BTS 2 Génie Civil option Géomètre Topographe.\nPouvez-vous valider mon inscription afin que je reçoive mon identifiant unique ?\n\nMerci beaucoup !", replies: [] },
        { id: 2, sender: 'Ouattara Jean-Luc', email: 'jeanluc.ouattara@academie-ggt.ci', classe: FILIERE_CODE, subject: "Confirmation d'inscription mensuelle (10.000 FCFA)", date: "Aujourd'hui, 09:55", unread: true, body: "Bonjour Direction ACADEMIE GGT,\n\nJe viens de m'inscrire depuis l'ESETEC Yamoussoukro. Mon paiement de 10.000 FCFA est prêt. Merci d'approuver mon compte étudiant pour ce mois.", replies: [] },
        { id: 3, sender: 'Aka Christelle Aurore', email: 'christelle.aka@academie-ggt.ci', classe: FILIERE_CODE, subject: 'Accès aux PDF de topographie et de GNSS', date: "Aujourd'hui, 09:18", unread: true, body: "Bonjour,\n\nJe viens de soumettre mon formulaire d'inscription (cotisation de 10.000 FCFA). Dès validation de mon identifiant, j'aimerais accéder aux cours de topographie générale et de GNSS.", replies: [] },
        { id: 4, sender: 'Koné Aminata', email: 'aminata.kone@academie-ggt.ci', classe: FILIERE_CODE, subject: 'Remerciements — Sujet corrigé de bornage', date: 'Hier, 17:30', unread: false, body: "Bonjour Monsieur Sanogo,\n\nMon identifiant fonctionne parfaitement. Le sujet corrigé sur le bornage et le foncier nous aide énormément pour préparer le BTS blanc.", replies: [] },
        { id: 5, sender: 'Kouadio Marc-Arthur', email: 'marc.kouadio@academie-ggt.ci', classe: FILIERE_CODE, subject: 'Question sur la compensation angulaire', date: 'Hier, 15:12', unread: false, body: "Bonjour,\n\nJ'ai posté une question sur le forum concernant la fermeture angulaire du cheminement. Pourriez-vous publier une indication supplémentaire ?", replies: [] },
        { id: 6, sender: 'Bamba Cheick Oumar', email: 'cheick.bamba@academie-ggt.ci', classe: FILIERE_CODE, subject: 'Renouvellement mensuel (10.000 FCFA)', date: '14 Oct. 2026', unread: false, body: "Bonjour,\n\nJe confirme que je renouvellerai mon abonnement mensuel de 10.000 FCFA dès la clôture de fin de mois pour conserver mon accès aux cours PDF.", replies: [] }
      ]
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.students)) return parsed;
      }
    } catch (_) {}
    const init = defaultDB();
    localStorage.setItem(KEY, JSON.stringify(init));
    return init;
  }

  function save(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  window.GGT = {
    KEY, FILIERE_CODE, FILIERE_LABEL, ECOLES, FEE: 10000,
    defaultDB, load, save,
    previewCode(fullName, dateStr) {
      const ini = (fullName || '').trim().split(/[\s\-']+/).filter(Boolean).map(p => p[0].toUpperCase()).join('') || 'ETU';
      let d = dateStr;
      if (!d) {
        const n = new Date();
        d = String(n.getDate()).padStart(2, '0') + String(n.getMonth() + 1).padStart(2, '0') + n.getFullYear();
      }
      return `${ini}-${d}-BTS2GCGT`;
    }
  };
})();
