import { html, icon, productCard, openSheet, toast, confirmDialog } from '../ui.js';
import { app } from '../app.js';
import { PRODUCTS, CATEGORY_LABEL } from '../data/products.js';
import { BY_ID, TICKABLE, ingName } from '../data/ingredients.js';
import { analyseShelf, realActives } from '../engine/shelf.js';
import { analyse } from '../engine/parse.js';
import { buildProfile } from '../engine/profile.js';

const CAT_ORDER = ['oil-cleanser', 'cleanser', 'toner', 'exfoliant', 'serum', 'treatment', 'spot', 'moisturizer', 'sunscreen', 'mask', 'other'];
const LEVEL = {
  avoid: { label: 'Don’t use together', cls: 'danger', chip: 'danger' },
  separate: { label: 'Use at different times', cls: 'warn', chip: 'warn' },
  caution: { label: 'OK for most skin, careful if sensitive', cls: 'caution', chip: 'info' },
};

function activeChips(p) {
  const list = realActives(p).filter((a) => BY_ID[a].kind === 'active' || ['ceramides', 'ha', 'centella', 'panthenol'].includes(a));
  return list.slice(0, 6).map((a) => {
    const pct = p.strength && p.strength[a];
    return html`<span class="chip">${ingName(a).replace(/ \(.*\)$/, '')}${pct ? ` ${pct}%` : ''}</span>`;
  });
}

export function render(view, { go }) {
  const shelf = app.shelf();
  const answers = app.answers();
  const profile = buildProfile(answers || {});
  const analysis = analyseShelf(shelf, profile);
  const byId = Object.fromEntries(shelf.map((p) => [p.id, p]));
  const groups = CAT_ORDER.map((c) => [c, shelf.filter((p) => (p.cat || 'other') === c)]).filter(([, l]) => l.length);
  const problems = analysis.clashes.length + analysis.duplicates.filter((d) => d.level !== 'info').length;

  view.innerHTML = String(html`
    <div class="page-head">
      <div><div class="eyebrow">${shelf.length} ${shelf.length === 1 ? 'product' : 'products'}</div><h1>My shelf</h1></div>
      <button class="btn primary small" data-add>${icon('plus')} Add</button>
    </div>
    ${!shelf.length ? html`<div class="card soft center" style="padding:28px 18px">
        <div style="width:48px;height:48px;margin:0 auto 10px;color:var(--blush-ink)">${icon('shelf')}</div>
        <h2>What’s on your shelf?</h2>
        <p class="muted" style="margin-top:6px">Add the products you own. Skin Ritual checks they work together, flags anything that doesn’t suit you, and can build your routine around them.</p>
        <button class="btn primary" data-add style="margin-top:8px">${icon('plus')} Add a product</button>
      </div>` : ''}

    ${shelf.length >= 2 ? html`
      <div class="section-title">Compatibility check</div>
      ${!problems && !analysis.overload ? html`<div class="callout good">${icon('checkCircle')}<div class="t"><b>No clashes.</b> These products can share a routine.</div></div>` : ''}
      <div class="stack">
        ${analysis.clashes.map((c) => html`<div class="card flat clash ${LEVEL[c.level].cls}">
          <div class="row spread" style="align-items:flex-start"><b>${byId[c.a].name} + ${byId[c.b].name}</b></div>
          <span class="chip ${LEVEL[c.level].chip}" style="margin:6px 0">${LEVEL[c.level].label}</span>
          ${c.why.map((w) => html`<div class="small muted">${w}</div>`)}
        </div>`)}
        ${analysis.duplicates.map((d) => html`<div class="callout ${d.level === 'avoid' ? 'danger' : d.level === 'warn' ? 'warn' : 'info'}">${icon('alert')}<div class="t">${d.text}<div class="small muted" style="margin-top:2px">${d.ids.map((id) => byId[id].name).join(' · ')}</div></div></div>`)}
        ${analysis.overload ? html`<div class="callout warn">${icon('alert')}<div class="t">${analysis.overload.text}</div></div>` : ''}
        ${analysis.reassurances.slice(0, 3).map((r) => html`<div class="callout good">${icon('checkCircle')}<div class="t"><b>${byId[r.a].name} + ${byId[r.b].name}:</b> ${r.why}</div></div>`)}
      </div>
      ${analysis.clashes.some((c) => c.level === 'separate') ? html`<p class="small muted" style="margin-top:10px">“Different times” doesn’t mean you can’t own both: your routine puts them in different routines or on different nights.</p>` : ''}
    ` : ''}

    ${shelf.length ? html`
      <div class="card blush" style="margin-top:18px">
        <h3>Build my routine from these</h3>
        <p class="small" style="margin:4px 0 12px">Uses your products where they fit, schedules around clashes, benches what you don’t need and suggests anything missing.</p>
        ${answers ? html`<button class="btn primary block" data-build>${icon('sparkles')} Build from my shelf</button>` : html`<a class="btn primary block" href="#/quiz">Take the quiz first</a>`}
      </div>` : ''}

    ${groups.map(([cat, list]) => html`
      <div class="section-title">${CATEGORY_LABEL[cat] || 'Other'}</div>
      <div class="stack">${list.map((p) => {
        const issues = analysis.perProduct[p.id].issues;
        return html`<div>${productCard(p, { owned: true, issues, action: html`<button class="icon-btn" style="border:0" data-remove="${p.id}" aria-label="Remove ${p.name}">${icon('trash')}</button>` })}
          ${activeChips(p).length ? html`<div class="chips" style="margin:6px 0 0 50px">${activeChips(p)}</div>` : ''}</div>`;
      })}</div>`)}
  `);

  view.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => openAdd(() => render(view, { go }))));
  view.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', async () => {
    const p = byId[b.dataset.remove];
    if (!(await confirmDialog(`Remove ${p.name} from your shelf?`, { title: 'Remove product', ok: 'Remove', danger: true }))) return;
    app.removeProduct(p.id);
    render(view, { go });
  }));
  const build = view.querySelector('[data-build]');
  if (build) build.addEventListener('click', async () => {
    if (app.routine() && !(await confirmDialog('This replaces your current routine with one built from your shelf. Your current routine stays in your history so you can switch back or compare.', { title: 'Build from your shelf?', ok: 'Build it' }))) return;
    app.useShelfRoutine();
    go('routine', { new: '1', tab: 'notes' });
  });
}

