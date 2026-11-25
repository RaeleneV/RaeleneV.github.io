/* ============================================
   RAELENE VALESKA DOOKKOO — SHARED SCRIPTS
   ============================================ */

/* ---- LIGHTBOX ---- */
function openLightbox(src, title, subtitle, isVideo) {
  const overlay = document.getElementById('lightbox');
  const mediaWrap = document.getElementById('lightbox-media-wrap');
  mediaWrap.innerHTML = '';

  if (isVideo) {
    const vid = document.createElement('video');
    vid.src      = src;
    vid.controls = true;
    vid.autoplay = true;
    vid.className = 'lightbox-media';
    mediaWrap.appendChild(vid);
  } else {
    const img = document.createElement('img');
    img.src       = src;
    img.alt       = title;
    img.className = 'lightbox-media';
    mediaWrap.appendChild(img);
  }

  /* Use textContent — never innerHTML — for user-visible strings */
  document.getElementById('lightbox-title').textContent    = title;
  document.getElementById('lightbox-subtitle').textContent = subtitle;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  var lb = document.getElementById('lightbox');
  if (!lb) return;                                  // pages without a lightbox (e.g. home)
  lb.classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('lightbox-media-wrap').innerHTML = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ---- VIDEO AUTOPLAY ON HOVER ---- */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.card-media video').forEach(video => {
    const p = video.closest('.card-media');
    p.addEventListener('mouseenter', () => video.play());
    p.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  });

  if (document.getElementById('kanban-board')) loadKanban();
});

/* ---- LIVE KANBAN — VIA VERCEL PROXY ---- */
const COLUMNS = [
  { key: 'Todo',            emoji: '📥', label: 'To-Do'           },
  { key: 'In Progress',     emoji: '🔄', label: 'In Progress'     },
  { key: 'Back Burner',     emoji: '🔥', label: 'Back Burner'     },
  { key: 'Needs Reviewing', emoji: '👀', label: 'Needs Reviewing'  },
  { key: 'Done',            emoji: '✅', label: 'Done'            },
];

async function loadKanban() {
  const PROXY_URL = 'https://kanban-proxy.vercel.app/api/kanban';

  try {
    /* Send an empty POST — the proxy ignores the body and uses its own hardcoded query */
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (data.errors) throw new Error(data.errors[0].message);

    const items = data.data.user.projectV2.items.nodes;
    const grouped = {};
    COLUMNS.forEach(c => grouped[c.key] = []);

    items.forEach(item => {
      const title = item.content?.title;
      if (!title) return;
      const status = item.fieldValues.nodes
        .find(f => f.field?.name === 'Status')?.name || 'Todo';
      if (grouped[status] !== undefined) grouped[status].push(title);
    });

    renderKanban(grouped);

  } catch (err) {
    console.warn('Kanban load failed:', err.message);
    document.getElementById('kanban-loading').style.display = 'none';
    document.getElementById('kanban-error').style.display   = 'block';
  }
}

function renderKanban(grouped) {
  const board   = document.getElementById('kanban-board');
  const loading = document.getElementById('kanban-loading');
  loading.style.display = 'none';
  board.style.display   = 'grid';

  /* Build each column using DOM methods — no raw HTML injection */
  board.innerHTML = '';

  COLUMNS.forEach(col => {
    const cards = grouped[col.key] || [];

    /* Column wrapper */
    const colEl = document.createElement('div');

    /* Column header */
    const header = document.createElement('div');
    header.style.cssText = `font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;
      font-weight:500;color:var(--navy);padding-bottom:0.75rem;
      border-bottom:2px solid var(--crimson);margin-bottom:0.75rem;`;

    /* Label — set via textContent, not innerHTML */
    const labelSpan = document.createElement('span');
    labelSpan.textContent = `${col.emoji} ${col.label}`;

    /* Count badge */
    const badge = document.createElement('span');
    badge.style.cssText = `float:right;background:var(--paper-warm);border-radius:10px;
      padding:1px 7px;font-size:0.65rem;color:var(--ink-muted);`;
    badge.textContent = cards.length;

    header.appendChild(labelSpan);
    header.appendChild(badge);
    colEl.appendChild(header);

    if (cards.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'font-size:0.75rem;color:var(--crimson-soft);font-style:italic;padding:0.4rem 0;';
      empty.textContent = 'Empty';
      colEl.appendChild(empty);
    } else {
      cards.forEach(title => {
        const card = document.createElement('div');
        card.style.cssText = `background:var(--white);border:1px solid var(--rule);
          border-radius:2px;padding:0.6rem 0.75rem;font-size:0.78rem;
          color:var(--ink-mid);margin-bottom:0.5rem;line-height:1.4;`;
        /* textContent is XSS-safe — no escaping function needed */
        card.textContent = title;
        colEl.appendChild(card);
      });
    }

    board.appendChild(colEl);
  });
}

/* =========================================================
   MOBILE BURGER MENU + PARALLAX + SCROLL REVEAL
   >>> Paste at the very END of scripts.js <<<
   Everything is injected by JS, so no HTML changes are needed.
   ========================================================= */
