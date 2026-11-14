'use strict';
// ================= Profil: garis waktu dan logo interaktif =================

(function () {
  const Site = window.Site;
  if (!Site) return;
  const { $, $$ } = Site;

  // ---------- garis waktu terisi mengikuti scroll ----------
  const timeline = $('.timeline');
  if (timeline && window.gsap) {
    const fill = $('.timeline__fill', timeline);
    const items = $$('.tl-item', timeline);
    if (Site.motion) {
      gsap.to(fill, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 62%', end: 'bottom 62%', scrub: 0.6 },
      });
      items.forEach((it) => {
        ScrollTrigger.create({
          trigger: it,
          start: 'top 62%',
          onEnter: () => it.classList.add('is-active'),
          onLeaveBack: () => it.classList.remove('is-active'),
        });
      });
    } else {
      gsap.set(fill, { scaleY: 1 });
      items.forEach((it) => it.classList.add('is-active'));
    }
  }

  // ---------- titik pada logo terhubung dengan daftar penjelasan ----------
  const map = $('.logo-map');
  const list = $('.logo-parts');
  if (map && list) {
    const spots = $$('.hotspot', map);
    const parts = $$('[data-part]', list);
    const set = (key) => {
      spots.forEach((s) => s.classList.toggle('is-active', s.dataset.part === key));
      parts.forEach((p) => p.classList.toggle('is-active', p.dataset.part === key));
    };
    [...spots, ...parts].forEach((el) => {
      el.addEventListener('mouseenter', () => set(el.dataset.part));
      el.addEventListener('focus', () => set(el.dataset.part));
      el.addEventListener('click', () => set(el.dataset.part));
    });
    map.addEventListener('mouseleave', () => set(null));
    list.addEventListener('mouseleave', () => set(null));
  }
})();
