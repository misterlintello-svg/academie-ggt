/* ═══════════════════════════════════════════════════════════════
   ACADEMIE GGT — Moteur de Persistance & Données de Production
   Filière unique : BTS 2 · Génie Civil option Géomètre Topographe
   Utilisé par index.html, etudiant.html et admin.html
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const KEY = 'ggt_prod_db_v1';
  const LEGACY_KEYS = ['ggt_local_db', 'ggt_local_db_v2', 'ggt_local_db_v3', 'ggt_student_code_v3'];
  const FILIERE_CODE = 'BTS 2 - GC-GT';
  const FILIERE_LABEL = 'BTS 2 · Génie Civil option Géomètre Topographe';

  // Nettoyage automatique des anciennes données de la phase de test
  try {
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
  } catch (_) {}

  const ECOLES = [
    'INP-HB — École Supérieure des Travaux Publics (ESTP)',
    'ESBTP Yamoussoukro',
    'EPI-YAKRO (École Polytechnique Internationale)',
    'ESETEC Yamoussoukro',
    '2IFTP (Institut International de Formation Technique et Professionnelle)',
    'Autre établissement de Yamoussoukro'
  ];

  function formatDateFR(dateObj = new Date()) {
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function formatDateTimeFR(dateObj = new Date()) {
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function previewCode(fullName, dateStr) {
    const ini = (fullName || '').trim().split(/[\s\-']+/).filter(Boolean).map(p => p[0].toUpperCase()).join('') || 'ETU';
    let d = dateStr;
    if (!d) {
      const n = new Date();
      d = String(n.getDate()).padStart(2, '0') + String(n.getMonth() + 1).padStart(2, '0') + n.getFullYear();
    } else if (d.includes('/')) {
      d = d.split(' ')[0].replace(/\//g, '');
    } else if (d.includes('-')) {
      const parts = d.split(' ')[0].split('-');
      if (parts[0].length === 4) d = `${parts[2]}${parts[1]}${parts[0]}`;
    }
    return `${ini}-${d}-BTS2GCGT`;
  }

  function defaultDB() {
    const today = formatDateFR();
    return {
      students: [],
      resources: [
        {
          id: 1,
          title: 'Topographie générale & Levés au tachéomètre — Cours complet',
          category: 'cours',
          classe: FILIERE_CODE,
          subject: 'Topographie générale',
          filename: 'Cours_Topographie_Generale_Leves_BTS2_GCGT.pdf',
          url: 'uploads/pdfs/Cours_Topographie_Generale_Leves_BTS2_GCGT.pdf',
          created_at: today
        },
        {
          id: 2,
          title: 'Exercices & Corrigés — Gisements, Coordonnées, Surfaces et Nivellement',
          category: 'exercice_corrige',
          classe: FILIERE_CODE,
          subject: 'Calculs topométriques',
          filename: 'Exercices_Corriges_Cheminements_BTS2_GCGT.pdf',
          url: 'uploads/pdfs/Exercices_Corriges_Cheminements_BTS2_GCGT.pdf',
          created_at: today
        },
        {
          id: 3,
          title: 'GNSS, Géodésie & Systèmes de coordonnées — Cours',
          category: 'cours',
          classe: FILIERE_CODE,
          subject: 'Géodésie & GNSS',
          filename: 'Cours_GNSS_Geodesie_BTS2_GCGT.pdf',
          url: 'uploads/pdfs/Cours_GNSS_Geodesie_BTS2_GCGT.pdf',
          created_at: today
        },
        {
          id: 4,
          title: 'Sujet Type BTS + Corrigé — Bornage, Foncier & Plan topographique',
          category: 'exercice_corrige',
          classe: FILIERE_CODE,
          subject: 'Foncier, cadastre & bornage',
          filename: 'Sujet_Corrige_Bornage_Foncier_BTS2_GCGT.pdf',
          url: 'uploads/pdfs/Sujet_Corrige_Bornage_Foncier_BTS2_GCGT.pdf',
          created_at: today
        },
        {
          id: 5,
          title: 'DAO, Modèle Numérique de Terrain & Implantation de VRD — Cours',
          category: 'cours',
          classe: FILIERE_CODE,
          subject: 'DAO, VRD et implantation',
          filename: 'Cours_DAO_VRD_Implantation_BTS2_GCGT.pdf',
          url: 'uploads/pdfs/Cours_DAO_VRD_Implantation_BTS2_GCGT.pdf',
          created_at: today
        }
      ],
      forum: [
        {
          id: 1,
          author_name: 'Direction Académique ACADEMIE GGT',
          author_role: 'admin',
          author_classe: 'Direction Académique',
          title: 'Bienvenue sur le Forum Officiel des Géomètres Topographes de Yamoussoukro',
          content: 'Cet espace est dédié aux étudiants inscrits en BTS 2 Génie Civil option Géomètre Topographe. Posez ici vos questions sur les cours PDF, les calculs de cheminement, le GNSS, le droit foncier et la préparation aux épreuves du BTS.',
          created_at: formatDateTimeFR(),
          replies: []
        }
      ],
      mailbox: []
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.resources)) {
          if (!Array.isArray(parsed.mailbox)) parsed.mailbox = [];
          if (!Array.isArray(parsed.forum)) parsed.forum = defaultDB().forum;
          return parsed;
        }
      }
    } catch (_) {}
    const init = defaultDB();
    try {
      localStorage.setItem(KEY, JSON.stringify(init));
    } catch (_) {}
    return init;
  }

  function save(db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (_) {}
  }

  function pushMail({ sender, email, classe, subject, body }) {
    const db = load();
    db.mailbox = db.mailbox || [];
    const newMail = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      sender: (sender || 'Étudiant').trim(),
      email: (email || '').trim().toLowerCase(),
      classe: classe || FILIERE_CODE,
      subject: subject || 'Nouvelle demande étudiante',
      date: formatDateTimeFR(),
      unread: true,
      body: body || '',
      replies: []
    };
    db.mailbox.unshift(newMail);
    save(db);
    return newMail;
  }

  function registerStudent({ full_name, email, phone, ecole, classe }) {
    const db = load();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (full_name || '').trim();
    const cleanPhone = (phone || '').trim();
    const cleanEcole = (ecole || '').trim();
    const cleanClasse = classe || FILIERE_CODE;
    const regDate = formatDateFR();
    const expectedCode = previewCode(cleanName, regDate);

    let existing = db.students.find(s => (s.email || '').toLowerCase() === cleanEmail);
    if (existing) {
      existing.full_name = cleanName || existing.full_name;
      existing.phone = cleanPhone || existing.phone;
      existing.ecole = cleanEcole || existing.ecole;
    } else {
      existing = {
        id: Date.now(),
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        classe: cleanClasse,
        ecole: cleanEcole,
        registered_at: regDate,
        student_code: null,
        status: 'pending',
        confirmed_at: null,
        valid_until: null,
        visits: 1,
        posts_count: 0
      };
      db.students.unshift(existing);
    }

    db.mailbox = db.mailbox || [];
    db.mailbox.unshift({
      id: Date.now() + 1,
      sender: cleanName,
      email: cleanEmail,
      classe: cleanClasse,
      subject: `Nouvelle inscription à valider — ${cleanName} (${cleanEcole})`,
      date: formatDateTimeFR(),
      unread: true,
      body: `Bonjour Monsieur l'Administrateur,\n\nUne nouvelle demande d'inscription au programme de renforcement BTS 2 Génie Civil option Géomètre Topographe vient d'être enregistrée :\n\n• Étudiant : ${cleanName}\n• Établissement : ${cleanEcole}\n• Email : ${cleanEmail}\n• Téléphone / WhatsApp : ${cleanPhone || 'Non renseigné'}\n• Cotisation mensuelle : 10 000 FCFA\n• Identifiant prévu : ${expectedCode}\n\nVous pouvez valider son accès mensuel depuis l'onglet « Inscriptions » dès réception de sa cotisation.`,
      replies: []
    });

    save(db);
    return { student: existing, preview_format: expectedCode };
  }

  window.GGT = {
    KEY,
    FILIERE_CODE,
    FILIERE_LABEL,
    ECOLES,
    FEE: 10000,
    defaultDB,
    load,
    save,
    previewCode,
    formatDateFR,
    formatDateTimeFR,
    pushMail,
    registerStudent
  };
})();
