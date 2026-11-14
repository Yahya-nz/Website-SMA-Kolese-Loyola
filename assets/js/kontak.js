'use strict';
// ================= Kontak: peta Leaflet dan tanya jawab =================

(function () {
  const Site = window.Site;
  if (!Site) return;
  const { $, $$ } = Site;

  // ---------- peta lokasi sekolah ----------
  const el = $('#peta');
  if (el && window.L) {
    const pos = [-6.981904, 110.4262363];
    const map = L.map(el, {
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile,
      zoomControl: false,
    }).setView(pos, 15);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');

    // peta OpenStreetMap; di mode gelap warnanya dibalik lewat CSS
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(map);

    const icon = L.divIcon({
      className: 'map-pin',
      html: '<span class="map-pin__pulse"></span><span class="map-pin__dot"><img src="assets/img/logo-loyola.png" alt=""></span>',
      iconSize: [54, 54],
      iconAnchor: [27, 66],
      popupAnchor: [0, -72],
    });
    const marker = L.marker(pos, { icon, title: 'SMA Kolese Loyola', alt: 'Lokasi SMA Kolese Loyola' }).addTo(map);
    marker.bindPopup('<strong>SMA Kolese Loyola</strong><br>Jl. Karanganyar No. 37, Semarang', { closeButton: false });

    // saat peta terlihat, kamera terbang mendekat lalu popup terbuka
    if (window.ScrollTrigger && Site.motion) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          map.flyTo(pos, 17, { duration: 1.8 });
          map.once('moveend', () => marker.openPopup());
        },
      });
    } else {
      map.setView(pos, 17);
      marker.openPopup();
    }
    window.addEventListener('load', () => map.invalidateSize());
  }

  // ---------- tanya jawab buka-tutup ----------
  $$('.faq__item').forEach((item) => {
    const q = $('.faq__q', item);
    const a = $('.faq__a', item);
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', String(open));
      if (window.gsap) {
        gsap.to(a, {
          height: open ? 'auto' : 0,
          duration: 0.55,
          ease: 'power3.inOut',
          onComplete: () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); },
        });
      } else {
        a.style.height = open ? 'auto' : '0';
      }
    });
  });
})();
