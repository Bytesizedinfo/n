// Small two-series line chart (0–4 scale) with crosshair tooltip, direct labels and a table view.
// Colours come from --series-1 / --series-2 (validated for colour-blind separation in light and dark).

import { html } from '../ui.js';
import { formatDate } from '../engine/dates.js';

const M = { l: 24, r: 78, t: 12, b: 24 };

export function lineChart(container, { dates, series, max = 4 }) {
  // Draw at the real on-screen width so text stays at its true size.
  const W = Math.max(280, Math.round(container.clientWidth || 340));
  const H = Math.round(Math.min(220, Math.max(170, W * 0.5)));
  const iw = W - M.l - M.r;
  const ih = H - M.t - M.b;
  const x = (i) => M.l + (dates.length <= 1 ? iw / 2 : (i / (dates.length - 1)) * iw);
  const y = (v) => M.t + ih - (v / max) * ih;

  const path = (vals) => {
    let d = '';
    let pen = false;
    vals.forEach((v, i) => {
      if (v === null || v === undefined) { pen = false; return; }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };

  // Direct labels at each series' last point, nudged apart if they collide.
  const ends = series.map((s, si) => {
    let i = s.values.length - 1;
    while (i >= 0 && (s.values[i] === null || s.values[i] === undefined)) i--;
    return { si, i, yy: i >= 0 ? y(s.values[i]) : null };
  }).filter((e) => e.i >= 0);
  if (ends.length === 2 && Math.abs(ends[0].yy - ends[1].yy) < 14) {
    const mid = (ends[0].yy + ends[1].yy) / 2;
    const [a, b] = ends[0].yy <= ends[1].yy ? [ends[0], ends[1]] : [ends[1], ends[0]];
    a.yy = mid - 7; b.yy = mid + 7;
  }

  const ticks = [0, 1, 2, 3, 4];
  const xl = [0, Math.floor((dates.length - 1) / 2), dates.length - 1];
  container.innerHTML = String(html`
    <div class="legend" aria-hidden="true">${series.map((s, i) => html`<span><i style="background:var(--series-${i + 1})"></i>${s.name}</span>`)}</div>
    <div class="viz">
      <svg viewBox="0 0 ${W} ${H}" role="img" tabindex="0" aria-label="${series.map((s) => s.name).join(' and ')} over the last ${dates.length} days, 0 to ${max}. Use left and right arrow keys to read values.">
        <g class="grid">${ticks.map((t) => html`<line x1="${M.l}" x2="${M.l + iw}" y1="${y(t)}" y2="${y(t)}"/>`)}</g>
        <g class="axis">
          ${[0, 2, 4].map((t) => html`<text x="${M.l - 8}" y="${y(t) + 4}" text-anchor="end">${t}</text>`)}
          ${xl.map((i) => html`<text x="${x(i)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === dates.length - 1 ? 'end' : 'middle'}">${formatDate(dates[i], { day: 'numeric', month: 'short' })}</text>`)}
        </g>
        ${series.map((s, si) => html`<path class="line s${si + 1}" d="${path(s.values)}"/>`)}
        ${series.map((s, si) => s.values.map((v, i) => (v === null || v === undefined ? '' : html`<circle class="pt s${si + 1}" cx="${x(i)}" cy="${y(v)}" r="4"/>`)))}
        ${ends.map((e) => html`<text class="label" x="${x(e.i) + 9}" y="${e.yy + 4}">${series[e.si].name}</text>`)}
        <line class="cross" y1="${M.t}" y2="${M.t + ih}" x1="0" x2="0" visibility="hidden"/>
        <rect class="hit" x="${M.l - 10}" y="0" width="${iw + 20}" height="${H}" fill="transparent"/>
      </svg>
      <div class="viz-tip" hidden></div>
    </div>`);

  const svg = container.querySelector('svg');
  const cross = svg.querySelector('.cross');
  const tip = container.querySelector('.viz-tip');
  let current = null;

  const show = (i) => {
    current = i;
    cross.setAttribute('x1', x(i));
    cross.setAttribute('x2', x(i));
    cross.setAttribute('visibility', 'visible');
    tip.hidden = false;
    tip.innerHTML = '';
    const head = document.createElement('div');
    head.style.fontWeight = '600';
    head.textContent = formatDate(dates[i]);
    tip.append(head);
    series.forEach((s, si) => {
      const row = document.createElement('div');
      const sw = document.createElement('i');
      sw.style.cssText = `display:inline-block;width:10px;height:3px;border-radius:2px;margin-right:6px;vertical-align:middle;background:var(--series-${si + 1})`;
      row.append(sw, document.createTextNode(`${s.name}: ${s.values[i] === null || s.values[i] === undefined ? '—' : s.values[i]}`));
      tip.append(row);
    });
    const rect = svg.getBoundingClientRect();
    const px = (x(i) / W) * rect.width;
    tip.style.left = Math.min(Math.max(px, 70), rect.width - 70) + 'px';
    tip.style.top = '4px';
  };
  const hide = () => { cross.setAttribute('visibility', 'hidden'); tip.hidden = true; current = null; };
  const nearest = (clientX) => {
    const rect = svg.getBoundingClientRect();
    const vx = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bd = Infinity;
    dates.forEach((_, i) => { const d = Math.abs(x(i) - vx); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  svg.addEventListener('pointermove', (e) => show(nearest(e.clientX)));
  svg.addEventListener('pointerdown', (e) => show(nearest(e.clientX)));
  svg.addEventListener('pointerleave', hide);
  svg.addEventListener('blur', hide);
  svg.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = current === null ? dates.length - 1 : Math.min(dates.length - 1, Math.max(0, current + (e.key === 'ArrowRight' ? 1 : -1)));
    show(i);
  });
}

export function chartTable(dates, series) {
  const rows = dates.map((d, i) => ({ d, vals: series.map((s) => s.values[i]) })).filter((r) => r.vals.some((v) => v !== null && v !== undefined)).reverse();
  return html`<table class="viz-table"><thead><tr><th>Date</th>${series.map((s) => html`<th>${s.name}</th>`)}</tr></thead>
    <tbody>${rows.map((r) => html`<tr><td>${formatDate(r.d)}</td>${r.vals.map((v) => html`<td>${v ?? '—'}</td>`)}</tr>`)}</tbody></table>`;
}