// ---------- add sheet ----------

function openAdd(onDone) {
  const s = openSheet({ title: 'Add a product', onClose: onDone });
  let mode = 'catalogue';
  let pasteState = { name: '', brand: '', text: '' };

  const draw = () => {
    s.body.innerHTML = String(html`
      <div class="seg scroll" role="tablist">
        ${[['catalogue', 'Search', 'search'], ['paste', 'Paste list', 'edit'], ['photo', 'Photo', 'camera'], ['tick', 'Tick', 'checkCircle']].map(([k, l, ic]) => html`<button role="tab" data-mode="${k}" aria-selected="${mode === k}">${icon(ic)} ${l}</button>`)}
      </div>
      <div id="addBody" style="margin-top:14px"></div>`);
    s.body.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode; draw(); }));
    const body = s.body.querySelector('#addBody');
    if (mode === 'catalogue') drawCatalogue(body);
    if (mode === 'paste') drawPaste(body);
    if (mode === 'photo') drawPhoto(body);
    if (mode === 'tick') drawTick(body);
  };

  function drawCatalogue(body) {
    body.innerHTML = String(html`
      <input type="search" id="q" placeholder="Search brand or product, e.g. CeraVe" aria-label="Search products" autocomplete="off">
      <p class="tiny faint" style="margin:8px 2px 0">Not listed? Use “Paste list”, “Photo” or “Tick”.</p>
      <div class="cat-list" id="list"></div>`);
    const list = body.querySelector('#list');
    const q = body.querySelector('#q');
    const owned = new Set(app.shelf().map((p) => p.catalogueId).filter(Boolean));
    const show = () => {
      const term = q.value.trim().toLowerCase();
      const hits = PRODUCTS.filter((p) => !term || `${p.brand} ${p.name} ${CATEGORY_LABEL[p.cat]}`.toLowerCase().includes(term));
      list.innerHTML = String(html`${hits.map((p) => html`<button class="cat-item" data-id="${p.id}" ${owned.has(p.id) ? 'disabled' : ''}>
        <div class="grow"><div class="tiny muted">${p.brand} · ${CATEGORY_LABEL[p.cat]}</div><div style="font-weight:600">${p.name}</div></div>
        ${owned.has(p.id) ? html`<span class="chip sage">${icon('check')} Added</span>` : html`<span class="chip blush">${icon('plus')} Add</span>`}
      </button>`)}${!hits.length ? html`<p class="muted small" style="padding:12px 2px">No matches. Try “Paste list” to add it yourself.</p>` : ''}`);
      list.querySelectorAll('[data-id]').forEach((b) => b.addEventListener('click', () => {
        const p = PRODUCTS.find((x) => x.id === b.dataset.id);
        app.addProduct({ ...p, id: undefined, catalogueId: p.id, source: 'catalogue' });
        owned.add(p.id);
        toast(`Added ${p.name}`);
        show();
      }));
    };
    q.addEventListener('input', show);
    show();
  }

  function drawPaste(body, note = '') {
    body.innerHTML = String(html`
      ${note ? html`<div class="callout info" style="margin-bottom:12px">${icon('info')}<div class="t">${note}</div></div>` : ''}
      <label class="field" for="pn">Product name</label>
      <input type="text" id="pn" value="${pasteState.name}" placeholder="e.g. Hydrating Gel Cream">
      <label class="field" for="pb" style="margin-top:12px">Brand <span class="faint">(optional)</span></label>
      <input type="text" id="pb" value="${pasteState.brand}">
      <label class="field" for="pt" style="margin-top:12px">Ingredients list</label>
      <textarea id="pt" placeholder="Copy the full ingredients list from the box or the brand’s website and paste it here.">${pasteState.text}</textarea>
      <button class="btn primary block" id="check" style="margin-top:12px">Check ingredients</button>
      <div id="result"></div>`);
    const result = body.querySelector('#result');
    body.querySelector('#check').addEventListener('click', () => {
      pasteState = { name: body.querySelector('#pn').value.trim(), brand: body.querySelector('#pb').value.trim(), text: body.querySelector('#pt').value };
      if (!pasteState.name && !pasteState.text.trim()) { toast('Add a name or an ingredients list.'); return; }
      const r = analyse({ name: pasteState.name, text: pasteState.text });
      const acts = r.actives.filter((a) => BY_ID[a] && ['active', 'support', 'filter'].includes(BY_ID[a].kind));
      const flags = [];
      if (r.actives.includes('fragrance') || r.actives.includes('fragrance-allergen')) flags.push('Fragrance');
      if (r.flags.eo) flags.push('Essential oils');
      if (r.flags.alcohol) flags.push('Drying alcohol');
      if (r.comedogenicHits.length) flags.push('Possible pore-cloggers');
      if (r.fungalTriggers.length) flags.push('Fungal-acne triggers');
      result.innerHTML = String(html`<div class="card flat" style="margin-top:14px">
        <label class="field" for="pc">Type</label>
        <select id="pc">${CAT_ORDER.map((c) => html`<option value="${c}" ${c === r.cat ? 'selected' : ''}>${CATEGORY_LABEL[c]}</option>`)}</select>
        <div class="small muted" style="margin:12px 0 6px">Found</div>
        <div class="chips">${acts.length ? acts.map((a) => html`<span class="chip">${ingName(a)}${r.strength[a] ? ` ${r.strength[a]}%` : ''}</span>`) : html`<span class="small muted">No actives recognised${r.tokens.length < 4 ? ' (paste the full list for a better check)' : ''}.</span>`}</div>
        ${flags.length ? html`<div class="chips" style="margin-top:8px">${flags.map((f) => html`<span class="chip warn">${f}</span>`)}</div>` : r.tokens.length >= 4 ? html`<div class="chips" style="margin-top:8px"><span class="chip sage">Fragrance-free</span></div>` : ''}
        ${r.tokens.length ? html`<p class="tiny faint" style="margin-top:8px">${r.tokens.length} ingredients read${r.unknownCount ? `, ${r.unknownCount} are everyday bases (water, thickeners, preservatives)` : ''}.</p>` : ''}
        <button class="btn sage block" id="addIt" style="margin-top:10px">${icon('plus')} Add to my shelf</button>
      </div>`);
      result.querySelector('#addIt').addEventListener('click', () => {
        const cat = result.querySelector('#pc').value;
        app.addProduct({
          name: pasteState.name || 'Unnamed product', brand: pasteState.brand, cat, actives: r.actives, strength: r.strength, flags: r.flags,
          fungalTriggers: r.fungalTriggers, inci: pasteState.text.slice(0, 6000), source: mode === 'photo' ? 'photo' : 'paste',
        });
        toast(`Added ${pasteState.name || 'product'}`);
        pasteState = { name: '', brand: '', text: '' };
        s.close();
      });
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function drawPhoto(body) {
    body.innerHTML = String(html`
      <p class="muted small">Take a clear, close photo of the ingredients list, flat and in good light. The text is read on your phone; the photo isn’t uploaded anywhere.</p>
      <label class="btn primary block" style="margin-top:8px">${icon('camera')} Take or choose a photo<input type="file" id="ph" accept="image/*" capture="environment" hidden></label>
      <div id="ocr" style="margin-top:14px"></div>`);
    body.querySelector('#ph').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const box = body.querySelector('#ocr');
      const url = URL.createObjectURL(file);
      box.innerHTML = String(html`<img src="${url}" alt="Your label photo" style="border-radius:12px;max-height:220px;margin:0 auto 12px"><div class="progress"><span id="bar" style="width:3%"></span></div><p class="small muted center" id="msg" style="margin-top:8px">Loading the text reader…</p>`);
      try {
        const { readLabel } = await import('../ocr.js');
        const text = await readLabel(file, (p, msg) => {
          const bar = body.querySelector('#bar');
          const m = body.querySelector('#msg');
          if (bar && p !== null) bar.style.width = Math.max(3, Math.round(p * 100)) + '%';
          if (m && msg) m.textContent = msg;
        });
        pasteState = { name: pasteState.name, brand: pasteState.brand, text: text.trim() };
        mode = 'paste';
        draw();
        drawPaste(s.body.querySelector('#addBody'), 'Here’s what the camera read. Fix any obvious mistakes, add the product name, then tap “Check ingredients”.');
      } catch (err) {
        box.innerHTML = String(html`<div class="callout danger">${icon('alert')}<div class="t">${err.message || 'Couldn’t read that photo.'} You can paste or tick the ingredients instead.</div></div>`);
      }
    });
  }

  function drawTick(body) {
    body.innerHTML = String(html`
      <label class="field" for="tn">Product name</label>
      <input type="text" id="tn" placeholder="e.g. Night Serum">
      <label class="field" for="tc" style="margin-top:12px">Type</label>
      <select id="tc">${CAT_ORDER.map((c) => html`<option value="${c}" ${c === 'serum' ? 'selected' : ''}>${CATEGORY_LABEL[c]}</option>`)}</select>
      <div class="small muted" style="margin:14px 0 8px">What’s in it? Tick what the label says.</div>
      <div class="tick-grid">${TICKABLE.map((id) => html`<label class="tick"><input type="checkbox" value="${id}"> ${ingName(id).replace(/ \(.*\)$/, '')}</label>`)}</div>
      <button class="btn sage block" id="addT" style="margin-top:14px">${icon('plus')} Add to my shelf</button>`);
    body.querySelector('#addT').addEventListener('click', () => {
      const name = body.querySelector('#tn').value.trim();
      if (!name) { toast('Give it a name first.'); return; }
      const actives = [...body.querySelectorAll('.tick input:checked')].map((i) => i.value);
      app.addProduct({ name, cat: body.querySelector('#tc').value, actives, strength: {}, flags: { ff: actives.includes('fragrance') ? false : null, eo: actives.includes('eo'), alcohol: actives.includes('alcohol') }, source: 'manual' });
      toast(`Added ${name}`);
      s.close();
    });
  }

  draw();
  setTimeout(() => { const q = s.body.querySelector('#q'); if (q && window.matchMedia('(min-width: 700px)').matches) q.focus(); }, 300);
}

