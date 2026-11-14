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
    const floats = $$('.float-card, .badge-spin', hero);
    const shapes = $$('.shape', hero);
    const squiggle = $('.squiggle path', hero);

    gsap.set(lines, { y: 0, yPercent: 110 });
    gsap.set(words, { autoAlpha: 0, y: 34, rotate: 8 });
    gsap.set(fades, { autoAlpha: 0, y: 28 });
    gsap.set(arch, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(floats, { autoAlpha: 0, scale: 0.4 });
    gsap.set(shapes, { autoAlpha: 0, scale: 0 });
    let len = 0;
    if (squiggle) {
      len = squiggle.getTotalLength();
      gsap.set(squiggle, { strokeDasharray: len, strokeDashoffset: len });
    }

    Site.onReady(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.to(lines, { yPercent: 0, duration: 1.25, stagger: 0.13 }, 0.05)
        .to(arch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5 }, 0.15)
        .from(archImg, { scale: 1.4, duration: 2 }, 0.15)
        .to(words, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.9, stagger: 0.13, ease: 'back.out(2)' }, 0.55)
        .to(fades, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, 0.7)
        .to(shapes, { autoAlpha: 1, scale: 1, duration: 1.1, stagger: 0.1, ease: 'back.out(1.7)' }, 0.85)
        .to(floats, { autoAlpha: 1, scale: 1, duration: 1, stagger: 0.15, ease: 'back.out(1.8)' }, 1)
        .add(bob);
      if (squiggle) tl.to(squiggle, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0.9);
    });

    // kartu-kartu kecil melayang pelan
    function bob() {
      floats.forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 12 : -12, duration: 2.6 + i * 0.45, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    }

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
    gsap.to('.hero__bg .blob', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // ---------- pita berjalan ikut miring sedikit saat discroll ----------
  if (Site.motion) {
    $$('.marquee').forEach((band, i) => {
      gsap.fromTo(band, { xPercent: i ? 3 : -3 }, {
        xPercent: i ? -3 : 3,
        ease: 'none',
        scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true },
      });
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
