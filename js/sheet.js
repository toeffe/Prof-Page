/* sheet.js — bottom sheet with 1:1 drag, rubber-banding, momentum projection and
 * velocity handoff into a spring. Interruptible at any point.
 *
 *   TT.sheet.open({ title, content, trigger, onClose })
 *   TT.sheet.close()
 *   TT.sheet.isOpen
 */
(function () {
  'use strict';

  var TT = (window.TT = window.TT || {});
  var G = TT.gestures;

  var root, panel, scrim, titleEl, body, closeBtn;
  var H = 0;                 // closed translateY (panel height)
  var isOpen = false;
  var trigger = null;
  var onCloseCb = null;
  var lastFocus = null;
  var dragging = false;
  var dragStartY = 0;

  var y; // spring on translateY

  function px(v) { return v.toFixed(2) + 'px'; }

  function progress() { return H ? Math.min(1, Math.max(0, 1 - y.value / H)) : 0; }

  function render(v) {
    panel.style.transform = 'translate3d(0,' + px(v) + ',0)';
    var p = progress();
    scrim.style.opacity = p.toFixed(3);
    document.documentElement.style.setProperty('--push', p.toFixed(3));
  }

  function measure() {
    H = panel.getBoundingClientRect().height + 24; // + shadow slack
    if (!isOpen && !dragging && !y.isAnimating) y.set(H);
  }

  function focusables() {
    return Array.prototype.filter.call(
      panel.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function init() {
    root = document.getElementById('sheetRoot');
    panel = document.getElementById('sheet');
    scrim = document.getElementById('sheetScrim');
    titleEl = document.getElementById('sheetTitle');
    body = document.getElementById('sheetBody');
    closeBtn = document.getElementById('sheetClose');
    if (!root) return;

    y = TT.spring({
      value: 0, damping: 1, response: 0.35, precision: 0.1,
      onUpdate: render
    });

    scrim.addEventListener('click', function () { close(); });
    closeBtn.addEventListener('click', function () { close(); });

    document.addEventListener('keydown', function (e) {
      if (root.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        var f = focusables();
        if (!f.length) { e.preventDefault(); panel.focus(); return; }
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Drag anywhere on the panel; from the scrollable body only when it's at the top.
    G.drag(panel, {
      axis: 'y',
      threshold: 8,
      shouldStart: function (e) {
        if (TT.motion.reduced) return false;
        if (body.contains(e.target) && body.scrollTop > 0) return false;
        return true;
      },
      onStart: function () {
        dragging = true;
        y.stop();                 // grab it mid-flight: start from the presentation value
        dragStartY = y.value;
        panel.style.willChange = 'transform';
      },
      onMove: function (delta) {
        var v = dragStartY + delta;
        if (v < 0) v = G.rubberband(v, H);   // resisting above the open position
        y.value = v;
        render(v);
      },
      onEnd: function (r) {
        dragging = false;
        var vel = r.velocity;            // px/s, positive = downward
        var projected = y.value + G.project(vel);
        var shouldClose;
        if (Math.abs(vel) > 300) shouldClose = vel > 0;          // velocity sign decides
        else shouldClose = projected > H * 0.5;                  // else projected rest point
        if (shouldClose) settleClosed(vel);
        else y.to(0, { velocity: vel, damping: 0.8, response: 0.3 });
      }
    });

    window.addEventListener('resize', function () { if (!root.hidden) measure(); });
  }

  function settleClosed(velocity) {
    isOpen = false;
    document.body.classList.remove('sheet-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    y.to(H, { velocity: velocity || 0, damping: velocity ? 0.9 : 1, response: 0.3, onRest: finishClose });
  }

  function finishClose() {
    if (isOpen) return; // re-opened while closing
    root.hidden = true;
    root.style.opacity = '';
    root.style.transition = '';
    body.innerHTML = '';
    document.documentElement.style.setProperty('--push', '0');
    var cb = onCloseCb; onCloseCb = null;
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
    lastFocus = null; trigger = null;
    if (cb) cb();
  }

  function open(opts) {
    if (!root) return;
    opts = opts || {};
    var reopening = !root.hidden;

    lastFocus = document.activeElement;
    trigger = opts.trigger || null;
    onCloseCb = opts.onClose || null;
    titleEl.textContent = opts.title || '';
    body.innerHTML = '';
    if (typeof opts.content === 'string') body.innerHTML = opts.content;
    else if (opts.content) body.appendChild(opts.content);

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
      // Anchor the material to what summoned it (§7)
      var r = trigger.getBoundingClientRect();
      panel.style.transformOrigin = (r.left + r.width / 2) + 'px 100%';
    }

    root.hidden = false;
    isOpen = true;
    document.body.classList.add('sheet-open');

    measure();
    // Body scroll only if content actually overflows; otherwise the whole panel drags.
    body.style.touchAction = body.scrollHeight > body.clientHeight + 1 ? 'pan-y' : 'none';
    body.scrollTop = 0;

    if (TT.motion.reduced) {
      // Cross-fade instead of slide (§14)
      y.set(0);
      root.style.transition = 'opacity 200ms ease';
      root.style.opacity = '0';
      requestAnimationFrame(function () { root.style.opacity = '1'; });
    } else {
      if (!reopening) y.set(H);           // start off-screen, then spring in — no bounce on a tap (§4)
      y.to(0, { damping: 1, response: 0.38 });
    }

    panel.focus({ preventScroll: true });
  }

  function close() {
    if (!root || root.hidden) return;
    if (TT.motion.reduced) {
      isOpen = false;
      document.body.classList.remove('sheet-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      root.style.opacity = '0';
      setTimeout(finishClose, 200);
      return;
    }
    settleClosed(0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  TT.sheet = {
    open: open,
    close: close,
    get isOpen() { return isOpen; }
  };
})();
