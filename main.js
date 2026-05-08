/* ═══════════════════════════════════════════════════════════════════════
   PORTFOLIO — MAIN.JS
   Animations: GSAP + ScrollTrigger + TextPlugin
   ═══════════════════════════════════════════════════════════════════════ */

// ── GSAP PLUGINS ──────────────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ── STATE ─────────────────────────────────────────────────────────────────
const state = {
  theme: 'dark',
  menuOpen: false,
};

// ── HELPERS ───────────────────────────────────────────────────────────────
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];

// ═══════════════════════════════════════════════════════════════════════════
// 1. LOADER
// ═══════════════════════════════════════════════════════════════════════════
function initLoader() {
  const loader    = qs('#loader');
  const numEl     = qs('#loader-num');
  const fillEl    = qs('.loader-fill');
  let   progress  = 0;
  let   raf;

  function tick() {
    // Ease-in-out style increment
    const remaining = 100 - progress;
    progress += Math.max(0.4, remaining * 0.04);
    if (progress >= 100) progress = 100;

    numEl.textContent  = Math.floor(progress);
    fillEl.style.width = progress + '%';

    if (progress < 100) {
      raf = requestAnimationFrame(tick);
    } else {
      // Done — slide out
      setTimeout(hideLoader, 180);
    }
  }

  function hideLoader() {
    gsap.to(loader, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => {
        loader.style.display = 'none';
        initHeroAnimations();
      }
    });
  }

  raf = requestAnimationFrame(tick);
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════════════════════
function initCursor() {
  const dot  = qs('#cursor-dot');
  const ring = qs('#cursor-ring');
  let mx = 0, my = 0; // mouse
  let rx = 0, ry = 0; // ring (lerped)

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  function lerpRing() {
    // Lag the ring behind the dot for satisfying feel
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerpRing);
  }
  lerpRing();

  // Hover state for interactive elements
  const hoverTargets = 'a, button, .project-card, input, textarea, select, .filter-btn';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. HERO CANVAS — Particle Field
