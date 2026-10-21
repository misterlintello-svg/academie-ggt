/* ═══════════════════════════════════════════════════════════════
   CampusPlus — Interactions & animations
   ═══════════════════════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Menu mobile ─────────────────────────────────────── */
  const burger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  const setMenu = (open) => {
    burger.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    mobileNav.setAttribute('aria-hidden', String(!open));
  };
  if (burger && mobileNav) {
    burger.addEventListener('click', () => setMenu(!burger.classList.contains('open')));
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ── 2. Lien actif de la navigation selon la section visible ── */
  const navLinks = document.querySelectorAll('.nav-link');
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('section[id]').forEach(s => navObserver.observe(s));

  /* ── 3. Apparition au défilement ────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── 4. Compteurs animés ────────────────────────────────── */
  const countUp = (el) => {
    const target = +el.dataset.target;
    if (reduceMotion) { el.textContent = target.toLocaleString('fr-FR'); return; }
    const t0 = performance.now(), dur = 1800;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(eased * target).toLocaleString('fr-FR');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { countUp(entry.target); countObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat-n[data-target]').forEach(el => countObserver.observe(el));

  /* ── 5. Formulaire email du hero (validation) ───────────── */
  const form = document.getElementById('emailForm');
  const input = document.getElementById('email');
  const msg = document.getElementById('emailMsg');
  const bar = form?.querySelector('.email-bar');
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  const feedback = (text, type) => {
    msg.textContent = text;
    msg.className = 'email-msg ' + type;
    if (type === 'err' && bar) {
      bar.classList.remove('shake'); void bar.offsetWidth; bar.classList.add('shake');
    }
  };

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return feedback('Veuillez saisir votre adresse email.', 'err'), input.focus();
    if (!isEmail(v)) return feedback('Adresse email invalide, vérifiez le format.', 'err'), input.focus();
    feedback('✓ Redirection vers le portail d\'inscription étudiant ACADEMIE GGT...', 'ok');
    setTimeout(() => {
      window.location.href = 'etudiant.html?tab=register&email=' + encodeURIComponent(v);
    }, 500);
  });
  input?.addEventListener('input', () => { msg.textContent = ''; msg.className = 'email-msg'; });

  /* ── 6. Formulaire d'inscription directe (bas de page) ──── */
  const cform = document.getElementById('contactForm');
  const regFeedback = document.getElementById('homeRegFeedback');
  cform?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = cform.querySelector('.cform-btn');
    const full_name = document.getElementById('homeRegName')?.value.trim() || '';
    const email = (document.getElementById('homeRegEmail')?.value.trim() || '').toLowerCase();
    const phone = document.getElementById('homeRegPhone')?.value.trim() || '';
    const ecole = document.getElementById('homeRegEcole')?.value.trim() || '';
    const classe = window.GGT?.FILIERE_CODE || 'BTS 2 - GC-GT';

    if (!full_name || !isEmail(email) || !ecole) {
      if (regFeedback) {
        regFeedback.style.color = '#fca5a5';
        regFeedback.textContent = 'Veuillez renseigner votre nom, un email valide et votre école d\'origine à Yamoussoukro.';
      }
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enregistrement en cours...';
    const localReg = window.GGT
      ? window.GGT.registerStudent({ full_name, email, phone, classe, ecole })
      : { ok: true, preview: 'XX-JJMMAAAA-BTS2GCGT' };

    const apiBase = (location.protocol === 'file:') ? 'http://localhost:5000' : '';
    try {
      const res = await fetch(apiBase + '/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, phone, classe, ecole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      if (regFeedback) {
        regFeedback.style.color = '#86efac';
        regFeedback.innerHTML = `✓ ${data.message}<br><strong>Identifiant prévu : ${data.preview_format}</strong>`;
      }
      cform.reset();
    } catch (err) {
      if (!localReg.ok) {
        if (regFeedback) {
          regFeedback.style.color = '#fca5a5';
          regFeedback.textContent = localReg.error;
        }
      } else {
        if (regFeedback) {
          regFeedback.style.color = '#86efac';
          regFeedback.innerHTML = `✓ Inscription enregistrée (${ecole}) ! Votre demande a été transmise à l'administrateur principal (<a href="admin.html" style="color:#fff;text-decoration:underline">Portail Admin</a>) pour validation de votre accès mensuel.<br><strong>Identifiant prévu : ${localReg.preview}</strong>`;
        }
        cform.reset();
      }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Valider mon inscription étudiant';
    }
  });

  /* ── 7. Parallaxe douce du paysage (souris, desktop) ─────── */
  const photo = document.getElementById('campusPhoto');
  const hero = document.querySelector('.hero');
  if (photo && hero && !reduceMotion && matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * -18;
      const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
      photo.style.setProperty('--px', x.toFixed(1) + 'px');
      photo.style.setProperty('--py', y.toFixed(1) + 'px');
    });
    hero.addEventListener('mouseleave', () => {
      photo.style.setProperty('--px', '0px');
      photo.style.setProperty('--py', '0px');
    });
  }

  /* ── 8. Section 02 — Globe interactif (Style Hanergy) ───── */
  const planetData = [
    {
      step: 'PILIER 01 / 04',
      title: 'La précision topographique du terrain à l\'examen',
      desc: 'Conçue spécifiquement pour la 2e année de BTS Génie Civil option Géomètre Topographe à Yamoussoukro, ACADEMIE GGT rassemble cours PDF, corrigés de calculs et suivi mensuel.',
      m1: 'BTS 2 GC-GT', m1Label: 'Filière Géomètre Topographe',
      m2: '100% PDF', m2Label: 'Cours + Exercices & Corrigés',
      rot: 0
    },
    {
      step: 'PILIER 02 / 04',
      title: 'Un identifiant mensuel unique par étudiant',
      desc: 'Chaque étudiant inscrit reçoit, après confirmation de l\'administrateur principal, un identifiant personnel composé de ses initiales, sa date d\'inscription et sa filière BTS2GCGT.',
      m1: '1 Mois', m1Label: 'Validité exacte de chaque accès',
      m2: 'Auto-ID', m2Label: 'Initiales + Date + BTS2GCGT',
      rot: -90
    },
    {
      step: 'PILIER 03 / 04',
      title: 'Calculs topométriques & sujets types corrigés',
      desc: 'Tous les chapitres sont accompagnés de fiches de TD et de sujets types BTS intégralement corrigés en PDF : cheminements, gisements, GNSS, bornage foncier et VRD.',
      m1: '5 Modules', m1Label: 'Topo, Calculs, GNSS, Foncier, VRD',
      m2: '24h/24', m2Label: 'Téléchargement direct des PDF',
      rot: -180
    },
    {
      step: 'PILIER 04 / 04',
      title: 'Forum d\'entraide inter-écoles de Yamoussoukro',
      desc: 'Les étudiants de l\'INP-HB, ESBTP, EPI-YAKRO, ESETEC et 2IFTP échangent leurs questions et méthodes de calcul sous la supervision du coordinateur d\'ACADEMIE GGT.',
      m1: '5 Écoles', m1Label: 'Réseau étudiant Yamoussoukro',
      m2: 'Direct', m2Label: 'Questions & réponses vérifiées',
      rot: -270
    }
  ];

  const planetNodes = document.querySelectorAll('.planet-node');
  const planetCopy = document.getElementById('planetCopy');
  const planetStep = document.getElementById('planetStep');
  const planetTitle = document.getElementById('planetTitle');
  const planetDesc = document.getElementById('planetDesc');
  const planetM1 = document.getElementById('planetMetric1');
  const planetM2 = document.getElementById('planetMetric2');
  const planetSphere = document.getElementById('planetSphere');

  let activePlanetIdx = 0;

  const selectPlanetNode = (idx) => {
    if (idx === activePlanetIdx) return;
    activePlanetIdx = idx;
    const d = planetData[idx];

    planetNodes.forEach((btn, i) => {
      const active = i === idx;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    if (planetSphere) {
      planetSphere.style.setProperty('--globe-rot', d.rot + 'deg');
    }

    if (planetCopy) {
      planetCopy.classList.add('switching');
      setTimeout(() => {
        if (planetStep) planetStep.textContent = d.step;
        if (planetTitle) planetTitle.textContent = d.title;
        if (planetDesc) planetDesc.textContent = d.desc;
        if (planetM1) {
          planetM1.textContent = d.m1;
          planetM1.nextElementSibling.textContent = d.m1Label;
        }
        if (planetM2) {
          planetM2.textContent = d.m2;
          planetM2.nextElementSibling.textContent = d.m2Label;
        }
        planetCopy.classList.remove('switching');
      }, 240);
    }
  };

  planetNodes.forEach((btn, i) => {
    btn.addEventListener('click', () => selectPlanetNode(i));
  });

  /* ── 9. Section 03 — Carrousel 3D Scroll-Snap (Style Charlie J) ── */
  const track = document.getElementById('carouselTrack');
  const cards = track ? Array.from(track.querySelectorAll('.ccard')) : [];
  const descEl = document.getElementById('carouselDesc');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carPrev');
  const nextBtn = document.getElementById('carNext');

  if (track && cards.length) {
    let activeCardIdx = 2; // On démarre sur la carte centrale (Management)

    // Créer les points de pagination
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === activeCardIdx ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Aller à la formation ' + (i + 1));
      dot.addEventListener('click', () => scrollToCard(i));
      dotsWrap?.appendChild(dot);
    });
    const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.carousel-dot')) : [];

    // Centre une carte dans la piste
    const scrollToCard = (idx, smooth = true) => {
      const clamped = Math.max(0, Math.min(cards.length - 1, idx));
      const card = cards[clamped];
      if (!card) return;
      const targetLeft = card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;
      track.scrollTo({ left: targetLeft, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
    };

    // Calcule les transformations 3D en éventail selon la position de scroll
    const updateCarousel3D = () => {
      const trackRect = track.getBoundingClientRect();
      const centerX = trackRect.left + trackRect.width / 2;
      let closestIdx = 0;
      let minDist = Infinity;

      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const cardCenter = r.left + r.width / 2;
        const delta = (cardCenter - centerX) / (r.width * 0.88); // distance normalisée (-3 .. +3)
        const abs = Math.abs(delta);

        if (abs < minDist) {
          minDist = abs;
          closestIdx = i;
        }

        // Transformation 3D façon éventail AtoBeach
        const ry = Math.max(-38, Math.min(38, delta * -16));
        const rz = Math.max(-8, Math.min(8, delta * 2.2));
        const tz = -Math.min(260, abs * 95);
        const ty = Math.min(36, abs * 10);
        const sc = Math.max(0.78, 1.06 - abs * 0.11);
        const sat = Math.max(0.65, 1.05 - abs * 0.15);
        const bri = Math.max(0.75, 1.02 - abs * 0.1);
        const op = abs > 3.1 ? 0 : Math.max(0.45, 1 - Math.max(0, abs - 2) * 0.45);
        const zi = Math.round(20 - abs * 4);

        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        card.style.setProperty('--rz', rz.toFixed(2) + 'deg');
        card.style.setProperty('--tz', tz.toFixed(1) + 'px');
        card.style.setProperty('--ty', ty.toFixed(1) + 'px');
        card.style.setProperty('--sc', sc.toFixed(3));
        card.style.setProperty('--sat', sat.toFixed(2));
        card.style.setProperty('--bri', bri.toFixed(2));
        card.style.setProperty('--op', op.toFixed(2));
        card.style.setProperty('--zi', String(zi));
      });

      if (closestIdx !== activeCardIdx) {
        activeCardIdx = closestIdx;
        cards.forEach((c, i) => c.classList.toggle('is-center', i === activeCardIdx));
        dots.forEach((d, i) => d.classList.toggle('active', i === activeCardIdx));

        if (descEl) {
          descEl.classList.add('fade');
          const nextText = cards[activeCardIdx].dataset.desc || '';
          setTimeout(() => {
            descEl.textContent = nextText;
            descEl.classList.remove('fade');
          }, 150);
        }
      }
    };

    let rafPending = false;
    track.addEventListener('scroll', () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        updateCarousel3D();
        rafPending = false;
      });
    }, { passive: true });

    window.addEventListener('resize', () => updateCarousel3D());

    // Clic sur une carte : si elle n'est pas au centre, on la centre ; sinon on va au formulaire
    cards.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (i !== activeCardIdx) {
          scrollToCard(i);
        } else {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    prevBtn?.addEventListener('click', () => scrollToCard(activeCardIdx - 1));
    nextBtn?.addEventListener('click', () => scrollToCard(activeCardIdx + 1));

    // Clavier (flèches gauche / droite)
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToCard(activeCardIdx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollToCard(activeCardIdx + 1); }
    });

    // Positionnement initial sur la carte centrale
    requestAnimationFrame(() => {
      scrollToCard(2, false);
      updateCarousel3D();
    });
  }

  /* ── 10. Section 03 — Cours & Corrigés PDF (Expanding Flex Cards) ── */
  const expContainer = document.getElementById('expandingCourses');
  const expCards = expContainer ? Array.from(expContainer.querySelectorAll('.exp-card')) : [];
  if (expCards.length) {
    const activateExpCard = (targetCard) => {
      expCards.forEach(c => c.classList.toggle('is-active', c === targetCard));
    };

    expCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Ne pas bloquer le clic sur les boutons de téléchargement PDF à l'intérieur de la carte active
        if (e.target.closest('a')) return;
        activateExpCard(card);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('a')) return;
          e.preventDefault();
          activateExpCard(card);
        }
      });
    });
  }

  /* ── 11. Section 05 — Forum Académique (Cabine Panoramique 3 Fenêtres) ── */
  const cabinFilters = document.querySelectorAll('.cabin-filter');
  const homeForumFeed = document.getElementById('homeForumFeed');
  const homeForumForm = document.getElementById('homeForumQuickForm');
  const homeForumQuestion = document.getElementById('homeForumQuestion');
  const homeForumMsg = document.getElementById('homeForumMsg');

  cabinFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      cabinFilters.forEach(b => b.classList.toggle('active', b === btn));
      const filter = btn.dataset.filter || 'all';
      if (!homeForumFeed) return;
      homeForumFeed.querySelectorAll('.cabin-fcard').forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });

  homeForumForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = homeForumQuestion?.value.trim() || '';
    if (!q) {
      if (homeForumMsg) homeForumMsg.textContent = 'Veuillez saisir votre question ou sujet de cours BTS.';
      homeForumQuestion?.focus();
      return;
    }
    if (homeForumMsg) {
      homeForumMsg.textContent = '✓ Redirection vers le Forum Académique Étudiant...';
    }
    setTimeout(() => {
      window.location.href = 'etudiant.html?forum_q=' + encodeURIComponent(q);
    }, 450);
  });
});
