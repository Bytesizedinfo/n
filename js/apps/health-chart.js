/* JC.hchart — small SVG chart kit used by Health and Stocks.
   Thin marks (≤24px bars, 4px rounded data ends, 2px lines), hairline solid grid, labels in text tokens,
   drag/hover scrubbing with onScrub(i|null), keyboard arrows, direct labels for extremes. */
(function () {
  'use strict';
  const JC = window.JC;
  const U = JC.util;
  const NS = 'http://www.w3.org/2000/svg';
  function S(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function niceStep(span, n) {
    const raw = span / Math.max(1, n);
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  }
  function niceScale(lo, hi, n, zero) {
    if (zero) lo = Math.min(0, lo);
    if (hi === lo) hi = lo + 1;
    const step = niceStep(hi - lo, n || 3);
    const a = Math.floor(lo / step) * step;
    const b = Math.ceil(hi / step) * step;
    const ticks = [];
    for (let v = a; v <= b + step * 0.001; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return { min: a, max: b, ticks };
  }
  function roundTop(x, y, w, h, r) {
    if (h <= 0.5) return '';
    r = Math.min(r, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  function capsule(x, y, w, h) {
    const r = w / 2;
    if (h < w) { const cy = y + h / 2; return `M${x},${cy}a${r},${r} 0 1,0 ${w},0a${r},${r} 0 1,0 ${-w},0`; }
    return `M${x},${y + r}a${r},${r} 0 0,1 ${w},0V${y + h - r}a${r},${r} 0 0,1 ${-w},0Z`;
  }

  /**
   * o: { kind:'bars'|'range'|'line'|'dots'|'stages', data:[…], w, h, color, colors, yMin, yMax, zero, ticks,
   *      fmtY, xLabels:[{i,text}], goal:{v,label}, annotate:[{i,text,pos}], onScrub(i), empty, axis:false,
   *      baseline:{v,label}, area:true, lanes:[{key,label,color}], t0, t1 (stages) }
   * data item: bars {v} · range {lo,hi} · line {v} · dots {v, color} · stages {s, e, stage}
   */
  function chart(o) {
    const W = o.w || 338, H = o.h || 200;
    const axis = o.axis !== false;
    const padR = axis ? (o.padR || 36) : 0, padB = axis ? 22 : 0, padT = o.padT == null ? 12 : o.padT;
    const pw = W - padR, ph = H - padB - padT;
    const wrap = document.createElement('div');
    wrap.className = 'hc' + (o.cls ? ' ' + o.cls : '');
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: o.fixedH ? H : null, role: 'img', 'aria-label': o.label || 'chart' });
    svg.style.aspectRatio = W + ' / ' + H;
    wrap.appendChild(svg);
    const data = o.data || [];
    const n = data.length;

    // y scale
    let vals = [];
    if (o.kind === 'range') data.forEach((d) => { if (d && d.hi != null) vals.push(d.lo, d.hi); });
    else if (o.kind === 'stages') vals = [0, 1];
    else if (o.kind === 'dots') data.forEach((d) => { (d.vs || (d.v != null ? [{ v: d.v }] : [])).forEach((p) => vals.push(p.v)); });
    else data.forEach((d) => { if (d && d.v != null) vals.push(d.v); });
    if (o.goal) vals.push(o.goal.v);
    if (o.baseline) vals.push(o.baseline.v);
    const has = vals.length > 0 && !(o.kind !== 'stages' && vals.every((v) => v === 0) && o.zeroIsEmpty);
    let lo = o.yMin != null ? o.yMin : vals.length ? Math.min(...vals) : 0;
    let hi = o.yMax != null ? o.yMax : vals.length ? Math.max(...vals) : 1;
    if (o.kind === 'bars' || o.zero) lo = Math.min(0, lo);
    if (o.kind === 'range' && o.yMin == null) lo = Math.max(0, lo - (hi - lo) * 0.15);
    if (o.kind === 'line' && o.yMin == null) { const pad = (hi - lo) * 0.12 || hi * 0.02 || 1; lo -= pad; hi += pad; }
    const sc = o.ticks ? { min: o.ticks[0], max: o.ticks[o.ticks.length - 1], ticks: o.ticks } : niceScale(lo, hi, o.nTicks || 3, o.kind === 'bars' || o.zero);
    const y = (v) => padT + ph - ((v - sc.min) / (sc.max - sc.min || 1)) * ph;
    const slot = pw / Math.max(1, n);
    const cx = (i) => (o.kind === 'line' ? (n <= 1 ? pw / 2 : (i / (n - 1)) * pw) : slot * i + slot / 2);

    // grid & y labels
    if (axis && o.kind === 'stages') {
      o.lanes.forEach((ln, k) => { if (k) S('line', { x1: 0, x2: pw, y1: padT + (ph / o.lanes.length) * k, y2: padT + (ph / o.lanes.length) * k, class: 'hc-grid' }, svg); });
      S('line', { x1: 0, x2: pw, y1: padT + ph, y2: padT + ph, class: 'hc-grid' }, svg);
    }
    if (axis && o.kind !== 'stages') {
      sc.ticks.forEach((t) => {
        S('line', { x1: 0, x2: pw, y1: y(t), y2: y(t), class: 'hc-grid' }, svg);
        const tx = S('text', { x: pw + 6, y: y(t) + 4, class: 'hc-ylab' }, svg);
        tx.textContent = o.fmtY ? o.fmtY(t) : String(t);
      });
    }
    if (axis) {
      (o.xLabels || []).forEach((xl) => {
        const tx = S('text', { x: o.kind === 'stages' ? xl.x * pw : cx(xl.i), y: H - 6, class: 'hc-xlab', 'text-anchor': xl.anchor || 'middle' }, svg);
        tx.textContent = xl.text;
        if (o.xTicks !== false) S('line', { x1: o.kind === 'stages' ? xl.x * pw : cx(xl.i), x2: o.kind === 'stages' ? xl.x * pw : cx(xl.i), y1: padT + ph, y2: padT + ph + 4, class: 'hc-grid' }, svg);
      });
    }
    const marks = S('g', { class: 'hc-marks' }, svg);
    const markEls = [];
    const color = o.color || 'var(--blue)';
    if (o.goal) {
      S('line', { x1: 0, x2: pw, y1: y(o.goal.v), y2: y(o.goal.v), class: 'hc-goal' }, svg);
      if (o.goal.label) { const t = S('text', { x: 2, y: y(o.goal.v) - 4, class: 'hc-goall' }, svg); t.textContent = o.goal.label; }
    }
    if (o.baseline) {
      S('line', { x1: 0, x2: pw, y1: y(o.baseline.v), y2: y(o.baseline.v), class: 'hc-base' }, svg);
    }

    if (o.kind === 'bars') {
      const bw = Math.min(o.barW || 24, slot * 0.62);
      data.forEach((d, i) => {
        const g = S('g', { class: 'hc-m' }, marks);
        if (d && d.v > 0) {
          const top = y(d.v), base = y(Math.max(0, sc.min));
          S('path', { d: roundTop(cx(i) - bw / 2, top, bw, base - top, Math.min(4, bw / 2)), fill: d.color || color }, g);
        }
        markEls.push(g);
      });
    } else if (o.kind === 'range') {
      const bw = Math.min(o.barW || 9, slot * 0.6);
      data.forEach((d, i) => {
        const g = S('g', { class: 'hc-m' }, marks);
        if (d && d.hi != null) {
          const top = y(d.hi), bot = y(d.lo);
          S('path', { d: capsule(cx(i) - bw / 2, top, bw, Math.max(bw, bot - top)), fill: d.color || color }, g);
        }
        markEls.push(g);
      });
    } else if (o.kind === 'dots') {
      data.forEach((d, i) => {
        const g = S('g', { class: 'hc-m' }, marks);
        (d.vs || (d.v != null ? [{ v: d.v, color: d.color }] : [])).forEach((p) => {
          S('circle', { cx: cx(i), cy: y(p.v), r: 4.5, fill: p.color || color, class: 'hc-dot' }, g);
        });
        markEls.push(g);
      });
    } else if (o.kind === 'line') {
      const pts = data.map((d, i) => (d && d.v != null ? [cx(i), y(d.v)] : null)).filter(Boolean);
      if (pts.length) {
        const path = 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L');
        if (o.area !== false) {
          const gid = 'hcg' + Math.random().toString(36).slice(2, 8);
          const defs = S('defs', null, svg);
          const lg = S('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
          S('stop', { offset: 0, 'stop-color': color, 'stop-opacity': 0.18 }, lg);
          S('stop', { offset: 1, 'stop-color': color, 'stop-opacity': 0.02 }, lg);
          S('path', { d: path + `L${pts[pts.length - 1][0].toFixed(1)},${padT + ph}L${pts[0][0].toFixed(1)},${padT + ph}Z`, fill: `url(#${gid})` }, marks);
        }
        S('path', { d: path, fill: 'none', stroke: color, 'stroke-width': o.lineW || 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', class: 'hc-line' }, marks);
        if (o.endDot !== false) { const p = pts[pts.length - 1]; S('circle', { cx: p[0], cy: p[1], r: 4, fill: color, class: 'hc-dot' }, marks); }
      }
    } else if (o.kind === 'stages') {
      const lanes = o.lanes;
      const laneH = ph / lanes.length;
      lanes.forEach((ln, k) => {
        if (axis) { const t = S('text', { x: pw + 6, y: padT + laneH * k + laneH / 2 + 4, class: 'hc-ylab' }, svg); t.textContent = ln.label; }
      });
      const span = o.t1 - o.t0;
      data.forEach((d, i) => {
        const k = lanes.findIndex((l) => l.key === d.stage);
        const x0 = ((d.s - o.t0) / span) * pw, x1 = ((d.e - o.t0) / span) * pw;
        const g = S('g', { class: 'hc-m' }, marks);
        S('rect', { x: x0 + 0.5, y: padT + laneH * k + laneH * 0.18, width: Math.max(1.5, x1 - x0 - 1), height: laneH * 0.64, rx: Math.min(4, laneH * 0.3), fill: lanes[k].color }, g);
        markEls.push(g);
      });
    }

    // annotations (direct labels on extremes)
    (o.annotate || []).forEach((a) => {
      const d = data[a.i];
      if (!d) return;
      const vy = o.kind === 'range' ? y(d.hi) : y(d.v);
      const t = S('text', { x: U.clamp(cx(a.i), 14, pw - 14), y: Math.max(11, vy - 7), class: 'hc-ann', 'text-anchor': 'middle' }, svg);
      t.textContent = a.text;
    });

    if (!has || (o.empty && vals.every((v) => !v))) {
      const t = S('text', { x: pw / 2, y: padT + ph / 2 + 5, class: 'hc-empty', 'text-anchor': 'middle' }, svg);
      t.textContent = o.empty || 'No Data';
    }

    // interaction
    const cross = S('line', { x1: 0, x2: 0, y1: padT, y2: padT + ph, class: 'hc-cross', visibility: 'hidden' }, svg);
    const hdot = o.kind === 'line' ? S('circle', { r: 5.5, class: 'hc-hdot', visibility: 'hidden', fill: color }, svg) : null;
    let sel = null;
    function select(i) {
      if (i === sel) return;
      sel = i;
      svg.classList.toggle('picking', i != null);
      markEls.forEach((m, k) => m.classList.toggle('on', k === i));
      if (i == null) { cross.setAttribute('visibility', 'hidden'); if (hdot) hdot.setAttribute('visibility', 'hidden'); }
      else {
        let x = o.kind === 'stages' ? ((data[i].s + data[i].e) / 2 - o.t0) / (o.t1 - o.t0) * pw : cx(i);
        cross.setAttribute('x1', x); cross.setAttribute('x2', x);
        cross.setAttribute('visibility', o.kind === 'bars' || o.kind === 'range' ? 'hidden' : 'visible');
        if (hdot && data[i] && data[i].v != null) { hdot.setAttribute('cx', x); hdot.setAttribute('cy', y(data[i].v)); hdot.setAttribute('visibility', 'visible'); }
      }
      o.onScrub && o.onScrub(i);
    }
    function idxAt(clientX) {
      const r = svg.getBoundingClientRect();
      const fx = ((clientX - r.left) / r.width) * W;
      if (o.kind === 'stages') {
        const t = o.t0 + (U.clamp(fx, 0, pw) / pw) * (o.t1 - o.t0);
        let best = 0;
        data.forEach((d, k) => { if (t >= d.s && t <= d.e) best = k; });
        return best;
      }
      if (o.kind === 'line') return U.clamp(Math.round((U.clamp(fx, 0, pw) / pw) * (n - 1)), 0, n - 1);
      return U.clamp(Math.floor(U.clamp(fx, 0, pw - 0.01) / slot), 0, n - 1);
    }
    if (n && o.interactive !== false) {
      svg.style.touchAction = 'pan-y';
      let down = false;
      svg.addEventListener('pointerdown', (e) => { down = true; e.stopPropagation(); try { svg.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } select(idxAt(e.clientX)); });
      svg.addEventListener('pointermove', (e) => { if (down || e.pointerType === 'mouse') select(idxAt(e.clientX)); });
      const end = () => { down = false; select(null); };
      svg.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') end(); else down = false; });
      svg.addEventListener('pointercancel', end);
      svg.addEventListener('pointerleave', end);
      svg.setAttribute('tabindex', '0');
      svg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { select(sel == null ? 0 : Math.min(n - 1, sel + 1)); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { select(sel == null ? n - 1 : Math.max(0, sel - 1)); e.preventDefault(); }
        else if (e.key === 'Escape') select(null);
      });
      svg.addEventListener('blur', () => select(null));
      wrap.__tap = true;
    }
    wrap.select = select;
    return wrap;
  }

  /** tiny sparkline / bars for cards (no axes, no interaction) */
  function spark(o) {
    return chart(Object.assign({ axis: false, interactive: false, padT: 4, w: 110, h: 44 }, o));
  }

  JC.hchart = { chart, spark, niceScale };
})();
