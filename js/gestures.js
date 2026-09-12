/* gestures.js — pointer tracking, momentum projection, rubber-banding, press feedback
 * Exposed on window.TT.gestures
 */
(function () {
  'use strict';

  var TT = (window.TT = window.TT || {});

  /* Apple's momentum projection (Designing Fluid Interfaces sample code). v in px/s. */
  function project(velocity, decelerationRate) {
    var d = decelerationRate === undefined ? 0.998 : decelerationRate;
    return ((velocity / 1000) * d) / (1 - d);
  }

  /* Progressive resistance past a boundary. */
  function rubberband(overshoot, dimension, constant) {
    var c = constant === undefined ? 0.55 : constant;
    return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
  }

  /* Velocity from a short history of {t, v} samples (px/s), using the last ~100ms. */
  function velocityFrom(samples) {
    if (samples.length < 2) return 0;
    var last = samples[samples.length - 1];
    var first = null;
    for (var i = samples.length - 2; i >= 0; i--) {
      first = samples[i];
      if (last.t - first.t >= 100) break;
    }
    var dt = last.t - first.t;
    if (dt <= 0) return 0;
    return ((last.v - first.v) / dt) * 1000;
  }

  /* 1:1 drag tracking on one axis with pointer capture, hysteresis and velocity handoff.
   * opts: { axis:'y'|'x', threshold:10, shouldStart(e), onStart(e), onMove(delta, e), onEnd({delta, velocity, e}) }
   */
  function drag(el, opts) {
    opts = opts || {};
    var axis = opts.axis || 'y';
    var threshold = opts.threshold === undefined ? 10 : opts.threshold;
    var id = null, origin = 0, originX = 0, originY = 0, started = false, samples = [];

    function pos(e) { return axis === 'y' ? e.clientY : e.clientX; }

    function down(e) {
      if (id !== null || e.button > 0) return;
      if (opts.shouldStart && !opts.shouldStart(e)) return;
      id = e.pointerId;
      origin = pos(e);
      originX = e.clientX; originY = e.clientY;
      started = false;
      samples = [{ t: e.timeStamp, v: origin }];
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    }

    function move(e) {
      if (e.pointerId !== id) return;
      var p = pos(e);
      samples.push({ t: e.timeStamp, v: p });
      if (samples.length > 12) samples.shift();

      if (!started) {
        var dx = e.clientX - originX, dy = e.clientY - originY;
        var along = axis === 'y' ? Math.abs(dy) : Math.abs(dx);
        var across = axis === 'y' ? Math.abs(dx) : Math.abs(dy);
        if (along < threshold) return;
        if (across > along) { cancel(); return; } // intent is the other axis — let go
        started = true;
        origin = p; // re-anchor so the element doesn't jump by the threshold
        try { el.setPointerCapture(id); } catch (err) { /* ignore */ }
        if (opts.onStart) opts.onStart(e);
      }
      if (opts.onMove) opts.onMove(p - origin, e);
    }

    function up(e) {
      if (e.pointerId !== id) return;
      var wasStarted = started;
      var delta = pos(e) - origin;
      var velocity = velocityFrom(samples);
      cleanup();
      if (wasStarted && opts.onEnd) opts.onEnd({ delta: delta, velocity: velocity, e: e });
    }

    function cancel() { cleanup(); }

    function cleanup() {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      try { if (id !== null && el.hasPointerCapture && el.hasPointerCapture(id)) el.releasePointerCapture(id); } catch (err) { /* ignore */ }
      id = null; started = false; samples = [];
    }

    el.addEventListener('pointerdown', down);
    return function destroy() { el.removeEventListener('pointerdown', down); cleanup(); };
  }

  /* Press feedback for every [data-press] under root: scale on pointer-down (instant),
   * spring back on release, cancel when the pointer drags away (10px hysteresis). */
  function press(root, opts) {
    opts = opts || {};
    var scale = opts.scale || 0.96;
    var springs = new WeakMap();
    var current = null; // { el, spring, pointerId, x, y }

    function springFor(el) {
      var s = springs.get(el);
      if (!s) {
        s = TT.spring({
          value: 1, damping: 1, response: 0.25, precision: 0.0005, reduced: 'animate',
          onUpdate: function (v) { el.style.setProperty('--press', v.toFixed(4)); }
        });
        springs.set(el, s);
      }
      return s;
    }

    function release() {
      if (!current) return;
      current.spring.to(1, { response: 0.28 });
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);
      current = null;
    }

    function onMove(e) {
      if (!current || e.pointerId !== current.pointerId) return;
      var r = current.el.getBoundingClientRect();
      var pad = 12;
      var inside = e.clientX >= r.left - pad && e.clientX <= r.right + pad && e.clientY >= r.top - pad && e.clientY <= r.bottom + pad;
      var moved = Math.hypot(e.clientX - current.x, e.clientY - current.y);
      if (!inside || moved > 24) release(); // dragging away cancels the press
    }

    function onUp(e) {
      if (!current || e.pointerId !== current.pointerId) return;
      release();
    }

    root.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      var el = e.target.closest && e.target.closest('[data-press]');
      if (!el || (el.disabled)) return;
      if (TT.motion.reduced) return; // no scale under reduced motion; :active styles still apply
      release();
      var s = springFor(el);
      s.to(scale, { response: 0.12 });
      current = { el: el, spring: s, pointerId: e.pointerId, x: e.clientX, y: e.clientY };
      window.addEventListener('pointermove', onMove, true);
      window.addEventListener('pointerup', onUp, true);
      window.addEventListener('pointercancel', onUp, true);
    }, { passive: true });

    // Keyboard activation should feel pressed too
    root.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      var el = e.target.closest && e.target.closest('[data-press]');
      if (!el || TT.motion.reduced) return;
      var s = springFor(el);
      s.to(scale, { response: 0.12 });
      setTimeout(function () { s.to(1, { response: 0.28 }); }, 90);
    });
  }

  TT.gestures = { project: project, rubberband: rubberband, velocityFrom: velocityFrom, drag: drag, press: press };
})();
