import { html, icon, toast } from '../ui.js';
import { app } from '../app.js';
import { SECTIONS, visibleQuestions, optionsFor, isAnswered, isComplete, pruneAnswers } from '../data/questions.js';

export function render(view, { go, params }) {
  let draft = app.draft();
  if (!draft || !draft.answers || (params.get('retake') && draft.mode !== 'retake')) {
    const retake = !!params.get('retake') && !!app.answers();
    draft = { answers: retake ? { ...app.answers() } : { climate: 'tropical' }, index: 0, mode: retake ? 'retake' : 'new' };
    app.saveDraft(draft);
  }
  const answers = draft.answers;
  const visible = visibleQuestions(answers);
  let index = Math.min(Math.max(0, draft.index || 0), visible.length - 1);
  const q = visible[index];
  const opts = q.type === 'text' ? [] : optionsFor(q, answers);
  const value = answers[q.id];
  const answered = isAnswered(q, answers) && (q.optional || q.type === 'text' || (Array.isArray(value) ? value.length : value !== undefined));
  const isLast = index === visible.length - 1;
  const pct = Math.round(((index) / visible.length) * 100);

  const save = (patch) => {
    draft = { ...draft, ...patch, answers: pruneAnswers(patch.answers || draft.answers) };
    app.saveDraft(draft);
  };
  const goto = (i) => { save({ index: i }); render(view, { go, params: new URLSearchParams() }); window.scrollTo(0, 0); };
  const finish = () => {
    const final = pruneAnswers(draft.answers);
    if (!isComplete(final)) {
      const vis = visibleQuestions(final);
      const firstMissing = vis.findIndex((x) => !isAnswered(x, final));
      toast('A couple of questions still need an answer.');
      goto(Math.max(0, firstMissing));
      return;
    }
    view.innerHTML = String(html`<div class="hero" style="padding-top:28vh"><div class="logo" style="width:64px;height:64px;margin:0 auto 16px">${icon('sparkles')}</div><h2>Building your routine…</h2><p class="muted">Checking ingredients, clashes and your schedule.</p></div>`);
    setTimeout(() => {
      app.finishQuiz(final);
      go('routine', { new: '1' });
    }, 450);
  };
  const next = () => (isLast ? finish() : goto(index + 1));

  view.innerHTML = String(html`
    <div class="quiz-top">
      <button class="icon-btn" data-back aria-label="${index > 0 ? 'Previous question' : 'Close quiz'}">${icon(index > 0 ? 'left' : 'x')}</button>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${visible.length}" aria-valuenow="${index}" aria-label="Quiz progress"><span style="width:${pct}%"></span></div>
      <span class="small muted" style="min-width:52px;text-align:right">${index + 1} / ${visible.length}</span>
    </div>
    <div class="quiz-section">${SECTIONS[q.section] || ''}${draft.mode === 'retake' ? ' · Retake' : ''}</div>
    <h1 class="quiz-title" id="qtitle" data-q="${q.id}">${q.title}</h1>
    ${q.help ? html`<p class="quiz-help">${q.help}</p>` : ''}
    ${q.type === 'text'
      ? html`<textarea id="qtext" aria-labelledby="qtitle" placeholder="Optional">${value || ''}</textarea>`
      : html`<div class="opts" role="${q.type === 'single' ? 'radiogroup' : 'group'}" aria-labelledby="qtitle">
        ${opts.map((o) => {
          const on = q.type === 'multi' ? Array.isArray(value) && value.includes(o.value) : value === o.value;
          return html`<button class="opt ${q.type === 'multi' ? 'multi' : ''}" data-v="${o.value}" role="${q.type === 'single' ? 'radio' : 'checkbox'}" aria-checked="${on}">
            <span class="mark">${icon('check')}</span><span>${o.label}</span></button>`;
        })}
      </div>`}
    <div class="quiz-foot">
      ${q.optional && !(Array.isArray(value) ? value.length : value) ? html`<button class="btn grow" data-skip>Skip</button>` : ''}
      <button class="btn primary grow" data-next ${answered || q.type === 'text' ? '' : 'disabled'}>${isLast ? 'See my routine' : 'Next'}</button>
    </div>
    ${q.type === 'multi' && q.max ? html`<p class="tiny faint center" style="margin-top:10px">Up to ${q.max}</p>` : ''}
  `);

  view.querySelector('[data-back]').addEventListener('click', () => {
    if (index > 0) { goto(index - 1); return; }
    if (draft.mode === 'retake') app.clearDraft();
    go(app.routine() ? 'more' : 'welcome');
  });
  const nextBtn = view.querySelector('[data-next]');
  nextBtn.addEventListener('click', () => {
    if (q.type === 'text') save({ answers: { ...draft.answers, [q.id]: view.querySelector('#qtext').value.trim() } });
    next();
  });
  const skip = view.querySelector('[data-skip]');
  if (skip) skip.addEventListener('click', () => { save({ answers: { ...draft.answers, [q.id]: q.type === 'multi' ? [] : '' } }); next(); });

  view.querySelectorAll('.opt').forEach((btn) => btn.addEventListener('click', () => {
    const v = btn.dataset.v;
    if (q.type === 'single') {
      save({ answers: { ...draft.answers, [q.id]: v } });
      view.querySelectorAll('.opt').forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
      nextBtn.disabled = false;
      setTimeout(next, 180);
      return;
    }
    let list = Array.isArray(draft.answers[q.id]) ? draft.answers[q.id].slice() : [];
    const exclusive = q.exclusive || [];
    if (exclusive.includes(v)) list = list.includes(v) ? [] : [v];
    else {
      list = list.filter((x) => !exclusive.includes(x));
      if (list.includes(v)) list = list.filter((x) => x !== v);
      else {
        if (q.max && list.length >= q.max) { toast(`Pick up to ${q.max}.`); return; }
        list.push(v);
      }
    }
    save({ answers: { ...draft.answers, [q.id]: list } });
    view.querySelectorAll('.opt').forEach((b) => b.setAttribute('aria-checked', String(list.includes(b.dataset.v))));
    nextBtn.disabled = !(list.length || q.optional);
    if (skip) skip.hidden = list.length > 0;
  }));
}
