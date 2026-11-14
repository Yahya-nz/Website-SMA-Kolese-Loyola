'use strict';
// ================= Fasilitas: galeri dengan filter kategori =================

(function () {
  const Site = window.Site;
  if (!Site) return;
  const { $$ } = Site;
  if (window.gsap && window.Flip) gsap.registerPlugin(Flip);

  Site.setupFilter({
    items: $$('.fac'),
    buttons: $$('.filters [data-filter]'),
    attr: 'kategori',
    countBadges: true,
  });
})();
