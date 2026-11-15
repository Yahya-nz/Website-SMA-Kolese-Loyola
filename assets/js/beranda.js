'use strict';
// ================= Beranda: hero, panel jelajahi =================

(function () {
  const Site = window.Site;
  if (!Site) return;
  const { $, $$ } = Site;

  // ---------- animasi pembuka hero ----------
  const hero = $('.hero');
  if (hero && Site.motion) {
    const lines = $$('.hero__title .line__inner', hero);
    const words = $$('.tg', hero);
    const fades = $$('.hero-anim', hero);
    const arch = $('.arch', hero);
    const archImg = $('.arch__img', hero);
    const squiggle = $('.squiggle path', hero);

    gsap.set(lines, { y: 0, yPercent: 110 });
    gsap.set(words, { autoAlpha: 0, y: 34, rotate: 8 });
    gsap.set(fades, { autoAlpha: 0, y: 28 });
    gsap.set(arch, { clipPath: 'inset(100% 0% 0% 0%)' });
    let len = 0;
    if (squiggle) {
      len = squiggle.getTotalLength();
      gsap.set(squiggle, { strokeDasharray: len, strokeDashoffset: len });
    }

    Site.onReady(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      // clip-path dilepas setelah selesai supaya bayangan bingkai tidak terpotong jadi kotak
      tl.to(lines, { yPercent: 0, duration: 1.25, stagger: 0.13 }, 0.05)
        .to(arch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, onComplete: () => gsap.set(arch, { clipPath: 'none' }) }, 0.15)
        .from(archImg, { scale: 1.4, duration: 2 }, 0.15)
        .to(words, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.9, stagger: 0.13, ease: 'back.out(2)' }, 0.55)
        .to(fades, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, 0.7);
      if (squiggle) tl.to(squiggle, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0.9);
    });

    // parallax kecil saat hero discroll
    gsap.to('.hero__visual', {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to(archImg, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // ---------- panel jelajahi: yang disorot melebar ----------
  const explore = $('.explore');
  if (explore) {
    const items = $$('.explore__item', explore);
    const activate = (it) => items.forEach((x) => x.classList.toggle('is-active', x === it));
    const noHover = window.matchMedia('(hover: none)');
    const wide = window.matchMedia('(min-width: 768px)');
    items.forEach((it) => {
      it.addEventListener('mouseenter', () => activate(it));
      it.addEventListener('focus', () => activate(it));
      it.addEventListener('click', (e) => {
        // di layar sentuh lebar, ketukan pertama membuka panel dulu
        if (noHover.matches && wide.matches && !it.classList.contains('is-active')) {
          e.preventDefault();
          e.stopPropagation();
          activate(it);
        }
      }, true);
    });
  }
})();
