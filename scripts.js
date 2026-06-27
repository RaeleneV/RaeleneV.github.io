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
    vid.src = src;
    vid.controls = true;
    vid.autoplay = true;
    vid.className = 'lightbox-media';
    mediaWrap.appendChild(vid);
  } else {
    const img = document.createElement('img');
    img.src = src;
    img.alt = title;
    img.className = 'lightbox-media';
    mediaWrap.appendChild(img);
  }

  document.getElementById('lightbox-title').textContent = title;
  document.getElementById('lightbox-subtitle').textContent = subtitle;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  const mediaWrap = document.getElementById('lightbox-media-wrap');
  mediaWrap.innerHTML = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
});

/* ---- VIDEO AUTOPLAY ON HOVER ---- */
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.card-media video').forEach(function(video) {
    const parent = video.closest('.card-media');
    parent.addEventListener('mouseenter', function() { video.play(); });
    parent.addEventListener('mouseleave', function() { video.pause(); video.currentTime = 0; });
  });
});