(function () {
  'use strict';

  var BURGER_BP = 860;   // keep in sync with the media query in style.css
  var reduceMotion = window.matchMedia &&
                     window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. BURGER MENU ---------- */
  function initBurger() {
    var nav   = document.querySelector('nav');
    var links = nav && nav.querySelector('.nav-links');
    if (!nav || !links || nav.querySelector('.nav-burger')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-burger';
    btn.setAttribute('aria-label', 'Toggle menu');
    btn.setAttribute('aria-expanded', 'false');
    links.id = links.id || 'primary-nav';
    btn.setAttribute('aria-controls', links.id);
    for (var i = 0; i < 3; i++) btn.appendChild(document.createElement('span'));
    nav.appendChild(btn);

    function isMobile() { return window.innerWidth <= BURGER_BP; }

    function setOpen(open) {
      nav.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) {
        links.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
          d.classList.remove('open');
        });
      }
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains('nav-open'));
    });

    /* Portfolio sub-menu: tap to expand (mobile only; desktop keeps hover) */
    links.querySelectorAll('.nav-dropdown-toggle').forEach(function (t) {
      t.setAttribute('role', 'button');
      t.setAttribute('tabindex', '0');
      function toggle(e) {
        if (!isMobile()) return;
        e.preventDefault();
        var li = t.parentElement;
        li.classList.toggle('open');
        t.setAttribute('aria-expanded', li.classList.contains('open') ? 'true' : 'false');
      }
      t.addEventListener('click', toggle);
      t.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') toggle(e);
      });
    });

    /* Close the panel after choosing a real link */
    links.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (a && !a.classList.contains('nav-dropdown-toggle') && isMobile()) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('nav-open') && !nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function () { if (!isMobile()) setOpen(false); });
  }

  /* ---------- 2. PARALLAX ---------- */
  /* speed > 0 : drifts slower than the page (feels far away)
     speed < 0 : drifts faster than the page (feels close)      */
  var SHAPES = [
    { cls: 'p-ring',  speed:  0.18 },
    { cls: 'p-dot',   speed: -0.12 },
    { cls: 'p-block', speed:  0.30 },
    { cls: 'p-lines', speed: -0.06 }
  ];

  var items = [];
  var heroEl = null;
  var ticking = false;

  function addLayer(host, dark) {
    if (!host || host.querySelector(':scope > .parallax-layer')) return;
    host.classList.add('has-parallax');
    var layer = document.createElement('div');
    layer.className = 'parallax-layer' + (dark ? ' is-dark' : '');
    layer.setAttribute('aria-hidden', 'true');
    SHAPES.forEach(function (s) {
      var el = document.createElement('div');
      el.className = 'p-shape ' + s.cls;
      el.dataset.speed = s.speed;
      layer.appendChild(el);
    });
    host.insertBefore(layer, host.firstChild);
  }

  /* Wrap the hero so the shapes can sit behind it */
  function initHeroStage() {
    var hero = document.querySelector('.hero-section');
    if (!hero || hero.parentNode.classList.contains('hero-stage')) return null;
    var stage = document.createElement('div');
    stage.className = 'hero-stage';
    hero.parentNode.insertBefore(stage, hero);
    stage.appendChild(hero);
    addLayer(stage, false);
    return hero;
  }

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var scale = window.innerWidth < 768 ? 0.5 : 1;   // gentler on phones

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var r = it.host.getBoundingClientRect();
      if (r.bottom < -150 || r.top > vh + 150) continue;      // off-screen: skip
      var offset = (r.top + r.height / 2) - vh / 2;           // 0 when host is centred
      var y = -offset * it.speed * scale;
      it.el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
    }

    /* Hero text drifts down a touch and softly fades as you leave it */
    if (heroEl) {
      var sr = heroEl.parentNode.getBoundingClientRect();     // measure the un-moved wrapper
      var p = Math.min(Math.max(-sr.top / (sr.height * 0.9), 0), 1);
      heroEl.style.transform = 'translate3d(0,' + (p * 30).toFixed(1) + 'px,0)';
      heroEl.style.opacity = (1 - p * 0.7).toFixed(2);
    }
  }

  function requestUpdate() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  function initParallax() {
    if (reduceMotion) return;
    heroEl = initHeroStage();
    addLayer(document.querySelector('#work'), true);          // "What I do" section
    addLayer(document.querySelector('.year-banner'), true);   // year pages
    items = Array.prototype.slice.call(document.querySelectorAll('.p-shape')).map(function (el) {
      return { el: el, host: el.closest('.has-parallax'), speed: parseFloat(el.dataset.speed) || 0 };
    });
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
  }

  /* ---------- 3. SCROLL REVEAL ---------- */
  var REVEAL = [
    '.section-label', '.section-title',
    '.about-aside > div', '.about-text p',
    '.project-card',
    '#work .section-inner > div:last-child > div',
    '#skills .section-inner > div:last-child > div',
    '.contact-link'
  ].join(',');

  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll(REVEAL);
    if (!els.length) return;
    document.documentElement.classList.add('js-reveal');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-visible');
        io.unobserve(el);
        /* Hand the element back to its normal styles once it has animated in,
           so hover effects and transitions behave exactly as before */
        setTimeout(function () {
          el.classList.remove('reveal', 'is-visible');
          el.style.removeProperty('--d');
        }, 1200);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    var counts = new Map();
    Array.prototype.forEach.call(els, function (el) {
      if (el.closest('.hero-section')) return;                // hero is already on screen
      var group = el.parentElement.tagName === 'A' ? el.parentElement.parentElement : el.parentElement;
      var n = counts.get(group) || 0;
      counts.set(group, n + 1);
      el.style.setProperty('--d', Math.min(n, 6) * 70 + 'ms'); // stagger siblings
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  function init() { initBurger(); initParallax(); initReveal(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
