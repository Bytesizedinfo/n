import { html, icon, LOGO, toast } from '../ui.js';
import { app } from '../app.js';
import { storeStatus, signIn } from '../store/index.js';

export function render(view, { go }) {
  const draft = app.draft();
  const st = storeStatus();
  view.innerHTML = String(html`
    <div class="hero">
      <div class="logo">${LOGO}</div>
      <h1>Skin Ritual</h1>
      <p class="muted" style="font-size:16.5px;margin-top:8px">A routine built around your skin, and the products already on your shelf.</p>
    </div>
    <div class="card" style="margin-top:18px">
      <div class="feature"><div class="fi">${icon('sparkles')}</div><div><b>An adaptive quiz</b><div class="muted small">5–8 minutes. Follow-up questions only where they matter.</div></div></div>
      <div class="feature"><div class="fi">${icon('sun')}</div><div><b>Morning, night &amp; weekly plan</b><div class="muted small">Every step explained, with example products in SGD.</div></div></div>
      <div class="feature"><div class="fi">${icon('shelf')}</div><div><b>Checks your products work together</b><div class="muted small">Flags clashes, schedules around them and fills the gaps.</div></div></div>
      <div class="feature"><div class="fi">${icon('calendar')}</div><div><b>Gentle ramp-up</b><div class="muted small">Strong actives start slowly, one at a time.</div></div></div>
      <div class="feature"><div class="fi">${icon('book')}</div><div><b>Daily checklist &amp; skin journal</b><div class="muted small">Streaks, notes, photos and patterns over time.</div></div></div>
    </div>
    <div class="stack" style="margin-top:22px">
      <button class="btn primary block" data-start>${draft && draft.answers && Object.keys(draft.answers).length ? 'Continue the quiz' : 'Start the quiz'}</button>
      ${st.configured && !st.user ? html`<button class="btn block" data-signin>${icon('cloud')} Already set up? Sign in to sync</button>` : ''}
      ${st.user ? html`<p class="center small muted"><span class="sync-dot on"></span> Signed in as ${st.user.email}${st.status === 'syncing' ? ' · syncing…' : ''}</p>` : ''}
    </div>
    <p class="tiny faint center" style="margin-top:22px">General skincare guidance, not medical advice. See a doctor for persistent or severe skin problems.</p>
  `);
  view.querySelector('[data-start]').addEventListener('click', () => go('quiz'));
  const s = view.querySelector('[data-signin]');
  if (s) s.addEventListener('click', async () => {
    try { await signIn(); } catch (e) { toast(e.message || 'Sign-in failed'); }
  });
}