// ═══════════════════════════════════════════════════════════════════════════
function initHeroCanvas() {
  const canvas  = qs('#hero-canvas');
  const ctx     = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    spawnParticles();
  }

  function spawnParticles() {
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.8 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Connection lines
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q   = particles[j];
        const dx  = p.x - q.x;
        const dy  = p.y - q.y;
        const d   = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          const theme = document.documentElement.getAttribute('data-theme');
          const alpha = (1 - d / 110) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = theme === 'light'
            ? `rgba(100,80,200,${alpha})`
            : `rgba(124,110,255,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    // Dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124,110,255,${p.alpha})`;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. TYPEWRITER
// ═══════════════════════════════════════════════════════════════════════════
function initTypewriter() {
  const words   = [
    'digital experiences.',
    'pixel-perfect UIs.',
    'intuitive products.',
    'things that last.',
    'with intention.',
  ];
  const el  = qs('#typewriter');
  let wi    = 0;
  let ci    = 0;
  let deleting = false;
  let wait  = 2000;

  function type() {
    const word = words[wi];

    if (deleting) {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
        wait = 300;
      }
      setTimeout(type, deleting ? 40 : wait);
    } else {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length) {
        deleting = true;
        setTimeout(type, wait);
      } else {
        setTimeout(type, 60);
      }
    }
  }

  type();
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. HERO GSAP ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════
function initHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero-badge',        { opacity: 0, y: 20, duration: 0.7, delay: 0.1 })
    .from('.hero-name',         { opacity: 0, y: 60, duration: 0.9 }, '-=0.3')
    .from('.hero-title-wrap',   { opacity: 0, y: 30, duration: 0.7 }, '-=0.5')
    .from('.hero-desc',         { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    .from('.hero-cta',          { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    .from('.hero-stats',        { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
    .from('.hero-scroll',       { opacity: 0, duration: 0.6 }, '-=0.2')
    .from('.pill', {
        opacity: 0,
        x: 20,
        stagger: 0.1,
        duration: 0.5
      }, '-=0.4');

  initTypewriter();
  initCounters();
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. ANIMATED COUNTERS
// ═══════════════════════════════════════════════════════════════════════════
function initCounters() {
  qsa('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    gsap.to(el, {
      textContent: target,
      duration: 2,
      delay: 0.6,
      ease: 'power2.out',
      snap: { textContent: 1 },
      onUpdate() { el.textContent = Math.floor(parseFloat(el.textContent)); }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. SCROLL-TRIGGERED ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════
function initScrollAnimations() {
  // Generic "fade up on scroll" for sections
  qsa('[id]').forEach(section => {
    const children = qsa('h2, p, .section-label, .about-text, .contact-sub', section);
    if (!children.length) return;

    gsap.from(children, {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true,
      },
      opacity: 0,
      y: 30,
      stagger: 0.08,
      duration: 0.7,
      ease: 'power2.out',
    });
  });

  // About image
  gsap.from('.about-img-wrap', {
    scrollTrigger: { trigger: '#about', start: 'top 70%', once: true },
    opacity: 0,
    x: -40,
    duration: 0.9,
    ease: 'power3.out',
  });

  // Float badges
  gsap.from('.float-badge', {
    scrollTrigger: { trigger: '#about', start: 'top 70%', once: true },
    opacity: 0,
    scale: 0.8,
    stagger: 0.2,
    duration: 0.6,
    ease: 'back.out(2)',
  });

  // Progress bars
  ScrollTrigger.create({
    trigger: '.progress-list',
    start: 'top 80%',
    once: true,
    onEnter() {
      qsa('.progress-fill').forEach(fill => {
        fill.style.width = fill.dataset.width + '%';
      });
    }
  });

  // Project cards stagger
gsap.from('.project-card', {
  scrollTrigger: { trigger: '#work', start: 'top 90%', once: true },
  opacity: 0,
  y: 40,
  stagger: 0.1,
  duration: 0.7,
  ease: 'power2.out',
  clearProps: 'all',
});

  // Process steps
  qsa('.process-step').forEach((step, i) => {
    gsap.from(step, {
      scrollTrigger: { trigger: step, start: 'top 82%', once: true },
      opacity: 0,
      x: -30,
      duration: 0.7,
      delay: i * 0.05,
      ease: 'power2.out',
    });
  });

  // Services
  gsap.from('.service-card', {
    scrollTrigger: { trigger: '#services', start: 'top 95%', once: true },
    opacity: 0,
    y: 40,
    stagger: 0.12,
    duration: 0.7,
    ease: 'power2.out',
  });

  // Contact form
  gsap.from('.contact-form', {
    scrollTrigger: { trigger: '#contact', start: 'top 70%', once: true },
    opacity: 0,
    x: 40,
    duration: 0.8,
    ease: 'power2.out',
  });

  gsap.from('.contact-left > *', {
    scrollTrigger: { trigger: '#contact', start: 'top 70%', once: true },
    opacity: 0,
    x: -30,
    stagger: 0.1,
    duration: 0.6,
    ease: 'power2.out',
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. NAV SCROLL BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════
function initNav() {
  const nav = qs('#nav');

  ScrollTrigger.create({
    start: 'top -60',
    onUpdate(self) {
      nav.classList.toggle('scrolled', self.progress > 0);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. MOBILE MENU
// ═══════════════════════════════════════════════════════════════════════════
function initMobileMenu() {
  const btn  = qs('#hamburger');
  const menu = qs('#mobile-menu');

  function toggle() {
    state.menuOpen = !state.menuOpen;
    btn.classList.toggle('open', state.menuOpen);
    menu.classList.toggle('open', state.menuOpen);
    document.body.style.overflow = state.menuOpen ? 'hidden' : '';
  }

  btn.addEventListener('click', toggle);

  qsa('.mm-link').forEach(link => {
    link.addEventListener('click', () => {
      if (state.menuOpen) toggle();
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. THEME TOGGLE
// ═══════════════════════════════════════════════════════════════════════════
function initTheme() {
  const btn = qs('#theme-toggle');

  // Check saved preference
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  setTheme(saved);

  btn.addEventListener('click', () => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('portfolio-theme', next);
  });

  function setTheme(t) {
    state.theme = t;
    document.documentElement.setAttribute('data-theme', t);
    btn.querySelector('.theme-icon').textContent = t === 'dark' ? '◐' : '◑';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. PROJECT FILTERS
// ═══════════════════════════════════════════════════════════════════════════
function initFilters() {
  const btns = qsa('.filter-btn');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards  = qsa('.project-card');

      cards.forEach((card, i) => {
        const match = filter === 'all' || card.dataset.category === filter;

        if (match) {
          card.classList.remove('filtered-out');
          card.classList.add('filtered-in');
          gsap.to(card, {
            opacity: 1,
            scale: 1,
            filter: 'grayscale(0)',
            duration: 0.4,
            delay: i * 0.04,
            ease: 'power2.out',
          });
        } else {
          card.classList.add('filtered-out');
          card.classList.remove('filtered-in');
          gsap.to(card, {
            opacity: 0.1,
            scale: 0.96,
            filter: 'grayscale(0.8)',
            duration: 0.35,
            ease: 'power2.inOut',
          });
        }
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. PROJECT DATA — Bijit Kandel's Real Projects
//     modalType: 'website' | 'live' | 'mobile' | 'brand'
//     website  → scrollable screenshot (add project1.png etc.)
//     live     → loads real URL in iframe
//     mobile   → photo slider (add hirynn1.png, hirynn2.png etc.)
//     brand    → 2×2 gallery (add brand1.png, brand2.png etc.)
// ═══════════════════════════════════════════════════════════════════════════
const projectData = {
  1: {
    title:     'Bosscoder Academy',
    modalType: 'website',
    image:     'project1.png',        // ← screenshot of bosscoder website
    url:       'www.bosscoder.in',
    liveUrl:   '#',                   // ← add live URL if available
    tags:      ['UI Design', 'Development', 'EdTech', 'React'],
    emoji:     '🎓',
    problem:   'Bosscoder Academy needed a compelling, conversion-optimised website that communicated their program\'s value to ambitious developers targeting FAANG companies. The existing page lacked trust signals and had a high bounce rate on mobile.',
    solution:  'Designed and developed a fully responsive website with structured program sections, alumni success stories, corporate logos, and a clear CTA hierarchy. Built with performance-first principles — fast load, smooth scroll, and conversion-tested layouts.',
    result:    [
      { value: '40%',  label: 'Increase in Applications' },
      { value: '3×',   label: 'Mobile Engagement' },
      { value: '100+', label: 'Successful Alumni' },
    ]
  },
  2: {
    title:     'Furniro — Furniture E-Commerce',
    modalType: 'website',
    image:     'project2.png',        // ← screenshot of furniro UI
    url:       'www.furniro.design',
    liveUrl:   '#',
    tags:      ['UI Design', 'E-Commerce', 'Figma', 'Prototyping'],
    emoji:     '🛋️',
    problem:   'Furniro needed a premium e-commerce UI that elevated their furniture brand beyond a generic shop template. Product pages needed to inspire confidence and reduce decision fatigue in a high-consideration purchase category.',
    solution:  'Designed a clean, editorial-style UI in Figma. Rich product pages with multiple views, a smart filter sidebar, persistent cart drawer, and a streamlined 3-step checkout. Typography and whitespace used intentionally to communicate premium quality.',
    result:    [
      { value: '35%',  label: 'Checkout Completion Rate' },
      { value: '2.4×', label: 'Time on Product Pages' },
      { value: '4.8★', label: 'Design Review Score' },
    ]
  },
  3: {
    title:     'Gyann App',
    modalType: 'live',
    image:     '',
    url:       'www.gyannapp.com',
    liveUrl:   'https://www.gyannapp.com',   // ← LIVE — opens in iframe
    tags: ['UI Design', 'EdTech', 'Live Website', 'React'],
    emoji:     '📚',
    problem:   'Students needed a focused, distraction-free platform to learn their subjects through structured video lessons and test their knowledge with MCQ-based exams — without the noise of general-purpose platforms like YouTube.',
    solution:  'Built and launched Gyann App — a subject-specific learning platform with curated video content, chapter-wise structure, and an interactive MCQ exam system. Clean UI, fast load times, and mobile-responsive from day one.',
    result:    [
      { value: 'Live', label: 'Production Platform' },
      { value: '100%', label: 'Mobile Responsive' },
      { value: 'MCQ',  label: 'Interactive Exam System' },
    ]
  },
  4: {
    title:     'Hirynn — Teacher Job App',
    modalType: 'mobile',
    // Add your Hirynn screenshots: hirynn1.png, hirynn2.png, hirynn3.png, hirynn4.png
    photos:    ['hirynn1.png', 'hirynn2.png', 'hirynn3.png', 'hirynn4.png'],
    url:       'Hirynn Mobile App',
    liveUrl:   '#',
    tags:      ['Mobile App', 'UI/UX', 'Job Platform', 'Figma'],
    emoji:     '👨‍🏫',
    problem:   'Finding teaching jobs in Nepal was fragmented — teachers relied on word-of-mouth while schools had no centralised way to post openings. Both sides were losing time with an inefficient, offline process.',
    solution:  'Designed Hirynn — a dual-sided mobile app where teachers browse job listings, filter by subject and location, and apply in one tap. Schools get a dashboard to post jobs and manage applicants. Clean onboarding, fast search, and intuitive navigation designed for first-time smartphone users.',
    result:    [
      { value: '2×',   label: 'Faster Job Applications' },
      { value: 'Dual', label: 'Teacher & School Portals' },
      { value: '4.7★', label: 'Design Prototype Rating' },
    ]
  },
  5: {
    title:     'Brand Identity Creation',
    modalType: 'brand',
    // Add your brand images: brand1.png, brand2.png, brand3.png, brand4.png
    photos:    ['brand1.png', 'brand2.png', 'brand3.png', 'brand4.png'],
    url:       'Logo & Brand Design',
    liveUrl:   '#',
    tags:      ['Branding', 'Logo Design', 'Figma', 'Visual Identity'],
    emoji:     '✦',
    problem:   'Multiple clients — from startups to local businesses — needed professional brand identities that stood out, built trust, and communicated their values at a glance. Most had no visual identity at all.',
    solution:  'Designed logo systems, colour palettes, typography stacks, and usage guidelines for each client. Every identity was rooted in strategy — understanding the audience, the market, and the story the brand needed to tell before a single shape was drawn.',
    result:    [
      { value: '10+',  label: 'Brand Identities Created' },
      { value: '100%', label: 'Client Satisfaction' },
      { value: '3×',   label: 'Average Brand Recall Lift' },
    ]
  },
  6: {
    title:     'Personal Portfolio — Design to Code',
    modalType: 'website',
    image:     'project6.png',        // ← screenshot of this portfolio
    url:       'www.bijitkandel.com',
    liveUrl:   '#',
    tags:      ['UI Design', 'Development', 'GSAP', 'HTML/CSS/JS'],
    emoji:     '🌟',
    problem:   'Most developer portfolios are either beautifully designed but static, or functional but visually forgettable. The goal was to build one that impressed in the first 3 seconds and proved both design and development skills without saying a word.',
    solution:  'Designed the entire UI in Figma first — layout, typography, motion principles — then coded it from scratch using HTML, CSS, and JavaScript with GSAP for all animations. Custom cursor, particle canvas, scroll-triggered reveals, and a browser-preview modal system built entirely by hand.',
    result:    [
      { value: '100%', label: 'Hand-coded, No Framework' },
      { value: 'GSAP', label: 'Animation Engine' },
      { value: '98',   label: 'Performance Score' },
    ]
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 12b. MODAL — Handles 4 types: website / live / mobile / brand
// ═══════════════════════════════════════════════════════════════════════════
function initModal() {
  const overlay = qs('#modal-overlay');
  const modal   = qs('#modal');

  // ── Build LEFT preview panel based on modalType ──────────────────────
  function buildPreview(p) {
    switch (p.modalType) {

      // LIVE — embed real website in iframe
      case 'live':
        return `
          <div class="modal-preview" style="position:relative;">
            <div class="modal-live-loading" id="live-loading">
              <div class="loading-spinner"></div>
              <p>Loading ${p.url}...</p>
            </div>
            <iframe
              src="${p.liveUrl}"
              class="modal-live-frame"
              title="${p.title}"
              sandbox="allow-scripts allow-same-origin allow-forms"
              onload="document.getElementById('live-loading').classList.add('hidden')"
            ></iframe>
          </div>`;

      // MOBILE — swipeable photo slider
      case 'mobile': {
        const photos = p.photos || [];
        const slides = photos.map((src, i) => `
          <div class="modal-slide">
            <img
              src="${src}"
              alt="${p.title} screen ${i+1}"
              onerror="this.parentElement.innerHTML='<div class=modal-slide-placeholder><div class=ph-emoji>${p.emoji}</div><p>Add ${src}<br>to your folder</p></div>'"
            />
          </div>
        `).join('');

        const dots = photos.map((_, i) =>
          `<div class="slider-dot${i===0?' active':''}" data-idx="${i}"></div>`
        ).join('');

        return `
          <div class="modal-preview" style="position:relative;">
            <div class="modal-photo-slider" id="photo-slider">
              ${slides || `<div class="modal-slide"><div class="modal-slide-placeholder"><div class="ph-emoji">${p.emoji}</div><p>Add your app screenshots<br>as hirynn1.png, hirynn2.png…<br>to your folder</p></div></div>`}
            </div>
            ${photos.length > 1 ? `
            <div class="slider-arrows">
              <button class="slider-arrow" id="slide-prev">‹</button>
              <button class="slider-arrow" id="slide-next">›</button>
            </div>
            <div class="slider-dots" id="slider-dots">${dots}</div>` : ''}
          </div>`;
      }

      // BRAND — 2×2 gallery grid
      case 'brand': {
        const photos = p.photos || [];
        const items = (photos.length ? photos : ['','','','']).map((src, i) => {
          const emojis = ['✦','◈','⬡','⬟'];
          return src
            ? `<div class="brand-gallery-item"><img src="${src}" alt="Brand ${i+1}"
                 onerror="this.parentElement.innerHTML='<div class=brand-placeholder style=display:flex;align-items:center;justify-content:center;height:100%;gap:8px;flex-direction:column>${emojis[i]||'✦'}<span style=font-size:11px;color:var(--text3);font-family:var(--font-mono)>Add brand${i+1}.png</span></div>'"
               /></div>`
            : `<div class="brand-gallery-item brand-placeholder">
                 <span style="font-size:32px">${emojis[i]||'✦'}</span>
                 <span>Add brand${i+1}.png</span>
               </div>`;
        }).join('');
        return `<div class="modal-preview"><div class="modal-brand-gallery">${items}</div></div>`;
      }

      // WEBSITE — scrollable screenshot (default)
      default:
        return `
          <div class="modal-preview">
            <div class="modal-preview-inner">
              ${p.image
                ? `<img src="${p.image}" alt="${p.title}" class="modal-preview-img"
                     onerror="this.parentElement.innerHTML='<div class=modal-preview-placeholder><div class=placeholder-emoji>${p.emoji}</div><p>Add ${p.image} to your folder</p></div>'" />`
                : `<div class="modal-preview-placeholder">
                     <div class="placeholder-emoji">${p.emoji}</div>
                     <p>Save your screenshot as <strong>${p.image||'project.png'}</strong><br>in your portfolio folder</p>
                   </div>`}
            </div>
            ${p.image ? `<div class="modal-scroll-hint"><div class="sh-arrow">↓</div><span>scroll to explore</span></div>` : ''}
          </div>`;
    }
  }

  // ── Open modal ───────────────────────────────────────────────────────
  function open(id) {
    const p = projectData[id];
    if (!p) return;

    modal.innerHTML = `
      <div class="modal-browser-bar">
        <div class="modal-browser-dots"><span></span><span></span><span></span></div>
        <div class="modal-browser-url">${p.url || 'project'}</div>
        ${p.liveUrl && p.liveUrl !== '#'
          ? `<a href="${p.liveUrl}" target="_blank" class="modal-live-link">
               ↗ Open Live
             </a>`
          : ''}
        <button class="modal-close" id="modal-close">✕</button>
      </div>

      <div class="modal-body">
        ${buildPreview(p)}

        <div class="modal-info">
          <h2>${p.title}</h2>
          <div class="modal-tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>

          <div class="modal-section">
            <h4>The Problem</h4>
            <p>${p.problem}</p>
          </div>
          <div class="modal-section">
            <h4>The Solution</h4>
            <p>${p.solution}</p>
          </div>
          <div class="modal-section">
            <h4>Results</h4>
            <div class="modal-results">
              ${p.result.map(r => `
                <div class="result-stat">
                  <strong>${r.value}</strong>
                  <span>${r.label}</span>
                </div>`).join('')}
            </div>
          </div>

          ${p.liveUrl && p.liveUrl !== '#'
            ? `<a href="${p.liveUrl}" target="_blank" class="modal-visit-btn">
                 Visit Live Site
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                 </svg>
               </a>`
            : ''}
        </div>
      </div>`;

    // Bind close
    qs('#modal-close').addEventListener('click', close);

    // Mobile photo slider controls
    if (p.modalType === 'mobile' && (p.photos||[]).length > 1) {
      initSlider();
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // ── Slider logic ─────────────────────────────────────────────────────
  function initSlider() {
    const slider = qs('#photo-slider');
    const dots   = qsa('.slider-dot');
    let   cur    = 0;

    function goTo(idx) {
      cur = Math.max(0, Math.min(idx, dots.length - 1));
      slider.scrollTo({ left: cur * slider.offsetWidth, behavior: 'smooth' });
      dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    }

    const prev = qs('#slide-prev');
    const next = qs('#slide-next');
    if (prev) prev.addEventListener('click', () => goTo(cur - 1));
    if (next) next.addEventListener('click', () => goTo(cur + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    // Swipe support
    let startX = 0;
    slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
    slider.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? cur + 1 : cur - 1);
    });
  }

  // ── Close ────────────────────────────────────────────────────────────
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  qsa('.project-open').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); open(btn.dataset.id); });
  });

  qsa('.project-card').forEach(card => {
    card.addEventListener('click', () => open(card.dataset.id));
  });

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. CONTACT FORM
// ═══════════════════════════════════════════════════════════════════════════
function initForm() {
  const form    = qs('#contact-form');
  const success = qs('#form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending...';

    // Simulate send (replace with real API call)
    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Send Message';
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1500);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 14. SMOOTH ACTIVE NAV HIGHLIGHTING
// ═══════════════════════════════════════════════════════════════════════════
function initActiveNav() {
  const sections = qsa('section[id]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        qsa('.nav-links a').forEach(a => {
          a.style.color = a.getAttribute('href') === `#${id}`
            ? 'var(--text)'
            : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ═══════════════════════════════════════════════════════════════════════════
// 15. PARALLAX ON SCROLL (light hero parallax)
// ═══════════════════════════════════════════════════════════════════════════
function initParallax() {
  gsap.to('#hero-canvas', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
    y: 80,
    ease: 'none',
  });

  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
    y: 50,
    opacity: 0,
    ease: 'none',
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 16. MAGNETIC BUTTONS
// ═══════════════════════════════════════════════════════════════════════════
function initMagnetic() {
  qsa('.btn-primary, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.2;
      const dy = (e.clientY - cy) * 0.2;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 17. SECTION PROGRESS LINE ANIMATION
// ═══════════════════════════════════════════════════════════════════════════
function initProcessLine() {
  gsap.from('.process-line', {
    scrollTrigger: {
      trigger: '.process-timeline',
      start: 'top 80%',
      end: 'bottom 60%',
      scrub: 1,
    },
    scaleY: 0,
    transformOrigin: 'top center',
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// INIT — Wait for DOM, then wire everything up
// ═══════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initLoader();          // Must run first; triggers hero anims on complete
  initCursor();
  initHeroCanvas();
  initTheme();
  initNav();
  initMobileMenu();
  initScrollAnimations();
  initFilters();
  initModal();
  initForm();
  initActiveNav();
  initParallax();
  initMagnetic();
  initProcessLine();
});
