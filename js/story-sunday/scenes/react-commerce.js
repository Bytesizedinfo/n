/* App reactions — commerce & getting around: Lotus Eats, Swift Ride, Wallet, Maps, Find My.
   What the player does in these apps changes the night: who texts back, suspicion, affection, ending flags.
   Every scene here is a reaction (`polite: true`, id prefixed r_). Facts: docs/STORY.md. Design notes and
   the act catalogue for these apps: docs/reactions/commerce.md.
   Logs: the apps log the action itself (with amounts, dishes, places — they know the details); scenes here
   log story outcomes and the actions the apps don't (Maps, the Golden Peony front desk). */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => s.flags || {};
  const D = (s) => s.done || {};
  const night = (s) => !F(s).night_done;
  const P = (p) => p || {};

  // One conversation per thread at a time (same convention as the scene files): poll until the thread is free,
  // then hold it. Reactions give up quietly when the night ends.
  const waitFor = (k, next, self) => [
    { if: (s) => !!F(s).night_done, go: 'off' },
    { if: (s) => !F(s)['busy_' + k], go: next },
    { wait: 6 },
    { go: self || 'start' },
  ];
  const lock = (k) => ({ fx: { set: { ['busy_' + k]: true } } });
  const free = (k) => ({ fx: { set: { ['busy_' + k]: false } } });
  const usesOff = (nodes) => Object.keys(nodes).some((n) => (nodes[n] || []).some((st) => st && st.go === 'off'));
  const react = (def) => {
    def.polite = true;
    if (def.nodes && !def.nodes.off && usesOff(def.nodes)) def.nodes.off = [{ end: true }];
    return S.scene(def);
  };
  // the first scene of a group to start wins; the others stand down (`when` runs after `done` is set)
  const noneOf = (ids, self) => (s) => ids.every((id) => id === self || !D(s)[id]);
  const anyOf = (ids) => (s) => ids.some((id) => !!D(s)[id]);

  // ── payload helpers ──────────────────────────────────────────────
  const items = (p) => (P(p).items || []).map(String);
  const names = (p) => (P(p).names || []).join(' · ').toLowerCase();
  const isSoup = (p) => items(p).includes('al1') || items(p).includes('lr1') || /lotus root (&|and) pork rib soup/.test(names(p));
  const lotusy = (p) => /lotus root/.test(names(p));
  const anon = (p) => !!P(p).anon || /who it.?s from/i.test(String(P(p).note || ''));
  const sched = (p) => !!P(p).sched;
  const lavish = (p) => Number(P(p).total) >= 400 || P(p).card === 'ymj';
  const amt = (p) => Math.round(Number(P(p).amount || 0) * 100) / 100;
  const amtIn = (p, list) => list.includes(amt(p));
  const A18 = [18.18, 181.8, 1818, 18180];
  const A88 = [8.88, 88.88, 888, 8888, 88888];
  const A520 = [5.2, 52, 520, 5200, 52000];
  const cityOf = (id) => { try { const pl = JC.mapview && JC.mapview.place(id); return pl ? pl.city : ''; } catch (e) { return ''; } };
  const KOI = ['koi-tower', 'koi-residences', 'koi-pond', 'koi-cafe'];
  const koi = (id) => KOI.includes(id);
  const gusu = (id) => cityOf(id) === 'Gusu';
  const CR = ['cloud-recesses', 'hanshi', 'jingshi', 'cr-tea-shop', 'cr-guesthouse'];
  // a pickup on Saturday 17 Oct between 06:00 and 16:00 (tea at the Hanshi is at three; Gusu is ~2 h 25 min away)
  const saturday = (at) => { if (!at) return false; const d = new Date(at); return d.getFullYear() === 2026 && d.getMonth() === 9 && d.getDate() === 17 && d.getHours() >= 6 && d.getHours() < 16; };

  // ── Fairy: is she still waiting for somewhere to sleep? ─────────
  const fairyAsked = () => { try { return S.messages('jl').some((m) => m.from === 'jl' && /can she stay with u tonight/i.test(m.text || '')); } catch (e) { return false; } };
  const fairyNeeds = (s) => night(s) && !F(s).fairy_ok && !F(s).fairy_taken && !D(s).fairy_meet && fairyAsked();
  const FAIRY_WAYS = ['r_ride_pet_fairy_to', 'r_ride_pet_fairy_from', 'r_fm_jl_fairy'];
  // The player answered Jin Ling's "can she stay with u tonight" through another app: retire jl_fairy's open
  // question so this reaction can speak (polite scenes wait for an open question).
  const settleFairyAsk = { cancel: 'jl_fairy' };

  // money that comes back (Wallet owns the ledger)
  const sendBack = (cid, keep, note) => ({ run: () => { try { if (JC.wallet && JC.wallet.sendBack) JC.wallet.sendBack(cid, { keep: keep || 0, note }); } catch (e) { /* wallet not loaded */ } } });
  // Find My: a follow request was answered
  const fmAnswer = (cid, ok) => ({ run: () => { try { if (JC.findmy && JC.findmy.answer) JC.findmy.answer(cid, ok); } catch (e) { /* findmy not loaded */ } } });

  // ═════════════════════════════════════════════════════════════════
  // LOTUS EATS — act `order` { rest, total, to, id, items, names, qty, anon, note, sched, card }
  // ═════════════════════════════════════════════════════════════════

  // ── 1. The soup, again. To the Jingshi. ─────────────────────────
  // Auntie Lu's is closed at night, so the order is scheduled for the morning and Lotus Eats tells the recipient.
  function soupScene(id, named) {
    const other = named ? 'r_eats_soup_anon' : 'r_eats_soup_named';
    const opener = named
      ? [
        { m: 'jiang cheng' },
        { m: 'lotus eats just texted me' },
        { m: '"jiang cheng sent you a gift 🎁 auntie lu\'s soup kitchen · lotus root & pork rib soup (large) · arriving in the morning"' },
        { m: 'with ur NAME on it' },
        { m: 'u put ur name on it. on purpose. or ur thumb slipped. either way i have a screenshot' },
      ]
      : [
        { m: 'jiang cheng' },
        { m: "u up. obviously ur up" },
        { m: 'lotus eats just texted me' },
        { m: '"someone sent you a gift 🎁 auntie lu\'s soup kitchen · lotus root & pork rib soup (large) · arriving in the morning"' },
        { m: 'note from the sender: "don\'t say who it\'s from."' },
      ];
    const nodes = {
      start: waitFor('wwx', 'go'),
      go: [lock('wwx'), { fx: { set: { soup_sent: true } } }, ...opener, { go: 'q' }],
      q: [
        { typing: 6 },
        { wait: 2 },
        { m: 'december 2024 i had the flu' },
        { m: 'someone sent me this exact soup. same kitchen. same big pot' },
        { m: 'i asked u if it was u. u said "No." with a full stop' },
        { m: 'lan zhan said "Mn." which in hindsight was a confession' },
        { typing: 4 },
        { m: "it was u in 2024 too wasn't it", d: 2.5 },
        { choice: [
            { t: 'It was me. Both times.', go: 'own' },
            { t: "I don't know what you're talking about.", go: named ? 'deflect_named' : 'deflect' },
          ], timeout: 150, onTimeout: 'quiet' },
      ],
      own: [
        { fx: { set: { wwx_thanked: true, soup_owned: true }, aff: { wwx: 2 } } },
        { log: 'Told Wei Wuxian the soup was from him. Both times.', once: 'r_soup' },
        { hint: 'Wei Wuxian will remember that.' },
        { typing: 8 },
        { wait: 3 },
        { typing: 5 },
        { m: 'i knew it', d: 2 },
        { m: 'i KNEW it' },
        { m: "june 2024 wen ning tells u about the liver. december 2024 shijie's soup shows up at my door with a note that says don't say who it's from" },
        { m: "that was it wasn't it. that was ur thank you" },
        { m: "u couldn't say it so u sent her soup" },
        { m: "i ate the whole pot. lan zhan had to hold the bowl because my hands were shaking. i told him it was the fever" },
        { m: "i heard it, jiang cheng. both times. i'm keeping it" },
        { m: 'He is crying. It is the good kind.', th: 'lwj', from: 'lwj' },
        { if: (s) => !!F(s).memo_sent, go: 'own_memo' },
        { go: 'own_sun' },
      ],
      own_memo: [
        { m: 'first the memo and now SOUP. i cannot take this much emotion in one night. i am a simple radish farmer' },
        { go: 'own_sun' },
      ],
      own_sun: [
        { if: (s) => !!F(s).wwx_invited, go: 'own_inv' },
        { m: 'so. sunday' },
        { m: 'can i bring it home. the real one. in her pot' },
        { choice: [
            { t: 'Six-thirty. Bring her pot.', fx: { set: { wwx_invited: true } }, go: 'own_yes' },
            { t: "Don't make it a thing.", go: 'own_thing' },
          ], timeout: 150, onTimeout: 'own_thing' },
      ],
      own_yes: [
        { m: '!!!!!!!!' },
        { m: "LAN ZHAN. i'm bringing it home" },
        { m: 'soup for breakfast. soup for dinner. this is the best weekend of my life' },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],
      own_thing: [
        { m: "it's a thing. it's been a thing since december 2024. u just didn't tell me" },
        { m: "i'll ask about sunday again in the morning. goodnight jiang cheng" },
        free('wwx'),
      ],
      own_inv: [
        { m: "see u sunday. i'm bringing her pot" },
        { m: "and the little card from 2024. the one that says don't say who it's from. it's been on our fridge for two years" },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],
      deflect: [
        { fx: { aff: { wwx: 1 } } },
        { log: 'Sent Wei Wuxian the 2024 soup again, and still denied it', once: 'r_soup' },
        { m: 'ok' },
        { m: "ok. u don't know. the soup is from nobody. nobody has excellent taste in soup" },
        { m: 'thank u, nobody' },
        { m: '(nobody also said "No." with a full stop in 2024. nobody is very consistent)' },
        { m: '❤️' },
        free('wwx'),
      ],
      deflect_named: [
        { fx: { aff: { wwx: 1 } } },
        { log: 'Sent Wei Wuxian soup with his own name on it, then denied it', once: 'r_soup' },
        { m: 'jiang cheng' },
        { m: 'ur NAME is on it' },
        { m: 'ok. fine. a different jiang cheng sent me soup. there are many jiang chengs. thank u to all of them' },
        { m: '❤️' },
        free('wwx'),
      ],
      quiet: [
        { m: "ok. u don't have to answer" },
        { m: 'i know anyway' },
        { m: '❤️' },
        free('wwx'),
      ],
    };
    delete nodes[named ? 'deflect' : 'deflect_named'];
    return react({
      id,
      thread: 'wwx',
      polite: true,
      trigger: { on: 'act', act: 'order', match: (p, s) => P(p).to === 'jingshi' && isSoup(p) && (named ? !anon(p) : anon(p)) && night(s), delay: 25 },
      when: (s) => night(s) && !F(s).burned && !D(s)[other],
      nodes,
    });
  }
  soupScene('r_eats_soup_anon', false);
  soupScene('r_eats_soup_named', true);

  // ── Anything else to the Jingshi ─────────────────────────────────
  react({
    id: 'r_eats_jingshi',
    thread: 'wwx',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => P(p).to === 'jingshi' && !isSoup(p) && night(s), delay: 30 },
    when: (s) => night(s) && !F(s).burned,
    nodes: {
      start: waitFor('wwx', 'go'),
      go: [
        lock('wwx'),
        { m: 'jiang cheng' },
        { m: 'lotus eats says there is FOOD coming to the jingshi' },
        { m: 'at this hour. who does that' },
        { m: '…i know who does that' },
        { m: "lan zhan is checking the smoke alarm battery in case it's hotpot. it's always hotpot" },
        { m: 'thank u. whoever u are. who is definitely not u 🥺' },
        free('wwx'),
      ],
    },
  });

  // ── A pre-order from Wei Wuxian's own radish pop-up (closed tonight: he's at the gala) ──
  react({
    id: 'r_eats_radish',
    thread: 'wwx',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => P(p).rest === 'yiling-popup' && night(s), delay: 20 },
    when: (s) => night(s) && !F(s).burned,
    nodes: {
      start: waitFor('wwx', 'go'),
      go: [
        lock('wwx'),
        { m: 'JIANG CHENG' },
        { m: 'my pop-up just got a pre-order' },
        { m: 'customer: jiang cheng' },
        { m: 'u have NEVER bought a radish. in four years. i checked' },
        { m: "lan zhan. LAN ZHAN. we have a customer. it's him" },
        { m: "i'm giving u the big radish cake. the one i don't sell. don't argue" },
        { fx: { sus: { wwx: 1 } } },
        free('wwx'),
      ],
    },
  });

  // ── 2. Food for the Ops floor ────────────────────────────────────
  const OPS_FOOD = ['r_eats_ops_root', 'r_eats_ops'];
  const opsMorale = [
    { if: (s) => !F(s).ops_treated, go: 'morale' },
    free('ops'),
  ];
  const moraleNode = [
    { fx: { set: { ops_treated: true }, inc: { ops_morale: 1 } } },
    { hint: 'The Ops team will remember that.' },
    free('ops'),
  ];
  react({
    id: 'r_eats_ops_root',
    thread: 'ops',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => ['ymj', 'wh'].includes(P(p).to) && lotusy(p) && night(s), delay: 45 },
    when: (s) => night(s) && noneOf(OPS_FOOD, 'r_eats_ops_root')(s),
    nodes: {
      start: waitFor('ops', 'go'),
      go: [
        lock('ops'),
        { m: 'Boss. Lotus Eats Message on my phone. Food. From Boss. For us. 👍', from: 'huang' },
        { m: 'Boss.', from: 'huang' },
        { m: 'It is Lotus Root. 👍', from: 'huang' },
        { m: 'We have 400 KG of Lotus Root. 👍👍', from: 'huang' },
        { m: '• Inventory update: lotus root, 400 kg + 1 (one) portion', from: 'liu' },
        { m: 'boss is this a test. is this about the 400 🙇', from: 'bai' },
        { m: 'Noted. I believe this is the first joke in the history of the company. I am framing the receipt.', from: 'ea' },
        ...opsMorale,
      ],
      morale: moraleNode,
    },
  });
  react({
    id: 'r_eats_ops',
    thread: 'ops',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => ['ymj', 'wh'].includes(P(p).to) && !lotusy(p) && night(s), delay: 45 },
    when: (s) => night(s) && noneOf(OPS_FOOD, 'r_eats_ops')(s),
    nodes: {
      start: waitFor('ops', 'go'),
      go: [
        lock('ops'),
        { m: 'Boss. Lotus Eats Message on my phone. Food. From Boss. For Us?? 👍', from: 'huang' },
        { m: 'BOSS SENT FOOD???', from: 'bai' },
        { m: '• Sender: the CEO', from: 'liu' },
        { m: '• Recipients: the night desk and security (7)', from: 'liu' },
        { m: '• Morale: rising', from: 'liu' },
        { m: '', from: 'huang', voice: { dur: 10, text: 'Boss. The night desk says thank you. They are bowing to the phone. I tell them Boss cannot see them bowing. They bow anyway. Okay. Bye.' } },
        { m: 'Noted. I will not ask the card statement any questions.', from: 'ea' },
        ...opsMorale,
      ],
      morale: moraleNode,
    },
  });

  // ── 3. Food for A-Ling ───────────────────────────────────────────
  // Pet Kingdom for Fairy, a cake from Peony Bakery, or dinner. Affection +1 once across food and money.
  const jlGate = [{ if: (s) => !F(s).jl_treated, go: 'aff' }, free('jl')];
  const jlAff = [
    { fx: { set: { jl_treated: true }, aff: { jl: 1 } } },
    { hint: 'A-Ling will remember that.' },
    free('jl'),
  ];
  const isPets = (p) => P(p).rest === 'pet-kingdom';
  const isCake = (p) => P(p).rest === 'peony-bakery' || /\bcake\b/.test(names(p));
  react({
    id: 'r_eats_jl_pets',
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => P(p).to === 'koires' && isPets(p) && night(s), delay: 30 },
    when: night,
    nodes: {
      start: waitFor('jl', 'go'),
      go: [
        lock('jl'),
        { m: 'jiujiu' },
        { m: 'pet kingdom just emailed me a delivery slip' },
        { m: 'for FAIRY' },
        { m: 'u ordered fairy stuff at this hour??' },
        { m: 'she has four bags of food and an ¥8,800 bed. she sleeps on MY bed' },
        { m: "…she says thanks. she's wet. she's always wet now" },
        ...jlGate,
      ],
      aff: jlAff,
    },
  });
  react({
    id: 'r_eats_jl_cake',
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => P(p).to === 'koires' && !isPets(p) && isCake(p) && night(s), delay: 30 },
    when: night,
    nodes: {
      start: waitFor('jl', 'go'),
      go: [
        lock('jl'),
        { m: 'jiujiu' },
        { m: 'why is a CAKE being delivered to my apartment' },
        { m: 'peony bakery. "celebration cake". the concierge texted me' },
        { m: 'is this a hint about sunday' },
        { m: "it's supposed to be a SURPRISE. u can't surprise me with my own cake. that's not how surprises work" },
        { if: (s) => !!F(s).bday_planned, go: 'two' },
        { go: 'q' },
      ],
      two: [
        { m: "and sizhui said jin's cakes is doing the cake. why are there TWO cakes" },
        { m: 'how big is this birthday' },
        { go: 'q' },
      ],
      q: [
        { m: '…is it lotus seed paste' },
        { choice: [
            { t: "It's not for Sunday.", go: 'not' },
            { t: 'Act surprised.', go: 'act' },
          ], timeout: 120, onTimeout: 'quiet' },
      ],
      quiet: [
        { m: "ok don't answer. i'm eating it" },
        ...jlGate,
      ],
      not: [
        { m: 'then who is it for' },
        { m: "it's at MY apartment. it's MINE" },
        { m: "ok i'm eating it. u can't stop me. ur in a hotel" },
        ...jlGate,
      ],
      act: [
        { m: "fine. i'll act surprised" },
        { m: "i'll cry. fake cry. FAKE" },
        { m: '(thanks jiujiu)' },
        ...jlGate,
      ],
      aff: jlAff,
    },
  });
  react({
    id: 'r_eats_jl_food',
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => P(p).to === 'koires' && !isPets(p) && !isCake(p) && night(s), delay: 40 },
    when: night,
    nodes: {
      start: waitFor('jl', 'go'),
      go: [
        lock('jl'),
        { m: 'jiujiu' },
        { m: 'the concierge says there is FOOD for me downstairs' },
        { m: 'from u' },
        { if: (s) => !!F(s).r_qin, go: 'qin' },
        { m: "…ok i'm starving. the gala food was all foam. foam and one shrimp" },
        { m: 'thanks jiujiu' },
        ...jlGate,
      ],
      qin: [
        { m: "grandma qin's AGAIN" },
        { m: "if the note says eat the vegetables i'm not eating the vegetables" },
        { m: "…i'll eat the vegetables" },
        ...jlGate,
      ],
      aff: jlAff,
    },
  });
  // (Grandma Qin's is the December 2025 order; the flag lets the food reaction remember it)
  react({
    id: 'r_eats_jl_qin_flag',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p) => P(p).to === 'koires' && P(p).rest === 'grandma-qin' },
    nodes: { start: [{ fx: { set: { r_qin: true } } }] },
  });

  // ── 4. Food to Room 1808, where Jiang Cheng is asleep ───────────
  // He can't text: he hasn't got his phone. The rider can.
  react({
    id: 'r_eats_gp',
    thread: 'eats',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => P(p).to === 'gp' && !sched(p) && night(s), delay: 55 },
    nodes: {
      start: [
        { fx: { set: { fed_jc: true } } },
        { m: '[Lotus Eats] Delivered to Golden Peony Hotel, Room 1808. A note from your rider: "Guest opened the door in a hotel bathrobe. He looked at the bag for a long time and asked who sent it. Then he said \'Tch.\' and took it inside. Have a good night!"' },
      ],
    },
  });
  react({
    id: 'r_eats_gp_later',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => P(p).to === 'gp' && sched(p) && night(s) },
    when: (s) => !F(s).fed_jc,
    nodes: { start: [{ fx: { set: { fed_jc: 'later' } } }] },
  });

  // ── 5. Dinner for yourself, on his card ──────────────────────────
  react({
    id: 'r_eats_here',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p) => P(p).to === 'here' && !lavish(p) },
    nodes: { start: [{ fx: { set: { ate_on_card: true } } }] },
  });
  // Tang Mei set a Lotus Eats spending alert after the 38 milk teas (and reads the corporate card).
  react({
    id: 'r_eats_here_lavish',
    thread: 'ea',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => P(p).to === 'here' && lavish(p) && night(s), delay: 40 },
    when: night,
    nodes: {
      start: [
        { fx: { set: { ate_on_card: true } } },
        { m: 'Your Lotus Eats spending alert just went off. The one I set after the 38 milk teas.' },
        { m: '27 Jinxing Road. That is not a hotel, an office, or any address I have on file.' },
        { m: 'Who lives at 27 Jinxing Road?' },
        { fx: { sus: { ea: 2 } } },
        { hint: 'Tang Mei noticed.' },
        { choice: [
            { t: 'Expense it.', go: 'expense' },
            { t: 'A friend.', fx: { sus: { ea: 1 } }, go: 'friend' },
          ], timeout: 150, onTimeout: 'quiet' },
      ],
      quiet: [
        { m: 'I will take your silence as "expense it". Goodnight.' },
      ],
      expense: [
        { m: 'Under what. "Midnight, Jinxing Road"?' },
        { m: 'I will file it under "Gala, miscellaneous". Goodnight.' },
      ],
      friend: [
        { m: 'You have four friends. I have all of their addresses. This is not one of them.' },
        { m: 'Goodnight, Mr. Jiang. Eat something green.' },
      ],
    },
  });

  // ── Lotus Pier, where nobody is home except Old Huang ────────────
  react({
    id: 'r_eats_lp',
    thread: 'huang',
    polite: true,
    trigger: { on: 'act', act: 'order', match: (p, s) => P(p).to === 'lp' && night(s), delay: 50 },
    when: night,
    nodes: {
      start: [
        { m: 'Boss. Food at the Residence Gate. For Boss. 👍' },
        { m: 'But Boss is in Lanling?? 🤔' },
        { m: '', voice: { dur: 12, text: "Boss. I signed for it. I put it in Boss's fridge. If Boss is not home by tomorrow, I eat it. That is the rule. Okay. Bye." } },
        { fx: { set: { huang_fridge: true } } },
      ],
    },
  });

  // ═════════════════════════════════════════════════════════════════
  // SWIFT RIDE — `ride_book` { tier, from, to, price, reserve, at, id } · `ride_arrive` { id, tier, from, to }
  //              `ride_cancel` { id, tier, to, reserve, at } · `phone_dropoff` { place, leave }
  // ═════════════════════════════════════════════════════════════════

  // ── 6a. At the Golden Peony front desk ───────────────────────────
  // The Swift Ride app asks on arrival: "Leave the phone at the front desk for Room 1808?"
  react({
    id: 'r_ride_desk',
    thread: 'swift',
    polite: true,
    trigger: { on: 'act', act: 'phone_dropoff', match: (p) => !!P(p).leave && P(p).place === 'golden-peony' },
    nodes: {
      start: [
        { fx: { set: { phone_at_desk: true, knows_hotel: true } } },
        { log: 'Took the phone back to the Golden Peony yourself', once: 'r_desk' },
        { time: '+4m', card: 'The night manager, Mr. Liang, takes the purple phone in both hands, as if it might go off. “Room 1808,” you say. He writes it on an envelope in very careful characters, and he does not ask your name.' },
        { ending: 'honest' },
      ],
    },
  });
  react({
    id: 'r_ride_desk_not_yet',
    polite: true,
    trigger: { on: 'act', act: 'phone_dropoff', match: (p) => !P(p).leave && P(p).place === 'golden-peony' },
    nodes: {
      start: [
        { fx: { set: { knows_hotel: true } } },
        { log: "Rode all the way to the Golden Peony with his phone, and didn't go in", once: 'r_desk_no' },
      ],
    },
  });

  // ── 6b. A Swift Pet for Fairy ────────────────────────────────────
  // While Jin Ling is asking where a wet Fairy can sleep: a Swift Pet to the east gate (you go yourself) or from
  // it (you send her a car) answers him — and leads to Fairy's New Favorite. Find My sharing is the third way.
  react({
    id: 'r_ride_pet_fairy_to',
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act: 'ride_arrive', match: (p, s) => P(p).tier === 'pet' && koi(P(p).to) && fairyNeeds(s), delay: 2 },
    when: (s) => fairyNeeds(s) && noneOf(FAIRY_WAYS, 'r_ride_pet_fairy_to')(s),
    nodes: {
      start: [
        settleFairyAsk,
        lock('jl'),
        { fx: { set: { fairy_taken: true } } },
        { log: 'Took a Swift Pet to the Koi Tower east gate to collect Fairy in person', once: 'r_fairy_way' },
        { hint: 'Fairy has seen the car.' },
        { m: 'wait' },
        { m: 'is that a swift PET pulling up at the east gate' },
        { m: 'the driver is holding up a phone. it says JIANG CHENG' },
        { m: 'jiujiu did u come URSELF??' },
        { m: "ok. coming. she's dragging me. she can smell u from here" },
        { start: 'fairy_meet' },
      ],
    },
  });
  react({
    id: 'r_ride_pet_fairy_from',
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act: 'ride_book', match: (p, s) => P(p).tier === 'pet' && !P(p).reserve && koi(P(p).from) && fairyNeeds(s), delay: 14 },
    when: (s) => fairyNeeds(s) && noneOf(FAIRY_WAYS, 'r_ride_pet_fairy_from')(s),
    nodes: {
      start: [
        settleFairyAsk,
        lock('jl'),
        { fx: { set: { fairy_taken: true } } },
        { log: 'Sent a Swift Pet to Koi Tower to fetch Fairy', once: 'r_fairy_way' },
        { hint: 'Fairy is on her way.' },
        { m: 'jiujiu' },
        { m: 'a swift PET just pulled up at the east gate' },
        { m: "with JIANG CHENG on the driver's screen" },
        { m: 'u sent fairy a CAR??' },
        { m: "ok she's in. front seat. the driver is praying" },
        { m: "i'm coming too. she won't go anywhere without me" },
        { start: 'fairy_meet' },
      ],
    },
  });
  // …and when Fairy doesn't need a car (yet, or any more), a pet car with his name on it is just weird.
  const PET_ODD = ['r_ride_pet_odd_to', 'r_ride_pet_odd_from'];
  const petOdd = (id, act, side) => react({
    id,
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act, match: (p, s) => P(p).tier === 'pet' && !P(p).reserve && koi(P(p)[side]) && night(s) && !F(s).fairy_taken && !fairyNeeds(s), delay: side === 'from' ? 14 : 2 },
    when: (s) => night(s) && !F(s).fairy_taken && noneOf(PET_ODD, id)(s),
    nodes: {
      start: waitFor('jl', 'go'),
      go: [
        lock('jl'),
        { m: 'why is a swift PET car outside koi tower with ur name on it' },
        { if: (s) => !!F(s).fairy_ok, go: 'ok' },
        { if: (s) => !!F(s).car_known, go: 'roof' },
        { m: "fairy doesn't need a car. fairy needs a bath. don't tell her i said that" },
        { go: 'end' },
      ],
      ok: [{ m: "fairy is FINE. she's asleep on a gold towel. she has never been more fine" }, { go: 'end' }],
      roof: [{ m: "fairy is on SANDU. in a POND. she is not getting in another car tonight" }, { go: 'end' }],
      end: [
        { m: 'ur so weird tonight' },
        { fx: { sus: { jl: 1 } } },
        free('jl'),
      ],
    },
  });
  petOdd('r_ride_pet_odd_to', 'ride_arrive', 'to');
  petOdd('r_ride_pet_odd_from', 'ride_book', 'from');

  // ── 6c. A car to Gusu for Saturday afternoon (tea at the Hanshi is at three) ─
  react({
    id: 'r_ride_gusu',
    thread: 'ea',
    polite: true,
    trigger: { on: 'act', act: 'ride_book', match: (p) => !!P(p).reserve && gusu(P(p).to) && saturday(P(p).at), delay: 4 },
    nodes: {
      start: [
        { fx: { set: { ride_gusu: true } } },
        { if: (s) => !!F(s).tea_yes, go: 'tea' },
        { if: (s) => !!F(s).lxc_invited, go: 'busy' },
        { log: 'Booked a car to Gusu for Saturday afternoon, in case anyone asked him to tea', once: 'r_gusu' },
        { end: true },
      ],
      tea: [
        { log: 'Booked him a car to Cloud Recesses, in time for tea at three', once: 'r_gusu' },
        { if: (s) => !!D(s).ea_tea && night(s), go: 'ea' },
        { end: true },
      ],
      busy: [
        { log: 'Told Zewu-jun he was busy tomorrow, then booked a car to Gusu for tomorrow afternoon', once: 'r_gusu' },
        { end: true },
      ],
      // Tang Mei has been his Swift Ride trusted contact since 2019
      ea: [
        { m: 'Swift Ride just copied me on a reservation. Gusu, tomorrow afternoon.' },
        { if: (s) => !!F(s).car_known, go: 'ea_car' },
        { m: 'So, not the train. Noted.' },
        { go: 'ea_coat' },
      ],
      ea_car: [{ m: 'I will cancel the car I booked for 12:30. Yours has better legroom.' }, { go: 'ea_coat' }],
      ea_coat: [{ m: 'Grey coat.' }],
    },
  });
  react({
    id: 'r_ride_gusu_cancel',
    polite: true,
    trigger: { on: 'act', act: 'ride_cancel', match: (p, s) => !!P(p).reserve && gusu(P(p).to) && !!F(s).ride_gusu },
    nodes: { start: [{ fx: { set: { ride_gusu: false } } }, { log: 'Cancelled the car to Gusu', once: 'r_gusu_x' }] },
  });

  // ═════════════════════════════════════════════════════════════════
  // WALLET — `wallet_send` { to, amount, note, card, tx }   (Cash → Send; the app posts the payment bubble)
  // Money that is returned comes back through JC.wallet.sendBack.
  // ═════════════════════════════════════════════════════════════════
  const FIRST = {}; // contact → first-send scene ids (the repeat reaction waits for one of them)
  const pay = (cid, id, extra, def) => {
    (FIRST[cid] = FIRST[cid] || []).push(id);
    const group = FIRST[cid];
    return react(Object.assign({
      id,
      thread: cid,
      polite: true,
      trigger: { on: 'act', act: 'wallet_send', match: (p, s) => P(p).to === cid && night(s) && !anyOf(group)(s) && (!extra || extra(p, s)), delay: def.delay || 15 },
      when: (s) => night(s) && noneOf(group, id)(s),
    }, def));
  };

  // ── A-Ling: birthday money ───────────────────────────────────────
  pay('jl', 'r_pay_jl_18', (p) => amtIn(p, A18), {
    nodes: {
      start: waitFor('jl', 'go'),
      go: [
        lock('jl'),
        { m: '1818??' },
        { m: 'jiujiu' },
        { m: "18 on the 18th. that's SO corny" },
        { m: "is this a birthday thing. it's not sunday yet. u have to wait till sunday. those are the rules" },
        { m: "…i'm not giving it back" },
        { m: '(thanks)' },
        ...jlGate,
      ],
      aff: jlAff,
    },
  });
  pay('jl', 'r_pay_jl_88', (p) => amtIn(p, A88), {
    nodes: {
      start: waitFor('jl', 'go'),
      go: [
        lock('jl'),
        { m: '8888??' },
        { m: "that's my NEW YEAR amount" },
        { m: "it's not new year. it's not even my birthday yet" },
        { m: "…ok it's a good number. i'm keeping it" },
        { m: '(thanks jiujiu)' },
        ...jlGate,
      ],
      aff: jlAff,
    },
  });
  pay('jl', 'r_pay_jl', (p) => !amtIn(p, A18) && !amtIn(p, A88), {
    nodes: {
      start: waitFor('jl', 'go'),
      go: [
        lock('jl'),
        { m: 'why did u just send me money' },
        { if: (s) => !!F(s).car_known && !F(s).car_handled, go: 'tow' },
        { m: "is this a bribe so i don't tell wei wuxian about the balcony" },
        { m: "bc i was going to tell him. i'm still going to tell him" },
        { m: '…not sending it back tho' },
        ...jlGate,
      ],
      tow: [
        { m: 'is this for the TOW??' },
        { m: 'u want ME to pay the tow guy??' },
        { m: "…that's fair. that's actually fair. ugh" },
        ...jlGate,
      ],
      aff: jlAff,
    },
  });

  // ── Wei Wuxian: "are u dying" ────────────────────────────────────
  pay('wwx', 'r_pay_wwx_520', (p) => amtIn(p, A520), {
    nodes: {
      start: waitFor('wwx', 'go'),
      go: [
        lock('wwx'),
        { m: 'jiang cheng' },
        { m: 'u just sent me a 520' },
        { m: 'do u know what 520 means' },
        { m: 'it means I LOVE YOU. in numbers. that is what 520 means' },
        { m: 'u sent me 5200 for the wedding. on the 20th of may. i thought that was an accident' },
        { m: 'was that an accident' },
        { m: '…are u dying' },
        { fx: { sus: { wwx: 1 } } },
        { m: 'lan zhan says u are not dying. lan zhan says "Mn." with his whole face' },
        free('wwx'),
      ],
    },
  });
  pay('wwx', 'r_pay_wwx', (p) => !amtIn(p, A520), {
    nodes: {
      start: waitFor('wwx', 'go'),
      go: [
        lock('wwx'),
        { m: 'why did u send me money' },
        { m: 'jiang cheng why did u send me MONEY' },
        { m: 'are u dying' },
        { m: "lan zhan. LAN ZHAN. he sent me money. he's dying" },
        { if: (s) => !!F(s).wwx_invited, go: 'ribs' },
        { m: "ok. i'm buying radish seeds with it. u can't stop me" },
        { go: 'end' },
      ],
      ribs: [
        { m: '…wait. is this for sunday. for the soup' },
        { m: "ur paying for shijie's soup?? that's illegal. i'm buying the ribs anyway. the GOOD ribs" },
        { go: 'end' },
      ],
      end: [
        { fx: { sus: { wwx: 2 } } },
        { hint: 'Wei Wuxian noticed.' },
        free('wwx'),
      ],
    },
  });

  // ── Wen Ning: tries to refuse ────────────────────────────────────
  pay('wn', 'r_pay_wn_tow', (p, s) => !!F(s).wn_towed && amt(p) > 50, {
    delay: 25,
    nodes: {
      start: [
        { m: "Mr. Jiang, you didn't have to. It was only a rope." },
        { m: 'I sent it back. Sorry.' },
        { m: "I kept ¥50 for petrol. Because you'd be angry if I sent all of it back. Sorry. — Wen Ning" },
        sendBack('wn', 50, 'Minus ¥50 for petrol. Sorry. — Wen Ning'),
        { fx: { set: { wn_paid: true } } },
      ],
    },
  });
  pay('wn', 'r_pay_wn_petrol', (p, s) => !!F(s).wn_towed && amt(p) <= 50, {
    delay: 25,
    nodes: {
      start: [
        { m: 'Mr. Jiang, thank you. I will put it toward petrol.' },
        { m: 'And a towel for the van. Fairy was in it. Sorry. — Wen Ning' },
        { fx: { set: { wn_paid: true } } },
      ],
    },
  });
  pay('wn', 'r_pay_wn', (p, s) => !F(s).wn_towed, {
    delay: 25,
    nodes: {
      start: [
        { m: 'Mr. Jiang, I think you sent this to the wrong person. Sorry.' },
        { m: "I've sent it back. — Wen Ning" },
        sendBack('wn', 0, 'Wrong person? Sorry. — Wen Ning'),
        { fx: { sus: { wn: 1 } } },
      ],
    },
  });

  // ── Ops: Old Huang, Liu Qian, A-Bai (morale +1 once, shared with food for the Ops floor) ─
  const opsGate = [{ if: (s) => !F(s).ops_treated, go: 'morale' }];
  const opsMoraleDm = [
    { fx: { set: { ops_treated: true }, inc: { ops_morale: 1 } } },
    { hint: 'The Ops team will remember that.' },
  ];
  pay('huang', 'r_pay_huang', null, {
    nodes: {
      start: [
        { m: 'Boss!! Money came!! 👍👍' },
        { m: '', voice: { dur: 13, text: 'Boss. My wife asks what the money is for. I tell her: Boss is Boss. She says buy a new umbrella. Okay. Thank you Boss. Bye.' } },
        { go: 'q' },
      ],
      q: waitFor('ops', 'group', 'q'),
      group: [
        lock('ops'),
        { m: 'Boss sent me Money!!! 👍👍👍', th: 'ops', from: 'huang' },
        { m: 'boss can i also be old huang 🙇', th: 'ops', from: 'bai' },
        { m: '• Noted: Old Huang is the favourite', th: 'ops', from: 'liu' },
        free('ops'),
        ...opsGate,
      ],
      morale: opsMoraleDm,
    },
  });
  pay('liu', 'r_pay_liu', null, {
    nodes: {
      start: [
        { m: '• Received: a transfer from the CEO' },
        { m: '• Time: after midnight' },
        { m: '• Purpose: unclear' },
        { if: (s) => !!F(s).dog_friday, go: 'dog' },
        { m: '• Logged as: canteen soup fund. Thank you' },
        ...opsGate,
      ],
      dog: [{ m: '• Logged as: Dog Friday fund (treats). Thank you' }, ...opsGate],
      morale: opsMoraleDm,
    },
  });
  pay('bai', 'r_pay_bai', null, {
    delay: 12,
    nodes: {
      start: [
        { m: 'boss' },
        { if: (s) => !!F(s).bai_fired, go: 'fired' },
        { m: 'boss why did u send me money 🙇' },
        { m: 'is it for the 400 kg. do i have to pay for the 400 kg. i will pay for the 400 kg 🙇🙇' },
        { m: "liu qian says it's a bonus. is it a bonus. i've never had a bonus" },
        ...opsGate,
      ],
      fired: [
        { m: 'is this my severance 🙇' },
        { m: "thank you boss. i'll frame it" },
        ...opsGate,
      ],
      morale: opsMoraleDm,
    },
  });
  pay('ea', 'r_pay_ea', null, {
    delay: 10,
    nodes: {
      start: [
        { m: 'A personal transfer. From you. To me. At this hour.' },
        { m: 'Is this a bonus, or hush money?' },
        { m: 'Either way I will file it under "Gala".' },
        { fx: { sus: { ea: 1 } } },
      ],
    },
  });

  // ── Nie Huaisang: "hush money?" ──────────────────────────────────
  pay('nhs', 'r_pay_nhs_88', (p) => amtIn(p, [88, 8.8, 880]), {
    nodes: {
      start: waitFor('nhs', 'go'),
      go: [
        lock('nhs'),
        { m: '88!!! 😭' },
        { m: 'Like my hotpot money!! From the reunion!!' },
        { m: 'Brother Jiang remembers everything he has ever paid for…' },
        { m: '…but Brother Jiang has never paid anyone BACK. Not once. Not since 2007 👀' },
        { m: 'Hmm~' },
        { fx: { sus: { nhs: 2 } } },
        { hint: 'Nie Huaisang noticed.' },
        free('nhs'),
      ],
    },
  });
  pay('nhs', 'r_pay_nhs', (p) => !amtIn(p, [88, 8.8, 880]), {
    nodes: {
      start: waitFor('nhs', 'go'),
      go: [
        lock('nhs'),
        { m: 'Brother Jiang……' },
        { m: 'sent ME…… money?? 🙈' },
        { m: 'Is this HUSH MONEY?? 👀' },
        { m: "For the balcony?? I don't know anything!! I've never known anything!!" },
        { m: "(I'm keeping it)" },
        { fx: { sus: { nhs: 2 } } },
        { hint: 'Nie Huaisang noticed.' },
        free('nhs'),
      ],
    },
  });

  // ── Everyone else ────────────────────────────────────────────────
  pay('lxc', 'r_pay_lxc', null, {
    nodes: {
      start: waitFor('lxc', 'go'),
      go: [
        lock('lxc'),
        { m: 'Wanyin, I think this was meant for someone else.' },
        { m: "I've sent it back. 🙂" },
        sendBack('lxc', 0, '🙂'),
        { fx: { sus: { lxc: 1 } } },
        { if: (s) => !!F(s).tea_yes, go: 'tea' },
        free('lxc'),
      ],
      tea: [
        { m: "And if it was for the tea: you're my guest. Guests don't pay at the Hanshi." },
        free('lxc'),
      ],
    },
  });
  pay('lwj', 'r_pay_lwj', null, {
    delay: 20,
    nodes: {
      start: [
        { m: 'Why.' },
        { wait: 8 },
        { m: 'Returned.' },
        sendBack('lwj', 0, 'Returned.'),
        { fx: { sus: { lwj: 1 } } },
      ],
    },
  });
  pay('sz', 'r_pay_sz', null, {
    delay: 18,
    nodes: {
      start: [
        { m: 'Sect Leader Jiang, thank you. But I think this was meant for Jin Ling?' },
        { if: (s) => !!F(s).bday_planned, go: 'cake' },
        { m: "I'll keep it safe until Sunday and give it to him with the card." },
      ],
      cake: [{ m: "Shall I put it toward the cake? Jin's Cakes takes transfers. I'll tell them it's from you." }],
    },
  });
  pay('jy', 'r_pay_jy', null, {
    delay: 10,
    nodes: {
      start: [
        { m: 'MR JIANG SENT ME MONEY 💀💀💀' },
        { m: 'is this a bribe' },
        { m: 'for what' },
        { m: "i'll do it" },
        { m: "wait is this for the bday. balloons. i'm buying SO many balloons" },
        { fx: { sus: { jy: 1 } } },
      ],
    },
  });
  pay('mian', 'r_pay_mian', null, {
    delay: 20,
    nodes: {
      start: [
        { m: 'Jiang Cheng. You just sent me money. At this hour.' },
        { m: "If it's for the 200 I owe Huaisang, I'm not taking it. That bet is between him, me and Zewu-jun." },
        { if: (s) => !!F(s).lxc_invited, go: 'talked' },
        { go: 'back' },
      ],
      talked: [{ m: '(Which means you talked to him. Huaisang is going to be unbearable.)' }, { go: 'back' }],
      back: [
        sendBack('mian', 0, 'Nice try.'),
        { m: 'Sent back. Go to sleep.' },
        { fx: { sus: { mian: 1 } } },
      ],
    },
  });

  // ── Second transfers: one line, once ────────────────────────────
  const AGAIN = {
    jl: [[{ m: 'again??' }, { m: "ok now i'm scared" }], { sus: { jl: 1 } }],
    wwx: [[{ m: 'AGAIN??' }, { m: "lan zhan he's dying faster" }], { sus: { wwx: 1 } }],
    nhs: [[{ m: 'More hush money?? 🙈 Brother Jiang, at this rate I will have to start knowing things' }], { sus: { nhs: 1 } }],
    lxc: [[{ m: 'Wanyin. 🙂' }, sendBack('lxc', 0, '🙂')], null],
    lwj: [[{ m: 'Returned.' }, sendBack('lwj', 0, 'Returned.')], null],
    wn: [[{ m: "Mr. Jiang, sorry. I'm sending this one back too. — Wen Ning" }, sendBack('wn', 0, 'Sorry. — Wen Ning')], null],
    huang: [[{ m: 'Boss!! More!! 👍 My wife asks if Boss is sick 🤔' }], { sus: { huang: 1 } }],
    liu: [[{ m: '• Received (again)' }, { m: '• Logged (again)' }], null],
    bai: [[{ m: "boss i'm scared 🙇" }], null],
    ea: [[{ m: 'Noted. Again.' }], { sus: { ea: 1 } }],
    sz: [[{ m: "Thank you, Sect Leader Jiang. I'll add it to the cake fund." }], null],
    jy: [[{ m: "MR JIANG AGAIN 💀 i'm rich" }], null],
    mian: [[{ m: 'Go to sleep, Jiang Cheng.' }, sendBack('mian', 0, 'Go to sleep.')], null],
  };
  const BUSY_THREADS = ['jl', 'wwx', 'nhs', 'lxc'];
  Object.keys(AGAIN).forEach((cid) => {
    const [steps, fx] = AGAIN[cid];
    const tail = fx ? [{ fx }] : [];
    const busy = BUSY_THREADS.includes(cid);
    react({
      id: 'r_pay2_' + cid,
      thread: cid,
      polite: true,
      trigger: { on: 'act', act: 'wallet_send', match: (p, s) => P(p).to === cid && night(s) && anyOf(FIRST[cid] || [])(s), delay: 12 },
      when: night,
      nodes: busy
        ? { start: waitFor(cid, 'go'), go: [lock(cid), ...steps, ...tail, free(cid)] }
        : { start: [...steps, ...tail] },
    });
  });

  // ═════════════════════════════════════════════════════════════════
  // FIND MY — `findmy_share` { to, dur } · `findmy_unshare` { to } · `findmy_ask` { to }
  // The phone is at 27 Jinxing Road, nowhere near the Golden Peony.
  // ═════════════════════════════════════════════════════════════════
  const share = (to) => (p, s) => P(p).to === to && night(s);

  // Fairy crisis: sharing with A-Ling brings him (and Fairy) to Jinxing Road.
  react({
    id: 'r_fm_jl_fairy',
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act: 'findmy_share', match: (p, s) => P(p).to === 'jl' && fairyNeeds(s), delay: 6 },
    when: (s) => fairyNeeds(s) && noneOf(FAIRY_WAYS, 'r_fm_jl_fairy')(s),
    nodes: {
      start: [
        settleFairyAsk,
        lock('jl'),
        { fx: { set: { fairy_taken: true, loc_shared: true } } },
        { log: 'Shared his location with A-Ling while Fairy needed a bed', once: 'r_fairy_way' },
        { hint: 'A-Ling is on his way.' },
        { m: 'wait ur location just popped up' },
        { m: "jinxing road?? that's not the golden peony" },
        { m: "wtv. it's closer than koi tower's carpet and fairy is FREEZING" },
        { m: "sizhui's driving us. omw" },
        { start: 'fairy_meet' },
      ],
    },
  });
  react({
    id: 'r_fm_jl',
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act: 'findmy_share', match: (p, s) => P(p).to === 'jl' && night(s) && !fairyNeeds(s) && !F(s).fairy_taken, delay: 8 },
    when: (s) => night(s) && !F(s).fairy_taken && !D(s).r_fm_jl_fairy,
    nodes: {
      start: waitFor('jl', 'go'),
      go: [
        lock('jl'),
        { fx: { set: { loc_shared: true } } },
        { m: '?' },
        { m: 'why did u just share ur location with me' },
        { m: 'u NEVER share. u said "i know where u are. that\'s the point"' },
        { m: 'wait' },
        { m: 'jinxing road??' },
        { m: "why r u in jinxing. the golden peony is on riverside. that's like six km" },
        { fx: { sus: { jl: 2 } } },
        { hint: 'A-Ling noticed.' },
        { m: "is this a lan xichen thing. ugh. forget it. i don't want to know" },
        free('jl'),
      ],
    },
  });
  react({
    id: 'r_fm_wwx',
    thread: 'wwx',
    polite: true,
    trigger: { on: 'act', act: 'findmy_share', match: share('wwx'), delay: 8 },
    when: (s) => night(s) && !F(s).burned,
    nodes: {
      start: waitFor('wwx', 'go'),
      go: [
        lock('wwx'),
        { fx: { set: { loc_shared: true } } },
        { m: 'JIANG CHENG SHARED HIS LOCATION WITH ME' },
        { m: 'lan zhan. LAN ZHAN. he shared back' },
        { m: "i started sharing mine on wednesday and u never said anything and i thought ok. that's ok" },
        { m: "and now ur on my map. a little purple dot" },
        { typing: 3 },
        { m: '…wait' },
        { m: 'why is the little purple dot on jinxing road. the golden peony is on riverside' },
        { m: 'are u ok?? did something happen at the hotel??' },
        { fx: { sus: { wwx: 1 } } },
        { hint: 'Wei Wuxian noticed.' },
        { choice: [
            { t: "I'm fine. Go to sleep.", go: 'fine' },
            { t: 'Walking.', go: 'walk' },
          ], timeout: 120, onTimeout: 'fine' },
      ],
      fine: [
        { m: "ok. ok. i'm not going to sleep. i'm going to watch the little dot" },
        { m: "(it's a very cute dot)" },
        free('wwx'),
      ],
      walk: [
        { m: 'at this hour. in the rain. ok jiang cheng' },
        { m: "i'm watching the dot. if the dot goes near the river i'm calling wen ning" },
        free('wwx'),
      ],
    },
  });
  react({
    id: 'r_fm_nhs',
    thread: 'nhs',
    polite: true,
    trigger: { on: 'act', act: 'findmy_share', match: share('nhs'), delay: 8 },
    when: night,
    nodes: {
      start: waitFor('nhs', 'go'),
      go: [
        lock('nhs'),
        { fx: { set: { loc_shared: true, loc_nhs: true } } },
        { m: 'Brother Jiang…' },
        { m: 'shared his LOCATION… with ME?? 🙈🙈' },
        { m: 'Is this a cry for help?? Blink twice' },
        { m: '…Jinxing Road? 👀' },
        { m: "That's not the Golden Peony, Brother Jiang~ Whose house is it?? 👀👀" },
        { m: "Don't worry!! I'm not telling anyone!! (I'm telling Mianmian)" },
        { fx: { sus: { nhs: 2 } } },
        { hint: 'Nie Huaisang noticed.' },
        free('nhs'),
      ],
    },
  });
  react({
    id: 'r_fm_lxc',
    thread: 'lxc',
    polite: true,
    trigger: { on: 'act', act: 'findmy_share', match: share('lxc'), delay: 10 },
    when: night,
    nodes: {
      start: waitFor('lxc', 'go'),
      go: [
        lock('lxc'),
        { fx: { set: { loc_shared: true } } },
        { m: "Wanyin, I think you've shared your location with me." },
        { m: "I'll take good care of it. 🙂" },
        { m: '…Jinxing Road. I thought you were staying at the Golden Peony.' },
        { m: "Wherever you are, I hope it's somewhere warm." },
        { fx: { aff: { lxc: 1 }, sus: { lxc: 1 } } },
        { hint: 'Lan Xichen will remember that.' },
        free('lxc'),
      ],
    },
  });
  react({
    id: 'r_fm_huang',
    thread: 'huang',
    polite: true,
    trigger: { on: 'act', act: 'findmy_share', match: share('huang'), delay: 12 },
    when: night,
    nodes: {
      start: [
        { fx: { set: { loc_shared: true } } },
        { m: 'Boss. I see Boss on Map. 👍' },
        { m: '', voice: { dur: 12, text: 'Boss. Jinxing Road is not the hotel. Boss is walking at night? Very good for heart. But take umbrella. It is raining in Lanling. I checked. Okay. Bye.' } },
      ],
    },
  });
  react({
    id: 'r_fm_wn',
    thread: 'wn',
    polite: true,
    trigger: { on: 'act', act: 'findmy_share', match: share('wn'), delay: 15 },
    when: night,
    nodes: {
      start: [
        { fx: { set: { loc_shared: true } } },
        { m: 'Mr. Jiang, I think you shared your location with me by accident. Sorry.' },
        { m: "I won't look." },
        { m: "(I looked. Sorry. Jinxing Road is far from the Golden Peony. Are you all right? I have the van.) — Wen Ning" },
        { fx: { sus: { wn: 1 } } },
      ],
    },
  });
  react({
    id: 'r_fm_ea',
    thread: 'ea',
    polite: true,
    trigger: { on: 'act', act: 'findmy_share', match: share('ea'), delay: 8 },
    when: night,
    nodes: { start: [{ m: 'Location sharing resumed. Noted.' }] },
  });

  // ── Stopping ─────────────────────────────────────────────────────
  react({
    id: 'r_fm_unshare_ea',
    thread: 'ea',
    polite: true,
    trigger: { on: 'act', act: 'findmy_unshare', match: share('ea'), delay: 8 },
    when: night,
    nodes: {
      start: [
        { m: 'You stopped sharing your location with me.' },
        { m: 'Noted. I will assume you are alive until Monday at nine.' },
        { fx: { sus: { ea: 1 } } },
      ],
    },
  });
  react({
    id: 'r_fm_unshare_wwx',
    thread: 'wwx',
    polite: true,
    trigger: { on: 'act', act: 'findmy_unshare', match: (p, s) => share('wwx')(p, s) && !!D(s).r_fm_wwx, delay: 8 },
    when: (s) => night(s) && !F(s).burned,
    nodes: {
      start: waitFor('wwx', 'go'),
      go: [
        lock('wwx'),
        { m: 'the little dot is gone :(' },
        { m: "it's ok. i'm still sharing mine. that's how sharing works" },
        free('wwx'),
      ],
    },
  });
  react({
    id: 'r_fm_unshare_nhs',
    thread: 'nhs',
    polite: true,
    trigger: { on: 'act', act: 'findmy_unshare', match: (p, s) => share('nhs')(p, s) && !!D(s).r_fm_nhs, delay: 8 },
    when: night,
    nodes: {
      start: waitFor('nhs', 'go'),
      go: [
        lock('nhs'),
        { m: 'Too late, Brother Jiang!! I took a screenshot 👀' },
        { m: '(Of a map. I have a screenshot of a map. I need a hobby 🪭)' },
        free('nhs'),
      ],
    },
  });
  react({
    id: 'r_fm_unshare_jl',
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act: 'findmy_unshare', match: (p, s) => share('jl')(p, s) && !!D(s).r_fm_jl && !F(s).fairy_taken, delay: 8 },
    when: (s) => night(s) && !F(s).fairy_taken,
    nodes: {
      start: waitFor('jl', 'go'),
      go: [lock('jl'), { m: 'ok u stopped. weirdo' }, free('jl')],
    },
  });

  // ── Asking to follow someone ─────────────────────────────────────
  react({
    id: 'r_fm_ask_lxc',
    thread: 'lxc',
    polite: true,
    trigger: { on: 'act', act: 'findmy_ask', match: share('lxc'), delay: 12 },
    when: night,
    nodes: {
      start: waitFor('lxc', 'go'),
      go: [
        lock('lxc'),
        fmAnswer('lxc', true),
        { m: 'Wanyin, you asked to see where I am.' },
        { m: "I said yes, of course. It will almost always say \"the Hanshi\". I'm not a very interesting dot. 🙂" },
        { if: (s) => !!F(s).tea_yes, go: 'tea' },
        { m: 'Thank you for wanting to know.' },
        { go: 'end' },
      ],
      tea: [{ m: 'Tomorrow at three, I hope it will say the same place as yours.' }, { go: 'end' }],
      end: [
        { fx: { aff: { lxc: 1 }, sus: { lxc: 1 } } },
        { hint: 'Lan Xichen will remember that.' },
        free('lxc'),
      ],
    },
  });
  react({
    id: 'r_fm_ask_nhs',
    thread: 'nhs',
    polite: true,
    trigger: { on: 'act', act: 'findmy_ask', match: share('nhs'), delay: 10 },
    when: night,
    nodes: {
      start: waitFor('nhs', 'go'),
      go: [
        lock('nhs'),
        fmAnswer('nhs', false),
        { m: 'Brother Jiang wants to know where I AM?? 👀' },
        { m: 'Declined!!! A chairman must remain mysterious 🪭' },
        { m: "(Brother Jiang has never once wanted to know where I am. Only where I'm not, so he can go there)" },
        { fx: { sus: { nhs: 1 } } },
        free('nhs'),
      ],
    },
  });
  react({
    id: 'r_fm_ask_lwj',
    thread: 'lwj',
    polite: true,
    trigger: { on: 'act', act: 'findmy_ask', match: share('lwj'), delay: 20 },
    when: night,
    nodes: {
      start: [
        { m: 'Why.' },
        { wait: 10 },
        fmAnswer('lwj', true),
        { m: 'Accepted. I am where Wei Ying is.' },
        { fx: { sus: { lwj: 1 } } },
      ],
    },
  });
  react({
    id: 'r_fm_ask_wn',
    thread: 'wn',
    polite: true,
    trigger: { on: 'act', act: 'findmy_ask', match: share('wn'), delay: 15 },
    when: night,
    nodes: {
      start: [
        fmAnswer('wn', true),
        { if: (s) => !!F(s).wn_towed, go: 'garage' },
        { m: 'M-Mr. Jiang wants to know where I am?' },
        { m: "I'm in the Koi Tower car park. With the van. Sorry. I accepted. Sorry. — Wen Ning" },
      ],
      garage: [{ m: "I accepted, Mr. Jiang. I'm at the Golden Peony garage. I just left Sandu with the night manager. Sorry. — Wen Ning" }],
    },
  });

  // ═════════════════════════════════════════════════════════════════
  // MAPS — `directions` { place } · `place_view` { place }   (+ Wallet passes that give the same facts away)
  // ═════════════════════════════════════════════════════════════════
  react({
    id: 'r_maps_hotel',
    polite: true,
    trigger: { on: 'act', act: 'directions', match: (p) => P(p).place === 'golden-peony' },
    nodes: { start: [{ fx: { set: { knows_hotel: true } } }, { log: 'Looked up the way to the Golden Peony, where he was asleep', once: 'r_maps_hotel' }] },
  });
  react({
    id: 'r_wallet_hotel',
    polite: true,
    trigger: { on: 'act', act: 'wallet_view', match: (p) => P(p).id === 'hotel' },
    nodes: { start: [{ fx: { set: { knows_hotel: true } } }, { log: 'Found his hotel key in Wallet: Golden Peony, Room 1808', once: 'r_wallet_hotel' }] },
  });
  react({
    id: 'r_maps_laoma',
    polite: true,
    trigger: { on: 'act', act: 'place_view', match: (p) => P(p).place === 'laoma-hotpot' },
    nodes: { start: [{ fx: { set: { knows_laoma: true } } }, { log: 'Found Laoma Hotpot in his Gusu guide (“Summer ’07 — after the exams. I paid.”)', once: 'knows_laoma' }] },
  });
  react({
    id: 'r_wallet_laoma',
    polite: true,
    trigger: { on: 'act', act: 'wallet_tx', match: (p) => P(p).id === 'tx_laoma' },
    nodes: { start: [{ fx: { set: { knows_laoma: true } } }, { log: 'Found the 2024 Laoma Hotpot bill in his Wallet (¥1,486; he paid)', once: 'knows_laoma' }] },
  });
  react({
    id: 'r_maps_lp',
    polite: true,
    trigger: { on: 'act', act: 'directions', match: (p) => ['lotus-pier', 'lp-residence'].includes(P(p).place) },
    nodes: { start: [{ log: 'Looked up the way to Lotus Pier, as if Sunday needed a map', once: 'r_maps_lp' }] },
  });
  react({
    id: 'r_maps_gusu',
    polite: true,
    trigger: { on: 'act', act: 'directions', match: (p) => CR.includes(P(p).place) },
    nodes: {
      start: [
        { if: (s) => !!F(s).tea_yes, go: 'tea' },
        { log: 'Looked up the way to Cloud Recesses. Two hours and twenty-four minutes', once: 'r_maps_gusu' },
      ],
      tea: [{ log: 'Looked up the way to Cloud Recesses, for tea at three', once: 'r_maps_gusu' }],
    },
  });
})();
