/* App reactions — the "life" apps: Notes, Calendar, Reminders, Health, Voice Memos, Phone (voicemails), Contacts,
   Settings (Focus, Airplane Mode, wallpaper) and Clock. What the player does there reaches the people in the phone.
   Every reaction is `polite` and night-only unless noted. Design notes, flags and FINALE notes: docs/reactions/life.md.
   Facts: docs/STORY.md. Format: docs/DEV.md "App reactions". */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => (s && s.flags) || {};
  const night = (s) => !F(s).night_done;
  const live = () => (JC.state && JC.state.d && JC.state.d.flags) || {};

  // ── helpers ──────────────────────────────────────────────────────
  // Loops that give up at the end of the night jump to 'off' (added automatically).
  const usesOff = (nodes) => Object.keys(nodes).some((n) => (nodes[n] || []).some((st) => st && (st.go === 'off' || st.else === 'off' || st.onTimeout === 'off')));
  function R(def) {
    if (def.nodes && !def.nodes.off && usesOff(def.nodes)) def.nodes.off = [{ end: true }];
    def.polite = true;
    return S.scene(def);
  }
  // Main scenes lock `busy_<thread>` while they talk; reactions take turns with them.
  const lock = (k) => ({ fx: { set: { ['busy_' + k]: true } } });
  const free = (k) => ({ fx: { set: { ['busy_' + k]: false } } });
  // Hold the thread for a short reply after a choice, only if nobody else holds it.
  const grab = (k, tag) => ({ run: (api) => { const f = api.state.flags; if (!f['busy_' + k]) { f['busy_' + k] = true; f['r_hold_' + tag] = true; } } });
  const release = (k, tag) => ({ run: (api) => { const f = api.state.flags; f['r_reply_' + k] = false; if (f['r_hold_' + tag]) { f['busy_' + k] = false; f['r_hold_' + tag] = false; } } });
  // A reply option marks the thread the moment it is chosen (option fx apply at once; the reply's first step only
  // runs ~1 s later), so another waiting reaction can't slip its question in before the answer.
  const replying = (k, o) => Object.assign(o, { fx: Object.assign({}, o.fx, { set: Object.assign({}, (o.fx || {}).set, { ['r_reply_' + k]: true }) }) });
  const idle = (k) => (s) => !F(s)['busy_' + k] && !F(s)['r_reply_' + k];
  // Wait until no other scene holds the thread.
  const waitFree = (k, next, self, anytime) => [
    ...(anytime ? [] : [{ if: (s) => !!F(s).night_done, go: 'off' }]),
    { if: idle(k), go: next },
    { wait: 5 },
    { go: self },
  ];
  // A reply is offered only while the player is looking at the thread and nobody else holds it, so a pending
  // reaction never blocks a main scene in a thread the player isn't reading.
  const looking = (k) => !!(S.openThread && S.openThread() === k && JC.os.isOpen && JC.os.isOpen('messages') && !JC.os.locked);
  const waitView = (k, next, self, guard) => [
    { if: (s) => !!F(s).night_done || (guard ? !guard(s) : false), go: 'off' },
    { if: (s) => idle(k)(s) && looking(k) && !S.pending(k), go: next },
    { wait: 2 },
    { go: self },
  ];
  // Reactions add at most +2 affection per contact in total (the Messages choices must still matter).
  const CAP = 2;
  const affUp = (cid, n, hint) => ({ run: (api) => {
    const f = api.state.flags;
    const k = 'r_aff_' + cid;
    const give = Math.max(0, Math.min(n, CAP - (f[k] || 0)));
    if (!give) return;
    api.story.applyFx({ aff: { [cid]: give }, inc: { [k]: give } });
    if (hint) api.story.hint(hint);
  } });
  // A message whose text is read from live state when it is typed.
  function say(fn, o) {
    const st = Object.assign({}, o || {});
    Object.defineProperty(st, 'm', { enumerable: true, get: () => { let t = ''; try { t = fn(live()); } catch (e) { /* fallback */ } return t ? String(t) : '…'; } });
    return st;
  }
  // `match` sees the act payload; scenes don't. Keep what a reaction needs in a flag.
  const keep = (s, k, v) => { F(s)[k] = v; return true; };
  const q = (t) => '“' + String(t || '').trim() + '”';
  const clock12 = () => { const d = JC.time.date(); return (d.getHours() % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const hasEmoji = (t) => /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(String(t || ''));

  // ═════════════════════════════════════════════════════════════════
  // NOTES — the locked "Private" note: an unfinished letter, "Xichen — / On the balcony you said"
  // (started 7 Sep 2025, the night of his first one-sided text; the second line was added tonight at 23:19).
  // ═════════════════════════════════════════════════════════════════
  const SEED_DRAFT = 'Xichen —\n\nOn the balcony you said';
  const squash = (t) => String(t || '').replace(/[—–-]+/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
  function draftNote() { const n = JC.store.get('notes', 'n_private'); return n && !n.deleted ? n : null; }
  /** the letter as it stands in Notes now (the player may have finished it) */
  function draftText() {
    const n = draftNote();
    if (!n) return SEED_DRAFT;
    const title = String(n.title || '').trim();
    const body = String(n.body || '');
    let lines = (!title || body.startsWith(title) ? body : title + '\n' + body).split('\n');
    if (lines.length && /^private$/i.test(lines[0].trim())) lines = lines.slice(1);
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const t = lines.join('\n').replace(/\[(photo|sketch): [^\]]+\]/g, '').trim();
    return (t || SEED_DRAFT).slice(0, 700);
  }
  const unfinished = (t) => { const a = squash(t), b = squash(SEED_DRAFT); return !a || a === b || a.length <= b.length || /(you said|xichen -)$/.test(a); };
  const draftLike = (t) => { const a = squash(t); return !!a && (a.startsWith('xichen -') || a.includes('on the balcony you said') || a === squash(draftText())); };
  function draftOption() {
    const opt = replying('lxc', { go: 'send', if: (s) => !F(s).xichen_draft_sent });
    Object.defineProperty(opt, 't', { enumerable: true, get: () => draftText() });
    Object.defineProperty(opt, 'label', { enumerable: true, get: () => {
      const t = draftText();
      const first = t.split('\n')[0].trim();
      return (first.length > 22 ? first.slice(0, 21).trim() : first) + ' … ' + (unfinished(t) ? '[Send the unfinished draft]' : '[Send the letter]');
    } });
    return opt;
  }
  const draftFin = (s) => !unfinished(F(s).r_draft_text || '');

  // Lan Xichen reads it. The high point of the XiCheng arc.
  function draftReply(tag) {
    return {
      reply: [
        grab('lxc', tag),
        { wait: 3 },
        { typing: 6 }, { wait: 4 }, { typing: 4 }, { wait: 6 }, { typing: 8 },
        { if: (s) => !!F(s).r_draft_late, go: 'late' },
        { go: 'open' },
      ],
      late: [
        { m: "Forgive me. I've been reading the other thing you sent, over and over, while we talked." },
        { go: 'open' },
      ],
      open: [
        { m: 'Wanyin.', d: 1.6 },
        { if: draftFin, go: 'fin' },
        { m: "I think you've sent me the beginning of a letter." },
        { m: "It stops in the middle of a sentence. I've read it several times, in case the rest arrives." },
        { go: 'name' },
      ],
      fin: [
        { m: "I've read it three times. I'm about to read it a fourth, so forgive me if I'm slow." },
        { go: 'name' },
      ],
      name: [
        { if: (s) => !!F(s).lxc_first_name, go: 'name2' },
        { m: 'It begins with my name. Not Zewu-jun. Just Xichen, and a dash, as if you needed a breath before the rest.' },
        { go: 'body' },
      ],
      name2: [
        { m: "And it begins with Xichen again. I'm still not used to that. I hope I never am." },
        { go: 'body' },
      ],
      body: [{ if: draftFin, go: 'body_fin', else: 'body_unf' }],
      body_unf: [
        { m: "On the balcony I said that I missed you. If that is where this sentence was going, you don't have to finish it tonight." },
        { m: 'You wrote to me for a whole year without knowing whether I read a single word.' },
        { m: 'I can wait for the end of one sentence.' },
        { go: 'end' },
      ],
      body_fin: [
        { m: "You usually stop at the first full stop and call it an answer. You didn't, this time." },
        { if: (s) => hasEmoji(F(s).r_draft_text), go: 'emoji', else: 'body_fin2' },
      ],
      emoji: [
        { m: "(There's a small picture in the middle of it. I've decided Wei Wuxian borrowed your phone for that part.)" },
        { fx: { sus: { lxc: 1 } } },
        { go: 'body_fin2' },
      ],
      body_fin2: [
        { m: "On the balcony I said that I missed you. I'd like to answer this properly, in person, where I can see your face while I do." },
        { go: 'end' },
      ],
      end: [
        { react: 'love', from: 'lxc', on: 'me' },
        { wait: 2 },
        { if: (s) => !!F(s).tea_yes, go: 'end_tea' },
        { m: 'Goodnight, Wanyin. Take as long as you like. 🙂' },
        { go: 'done' },
      ],
      end_tea: [
        { if: draftFin, go: 'end_tea_fin' },
        { m: "Bring the rest at three, if you find it. If you don't, bring yourself. That was always the part I wanted. 🙂" },
        { go: 'done' },
      ],
      end_tea_fin: [
        { m: "Three o'clock, then. I'll have the water at eighty-five degrees, and the rest of my answer. 🙂" },
        { go: 'done' },
      ],
      done: [release('lxc', tag)],
    };
  }
  const draftSent = [
    { fx: { set: { xichen_draft_sent: true } } },
    affUp('lxc', 2, 'Lan Xichen will remember that.'),
    { log: (s) => (draftFin(s) ? 'Finished his letter to Lan Xichen and sent it' : 'Sent Lan Xichen the letter he never finished'), once: 'draft_sent' },
  ];
  const draftChoiceOpen = () => !!((JC.state.d.runs || []).some((r) => r.sc === 'r_note_private' && r.wait === 'choice'));

  // Opening the locked note. The choice waits until the player is reading Lan Xichen's thread.
  R({
    id: 'r_note_private',
    thread: 'lxc',
    trigger: { on: 'act', act: 'note_open', match: (p) => !!p && p.id === 'n_private', delay: 1 },
    nodes: Object.assign({
      start: [
        { fx: { set: { xichen_draft_read: true } } },
        { log: 'Unlocked his note marked “Private”', once: 'note_private' },
        { go: 'wait' },
      ],
      wait: waitView('lxc', 'offer', 'wait', (s) => !F(s).xichen_draft_sent && !!draftNote()),
      offer: [
        { fx: { inc: { r_draft_offers: 1 } } },
        { choice: [
            draftOption(),
            { t: 'Leave it unsent', label: '[Leave it unsent]', silent: true, go: 'keep' },
          ], timeout: 90, onTimeout: 'later' },
      ],
      later: [
        { if: (s) => (F(s).r_draft_offers || 0) >= 2, go: 'keep' },
        { wait: 45 },
        { go: 'wait' },
      ],
      send: [
        { run: (api) => { api.state.flags.r_draft_text = draftText(); api.state.flags.r_draft_late = false; } },
        ...draftSent,
        { go: 'reply' },
      ],
      keep: [
        { if: (s) => !!F(s).xichen_draft_sent, go: 'off' },
        { fx: { set: { xichen_draft_kept: true } } },
        { log: 'Read his unfinished letter to Lan Xichen and left it unsent', once: 'draft_kept' },
      ],
    }, draftReply('draft')),
  });

  // The same letter sent another way (Notes' share sheet, "Send a Copy", or typed out by hand).
  R({
    id: 'r_note_shared',
    thread: 'lxc',
    trigger: { on: 'act', act: 'send', delay: 1, match: (p, s) => !!p && p.thread === 'lxc' && p.kind === 'text' && !F(s).xichen_draft_sent && draftLike(p.text) && !draftChoiceOpen() && keep(s, 'r_draft_text', String(p.text || '')) },
    nodes: Object.assign({
      start: [
        ...draftSent,
        { run: (api) => { api.state.flags.r_draft_at = api.state.eng; } },
        { go: 'hold' },
      ],
      hold: [
        { if: (s) => !F(s).busy_lxc && !S.pending('lxc'), go: 'go' },
        { wait: 3 },
        { go: 'hold' },
      ],
      go: [
        { run: (api) => { const f = api.state.flags; f.r_draft_late = api.state.eng - (f.r_draft_at || 0) > 15000; } },
        { go: 'reply' },
      ],
    }, draftReply('draft2')),
  });

  // Reading the list he keeps pinned.
  R({
    id: 'r_note_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'note_open', match: (p) => !!p && p.id === 'n_wwx' },
    nodes: { start: [{ fx: { set: { wwx_list_read: true } } }, { log: 'Read “Things I will not say to Wei Wuxian”', once: 'note_wwx' }] },
  });
  R({
    id: 'r_note_del_private',
    thread: 'lxc',
    trigger: { on: 'act', act: 'note_delete', match: (p) => !!p && p.id === 'n_private' },
    nodes: { start: [{ fx: { set: { xichen_draft_deleted: true } } }, { log: 'Deleted his unfinished letter to Lan Xichen', once: 'note_del_private' }] },
  });
  R({
    id: 'r_note_del_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'note_delete', match: (p) => !!p && p.id === 'n_wwx' },
    nodes: { start: [{ fx: { set: { wwx_list_deleted: true } } }, { log: 'Deleted “Things I will not say to Wei Wuxian”. (It said to.)', once: 'note_del_wwx' }] },
  });

  // ═════════════════════════════════════════════════════════════════
  // CALENDAR — "Tea? — Hanshi" is Lan Xichen's invitation (sent after Wednesday's call; JC answered "Maybe").
  // Accepting it there and accepting in Messages never both count: whoever is second only logs.
  // ═════════════════════════════════════════════════════════════════
  // Wait for Lan Xichen's own conversation (and its invitation) to finish, so he never asks twice.
  const teaReady = (s) => !!F(s).night_done || (!!(s.fin && s.fin.lxc_home) && !F(s).busy_lxc && !S.pending('lxc'));
  R({
    id: 'r_cal_tea_yes',
    thread: 'lxc',
    trigger: { on: 'act', act: 'event_add', match: (p) => !!p && p.id === 'ev_tea_q' && (p.accepted === true || p.status === 'accepted'), delay: 2 },
    nodes: {
      start: [
        // the question mark comes off the title (Tang Mei notices that)
        { run: () => { try { const ev = JC.store.get('events', 'ev_tea_q'); if (ev && /\?/.test(ev.title)) JC.store.update('events', 'ev_tea_q', { title: ev.title.replace(/\?/g, '').replace(/\s{2,}/g, ' ').trim() }); } catch (e) { /* ignore */ } } },
        { go: 'wait' },
      ],
      wait: [{ if: teaReady, go: 'go' }, { wait: 4 }, { go: 'wait' }],
      go: [
        { if: (s) => !!F(s).tea_yes, go: 'twice' },
        { fx: { set: { tea_yes: true, tea_cal: true } } },
        affUp('lxc', 1, 'Lan Xichen will remember that.'),
        { log: 'Accepted Lan Xichen’s invitation to tea, in the calendar', once: 'tea_cal' },
        { if: (s) => !!F(s).night_done, go: 'off' },
        lock('lxc'),
        { m: 'Wanyin.' },
        { m: 'My calendar has just informed me, very formally, that Jiang Wanyin has accepted an invitation to tea.' },
        { if: (s) => !!F(s).lxc_invited, go: 'changed' },
        { m: "I sent it on Wednesday so that you could say no without having to say it to me. I didn't think it would ever say yes." },
        { go: 'three' },
      ],
      changed: [
        { m: "Earlier, I think, the answer was no. I'm very glad it changed its mind." },
        { go: 'three' },
      ],
      three: [{ m: "Three o'clock, then. The water will be at eighty-five degrees. 🙂" }, free('lxc')],
      twice: [{ log: 'Accepted tea at the Hanshi twice: once in Messages, once in the calendar', once: 'tea_cal' }],
    },
  });
  R({
    id: 'r_cal_tea_no',
    thread: 'lxc',
    trigger: { on: 'act', act: 'event_decline', match: (p) => !!p && p.id === 'ev_tea_q', delay: 2 },
    nodes: {
      start: [{ if: teaReady, go: 'go' }, { wait: 4 }, { go: 'start' }],
      go: [
        { if: (s) => !!F(s).tea_yes, go: 'off' },
        { fx: { set: { tea_declined: true } } },
        { log: 'Declined Lan Xichen’s invitation to tea', once: 'tea_no' },
        { if: (s) => !!F(s).night_done, go: 'off' },
        lock('lxc'),
        { m: "Wanyin. My calendar tells me you've declined tomorrow." },
        { m: "Thank you for answering it. A no is kinder than a maybe that never ends, and I know it wasn't easy to send." },
        { m: "The invitation doesn't expire. Whenever you like." },
        free('lxc'),
      ],
    },
  });

  // New events: Tang Mei gets his calendar notifications ("You made that decision in 2019.").
  const SUN0 = () => JC.time.parse('+2 00:00');
  function sundayish(p) {
    const ev = JC.store.get('events', p.id);
    const t = ev && ev.start;
    if (t && t >= SUN0() && t < SUN0() + 86400e3) return true;
    return /a-?ling|jin ling|birthday|bday|sunday|dinner|soup|lotus pier|\b18\b/i.test(String(p.title || ''));
  }
  const newEvent = (p) => !!p && !!p.title && p.isNew === true;
  R({
    id: 'r_cal_sunday',
    thread: 'ea',
    trigger: { on: 'act', act: 'event_add', delay: 25, match: (p, s) => newEvent(p) && sundayish(p) && keep(s, 'r_ev_sun', p.title) },
    nodes: {
      start: [{ log: (s) => 'Put ' + q(F(s).r_ev_sun) + ' in his calendar, for Sunday', once: 'ev_sunday' }, { go: 'wait' }],
      wait: waitFree('ea', 'go', 'wait'),
      go: [
        lock('ea'),
        say((f) => 'Your calendar just synced: ' + q(f.r_ev_sun) + '.'),
        { m: 'Noted.' },
        { m: "I've kept the weekend of A-Ling's birthday clear every year since 2017. You've never asked why." },
        free('ea'),
      ],
    },
  });
  R({
    id: 'r_cal_new',
    thread: 'ea',
    trigger: { on: 'act', act: 'event_add', delay: 30, match: (p, s) => newEvent(p) && !sundayish(p) && keep(s, 'r_ev_new', p.title) },
    nodes: {
      start: [{ log: (s) => 'Added ' + q(F(s).r_ev_new) + ' to his calendar', once: 'ev_new' }, { go: 'wait' }],
      wait: waitFree('ea', 'go', 'wait'),
      go: [
        lock('ea'),
        say((f) => 'Your calendar just synced: ' + q(f.r_ev_new) + '.'),
        { m: "You added an event yourself. You haven't added an event yourself since 2019." },
        { m: "I'm not going to ask." },
        { fx: { sus: { ea: 1 }, hint: 'Tang Mei noticed.' } },
        free('ea'),
      ],
    },
  });

  // Invitations in the Calendar inbox: the organizer sees the reply.
  const invReply = (inv, status) => (p) => !!p && p.invite === inv && (p.status || (p.accepted ? 'accepted' : '')) === status;
  R({
    id: 'r_inv_wwx_yes',
    thread: 'wwx',
    trigger: { on: 'act', act: 'event_add', match: invReply('inv_wwx', 'accepted'), delay: 20 },
    nodes: {
      start: [{ log: 'Accepted Wei Wuxian’s invitation to his birthday radish harvest', once: 'inv_wwx' }, { go: 'wait' }],
      wait: waitFree('wwx', 'go', 'wait'),
      go: [
        lock('wwx'),
        { m: 'JIANG CHENG' },
        { m: 'u ACCEPTED my radish party' },
        { m: 'u never accept anything. u leave invites in ur inbox until they expire out of spite' },
        { m: 'LAN ZHAN. HE PRESSED ACCEPT. ON PURPOSE' },
        { m: "it's on my birthday btw. u knew that. u definitely knew that" },
        { fx: { sus: { wwx: 1 }, hint: 'Wei Wuxian noticed.' } },
        free('wwx'),
      ],
    },
  });
  R({
    id: 'r_inv_wwx_maybe',
    thread: 'wwx',
    trigger: { on: 'act', act: 'event_add', match: invReply('inv_wwx', 'maybe'), delay: 20 },
    nodes: {
      start: [{ log: 'Answered “maybe” to Wei Wuxian’s birthday radish harvest', once: 'inv_wwx_maybe' }, { go: 'wait' }],
      wait: waitFree('wwx', 'go', 'wait'),
      go: [
        lock('wwx'),
        { m: 'a MAYBE' },
        { m: 'from u a maybe is a yes wearing a hat' },
        { m: "i'm putting u down for a shovel" },
        free('wwx'),
      ],
    },
  });
  R({
    id: 'r_inv_wwx_no',
    thread: 'wwx',
    trigger: { on: 'act', act: 'event_decline', match: (p) => !!p && p.invite === 'inv_wwx', delay: 20 },
    nodes: {
      start: [{ log: 'Declined Wei Wuxian’s birthday radish harvest', once: 'inv_wwx_no' }, { go: 'wait' }],
      wait: waitFree('wwx', 'go', 'wait'),
      go: [
        lock('wwx'),
        { m: 'ok rude' },
        { m: "i'm leaving it open anyway. radishes don't hold grudges" },
        { m: '(lan zhan does)' },
        free('wwx'),
      ],
    },
  });
  R({
    id: 'r_inv_nhs_yes',
    thread: 'nhs',
    trigger: { on: 'act', act: 'event_add', match: (p) => invReply('inv_nhs', 'accepted')(p) || invReply('inv_nhs', 'maybe')(p), delay: 20 },
    nodes: {
      start: [{ log: 'Said yes, more or less, to Nie Huaisang’s fan exhibition', once: 'inv_nhs' }, { go: 'wait' }],
      wait: waitFree('nhs', 'go', 'wait'),
      go: [
        lock('nhs'),
        { m: 'BROTHER JIANG?!?! 🙈🙈' },
        { m: "You answered my invitation!!! You've never answered a single invitation I've sent you. I have a spreadsheet" },
        { m: 'Hmm~ who are you and what have you done with Brother Jiang hehe 👀' },
        { fx: { sus: { nhs: 2 }, hint: 'Nie Huaisang noticed.' } },
        free('nhs'),
      ],
    },
  });
  R({
    id: 'r_inv_qr',
    thread: 'qr',
    trigger: { on: 'act', act: 'event_add', match: (p, s) => !!p && p.invite === 'inv_qr' && keep(s, 'r_inv_qr', p.status || 'accepted'), delay: 25 },
    nodes: {
      start: [{ log: 'Answered Lan Qiren’s board dinner invitation. Promptly.', once: 'inv_qr' }, { go: 'wait' }],
      wait: waitFree('qr', 'go', 'wait'),
      go: [
        { if: (s) => F(s).r_inv_qr === 'maybe', go: 'maybe' },
        { m: 'Your acceptance has been received. At this hour.' },
        { m: '— Lan Qiren' },
      ],
      maybe: [
        { m: '"Maybe" is not an answer the board recognises.' },
        { m: '— Lan Qiren' },
      ],
    },
  });

  // ═════════════════════════════════════════════════════════════════
  // REMINDERS — the A-Ling list is shared with Sizhui, Groceries with Old Huang, Work with Tang Mei.
  // ═════════════════════════════════════════════════════════════════
  const remKeep = (s, p) => keep(s, 'r_rem_' + p.list, p.id) && keep(s, 'r_rem_' + p.list + '_t', p.title || '');
  R({
    id: 'r_rem_bell',
    thread: 'sz',
    trigger: { on: 'act', act: 'reminder_done', match: (p) => !!p && p.id === 'a_box', delay: 25 },
    nodes: {
      start: [{ log: 'Ticked off “The bell — purple velvet box” on the list Sizhui can see', once: 'rem_bell' }, { go: 'wait' }],
      wait: waitFree('sz', 'go', 'wait'),
      go: [
        lock('sz'),
        { if: (s) => !!F(s).gift_bell, go: 'known' },
        { m: 'Mr. Jiang, sorry, our A-Ling list just updated: “The bell — purple velvet box.”' },
        { m: "I didn't mean to read it. I read everything on shared lists. It's a flaw." },
        { m: 'Is it his mother’s bell?' },
        { m: "You don't have to answer. I won't tell anyone. Especially not Jingyi." },
        free('sz'),
      ],
      known: [
        { m: 'Mr. Jiang, I saw the box is ticked off on our list. Purple velvet.' },
        { m: "Jin Ling is going to complain about the colour for one whole minute. Then he isn't going to take it off. 😊" },
        free('sz'),
      ],
    },
  });
  const ALING = {
    a_card: ['Mr. Jiang, I see the card is done! I won’t ask what you wrote.', '(Jingyi will ask. Please don’t tell him.)'],
    a_cake: ['Mr. Jiang, I see the cake is ticked off. I’ll confirm Jin’s Cakes for Sunday, 17:00.', 'Lotus seed paste. Not gold. 😊'],
    a_sandu: ['Mr. Jiang… you’ve ticked off “Do NOT let him drive Sandu.”', 'I’m not sure that one can be ticked off anymore.'],
    a_permit: ['Mr. Jiang, you’ve ticked off the fifty supervised hours. He has fourteen.', 'He’s going to tell you tonight counted.'],
    a_string: ['A new bowstring before regionals, noted! I’ll tell the coach. 😊'],
    a_uni: ['Mr. Jiang, you’ve ticked off “University applications — ask. Gently.”', '…Did you ask? Was it gentle?'],
    a_bell: ['Mr. Jiang, the bell is ticked off again. I think that means it is very polished. 😊'],
  };
  R({
    id: 'r_rem_aling',
    thread: 'sz',
    trigger: { on: 'act', act: 'reminder_done', match: (p, s) => !!p && p.list === 'aling' && p.id !== 'a_box' && remKeep(s, p), delay: 25 },
    nodes: {
      start: [{ log: (s) => 'Ticked off ' + q(F(s).r_rem_aling_t) + ' on the A-Ling list (Sizhui can see it)', once: 'rem_aling' }, { go: 'wait' }],
      wait: waitFree('sz', 'go', 'wait'),
      go: [
        lock('sz'),
        say((f) => (ALING[f.r_rem_aling] || ['Mr. Jiang, our A-Ling list just updated: ' + q(f.r_rem_aling_t) + '. Noted! 😊'])[0]),
        { if: (s) => (ALING[F(s).r_rem_aling] || []).length > 1, go: 'two' },
        free('sz'),
      ],
      two: [say((f) => ALING[f.r_rem_aling][1]), free('sz')],
    },
  });
  R({
    id: 'r_rem_lotus',
    thread: 'huang',
    trigger: { on: 'act', act: 'reminder_done', match: (p) => !!p && p.id === 'g_lotus', delay: 30 },
    nodes: {
      start: [{ log: 'Ticked off “Lotus root — 2 sections” on the list Old Huang shares. YMJ has 400 kg.', once: 'rem_lotus' }, { go: 'wait' }],
      wait: waitFree('huang', 'go', 'wait'),
      go: [
        lock('huang'),
        { m: '', d: 3, voice: { dur: 11, text: 'Boss. You buy lotus root?? Two section?? Boss. We have FOUR HUNDRED KILO in the warehouse. I bring you two section. Free.' } },
        { m: '👍👍' },
        free('huang'),
      ],
    },
  });
  const SOUP = ['g_ribs', 'g_ginger', 'g_dates', 'g_goji', 'g_wine'];
  R({
    id: 'r_rem_soup',
    thread: 'huang',
    trigger: { on: 'act', act: 'reminder_done', match: (p) => !!p && SOUP.includes(p.id), delay: 40 },
    nodes: {
      start: [{ log: 'Started ticking off the soup ingredients on the Lotus Pier grocery list', once: 'rem_soup' }, { go: 'wait' }],
      wait: waitFree('huang', 'go', 'wait'),
      go: [
        lock('huang'),
        { m: '', d: 3, voice: { dur: 14, text: 'Boss. Ribs. Ginger. Red dates. …Boss. This is Miss Yanli soup. (pause) Okay. I tell nobody.' } },
        { m: '👍' },
        free('huang'),
      ],
    },
  });
  const GROC = {
    g_peony: 'Boss. White peony TEA. The crane tin. 👍 Tang Mei say it is not for you. 👍',
    g_treats: 'Duck. Not chicken. For Miss Fairy. 👍👍',
    g_milktea: 'Brown sugar milk tea. For young master. 👍',
    g_rice: 'Rice five kilo. Received. 👍',
  };
  R({
    id: 'r_rem_groc',
    thread: 'huang',
    trigger: { on: 'act', act: 'reminder_done', match: (p, s) => !!p && p.list === 'groceries' && p.id !== 'g_lotus' && !SOUP.includes(p.id) && remKeep(s, p), delay: 30 },
    nodes: {
      start: [{ log: (s) => 'Ticked off ' + q(F(s).r_rem_groceries_t) + ' on the Lotus Pier grocery list (Old Huang can see it)', once: 'rem_groc' }, { go: 'wait' }],
      wait: waitFree('huang', 'go', 'wait'),
      go: [lock('huang'), say((f) => GROC[f.r_rem_groceries] || 'Boss. Received. 👍'), free('huang')],
    },
  });
  const WORK = {
    w_dog: ['You’ve ticked off “Decide: Bring Your Dog to Work Friday.”', 'Liu Qian will want to know what you decided. So will I.'],
    w_qr: ['You’ve marked “Reply to Lan Qiren” as done.', 'You haven’t replied to Lan Qiren. I can see your sent folder.'],
    w_deck: ['You’ve marked my deck as reviewed. At this hour.', 'Slide 7 is fine.'],
    w_contract: ['The cold-chain contract is marked as signed.', 'It is in my drawer. Unsigned. Noted.'],
    w_interview: ['Interview prep, done. After midnight.', 'Noted.'],
  };
  R({
    id: 'r_rem_work',
    thread: 'ea',
    trigger: { on: 'act', act: 'reminder_done', match: (p, s) => !!p && p.list === 'work' && remKeep(s, p), delay: 30 },
    nodes: {
      start: [{ log: (s) => 'Ticked off ' + q(F(s).r_rem_work_t) + ' on his Work list (Tang Mei can see it)', once: 'rem_work' }, { go: 'wait' }],
      wait: waitFree('ea', 'go', 'wait'),
      go: [
        lock('ea'),
        say((f) => (WORK[f.r_rem_work] || ['Your Work list just synced: ' + q(f.r_rem_work_t) + '.'])[0]),
        say((f) => (WORK[f.r_rem_work] || [0, 'Noted.'])[1]),
        { m: 'Go to sleep, Mr. Jiang.' },
        free('ea'),
      ],
    },
  });
  // His own list: nobody sees it. It only goes on the record.
  R({
    id: 'r_rem_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'reminder_done', match: (p) => !!p && p.id === 'r_wwx' },
    nodes: { start: [{ log: (s) => (F(s).burned ? 'Ticked off “Reply to Wei Wuxian (Sunday)”. The reply was not kind.' : F(s).wwx_invited ? 'Ticked off “Reply to Wei Wuxian (Sunday)”. The answer was yes.' : 'Ticked off “Reply to Wei Wuxian (Sunday)” without actually replying'), once: 'rem_wwx' }] },
  });
  const calledHuang = () => { try { return JC.store.all('calls').some((c) => c.contact === 'huang' && c.dir === 'out' && c.t >= JC.time.START); } catch (e) { return false; } };
  R({
    id: 'r_rem_huang',
    thread: 'huang',
    trigger: { on: 'act', act: 'reminder_done', match: (p) => !!p && p.id === 'r_huang' },
    nodes: { start: [{ log: () => (calledHuang() ? 'Called Old Huang and ticked off “the gate, Sunday”' : 'Ticked off “Call Old Huang — the gate, Sunday” without calling Old Huang'), once: 'rem_huang' }] },
  });
  R({
    id: 'r_rem_tea',
    thread: 'lxc',
    trigger: { on: 'act', act: 'reminder_done', match: (p) => !!p && p.id === 'r_tea' },
    nodes: { start: [{ log: (s) => (F(s).tea_yes ? 'Ticked off “Book tea?”. Tea was booked.' : 'Ticked off “Book tea?” without booking anything'), once: 'rem_tea' }] },
  });

  // ═════════════════════════════════════════════════════════════════
  // HEALTH — A-Ling's request (heart rate 121 BPM at 22:50, on the balcony); invitations; the tacrolimus log,
  // which he has shared with Wei Wuxian (Medications only) since July 2024 without ever mentioning it.
  // ═════════════════════════════════════════════════════════════════
  const hl = () => { try { return JC.store.get('hlprefs', 'p') || {}; } catch (e) { return {}; } };
  const medShared = () => hl().wwxShare !== false;
  const topics = (s) => String(F(s).r_hl_topics || '');
  R({
    id: 'r_hl_jl',
    thread: 'jl',
    trigger: { on: 'act', act: 'health_share', match: (p, s) => !!p && p.to === 'jl' && p.accept === true && keep(s, 'r_hl_topics', (p.topics || []).join(',')), delay: 15 },
    nodes: {
      start: [{ log: (s) => 'Shared his Health data with A-Ling' + (topics(s).includes('heart') ? ', heart rate and all' : ''), once: 'hl_jl' }, { go: 'wait' }],
      wait: waitFree('jl', 'go', 'wait'),
      go: [
        lock('jl'),
        { m: 'wait' },
        { m: 'u ACCEPTED??' },
        { m: 'i asked on wednesday as a joke. u said "No." with a full stop' },
        affUp('jl', 1, 'A-Ling will remember that.'),
        { if: (s) => topics(s).includes('heart'), go: 'heart' },
        { m: 'u turned off heart rate??' },
        { m: 'what are u hiding' },
        { m: '…is it the balcony' },
        free('jl'),
        { go: 'ask' },
      ],
      heart: [
        { m: 'ok im looking' },
        { m: 'UR HEART RATE WAS 121 ON THE BALCONY 👀' },
        { m: '22:50. sizhui says thats exactly when lan xichen went out there after u' },
        { m: 'u ran 6km this morning and ur heart rate was LOWER' },
        free('jl'),
        { go: 'ask' },
      ],
      ask: waitView('jl', 'q', 'ask'),
      q: [{ choice: [
          replying('jl', { t: "It's hot in here.", go: 'hot' }),
          replying('jl', { t: 'Stop looking at my heart rate.', go: 'stop' }),
          replying('jl', { t: '[Leave him on read]', silent: true, go: 'read' }),
        ], timeout: 60, onTimeout: 'read' }],
      hot: [
        grab('jl', 'hl'),
        { m: 'u said that to wei wuxian at 8:44. he screenshotted it' },
        { m: 'it was 13 degrees on that balcony' },
        { m: 'ok jiujiu. sure. it was hot' },
        affUp('jl', 1),
        release('jl', 'hl'),
      ],
      stop: [
        grab('jl', 'hl'),
        { m: 'no' },
        { m: 'u gave me access. its mine now' },
        { m: '(ur sleep average is 4h52m btw. thats not sleep thats a nap)' },
        release('jl', 'hl'),
      ],
      read: [grab('jl', 'hl'), { m: 'ok thats a yes' }, release('jl', 'hl')],
    },
  });
  R({
    id: 'r_hl_jl_no',
    thread: 'jl',
    trigger: { on: 'act', act: 'health_share', match: (p) => !!p && p.to === 'jl' && p.accept === false && !p.stop, delay: 15 },
    nodes: {
      start: [{ log: 'Declined A-Ling’s request to see his Health data', once: 'hl_jl_no' }, { go: 'wait' }],
      wait: waitFree('jl', 'go', 'wait'),
      go: [lock('jl'), { m: 'u declined my health request' }, { m: 'at midnight' }, { m: 'ok. but SLEEP' }, free('jl')],
    },
  });
  // A little fish (Jingyi) tells Nie Huaisang.
  R({
    id: 'r_hl_nhs',
    thread: 'nhs',
    trigger: { on: 'act', act: 'health_share', match: (p) => !!p && p.to === 'jl' && p.accept === true && (p.topics || []).includes('heart'), delay: 140 },
    when: night,
    nodes: {
      start: waitFree('nhs', 'go', 'start'),
      go: [
        lock('nhs'),
        { m: 'Brother Jiang 👀' },
        { m: 'A little fish tells me your heart rate was 121 at 22:50 hehe~' },
        { m: '22:50!!! That is EXACTLY the balcony 🪭🪭🪭' },
        { m: 'Also since when do you share ANYTHING with A-Ling?? You won’t even share your Wi-Fi password 🙈' },
        { fx: { sus: { nhs: 1 }, hint: 'Nie Huaisang noticed.' } },
        free('nhs'),
      ],
    },
  });

  // Invitations to see his Health data. Jiang Cheng would never.
  const HL_INV = {
    lxc: { sus: 1, hint: 'Lan Xichen noticed.', set: { lxc_saw_121: true }, lines: [
      "Wanyin, I've just had an invitation to see your Health data.",
      "I'm honoured. And a little worried. Are you well?",
      "I'm afraid I accepted before I thought about it. It opened on your heart rate. 121, at 22:50.",
      'I was standing next to you at 22:50.',
      "I'm going to stop sharing now, so that you can keep at least one secret from me tonight. 🙂",
    ] },
    wwx: { sus: 2, hint: 'Wei Wuxian noticed.', lines: [
      'jiang cheng',
      'u invited me to ur WHOLE health app??',
      () => (medShared() ? 'not just the pills?? EVERYTHING??' : 'EVERYTHING??'),
      'ur sleep average is 4 hours 52 minutes. JIANG CHENG',
      '121 bpm at 22:50 👀 lan zhan says dont tease. im teasing',
    ] },
    ea: { sus: 1, lines: [
      'Mr. Jiang. You have invited me to view your Health data.',
      'I already manage your calendar, your inbox and your conscience.',
      'I am declining the heart rate. Go to sleep.',
    ] },
    nhs: { sus: 2, hint: 'Nie Huaisang noticed.', lines: [
      'BROTHER JIANG invited ME to see his HEALTH DATA?!?! 🙈🙈',
      '121 at 22:50…… 👀 that’s the balcony!!!',
      'You wouldn’t even let me split the hotpot bill 🪭',
      'Hmm~ 👀',
    ] },
    sz: { sus: 1, lines: [
      "Mr. Jiang, I think this invitation was meant for Jin Ling? He's been asking since Wednesday.",
      "I'll decline it, so he never finds out you sent it to me first. 😊",
    ] },
    wn: { sus: 1, lines: [
      "M-Mr. Jiang, I've received an invitation to your Health data.",
      "Is something wrong? I'm still in Lanling. I can be there in twenty minutes. I have the van. Sorry.",
      '— Wen Ning',
    ] },
    huang: { sus: 0, lines: [{ m: '', d: 3, voice: { dur: 10, text: "Boss. I get INVITATION. For your HEART. I don't know how to open it. Tomorrow I ask Huang Er. Okay. Bye-bye." } }, '👍👍'] },
  };
  Object.keys(HL_INV).forEach((cid) => {
    const d = HL_INV[cid];
    const fx = {};
    if (d.sus) fx.sus = { [cid]: d.sus };
    if (d.set) fx.set = d.set;
    if (d.hint) fx.hint = d.hint;
    R({
      id: 'r_hl_inv_' + cid,
      thread: cid,
      trigger: { on: 'act', act: 'health_share', match: (p) => !!p && p.to === cid && p.invite === true, delay: 30 },
      nodes: {
        start: [{ log: 'Invited ' + JC.contacts.real(cid) + ' to see his Health data', once: 'hl_inv_' + cid }, { go: 'wait' }],
        wait: waitFree(cid, 'go', 'wait'),
        go: [lock(cid)].concat(d.lines.map((l) => (typeof l === 'string' ? { m: l } : typeof l === 'function' ? say(l) : l)), Object.keys(fx).length ? [{ fx }] : [], [free(cid)]),
      },
    });
  });

  // The tacrolimus log. Wei Wuxian checks it every night at 8:05.
  const medOk = (s) => night(s) && !F(s).burned && medShared();
  // each reaction keeps its own dose (a sheet can log 08:00 and 20:00 at once)
  const medKeep = (k) => (s, p) => keep(s, 'r_med_' + k, p.slot || '20:00') && keep(s, 'r_med_' + k + '_when', p.when || 'ontime');
  const slotWord = (slot) => (slot === '08:00' ? '8am' : '8pm');
  R({
    id: 'r_med_skip',
    thread: 'wwx',
    trigger: { on: 'act', act: 'med_log', match: (p, s) => !!p && p.med === 'tacrolimus' && p.status === 'skipped' && medKeep('skip')(s, p), delay: 20 },
    nodes: {
      start: [
        { log: (s) => 'Logged his ' + (F(s).r_med_skip || '20:00') + ' tacrolimus as skipped' + (F(s).r_med_skip_when === 'ahead' ? ', hours before it was due' : ''), once: 'med_skip' },
        { if: medOk, go: 'wait', else: 'off' },
      ],
      wait: waitFree('wwx', 'go', 'wait'),
      go: [
        lock('wwx'),
        { m: 'hey' },
        say((f) => (f.r_med_skip_when === 'ahead'
          ? 'health says u already skipped ur ' + slotWord(f.r_med_skip) + ' pill. its ' + clock12() + ' at night. u cant skip a pill in advance'
          : 'health just told me u skipped ur ' + slotWord(f.r_med_skip) + ' pill')),
        { m: 'not nagging' },
        { m: 'ok a little bit nagging' },
        { m: 'did u take it at the gala and forget to log it? u do that when ur busy glaring at people' },
        free('wwx'),
        { go: 'ask' },
      ],
      ask: waitView('wwx', 'q', 'ask'),
      q: [{ choice: [
          replying('wwx', { t: 'I took it. I forgot to log it.', go: 'took' }),
          replying('wwx', { t: 'Stop checking my pills.', go: 'stop' }),
          replying('wwx', { t: '[Leave him on read]', silent: true, go: 'read' }),
        ], timeout: 60, onTimeout: 'read' }],
      took: [
        grab('wwx', 'med'),
        { m: 'ok' },
        { m: 'ok good' },
        { m: "sorry. i check it every night at 8:05. lan zhan thinks it's sweet" },
        { m: "it's not sweet. it's maintenance" },
        affUp('wwx', 1, 'Wei Wuxian will remember that.'),
        release('wwx', 'med'),
      ],
      stop: [
        grab('wwx', 'med'),
        { m: 'u turned it on, jiang cheng' },
        { m: 'july 2024. no message. it just showed up in my health app one morning' },
        { m: 'so i check' },
        { m: 'goodnight. take ur pill' },
        release('wwx', 'med'),
      ],
      read: [grab('wwx', 'med'), { m: 'ok. take it. please 🙏' }, release('wwx', 'med')],
    },
  });
  R({
    id: 'r_med_ahead',
    thread: 'wwx',
    trigger: { on: 'act', act: 'med_log', match: (p, s) => !!p && p.med === 'tacrolimus' && p.status === 'taken' && p.when === 'ahead' && medKeep('ahead')(s, p), delay: 20 },
    nodes: {
      start: [
        { log: 'Logged a tacrolimus dose he hadn’t taken yet', once: 'med_ahead' },
        { if: medOk, go: 'wait', else: 'off' },
      ],
      wait: waitFree('wwx', 'go', 'wait'),
      go: [
        lock('wwx'),
        { m: 'ok weird question' },
        say((f) => 'why does health say u already took ur ' + slotWord(f.r_med_ahead) + '. its ' + clock12() + ' at night'),
        { m: "jiang cheng that's not how pills work" },
        { m: "please tell me u didn't take two" },
        { fx: { sus: { wwx: 1 }, hint: 'Wei Wuxian noticed.' } },
        free('wwx'),
        { go: 'ask' },
      ],
      ask: waitView('wwx', 'q', 'ask'),
      q: [{ choice: [
          replying('wwx', { t: 'I logged it wrong.', go: 'wrong' }),
          replying('wwx', { t: 'Mind your own business.', go: 'mind' }),
        ], timeout: 60, onTimeout: 'quiet' }],
      wrong: [grab('wwx', 'med2'), { m: 'ok. ok phew' }, { m: 'go to sleep. ur logging pills in ur sleep now' }, release('wwx', 'med2')],
      mind: [grab('wwx', 'med2'), { m: "it's a little bit my business" }, { m: '…' }, { m: 'goodnight jiang cheng' }, release('wwx', 'med2')],
      quiet: [{ end: true }],
    },
  });
  R({
    id: 'r_med_late',
    thread: 'wwx',
    trigger: { on: 'act', act: 'med_log', match: (p) => !!p && p.med === 'tacrolimus' && p.status === 'taken' && p.slot === '20:00' && p.day === 0, delay: 20 },
    nodes: {
      start: [
        { log: 'Logged his 20:00 tacrolimus as taken (he was at the gala)', once: 'med_late' },
        { if: medOk, go: 'wait', else: 'off' },
      ],
      wait: waitFree('wwx', 'go', 'wait'),
      go: [lock('wwx'), { m: 'oh u logged it' }, { m: "good. i wasn't going to ask" }, { m: 'i was going to ask' }, free('wwx')],
    },
  });
  R({
    id: 'r_hl_wwx_stop',
    thread: 'wwx',
    trigger: { on: 'act', act: 'health_share', match: (p) => !!p && p.to === 'wwx' && p.stop === true, delay: 25 },
    nodes: {
      start: [{ fx: { set: { wwx_meds_stopped: true } } }, { log: 'Stopped sharing his medication log with Wei Wuxian', once: 'hl_wwx_stop' }, { go: 'wait' }],
      wait: waitFree('wwx', 'go', 'wait'),
      go: [
        { if: (s) => !!F(s).burned, go: 'off' },
        lock('wwx'),
        { m: 'oh' },
        { typing: 5 },
        { m: 'u turned off the pills thing' },
        { m: "that's ok. it's ur liver" },
        { m: '(it’s ur liver)' },
        free('wwx'),
      ],
    },
  });
  R({
    id: 'r_hl_wwx_back',
    thread: 'wwx',
    trigger: { on: 'act', act: 'health_share', match: (p, s) => !!p && p.to === 'wwx' && p.resume === true && !!(s.done && s.done.r_hl_wwx_stop), delay: 15 },
    nodes: {
      start: [{ fx: { set: { wwx_meds_stopped: false } } }, { log: 'Turned the medication sharing with Wei Wuxian back on', once: 'hl_wwx_back' }, { go: 'wait' }],
      wait: waitFree('wwx', 'go', 'wait'),
      go: [lock('wwx'), { m: "it's back" }, { m: "ok. don't scare me like that" }, free('wwx')],
    },
  });
  // State of Mind, if A-Ling can see it.
  const POS = /amazed|amused|brave|confident|excited|grateful|happy|hopeful|joyful|passionate|proud|relieved|surprised|calm|content|peaceful|satisfied/i;
  R({
    id: 'r_hl_mood',
    thread: 'jl',
    trigger: { on: 'act', act: 'mood_log', delay: 30, match: (p, s) => !!p && hl().share === 'accepted' && (hl().topics || []).includes('mind') && keep(s, 'r_mood', (p.feel || []).join(', ').toLowerCase() || 'something') },
    nodes: {
      start: [{ log: (s) => 'Logged his state of mind as ' + q(F(s).r_mood) + ', where A-Ling could see it', once: 'hl_mood' }, { go: 'wait' }],
      wait: waitFree('jl', 'go', 'wait'),
      go: [
        lock('jl'),
        { if: (s) => POS.test(F(s).r_mood || ''), go: 'pos' },
        say((f) => '"' + f.r_mood + '". classic'),
        { m: 'who did it. was it wei wuxian' },
        free('jl'),
      ],
      pos: [
        say((f) => 'why does my health app say ur feeling "' + f.r_mood + '"'),
        { m: 'u have logged ANNOYED 47 times this year. i can see the chart' },
        { m: "is it lan xichen. it's lan xichen" },
        { fx: { sus: { jl: 1 }, hint: 'A-Ling noticed.' } },
        free('jl'),
      ],
    },
  });

  // ═════════════════════════════════════════════════════════════════
  // VOICE MEMOS — "Untitled 14". Deleting it doesn't change what the night can still do: it can be recovered
  // (Recently Deleted keeps it 30 days), and a real thank-you still counts.
  // ═════════════════════════════════════════════════════════════════
  const isMemo14 = (p) => !!p && p.id === 'memo14' && !p.copy; // a duplicate carries src 'memo14' too
  R({
    id: 'r_memo_del',
    thread: 'wwx',
    trigger: { on: 'act', act: 'memo_delete', match: (p) => isMemo14(p) && !p.forever },
    nodes: { start: [{ fx: { set: { memo_deleted: true } } }, { log: 'Deleted “Untitled 14”', once: 'memo_del' }, { hint: 'Some things can’t be unsaid. Or said.' }] },
  });
  R({
    id: 'r_memo_recover',
    thread: 'wwx',
    trigger: { on: 'act', act: 'memo_recover', match: isMemo14 },
    nodes: { start: [{ fx: { set: { memo_deleted: false, memo_recovered: true } } }, { log: 'Recovered “Untitled 14” from Recently Deleted', once: 'memo_recover' }] },
  });
  R({
    id: 'r_memo_purge',
    thread: 'wwx',
    trigger: { on: 'act', act: 'memo_delete', match: (p) => isMemo14(p) && !!p.forever },
    nodes: { start: [{ fx: { set: { memo_deleted: true, memo_purged: true } } }, { log: 'Deleted “Untitled 14” for good', once: 'memo_purge' }] },
  });
  R({
    id: 'r_memo_jiujiu',
    thread: 'jl',
    trigger: { on: 'act', act: 'memo_delete', match: (p) => !!p && p.id === 'memo_jiujiu' && !p.copy },
    nodes: { start: [{ fx: { set: { jiujiu_memo_deleted: true } } }, { log: 'Deleted the recording of A-Ling’s first “jiujiu”', once: 'memo_jiujiu' }] },
  });

  // ═════════════════════════════════════════════════════════════════
  // PHONE — voicemails. Wei Wuxian's from 23:13 ("sunday. I'll bring the soup. I mean, if— okay bye") and the ones
  // Jiang Cheng has kept since 2008–2009.
  // ═════════════════════════════════════════════════════════════════
  const vm = (id) => (p) => !!p && p.id === id;
  R({
    id: 'r_vm_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'voicemail_play', match: vm('vm_wwx'), delay: 8 },
    nodes: {
      start: [
        { fx: { set: { wwx_vm_heard: true } } },
        { log: 'Listened to Wei Wuxian’s voicemail (“sunday. I’ll bring the soup.”)', once: 'vm_wwx' },
        { go: 'wait' },
      ],
      wait: waitView('wwx', 'q', 'wait', (s) => !F(s).burned),
      q: [{ choice: [
          replying('wwx', { t: 'I got your voicemail.', go: 'got' }),
          replying('wwx', { t: 'Stop leaving me voicemails.', go: 'stop' }),
          { t: '[Leave it]', silent: true, go: 'leave' },
        ], timeout: 60, onTimeout: 'leave' }],
      got: [
        grab('wwx', 'vm'),
        { m: 'u LISTENED to it??' },
        { m: "u never listen to my voicemails. u said they're a crime against telecommunications" },
        { m: "so u heard the 'if'" },
        { if: (s) => !!F(s).wwx_invited, go: 'got_yes' },
        { m: "the if is still there. it's ur if. u get to decide what happens to it" },
        { go: 'got_end' },
      ],
      got_yes: [{ m: "there's no if anymore. lan zhan crossed it out. it's just sunday now" }, { go: 'got_end' }],
      got_end: [affUp('wwx', 1, 'Wei Wuxian will remember that.'), release('wwx', 'vm')],
      stop: [
        grab('wwx', 'vm'),
        { m: 'never' },
        { m: "it's my love language. lan zhan speaks mn. i speak voicemail" },
        release('wwx', 'vm'),
      ],
      leave: [{ end: true }],
    },
  });
  R({
    id: 'r_vm_mom',
    thread: 'mom',
    trigger: { on: 'act', act: 'voicemail_play', match: vm('vm_mom') },
    nodes: { start: [{ fx: { set: { mom_vm_heard: true } } }, { log: 'Played the voicemail he kept from his mother (July 2008: “stand up straight when you come in”)', once: 'vm_mom' }] },
  });
  R({
    id: 'r_vm_dad',
    thread: 'dad',
    trigger: { on: 'act', act: 'voicemail_play', match: vm('vm_dad') },
    nodes: { start: [{ fx: { set: { dad_vm_heard: true } } }, { log: 'Played his father’s voicemail about the first lotus on the east pond (2008)', once: 'vm_dad' }] },
  });
  R({
    id: 'r_vm_ajie',
    thread: 'ajie',
    trigger: { on: 'act', act: 'voicemail_play', match: vm('vm_ajie') },
    nodes: { start: [{ fx: { set: { ajie_vm_heard: true } } }, { log: 'Played A-Jie’s voicemail about A-Ling’s first word (2009)', once: 'vm_ajie' }] },
  });

  // ═════════════════════════════════════════════════════════════════
  // CONTACTS — what he saved people as.
  // ═════════════════════════════════════════════════════════════════
  const COLD = /do\s*n[o']?t\s*answer|don.?t\s*answer|ignore|block|idiot|never|traitor/i;
  const renamed = (id) => (p, s) => !!p && p.id === id && p.field === 'display' && !!String(p.value || '').trim() && keep(s, 'r_ct_' + id, String(p.value).trim()) && keep(s, 'r_ct_' + id + '_was', String(p.before || '').trim());
  R({
    id: 'r_ct_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'contact_edit', match: renamed('wwx') },
    nodes: {
      start: [
        { if: (s) => COLD.test(F(s).r_ct_wwx || ''), go: 'cold' },
        { run: (api) => { api.state.flags.renamed_wwx = api.state.flags.r_ct_wwx; } },
        { log: (s) => 'Renamed ' + q(F(s).r_ct_wwx_was || '🐶 DO NOT ANSWER') + ' to ' + q(F(s).r_ct_wwx), once: 'ct_wwx' },
      ],
      cold: [
        { fx: { set: { renamed_wwx_cold: true } } },
        { log: (s) => 'Renamed ' + q(F(s).r_ct_wwx_was || '🐶 DO NOT ANSWER') + ' to ' + q(F(s).r_ct_wwx) + '. Somehow worse.', once: 'ct_wwx' },
      ],
    },
  });
  R({
    id: 'r_ct_lxc',
    thread: 'lxc',
    trigger: { on: 'act', act: 'contact_edit', match: renamed('lxc') },
    nodes: { start: [
      { run: (api) => { api.state.flags.renamed_lxc = api.state.flags.r_ct_lxc; } },
      { log: (s) => 'Renamed ' + q(F(s).r_ct_lxc_was || 'Zewu-jun') + ' to ' + q(F(s).r_ct_lxc) + ' in his contacts', once: 'ct_lxc' },
    ] },
  });
  R({
    id: 'r_ct_other',
    thread: 'ea',
    trigger: { on: 'act', act: 'contact_edit', match: (p, s) => !!p && p.id !== 'wwx' && p.id !== 'lxc' && p.field === 'display' && !!p.before && keep(s, 'r_ct_x', String(p.value || '').trim()) && keep(s, 'r_ct_x_was', String(p.before).trim()) },
    nodes: { start: [{ log: (s) => 'Renamed ' + q(F(s).r_ct_x_was) + ' to ' + q(F(s).r_ct_x) + ' in his contacts', once: 'ct_other' }] },
  });
  R({
    id: 'r_ct_del_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'contact_delete', match: (p) => !!p && p.id === 'wwx' },
    nodes: { start: [{ fx: { set: { deleted_wwx_contact: true } } }, { log: 'Deleted Wei Wuxian from his contacts', once: 'ct_del_wwx' }] },
  });
  R({
    id: 'r_ct_block_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'contact_block', match: (p) => !!p && p.id === 'wwx' },
    nodes: { start: [{ log: 'Tried to block Wei Wuxian. It would have been the fifteenth time.', once: 'ct_block_wwx' }] },
  });

  // ═════════════════════════════════════════════════════════════════
  // SETTINGS — Focus ("Jiang Cheng has notifications silenced" shows to people he hasn't allowed), Airplane Mode,
  // the wallpaper.
  // ═════════════════════════════════════════════════════════════════
  const SK = () => JC.settingsKit || {};
  const focusNow = () => (JC.state.d.settings || {}).focus || null;
  // People see the Focus status only if it's shared, and only if they aren't allowed through.
  const seesFocus = (cid) => () => {
    const f = focusNow();
    if (!f) return false;
    const k = SK();
    const shared = k.focusShared ? k.focusShared(f) : true;
    const allowed = k.focusAllows ? k.focusAllows(f, cid) : cid === 'jl';
    return shared && !allowed;
  };
  const focusOn = (p, s) => !!p && p.key === 'focus' && !!p.value && keep(s, 'r_focus', p.value);
  const focusName = (f) => ({ dnd: 'Do Not Disturb', sleep: 'the Sleep Focus', personal: 'the Personal Focus', work: 'the Work Focus' }[focusNow() || f.r_focus] || 'a Focus');
  R({
    id: 'r_focus_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'setting', match: focusOn, delay: 30 },
    when: (s) => night(s) && seesFocus('wwx')(),
    retry: true,
    nodes: {
      start: [{ log: (s) => 'Turned on ' + focusName(F(s)), once: 'focus' }, { go: 'wait' }],
      wait: waitFree('wwx', 'go', 'wait'),
      go: [
        { if: (s) => !seesFocus('wwx')(), go: 'off' },
        lock('wwx'),
        { m: 'ok why does it say u have notifications silenced' },
        { m: 'u have NEVER silenced ur phone. u said its for “people with nothing to manage”' },
        { m: 'is it me' },
        { m: 'am i the disturb' },
        { m: 'lan zhan says i am the disturb. rude. accurate' },
        { fx: { sus: { wwx: 1 }, hint: 'Wei Wuxian noticed.' } },
        free('wwx'),
      ],
    },
  });
  // "Notify Anyway": his message breaks through the Focus.
  const breakThrough = { run: (api) => {
    try {
      if (!focusNow() || api.os.locked) return;
      const n = (api.state.notifs || []).find((x) => x.thread === 'jl');
      if (n && !(S.openThread() === 'jl' && api.os.isOpen('messages'))) api.notify.banner(n);
    } catch (e) { /* ignore */ }
  } };
  R({
    id: 'r_focus_jl',
    thread: 'jl',
    trigger: { on: 'act', act: 'setting', match: focusOn, delay: 50 },
    when: (s) => night(s) && seesFocus('jl')(),
    retry: true,
    nodes: {
      start: [{ log: (s) => 'Turned on ' + focusName(F(s)) + '. A-Ling pressed Notify Anyway.', once: 'focus_jl' }, { go: 'wait' }],
      wait: waitFree('jl', 'go', 'wait'),
      go: [
        { if: (s) => !seesFocus('jl')(), go: 'off' },
        lock('jl'),
        { m: 'jiujiu' },
        { m: 'my phone says u have notifications silenced' },
        { m: 'ur not asleep. u never sleep before 2' },
        { m: 'im pressing notify anyway' },
        { m: 'NOTIFY. ANYWAY.' },
        breakThrough,
        { fx: { sus: { jl: 1 }, hint: 'A-Ling noticed.' } },
        free('jl'),
      ],
    },
  });
  R({
    id: 'r_air_on',
    thread: 'jl',
    trigger: { on: 'act', act: 'setting', match: (p) => !!p && p.key === 'airplane' && !!p.value },
    nodes: { start: [{ run: (api) => { api.state.flags.r_air_at = api.state.eng; } }, { log: 'Put his phone in Airplane Mode', once: 'airplane' }] },
  });
  R({
    id: 'r_air_back',
    thread: 'jl',
    trigger: { on: 'act', act: 'setting', match: (p, s) => !!p && p.key === 'airplane' && !p.value && !!F(s).r_air_at && (s.eng || 0) - F(s).r_air_at > 25000, delay: 8 },
    when: night,
    nodes: {
      start: waitFree('jl', 'go', 'start'),
      go: [
        lock('jl'),
        { m: 'jiujiu where did u GO' },
        { m: 'my messages just sat there saying sent. not delivered. SENT' },
        { m: 'u never turn ur phone off. u said what if lotus pier needs u at 3am' },
        { m: 'ok wtv. ur back' },
        free('jl'),
      ],
    },
  });
  const WP = { wp_lotus_dusk: 'Lotus Dusk', wp_night_lake: 'Night Lake', wp_fairy: 'Fairy', wp_purple: 'Purple', wp_cloud: 'Cloud Recesses', wp_peony: 'Peony' };
  const wpName = (id) => WP[id] || ((JC.art.meta && JC.art.meta(id) && JC.art.meta(id).title) ? 'a photo: ' + JC.art.meta(id).title : 'a photo');
  R({
    id: 'r_wallpaper',
    thread: 'ea',
    trigger: { on: 'act', act: 'wallpaper', match: (p, s) => !!p && !!p.id && keep(s, 'wallpaper_changed', p.id) },
    nodes: { start: [{ log: (s) => 'Changed his wallpaper to ' + wpName(F(s).wallpaper_changed), once: 'wallpaper' }] },
  });

  // ═════════════════════════════════════════════════════════════════
  // CLOCK — an alarm for the afternoon in Gusu (or labelled for it); his tacrolimus alarms (A-Ling set them).
  // ═════════════════════════════════════════════════════════════════
  const TEA = /tea|xichen|hanshi|zewu|gusu|lan huan|cloud recesses|peony/i;
  // the next 11:30–15:00 on Saturday (Gusu is two hours by train; tea is at three)
  const teaWindow = (p) => {
    const mins = (p.h || 0) * 60 + (p.m || 0);
    const rep = p.repeat || [];
    return mins >= 11 * 60 + 30 && mins <= 15 * 60 && (!rep.length || rep.includes(6));
  };
  const teaAlarm = (p) => !!p && (TEA.test(String(p.label || '')) || teaWindow(p));
  const alarmLabel = (p) => (p.label && p.label !== 'Alarm' ? ' (“' + p.label + '”)' : '');
  R({
    id: 'r_alarm_tea',
    thread: 'lxc',
    trigger: { on: 'act', act: 'alarm_set', match: (p, s) => teaAlarm(p) && keep(s, 'tea_alarm', (p.time || '') + alarmLabel(p)) && keep(s, 'r_alarm_win', teaWindow(p)) },
    nodes: { start: [{ log: (s) => (F(s).r_alarm_win ? 'Set an alarm for ' + F(s).tea_alarm + ' on Saturday. Gusu is two hours by train.' : 'Set an alarm for ' + F(s).tea_alarm + '. Tea is at three.'), once: 'alarm_tea' }] },
  });
  R({
    id: 'r_alarm_med',
    thread: 'jl',
    trigger: { on: 'act', act: 'alarm_off', match: (p) => !!p && /^al_tac_/.test(String(p.id || '')) },
    nodes: { start: [{ fx: { set: { med_alarm_off: true } } }, { log: 'Turned off his tacrolimus alarm (A-Ling set it)', once: 'alarm_med' }] },
  });
})();
