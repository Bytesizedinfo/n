/* JC.art — illustration registry. Art is SVG markup rendered as data: URI images. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const defs = {};
  const cache = {};

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // Placeholder for ids that have no art yet: soft gradient + title.
  function placeholder(id, w, h) {
    const n = hash(id);
    const hue = n % 360;
    const hue2 = (hue + 40) % 360;
    const title = (defs[id] && defs[id].title) || id.replace(/^[a-z]+_/, '').replace(/_/g, ' ');
    const esc = String(title).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,72%)"/>` +
      `<stop offset="1" stop-color="hsl(${hue2},50%,42%)"/></linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
      `<circle cx="${w * 0.78}" cy="${h * 0.28}" r="${Math.min(w, h) * 0.12}" fill="rgba(255,255,255,.35)"/>` +
      `<path d="M0 ${h * 0.78} Q ${w * 0.3} ${h * 0.6} ${w * 0.55} ${h * 0.74} T ${w} ${h * 0.7} V ${h} H0Z" fill="rgba(0,0,0,.18)"/>` +
      `<text x="${w / 2}" y="${h * 0.92}" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif" ` +
      `font-size="${Math.round(Math.min(w, h) * 0.055)}" fill="rgba(255,255,255,.85)">${esc}</text></svg>`
    );
  }

  const art = {
    def(id, d) {
      defs[id] = Object.assign({ w: 1200, h: 900, tags: [] }, d, { id });
      delete cache[id];
      return defs[id];
    },
    has: (id) => !!(defs[id] && defs[id].svg),
    meta: (id) => defs[id] || { id, w: 1200, h: 900, title: id, tags: [] },
    ids: () => Object.keys(defs),
    svg(id) {
      const d = defs[id];
      if (d && d.svg) {
        try {
          return d.svg(d.w, d.h);
        } catch (e) {
          console.error('art render failed', id, e);
        }
      }
      const m = art.meta(id);
      return placeholder(id, m.w, m.h);
    },
    url(id) {
      if (!id) return '';
      if (cache[id]) return cache[id];
      const s = art.svg(id);
      const u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
      cache[id] = u;
      return u;
    },
    // Background-image element. fit: cover|contain
    el(id, opts) {
      opts = opts || {};
      const el = document.createElement('div');
      el.className = 'art' + (opts.cls ? ' ' + opts.cls : '');
      el.style.backgroundImage = `url("${art.url(id)}")`;
      el.style.backgroundSize = opts.fit || 'cover';
      el.style.backgroundPosition = opts.pos || 'center';
      el.style.backgroundRepeat = 'no-repeat';
      const m = art.meta(id);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', m.title || id);
      el.dataset.art = id;
      return el;
    },
    img(id, opts) {
      opts = opts || {};
      const el = document.createElement('img');
      el.src = art.url(id);
      el.alt = art.meta(id).title || id;
      el.draggable = false;
      if (opts.cls) el.className = opts.cls;
      return el;
    },
    ratio: (id) => {
      const m = art.meta(id);
      return m.w / m.h;
    },
  };
  JC.art = art;
})();
