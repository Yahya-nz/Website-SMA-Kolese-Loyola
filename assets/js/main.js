'use strict';
// ================= Fondasi bersama semua halaman =================

(function () {
  const html = document.documentElement;
  const body = document.body;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const hasGsap = !!window.gsap;
  const anim = hasGsap && motionOK;

  const safeStore = (type) => { try { return window[type]; } catch (e) { return null; } };
  const ss = safeStore('sessionStorage');
  const ls = safeStore('localStorage');
  const store = {
    get: (s, k) => { try { return s ? s.getItem(k) : null; } catch (e) { return null; } },
    set: (s, k, v) => { try { if (s) s.setItem(k, v); } catch (e) { /* abaikan */ } },
    del: (s, k) => { try { if (s) s.removeItem(k); } catch (e) { /* abaikan */ } },
  };

  // ---------- antrean "halaman siap" (setelah preloader / transisi) ----------
  const readyQueue = [];
  let isReady = false;
  function markReady() {
    if (isReady) return;
    isReady = true;
    readyQueue.splice(0).forEach((fn) => { try { fn(); } catch (err) { console.error(err); } });
  }

  const Site = {
    lenis: null,
    motion: anim,
    $, $$,
    onReady(fn) { if (isReady) fn(); else readyQueue.push(fn); },
    scrollTo,
    toast,
    setupFilter,
  };
  window.Site = Site;

  if (!anim) html.classList.add('no-motion');
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    gsap.defaults({ ease: 'power3.out' });
  }

  // ================= Scroll halus (Lenis) =================
  if (anim && window.Lenis) {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    Site.lenis = lenis;
  }

  function scrollTo(target, immediate) {
    const isNum = typeof target === 'number';
    if (Site.lenis) {
      Site.lenis.scrollTo(target, { offset: isNum ? 0 : -96, duration: 1.4, immediate: !!immediate });
      return;
    }
    const y = isNum ? target : target.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: anim && !immediate ? 'smooth' : 'auto' });
  }

  // ================= Header, progres, tombol ke atas =================
  const header = $('.site-header');
  const progress = $('.scroll-progress');
  const toTop = $('.to-top');
  const ring = toTop ? $('circle', toTop) : null;
  const RING = 163.4;
  let lastY = window.scrollY;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
      if (!body.classList.contains('menu-open')) {
        if (y > 520 && y > lastY + 6) header.classList.add('is-hidden');
        else if (y < lastY - 6 || y <= 520) header.classList.remove('is-hidden');
      }
    }
    lastY = y;
    if (progress) progress.style.transform = `scaleX(${p})`;
    if (toTop) {
      toTop.classList.toggle('is-show', y > 700);
      if (ring) ring.style.strokeDashoffset = String(RING * (1 - p));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => scrollTo(0));

  // ================= Indikator menu yang bergeser =================
  const nav = $('.nav');
  if (nav) {
    const pill = $('.nav__pill', nav);
    const links = $$('a', nav);
    const active = $('a.is-active', nav);
    const place = (a) => {
      links.forEach((l) => l.classList.toggle('is-on', l === a));
      if (!pill) return;
      if (!a) { pill.style.opacity = '0'; return; }
      pill.style.opacity = '1';
      pill.style.width = `${a.offsetWidth}px`;
      pill.style.transform = `translateX(${a.offsetLeft}px)`;
    };
    nav.classList.add('has-pill');
    place(active);
    links.forEach((l) => l.addEventListener('mouseenter', () => place(l)));
    nav.addEventListener('mouseleave', () => place(active));
    window.addEventListener('resize', () => place(active));
    if (document.fonts) document.fonts.ready.then(() => place(active));
  }

  // ================= Menu HP =================
  const menuBtn = $('.menu-toggle');
  const menu = $('.mobile-menu');
  if (menu) menu.inert = true;

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    menu.inert = !open;
    if (open) {
      if (header) header.classList.remove('is-hidden');
      if (Site.lenis) Site.lenis.stop();
      if (anim) {
        gsap.fromTo($$('.mobile-menu__link, .mobile-menu__foot', menu),
          { y: 50, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, delay: 0.25, overwrite: true });
      }
    } else if (Site.lenis) {
      Site.lenis.start();
    }
  }
  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) setMenu(false);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // ================= Mode gelap =================
  const themeBtn = $('.theme-toggle');
  const themeMeta = $('meta[name="theme-color"]');
  function paintThemeMeta() {
    if (themeMeta) themeMeta.setAttribute('content', html.dataset.theme === 'dark' ? '#0d0729' : '#522795');
  }
  paintThemeMeta();
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const dark = html.dataset.theme !== 'dark';
      html.classList.add('theme-anim');
      html.dataset.theme = dark ? 'dark' : 'light';
      store.set(ls, 'loyola-tema', dark ? 'gelap' : 'terang');
      paintThemeMeta();
      themeBtn.setAttribute('aria-pressed', String(dark));
      document.dispatchEvent(new CustomEvent('loyola:tema', { detail: { dark } }));
      setTimeout(() => html.classList.remove('theme-anim'), 520);
    });
    themeBtn.setAttribute('aria-pressed', String(html.dataset.theme === 'dark'));
  }

  // ================= Notifikasi kecil =================
  const toastEl = $('.toast');
  let toastTimer = 0;
  function toast(message, icon) {
    if (!toastEl) return;
    toastEl.innerHTML = '';
    const i = document.createElement('i');
    i.className = `ph-fill ${icon || 'ph-check-circle'}`;
    const span = document.createElement('span');
    span.textContent = message;
    toastEl.append(i, span);
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2400);
  }

  // salin teks: tombol dengan data-copy
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const text = btn.dataset.copy;
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch (err2) { ok = false; }
      ta.remove();
    }
    toast(ok ? (btn.dataset.copyMsg || 'Disalin') : 'Gagal menyalin, salin manual ya', ok ? 'ph-check-circle' : 'ph-warning-circle');
  });

  // ================= Filter kartu (dipakai prestasi & fasilitas) =================
  function setupFilter({ items, buttons, attr, input, empty, countBadges }) {
    if (!items.length) return;
    let current = 'semua';
    let query = '';
    const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const texts = new Map(items.map((it) => [it, norm(it.textContent)]));

    if (countBadges) {
      buttons.forEach((b) => {
        const key = b.dataset.filter;
        const n = key === 'semua' ? items.length : items.filter((it) => it.dataset[attr] === key).length;
        const span = document.createElement('span');
        span.textContent = n;
        b.appendChild(span);
      });
    }

    function apply() {
      const useFlip = anim && window.Flip;
      const state = useFlip ? Flip.getState(items) : null;
      let shown = 0;
      items.forEach((it) => {
        const ok = (current === 'semua' || it.dataset[attr] === current) && (!query || texts.get(it).includes(query));
        it.classList.toggle('is-hidden', !ok);
        if (ok) shown += 1;
      });
      if (empty) empty.hidden = shown > 0;
      if (state) {
        Flip.from(state, {
          duration: 0.65,
          ease: 'power3.inOut',
          absolute: true,
          scale: true,
          onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.55 }),
          onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.4 }),
          onComplete: () => ScrollTrigger.refresh(),
        });
      } else if (hasGsap) {
        ScrollTrigger.refresh();
      }
    }

    buttons.forEach((b) => {
      b.setAttribute('aria-pressed', String(b.classList.contains('is-active')));
      b.addEventListener('click', () => {
        current = b.dataset.filter;
        buttons.forEach((x) => {
          x.classList.toggle('is-active', x === b);
          x.setAttribute('aria-pressed', String(x === b));
        });
        apply();
      });
    });

    if (input) {
      let t = 0;
      input.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => { query = norm(input.value.trim()); apply(); }, 160);
      });
    }
  }

  // ================= Tanpa GSAP: tampilkan semua dan selesai =================
  if (!hasGsap) {
    html.classList.add('no-motion', 'js-ready');
    html.classList.remove('is-first', 'is-arriving');
    markReady();
    return;
  }

  // ================= Animasi saat elemen masuk layar =================
  function initReveal() {
    const els = $$('[data-reveal]');
    if (!els.length) return;
    if (!anim) { gsap.set(els, { autoAlpha: 1, clearProps: 'clipPath,transform' }); return; }
    els.forEach((el) => {
      const type = el.dataset.reveal;
      if (type === 'clip') { gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 1 }); return; }
      gsap.set(el, {
        autoAlpha: 0,
        y: type === 'left' || type === 'right' ? 0 : 46,
        x: type === 'left' ? -40 : type === 'right' ? 40 : 0,
        scale: type === 'scale' ? 0.9 : 1,
      });
    });
    ScrollTrigger.batch(els, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => batch.forEach((el, i) => {
        const delay = i * 0.09;
        if (el.dataset.reveal === 'clip') {
          gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.out', delay });
          const img = $('img', el);
          if (img) gsap.from(img, { scale: 1.3, duration: 1.8, delay });
        } else {
          gsap.to(el, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.05, delay, overwrite: 'auto' });
        }
      }),
    });
  }

  // judul dipecah per baris lalu naik satu per satu
  function initSplit() {
    const els = $$('[data-split]');
    if (!els.length) return;
    if (!anim || !window.SplitText) { gsap.set(els, { autoAlpha: 1 }); return; }
    els.forEach((el) => {
      const intro = el.dataset.split === 'intro';
      SplitText.create(el, {
        type: 'lines,words',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { autoAlpha: 1 });
          if (el.dataset.splitDone) return undefined;
          const tween = gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.15,
            ease: 'power4.out',
            stagger: 0.11,
            paused: intro,
            scrollTrigger: intro ? undefined : { trigger: el, start: 'top 88%', once: true },
            onComplete: () => { el.dataset.splitDone = '1'; },
          });
          if (intro) Site.onReady(() => tween.play());
          return tween;
        },
      });
    });
  }

  // angka yang menghitung naik
  function initCounters() {
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const from = parseFloat(el.dataset.from || '0');
      const suffix = el.dataset.suffix || '';
      if (!anim) { el.textContent = `${end}${suffix}`; return; }
      const obj = { v: from };
      const render = () => { el.textContent = `${Math.round(obj.v)}${suffix}`; };
      render();
      const vars = { v: end, duration: 2.2, ease: 'power3.out', onUpdate: render };
      if (el.closest('.hero, .page-hero')) Site.onReady(() => gsap.to(obj, { ...vars, delay: 0.9 }));
      else gsap.to(obj, { ...vars, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
  }

  // gambar bergerak pelan saat discroll
  function initParallax() {
    if (!anim) return;
    $$('[data-parallax]').forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 8;
      gsap.fromTo(el, { yPercent: -amt }, {
        yPercent: amt,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  // tombol yang sedikit "tertarik" ke kursor
  function initMagnetic() {
    if (!anim || !finePointer) return;
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  function initTilt() {
    if (!anim || !finePointer || !window.VanillaTilt) return;
    VanillaTilt.init($$('[data-tilt]'), { max: 7, speed: 900, glare: true, 'max-glare': 0.14, scale: 1.02 });
  }

  function initLightbox() {
    if (!window.GLightbox || !$('.glightbox')) return;
    const lb = GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true, openEffect: 'zoom', closeEffect: 'fade' });
    lb.on('open', () => { if (Site.lenis) Site.lenis.stop(); });
    lb.on('close', () => { if (Site.lenis) Site.lenis.start(); });
    Site.lightbox = lb;
  }

  // isi hero halaman dalam muncul berurutan
  function initPageHero() {
    const hero = $('.page-hero');
    if (!hero || !anim) return;
    const items = $$('.ph-anim', hero);
    const arch = $('.page-hero__arch', hero);
    gsap.set(items, { autoAlpha: 0, y: 34 });
    if (arch) gsap.set(arch, { clipPath: 'inset(100% 0% 0% 0%)' });
    Site.onReady(() => {
      const tl = gsap.timeline();
      tl.to(items, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.1);
      if (arch) {
        tl.to(arch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.out', onComplete: () => gsap.set(arch, { clipPath: 'none' }) }, 0.15);
        const img = $('img', arch);
        if (img) tl.from(img, { scale: 1.35, duration: 1.8 }, 0.15);
      }
    });
  }

  // ================= Preloader dan transisi halaman =================
  const preloader = $('.preloader');
  const overlay = $('.page-transition');

  function runPreloader() {
    store.set(ss, 'loyola-sudah', '1');
    const countEl = $('.preloader__count span', preloader);
    const bar = $('.preloader__bar i', preloader);
    const counter = { v: 0 };
    const loaded = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
      setTimeout(resolve, 3500);
    });
    const tl = gsap.timeline();
    tl.from('.preloader__logo', { scale: 0.5, autoAlpha: 0, rotate: -12, duration: 0.9, ease: 'back.out(1.7)' })
      .from('.preloader__name, .preloader__sub', { y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, '-=0.45')
      .to(counter, {
        v: 100,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (countEl) countEl.textContent = String(Math.round(counter.v));
          if (bar) bar.style.transform = `scaleX(${counter.v / 100})`;
        },
      }, 0);
    Promise.all([tl.then(), loaded]).then(() => {
      gsap.timeline({ onComplete: () => { preloader.remove(); html.classList.remove('is-first'); } })
        .to('.preloader__inner, .preloader__count', { y: -50, autoAlpha: 0, duration: 0.5, ease: 'power2.in' })
        .to(preloader, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '-=0.1')
        .add(markReady, '-=0.55');
    });
  }

  function runArrive() {
    store.del(ss, 'loyola-pindah');
    const logo = $('img', overlay);
    gsap.set(overlay, { scaleY: 1, transformOrigin: 'top center' });
    gsap.timeline({
      onComplete: () => {
        html.classList.remove('is-arriving');
        gsap.set(overlay, { clearProps: 'transform,transformOrigin' });
      },
    })
      .to(logo, { autoAlpha: 0, y: -18, duration: 0.3, ease: 'power2.in' }, 0.05)
      .to(overlay, { scaleY: 0, duration: 0.8, ease: 'power4.inOut' }, 0.2)
      .add(markReady, 0.45);
  }

  function leave(href) {
    if (!overlay || !anim) { window.location.href = href; return; }
    store.set(ss, 'loyola-pindah', '1');
    const logo = $('img', overlay);
    gsap.timeline({ onComplete: () => { window.location.href = href; } })
      .set(overlay, { transformOrigin: 'bottom center' })
      .fromTo(overlay, { scaleY: 0 }, { scaleY: 1, duration: 0.65, ease: 'power4.inOut' })
      .fromTo(logo, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.35 }, '-=0.25');
  }

  window.addEventListener('pageshow', (e) => {
    if (e.persisted && overlay) {
      gsap.set(overlay, { scaleY: 0 });
      store.del(ss, 'loyola-pindah');
    }
  });

  // tangkap klik link internal untuk transisi dan anchor
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.classList.contains('glightbox')) return;
    const raw = a.getAttribute('href');
    if (!raw || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    const samePage = url.pathname === window.location.pathname;
    if (samePage && url.hash) {
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target) {
        e.preventDefault();
        if (body.classList.contains('menu-open')) setMenu(false);
        scrollTo(target);
        history.replaceState(null, '', url.hash);
      }
      return;
    }
    if (samePage) {
      e.preventDefault();
      if (body.classList.contains('menu-open')) setMenu(false);
      scrollTo(0);
      return;
    }
    if (!/\.html?$/i.test(url.pathname) && !url.pathname.endsWith('/')) return;
    e.preventDefault();
    leave(url.href);
  });

  // ================= Jalankan =================
  initReveal();
  initSplit();
  initCounters();
  initParallax();
  initMagnetic();
  initTilt();
  initLightbox();
  initPageHero();
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  html.classList.add('js-ready');

  if (anim && preloader && html.classList.contains('is-first')) {
    runPreloader();
  } else if (anim && overlay && html.classList.contains('is-arriving')) {
    runArrive();
  } else {
    if (preloader) preloader.remove();
    html.classList.remove('is-first', 'is-arriving');
    store.set(ss, 'loyola-sudah', '1');
    store.del(ss, 'loyola-pindah');
    markReady();
  }

  // kalau datang dengan #anchor, gulir ke sana setelah halaman siap
  Site.onReady(() => {
    if (!window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) setTimeout(() => scrollTo(target), 350);
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
