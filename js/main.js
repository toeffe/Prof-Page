/* main.js — wires the page together */
(function () {
  'use strict';

  var TT = window.TT;
  var i18n = TT.i18n;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Project data for the Work detail sheets ---------- */
  var projects = {
    arkiv: { name: 'Arkiv', desc: 'services.arkiv', bullets: ['services.arkiv.li1', 'services.arkiv.li2', 'services.arkiv.li3'], tags: ['Python', 'OCR', 'tag.automation'] },
    autorep: { name: 'Autorep (ETA Bot)', desc: 'services.autorep', bullets: [], tags: ['tag.automation', 'tag.email', 'Excel', 'Power Automate'] },
    emballage: { name: 'Emballage', desc: 'services.emballage', bullets: [], tags: ['Excel', 'tag.reporting', 'tag.logistics'] }
  };

  function tagText(key) { return i18n.dict.en[key] !== undefined ? i18n.t(key) : key; }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* ---------- 1. Press feedback everywhere (§1) ---------- */
  TT.gestures.press(document);

  /* ---------- 2. Top bar scroll edge (§12) ---------- */
  var topbar = $('#topbar');
  function onScroll() { topbar.classList.toggle('is-scrolled', window.scrollY > 4); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Active section in nav (wayfinding, §16) ---------- */
  var sections = ['services', 'process', 'work', 'contact'].map(function (id) { return document.getElementById(id); });
  var activeId = null;
  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    $$('.nav-links a, .sheet-nav a').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }
  var visible = new Map();
  var sectionIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0); });
    var best = null, bestRatio = 0;
    visible.forEach(function (ratio, id) { if (ratio > bestRatio) { bestRatio = ratio; best = id; } });
    if (best) setActive(best); else if (window.scrollY < 200) setActive(null);
  }, { rootMargin: '-40% 0px -45% 0px', threshold: [0, 0.01, 0.25, 0.5, 0.75, 1] });
  sections.forEach(function (s) { sectionIO.observe(s); });

  /* ---------- 4. Segmented language control ---------- */
  var seg = $('#langToggle');
  var thumb = $('.segmented-thumb', seg);
  var segBtns = $$('.seg', seg);
  var thumbX = TT.spring({
    value: 0, damping: 1, response: 0.3, precision: 0.05,
    onUpdate: function (v) { thumb.style.transform = 'translate3d(' + v.toFixed(2) + 'px,0,0)'; }
  });

  function thumbTargetFor(lang) {
    var btn = segBtns.filter(function (b) { return b.getAttribute('data-lang') === lang; })[0];
    if (!btn) return { x: 0, w: 0 };
    var sr = seg.getBoundingClientRect(), br = btn.getBoundingClientRect();
    return { x: br.left - sr.left, w: br.width };
  }
  function layoutThumb(animate) {
    var t = thumbTargetFor(i18n.current);
    thumb.style.width = t.w + 'px';
    if (animate) thumbX.to(t.x); else thumbX.set(t.x);
  }
  function syncSeg() {
    segBtns.forEach(function (b) { b.setAttribute('aria-checked', b.getAttribute('data-lang') === i18n.current ? 'true' : 'false'); });
  }
  segBtns.forEach(function (b) {
    b.addEventListener('click', function () { i18n.apply(b.getAttribute('data-lang')); });
  });
  seg.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    var next = i18n.current === 'en' ? 'da' : 'en';
    i18n.apply(next);
    segBtns.filter(function (b) { return b.getAttribute('data-lang') === next; })[0].focus();
  });
  window.addEventListener('resize', function () { layoutThumb(false); });

  i18n.onChange(function () { syncSeg(); layoutThumb(true); });
  i18n.apply(i18n.detect());
  syncSeg();
  layoutThumb(false);
  // Fonts may still be loading; re-measure once they're ready.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layoutThumb(false); });

  /* ---------- 5. Reveal on scroll — springs from presentation value (§3, §14) ---------- */
  var revealEls = $$('.reveal');
  var pendingBatch = [];
  var batchTimer = 0;

  function revealNow(node, index) {
    var op = TT.spring({
      value: 0, damping: 1, response: 0.5, precision: 0.002, reduced: 'animate',
      onUpdate: function (v) { node.style.opacity = v.toFixed(3); }
    });
    var ty = TT.spring({
      value: 14, damping: 1, response: 0.45, precision: 0.05,
      onUpdate: function (v) { node.style.transform = v < 0.05 && v > -0.05 ? '' : 'translate3d(0,' + v.toFixed(2) + 'px,0)'; },
      onRest: function () { node.classList.add('is-in'); node.style.transform = ''; }
    });
    var delay = Math.min(index * 45, 220);
    setTimeout(function () { op.to(1); ty.to(0); }, delay);
  }

  function flushBatch() {
    batchTimer = 0;
    // Stagger by document order within the batch (hint of direction, §8)
    pendingBatch.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
    pendingBatch.forEach(revealNow);
    pendingBatch = [];
  }

  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      revealIO.unobserve(e.target);
      pendingBatch.push(e.target);
      if (e.target.id === 'heroStepper') runStepper();
    });
    if (pendingBatch.length && !batchTimer) batchTimer = setTimeout(flushBatch, 16);
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  revealEls.forEach(function (n) { revealIO.observe(n); });

  /* ---------- 6. Hero stepper ---------- */
  var stepperRan = false;
  function runStepper() {
    if (stepperRan) return;
    stepperRan = true;
    var steps = $$('#heroStepper .step');
    var fill = $('#heroStepper .stepper-fill');
    var fillS = TT.spring({
      value: 0, damping: 1, response: 0.55, precision: 0.001,
      onUpdate: function (v) { fill.style.transform = 'scaleX(' + v.toFixed(4) + ')'; }
    });
    steps.forEach(function (s, i) {
      setTimeout(function () {
        s.classList.add('is-done');
        fillS.to((i + 1) / steps.length);
      }, 500 + i * 650);
    });
  }

  /* ---------- 7. Mobile menu sheet ---------- */
  var menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', function () {
    if (TT.sheet.isOpen) { TT.sheet.close(); return; }
    var nav = el('nav', { class: 'sheet-nav', 'aria-label': 'Primary' });
    $$('#navLinks a').forEach(function (a) {
      var link = el('a', { href: a.getAttribute('href'), text: a.textContent, 'data-press': '' });
      if (a.classList.contains('is-active')) link.classList.add('is-active');
      link.addEventListener('click', function () { TT.sheet.close(); });
      nav.appendChild(link);
    });
    var cta = el('a', { href: '#contact', class: 'btn btn-primary btn-lg btn-block', text: i18n.t('nav.cta'), 'data-press': '' });
    cta.addEventListener('click', function () { TT.sheet.close(); });
    nav.appendChild(cta);
    TT.sheet.open({ title: i18n.t('nav.menuTitle'), content: nav, trigger: menuBtn });
  });

  /* ---------- 8. Work rows → project detail sheet ---------- */
  $$('.work-row').forEach(function (row) {
    row.addEventListener('click', function () {
      var p = projects[row.getAttribute('data-project')];
      if (!p) return;
      var wrap = el('div', { class: 'sheet-project' }, [
        el('p', { text: i18n.t(p.desc) }),
        p.bullets.length ? el('ul', { class: 'bento-list' }, p.bullets.map(function (k) { return el('li', { text: i18n.t(k) }); })) : null,
        el('span', { class: 'mono-label', text: i18n.t('sheet.built') }),
        el('div', { class: 'work-tags' }, p.tags.map(function (k) { return el('span', { class: 'tag', text: tagText(k) }); })),
        el('a', { href: '#contact', class: 'btn btn-primary btn-lg btn-block', text: i18n.t('sheet.cta'), 'data-press': '' })
      ]);
      wrap.querySelector('.btn').addEventListener('click', function () { TT.sheet.close(); });
      TT.sheet.open({ title: p.name, content: wrap, trigger: row });
    });
  });

  /* ---------- 9. Contact form — inline validation + mailto (§16 feedback) ---------- */
  var form = $('#contactForm');
  var status = $('#formStatus');
  var fields = [
    { input: $('#fName'), err: $('#fNameErr'), valid: function (v) { return v.trim().length > 0; } },
    { input: $('#fEmail'), err: $('#fEmailErr'), valid: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); } },
    { input: $('#fDetails'), err: $('#fDetailsErr'), valid: function (v) { return v.trim().length > 0; } }
  ];
  function check(f, show) {
    var ok = f.valid(f.input.value);
    var wrap = f.input.closest('.field');
    if (show) {
      wrap.classList.toggle('is-invalid', !ok);
      f.err.hidden = ok;
      f.input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    }
    return ok;
  }
  fields.forEach(function (f) {
    f.input.addEventListener('blur', function () { if (f.input.value) check(f, true); });
    f.input.addEventListener('input', function () { if (f.input.closest('.field').classList.contains('is-invalid')) check(f, true); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var allOk = true, firstBad = null;
    fields.forEach(function (f) { var ok = check(f, true); if (!ok) { allOk = false; if (!firstBad) firstBad = f.input; } });
    if (!allOk) { firstBad.focus(); return; }
    var name = fields[0].input.value.trim(), email = fields[1].input.value.trim(), details = fields[2].input.value.trim();
    var subject = (i18n.current === 'da' ? 'Projektforespørgsel fra ' : 'Project inquiry from ') + name;
    var bodyTxt = details + '\n\n— ' + name + '\n' + email;
    status.hidden = false;
    window.location.href = 'mailto:MathiasTJ@outlook.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyTxt);
  });
})();
