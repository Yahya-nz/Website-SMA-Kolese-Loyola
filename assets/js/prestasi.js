'use strict';
// ================= Prestasi: kartu sorotan dan daftar yang bisa difilter =================

(function () {
  const Site = window.Site;
  if (!Site) return;
  const { $, $$ } = Site;
  if (window.gsap && window.Flip) gsap.registerPlugin(Flip);

  // ---------- tumpukan kartu sorotan (Swiper efek cards) ----------
  const swiperEl = $('.hl-swiper');
  if (swiperEl && window.Swiper) {
    const details = $$('.hl-detail');
    const count = $('.hl-count b');
    const sync = (i) => {
      details.forEach((d, k) => d.classList.toggle('is-active', k === i));
      if (count) count.textContent = String(i + 1).padStart(2, '0');
    };
    const swiper = new Swiper(swiperEl, {
      effect: 'cards',
      grabCursor: true,
      rewind: true,
      speed: 650,
      cardsEffect: { perSlideOffset: 10, perSlideRotate: 3, slideShadows: false },
      keyboard: { enabled: true },
      navigation: { prevEl: '.hl-prev', nextEl: '.hl-next' },
      autoplay: Site.motion ? { delay: 5200, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      on: { slideChange: (s) => sync(s.realIndex) },
    });
    sync(swiper.realIndex);
  }

  // ---------- filter bidang + pencarian ----------
  Site.setupFilter({
    items: $$('.award'),
    buttons: $$('.filters [data-filter]'),
    attr: 'bidang',
    input: $('.search input'),
    empty: $('.empty-state'),
    countBadges: true,
  });
})();
