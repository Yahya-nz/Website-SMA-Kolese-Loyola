'use strict';
// ================= Kegiatan: geser horizontal saat discroll =================

(function () {
  const Site = window.Site;
  if (!Site || !window.gsap) return;
  const { $, $$ } = Site;

  const section = $('.hscroll');
  if (!section) return;
  const track = $('.hscroll__track', section);
  const bar = $('.hscroll__bar i', section);
  const count = $('.hscroll__count b', section);
  const panels = $$('.act', track);

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-horizontal');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (bar) bar.style.transform = `scaleX(${self.progress})`;
          if (count) count.textContent = String(Math.round(self.progress * (panels.length - 1)) + 1).padStart(2, '0');
        },
      },
    });

    // foto di tiap panel ikut bergeser pelan
    panels.forEach((panel) => {
      const img = $('.act__media img', panel);
      if (!img) return;
      gsap.fromTo(img, { xPercent: -6 }, {
        xPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: panel, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
      });
    });

    return () => {
      section.classList.remove('is-horizontal');
      if (bar) bar.style.transform = '';
    };
  });

  ScrollTrigger.refresh();
})();
