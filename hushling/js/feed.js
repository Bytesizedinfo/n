/* Hushling · the camera feed
   One canvas renderer, used for the hero phone, the live demo, the picture-in-picture monitor and the takeover.
   Each feed has a `state` (which camera, colour or infrared, pan, what is in the room) that an `update`
   function sets every frame from dread, the night clock and the visitor's own controls. */
(function () {
  'use strict';
  var SW = window.HL, art = SW.art;

  /* ---------- images: SVG strings rasterised once, on demand ---------- */
  var cache = {};
  function img(key) {
    if (cache[key]) return cache[key];
    var make = art.sprites[key];
    if (!make) return null;
    var im = new Image();
    im.decoding = 'async';
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(make());
    cache[key] = im;
    return im;
  }
  function ready(im) { return im && im.complete && im.naturalWidth > 0; }
  SW.preload = function (keys) { keys.forEach(img); };

  /* ---------- film noise: a few tiles, cycled ---------- */
  var noiseTiles = [];
  for (var t = 0; t < 4; t++) {
    var nc = document.createElement('canvas'); nc.width = nc.height = 160;
    var nx = nc.getContext('2d'), id = nx.createImageData(160, 160);
    for (var i = 0; i < id.data.length; i += 4) {
      var v = Math.random() * 255;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
    }
    nx.putImageData(id, 0, 0);
    noiseTiles.push(nc);
  }
  var scanTile = document.createElement('canvas'); scanTile.width = 4; scanTile.height = 4;
  (function () { var c = scanTile.getContext('2d'); c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(0, 0, 4, 1.4); })();

  var DEFAULT = {
    cam: 'nursery', ir: false, pan: 0.5, baby: 'sleep', breath: 34, mobile: 0.35, rock: 0, eye: false,
    nanny: null, front: null, presence: 1, staticAmt: 0, lost: false, label: null, ptz: false, osd: true, mic: false
  };
  var feeds = [];

  function Feed(canvas, opts) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = opts || {};
    this.state = Object.assign({}, DEFAULT, this.opts.state || {});
    this.visible = true;
    this.last = 0;
    this.spin = Math.random() * 6;
    this.rockT = 0;
    var self = this;
    if (window.IntersectionObserver) {
      this.visible = false;
      new IntersectionObserver(function (es) { self.visible = es[es.length - 1].isIntersecting; }).observe(canvas);
    }
    feeds.push(this);
  }

  Feed.prototype.size = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(this.cv.clientWidth * dpr)), h = Math.max(1, Math.round(this.cv.clientHeight * dpr));
    if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h; }
    return dpr;
  };

  Feed.prototype.draw = function (now) {
    if (!this.visible || this.cv.clientWidth === 0) return;
    if (this.opts.update) this.opts.update(this.state, SW.d, now, this);
    var fps = this.opts.fps || 24;
    if (now - this.last < 1000 / fps) return;
    var dt = Math.min(200, now - (this.last || now));
    this.last = now;
    var dpr = this.size(), c = this.ctx, W = this.cv.width, H = this.cv.height, st = this.state;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#050706'; c.fillRect(0, 0, W, H);
    if (st.lost) { this.post(now, 1); this.osd(now, dpr); return; }

    // fit the 1600 × 900 scene, then pan across what doesn't fit
    var s = H / 900;
    if (W / s > 1600) s = W / 1600;
    var viewW = W / s, viewH = H / s;
    var x0 = (1600 - viewW) * SW.clamp(st.pan, 0, 1), y0 = Math.max(0, (900 - viewH) / 2);
    c.setTransform(s, 0, 0, s, -x0 * s, -y0 * s);
    var pal = st.ir ? 'ir' : 'day';

    if (st.cam === 'nursery') {
      this.drawImg('scene:nursery:' + pal, 0, 0, 1600, 900);
      // rocking chair
      this.rockT += dt * 0.0021;
      var chair = img('chair:' + pal);
      if (ready(chair)) {
        c.save(); c.translate(240, 780); c.rotate(Math.sin(this.rockT) * 0.07 * st.rock);
        c.drawImage(chair, -130, -340, 260, 340); c.restore();
      }
      if (st.nanny && (st.ir || st.nanny.day)) this.nanny(st.nanny, pal);
      this.drawImg('cot:' + pal, 0, 0, 1600, 900);
      if (st.baby) {
        var b = img('baby:' + st.baby + ':' + pal);
        if (ready(b)) {
          var k = st.baby === 'gone' ? 1 : 1 + 0.03 * Math.sin(now / 1000 * Math.PI * 2 * st.breath / 60);
          c.save(); c.translate(650, 588); c.scale(1, k); c.drawImage(b, 0, -120, 280, 120); c.restore();
        }
      }
      // the mobile
      this.spin += dt * 0.001 * st.mobile;
      c.strokeStyle = st.ir ? 'rgba(200,210,200,.55)' : 'rgba(230,225,215,.6)'; c.lineWidth = 2;
      for (var m = 0; m < 4; m++) {
        var a = this.spin + m * Math.PI / 2, mx = 800 + Math.cos(a) * 92, my = 336 + Math.sin(a) * 15;
        c.beginPath(); c.moveTo(800, 278); c.lineTo(mx, my - 26); c.stroke();
        var mi = img('mobile:' + m + ':' + pal);
        if (ready(mi)) c.drawImage(mi, mx - 27, my - 27, 54, 54);
      }
      if (st.eye && st.ir) this.drawImg('eye', 1178, 306, 40, 40);
    } else if (st.cam === 'parents') {
      this.drawImg('scene:parents:ir', 0, 0, 1600, 900);
      if (st.nanny) this.nanny(st.nanny, 'ir');
    } else if (st.cam === 'front') {
      this.drawImg('scene:front', 0, 0, 1600, 900);
      if (st.front) {
        var f = st.front;
        if (f.pose === 'head') this.drawImg('nanny:head:front', f.x - 200 * f.scale, f.y - 230 * f.scale, 400 * f.scale, 460 * f.scale, f.alpha);
        else this.nanny({ pose: 'stand', x: f.x, foot: f.foot, scale: f.scale, alpha: f.alpha }, 'front');
      }
      this.drawImg('viewer', 350, 200, 900, 700);
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    this.post(now, st.staticAmt);
    if (st.osd) this.osd(now, dpr);
  };

  /** the pan that puts scene x in the middle of the picture (on a narrow screen most of the room is out of shot) */
  Feed.prototype.panFor = function (x) {
    var W = this.cv.clientWidth || 1, H = this.cv.clientHeight || 1;
    var s = H / 900; if (W / s > 1600) s = W / 1600;
    var viewW = W / s;
    if (viewW >= 1600) return 0.5;
    return SW.clamp((x - viewW / 2) / (1600 - viewW), 0, 1);
  };

  Feed.prototype.drawImg = function (key, x, y, w, h, alpha) {
    var im = img(key);
    if (!ready(im)) return;
    if (alpha != null && alpha < 1) { this.ctx.globalAlpha = Math.max(0, alpha); this.ctx.drawImage(im, x, y, w, h); this.ctx.globalAlpha = 1; }
    else this.ctx.drawImage(im, x, y, w, h);
  };
  Feed.prototype.nanny = function (n, pal) {
    var key = 'nanny:' + n.pose + ':' + pal;
    if (!art.sprites[key]) key = 'nanny:' + n.pose + ':ir';
    if (!art.sprites[key]) key = 'nanny:stand:' + pal;
    var sc = n.scale || 1;
    this.drawImg(key, n.x - 130 * sc, n.foot - 560 * sc, 260 * sc, 560 * sc, n.alpha);
  };

  Feed.prototype.post = function (now, staticAmt) {
    var c = this.ctx, W = this.cv.width, H = this.cv.height, st = this.state, ir = st.ir || st.cam !== 'nursery';
    // infrared illuminator hotspot
    if (ir && !st.lost) {
      var hg = c.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, Math.max(W, H) * 0.6);
      hg.addColorStop(0, 'rgba(225,240,225,.10)'); hg.addColorStop(1, 'rgba(225,240,225,0)');
      c.fillStyle = hg; c.fillRect(0, 0, W, H);
    }
    // sensor noise
    var tile = noiseTiles[Math.floor(now / 70) % noiseTiles.length];
    c.globalCompositeOperation = 'overlay';
    c.globalAlpha = Math.min(1, (ir ? 0.22 : 0.12) + staticAmt * 0.8);
    var ox = Math.random() * 160, oy = Math.random() * 160;
    c.fillStyle = c.createPattern(tile, 'repeat');
    c.save(); c.translate(-ox, -oy); c.fillRect(0, 0, W + 160, H + 160); c.restore();
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    if (staticAmt > 0.05) {
      // signal breaking up: grey snow and torn rows
      c.globalAlpha = staticAmt;
      c.fillStyle = c.createPattern(tile, 'repeat');
      c.save(); c.translate(-Math.random() * 160, -Math.random() * 160); c.fillRect(0, 0, W + 160, H + 160); c.restore();
      c.globalAlpha = 1;
      for (var r = 0; r < 6 * staticAmt; r++) {
        var y = Math.random() * H, h = 2 + Math.random() * H * 0.04;
        c.drawImage(this.cv, 0, y, W, h, (Math.random() - 0.5) * W * 0.08, y, W, h);
      }
    }
    if (ir) {
      c.fillStyle = c.createPattern(scanTile, 'repeat');
      c.globalAlpha = 0.18; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
    }
    var vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
  };

  Feed.prototype.osd = function (now, dpr) {
    var c = this.ctx, W = this.cv.width, H = this.cv.height, st = this.state;
    var fs = Math.max(11 * dpr, Math.min(H * 0.065, 30 * dpr)), pad = fs * 0.7;
    c.font = fs + 'px VT323, ui-monospace, Menlo, monospace';
    c.textBaseline = 'top';
    c.shadowColor = 'rgba(0,0,0,.8)'; c.shadowBlur = 3 * dpr;
    c.fillStyle = 'rgba(236,242,236,.92)';
    var label = st.label || (st.cam === 'parents' ? 'CAM 2  PARENTS’ ROOM' : st.cam === 'front' ? 'CAM 3  FRONT CAMERA · THIS DEVICE' : 'CAM 1  NURSERY');
    c.textAlign = 'left'; c.fillText(label, pad, pad);
    c.textAlign = 'right';
    var on = Math.floor(now / 1000) % 2 === 0;
    c.fillText('LIVE  ' + SW.clock(SW.d, true), W - pad, pad);
    if (on) { c.fillStyle = '#E0483E'; c.beginPath(); c.arc(W - pad - c.measureText('LIVE  ' + SW.clock(SW.d, true)).width - fs * 0.5, pad + fs * 0.45, fs * 0.22, 0, 6.283); c.fill(); }
    c.fillStyle = 'rgba(236,242,236,.92)';
    c.textBaseline = 'bottom';
    c.textAlign = 'left';
    var left = st.lost ? '' : (st.ir || st.cam !== 'nursery' ? 'IR ●' : 'COLOUR') + (st.ptz ? '   PTZ AUTO' : '') + (st.mic ? '   MIC ●' : '');
    c.fillText(left, pad, H - pad);
    c.textAlign = 'right';
    var right = st.lost ? '' : (st.presence > 1 ? 'IN ROOM: ' + st.presence + '   ' : '') + '21.0°C  48%';
    c.fillText(right, W - pad, H - pad);
    if (st.lost) { c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = (fs * 1.4) + 'px VT323, ui-monospace, monospace'; c.fillText('NO SIGNAL', W / 2, H / 2); }
    c.shadowBlur = 0;
  };

  SW.Feed = Feed;
  SW.feeds = feeds;
  SW.on('frame', function (now) { for (var i = 0; i < feeds.length; i++) feeds[i].draw(now); });

  /* ---------- the breathing graph beside the demo feed ---------- */
  SW.breathGraph = function (canvas) {
    var c = canvas.getContext('2d'), visible = true;
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(canvas);
    SW.on('frame', function (now) {
      if (!visible) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2), W = Math.round(canvas.clientWidth * dpr), H = Math.round(canvas.clientHeight * dpr);
      if (!W || !H) return;
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      c.clearRect(0, 0, W, H);
      var second = SW.smooth(0.27, 0.36, SW.d), t = now / 1000;
      function trace(rate, amp, color, alpha, phase) {
        c.globalAlpha = alpha; c.strokeStyle = color; c.lineWidth = 2 * dpr; c.beginPath();
        for (var x = 0; x <= W; x += 2 * dpr) {
          var tt = t - (W - x) / W * 6;
          var y = H / 2 - Math.sin(tt * Math.PI * 2 * rate / 60 + phase) * amp * H * 0.36;
          if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke(); c.globalAlpha = 1;
      }
      var style = getComputedStyle(canvas);
      trace(34, 0.5, style.getPropertyValue('--trace-1').trim() || '#4A57B8', 1, 0);
      if (second > 0.01) trace(11, 1, style.getPropertyValue('--trace-2').trim() || '#9AA3B8', second, 1.3);
    });
  };
})();
