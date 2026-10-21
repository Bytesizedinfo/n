/* JC.sunday — "Sunday at Lotus Pier": the one shared state every storyline and app reaction feeds.
   Sunday 18 Oct, 6:30 p.m., Lotus Pier: Jin Ling's 18th. JC.sunday.table(s) derives who sits at the table,
   what is served and what threatens it, from story flags only (docs/SUNDAY.md "Flag contract").
   Read-only: scenes change the table by setting flags; nothing here writes state. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const F = (s) => (s && s.flags) || {};
  const aff = (s, id) => ((s && s.aff) || {})[id] || 0;
  const num = (s, k) => (typeof F(s)[k] === 'number' ? F(s)[k] : 0);
  const susTotal = (s) => (typeof s.susTotal === 'function' ? s.susTotal() : Object.values(s.sus || {}).reduce((a, b) => a + (b || 0), 0));

  /** Jiang Cheng's trust in the stranger, settled on the Saturday call (higher is better). */
  function trust(s) {
    const f = F(s);
    if (f.zidian) return -99;
    let t = 0;
    if (f.told_truth) t += 2;
    if (f.returned_early) t += 1; // gave it back without being asked twice
    ['wwx_invited', 'tea_yes', 'car_handled', 'bday_planned', 'wwx_thanked', 'memo_sent', 'ajie_wrote', 'scandal_fixed', 'wn_invited']
      .forEach((k) => { if (f[k]) t += 1; });
    if (f.burned && !f.burned_mended) t -= 2;
    if (f.car_cover) t -= 1;
    if (f.nhs_leak) t -= 1;
    const sus = susTotal(s);
    if (sus >= 18) t -= 2; else if (sus >= 12) t -= 1;
    t += num(s, 'trust_bonus'); // the Saturday call adds or removes a point or two
    return t;
  }

  const SEATS = ['jc', 'jl', 'wwx', 'lwj', 'lxc', 'wn', 'sz', 'jy', 'nhs', 'huang', 'fairy', 'ajie', 'you'];

  function table(s) {
    s = s || (JC.story && JC.story.view ? JC.story.view() : { flags: {}, sus: {}, aff: {} });
    const f = F(s);
    const seats = {};
    const T = trust(s);

    seats.jc = { state: 'yes' };
    // Jin Ling: the party is at Lotus Pier unless the Jin board moved it (an unfixed scandal), or it was never planned there
    const moved = !!f.party_moved || (!!f.scandal && !f.scandal_fixed && !!f.saturday_done);
    seats.jl = { state: moved ? 'late' : 'yes', why: moved ? 'The Jin board moved his birthday to a Koi Tower press party; he escapes for cake.' : null };
    // Wei Wuxian and Lan Wangji
    if (f.burned && !f.burned_mended) seats.wwx = { state: 'outside', why: '"You should have stayed gone." He comes anyway, and waits outside the gate.' };
    else if (f.wwx_invited) seats.wwx = { state: 'yes' };
    else if (f.wwx_maybe && T >= 2) seats.wwx = { state: 'yes', why: 'Jiang Cheng turned "not no" into yes himself.' };
    else seats.wwx = { state: 'no', why: 'Nobody told him yes.' };
    seats.lwj = { state: seats.wwx.state === 'yes' ? 'yes' : seats.wwx.state === 'outside' ? 'outside' : 'no' };
    // Lan Xichen: tea on Saturday, then Sunday
    if (f.lxc_sunday || (f.tea_yes && aff(s, 'lxc') >= 3)) seats.lxc = { state: 'yes' };
    else if (f.tea_yes) seats.lxc = { state: 'late', why: 'Tea went well enough. He comes with the white peony, after dinner.' };
    else seats.lxc = { state: 'no' };
    // Wen Ning: first dinner at Lotus Pier since 2008
    seats.wn = { state: f.wn_invited || f.wn_accomplice ? 'yes' : f.wn_towed || f.wn_drives ? 'drives' : 'no' };
    // the kids
    seats.sz = { state: f.bday_planned ? 'yes' : 'no' };
    seats.jy = { state: f.bday_planned ? 'yes' : 'no' };
    // Nie Huaisang: ally or leak
    seats.nhs = { state: f.nhs_leak ? 'no' : f.nhs_ally ? 'yes' : 'no' };
    seats.huang = { state: 'gate', list: !!f.huang_list };
    seats.fairy = { state: f.dog_friday || f.fairy_inside || f.fairy_taken ? 'in' : 'garden' };
    seats.ajie = { state: 'bowl', honoured: !!(f.ajie_wrote || f.ajie_shared || f.memo_sent || f.wwx_thanked) };
    // You
    let you;
    if (f.zidian) you = 'photos';
    else if (f.you_invited || (f.told_truth && T >= 5)) you = 'table';
    else if (f.jl_knows && f.told_truth) you = 'table';
    else if (f.told_truth) you = 'thanks';
    else you = 'none';
    seats.you = { state: you, trust: T };

    // Dishes and the gift
    const soup = seats.wwx.state === 'yes' || seats.wwx.state === 'outside' ? (f.told_recipe ? 'right' : f.soup_practiced ? 'close' : 'almost') : 'none';
    const dishes = {
      soup,
      root: f.ops_keep ? 'honghu' : f.ops_soup ? 'canteen' : 'market',
      cake: f.cake_ok ? 'lotus seed' : f.bday_planned ? 'chocolate' : 'none',
      tea: seats.lxc.state !== 'no' ? 'white peony' : 'none',
      bell: f.gift_bell ? (f.bell_ready ? 'given' : 'unboxed') : 'none',
    };
    const threats = [];
    if (f.scandal && !f.scandal_fixed) threats.push('scandal');
    if (f.nhs_leak) threats.push('leak');
    if (f.burned && !f.burned_mended) threats.push('burned');
    if (susTotal(s) >= 18) threats.push('suspicion');
    if (f.memo_deleted) threats.push('memo_deleted');

    const at = (k, st) => seats[k].state === st;
    const filled = SEATS.filter((k) => ['yes', 'late', 'table', 'in', 'drives'].includes(seats[k].state)).length;
    let outcome = 'empty';
    if (at('you', 'table') && at('jl', 'yes') && at('wwx', 'yes') && at('lxc', 'yes') && at('wn', 'yes') && soup === 'right' && dishes.bell === 'given') outcome = 'full';
    else if (at('wwx', 'outside')) outcome = 'gate';
    else if (at('jl', 'late')) outcome = 'two_parties';
    else if (at('you', 'photos')) outcome = 'photos';
    else if (at('you', 'table') && at('wwx', 'yes')) outcome = 'six';
    else if (at('wwx', 'yes')) outcome = 'five';
    else if (seats.lxc.state !== 'no') outcome = 'tea';
    return { seats, dishes, threats, trust: T, filled, of: SEATS.length, outcome };
  }

  /** One line per seat for the live "Sunday" note and the widget. */
  function plan(s) {
    const t = table(s);
    const NAME = { jc: 'Me', jl: 'A-Ling', wwx: 'Wei Wuxian', lwj: 'Lan Wangji', lxc: 'Xichen', wn: 'Wen Ning', sz: 'Sizhui', jy: 'Jingyi', nhs: 'Huaisang', huang: 'Old Huang (gate)', fairy: 'Fairy', ajie: 'A-Jie', you: '—' };
    return { t, NAME };
  }

  // ── The old endings are consequences now (docs/SUNDAY.md "Consequences") ─────────────────
  // id → flags to set + the scene that carries the story on. Early returns skip to Saturday/Sunday;
  // the rest let the night continue with someone new in on the secret.
  const CONSEQUENCE = {
    honest: { set: { told_truth: true, returned_early: true }, start: 'early_return' },
    fairy: { set: { jl_knows: true, told_truth: true, returned_early: true, returned_how: 'fairy' }, start: 'early_return' },
    zidian: { set: { zidian: true }, start: 'zidian_fall' },
    wen_ning: { set: { wn_knows: true, wn_accomplice: true }, start: 'wn_accomplice' },
    busted: { set: { nhs_knows: true }, start: 'nhs_bargain' },
    koigate: { set: { scandal: true, scandal_kind: 'koi' }, start: 'scandal_breaks' },
    burned: { set: { burned: true }, start: 'burned_after' },
  };
  function consequence(id, fromScene) {
    const S = JC.story;
    const c = CONSEQUENCE[id] || { set: {}, start: 'saturday' };
    const set = Object.assign({}, c.set);
    if (id === 'honest' && !set.returned_how) set.returned_how = /swift|ride/.test(fromScene || '') ? 'swift' : /desk/.test(fromScene || '') ? 'desk' : /^r_sel|selfie/.test(fromScene || '') ? 'selfie' : 'confess';
    S.applyFx({ set });
    if (S.defs.scenes[c.start] && !S.view().done[c.start]) S.start(c.start);
    else console.warn('[sunday] consequence scene missing:', c.start, 'for', id);
  }

  /** Remember this dinner in the Sunday Dinners record (persists across restarts, like endings did). */
  function record(t, title) {
    const st = JC.state.d;
    st.endings = st.endings || {};
    const rec = st.endings.sunday || { at: Date.now(), outcomes: {}, seats: {} };
    rec.outcomes = rec.outcomes || {};
    rec.seats = rec.seats || {};
    rec.outcomes[t.outcome] = (rec.outcomes[t.outcome] || 0) + 1;
    Object.keys(t.seats).forEach((k) => { const v = t.seats[k].state; if (['yes', 'late', 'table', 'in', 'drives'].includes(v) || (k === 'ajie' && t.seats[k].honoured)) rec.seats[k] = true; });
    rec.last = { outcome: t.outcome, title: title || t.outcome, filled: t.filled, seats: Object.fromEntries(Object.entries(t.seats).map(([k, v]) => [k, v.state])), dishes: t.dishes, at: Date.now() };
    rec.title = title || rec.title;
    st.endings.sunday = rec;
    JC.state.saveNow();
    return rec;
  }

  // Seat names (as Jiang Cheng would write them), contact ids for avatars, and hints for seats never filled.
  const SEAT_INFO = {
    jc: { name: 'Jiang Cheng', cid: 'me', hint: 'He hosts. He always hosts.' },
    jl: { name: 'A-Ling', cid: 'jl', hint: 'Keep his birthday at Lotus Pier. Scandals move parties.' },
    wwx: { name: 'Wei Wuxian', cid: 'wwx', hint: 'Someone has to tell him yes. Thirteen years is long enough.' },
    lwj: { name: 'Lan Wangji', cid: 'lwj', hint: 'He comes where Wei Ying comes.' },
    lxc: { name: 'Lan Xichen', cid: 'lxc', hint: 'Tea on Saturday first. Then ask him about Sunday.' },
    wn: { name: 'Wen Ning', cid: 'wn', hint: 'He drives everyone everywhere. Ask him to come in.' },
    sz: { name: 'Sizhui', cid: 'sz', hint: 'Finish the birthday plan with the kids.' },
    jy: { name: 'Jingyi', cid: 'jy', hint: 'Finish the birthday plan with the kids.' },
    nhs: { name: 'Nie Huaisang', cid: 'nhs', hint: 'He knows everything. Make him an ally, not a headline.' },
    huang: { name: 'Old Huang', cid: 'huang', hint: 'He keeps the gate. Give him the guest list.' },
    fairy: { name: 'Fairy', cid: null, hint: 'Dogs at work on Fridays. Dogs at dinner on Sundays?' },
    ajie: { name: "A-Jie's bowl", cid: 'ajie', hint: 'Some bowls stay empty. Some get honoured.' },
    you: { name: 'You', cid: null, hint: 'Tell him the truth, and give him reasons to want you there.' },
  };
  const SEATED = ['yes', 'late', 'table', 'in', 'drives'];

  /** Rewrite Jiang Cheng's "Sunday" note in Notes from the table (his own checklist, kept current as you play). */
  const NOTE = 'n_sunday';
  function syncNote() {
    try {
      if (!JC.store || !JC.store.hasSeed || !JC.store.hasSeed('notes') || !JC.story || !JC.story.view) return;
      const t = table(JC.story.view());
      const mark = (k) => (SEATED.includes(t.seats[k].state) ? '☑︎' : t.seats[k].state === 'outside' ? '◐' : '☐');
      const lines = [
        'Sunday 6:30. Lotus Pier. A-Ling 18.',
        '',
        mark('jl') + ' A-Ling' + (t.seats.jl.state === 'late' ? ' (Koi Tower first. Board.)' : ''),
        mark('wwx') + ' Wei Wuxian' + (t.seats.wwx.state === 'outside' ? ' (outside the gate)' : '') + ' / ' + mark('lwj') + ' Lan Wangji',
        mark('lxc') + ' Xichen' + (t.seats.lxc.state === 'late' ? ' (after dinner?)' : ''),
        mark('wn') + ' Wen Ning' + (t.seats.wn.state === 'drives' ? ' (driving. Make him come in.)' : ''),
        mark('sz') + ' Sizhui, ' + mark('jy') + ' Jingyi',
        mark('nhs') + ' Huaisang',
        (t.seats.huang.list ? '☑︎' : '☐') + ' Guest list to Old Huang',
        (t.seats.fairy.state === 'in' ? '☑︎' : '☐') + ' Fairy inside',
        '',
        'Soup: ' + ({ right: 'low fire, two hours', close: 'he practised', almost: 'he will rush it', none: '—' })[t.dishes.soup],
        'Lotus root: ' + ({ honghu: 'from the 400 kg', canteen: 'canteen', market: 'market' })[t.dishes.root],
        'Cake: ' + t.dishes.cake,
        'Bell: ' + ({ given: 'polished, purple box', unboxed: 'needs the box', none: '?' })[t.dishes.bell],
        '',
        '(Five bowls. Set the fifth.)',
      ];
      const ex = JC.store.get('notes', NOTE);
      if (!ex) JC.store.add('notes', { id: NOTE, folder: 'personal', title: 'Sunday', body: lines, t: JC.time.now(), created: JC.time.parse('-2 22:10'), pinned: true, locked: false }, { front: true });
      else if (JSON.stringify(ex.body) !== JSON.stringify(lines)) JC.store.update('notes', NOTE, { body: lines, t: JC.time.now() });
    } catch (e) { /* notes not ready */ }
  }
  let syncT = null;
  const syncSoon = () => { clearTimeout(syncT); syncT = setTimeout(() => { syncNote(); if (JC.os && JC.os.refreshWidgets) JC.os.refreshWidgets(); }, 400); };
  if (JC.edition === 'sunday' && JC.bus) {
    JC.bus.on('boot', syncSoon);
    JC.bus.on('story:fx', syncSoon);
    JC.bus.on('story:sus', syncSoon);
    JC.bus.on('story:reset', syncSoon);
  }

  JC.sunday = { table, trust, plan, SEATS, SEAT_INFO, SEATED, consequence, CONSEQUENCE, record, syncNote };
})();
