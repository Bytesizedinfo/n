/* Ripple — seed data (accounts, posts, reels, stories, DMs, activity) and Ripple-only illustrations (fish photos,
   bank PR cards, Hu Tao's hat, gossip cards, a few landscapes). Facts: docs/STORY.md ("Ripple" + handles).
   Collections: posts (shared schema, `by` = Ripple handle), wvusers, wvdms, wvact, wvreqs. Childe has two accounts:
   @tartaglia (public, bank PR) and @ajax.fishes (private, fish). */
(function () {
  'use strict';
  const JC = window.JC;
  const T = (s) => JC.time.parse(s);
  const FONT = 'font-family="-apple-system,Helvetica,Arial,sans-serif"';
  const SERIF = 'font-family="Georgia,\'Times New Roman\',serif"';
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function rnd(seed) { let x = seed * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }

  // ═══ fish photos ═══════════════════════════════════════════════════════════
  const SPECIES = {
    bass: { back: '#4d5b66', side: '#aab6bf', belly: '#eef2f4', fin: '#5d6a74', h: 0.27, line: true },
    grouper: { back: '#5a3b27', side: '#9b6a45', belly: '#e2c9a8', fin: '#4a2f1e', h: 0.34, spots: 22, spot: '#3a2416', big: true },
    snapper: { back: '#b8323b', side: '#e8707a', belly: '#fbe0e2', fin: '#c4434d', h: 0.32 },
    mackerel: { back: '#23604f', side: '#7fb6a4', belly: '#f2f6f4', fin: '#2c5d52', h: 0.22, waves: true },
    char: { back: '#4c5a33', side: '#9aa266', belly: '#f08a3c', fin: '#e46f2a', h: 0.26, spots: 16, spot: '#f6d9b0' },
    cod: { back: '#6a6233', side: '#a99f6a', belly: '#efe9d6', fin: '#6a6233', h: 0.28, spots: 26, spot: '#5b532a', line: true, barbel: true },
    puffer: { back: '#8c7a2c', side: '#d8c768', belly: '#fbf6e0', fin: '#a8952f', h: 0.62, spots: 18, spot: '#4a3f15', round: true },
    croaker: { back: '#b3862a', side: '#e8c25a', belly: '#fff2c4', fin: '#d4a43c', h: 0.28 },
    medaka: { back: '#9aa7a2', side: '#d5ddd8', belly: '#f4f7f5', fin: '#b7c2bd', h: 0.24, small: true },
    ribbon: { back: '#9fb0bf', side: '#dbe4ec', belly: '#f6f9fb', fin: '#c7d3de', h: 0.1, long: true },
    trout: { back: '#596b3c', side: '#c9b8a4', belly: '#f3ece4', fin: '#7e8a55', h: 0.25, spots: 30, spot: '#2d2a1d', stripe: '#d8607a' },
    flounder: { back: '#6b5a42', side: '#9c8768', belly: '#9c8768', fin: '#5d4e39', h: 0.5, spots: 14, spot: '#4a3d2b', flat: true },
    sturgeon: { back: '#3f4a52', side: '#7e8b93', belly: '#d9dee1', fin: '#3a444b', h: 0.18, scutes: true, big: true },
    angler: { back: '#4a3a31', side: '#6e574a', belly: '#9c8576', fin: '#3d2f27', h: 0.42, spots: 10, spot: '#2a1f19', lure: true, teeth: true },
    carp: { back: '#a7671c', side: '#e0a03c', belly: '#f6dfa2', fin: '#c47a25', h: 0.32, scales: true },
    eel: { back: '#2f3a2c', side: '#5f6a4e', belly: '#c6c39a', fin: '#2f3a2c', h: 0.08, long: true },
    squid: { squid: true, back: '#e6b8a8', side: '#f3d4c8', belly: '#fbe9e2', fin: '#e0a593', h: 0.22 },
  };
  function fishShape(L, f, R) {
    const H = L * f.h;
    if (f.squid) {
      let s = `<path d="M${-L * 0.5} 0C${-L * 0.42} ${-H} ${L * 0.05} ${-H * 0.9} ${L * 0.15} ${-H * 0.5}L${L * 0.15} ${H * 0.5}C${L * 0.05} ${H * 0.9} ${-L * 0.42} ${H} ${-L * 0.5} 0Z" fill="url(#fg)"/>`;
      for (let i = 0; i < 8; i++) { const y = -H * 0.42 + (i * H * 0.84) / 7; s += `<path d="M${L * 0.14} ${y.toFixed(1)}q${L * 0.12} ${(R() - 0.5) * H} ${L * (0.3 + R() * 0.12)} ${((R() - 0.5) * H * 0.8).toFixed(1)}" stroke="${f.fin}" stroke-width="${(H * 0.12).toFixed(1)}" fill="none" stroke-linecap="round"/>`; }
      return s + `<circle cx="${L * 0.08}" cy="${-H * 0.2}" r="${H * 0.14}" fill="#1b1b1b"/><circle cx="${L * 0.09}" cy="${-H * 0.24}" r="${H * 0.04}" fill="#fff"/>`;
    }
    const x0 = -L / 2, xt = L * (f.long ? 0.44 : 0.3), xe = L / 2;
    let s = '';
    const tail = `L${xe} ${-H * 0.62}L${xe - L * 0.06} 0L${xe} ${H * 0.62}`;
    const body = f.round
      ? `M${x0} 0C${x0} ${-H * 0.62} ${xt - L * 0.05} ${-H * 0.62} ${xt} ${-H * 0.14}${tail}L${xt} ${H * 0.14}C${xt - L * 0.05} ${H * 0.62} ${x0} ${H * 0.62} ${x0} 0Z`
      : `M${x0} ${H * 0.05}C${x0 + L * 0.12} ${-H * 0.62} ${xt - L * 0.2} ${-H * 0.58} ${xt} ${-H * 0.12}${tail}L${xt} ${H * 0.12}C${xt - L * 0.2} ${H * 0.56} ${x0 + L * 0.12} ${H * 0.55} ${x0} ${H * 0.05}Z`;
    // fins
    s += `<path d="M${x0 + L * 0.22} ${-H * 0.44}C${x0 + L * 0.3} ${-H * 0.95} ${x0 + L * 0.52} ${-H * 0.9} ${x0 + L * 0.62} ${-H * 0.36}Z" fill="${f.fin}" opacity=".92"/>`;
    s += `<path d="M${x0 + L * 0.5} ${H * 0.36}C${x0 + L * 0.56} ${H * 0.72} ${x0 + L * 0.66} ${H * 0.7} ${x0 + L * 0.7} ${H * 0.3}Z" fill="${f.fin}" opacity=".85"/>`;
    s += `<path d="${body}" fill="url(#fg)" stroke="rgba(0,0,0,.18)" stroke-width="2"/>`;
    if (f.waves) for (let i = 0; i < 9; i++) { const x = x0 + L * 0.18 + i * L * 0.055; s += `<path d="M${x} ${-H * 0.42}q${L * 0.03} ${H * 0.2} 0 ${H * 0.4}" stroke="#123d33" stroke-width="${L * 0.012}" fill="none" opacity=".8"/>`; }
    if (f.stripe) s += `<path d="M${x0 + L * 0.14} 0L${xt} 0" stroke="${f.stripe}" stroke-width="${H * 0.16}" opacity=".7" stroke-linecap="round"/>`;
    if (f.scales) for (let i = 0; i < 26; i++) { const x = x0 + L * 0.2 + (i % 7) * L * 0.07, y = -H * 0.3 + Math.floor(i / 7) * H * 0.2; s += `<path d="M${x} ${y}a${L * 0.03} ${L * 0.03} 0 0 0 0 ${H * 0.18}" stroke="rgba(120,60,10,.35)" stroke-width="2" fill="none"/>`; }
    if (f.scutes) for (let i = 0; i < 9; i++) { const x = x0 + L * 0.16 + i * L * 0.07; s += `<path d="M${x} ${-H * 0.5}l${L * 0.018} ${-H * 0.16}l${L * 0.018} ${H * 0.16}z" fill="#d9dee1" opacity=".8"/>`; }
    if (f.spots) for (let i = 0; i < f.spots; i++) { const x = x0 + L * (0.15 + R() * 0.55), y = (R() - 0.5) * H * 0.7; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(L * (0.008 + R() * 0.012)).toFixed(1)}" fill="${f.spot}" opacity=".75"/>`; }
    if (f.line) s += `<path d="M${x0 + L * 0.16} ${-H * 0.06}Q${x0 + L * 0.5} ${-H * 0.18} ${xt} ${-H * 0.02}" stroke="rgba(30,40,46,.45)" stroke-width="${L * 0.006}" fill="none"/>`;
    // gill + eye + mouth
    s += `<path d="M${x0 + L * 0.17} ${-H * 0.4}Q${x0 + L * 0.24} 0 ${x0 + L * 0.17} ${H * 0.36}" stroke="rgba(0,0,0,.28)" stroke-width="${L * 0.008}" fill="none"/>`;
    const er = Math.max(6, H * (f.round ? 0.12 : 0.15));
    s += `<circle cx="${x0 + L * 0.085}" cy="${-H * 0.14}" r="${er}" fill="#f4f1e6" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="${x0 + L * 0.08}" cy="${-H * 0.14}" r="${er * 0.6}" fill="#151515"/><circle cx="${x0 + L * 0.074}" cy="${-H * 0.17}" r="${er * 0.2}" fill="#fff"/>`;
    s += `<path d="M${x0} ${H * 0.06}l${L * 0.05} ${H * 0.04}" stroke="rgba(0,0,0,.45)" stroke-width="${L * 0.007}" stroke-linecap="round"/>`;
    if (f.teeth) for (let i = 0; i < 6; i++) s += `<path d="M${x0 + i * L * 0.012} ${H * 0.05}l${L * 0.005} ${H * 0.08}l${L * 0.005} ${-H * 0.08}" fill="#f4f1e6"/>`;
    if (f.lure) s += `<path d="M${x0 + L * 0.1} ${-H * 0.45}q${-L * 0.05} ${-H * 0.6} ${-L * 0.13} ${-H * 0.35}" stroke="${f.fin}" stroke-width="${L * 0.008}" fill="none"/><circle cx="${x0 - L * 0.03}" cy="${-H * 0.8}" r="${L * 0.018}" fill="#fff3a8"/>`;
    if (f.barbel) s += `<path d="M${x0 + L * 0.03} ${H * 0.16}q${L * 0.01} ${H * 0.2} ${-L * 0.01} ${H * 0.28}" stroke="${f.fin}" stroke-width="${L * 0.006}" fill="none"/>`;
    return s;
  }
  const SCENES = {
    dawn: (w, h, R) => `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb3d9"/><stop offset=".55" stop-color="#f3c08e"/><stop offset="1" stop-color="#f7d7a8"/></linearGradient><linearGradient id="se" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d8db0"/><stop offset="1" stop-color="#284e6c"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#sk)"/><circle cx="${w * 0.72}" cy="${h * 0.3}" r="${w * 0.09}" fill="#ffe7b8" opacity=".95"/><rect y="${h * 0.36}" width="${w}" height="${h * 0.22}" fill="url(#se)"/>${Array.from({ length: 10 }, () => `<path d="M${R() * w} ${h * (0.38 + R() * 0.18)}h${30 + R() * 80}" stroke="#ffe3b5" stroke-opacity=".5" stroke-width="3"/>`).join('')}<path d="M0 ${h * 0.34}L${w * 0.08} ${h * 0.3}L${w * 0.16} ${h * 0.33}L${w * 0.28} ${h * 0.29}L${w * 0.36} ${h * 0.345}L${w * 0.36} ${h * 0.36}H0Z" fill="#6c7d8f" opacity=".55"/><rect y="${h * 0.56}" width="${w}" height="${h * 0.44}" fill="#8a6644"/>${Array.from({ length: 8 }, (_, i) => `<rect y="${h * 0.56 + i * h * 0.056}" width="${w}" height="3" fill="#6d4f33"/>`).join('')}`,
    night: (w, h, R) => `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1428"/><stop offset="1" stop-color="#1f3459"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#sk)"/><circle cx="${w * 0.2}" cy="${h * 0.13}" r="${w * 0.05}" fill="#f4ecd0"/>${Array.from({ length: 30 }, () => `<circle cx="${(R() * w).toFixed(0)}" cy="${(R() * h * 0.3).toFixed(0)}" r="${(1 + R() * 2).toFixed(1)}" fill="#fff" opacity="${(0.3 + R() * 0.6).toFixed(2)}"/>`).join('')}${Array.from({ length: 7 }, (_, i) => { const x = w * (0.08 + i * 0.14), y = h * (0.3 + (i % 2) * 0.03); return `<circle cx="${x}" cy="${y}" r="38" fill="#ff8a3d" opacity=".18"/><rect x="${x - 14}" y="${y - 20}" width="28" height="40" rx="12" fill="#e8452c"/><rect x="${x - 10}" y="${y - 24}" width="20" height="6" fill="#ffd27a"/>`; }).join('')}<rect y="${h * 0.4}" width="${w}" height="${h * 0.18}" fill="#0c1b33"/>${Array.from({ length: 14 }, () => `<path d="M${R() * w} ${h * (0.42 + R() * 0.14)}h${20 + R() * 60}" stroke="#ff9d5c" stroke-opacity=".35" stroke-width="3"/>`).join('')}<rect y="${h * 0.56}" width="${w}" height="${h * 0.44}" fill="#3a2a1d"/>${Array.from({ length: 8 }, (_, i) => `<rect y="${h * 0.56 + i * h * 0.056}" width="${w}" height="3" fill="#24190f"/>`).join('')}<rect y="${h * 0.56}" width="${w}" height="${h * 0.44}" fill="#ffb15c" opacity=".06"/>`,
    ice: (w, h, R) => `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d9e8"/><stop offset="1" stop-color="#eef3f8"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#sk)"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${w * (0.05 + i * 0.16)} ${h * 0.34}l${w * 0.05} ${-h * 0.05}l${w * 0.05} ${h * 0.05}z" fill="#7a8796"/><rect x="${w * (0.06 + i * 0.16)}" y="${h * 0.34}" width="${w * 0.08}" height="${h * 0.04}" fill="#a65a3c"/>`).join('')}<rect y="${h * 0.38}" width="${w}" height="${h * 0.62}" fill="#f7fafc"/><path d="M0 ${h * 0.5}Q${w * 0.5} ${h * 0.44} ${w} ${h * 0.52}V${h}H0Z" fill="#e5edf5"/><ellipse cx="${w * 0.78}" cy="${h * 0.86}" rx="${w * 0.16}" ry="${h * 0.05}" fill="#1d4466"/><ellipse cx="${w * 0.78}" cy="${h * 0.855}" rx="${w * 0.13}" ry="${h * 0.035}" fill="#0e2a42"/>${Array.from({ length: 40 }, () => `<circle cx="${(R() * w).toFixed(0)}" cy="${(R() * h).toFixed(0)}" r="${(1.5 + R() * 3).toFixed(1)}" fill="#fff" opacity=".8"/>`).join('')}`,
    boat: (w, h, R) => `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb7e0"/><stop offset="1" stop-color="#d7ecf7"/></linearGradient><linearGradient id="se" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7fb0"/><stop offset="1" stop-color="#1a4f78"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#sk)"/>${Array.from({ length: 4 }, () => `<ellipse cx="${R() * w}" cy="${h * (0.08 + R() * 0.16)}" rx="${60 + R() * 70}" ry="${18 + R() * 10}" fill="#fff" opacity=".8"/>`).join('')}<rect y="${h * 0.34}" width="${w}" height="${h * 0.3}" fill="url(#se)"/>${Array.from({ length: 16 }, () => `<path d="M${R() * w} ${h * (0.36 + R() * 0.26)}q14 -8 28 0t28 0" stroke="#bfe3f7" stroke-opacity=".6" stroke-width="3" fill="none"/>`).join('')}<path d="M0 ${h * 0.6}L${w} ${h * 0.56}V${h}H0Z" fill="#c9ccc6"/><path d="M0 ${h * 0.6}L${w} ${h * 0.56}" stroke="#e6e8e3" stroke-width="10"/>${Array.from({ length: 7 }, (_, i) => `<path d="M0 ${h * (0.64 + i * 0.055)}L${w} ${h * (0.6 + i * 0.055)}" stroke="#aeb2ab" stroke-width="3"/>`).join('')}`,
  };
  function fishPhoto(o) {
    return (w, h) => {
      const R = rnd(o.seed || 7);
      const f = SPECIES[o.sp] || SPECIES.bass;
      const L = w * (o.size || (f.small ? 0.36 : f.big ? 0.95 : f.long ? 0.9 : 0.7));
      const cx = w * 0.5, cy = h * (o.y || 0.7);
      const ang = o.ang != null ? o.ang : (R() - 0.5) * 16;
      let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">` + SCENES[o.scene || 'dawn'](w, h, R);
      s = s.replace('</defs>', `<linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f.back}"/><stop offset=".55" stop-color="${f.side}"/><stop offset="1" stop-color="${f.belly}"/></linearGradient></defs>`);
      if (o.tape) s += `<g transform="translate(${cx - L * 0.55} ${cy + L * f.h * 0.75}) rotate(${ang})"><rect width="${L * 1.1}" height="${w * 0.035}" fill="#f2c94c"/>${Array.from({ length: 23 }, (_, i) => `<rect x="${i * L * 0.05}" width="2" height="${i % 2 ? w * 0.012 : w * 0.02}" fill="#3b2f0e"/>`).join('')}</g>`;
      s += `<ellipse cx="${cx}" cy="${cy + L * f.h * 0.55}" rx="${L * 0.48}" ry="${L * 0.05}" fill="#000" opacity=".18"/>`;
      s += `<g transform="translate(${cx} ${cy}) rotate(${ang})">${fishShape(L, f, R)}</g>`;
      if (o.hand) {
        const hx = cx + L * 0.28 * Math.cos((ang * Math.PI) / 180), hy = cy + L * 0.28 * Math.sin((ang * Math.PI) / 180);
        s += `<path d="M${hx + 40} ${hy + 30}L${w * 0.98} ${h * 1.02}L${w * 0.7} ${h * 1.02}L${hx - 30} ${hy + 40}Z" fill="${o.glove ? '#7a1f22' : '#2b2b30'}"/>`;
        s += `<g transform="translate(${hx} ${hy}) rotate(${ang - 10})"><rect x="-46" y="-24" width="92" height="64" rx="28" fill="${o.glove ? '#1f1f22' : '#f0c8a6'}"/>${[0, 1, 2, 3].map((i) => `<rect x="${-44 + i * 23}" y="-46" width="20" height="40" rx="10" fill="${o.glove ? '#262629' : '#ecc19c'}"/>`).join('')}</g>`;
      }
      if (o.stamp) s += `<text x="${w - 36}" y="${h - 40}" text-anchor="end" font-family="Menlo,monospace" font-size="38" fill="#ff9f43" opacity=".9">${o.stamp}</text>`;
      return s + '</svg>';
    };
  }

  // ═══ cards (bank PR, gossip, news, posters) ═══════════════════════════════
  function card(o) {
    return (w, h) => {
      let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.g[0]}"/><stop offset="1" stop-color="${o.g[1]}"/></linearGradient><radialGradient id="r" cx=".8" cy=".12" r=".9"><stop offset="0" stop-color="rgba(255,255,255,.18)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#r)"/>`;
      if (o.frame) s += `<rect x="40" y="40" width="${w - 80}" height="${h - 80}" fill="none" stroke="${o.frame}" stroke-width="3" opacity=".7"/><rect x="56" y="56" width="${w - 112}" height="${h - 112}" fill="none" stroke="${o.frame}" stroke-width="1.5" opacity=".5"/>`;
      if (o.snow) { const cx = w / 2, cy = o.snowY || h * 0.27, r = o.snowR || 92; for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; s += `<path d="M${cx} ${cy}L${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}" stroke="${o.snow}" stroke-width="10" stroke-linecap="round"/>`; [0.45, 0.72].forEach((k) => { const px = cx + Math.cos(a) * r * k, py = cy + Math.sin(a) * r * k; [-0.6, 0.6].forEach((d) => { s += `<path d="M${px.toFixed(1)} ${py.toFixed(1)}l${(Math.cos(a + d) * r * 0.24).toFixed(1)} ${(Math.sin(a + d) * r * 0.24).toFixed(1)}" stroke="${o.snow}" stroke-width="7" stroke-linecap="round"/>`; }); }); } }
      if (o.lanterns) for (let i = 0; i < o.lanterns; i++) { const x = w * (0.12 + (i * 0.76) / Math.max(1, o.lanterns - 1)), y = h * (0.18 + (i % 2) * 0.06); s += `<path d="M${x} 0V${y - 40}" stroke="#ffd27a" stroke-width="2" opacity=".6"/><circle cx="${x}" cy="${y}" r="70" fill="#ffb347" opacity=".14"/><rect x="${x - 30}" y="${y - 42}" width="60" height="84" rx="26" fill="#e8452c"/><rect x="${x - 20}" y="${y - 48}" width="40" height="10" fill="#ffd27a"/><rect x="${x - 20}" y="${y + 40}" width="40" height="8" fill="#ffd27a"/>`; }
      if (o.candle) { const cx = w / 2, cy = h * 0.32; s += `<ellipse cx="${cx}" cy="${cy - 70}" rx="34" ry="62" fill="#ffd27a" opacity=".25"/><path d="M${cx} ${cy - 110}c-22 30-18 52 0 64 18-12 22-34 0-64z" fill="#ffcf6b"/><rect x="${cx - 34}" y="${cy - 44}" width="68" height="160" rx="10" fill="#f4efe4"/>`; }
      if (o.cake) { const cx = w / 2, cy = h * 0.36; s += `<ellipse cx="${cx}" cy="${cy + 120}" rx="300" ry="40" fill="#000" opacity=".15"/><path d="M${cx - 260} ${cy}c80-90 300-90 400 0l70-60v150l-70-60c-100 90-320 90-400 0z" fill="#f6a5b0"/><circle cx="${cx - 190}" cy="${cy - 10}" r="16" fill="#1d2b44"/><path d="M${cx - 100} ${cy - 50}q40 50 0 100" stroke="#fff" stroke-width="10" fill="none" opacity=".7"/><rect x="${cx - 6}" y="${cy - 130}" width="12" height="60" fill="#8ec5ff"/><path d="M${cx} ${cy - 160}c-10 12-8 22 0 28 8-6 10-16 0-28z" fill="#ffcf6b"/>`; }
      if (o.toys) for (let i = 0; i < 9; i++) { const x = 140 + (i % 3) * 270, y = h * 0.16 + Math.floor(i / 3) * 170; s += `<rect x="${x}" y="${y}" width="200" height="140" rx="16" fill="${['#e03131', '#1c7ed6', '#f59f00', '#2f9e44', '#ae3ec9'][i % 5]}"/><rect x="${x + 92}" y="${y}" width="16" height="140" fill="#fff" opacity=".85"/><rect x="${x}" y="${y + 62}" width="200" height="16" fill="#fff" opacity=".85"/>`; }
      if (o.waves) for (let i = 0; i < 5; i++) s += `<path d="M0 ${h * (0.32 + i * 0.05)}q90 -30 180 0t180 0t180 0t180 0t180 0t180 0" stroke="${o.waves}" stroke-width="10" fill="none" opacity="${0.7 - i * 0.12}"/>`;
      if (o.board) s += `<rect x="${w * 0.12}" y="${h * 0.12}" width="${w * 0.76}" height="${h * 0.38}" rx="18" fill="#1f3b2b" stroke="#6b4a2a" stroke-width="16"/><text x="${w / 2}" y="${h * 0.27}" text-anchor="middle" ${FONT} font-size="64" font-weight="700" fill="#e9f5ec">ℳ + ℳ = ℳℳ</text><text x="${w / 2}" y="${h * 0.37}" text-anchor="middle" ${FONT} font-size="44" fill="#e9f5ec" opacity=".8">read the contract. twice.</text>`;
      if (o.bags) for (let i = 0; i < 6; i++) { const x = 160 + i * 140, y = h * 0.34 + (i % 2) * 40; s += `<path d="M${x} ${y}q50 -50 100 0l10 140h-120z" fill="#2b2d31"/><path d="M${x + 20} ${y - 10}q30 -40 60 0" stroke="#2b2d31" stroke-width="8" fill="none"/>`; }
      (o.lines || []).forEach((l) => { s += `<text x="${l.x != null ? l.x : w / 2}" y="${l.y}" text-anchor="${l.anchor || 'middle'}" ${l.serif ? SERIF : FONT} font-weight="${l.wt || 800}" font-size="${l.size}" fill="${l.fill || '#fff'}" letter-spacing="${l.ls || 0}" ${l.op ? `fill-opacity="${l.op}"` : ''}>${esc(l.t)}</text>`; });
      return s + '</svg>';
    };
  }
  const NB = ['#0f2c52', '#081628'];
  const defs = {
    rp_pr_open: { title: 'Northland Bank Liyue Branch opening', w: 1080, h: 1350, svg: card({ g: NB, frame: '#d4b26a', snow: '#e8d5a3', lines: [
      { t: 'NORTHLAND BANK', y: 560, size: 80, ls: 10, fill: '#e8d5a3' }, { t: 'LIYUE BRANCH', y: 650, size: 56, ls: 14, wt: 500, fill: '#e8d5a3', op: 0.85 },
      { t: 'Now open on Harbor Road', y: 820, size: 58, wt: 700, serif: true }, { t: 'Harbor Road 1 · 09:00–18:00', y: 900, size: 40, wt: 500, op: 0.8 },
      { t: 'Stability. Discretion. Northland.', y: 1160, size: 40, wt: 500, serif: true, op: 0.75 }] }) },
    rp_pr_gala: { title: 'Northland Spring Gala', w: 1080, h: 1350, svg: card({ g: ['#3a0d14', '#14070a'], frame: '#d4b26a', lanterns: 5, lines: [
      { t: 'NORTHLAND', y: 640, size: 78, ls: 12, fill: '#e8d5a3' }, { t: 'SPRING GALA', y: 740, size: 92, ls: 6, serif: true },
      { t: 'An evening of Liyue tradition', y: 860, size: 46, wt: 500, op: 0.85 }, { t: '25 · IV · 2026', y: 1120, size: 44, ls: 8, wt: 600, fill: '#e8d5a3' }] }) },
    rp_pr_toys: { title: 'Northland Toy Drive', w: 1080, h: 1350, svg: card({ g: ['#1c7ed6', '#0b3d75'], toys: true, lines: [
      { t: '2,400 TOYS', y: 880, size: 120, ls: 4 }, { t: 'for the children of Liyue Harbor', y: 960, size: 46, wt: 500, op: 0.9 },
      { t: 'NORTHLAND TOY DRIVE 2026', y: 1180, size: 44, ls: 6, wt: 700, fill: '#ffe08a' }] }) },
    rp_pr_cleanup: { title: 'Shoreline clean-up', w: 1080, h: 1080, svg: card({ g: ['#0b7285', '#073b4c'], waves: '#99e9f2', bags: true, lines: [
      { t: '2 KM OF SHORELINE', y: 160, size: 74, ls: 4 }, { t: 'Liyue Branch volunteer morning', y: 230, size: 40, wt: 500, op: 0.85 },
      { t: '41 bottles · 1 boot · 0 fish', y: 960, size: 52, wt: 700, fill: '#c5f6fa' }] }) },
    rp_pr_cake: { title: 'Birthday cake', w: 1080, h: 1080, svg: card({ g: ['#f8f0e3', '#ead8bd'], cake: true, lines: [
      { t: 'С ДНЁМ РОЖДЕНИЯ', y: 760, size: 64, ls: 6, fill: '#7a1f22' }, { t: 'from the Liyue Branch', y: 840, size: 44, wt: 500, fill: '#5c4630' }, { t: '20 · VII', y: 960, size: 48, ls: 8, wt: 700, fill: '#0f2c52' }] }) },
    rp_pr_workshop: { title: 'Financial literacy workshop', w: 1080, h: 1080, svg: card({ g: ['#f1efe7', '#d8d3c3'], board: true, lines: [
      { t: 'YOUNG MERCHANTS’ WORKSHOP', y: 720, size: 52, ls: 3, fill: '#0f2c52' }, { t: 'Northland Bank · Liyue Branch', y: 790, size: 40, wt: 500, fill: '#3a4a5c' }, { t: 'Lesson one: always read the contract.', y: 930, size: 42, wt: 600, serif: true, fill: '#0f2c52' }] }) },
    rp_pr_condolence: { title: 'Condolences', w: 1080, h: 1350, svg: card({ g: ['#1b1b1d', '#050506'], candle: true, lines: [
      { t: 'IN MEMORY OF', y: 760, size: 52, ls: 12, wt: 500, op: 0.8 }, { t: 'REX LAPIS', y: 880, size: 120, ls: 8, serif: true, fill: '#e8d5a3' },
      { t: 'Northland Bank extends its deepest condolences', y: 1020, size: 38, wt: 500, op: 0.85 }, { t: 'to the people of Liyue.', y: 1075, size: 38, wt: 500, op: 0.85 }] }) },
    rp_pr_lanterns: { title: 'Lanterns for the Rite of Parting', w: 1080, h: 1350, svg: card({ g: ['#14213d', '#060b16'], lanterns: 6, lines: [
      { t: 'THE RITE OF PARTING', y: 760, size: 76, ls: 6, serif: true, fill: '#ffd27a' }, { t: 'Sunday 18 October · Yujing Terrace', y: 850, size: 44, wt: 500, op: 0.9 },
      { t: 'Lanterns sponsored by', y: 1080, size: 38, wt: 500, op: 0.7 }, { t: 'NORTHLAND BANK · LIYUE BRANCH', y: 1140, size: 44, ls: 6, wt: 700, fill: '#e8d5a3' }] }) },
    rp_ht_sale: { title: 'Wangsheng autumn sale', w: 1080, h: 1080, svg: card({ g: ['#4a1220', '#1d070c'], frame: '#e7a05a', lines: [
      { t: '🍂 AUTUMN SALE 🍂', y: 250, size: 76, ls: 4, fill: '#ffd8a8' }, { t: '2nd coffin', y: 470, size: 140, serif: true }, { t: 'HALF PRICE', y: 620, size: 130, ls: 6, fill: '#ff8787' },
      { t: 'bring a friend (or two) 👻', y: 790, size: 50, wt: 600 }, { t: 'WANGSHENG FUNERAL PARLOR · FEIYUN SLOPE', y: 940, size: 34, ls: 4, wt: 600, op: 0.75 }] }) },
    rp_ht_poem: { title: 'A poem', w: 1080, h: 1080, svg: card({ g: ['#f4e8d0', '#e2cfa8'], frame: '#8a2b2b', lines: [
      { t: 'a poem, by the director 👻', y: 200, size: 44, wt: 600, fill: '#8a2b2b' },
      { t: 'the moon goes up,', y: 380, size: 62, serif: true, wt: 500, fill: '#3a2a1a' }, { t: 'the tide goes out,', y: 470, size: 62, serif: true, wt: 500, fill: '#3a2a1a' },
      { t: 'a ghost says “boo”', y: 560, size: 62, serif: true, wt: 500, fill: '#3a2a1a' }, { t: 'and runs about.', y: 650, size: 62, serif: true, wt: 500, fill: '#3a2a1a' },
      { t: '(he is very small. he lives in coffin 7.)', y: 820, size: 40, wt: 500, fill: '#8a2b2b' }] }) },
    rp_kb_story: { title: 'gossip', w: 900, h: 1600, svg: card({ g: ['#2d1240', '#0c0613'], lines: [
      { t: '🎭', y: 520, size: 200 }, { t: 'vol. 11 is up.', y: 760, size: 80 }, { t: 'he knows who he is.', y: 860, size: 56, wt: 500, op: 0.8 }, { t: '🐟', y: 1020, size: 120 }] }) },
    rp_news_rite: { title: 'Rite of Parting announced', w: 1080, h: 1080, svg: card({ g: ['#26221e', '#0d0b09'], frame: '#c9a35a', lines: [
      { t: 'LIYUE HARBOR NEWS', y: 170, size: 40, ls: 8, wt: 700, fill: '#ff922b' }, { t: 'Liyue mourns', y: 430, size: 110, serif: true }, { t: 'REX LAPIS', y: 570, size: 120, ls: 8, serif: true, fill: '#e8d5a3' },
      { t: 'Rite of Parting · Sunday 18 October', y: 740, size: 46, wt: 600 }, { t: 'Yujing Terrace · 10:00', y: 810, size: 42, wt: 500, op: 0.8 }] }) },
    rp_news_blackout: { title: 'Harbor blackout', w: 1080, h: 1080, svg: card({ g: ['#050608', '#101622'], waves: '#3b5b7a', lines: [
      { t: 'BREAKING', y: 180, size: 56, ls: 12, fill: '#ff6b6b' }, { t: 'HARBOR', y: 600, size: 150, ls: 6 }, { t: 'BLACKOUT', y: 760, size: 150, ls: 6, fill: '#ffd43b' },
      { t: 'Unusual tides reported near Guyun Stone Forest', y: 900, size: 40, wt: 500, op: 0.85 }, { t: '#HarborBlackout', y: 990, size: 44, wt: 700, fill: '#74c0fc' }] }) },
    rp_yj_poster: { title: 'The Divine Damsel of Devastation', w: 1080, h: 1350, svg: card({ g: ['#5c1020', '#1e050b'], frame: '#e5c07b', lanterns: 3, lines: [
      { t: 'YUN JIN TROUPE', y: 520, size: 52, ls: 12, fill: '#e5c07b' }, { t: 'The Divine Damsel', y: 660, size: 86, serif: true }, { t: 'of Devastation', y: 760, size: 86, serif: true },
      { t: 'Saturday 17 October · 15:00', y: 920, size: 48, wt: 600 }, { t: 'Heyu Tea House', y: 990, size: 44, wt: 500, op: 0.8 }, { t: 'BOXES SOLD OUT', y: 1180, size: 46, ls: 8, fill: '#ff8787' }] }) },
  };
  // Hu Tao's hat (the butterfly. or the moth.)
  defs.rp_ht_hat = { title: 'Hu Tao’s new hat', w: 1080, h: 1350, svg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1a24"/><stop offset="1" stop-color="#120a10"/></linearGradient><radialGradient id="l" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#b)"/><rect width="${w}" height="${h}" fill="url(#l)"/>` +
    `<ellipse cx="540" cy="900" rx="420" ry="90" fill="#000" opacity=".35"/><path d="M160 820c40-60 720-60 760 0 30 50-790 50-760 0z" fill="#3b2a24"/><path d="M330 800c-10-250 70-380 210-380s220 130 210 380z" fill="#4a3329"/><path d="M330 760c120 30 300 30 420 0v40c-120 30-300 30-420 0z" fill="#8f1f2a"/>` +
    [[420, 640], [470, 600], [380, 690]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="24" ry="38" cy="-30" fill="#f3a6b6" transform="rotate(${a})"/>`).join('')}<circle r="14" fill="#ffd27a"/></g>`).join('') +
    `<g transform="translate(700 560) rotate(-18)"><path d="M0 0c-30-90-150-120-170-40-14 60 80 90 170 40z" fill="#7a5a3a"/><path d="M0 0c-20 60-120 110-150 60-20-40 70-70 150-60z" fill="#6a4c30"/><path d="M0 0c30-90 150-120 170-40 14 60-80 90-170 40z" fill="#7a5a3a"/><path d="M0 0c20 60 120 110 150 60 20-40-70-70-150-60z" fill="#6a4c30"/><circle cx="-90" cy="-40" r="16" fill="#c9a36a"/><circle cx="90" cy="-40" r="16" fill="#c9a36a"/><rect x="-7" y="-60" width="14" height="110" rx="7" fill="#2a1d14"/><path d="M-4 -60q-20 -40 -44 -46M4 -60q20 -40 44 -46" stroke="#2a1d14" stroke-width="5" fill="none"/></g>` +
    `<text x="540" y="1180" text-anchor="middle" ${FONT} font-size="44" font-weight="600" fill="#f3d9a4" opacity=".7">🦋 the soul’s journey 🦋</text></svg>` };
  defs.rp_ht_ghost = { title: 'Ghost at the parlor', w: 1080, h: 1350, svg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1426"/><stop offset="1" stop-color="#1c1124"/></linearGradient><radialGradient id="g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d7f5ff" stop-opacity=".55"/><stop offset="1" stop-color="#d7f5ff" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#b)"/>` +
    `<rect x="160" y="420" width="760" height="760" fill="#3a1a1e"/><rect x="200" y="460" width="320" height="680" fill="#5a2a2c"/><rect x="560" y="460" width="320" height="680" fill="#5a2a2c"/><path d="M120 420h840l-60-90H180z" fill="#2a1416"/><circle cx="500" cy="800" r="12" fill="#d4a34a"/><circle cx="580" cy="800" r="12" fill="#d4a34a"/>` +
    `<circle cx="540" cy="680" r="260" fill="url(#g)"/><path d="M430 860c0-200 40-320 110-320s110 120 110 320l-30-30-25 30-30-30-25 30-25-30-25 30z" fill="#eef8ff" opacity=".9"/><ellipse cx="510" cy="660" rx="14" ry="22" fill="#1d1d2e"/><ellipse cx="570" cy="660" rx="14" ry="22" fill="#1d1d2e"/><ellipse cx="540" cy="720" rx="16" ry="12" fill="#1d1d2e"/>` +
    Array.from({ length: 5 }, (_, i) => `<circle cx="${250 + i * 150}" cy="${300 + (i % 2) * 60}" r="${10 + (i % 3) * 4}" fill="#9bd7ff" opacity=".5"/>`).join('') + `</svg>` };
  // a few landscapes
  function land(o) {
    return (w, h) => {
      const R = rnd(o.seed || 3);
      let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.sky[0]}"/><stop offset="1" stop-color="${o.sky[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#s)"/>`;
      if (o.sun) s += `<circle cx="${w * o.sun[0]}" cy="${h * o.sun[1]}" r="${w * 0.07}" fill="${o.sun[2]}" opacity=".9"/>`;
      if (o.pillars) { s += `<rect y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="${o.sea}"/>`; for (let i = 0; i < 9; i++) { const x = R() * w, pw = 40 + R() * 90, ph = h * (0.18 + R() * 0.4), y = h * 0.64 - ph; s += `<path d="M${x} ${h * 0.66}L${x + pw * 0.1} ${y + 20}Q${x + pw * 0.5} ${y - 10} ${x + pw * 0.9} ${y + 20}L${x + pw} ${h * 0.66}Z" fill="${o.rock}" opacity="${0.55 + R() * 0.45}"/><path d="M${x + pw * 0.2} ${y + 10}q${pw * 0.3} -${18 + R() * 20} ${pw * 0.6} 0" fill="#3f6b45"/>`; } for (let i = 0; i < 14; i++) s += `<path d="M${R() * w} ${h * (0.7 + R() * 0.28)}h${30 + R() * 70}" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>`; }
      if (o.terraces) { for (let i = 0; i < 7; i++) { const y = h * (0.42 + i * 0.085); s += `<path d="M0 ${y}Q${w * 0.5} ${y - 50 + (i % 2) * 40} ${w} ${y}V${h}H0Z" fill="${i % 2 ? '#6aa86b' : '#5b9a5e'}"/>`; for (let k = 0; k < 9; k++) s += `<circle cx="${R() * w}" cy="${y + 20 + R() * 40}" r="${6 + R() * 6}" fill="#cfe8ff" opacity=".9"/>`; } }
      if (o.chasm) { s += `<path d="M0 ${h * 0.4}L${w * 0.3} ${h * 0.45}L${w * 0.42} ${h * 0.9}L${w * 0.58} ${h * 0.9}L${w * 0.7} ${h * 0.45}L${w} ${h * 0.42}V${h}H0Z" fill="#6b4d3a"/><path d="M${w * 0.42} ${h * 0.9}L${w * 0.5} ${h * 0.55}L${w * 0.58} ${h * 0.9}Z" fill="#120d18"/><circle cx="${w * 0.5}" cy="${h * 0.78}" r="${w * 0.05}" fill="#7b2ff7" opacity=".25"/>`; for (let i = 0; i < 5; i++) s += `<rect x="${w * (0.2 + i * 0.13)}" y="${h * (0.36 + (i % 2) * 0.03)}" width="10" height="${h * 0.1}" fill="#3b2a1f"/>`; }
      return s + '</svg>';
    };
  }
  defs.rp_guyun = { title: 'Guyun Stone Forest at dawn', w: 1080, h: 1350, svg: land({ seed: 11, sky: ['#f6c79a', '#9fc1db'], sun: [0.75, 0.3, '#fff0c9'], pillars: true, sea: '#5b8fb0', rock: '#8a8172' }) };
  defs.rp_qingce = { title: 'Qingce terraces', w: 1080, h: 1080, svg: land({ seed: 5, sky: ['#bfe0f5', '#f1f7fb'], sun: [0.2, 0.18, '#fff7d6'], terraces: true }) };
  defs.rp_chasm = { title: 'The Chasm', w: 1080, h: 1350, svg: land({ seed: 9, sky: ['#7d8aa3', '#c9cdd6'], chasm: true }) };

  // gossip cards (kabukimono)
  const KB = (n, a, b) => card({ g: ['#2d1240', '#0c0613'], frame: '#b197fc', lines: [{ t: 'HARBINGER GOSSIP', y: 210, size: 70, ls: 6, fill: '#d0bfff' }, { t: 'vol. ' + n, y: 300, size: 56, wt: 600, op: 0.8 }, { t: a, y: 560, size: 58, wt: 700 }, { t: b, y: 650, size: 58, wt: 700 }, { t: '🎭', y: 900, size: 120 }] });
  defs.rp_kb_1 = { title: 'Gossip vol. 1', w: 1080, h: 1080, svg: KB(1, 'the ninth tips in exact change', 'and asks for a receipt.') };
  defs.rp_kb_4 = { title: 'Gossip vol. 4', w: 1080, h: 1080, svg: KB(4, 'the eighth wore the same mask', 'to three galas. budget cuts?') };
  defs.rp_kb_7 = { title: 'Gossip vol. 7', w: 1080, h: 1080, svg: KB(7, 'the second wants “children', 'with interesting blood”. normal.') };
  defs.rp_kb_10 = { title: 'Gossip vol. 10', w: 1080, h: 1080, svg: KB(10, 'the fifth sent someone’s family', 'on holiday. how generous.') };
  defs.rp_kb_11 = { title: 'Gossip vol. 11', w: 1080, h: 1080, svg: KB(11, 'seat number + birthday.', 'every password. fish man.') };
  defs.rp_kb_12 = { title: 'Gossip vol. 12', w: 1080, h: 1080, svg: KB(12, 'the eleventh is very quiet today.', 'no fish. no threats. hm.') };
  defs.rp_kb_13 = { title: 'Gossip vol. 13', w: 1080, h: 1080, svg: KB(13, 'lights out in the harbor.', 'somebody signed something.') };

  // ═══ @ajax.fishes — forty fish ═══
  // [id, date, scene, species, caption, likes, comments, opts]
  const C = (by, text, t) => ({ by, text, t });
  const FISH = [
    ['f01', '2023-01-14 10:20', 'ice', 'char', 'first post. arctic char, through the ice behind the house. -23°. worth it. 🎣', 5, [['traveler.l', 'who is this', '2023-01-14 12:00']]],
    ['f02', '2023-01-28 09:40', 'ice', 'medaka', 'Teucer’s first fish!! he named it Sir Fish. we let it go. he cried. i did not cry.', 9, [['wanmin_chef', 'sir fish 😭😭', '2023-02-02 10:00']], { size: 0.3, hand: true, glove: true }],
    ['f03', '2023-02-19 11:05', 'ice', 'cod', 'cod, 9 kg. papa says he caught a bigger one in 1998. papa says that about every fish.', 4, []],
    ['f04', '2023-06-11 05:30', 'boat', 'mackerel', 'mackerel run off Morepesok. three hours, forty fish, one very sunburned harbinger-in-training.', 6, [], { tape: true }],
    ['f05', '2023-08-02 19:10', 'boat', 'flounder', 'Tonia caught a bigger one than me. it was a fluke. (it was a flounder.)', 8, [['emergencyfood', 'TONIA WINS', '2023-08-02 20:00']]],
    ['f06', '2023-12-30 13:00', 'ice', 'char', 'last fish of the year. Anthon fell asleep on the sled. good boy. good fish.', 5, []],
    ['f07', '2024-03-20 06:10', 'boat', 'sturgeon', 'sturgeon, released. ancient, enormous, said nothing the whole time. named him Capitano.', 7, [['crux.captain', 'respect', '2024-03-21 09:00']], { hand: true, glove: true }],
    ['f08', '2024-05-02 07:45', 'boat', 'bass', 'promotion day fish. 🧊🐟', 6, [['traveler.l', 'congrats, i guess', '2024-05-02 10:00']], { hand: true, glove: true }],
    ['f09', '2024-07-20 18:00', 'boat', 'snapper', 'birthday snapper. 20. the fish is younger than me. barely.', 8, [['wanmin_chef', 'happy birthday!! can i cook it', '2024-07-20 19:00']]],
    ['f10', '2024-09-15 05:50', 'dawn', 'grouper', 'grouper. cold eyes, sharp spines, refuses to look at me directly. named her Signora.', 7, [['traveler.l', 'please never tell her', '2024-09-15 08:00'], ['ajax.fishes', '@traveler.l she has a right to know', '2024-09-15 08:05']], { tape: true }],
    ['f11', '2024-11-03 21:30', 'night', 'puffer', 'pufferfish. inflated the moment money was mentioned. named him Pantalone.', 9, [['emergencyfood', 'is he edible', '2024-11-03 21:40'], ['ajax.fishes', '@emergencyfood very expensively', '2024-11-03 21:41']]],
    ['f12', '2024-12-12 10:00', 'ice', 'cod', 'old cod. very wise, very slow, very sure he knows best. named him Pulcinella. he did not let go of the hook for twenty minutes.', 5, []],
    ['f13', '2025-01-03 14:00', 'ice', 'char', 'jan 3. caught nothing worth naming after him this year. next year.', 4, [['balladeer', 'don’t.', '2025-01-03 22:00']]],
    ['f14', '2025-02-21 06:30', 'boat', 'angler', 'anglerfish. beak face, horrible teeth, glows in the dark for no good reason. named him Dottore. threw him back fast.', 8, [['wangsheng_hutao', 'he is so ugly i love him 👻', '2025-02-21 12:00']]],
    ['f15', '2025-04-14 05:15', 'dawn', 'croaker', 'yellow croaker. makes a little singing noise when you hold it. named her Columbina. she would like that.', 6, []],
    ['f16', '2025-06-06 19:40', 'boat', 'trout', 'rainbow trout. pretty and furious. 🎣', 5, [], { hand: true, glove: true }],
    ['f17', '2025-08-19 04:55', 'boat', 'sturgeon', 'the biggest, oldest sturgeon in the bay. everyone bows to it. it ignores everyone. named him Pierro. did not touch him.', 9, [['crux.captain', 'smart', '2025-08-19 09:00']], { size: 1.02 }],
    ['f18', '2025-10-10 20:10', 'night', 'eel', 'eel. slippery. lied about its weight. 🐍🐟', 4, []],
    ['f19', '2025-11-28 09:30', 'ice', 'char', 'first ice of the season with all four of us. Teucer caught two. i let him win (he won).', 8, [['wanmin_chef', 'the little ones!! 🥹', '2025-11-28 12:00']]],
    ['p_bluefin', '2026-01-03 11:20', null, null, '3 Jan. Bluefin, 212 kg, off the Snezhnayan shelf. Small, furious, fought for two hours out of pure spite. Named him Scaramouche. Happy birthday @balladeer 🐟🎂', 11, [['balladeer', 'delete this.', '2026-01-03 13:02'], ['traveler.l', 'you named a tuna after him', '2026-01-03 13:15'], ['emergencyfood', 'IS SCARAMOUCHE EDIBLE', '2026-01-03 13:20'], ['balladeer', '@emergencyfood try it.', '2026-01-03 13:21'], ['ajax.fishes', '@balladeer he says hi. he’s in the freezer.', '2026-01-03 13:40']], { art: 'p_bluefin' }],
    ['f20', '2026-02-14 06:00', 'boat', 'snapper', 'valentine’s day. i spent it with a fish. no regrets.', 6, [['wangsheng_hutao', 'single and fishing 👻', '2026-02-14 10:00']]],
    ['f21', '2026-03-15 05:40', 'dawn', 'bass', 'first fish in Liyue. Pier 7, 05:40. this harbor is going to be good to me. 🌊', 8, [['traveler.l', 'welcome to liyue', '2026-03-15 08:00']], { hand: true, glove: true }],
    ['f22', '2026-03-29 06:15', 'dawn', 'croaker', 'Liyue yellow croaker. the old men on the pier told me where to stand. they were right. 🙏', 5, []],
    ['f23', '2026-04-11 22:40', 'night', 'ribbon', 'ribbonfish under the lanterns. a whole metre of silver. looked like a sword. i want it framed.', 7, [['crux.captain', 'that’s a beltfish, kid', '2026-04-12 09:00'], ['ajax.fishes', '@crux.captain it’s a sword', '2026-04-12 09:02']]],
    ['p_catch_1', '2026-04-26 05:20', null, null, 'Pier 7 at dawn. the harbor provides. 🎣', 9, [['emergencyfood', 'paimon wants it', '2026-04-26 09:00']], { art: 'p_catch_1' }],
    ['f24', '2026-05-09 06:00', 'boat', 'mackerel', 'out with the Crux. the captain caught more. the captain will not stop saying it.', 6, [['crux.captain', '14 to 11 ⚓', '2026-05-09 12:00']], { tape: true }],
    ['f25', '2026-05-24 21:15', 'night', 'squid', 'squid. did not show it to a certain someone who hates tentacles. you’re welcome, xiansheng.', 8, [['wangsheng_hutao', 'XIANSHENG IS GOING TO SEE THIS 👻', '2026-05-24 22:00']]],
    ['f26', '2026-06-13 05:35', 'dawn', 'grouper', 'Guyun grouper. caught off the rocks below the stone forest. the sea out there is strange. too still.', 6, [['traveler.l', 'be careful out there', '2026-06-13 09:00']]],
    ['f27', '2026-06-27 06:05', 'dawn', 'medaka', 'tiny medaka. it got lost in the bucket. named him Kolya.', 9, [['wanmin_chef', 'kolya 😭', '2026-06-27 12:00']], { size: 0.32, hand: true, glove: true }],
    ['p_rod_gift', '2026-07-20 22:30', null, null, 'a gift. the reel runs smooth as anything. 🎣 (thank you)', 10, [['wangsheng_hutao', 'from who 👀👻', '2026-07-20 22:41'], ['ajax.fishes', '@wangsheng_hutao a client', '2026-07-20 22:45'], ['wangsheng_hutao', '@ajax.fishes a CLIENT 👀👀👀', '2026-07-20 22:46']], { art: 'p_rod_gift' }],
    ['f28', '2026-07-21 05:10', 'dawn', 'snapper', 'first fish with the new rod. Harbor snapper. it never stood a chance.', 8, []],
    ['f29', '2026-08-08 23:20', 'night', 'carp', 'golden carp by lantern light. lucky. (i need it.)', 6, [], { hand: true, glove: true }],
    ['f30', '2026-08-23 05:50', 'boat', 'angler', 'another ugly one. no, i will not name this one after anybody. (it’s Dottore again.)', 5, []],
    ['p_catch_2', '2026-09-06 06:20', null, null, 'Sunday morning. nobody at the office. everybody at the harbor. 🐟', 7, [], { art: 'p_catch_2' }],
    ['f31', '2026-09-19 04:40', 'dawn', 'grouper', 'grouper with a scar across her back. a fighter. named her Arlecchino. let her go. she earned it.', 9, [['traveler.l', 'that one’s cool', '2026-09-19 08:00']], { tape: true }],
    ['f32', '2026-09-27 21:50', 'night', 'croaker', 'mid-autumn night fishing. lanterns, mooncakes, one croaker. perfect.', 7, []],
    ['f33', '2026-10-03 05:30', 'dawn', 'bass', 'quiet morning. the whole city is in mourning. the fish don’t know.', 5, [['wangsheng_hutao', '🕯️', '2026-10-03 09:00']]],
    ['f34', '2026-10-05 01:10', 'night', 'trout', 'should not be fishing at 1am after osmanthus wine. caught this anyway. 🍶🎣', 6, [['traveler.l', 'go to bed', '2026-10-05 01:20']], { hand: true, glove: true }],
    ['f35', '2026-10-09 23:30', 'night', 'bass', 'bad day. good fish.', 8, [['traveler.l', 'you ok?', '2026-10-09 23:50'], ['ajax.fishes', '@traveler.l always 😁', '2026-10-09 23:58']]],
    ['f36', '2026-10-11 06:00', 'dawn', 'mackerel', 'mackerel for the office. Lyuba wants to freeze one “for art”. no.', 6, [['lyuba.cicin', 'it would be beautiful sir', '2026-10-11 09:00']], { tape: true }],
    ['f37', '2026-10-13 05:45', 'dawn', 'snapper', 'the kids are coming to visit soon (they don’t know i know 🤫). need to find them a fish big enough to impress Teucer.', 9, [['emergencyfood', 'KIDS!! paimon will show them every restaurant', '2026-10-13 09:00']]],
    ['f38', '2026-10-14 22:15', 'night', 'grouper', 'Pier 7. the lanterns for Sunday are going up along the terrace. the city looks like it’s on fire. in a nice way.', 7, []],
    ['f39', '2026-10-15 05:25', 'dawn', 'croaker', 'dawn croaker. tomorrow: dinner, then night fishing. big week. 🎣', 8, [['wanmin_chef', 'come to the kitchen after!! 🔥', '2026-10-15 09:00']]],
  ];
  const FISH_POSTS = FISH.map(([id, t, scene, sp, text, likes, comments, o], i) => {
    o = o || {};
    let art = o.art;
    if (!art) {
      art = 'rp_fish_' + id;
      const yy = t.slice(2, 4), mm = t.slice(5, 7), dd = t.slice(8, 10);
      defs[art] = { title: 'Fish · ' + t.slice(0, 10), w: 1080, h: 1350, tags: ['fish'], svg: fishPhoto({ seed: i * 7 + 3, scene, sp, hand: o.hand, glove: o.glove, tape: o.tape, size: o.size, stamp: scene === 'ice' ? "'" + yy + ' ' + mm + ' ' + dd : null }) };
    }
    return { id: id.startsWith('p_') ? 'rp_' + id.slice(2) : 'rp_fish_' + id, by: 'ajax.fishes', t: T(t), art, likes, liked: false, text, place: /Pier 7/.test(text) ? 'Pier 7, Liyue Harbor' : scene === 'ice' ? 'Morepesok' : null, comments: comments.map(([by, tx, tt]) => C(by, tx, T(tt))), reel: ['f04', 'f23', 'f29'].includes(id) };
  });
  Object.keys(defs).forEach((k) => JC.art.def(k, defs[k]));

  // ═══ accounts ═══
  // fby: which of Childe's accounts follow them · follows: which of Childe's accounts they follow
  JC.store.seed('wvusers', [
    { id: 'tartaglia', name: 'Tartaglia', avatar: 'av_childe', bio: 'Director of Special Collections · Northland Bank, Liyue Branch\nStability. Discretion. Northland. 🧊', link: 'northlandbank.sn/liyue', followers: 18412, following: 64, private: false, verified: true, contact: 'me', cat: 'Public figure', own: true,
      highlights: [{ title: 'Liyue', art: 'p_harbor_day' }, { title: 'Gala', art: 'rp_pr_gala' }, { title: 'Toy drive', art: 'rp_pr_toys' }, { title: 'Team', art: 'rp_pr_cake' }] },
    { id: 'ajax.fishes', name: 'Ajax', avatar: { emoji: '🐟', grad: ['#a5d8ff', '#1c7ed6'] }, bio: '🎣 fish i caught. fish i named. fish that got away (none)\nmorepesok → liyue harbor', private: true, followers: 9, following: 11, contact: 'me', own: true,
      highlights: [{ title: 'bluefin', art: 'p_bluefin' }, { title: 'morepesok', art: 'rp_fish_f19' }, { title: 'pier 7', art: 'p_catch_1' }, { title: 'named', art: 'rp_fish_f10' }] },
    { id: 'wangsheng_hutao', name: 'Hu Tao 👻', avatar: 'av_ht', bio: '77th Director · Wangsheng Funeral Parlor ⚰️\npoet (self-certified) · ghost enthusiast 👻\nautumn sale: 2nd coffin half price 🦋', link: 'wangsheng.ly', followers: 41230, following: 388, contact: 'ht', cat: 'Funeral home', fby: ['tartaglia', 'ajax.fishes'], follows: ['tartaglia', 'ajax.fishes'],
      story: [{ art: 'p_wangsheng_door', text: 'night shift 👻', t: T('+0 22:10') }, { art: 'rp_ht_ghost', text: 'did u hear that', t: T('+0 23:20') }, { art: 'p_glaze_lily', text: 'it’s lily season 🌼', t: T('+1 10:05') }, { art: 'p_yujing_lanterns', text: 'big day. wish us luck 🕯️', t: T('+2 08:40') }],
      highlights: [{ title: 'poems', art: 'rp_ht_poem' }, { title: 'xiansheng', art: 'p_zl_teahouse' }, { title: 'sale!!', art: 'rp_ht_sale' }] },
    { id: 'traveler.l', name: 'Lumine', avatar: 'av_lumine', bio: 'adventurer for hire. looking for someone.\nmondstadt · liyue · wherever he is', followers: 12940, following: 31, contact: 'lumine', fby: ['tartaglia', 'ajax.fishes'], follows: ['tartaglia', 'ajax.fishes'],
      story: [{ art: 'rp_guyun', text: 'quiet sea tonight', t: T('+0 22:40') }, { art: 'rp_chasm', text: '…', t: T('+1 15:10') }] },
    { id: 'emergencyfood', name: 'Paimon ⭐', avatar: 'av_paimon', bio: 'PAIMON IS THE BEST GUIDE IN TEYVAT ⭐\nhonest food reviews · DMs open for snacks 🍡', followers: 88310, following: 412, contact: 'paimon', cat: 'Food critic (self-appointed)', fby: ['tartaglia', 'ajax.fishes'], follows: ['tartaglia', 'ajax.fishes'],
      story: [{ art: 'food_milk_tea', text: 'midnight snack!!', t: T('+0 23:40') }, { art: 'food_hotpot', text: 'TOMORROW 🔥🔥', t: T('+0 23:46') }, { art: 'food_mora_meat', text: 'breakfast #2', t: T('+1 08:20') }, { art: 'food_almond_tofu', text: 'paimon is being RESPECTFUL today', t: T('+2 12:30') }] },
    { id: 'balladeer', name: 'Scaramouche', avatar: 'av_scara', bio: '', followers: 2, following: 1, contact: 'scara', fby: ['tartaglia'], follows: ['ajax.fishes'] },
    { id: 'kabukimono', name: 'kabukimono', avatar: { emoji: '🎭', grad: ['#5f3dc4', '#1a0b2e'] }, bio: 'harbinger gossip. bored. 🎭\nno, i won’t tell you who i am.', followers: 6120, following: 0, cat: 'Entertainment', joined: 'January 2026', based: 'Inazuma', formerly: '2 (hidden by the account)', fby: [], follows: ['tartaglia'],
      story: [{ art: 'rp_kb_story', text: '', t: T('+0 23:39') }] },
    { id: 'yunjin.opera', name: 'Yun Jin', avatar: 'av_yunjin', bio: 'Yun Jin Troupe · Heyu Tea House\nSaturday matinee 15:00 · “The Divine Damsel of Devastation”', link: 'heyu.ly/troupe', followers: 64500, following: 210, verified: true, contact: 'yunjin', cat: 'Performing artist', fby: ['tartaglia'], follows: ['tartaglia'],
      story: [{ art: 'p_heyu_stage', text: 'Final rehearsal.', t: T('+0 20:15') }, { art: 'rp_yj_poster', text: 'Box 2 is ready ✨', t: T('+1 14:35') }],
      highlights: [{ title: 'Stage', art: 'p_heyu_stage' }, { title: 'Records', art: 'cover_yunjin_opera' }] },
    { id: 'wanmin_chef', name: 'Xiangling 🌶️', avatar: 'av_xl', bio: 'chef @ wanmin restaurant 🔥 chihu rock\nguoba approves every dish 🐼\nwanmin go: open till 3am!', link: 'wanmingo.ly/r/wanmin', followers: 23810, following: 377, contact: 'xl', cat: 'Chef', fby: ['tartaglia', 'ajax.fishes'], follows: ['tartaglia', 'ajax.fishes'],
      story: [{ art: 'p_wanmin_kitchen', text: 'open till 3!! 🔥', t: T('+0 21:30') }, { art: 'food_mapo', text: 'mapo of the day 🌶️', t: T('+1 12:10') }] },
    { id: 'crux.captain', name: 'Beidou ⚓', avatar: 'av_beidou', bio: 'Captain · Crux Fleet ⚓ The Alcor\nundefeated (one exception, pending)', link: 'cruxshipping.ly', followers: 52010, following: 96, verified: true, contact: 'beidou', cat: 'Shipping', fby: ['tartaglia', 'ajax.fishes'], follows: ['tartaglia', 'ajax.fishes'],
      story: [{ art: 'p_alcor_deck', text: 'tick tock, kid ⚓', t: T('+0 21:00') }, { art: 'p_alcor_deck', text: 'deck’s ready. 22:00.', t: T('+1 20:30') }] },
    { id: 'liyueharbor.news', name: 'Liyue Harbor News', avatar: { initials: 'LH', grad: ['#ff922b', '#c2410c'] }, bio: 'News from the harbor and beyond.\nTips: tips@lhnews.ly', link: 'lhnews.ly', followers: 402300, following: 80, verified: true, cat: 'News & media', fby: ['tartaglia'],
      story: [{ art: 'p_yujing_lanterns', text: 'Lanterns ready for Sunday', t: T('+0 19:00') }, { art: 'p_teaset', text: 'Auction closes 00:30', t: T('+0 22:30') }, { art: 'rp_news_rite', text: 'The Rite begins at 10:00', t: T('+2 09:35') }] },
    { id: 'northlandbank', name: 'Northland Bank', avatar: { emoji: '❄️', grad: ['#1c4f82', '#0a1f3a'] }, bio: 'Northland Bank Group · Liyue Branch, Harbor Road 1\nStability. Discretion. Northland.', link: 'northlandbank.sn', followers: 156200, following: 11, verified: true, cat: 'Bank', fby: ['tartaglia'], follows: ['tartaglia'] },
    { id: 'lyuba.cicin', name: 'Lyuba', avatar: { emoji: '🧊', grad: ['#e7f5ff', '#74c0fc'] }, bio: 'ice. art. bank (back office).', followers: 48, following: 60, fby: ['tartaglia'], follows: ['tartaglia', 'ajax.fishes'] },
    { id: 'anya.volt', name: 'Anya', avatar: { emoji: '⚡', grad: ['#d0bfff', '#7048e8'] }, bio: 'hammer. sarcasm. night shift.', followers: 61, following: 40, private: true, fby: [], follows: ['tartaglia'] },
    { id: 'shellsandsparkles', name: 'Mei 🐚', avatar: { initials: 'M', grad: ['#ffdeeb', '#f783ac'] }, bio: 'chihu rock girl 🐚 · toy drive volunteer', followers: 312, following: 870, fby: [], follows: ['tartaglia'] },
  ]);

  // ═══ posts ═══
  JC.store.seed('posts', [
    // @tartaglia — 12 polished posts
    { id: 'rp_tg_01', by: 'tartaglia', t: T('2026-03-13 09:00'), art: 'p_harbor_day', place: 'Liyue Harbor', likes: 3120, liked: false, text: 'First morning in Liyue Harbor. The harbor is beautiful and the tea is strong. Proud to lead Special Collections at the Northland Bank Liyue Branch. #NorthlandBank #LiyueBranch',
      comments: [C('traveler.l', '“special collections”. sure.', T('2026-03-13 09:40')), C('emergencyfood', 'WELCOME TO LIYUE!!! do you like food', T('2026-03-13 10:02')), C('tartaglia', '@emergencyfood obviously', T('2026-03-13 10:05'))] },
    { id: 'rp_tg_02', by: 'tartaglia', t: T('2026-03-30 18:00'), art: 'rp_pr_open', place: 'Northland Bank, Liyue Branch', likes: 5410, liked: false, text: 'Northland Bank, Liyue Branch is officially open on Harbor Road. Stability, discretion and a very good view. Thank you to the Qixing and to every merchant who came by. #NorthlandBank',
      comments: [C('northlandbank', 'Welcome to the family, Liyue. ❄️', T('2026-03-30 18:20')), C('liyueharbor.news', 'Our coverage of the opening is on the page.', T('2026-03-30 19:00')), C('kabukimono', 'nice ribbon. who cut it for you', T('2026-03-30 23:10'))] },
    { id: 'rp_tg_03', by: 'tartaglia', t: T('2026-04-25 22:10'), art: 'rp_pr_gala', place: 'Northland Bank, Liyue Branch', likes: 6120, liked: false, text: 'Northland Spring Gala. An evening of Liyue tradition, thanks to our cultural consultant from Wangsheng, who taught a Snezhnayan how to pour tea properly. (Third attempt.) #NorthlandGala',
      comments: [C('wangsheng_hutao', 'our consultant is NOT for rent. (he is for rent. 10% off with my code 👻)', T('2026-04-25 22:30')), C('yunjin.opera', 'A beautiful evening. Thank you for the invitation.', T('2026-04-26 09:00')), C('tartaglia', '@wangsheng_hutao i’m keeping him', T('2026-04-26 09:12'))] },
    { id: 'rp_tg_04', by: 'tartaglia', t: T('2026-05-12 12:00'), art: 'rp_pr_toys', likes: 8910, liked: false, text: '2,400 toys for the children of Liyue Harbor. The Northland Toy Drive is my favourite day of the year. 🧸 #NorthlandCares',
      comments: [C('emergencyfood', 'can paimon have a toy', T('2026-05-12 12:10')), C('traveler.l', 'toys. of course it’s toys.', T('2026-05-12 12:40')), C('lyuba.cicin', 'sir we wrapped all of them 🧊', T('2026-05-12 13:05')), C('shellsandsparkles', 'i was there!! you gave my brother a wolf plushie 🐺', T('2026-05-13 10:00'))] },
    { id: 'rp_tg_05', by: 'tartaglia', t: T('2026-06-03 16:30'), art: 'p_jade_chamber', place: 'The Jade Chamber', likes: 4230, liked: false, text: 'Meeting the Tianquan at the Jade Chamber. Liyue and Snezhnaya: partners in prosperity.',
      comments: [C('liyueharbor.news', 'Read: Northland and the Qixing discuss Liyue’s debt.', T('2026-06-03 17:10')), C('kabukimono', 'partners. lol.', T('2026-06-03 23:00'))] },
    { id: 'rp_tg_06', by: 'tartaglia', t: T('2026-06-21 10:00'), art: 'rp_pr_cleanup', place: 'Liyue Harbor', likes: 3604, liked: false, text: 'The Liyue Branch team cleaned 2 km of shoreline this morning. Found: 41 bottles, one boot, zero fish (they were smart enough to leave). 🌊',
      comments: [C('crux.captain', 'the boot is mine. keep it.', T('2026-06-21 11:00')), C('lyuba.cicin', 'big boris carried all the bags 💪', T('2026-06-21 11:20'))] },
    { id: 'rp_tg_07', by: 'tartaglia', t: T('2026-07-21 09:15'), art: 'rp_pr_cake', place: 'Northland Bank, Liyue Branch', likes: 7720, liked: false, text: 'Thank you to the Liyue Branch for the birthday cake. It was shaped like a fish. Correct. 🎂',
      comments: [C('wanmin_chef', 'happy birthday!!! 🔥🔥 the hotpot last night was the BEST', T('2026-07-21 09:30')), C('emergencyfood', 'THE HOTPOT WAS THE BEST', T('2026-07-21 09:31')), C('traveler.l', 'happy birthday, childe.', T('2026-07-21 10:00')), C('wangsheng_hutao', 'another year closer to becoming a client 👻 happy birthday!!', T('2026-07-21 10:15'))] },
    { id: 'rp_tg_08', by: 'tartaglia', t: T('2026-08-14 15:00'), art: 'rp_pr_workshop', likes: 2930, liked: false, text: 'Financial literacy for Liyue’s young merchants. Lesson one: always read the contract. Lesson two: read it again.',
      comments: [C('wangsheng_hutao', 'lesson three: never let a consultant pay 💀', T('2026-08-14 15:30'))] },
    { id: 'rp_tg_09', by: 'tartaglia', t: T('2026-09-10 11:20'), art: 'p_golden_house', place: 'The Golden House', likes: 3810, liked: false, text: 'Heritage tour of the Golden House with the Ministry of Civil Affairs. Six thousand years of Mora under one roof.',
      comments: [C('liyueharbor.news', 'The Golden House reopens to the public in spring.', T('2026-09-10 12:00'))] },
    { id: 'rp_tg_10', by: 'tartaglia', t: T('2026-09-25 21:00'), art: 'p_yujing_lanterns', place: 'Yujing Terrace', likes: 6240, liked: false, text: 'Mid-Autumn on Yujing Terrace. Moon: excellent. Mooncakes: also excellent. 🥮',
      comments: [C('yunjin.opera', 'A lovely evening for it.', T('2026-09-25 21:30')), C('wanmin_chef', 'did u try my mooncakes!!!', T('2026-09-25 21:40'))] },
    { id: 'rp_tg_11', by: 'tartaglia', t: T('2026-10-02 09:00'), art: 'rp_pr_condolence', likes: 12410, liked: false, text: 'Northland Bank extends its deepest condolences to the people of Liyue on the passing of Rex Lapis. 🕯️',
      comments: [C('liyueharbor.news', 'The Rite of Parting is set for Sunday 18 October.', T('2026-10-02 09:30')), C('kabukimono', 'how touching. did you write this or did the bank', T('2026-10-02 10:10')), C('wangsheng_hutao', '🕯️ (wangsheng is handling everything. very professionally. 👻)', T('2026-10-02 11:00'))] },
    { id: 'rp_tg_12', by: 'tartaglia', t: T('-1 18:00'), art: 'rp_pr_lanterns', place: 'Yujing Terrace', likes: 9830, liked: false, text: 'Proud to sponsor the lanterns for Sunday’s Rite of Parting. Liyue, we light the way with you. #RiteOfParting',
      comments: [C('wangsheng_hutao', 'the lanterns are VERY nice. the funeral director approves 👻', T('-1 18:20')), C('traveler.l', 'who wrote this', T('-1 19:02')), C('tartaglia', '@traveler.l the bank did', T('-1 19:05')), C('kabukimono', '@tartaglia the bank writes better than you', T('+0 19:10'))] },
    // @wangsheng_hutao (Zhongli has no account; he turns up here)
    { id: 'rp_ht_hat', by: 'wangsheng_hutao', t: T('-12 14:20'), art: 'rp_ht_hat', place: 'Wangsheng Funeral Parlor', likes: 3870, liked: false, text: 'new hat 🦋 the butterfly is a symbol of the soul’s journey. it is NOT a moth. #wangshengfashion',
      comments: [C('traveler.l', 'cute', T('-12 14:31')), C('tartaglia', 'nice moth', T('-12 14:33')), C('wangsheng_hutao', '@tartaglia IT IS A BUTTERFLY', T('-12 14:33')), C('tartaglia', '@wangsheng_hutao it’s brown and it came out at night. moth.', T('-12 14:35')), C('emergencyfood', 'paimon thinks it’s a butterfly!!', T('-12 14:40')), C('tartaglia', 'the moth suits you, director 🦋', T('-12 14:52')), C('wangsheng_hutao', '@tartaglia i’m putting you in coffin 4 for this 👻', T('-12 14:53'))] },
    { id: 'rp_ht_tea', by: 'wangsheng_hutao', t: T('-9 16:00'), art: 'p_zl_teahouse', place: 'Heyu Tea House', likes: 5120, liked: false, text: 'caught our consultant sleeping on the job. he claims he was “listening to the tea” 🍵👻',
      comments: [C('tartaglia', 'he does that', T('-9 16:12')), C('wangsheng_hutao', '@tartaglia how would YOU know 👀', T('-9 16:13')), C('yunjin.opera', 'He was at my rehearsal too. Very attentive. Briefly.', T('-9 17:00'))] },
    { id: 'rp_ht_birds', by: 'wangsheng_hutao', t: T('-20 10:00'), art: 'p_zl_birds', place: 'Feiyun Slope', likes: 4410, liked: false, text: 'xiansheng negotiating with a bird. the bird is winning 🐦👻',
      comments: [C('emergencyfood', 'the bird wants his snack', T('-20 10:20')), C('tartaglia', 'put me on, i’ll negotiate', T('-20 10:31'))] },
    { id: 'rp_ht_sale', by: 'wangsheng_hutao', t: T('-15 09:00'), art: 'rp_ht_sale', place: 'Wangsheng Funeral Parlor', likes: 2280, liked: false, text: 'AUTUMN SALE 🍂 2nd coffin half price!! bring a friend (or two) ⚰️👻 #wangsheng',
      comments: [C('kabukimono', 'do you deliver', T('-15 21:00')), C('wangsheng_hutao', '@kabukimono for you? express 👻', T('-15 21:02'))] },
    { id: 'rp_ht_poem', by: 'wangsheng_hutao', t: T('-5 20:00'), art: 'rp_ht_poem', likes: 1960, liked: false, text: 'a poem for a quiet night 🕯️👻 (commission rates available)', comments: [C('traveler.l', 'paimon read it out loud. twice.', T('-5 20:30'))] },
    { id: 'rp_ht_rite', by: 'wangsheng_hutao', t: T('-14 12:00'), art: 'p_wangsheng_door', place: 'Wangsheng Funeral Parlor', likes: 6030, liked: false, text: 'the parlor will be very busy for the next two weeks. we are honoured. 🕯️ (and also VERY busy. no walk-ins pls)',
      comments: [C('tartaglia', 'need a hand carrying anything heavy, director?', T('-14 12:30')), C('wangsheng_hutao', '@tartaglia just ur wallet 👻', T('-14 12:31'))] },
    { id: 'rp_ht_ghost', by: 'wangsheng_hutao', t: T('-2 23:59'), art: 'rp_ht_ghost', place: 'Wangsheng Funeral Parlor', likes: 2710, liked: false, reel: true, text: 'the ghosts are restless tonight. so am i. 👻👻 #nightshift',
      comments: [C('emergencyfood', 'PAIMON IS SCARED', T('-1 00:10')), C('traveler.l', 'go to sleep', T('-1 00:20'))] },
    { id: 'rp_ht_lilies', by: 'wangsheng_hutao', t: T('+1 11:00'), art: 'mk_lilies', place: 'Wangsheng Funeral Parlor', likes: 1240, liked: false, cond: { flag: 'lilies_sent', flex: true }, text: 'someone sent the parlor a whole box of glaze lilies 💐 xiansheng has been looking at them for an hour. he says they “remind him of someone”. WHO?? 👻',
      comments: [C('yunjin.opera', 'Glaze lilies. How thoughtful.', T('+1 11:20')), C('traveler.l', 'i have a guess', T('+1 11:31'))] },
    { id: 'rp_ht_rite2', by: 'wangsheng_hutao', t: T('+2 10:40'), art: 'p_yujing_lanterns', place: 'Yujing Terrace', likes: 9120, liked: false, cond: { after: '+2 10:40' }, text: 'today we say goodbye. 🕯️ wangsheng was honoured to guide the rite. xiansheng read the eulogy. he did not cry. (i did.) #RiteOfParting', comments: [] },
    // @traveler.l
    { id: 'rp_lu_guyun', by: 'traveler.l', t: T('-4 06:10'), art: 'rp_guyun', place: 'Guyun Stone Forest', likes: 2210, liked: false, reel: true, text: 'stone forest at dawn. someone told me the sea here is asleep.', comments: [C('tartaglia', 'come spar instead of sightseeing', T('-4 08:00')), C('traveler.l', '@tartaglia tuesday', T('-4 08:05'))] },
    { id: 'rp_lu_qingce', by: 'traveler.l', t: T('-11 14:00'), art: 'rp_qingce', place: 'Qingce Village', likes: 1840, liked: false, text: 'qingce. glaze lilies everywhere.', comments: [C('emergencyfood', 'paimon ate a lily. it was not food.', T('-11 14:30'))] },
    { id: 'rp_lu_chasm', by: 'traveler.l', t: T('-25 17:00'), art: 'rp_chasm', place: 'The Chasm', likes: 1630, liked: false, text: 'not going in. yet.', comments: [C('tartaglia', 'take me with you when you do', T('-25 17:20')), C('traveler.l', '@tartaglia no', T('-25 17:21'))] },
    // @emergencyfood
    { id: 'rp_pm_hotpot', by: 'emergencyfood', t: T('+0 23:45'), art: 'food_hotpot', likes: 4120, liked: false, text: 'TOMORROW!!! HOTPOT!!! @tartaglia IS PAYING!!! 🔥🔥🔥 (he said so) (he didn’t say so) (he will)',
      comments: [C('wanmin_chef', 'table for 5 is ready 🔥', T('+0 23:46')), C('wangsheng_hutao', 'can i bring a guest 👻', T('+0 23:47'))] },
    { id: 'rp_pm_madame', by: 'emergencyfood', t: T('-6 20:10'), art: 'food_sweet_flower_chicken', place: 'Good Hunter (Liyue)', likes: 6600, liked: false, text: '38 SWEET MADAMES. paimon regrets NOTHING. thank you @tartaglia (he didn’t know) ⭐',
      comments: [C('tartaglia', 'i got the bank alert, paimon', T('-6 20:31')), C('traveler.l', 'she ate eleven.', T('-6 20:40'))] },
    { id: 'rp_pm_receipt', by: 'emergencyfood', t: T('-6 20:12'), art: 'p_paimon_food', likes: 3900, liked: false, text: 'the receipt ×38 (it was a good day) 🧾', comments: [] },
    { id: 'rp_pm_mapo', by: 'emergencyfood', t: T('-2 23:50'), art: 'food_mapo', place: 'Wanmin Restaurant', likes: 5210, liked: false, reel: true, text: 'PAIMON RATES: wanmin mapo tofu. 11/10. too spicy. 12/10. 🌶️', comments: [C('wanmin_chef', '🔥🔥🔥 thank u critic', T('-2 23:55'))] },
    { id: 'rp_pm_crew', by: 'emergencyfood', t: T('2026-07-20 21:30'), art: 'p_hotpot_crew', place: 'Wanmin Restaurant', likes: 7100, liked: false, text: 'HOTPOT CREW!!! ⭐🔥 happy birthday @tartaglia (thank you for paying, rich man)', comments: [C('tartaglia', 'any time, emergency food', T('2026-07-20 21:40')), C('wangsheng_hutao', 'best night 👻', T('2026-07-20 22:00'))] },
    // @yunjin.opera
    { id: 'rp_yj_stage', by: 'yunjin.opera', t: T('-3 19:00'), art: 'rp_yj_poster', place: 'Heyu Tea House', likes: 8420, liked: false, text: 'Saturday 15:00: The Divine Damsel of Devastation. The boxes are sold out — thank you, Liyue.', comments: [C('tartaglia', 'two of those seats are mine 😁', T('-3 19:20')), C('wangsheng_hutao', 'save me a seat!!', T('-3 19:31'))] },
    { id: 'rp_yj_rehearsal', by: 'yunjin.opera', t: T('-9 14:00'), art: 'p_heyu_stage', place: 'Heyu Tea House', likes: 6900, liked: false, reel: true, text: 'Rehearsal. The second act aria is coming along.', comments: [C('liyueharbor.news', 'Review: Yun Jin’s new season is her boldest yet.', T('-8 09:00'))] },
    { id: 'rp_yj_record', by: 'yunjin.opera', t: T('-30 12:00'), art: 'cover_yunjin_opera', likes: 5100, liked: false, text: 'Our new recording is out today. Thank you to everyone who listened.', comments: [] },
    // @wanmin_chef
    { id: 'rp_xl_kitchen', by: 'wanmin_chef', t: T('-1 20:30'), art: 'p_wanmin_kitchen', place: 'Wanmin Restaurant', likes: 3120, liked: false, reel: true, text: 'guoba is supervising 🐼🔥 wanmin go open till 3am!!', comments: [C('emergencyfood', 'GUOBA', T('-1 20:40'))] },
    { id: 'rp_xl_hotpot', by: 'wanmin_chef', t: T('-7 12:00'), art: 'food_hotpot', place: 'Wanmin Restaurant', likes: 2890, liked: false, text: 'hotpot set for four on wanmin go!! burner included 🔥', comments: [C('tartaglia', 'ordering for the office', T('-7 12:30'))] },
    { id: 'rp_xl_jade', by: 'wanmin_chef', t: T('-16 18:00'), art: 'food_jade_parcels', place: 'Wanmin Restaurant', likes: 2010, liked: false, text: 'jade parcels!! tied by hand, every single one 🥬', comments: [] },
    { id: 'rp_xl_pelmeni', by: 'wanmin_chef', t: T('+1 16:00'), art: 'food_pelmeni', place: 'Wanmin Restaurant', likes: 1880, liked: false, cond: { flag: 'recipe', flex: true }, text: 'NEW!!! morepesok pelmeni 🥟 recipe from a very kind mama in snezhnaya 💛 (i added chili to the sauce. sorry mama) — on wanmin go now!!', comments: [C('emergencyfood', 'PAIMON NEEDS 40', T('+1 16:05'))] },
    // @crux.captain
    { id: 'rp_bd_deck', by: 'crux.captain', t: T('-3 18:00'), art: 'p_alcor_deck', place: 'The Alcor, Crux Pier', likes: 7340, liked: false, reel: true, text: 'deck’s polished. rematch pending, @tartaglia ⚓', comments: [C('tartaglia', 'name the day, captain', T('-3 18:20')), C('crux.captain', '@tartaglia saturday. 22:00. don’t be late, kid.', T('-3 18:22'))] },
    // @kabukimono
    { id: 'rp_kb_1', by: 'kabukimono', t: T('-30 22:00'), art: 'rp_kb_1', likes: 1210, liked: false, text: 'harbinger gossip, vol. 1. you’re welcome.', comments: [C('emergencyfood', 'what’s a harbinger', T('-30 22:30'))] },
    { id: 'rp_kb_4', by: 'kabukimono', t: T('-21 21:00'), art: 'rp_kb_4', likes: 1640, liked: false, text: 'vol. 4. she thinks nobody notices. everybody notices.', comments: [] },
    { id: 'rp_kb_7', by: 'kabukimono', t: T('-10 23:00'), art: 'rp_kb_7', likes: 1990, liked: false, text: 'vol. 7. if he asks about your little brother, say no. that’s free advice. the only free thing i’ll ever give you.', comments: [C('traveler.l', 'who is this about', T('-10 23:20'))] },
    { id: 'rp_kb_10', by: 'kabukimono', t: T('-2 22:00'), art: 'rp_kb_10', likes: 2230, liked: false, text: 'vol. 10. paid for by the bank, of course. families are such good leverage.', comments: [] },
    { id: 'rp_kb_11', by: 'kabukimono', t: T('+0 23:38'), art: 'rp_kb_11', likes: 2870, liked: false, text: 'vol. 11: a certain harbinger uses his seat number and his birthday for every password he owns. i won’t say which one. he’s the one who smells like fish. @tartaglia',
      comments: [C('crux.captain', 'lmao', T('+0 23:40')), C('emergencyfood', 'who’s the fish one', T('+0 23:41')), C('wangsheng_hutao', '👀👻', T('+0 23:44')), C('traveler.l', 'deleting this would be wise', T('+0 23:45'))] },
    { id: 'rp_kb_12', by: 'kabukimono', t: T('+1 12:20'), art: 'rp_kb_12', likes: 2410, liked: false, cond: { after: '+1 12:20' }, text: 'vol. 12. the eleventh hasn’t posted a single fish today. no rematch threats either. is he sick? (i don’t care.)', comments: [C('crux.captain', 'he’s saving it for tonight', T('+1 12:40'))] },
    { id: 'rp_kb_13', by: 'kabukimono', t: T('+2 23:20'), art: 'rp_kb_13', likes: 3990, liked: false, cond: { flag: 'osial_sent', after: '+2 23:20' }, text: 'vol. 13. lights out in liyue harbor. somebody signed something. 🎭 #HarborBlackout', comments: [] },
    // @liyueharbor.news
    { id: 'rp_nw_rite', by: 'liyueharbor.news', t: T('-15 08:00'), art: 'rp_news_rite', likes: 21400, liked: false, text: 'Liyue mourns Rex Lapis. The Qixing announce the Rite of Parting for Sunday 18 October on Yujing Terrace. #RiteOfParting', comments: [C('wangsheng_hutao', 'wangsheng funeral parlor will conduct the rite 🕯️', T('-15 08:30'))] },
    { id: 'rp_nw_lanterns', by: 'liyueharbor.news', t: T('-1 09:00'), art: 'p_yujing_lanterns', place: 'Yujing Terrace', likes: 11200, liked: false, text: 'Lanterns go up on Yujing Terrace ahead of Sunday’s Rite of Parting. Roads close at 08:00 on the day. #RiteOfParting', comments: [] },
    { id: 'rp_nw_teaset', by: 'liyueharbor.news', t: T('+0 21:30'), art: 'p_teaset', likes: 3410, liked: false, text: 'A rare Guizhong-era celadon tea set has drawn bids above ℳ11,000 on Feiyun Market. The auction closes at 00:30. Collectors are watching. #FeiyunMarket', comments: [] },
    { id: 'rp_nw_live', by: 'liyueharbor.news', t: T('+2 09:40'), art: 'p_yujing_lanterns', place: 'Yujing Terrace', likes: 30200, liked: false, cond: { after: '+2 09:40' }, text: 'LIVE: The Rite of Parting begins at 10:00 on Yujing Terrace. All of Liyue is wearing white. Roads closed until 18:00. #RiteOfParting #FarewellRexLapis', comments: [] },
    { id: 'rp_nw_blackout', by: 'liyueharbor.news', t: T('+2 23:05'), art: 'rp_news_blackout', likes: 18200, liked: false, cond: { flag: 'osial_sent', after: '+2 23:05' }, text: 'BLACKOUT across the harbor. The Millelith report unusual tides near Guyun Stone Forest. Stay away from the piers. #HarborBlackout', comments: [] },
    // @northlandbank / staff
    { id: 'rp_nb_lobby', by: 'northlandbank', t: T('-8 10:00'), art: 'p_northland_lobby', place: 'Northland Bank, Liyue Branch', likes: 2210, liked: false, text: 'Our Liyue Branch lobby, Harbor Road 1. Open 09:00–18:00. Stability. Discretion. Northland.', comments: [] },
    { id: 'rp_ly_ice', by: 'lyuba.cicin', t: T('+0 23:45'), art: 'p_aquarium_frozen', place: 'Northland Bank, Liyue Branch', likes: 23, liked: false, text: 'ice sculpture. untitled. 🧊', comments: [C('anya.volt', 'lyuba DELETE THIS. sir follows you.', T('+0 23:46')), C('lyuba.cicin', '@anya.volt sir is asleep', T('+0 23:47'))] },
  ].concat(FISH_POSTS));

  // ═══ DMs (per account: id = account + ':' + handle) ═══
  const m = (from, text, t, x) => Object.assign({ from, text, t: T(t) }, x || {});
  JC.store.seed('wvdms', [
    { id: 'tartaglia:emergencyfood', acct: 'tartaglia', with: 'emergencyfood', unread: 1, msgs: [
      m('emergencyfood', '', '+0 23:46', { post: 'rp_pm_hotpot', text: '' }), m('emergencyfood', 'CHILDE!!! 🔥🔥🔥 everybody is coming', '+0 23:46') ] },
    { id: 'tartaglia:traveler.l', acct: 'tartaglia', with: 'traveler.l', unread: 1, msgs: [
      m('traveler.l', 'spar tuesday?', '-4 19:00'), m('me', 'always, comrade', '-4 19:20'), m('traveler.l', 'paimon says you owe her hotpot', '-4 19:21'), m('me', 'paimon says a lot of things', '-4 19:22'),
      m('traveler.l', 'paimon told half of liyue you’re paying for hotpot tomorrow. sorry.', '+0 23:44') ] },
    { id: 'tartaglia:wangsheng_hutao', acct: 'tartaglia', with: 'wangsheng_hutao', unread: 0, msgs: [
      m('wangsheng_hutao', 'mr harbinger!! the parlor is very busy this week so if u were planning to die pls wait until monday 👻', '-3 22:10'), m('me', 'noted, director', '-3 22:15'),
      m('wangsheng_hutao', 'also xiansheng says ur rematch with the captain is “unwise”', '-3 22:16'), m('me', 'xiansheng says everything i do is unwise', '-3 22:16'), m('wangsheng_hutao', 'he is not wrong 👻', '-3 22:17'),
      m('wangsheng_hutao', '', '-12 14:55', { post: 'rp_ht_hat' }) ].sort((a, b) => a.t - b.t) },
    { id: 'tartaglia:crux.captain', acct: 'tartaglia', with: 'crux.captain', unread: 0, msgs: [
      m('crux.captain', '', '-3 18:05', { post: 'rp_bd_deck' }), m('crux.captain', 'saturday. don’t chicken out, kid', '-3 18:05'), m('me', 'i never chicken out', '-3 18:30'), m('crux.captain', 'we’ll see ⚓', '-3 18:31') ] },
    { id: 'tartaglia:yunjin.opera', acct: 'tartaglia', with: 'yunjin.opera', unread: 0, msgs: [
      m('yunjin.opera', 'Director, your box seats for Saturday are confirmed: Box 2, two seats. May I ask who your guest is?', '-6 11:00'), m('me', 'a consultant 😁', '-6 11:30'), m('yunjin.opera', 'How mysterious. I look forward to it.', '-6 11:32') ] },
    { id: 'tartaglia:wanmin_chef', acct: 'tartaglia', with: 'wanmin_chef', unread: 0, msgs: [
      m('wanmin_chef', 'thx for the lunch order!! 🔥 how were the noodles', '-1 13:40'), m('me', 'perfect as always, chef', '-1 14:02'), m('wanmin_chef', 'come to the hotpot tmr!!! paimon already told everyone u r paying', '-1 14:03'), m('me', 'of course she did', '-1 14:05') ] },
    { id: 'tartaglia:kabukimono', acct: 'tartaglia', with: 'kabukimono', request: true, unread: 1, msgs: [
      m('kabukimono', 'you’re very quiet tonight, eleventh.', '+0 23:52'), m('kabukimono', 'no fish pictures? no rematch threats? are you sick.', '+0 23:53') ] },
    { id: 'tartaglia:shellsandsparkles', acct: 'tartaglia', with: 'shellsandsparkles', request: true, unread: 1, msgs: [
      m('shellsandsparkles', 'omg are you the bank guy from the toy drive?? my little brother still sleeps with the wolf 🐺', '-1 18:40') ] },
    { id: 'ajax.fishes:traveler.l', acct: 'ajax.fishes', with: 'traveler.l', unread: 0, msgs: [
      m('traveler.l', '', '-27 08:00', { post: 'rp_fish_f31' }), m('traveler.l', 'is that a fish named after a coworker again', '-27 08:00'), m('me', 'she’s a fighter. she earned it.', '-27 08:10'), m('traveler.l', 'please never tell any of them', '-27 08:11') ] },
    { id: 'ajax.fishes:emergencyfood', acct: 'ajax.fishes', with: 'emergencyfood', unread: 0, msgs: [
      m('emergencyfood', 'is the bluefin still in ur freezer', '2026-03-20 12:00'), m('me', 'some of him', '2026-03-20 12:30'), m('emergencyfood', 'PAIMON WANTS SOME OF HIM', '2026-03-20 12:30') ] },
    { id: 'ajax.fishes:crux.captain', acct: 'ajax.fishes', with: 'crux.captain', unread: 0, msgs: [
      m('crux.captain', '14 to 11. say it', '2026-05-09 12:10'), m('me', 'the 11 were bigger', '2026-05-09 12:40'), m('crux.captain', 'ha! rematch on deck, not on boats. you’re on.', '2026-05-09 12:41') ] },
  ]);

  // ═══ activity (per account) ═══
  JC.store.seed('wvact', [
    { acct: 'tartaglia', kind: 'mention', by: 'kabukimono', post: 'rp_kb_11', text: 'vol. 11: a certain harbinger uses his seat number and his birthday…', t: T('+0 23:38'), read: false },
    { acct: 'tartaglia', kind: 'like', by: 'wangsheng_hutao', post: 'rp_tg_12', t: T('+0 23:31'), read: false },
    { acct: 'tartaglia', kind: 'like', by: 'traveler.l', post: 'rp_tg_12', t: T('+0 22:45'), read: true },
    { acct: 'tartaglia', kind: 'like', by: 'yunjin.opera', post: 'rp_tg_12', t: T('+0 21:20'), read: true },
    { acct: 'tartaglia', kind: 'comment', by: 'kabukimono', post: 'rp_tg_12', text: '@tartaglia the bank writes better than you', t: T('+0 19:10'), read: true },
    { acct: 'tartaglia', kind: 'follow', by: 'shellsandsparkles', t: T('-1 18:30'), read: true },
    { acct: 'tartaglia', kind: 'like', by: 'crux.captain', post: 'rp_tg_11', t: T('-2 10:00'), read: true },
    { acct: 'tartaglia', kind: 'comment', by: 'traveler.l', post: 'rp_tg_12', text: 'who wrote this', t: T('-1 19:02'), read: true },
    { acct: 'tartaglia', kind: 'follow', by: 'anya.volt', t: T('-9 22:00'), read: true },
    { acct: 'ajax.fishes', kind: 'follow_req', by: 'kabukimono', t: T('-1 23:00'), read: false },
    { acct: 'ajax.fishes', kind: 'like', by: 'traveler.l', post: 'rp_fish_f39', t: T('-1 09:10'), read: true },
    { acct: 'ajax.fishes', kind: 'comment', by: 'wanmin_chef', post: 'rp_fish_f39', text: 'come to the kitchen after!! 🔥', t: T('-1 09:00'), read: true },
    { acct: 'ajax.fishes', kind: 'like', by: 'balladeer', post: 'rp_bluefin', t: T('2026-01-03 13:01'), read: true },
  ]);
  // follow requests to the private account
  JC.store.seed('wvreqs', [
    { id: 'kabukimono', acct: 'ajax.fishes', t: T('-1 23:00') },
    { id: 'shellsandsparkles', acct: 'ajax.fishes', t: T('-40 10:00') },
  ]);
})();
