/* spring.js — tiny interruptible spring animator (Apple damping-ratio / response model)
 *
 *   var s = TT.spring({ value: 0, damping: 1, response: 0.35, onUpdate: fn, onRest: fn });
 *   s.to(100)                      // retarget from the live value + live velocity
 *   s.to(100, { velocity: 800 })   // hand off a gesture's release velocity (units/s)
 *   s.set(0)                       // jump, no animation
 *
 * damping  — damping ratio. 1.0 = critically damped (no overshoot). <1 overshoots.
 * response — seconds; roughly how quickly the value approaches the target.
 * Mass is fixed at 1:  stiffness = (2π / response)²,  friction = 2 · damping · √stiffness
 */
(function () {
  'use strict';

  var TT = (window.TT = window.TT || {});
  var reducedMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  TT.motion = {
    get reduced() { return !!(reducedMQ && reducedMQ.matches); },
    onChange: function (fn) { if (reducedMQ && reducedMQ.addEventListener) reducedMQ.addEventListener('change', fn); }
  };

  var active = new Set();
  var frame = 0;
  var lastT = 0;
  var MAX_DT = 1 / 20;     // clamp long frames (tab switch) so the sim never explodes
  var STEP = 1 / 240;      // fixed sub-step for stable integration

  function tick(now) {
    frame = 0;
    var dt = lastT ? (now - lastT) / 1000 : 1 / 60;
    lastT = now;
    if (dt > MAX_DT) dt = MAX_DT;
    if (dt <= 0) dt = 1 / 60;

    active.forEach(function (s) { s._step(dt); });

    if (active.size) frame = requestAnimationFrame(tick);
    else lastT = 0;
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function Spring(opts) {
    opts = opts || {};
    this.value = opts.value !== undefined ? opts.value : 0;
    this.target = this.value;
    this.velocity = 0;
    this.damping = opts.damping !== undefined ? opts.damping : 1;
    this.response = opts.response !== undefined ? opts.response : 0.35;
    this.precision = opts.precision !== undefined ? opts.precision : 0.01;
    this.reduced = opts.reduced || 'instant'; // 'instant' | 'animate'
    this.onUpdate = opts.onUpdate || null;
    this.onRest = opts.onRest || null;
    this.isAnimating = false;
    this._pendingRest = null;
  }

  Spring.prototype.configure = function (o) {
    if (o.damping !== undefined) this.damping = o.damping;
    if (o.response !== undefined) this.response = o.response;
    return this;
  };

  Spring.prototype.set = function (v) {
    this.stop();
    this.value = this.target = v;
    this.velocity = 0;
    if (this.onUpdate) this.onUpdate(v, this);
    return this;
  };

  Spring.prototype.to = function (target, o) {
    o = o || {};
    this.target = target;
    if (o.velocity !== undefined) this.velocity = o.velocity;
    if (o.damping !== undefined) this.damping = o.damping;
    if (o.response !== undefined) this.response = o.response;
    this._pendingRest = o.onRest || null;

    if (this.reduced === 'instant' && TT.motion.reduced) {
      this.stop();
      this.value = target;
      this.velocity = 0;
      if (this.onUpdate) this.onUpdate(target, this);
      this._rest();
      return this;
    }

    if (!this.isAnimating) {
      this.isAnimating = true;
      active.add(this);
      schedule();
    }
    return this;
  };

  Spring.prototype.stop = function () {
    if (this.isAnimating) {
      this.isAnimating = false;
      active.delete(this);
    }
    return this;
  };

  Spring.prototype._rest = function () {
    var cb = this._pendingRest;
    this._pendingRest = null;
    if (this.onRest) this.onRest(this.value, this);
    if (cb) cb(this.value, this);
  };

  Spring.prototype._step = function (dt) {
    var w = (2 * Math.PI) / Math.max(this.response, 0.001);
    var k = w * w;
    var c = 2 * this.damping * w;
    var x = this.value, v = this.velocity, t = this.target;

    var remaining = dt;
    while (remaining > 0) {
      var h = remaining < STEP ? remaining : STEP;
      // semi-implicit Euler: update velocity first, then position
      var a = -k * (x - t) - c * v;
      v += a * h;
      x += v * h;
      remaining -= h;
    }

    this.value = x;
    this.velocity = v;

    var settled = Math.abs(v) < this.precision * 10 && Math.abs(x - t) < this.precision;
    if (settled) {
      this.value = t;
      this.velocity = 0;
      this.isAnimating = false;
      active.delete(this);
      if (this.onUpdate) this.onUpdate(this.value, this);
      this._rest();
    } else if (this.onUpdate) {
      this.onUpdate(this.value, this);
    }
  };

  TT.spring = function (opts) { return new Spring(opts); };
  TT.Spring = Spring;
})();
