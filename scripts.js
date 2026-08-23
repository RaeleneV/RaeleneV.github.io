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
  document.getElementById('lightbox').classList.remove('open');
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
  const PROXY_URL = 'https://kanban-proxy-k2g3dmkef-rvd1.vercel.app/api/kanban';

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
      font-weight:500;color:var(--ink-mid);padding-bottom:0.75rem;
      border-bottom:2px solid var(--rule);margin-bottom:0.75rem;`;

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
      empty.style.cssText = 'font-size:0.75rem;color:var(--rule);font-style:italic;padding:0.4rem 0;';
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
