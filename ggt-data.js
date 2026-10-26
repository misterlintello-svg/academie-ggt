/* ═══════════════════════════════════════════════════════════════
   ACADEMIE GGT — Moteur Cloud Supabase & Persistance de Production
   Filière unique : BTS 2 · Génie Civil option Géomètre Topographe
   Utilisé par index.html, etudiant.html et admin.html
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const KEY = 'ggt_prod_db_v1';
  const LEGACY_KEYS = ['ggt_local_db', 'ggt_local_db_v2', 'ggt_local_db_v3', 'ggt_student_code_v3'];
  const FILIERE_CODE = 'BTS 2 - GC-GT';
  const FILIERE_LABEL = 'BTS 2 · Génie Civil option Géomètre Topographe';

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION SUPABASE CLOUD (PRODUCTION)
  // Collez ici votre URL et votre clé "anon public" Supabase pour que
  // tous les appareils (téléphones étudiants & PC Admin) soient synchronisés :
  // ─────────────────────────────────────────────────────────────
  const DEFAULT_SUPABASE_URL = 'https://rjzmxjgeylwobfybczrn.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_e6ORfcldZdnHZegrTI77-Q_TDzjc_sp';

  const SB_URL_KEY = 'ggt_supabase_url';
  const SB_ANON_KEY = 'ggt_supabase_anon_key';

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

  function formatDateFR(val = new Date()) {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(val)) return val.slice(0, 10);
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function formatDateTimeFR(val = new Date()) {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/.test(val)) return val;
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('fr-FR', {
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
    } else if (String(d).includes('/')) {
      d = String(d).split(' ')[0].replace(/\//g, '');
    } else if (String(d).includes('-')) {
      const parts = String(d).split('T')[0].split(' ')[0].split('-');
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

  function pushMail({ sender, from, email, classe, subject, body }) {
    const db = load();
    db.mailbox = db.mailbox || [];
    const cleanSender = (sender || from || 'Étudiant').trim();
    const newMail = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      sender: cleanSender,
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
    if (!cleanName || !cleanEmail) {
      return { ok: false, error: 'Veuillez renseigner votre nom et votre email.' };
    }
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
    return { ok: true, student: existing, preview: expectedCode, preview_format: expectedCode };
  }

  // ═══════════════════════════════════════════════════════════════
  // MOTEUR CLOUD SUPABASE (REST API v1 & STORAGE API v1)
  // Permet au site hébergé sur Netlify de fonctionner 24h/24 avec une
  // vraie base PostgreSQL Cloud partagée entre tous les appareils.
  // ═══════════════════════════════════════════════════════════════
  const nativeFetch = window.fetch.bind(window);

  function getSupabaseConfig() {
    let url = DEFAULT_SUPABASE_URL;
    let anonKey = DEFAULT_SUPABASE_ANON_KEY;
    try {
      url = (localStorage.getItem(SB_URL_KEY) || url || '').trim().replace(/\/+$/, '');
      anonKey = (localStorage.getItem(SB_ANON_KEY) || anonKey || '').trim();
    } catch (_) {}
    return { url, anonKey };
  }

  function setSupabaseConfig(url, anonKey) {
    const cleanUrl = (url || '').trim().replace(/\/+$/, '');
    const cleanKey = (anonKey || '').trim();
    try {
      if (cleanUrl && cleanKey) {
        localStorage.setItem(SB_URL_KEY, cleanUrl);
        localStorage.setItem(SB_ANON_KEY, cleanKey);
      } else {
        localStorage.removeItem(SB_URL_KEY);
        localStorage.removeItem(SB_ANON_KEY);
      }
    } catch (_) {}
    return { url: cleanUrl, anonKey: cleanKey };
  }

  function isSupabaseConfigured() {
    const { url, anonKey } = getSupabaseConfig();
    return Boolean(url && url.startsWith('https://') && anonKey && anonKey.length > 20);
  }

  async function sbRest(tableAndQuery, { method = 'GET', body = null, prefer = 'return=representation', customConfig = null } = {}) {
    const cfg = customConfig || getSupabaseConfig();
    const headers = {
      'apikey': cfg.anonKey,
      'Authorization': `Bearer ${cfg.anonKey}`,
      'Accept': 'application/json'
    };
    if (prefer) headers['Prefer'] = prefer;
    let payload = undefined;
    if (body !== null && body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const res = await nativeFetch(`${cfg.url}/rest/v1/${tableAndQuery}`, {
      method,
      headers,
      body: payload
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
    if (!res.ok) {
      const msg = (data && (data.message || data.error || data.hint)) || `Erreur Supabase (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      err.details = data;
      throw err;
    }
    return data;
  }

  async function testSupabaseConnection(testUrl, testAnonKey) {
    const cleanUrl = (testUrl || '').trim().replace(/\/+$/, '');
    const cleanKey = (testAnonKey || '').trim();
    if (!cleanUrl.startsWith('https://') || !cleanUrl.includes('.supabase.co')) {
      return { ok: false, error: "L'URL Supabase doit commencer par https:// et se terminer par .supabase.co" };
    }
    if (cleanKey.length < 30) {
      return { ok: false, error: 'Veuillez fournir une clé publique Supabase (anon public key) valide.' };
    }
    try {
      await sbRest('students?select=id&limit=1', {
        method: 'GET',
        prefer: '',
        customConfig: { url: cleanUrl, anonKey: cleanKey }
      });
      // Initialiser les 5 PDF et le post de bienvenue si la base vient d'être créée
      await seedSupabaseIfNeeded({ url: cleanUrl, anonKey: cleanKey });
      return { ok: true, message: 'Connexion à Supabase PostgreSQL établie et tables vérifiées avec succès !' };
    } catch (err) {
      if (err.status === 404 || (err.message && err.message.includes('relation') && err.message.includes('does not exist')) || (err.details && err.details.code === '42P01')) {
        return {
          ok: false,
          needsSchema: true,
          error: "Connexion au projet Supabase réussie, mais les tables n'existent pas encore. Copiez et exécutez le script SQL dans Supabase -> SQL Editor."
        };
      }
      return { ok: false, error: `Impossible de joindre Supabase : ${err.message}` };
    }
  }

  async function seedSupabaseIfNeeded(customConfig = null) {
    try {
      const existingRes = await sbRest('resources?select=id&limit=1', { customConfig, prefer: '' });
      if (Array.isArray(existingRes) && existingRes.length === 0) {
        const defaults = defaultDB().resources.map(r => ({
          title: r.title,
          category: r.category,
          classe: r.classe,
          subject: r.subject,
          filename: r.filename,
          url: r.url
        }));
        await sbRest('resources', { method: 'POST', body: defaults, customConfig });
      }
      const existingForum = await sbRest('forum_posts?select=id&limit=1', { customConfig, prefer: '' });
      if (Array.isArray(existingForum) && existingForum.length === 0) {
        const f = defaultDB().forum[0];
        await sbRest('forum_posts', {
          method: 'POST',
          body: [{
            author_name: f.author_name,
            author_classe: f.author_classe,
            author_role: f.author_role,
            title: f.title,
            content: f.content
          }],
          customConfig
        });
      }
    } catch (_) {}
  }

  function mapStudentFromSB(row) {
    if (!row) return null;
    // Vérifier l'expiration automatique
    let status = row.status || 'pending';
    if (status === 'active' && row.valid_until) {
      const exp = new Date(row.valid_until);
      if (!isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
        status = 'expired';
      }
    }
    return {
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone || '',
      classe: row.classe || FILIERE_CODE,
      ecole: row.ecole || 'Yamoussoukro',
      registered_at: formatDateFR(row.registered_at),
      status,
      student_code: row.student_code || null,
      confirmed_at: row.confirmed_at ? formatDateFR(row.confirmed_at) : null,
      valid_until: row.valid_until ? formatDateFR(row.valid_until) : null,
      visits: row.visits || 0,
      posts_count: row.posts_count || 0
    };
  }

  function mapResourceFromSB(row) {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      classe: row.classe || FILIERE_CODE,
      subject: row.subject || 'Topographie générale',
      filename: row.filename,
      url: row.url,
      created_at: formatDateFR(row.created_at)
    };
  }

  function mapMailFromSB(row) {
    return {
      id: row.id,
      sender: row.sender_name || 'Étudiant',
      email: row.sender_email || '',
      classe: FILIERE_CODE,
      subject: row.subject || '',
      body: row.body || '',
      date: formatDateTimeFR(row.created_at),
      unread: !row.is_read,
      replies: []
    };
  }

  function jsonResponse(obj, status = 200) {
    return new Response(JSON.stringify(obj), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async function handleSupabaseApi(urlStr, options = {}) {
    const u = new URL(urlStr, window.location.origin);
    const path = u.pathname;
    const method = (options.method || 'GET').toUpperCase();
    const headers = options.headers || {};
    const getHeader = (name) => {
      if (headers instanceof Headers) return headers.get(name) || '';
      const foundKey = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase());
      return foundKey ? headers[foundKey] : '';
    };

    const parseJsonBody = () => {
      if (!options.body || typeof options.body !== 'string') return {};
      try { return JSON.parse(options.body); } catch (_) { return {}; }
    };

    try {
      // 1. POST /api/register
      if (path === '/api/register' && method === 'POST') {
        const body = parseJsonBody();
        const full_name = (body.full_name || '').trim();
        const email = (body.email || '').trim().toLowerCase();
        const phone = (body.phone || '').trim();
        const ecole = (body.ecole || 'Yamoussoukro').trim();
        const classe = FILIERE_CODE;

        if (!full_name || !email) {
          return jsonResponse({ error: 'Veuillez renseigner votre nom complet et votre adresse email.' }, 400);
        }

        const expectedCode = previewCode(full_name);
        const existing = await sbRest(`students?email=ilike.${encodeURIComponent(email)}&select=*`, { prefer: '' });
        if (Array.isArray(existing) && existing.length > 0) {
          await sbRest(`students?id=eq.${existing[0].id}`, {
            method: 'PATCH',
            body: { full_name, phone, ecole }
          });
        } else {
          await sbRest('students', {
            method: 'POST',
            body: [{ full_name, email, phone, classe, ecole, status: 'pending' }]
          });
        }

        await sbRest('mailbox_messages', {
          method: 'POST',
          body: [{
            sender_name: full_name,
            sender_email: email,
            subject: `Nouvelle inscription BTS 2 GC-GT — ${full_name} (${ecole})`,
            body: `Bonjour Monsieur l'Administrateur,\n\nUne nouvelle demande d'inscription vient d'être enregistrée sur Supabase Cloud :\n• Nom : ${full_name}\n• École : ${ecole}\n• Email : ${email}\n• Téléphone : ${phone || 'Non renseigné'}\n• Identifiant prévu : ${expectedCode}\n\nRendez-vous dans l'onglet « Inscriptions » pour valider son accès mensuel.`,
            is_read: false
          }]
        });

        return jsonResponse({
          ok: true,
          message: "Inscription enregistrée sur la base Cloud ! L'administrateur principal va confirmer votre accès et activer votre identifiant mensuel.",
          preview_format: expectedCode
        });
      }

      // 2. POST /api/student/check-email
      if (path === '/api/student/check-email' && method === 'POST') {
        const { email } = parseJsonBody();
        const cleanEmail = (email || '').trim().toLowerCase();
        if (!cleanEmail) return jsonResponse({ found: false }, 400);
        const rows = await sbRest(`students?email=ilike.${encodeURIComponent(cleanEmail)}&select=*`, { prefer: '' });
        if (!Array.isArray(rows) || !rows.length) {
          return jsonResponse({ found: false });
        }
        return jsonResponse({ found: true, student: mapStudentFromSB(rows[0]) });
      }

      // 3. POST /api/contact
      if (path === '/api/contact' && method === 'POST') {
        const body = parseJsonBody();
        await sbRest('mailbox_messages', {
          method: 'POST',
          body: [{
            sender_name: (body.sender_name || 'Étudiant').trim(),
            sender_email: (body.sender_email || '').trim().toLowerCase(),
            subject: (body.subject || 'Demande étudiant').trim(),
            body: (body.body || '').trim(),
            is_read: false
          }]
        });
        return jsonResponse({ ok: true });
      }

      // 4. POST /api/student/login
      if (path === '/api/student/login' && method === 'POST') {
        const { student_code, email } = parseJsonBody();
        const code = (student_code || '').trim().toUpperCase();
        const cleanEmail = (email || '').trim().toLowerCase();
        const rows = await sbRest(`students?student_code=eq.${encodeURIComponent(code)}&select=*`, { prefer: '' });
        if (!Array.isArray(rows) || !rows.length) {
          return jsonResponse({ error: "Identifiant introuvable. Vérifiez votre saisie ou attendez la validation de l'administrateur." }, 404);
        }
        const st = mapStudentFromSB(rows[0]);
        if (cleanEmail && st.email && st.email.toLowerCase() !== cleanEmail) {
          return jsonResponse({ error: "L'adresse email saisie ne correspond pas à cet identifiant mensuel." }, 403);
        }
        if (st.status !== 'active') {
          return jsonResponse({ error: "Votre identifiant mensuel est expiré ou en attente de validation par l'administrateur." }, 403);
        }
        await sbRest(`students?id=eq.${st.id}`, {
          method: 'PATCH',
          body: { visits: (rows[0].visits || 0) + 1 }
        });
        return jsonResponse({ ok: true, student: st });
      }

      // 5. GET /api/student/portal
      if (path === '/api/student/portal' && method === 'GET') {
        const code = (getHeader('X-Student-Code') || '').trim().toUpperCase();
        const rows = await sbRest(`students?student_code=eq.${encodeURIComponent(code)}&select=*`, { prefer: '' });
        if (!Array.isArray(rows) || !rows.length) {
          return jsonResponse({ error: 'Identifiant invalide ou session expirée.' }, 401);
        }
        const st = mapStudentFromSB(rows[0]);
        if (st.status !== 'active') {
          return jsonResponse({ error: 'Votre accès mensuel a expiré.' }, 403);
        }
        await seedSupabaseIfNeeded();
        const [resRows, postRows, replyRows] = await Promise.all([
          sbRest('resources?select=*&order=id.asc', { prefer: '' }),
          sbRest('forum_posts?select=*&order=id.desc', { prefer: '' }),
          sbRest('forum_replies?select=*&order=id.asc', { prefer: '' })
        ]);
        const repliesByPost = {};
        (replyRows || []).forEach(r => {
          repliesByPost[r.post_id] = repliesByPost[r.post_id] || [];
          repliesByPost[r.post_id].push({
            id: r.id,
            author_name: r.author_name,
            author_classe: r.author_classe,
            author_role: r.author_role,
            content: r.content,
            created_at: formatDateTimeFR(r.created_at)
          });
        });
        const forum = (postRows || []).map(p => ({
          id: p.id,
          author_name: p.author_name,
          author_classe: p.author_classe,
          author_role: p.author_role,
          title: p.title,
          content: p.content,
          created_at: formatDateTimeFR(p.created_at),
          replies: repliesByPost[p.id] || []
        }));
        return jsonResponse({
          student: st,
          resources: (resRows || []).map(mapResourceFromSB),
          forum
        });
      }

      // 6. POST /api/forum/posts
      if (path === '/api/forum/posts' && method === 'POST') {
        const { title, content } = parseJsonBody();
        const adminPwd = getHeader('X-Admin-Password');
        const stuCode = (getHeader('X-Student-Code') || '').trim().toUpperCase();
        let author_name = 'Étudiant BTS 2 GC-GT';
        let author_classe = FILIERE_CODE;
        let author_role = 'etudiant';

        if (adminPwd === 'Admin123') {
          author_name = 'Mohamed Sanogo — Administrateur';
          author_classe = 'Direction Académique';
          author_role = 'admin';
        } else if (stuCode) {
          const rows = await sbRest(`students?student_code=eq.${encodeURIComponent(stuCode)}&select=*`, { prefer: '' });
          if (!rows || !rows.length) return jsonResponse({ error: 'Accès non autorisé' }, 401);
          author_name = rows[0].full_name;
          author_classe = rows[0].ecole || FILIERE_CODE;
          await sbRest(`students?id=eq.${rows[0].id}`, {
            method: 'PATCH',
            body: { posts_count: (rows[0].posts_count || 0) + 1 }
          });
        } else {
          return jsonResponse({ error: 'Accès non autorisé' }, 401);
        }

        const created = await sbRest('forum_posts', {
          method: 'POST',
          body: [{ author_name, author_classe, author_role, title, content }]
        });
        return jsonResponse({ ok: true, post: created && created[0] });
      }

      // 7. POST /api/forum/posts/:id/replies
      const replyMatch = path.match(/^\/api\/forum\/posts\/(\d+)\/replies$/);
      if (replyMatch && method === 'POST') {
        const postId = Number(replyMatch[1]);
        const { content } = parseJsonBody();
        const adminPwd = getHeader('X-Admin-Password');
        const stuCode = (getHeader('X-Student-Code') || '').trim().toUpperCase();
        let author_name = 'Étudiant BTS 2 GC-GT';
        let author_classe = FILIERE_CODE;
        let author_role = 'etudiant';

        if (adminPwd === 'Admin123') {
          author_name = 'Mohamed Sanogo — Administrateur';
          author_classe = 'Direction Académique';
          author_role = 'admin';
        } else if (stuCode) {
          const rows = await sbRest(`students?student_code=eq.${encodeURIComponent(stuCode)}&select=*`, { prefer: '' });
          if (!rows || !rows.length) return jsonResponse({ error: 'Accès non autorisé' }, 401);
          author_name = rows[0].full_name;
          author_classe = rows[0].ecole || FILIERE_CODE;
          await sbRest(`students?id=eq.${rows[0].id}`, {
            method: 'PATCH',
            body: { posts_count: (rows[0].posts_count || 0) + 1 }
          });
        } else {
          return jsonResponse({ error: 'Accès non autorisé' }, 401);
        }

        await sbRest('forum_replies', {
          method: 'POST',
          body: [{ post_id: postId, author_name, author_classe, author_role, content }]
        });
        return jsonResponse({ ok: true });
      }

      // 8. POST /api/admin/login
      if (path === '/api/admin/login' && method === 'POST') {
        const { password } = parseJsonBody();
        if (password !== 'Admin123') {
          return jsonResponse({ error: 'Mot de passe administrateur incorrect.' }, 401);
        }
        return jsonResponse({ ok: true, cloud: 'supabase' });
      }

      // Vérification Admin pour les routes /api/admin/*
      if (path.startsWith('/api/admin/')) {
        const pwd = getHeader('X-Admin-Password');
        if (pwd !== 'Admin123') {
          return jsonResponse({ error: 'Non autorisé' }, 401);
        }
      }

      // 9. GET /api/admin/overview
      if (path === '/api/admin/overview' && method === 'GET') {
        await seedSupabaseIfNeeded();
        const [stuRows, resRows, postRows, replyRows, mailRows] = await Promise.all([
          sbRest('students?select=*&order=id.desc', { prefer: '' }),
          sbRest('resources?select=*&order=id.asc', { prefer: '' }),
          sbRest('forum_posts?select=*&order=id.desc', { prefer: '' }),
          sbRest('forum_replies?select=*&order=id.asc', { prefer: '' }),
          sbRest('mailbox_messages?select=*&order=id.desc', { prefer: '' })
        ]);

        const repliesByPost = {};
        (replyRows || []).forEach(r => {
          repliesByPost[r.post_id] = repliesByPost[r.post_id] || [];
          repliesByPost[r.post_id].push({
            id: r.id,
            author_name: r.author_name,
            author_classe: r.author_classe,
            author_role: r.author_role,
            content: r.content,
            created_at: formatDateTimeFR(r.created_at)
          });
        });

        const forum = (postRows || []).map(p => ({
          id: p.id,
          author_name: p.author_name,
          author_classe: p.author_classe,
          author_role: p.author_role,
          title: p.title,
          content: p.content,
          created_at: formatDateTimeFR(p.created_at),
          replies: repliesByPost[p.id] || []
        }));

        return jsonResponse({
          admin_email: 'mohsanogo512@gmail.com',
          smtp_configured: false,
          supabase_connected: true,
          students: (stuRows || []).map(mapStudentFromSB),
          resources: (resRows || []).map(mapResourceFromSB),
          forum,
          mailbox: (mailRows || []).map(mapMailFromSB)
        });
      }

      // 10. POST /api/admin/confirm/:id
      const confirmMatch = path.match(/^\/api\/admin\/confirm\/(\d+)$/);
      if (confirmMatch && method === 'POST') {
        const id = Number(confirmMatch[1]);
        const rows = await sbRest(`students?id=eq.${id}&select=*`, { prefer: '' });
        if (!rows || !rows.length) return jsonResponse({ error: 'Étudiant introuvable' }, 404);
        const s = rows[0];
        let code = s.student_code;
        if (!code) {
          code = previewCode(s.full_name, formatDateFR(s.registered_at));
        }
        const now = new Date();
        const exp = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const updated = await sbRest(`students?id=eq.${id}`, {
          method: 'PATCH',
          body: {
            student_code: code,
            status: 'active',
            confirmed_at: now.toISOString(),
            valid_until: exp.toISOString()
          }
        });
        return jsonResponse({
          ok: true,
          email_sent: false,
          student: mapStudentFromSB(updated[0] || { ...s, student_code: code, status: 'active', confirmed_at: now, valid_until: exp })
        });
      }

      // 11. POST /api/admin/revoke/:id
      const revokeMatch = path.match(/^\/api\/admin\/revoke\/(\d+)$/);
      if (revokeMatch && method === 'POST') {
        const id = Number(revokeMatch[1]);
        await sbRest(`students?id=eq.${id}`, {
          method: 'PATCH',
          body: { status: 'expired' }
        });
        return jsonResponse({ ok: true });
      }

      // 12. POST /api/admin/expire-month
      if (path === '/api/admin/expire-month' && method === 'POST') {
        await sbRest('students?status=eq.active', {
          method: 'PATCH',
          body: { status: 'expired' }
        });
        return jsonResponse({ ok: true });
      }

      // 13. DELETE /api/admin/students/:id
      const delStuMatch = path.match(/^\/api\/admin\/students\/(\d+)$/);
      if (delStuMatch && method === 'DELETE') {
        const id = Number(delStuMatch[1]);
        await sbRest(`students?id=eq.${id}`, { method: 'DELETE', prefer: '' });
        return jsonResponse({ ok: true });
      }

      // 14. POST /api/admin/resources (Upload PDF vers Supabase Storage bucket 'pdfs' + table resources)
      if (path === '/api/admin/resources' && method === 'POST' && options.body instanceof FormData) {
        const fd = options.body;
        const title = (fd.get('title') || '').trim();
        const category = fd.get('category') || 'cours';
        const classe = fd.get('classe') || FILIERE_CODE;
        const subject = (fd.get('subject') || 'Topographie générale').trim();
        const file = fd.get('pdf_file');

        if (!title || !file) {
          return jsonResponse({ error: 'Titre et fichier PDF requis.' }, 400);
        }

        const cfg = getSupabaseConfig();
        const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const uploadRes = await nativeFetch(`${cfg.url}/storage/v1/object/pdfs/${safeName}`, {
          method: 'POST',
          headers: {
            'apikey': cfg.anonKey,
            'Authorization': `Bearer ${cfg.anonKey}`,
            'Content-Type': file.type || 'application/pdf',
            'x-upsert': 'true'
          },
          body: file
        });

        let publicUrl = `uploads/pdfs/${file.name}`;
        if (uploadRes.ok) {
          publicUrl = `${cfg.url}/storage/v1/object/public/pdfs/${safeName}`;
        }

        const inserted = await sbRest('resources', {
          method: 'POST',
          body: [{ title, category, classe, subject, filename: safeName, url: publicUrl }]
        });
        return jsonResponse({ ok: true, resource: inserted && inserted[0] ? mapResourceFromSB(inserted[0]) : null });
      }

      // 15. DELETE /api/admin/resources/:id
      const delResMatch = path.match(/^\/api\/admin\/resources\/(\d+)$/);
      if (delResMatch && method === 'DELETE') {
        const id = Number(delResMatch[1]);
        await sbRest(`resources?id=eq.${id}`, { method: 'DELETE', prefer: '' });
        return jsonResponse({ ok: true });
      }

      // 16. DELETE /api/admin/forum/posts/:id
      const delPostMatch = path.match(/^\/api\/admin\/forum\/posts\/(\d+)$/);
      if (delPostMatch && method === 'DELETE') {
        const id = Number(delPostMatch[1]);
        await sbRest(`forum_posts?id=eq.${id}`, { method: 'DELETE', prefer: '' });
        return jsonResponse({ ok: true });
      }

      // 17. POST /api/admin/mailbox/:id/read & DELETE /api/admin/mailbox/:id
      const mailReadMatch = path.match(/^\/api\/admin\/mailbox\/(\d+)\/read$/);
      if (mailReadMatch && method === 'POST') {
        const id = Number(mailReadMatch[1]);
        await sbRest(`mailbox_messages?id=eq.${id}`, {
          method: 'PATCH',
          body: { is_read: true }
        });
        return jsonResponse({ ok: true });
      }

      const delMailMatch = path.match(/^\/api\/admin\/mailbox\/(\d+)$/);
      if (delMailMatch && method === 'DELETE') {
        const id = Number(delMailMatch[1]);
        await sbRest(`mailbox_messages?id=eq.${id}`, { method: 'DELETE', prefer: '' });
        return jsonResponse({ ok: true });
      }
    } catch (err) {
      console.warn('[Supabase Cloud API]', err);
      return jsonResponse({ error: err.message || 'Erreur Supabase Cloud' }, err.status || 500);
    }

    return nativeFetch(urlStr, options);
  }

  // Interception transparente des appels /api/* lorsque Supabase est configuré
  window.fetch = async function (input, init) {
    const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    if (urlStr.includes('/api/') && isSupabaseConfigured()) {
      return handleSupabaseApi(urlStr, init);
    }
    return nativeFetch(input, init);
  };

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
    registerStudent,
    SUPABASE: {
      getConfig: getSupabaseConfig,
      setConfig: setSupabaseConfig,
      isConfigured: isSupabaseConfigured,
      testConnection: testSupabaseConnection
    }
  };
})();
