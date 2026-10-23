/* Live scenes — the Harbingers: the group "Harbingers 🧊" (ch1 chaos, the Rite, Sunday night, Monday's edict),
   Pantalone watching every Mora (spending, freezes, transfers, Paimon), Signora noticing freezes and intranet
   logins, Sandrone guarding Unit 3, and The Balladeer's Gossip (caught_scara). Package S2.
   Facts: docs/STORY.md. Format: docs/DEV.md "Story engine". */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  // ── shared helpers (S2) ──────────────────────────────────────────
  const F = (s) => s.flags || {};
  const num = (s, k) => Number(F(s)[k] || 0);
  const at = (t) => JC.time.parse(t);
  // thread locks: busy_<thread> holds the owning scene id; a lock whose scene has ended is stale
  const held = (s, k, me) => {
    const o = F(s)['busy_' + k];
    if (!o || o === me) return false;
    if (typeof o === 'string') { const d = s.done || {}; if (!d[o] || d[o] === 'expired' || d[o] === 'skipped' || (s.fin && s.fin[o])) return false; }
    return true;
  };
  const waitFor = (k, me, next) => [{ if: (s) => !held(s, k, me), go: next }, { wait: 5 }, { go: 'start' }];
  const lock = (k, me) => ({ fx: { set: { ['busy_' + k]: me } } });
  const free = (k, me) => ({ run: (api) => { const f = api.state.flags; if (f['busy_' + k] === me) f['busy_' + k] = false; } });
  const helper = (names, s, dflt) => {
    const H = JC.storyHelpers || {};
    for (const n of names) if (typeof H[n] === 'function') { try { return !!H[n](s); } catch (e) { break; } }
    return !!dflt(s);
  };
  const stopped = (s) => helper(['osial_stopped', 'osialStopped'], s, (x) => !F(x).osial_sent && !!(F(x).leaked_yelan || F(x).leaked_ning || F(x).ops_sabotage || F(x).zl_amended || F(x).card_frozen));
  const recalled = (s) => helper(['recalled'], s, (x) => !F(x).defected && !F(x).zl_amended);
  const alive = (s) => !F(s).deal_refused && !F(s).lost_mode && !F(s).finale;
  const knowsGod = (s) => !!(F(s).knows_morax || F(s).zl_confessed);
  const scene = (def) => S.scene(Object.assign({ arc: 'osial' }, def));
  const cap = { react: 'like', from: 'capitano', on: 'them' };

  // ── 1. Friday night in the group (ch1 +520 ≈ 00:39) ──────────────
  scene({
    id: 'harb_chat',
    thread: 'harb',
    ch: 'fri_night',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 520 },
    expire: 'x',
    nodes: {
      start: waitFor('harb', 'harb_chat', 'go'),
      go: [
        lock('harb', 'harb_chat'),
        { m: 'the eleventh went swimming tonight', from: 'scara' },
        { m: 'in october. in the harbor. fully dressed', from: 'scara' },
        { m: "signora's people say he \"resisted\". i would have paid to watch", from: 'scara' },
        { m: 'My people say a great many things. Tartaglia is welcome to correct them.', from: 'signora' },
        { m: '♪ cold, cold water… the little fish swims home ♪', from: 'columbina' },
        { m: 'His watch stopped reporting to me at 23:24. Heart rate 168, then a hard fall, then nothing. I was worried. Professionally.', from: 'dottore' },
        { m: 'And his card has been unusually quiet since 23:24. I notice when it is quiet. It is never quiet.', from: 'pantalone' },
        { if: (s) => s.acted('charge') > 0, go: 'card_alive' },
        { go: 'tone' },
      ],
      card_alive: [
        { m: 'Ah. No. It is buying things again. Welcome back, dear Tartaglia.', from: 'pantalone' },
        { go: 'tone' },
      ],
      tone: [
        { if: (s) => F(s).sig_tone === 'meek', go: 'tone_meek' },
        { if: (s) => F(s).sig_tone === 'bold', go: 'tone_bold' },
        { go: 'ask' },
      ],
      tone_meek: [
        { m: 'He apologised to me tonight. In writing. I am having it framed.', from: 'signora' },
        { m: 'he WHAT', from: 'scara' },
        { go: 'ask' },
      ],
      tone_bold: [
        { m: 'He told me to go to sleep. He is in a good mood. That is usually when he is most stupid.', from: 'signora' },
        { go: 'ask' },
      ],
      ask: [
        { m: "he's online. i can see him. eleventh. say something stupid so we know you didn't drown", from: 'scara' },
        { choice: [
          { t: 'Takes more than two of Signora\'s goons and a little water. 😁', fx: { set: { harb_c1: 'bold' } }, go: 'bold' },
          { t: 'Card works fine, Pantalone. Bill me.', fx: { set: { harb_c1: 'billme', harb_billme: true } }, go: 'billme' },
          { t: 'Sorry for the trouble, everyone.', fx: { set: { harb_c1: 'sorry' }, sus: { scara: 1 } }, go: 'sorry' },
          { t: '[Leave on read]', silent: true, fx: { set: { harb_c1: 'read' }, sus: { scara: 1 } }, go: 'read' },
        ] },
      ],
      bold: [
        { m: 'there he is', from: 'scara' },
        { m: 'Two of my people are in the infirmary, Tartaglia. One of them is still coughing up the harbor.', from: 'signora' },
        { m: '♪ splash, splash ♪', from: 'columbina' },
        cap,
        { go: 'kids' },
      ],
      billme: [
        { m: 'I always do, dear Tartaglia. I always do.', from: 'pantalone' },
        { m: 'he swam in the sea and the first thing he does is spend money. fishwife economics', from: 'scara' },
        { go: 'kids' },
      ],
      sorry: [
        { m: 'sorry?', from: 'scara' },
        { m: 'SORRY?', from: 'scara' },
        { m: 'who is this. who taught you that word. was it the funeral man', from: 'scara' },
        { m: 'Interesting.', from: 'signora' },
        { m: '♪ a strange little song tonight ♪', from: 'columbina' },
        { go: 'kids' },
      ],
      read: [
        { m: "he's reading. he left us on read. he's never read anything in his life", from: 'scara' },
        { m: 'He is tired. Swimming is tiring.', from: 'signora' },
        { go: 'kids' },
      ],
      kids: [
        { m: 'Now, now. Leave the boy be. His little brother and sister land in the morning. I arranged it all myself.', from: 'pulci' },
        { if: (s) => F(s).fatui_pickup, go: 'kids_driver' },
        { go: 'kids_doc' },
      ],
      kids_driver: [
        { m: 'And my driver will meet them at arrivals with a little sign. Such a pleasure to be useful.', from: 'pulci' },
        { go: 'kids_doc' },
      ],
      kids_doc: [
        { m: 'Yes. I am so looking forward to meeting the youngest.', from: 'dottore' },
        { m: 'No, you are not.', from: 'arle' },
        { m: 'unrelated. my new marionette finished reading tartaglia\'s expense reports. it has asked to be switched off', from: 'sandrone' },
        { choice: [
          { t: 'Stay away from my brother, Doctor.', fx: { set: { harb_warned_dottore: true } }, go: 'warn' },
          { t: '😁⚔️', go: 'teeth' },
          { t: 'Thank you for arranging the trip, Pulcinella!', fx: { set: { harb_thanked_pulci: true }, sus: { pulci: 1 } }, go: 'thanks' },
          { t: '[Say nothing]', silent: true, go: 'quiet' },
        ] },
      ],
      warn: [
        { m: 'Seconded.', from: 'arle' },
        cap,
        { m: 'Tartaglia, you wound me. I only want a little blood.', from: 'dottore' },
        { go: 'close' },
      ],
      teeth: [
        { m: "that's not an answer. that's a threat with teeth", from: 'scara' },
        { m: 'I accept it as a threat.', from: 'dottore' },
        { go: 'close' },
      ],
      thanks: [
        { m: 'Oh! My boy. Thanking me, in front of everyone. I shall have it framed beside your brother\'s drawing.', from: 'pulci' },
        { m: 'he THANKED someone. the eleventh. out loud. write down the date', from: 'scara' },
        { go: 'close' },
      ],
      quiet: [
        { m: 'Silence is also an answer, Doctor.', from: 'arle' },
        { go: 'close' },
      ],
      close: [
        { m: 'Enough. This channel is for the Tsaritsa\'s business.', from: 'pierro' },
        { m: 'Tartaglia. Your authorization is due before Sunday ends. Be ready.', from: 'pierro' },
        cap,
        free('harb', 'harb_chat'),
      ],
      x: [free('harb', 'harb_chat')],
    },
  });

  // ── 2. Someone pings Unit 3 in Find My (any time) ────────────────
  scene({
    id: 'harb_unit3',
    thread: 'harb',
    trigger: { on: 'act', act: 'findmy_view', match: (p) => String((p && (p.id || p.art)) || '') === 'unit3', delay: 25 },
    when: alive,
    nodes: {
      start: waitFor('harb', 'harb_unit3', 'go'),
      go: [
        lock('harb', 'harb_unit3'),
        { m: 'who just pinged unit 3', from: 'sandrone' },
        { m: "it was the eleventh's phone. he looked up my resonator in FIND MY. like a pair of earbuds", from: 'sandrone' },
        { m: 'stop touching my resonators. unit 3 is the good one. it is sitting on G-17 being beautiful', from: 'sandrone' },
        { m: 'Curiosity is not one of your duties, Tartaglia.', from: 'signora' },
        { choice: [
          { t: "It's my project. I'll look at what I want.", fx: { set: { harb_unit3: 'mine' } }, go: 'mine' },
          { t: "Just checking it's still there 😁", fx: { set: { harb_unit3: 'check' } }, go: 'check' },
          { t: 'What does it actually do?', fx: { set: { harb_unit3: 'ask' }, sus: { sandrone: 1 } }, go: 'ask' },
        ] },
      ],
      mine: [
        { m: 'It was your project.', from: 'signora' },
        { m: 'it was never your resonator', from: 'sandrone' },
        free('harb', 'harb_unit3'),
      ],
      check: [
        { m: "it's there. it's humming. leave it alone", from: 'sandrone' },
        { m: '♪ hmmmmm… it hums like a sleeping thing ♪', from: 'columbina' },
        free('harb', 'harb_unit3'),
      ],
      ask: [
        { m: 'you PITCHED it', from: 'sandrone' },
        { m: "it wakes the sea. it's in the name. osial. sea thing. are you concussed", from: 'sandrone' },
        { m: 'He went swimming last night. Perhaps he left something in the water.', from: 'signora' },
        free('harb', 'harb_unit3'),
      ],
    },
  });

  // ── 3. The Rite of Parting (ch5 +200 ≈ 11:00 Sunday) ─────────────
  scene({
    id: 'harb_rite',
    thread: 'harb',
    ch: 'sun_rite',
    trigger: { on: 'chapter', ch: 'sun_rite', delay: 200 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('harb', 'harb_rite', 'go'),
      go: [
        lock('harb', 'harb_rite'),
        { m: 'Today Liyue buries its god. No one at this table will embarrass the Tsaritsa. Scaramouche.', from: 'pierro' },
        { m: "i haven't said anything", from: 'scara' },
        { m: 'Yet.', from: 'pierro' },
        { m: '♪ the dragon sleeps, the dragon sleeps, the whole harbor sings him down ♪', from: 'columbina' },
        { m: 'Liyue\'s public debt to Northland as of this morning: ℳ1.2 billion. As of 16:00 this afternoon: considerably less. Some funerals are cheaper than others.', from: 'pantalone' },
        { m: 'There is no body, I am told. A shame. I would have liked to see what a god leaves behind.', from: 'dottore' },
        { m: 'There is a ceremony, Dottore. And at 16:00 there is a contract. I will be at the Golden House. Tartaglia will not.', from: 'signora' },
        { m: "i'm watching the stream. the eleventh's funeral man is running the whole thing", from: 'scara' },
        { m: 'he looks bored. he looks like a man attending his own funeral and finding the catering adequate', from: 'scara' },
        { if: knowsGod, go: 'irony' },
        { go: 'say' },
      ],
      irony: [
        { m: '♪ he looks very well, for a dead thing ♪', from: 'columbina' },
        { go: 'say' },
      ],
      say: [
        { choice: [
          { t: "He'd have hated the fireworks.", fx: { set: { harb_rite: 'fireworks' } }, go: 'fireworks' },
          { t: 'Somebody should challenge the coffin to a duel. Just to be sure. ⚔️', fx: { set: { harb_rite: 'duel' } }, go: 'duel' },
          { t: "Maybe he's not as dead as you think.", if: knowsGod, fx: { set: { harb_rite: 'hint' } }, go: 'hint' },
          { t: 'May he rest well.', fx: { set: { harb_rite: 'rest' }, sus: { scara: 1 } }, go: 'rest' },
        ] },
      ],
      fireworks: [
        { m: 'how would you know what a dead god hates', from: 'scara' },
        { m: 'Tartaglia has spent six months at a funeral parlor. He has opinions now.', from: 'signora' },
        { go: 'close' },
      ],
      duel: [
        { m: 'finally something i would watch', from: 'scara' },
        { m: 'Tartaglia. You will not go near the Rite.', from: 'pierro' },
        cap,
        { go: 'close' },
      ],
      rest: [
        { m: '"may he rest well"', from: 'scara' },
        { m: 'are you a florist now. did the funeral man give you a pamphlet', from: 'scara' },
        { go: 'close' },
      ],
      hint: [
        { m: '…', from: 'signora' },
        { m: 'Explain.', from: 'signora' },
        { choice: [
          { t: "Joking. Gods don't come back. Even I know that.", fx: { sus: { signora: 1 } }, go: 'walkback' },
          { t: 'Ask his funeral consultant.', fx: { set: { morax_sold: true, harb_sold_zl: true } }, go: 'sold' },
          { t: '[Say nothing]', silent: true, go: 'hint_quiet' },
        ] },
      ],
      walkback: [
        { m: 'Do not joke about the Tsaritsa\'s business on the Tsaritsa\'s channel.', from: 'signora' },
        { go: 'close' },
      ],
      hint_quiet: [
        { m: 'I will take your silence as a joke. This time.', from: 'signora' },
        { go: 'close' },
      ],
      sold: [
        { typing: 4, from: 'signora' },
        { m: '…Interesting.', from: 'signora' },
        { m: 'Oh, I will ask him. I will ask him very carefully.', from: 'dottore' },
        { m: '♪ oh no… oh no, little fish, what did you sing ♪', from: 'columbina' },
        { m: 'Tartaglia.', from: 'arle' },
        { m: 'That was not yours to give.', from: 'arle' },
        { go: 'close' },
      ],
      close: [
        cap,
        free('harb', 'harb_rite'),
      ],
      x: [free('harb', 'harb_rite')],
    },
  });

  // ── 4. Sunday 23:15: the table hears what happened at Guyun ──────
  scene({
    id: 'harb_sunday',
    thread: 'harb',
    ch: 'sun_night',
    trigger: { on: 'time', at: '+2 23:15' },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('harb', 'harb_sunday', 'go'),
      go: [
        lock('harb', 'harb_sunday'),
        { if: (s) => F(s).osial_sent, go: 'sent' },
        { if: stopped, go: 'stopped' },
        { go: 'scape' },
      ],
      sent: [
        { m: 'Osial wakes. The Eleventh has done his duty.', from: 'pierro' },
        cap,
        { m: '♪ the stone forest is singing… a very old song… you woke it, little fish ♪', from: 'columbina' },
        { m: 'unit 3 output at 140%. i am a genius. the sea is very loud', from: 'sandrone' },
        { m: 'good boy', from: 'scara' },
        { m: 'There are children on that harbor, Tartaglia.', from: 'arle' },
        { m: 'Three million Mora, well spent. I think.', from: 'pantalone' },
        { go: 'end' },
      ],
      stopped: [
        { m: 'unit 3 is offline', from: 'sandrone' },
        { if: (s) => F(s).ops_sabotage, go: 'st_ice' },
        { go: 'st_qixing' },
      ],
      st_ice: [
        { m: "it's… encased in ice? someone froze my resonator. there are little feathers in the ice. cicin feathers", from: 'sandrone' },
        { m: 'units 1 and 2 are scorched. one of them smells of pelmeni. I WANT NAMES', from: 'sandrone' },
        { go: 'st_qixing' },
      ],
      st_qixing: [
        { if: (s) => F(s).leaked_yelan, go: 'st_yelan' },
        { go: 'st_ning' },
      ],
      st_yelan: [
        { m: 'The Millelith boarded Sea Lantern Logistics\' boats at 22:50. They had the pillar numbers. Someone talked.', from: 'signora' },
        { go: 'st_ning' },
      ],
      st_ning: [
        { if: (s) => F(s).leaked_ning, go: 'st_ning2' },
        { go: 'st_card' },
      ],
      st_ning2: [
        { m: 'The Jade Chamber revoked Sea Lantern\'s harbor permits at 22:40, citing "mourning regulations". Ningguang does not do mourning. Ningguang does leverage.', from: 'pantalone' },
        { go: 'st_card' },
      ],
      st_card: [
        { if: (s) => F(s).card_frozen, go: 'st_card2' },
        { go: 'st_zl' },
      ],
      st_card2: [
        { m: 'And the OSIAL/PH3 wire did not release. The signatory\'s card is frozen. Three million Mora are sitting in the cold.', from: 'pantalone' },
        { m: 'I find I have feelings about this. I do not usually have feelings.', from: 'pantalone' },
        { go: 'st_zl' },
      ],
      st_zl: [
        { if: (s) => F(s).zl_amended, go: 'st_zl2' },
        { go: 'st_founder' },
      ],
      st_zl2: [
        { m: '♪ the sea turned over and went back to sleep… like somebody very old sang to it ♪', from: 'columbina' },
        { m: 'The contract was honoured to the letter. I read it again tonight. There is a line in the margin, in ink. I do not remember agreeing to ink.', from: 'signora' },
        { go: 'st_founder' },
      ],
      st_founder: [
        { if: (s) => F(s).osial_founder, go: 'st_founder2' },
        { go: 'st_end' },
      ],
      st_founder2: [
        { m: 'He told me to "ask the founder". The founder is dead. I attended the funeral.', from: 'signora' },
        { m: '♪ did you, though? ♪', from: 'columbina' },
        { go: 'st_end' },
      ],
      st_end: [
        { m: 'Tartaglia. We will speak tomorrow.', from: 'signora' },
        { m: 'The Tsaritsa will be informed.', from: 'pierro' },
        { go: 'end' },
      ],
      scape: [
        { if: (s) => F(s).osial_fake, go: 'scape_fake' },
        { go: 'scape2' },
      ],
      scape_fake: [
        { m: 'The code Tartaglia sent me was fiction. Fortunately, I did not need it.', from: 'signora' },
        { go: 'scape2' },
      ],
      scape2: [
        { m: 'The wire released at 23:00. The contractors have their override, and every page of it bears Tartaglia\'s name.', from: 'signora' },
        { m: "unit 3 at 60% on manual. it's grinding. it sounds like it hates me", from: 'sandrone' },
        { m: '♪ the sea is having a bad dream ♪', from: 'columbina' },
        { m: 'so you said no and she did it anyway. with your name on it. classic', from: 'scara' },
        { m: "you're the most famous man in liyue tonight, eleventh. not in a good way", from: 'scara' },
        { m: 'The Tsaritsa will be informed. Of everything.', from: 'pierro' },
        { go: 'end' },
      ],
      end: [cap, free('harb', 'harb_sunday')],
      x: [free('harb', 'harb_sunday')],
    },
  });

  // ── 5. Monday: Pierro's edict (ch7 +450 ≈ 11:40) ─────────────────
  scene({
    id: 'harb_monday',
    thread: 'harb',
    ch: 'mon',
    trigger: { on: 'chapter', ch: 'mon', delay: 450 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('harb', 'harb_monday', 'go'),
      go: [
        lock('harb', 'harb_monday'),
        { if: (s) => F(s).defected, go: 'defect' },
        { if: recalled, go: 'recall' },
        { go: 'stay' },
      ],
      defect: [
        { m: 'The Eleventh has resigned.', from: 'pierro' },
        { m: 'Resignation is not a word this table uses. It will be recorded as a vacancy.', from: 'pierro' },
        { m: 'Run, then. Liyue is a small city.', from: 'signora' },
        { m: 'Oh, my boy. Your mother will be so worried.', from: 'pulci' },
        { m: 'he QUIT? the eleventh quit? that is the most interesting thing he has ever done. i almost respect it', from: 'scara' },
        { m: 'Good.', from: 'arle' },
        { m: '♪ the little fish swam out through the net… ♪', from: 'columbina' },
        { go: 'audit' },
      ],
      recall: [
        { m: 'By order of the Tsaritsa: Tartaglia returns to Zapolyarny. The 18:00 ferry from Liyue Harbor. The table will discuss Liyue in his presence.', from: 'pierro' },
        cap,
        { m: 'I will be on the pier to wave.', from: 'signora' },
        { m: 'Do drop by the laboratory on arrival. Your readings are now four weeks late.', from: 'dottore' },
        { m: 'see you in snezhnaya, fishwife. bring a coat. bring two', from: 'scara' },
        { m: 'Your mother will be so pleased to have you closer, my boy.', from: 'pulci' },
        { go: 'audit' },
      ],
      stay: [
        { m: 'The Liyue matter is closed. The Tsaritsa has what she required. Tartaglia remains in Liyue.', from: 'pierro' },
        cap,
        { m: 'For now.', from: 'signora' },
        { m: "boo. i wanted to watch him get dragged up the gangplank", from: 'scara' },
        { go: 'audit' },
      ],
      audit: [
        { m: 'A note before we close the weekend. Tartaglia\'s card, Friday to Monday:', from: 'pantalone' },
        { if: (s) => num(s, 'paimon_total') > 0, go: 'au_paimon' },
        { go: 'au_tea' },
      ],
      au_paimon: [
        { m: '• Dumplings, noodles and "everything on the menu" for a "Paimon". I still do not know who Paimon is. I suspect she is a liability.', from: 'pantalone' },
        { go: 'au_tea' },
      ],
      au_tea: [
        { if: (s) => F(s).bought_teaset, go: 'au_tea2' },
        { go: 'au_freeze' },
      ],
      au_tea2: [
        { m: '• One celadon tea set, Guizhong era. For xiansheng, I assume. Forty-two.', from: 'pantalone' },
        { go: 'au_freeze' },
      ],
      au_freeze: [
        { if: (s) => F(s).card_frozen, go: 'au_freeze2' },
        { go: 'au_bill' },
      ],
      au_freeze2: [
        { m: '• One freeze. The most expensive thing anyone at this table has ever done, and it cost nothing. I am almost impressed.', from: 'pantalone' },
        { go: 'au_bill' },
      ],
      au_bill: [
        { if: (s) => F(s).harb_billme, go: 'au_bill2' },
        { go: 'au_end' },
      ],
      au_bill2: [
        { m: '• "Bill me," he said on Friday. I have.', from: 'pantalone' },
        { go: 'au_end' },
      ],
      au_end: [
        { m: 'Thank you, colleagues. That is all.', from: 'pantalone' },
        { choice: [
          { t: "It's been fun. Mostly. 🐟", if: (s) => !F(s).defected, fx: { set: { harb_last: 'fun' } }, go: 'bye_fun' },
          { t: 'See you at the next meeting. I\'ll bring fish. 🐟', if: (s) => !F(s).defected, fx: { set: { harb_last: 'fish' } }, go: 'bye_fish' },
          { t: '[Leave the conversation]', if: (s) => !!F(s).defected, silent: true, fx: { set: { harb_last: 'left', left_harb: true } }, go: 'leave' },
          { t: 'Goodbye, everyone. Thank you for everything.', fx: { set: { harb_last: 'thanks' }, sus: { scara: 1 } }, go: 'bye_thanks' },
          { t: '[Say nothing]', silent: true, fx: { set: { harb_last: 'silent' } }, go: 'bye_silent' },
        ] },
      ],
      bye_fun: [
        { m: 'mostly', from: 'scara' },
        cap,
        free('harb', 'harb_monday'),
      ],
      bye_fish: [
        { m: 'if you bring a fish to a meeting i will leave the table. permanently', from: 'scara' },
        { m: '♪ bring the fish, bring the fish ♪', from: 'columbina' },
        cap,
        free('harb', 'harb_monday'),
      ],
      bye_thanks: [
        { m: '"thank you for everything"', from: 'scara' },
        { m: "he's been weird all weekend. i'm just saying it. somebody check his teeth", from: 'scara' },
        free('harb', 'harb_monday'),
      ],
      bye_silent: [
        { m: 'Silence. Finally, a Harbinger\'s answer.', from: 'arle' },
        free('harb', 'harb_monday'),
      ],
      leave: [
        { sys: 'You left the conversation.' },
        free('harb', 'harb_monday'),
      ],
      x: [free('harb', 'harb_monday')],
    },
  });

  // ── Pantalone watches every Mora ─────────────────────────────────
  const amt = (p) => Math.abs(Number((p && p.amount) || 0));
  const dayKey = (ms) => { const d = new Date(ms); return 'spent_' + d.getFullYear() + '_' + (d.getMonth() + 1) + '_' + d.getDate(); };
  S.onAct({ id: 's2_pant_big', act: 'charge', arc: 'osial', match: (p) => amt(p) > 10000, fx: { sus: { pantalone: 1 } } });
  S.onAct({ id: 's2_pant_big_msg', act: 'charge', arc: 'osial', match: (p) => amt(p) > 10000, start: 'pant_spend', delay: 25, once: true });
  S.onAct({
    id: 's2_pant_day', act: 'charge', arc: 'osial',
    fx: (p, s) => {
      const k = dayKey(s.now);
      const before = Number(s.flags[k] || 0);
      const out = { inc: { [k]: amt(p) } };
      if (before <= 25000 && before + amt(p) > 25000) { out.sus = { pantalone: 1 }; out.set = { pant_daily: true }; }
      return out;
    },
  });
  S.onAct({ id: 's2_pant_thaw', act: 'card_freeze', arc: 'osial', match: (p) => p && p.on === false, start: 'pant_thaw', delay: 20, once: true });
  S.onAct({ id: 's2_pant_transfer', act: 'transfer', arc: 'osial', start: 'pant_transfer', delay: 30, once: true });
  S.onAct({ id: 's2_pant_wire', act: 'statement_view', arc: 'osial', match: (p) => String((p && (p.id || p.art)) || '') === 'osial', start: 'pant_wire', delay: 20, once: true });
  S.onAct({ id: 's2_sig_intranet', act: ['visit', 'login'], arc: 'osial', match: (p) => /intranet\.northland\.sn\/.*osial/i.test(String((p && p.url) || '')), start: 'sig_intranet', delay: 40, once: true });

  // a big purchase
  scene({
    id: 'pant_spend',
    thread: 'pantalone',
    trigger: { on: 'manual' },
    when: alive,
    nodes: {
      start: waitFor('pantalone', 'pant_spend', 'go'),
      go: [
        lock('pantalone', 'pant_spend'),
        { m: 'Dear Tartaglia. A five-figure sum has just left your card.' },
        { if: (s) => F(s).bought_teaset, go: 'tea' },
        { m: 'I do not know what you bought. I know what it cost. That is the only kind of knowing I require.' },
        { go: 'ask' },
      ],
      tea: [
        { m: 'Antique porcelain. Celadon. Guizhong era, the listing says. Five figures for a cup that somebody else has already been using for three thousand years.' },
        { m: 'If it is an investment, I approve. If it is a gift, I am deeply curious.' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: "It's an investment. Trust me 😁", fx: { set: { pant_spend: 'invest' } }, go: 'invest' },
          { t: 'Bill me.', fx: { set: { pant_spend: 'bill', harb_billme: true } }, go: 'bill' },
          { t: "Sorry, I'll be more careful with the money.", fx: { set: { pant_spend: 'sorry' }, sus: { pantalone: 2 } }, go: 'sorry' },
          { t: '[Leave on read]', silent: true, fx: { set: { pant_spend: 'read' } }, go: 'read' },
        ] },
      ],
      invest: [
        { m: 'You have said that about every fishing rod you have ever bought. You own nineteen.' },
        free('pantalone', 'pant_spend'),
      ],
      bill: [
        { m: 'I always do, dear Tartaglia.' },
        free('pantalone', 'pant_spend'),
      ],
      sorry: [
        { typing: 3 },
        { m: '…Careful?' },
        { m: 'You have never once in your life been careful with money. You buy fish their own aquarium.' },
        { m: 'I am going to look at this account very closely for the rest of the weekend.' },
        free('pantalone', 'pant_spend'),
      ],
      read: [
        { m: 'Silence. The most expensive answer.' },
        free('pantalone', 'pant_spend'),
      ],
    },
  });

  // more than ℳ25,000 in one day
  scene({
    id: 'pant_day',
    thread: 'pantalone',
    trigger: { on: 'act', act: 'charge', delay: 20 },
    when: (s) => alive(s) && !!F(s).pant_daily,
    retry: true,
    nodes: {
      start: waitFor('pantalone', 'pant_day', 'go'),
      go: [
        lock('pantalone', 'pant_day'),
        { m: 'Dear Tartaglia. More than twenty-five thousand Mora in a single day. Even for you, this is festive.' },
        { if: (s) => num(s, 'paimon_total') > 3000, go: 'paimon' },
        { m: 'I have flagged the account. Not for fraud. For wonder.' },
        free('pantalone', 'pant_day'),
      ],
      paimon: [
        { m: 'A great deal of it appears to have been eaten.' },
        free('pantalone', 'pant_day'),
      ],
    },
  });

  // Paimon's appetite reaches the Ninth Harbinger
  scene({
    id: 'pant_paimon',
    thread: 'pantalone',
    trigger: { on: 'act', act: 'order', delay: 30 },
    when: (s) => alive(s) && num(s, 'paimon_total') >= 5000,
    retry: true,
    nodes: {
      start: waitFor('pantalone', 'pant_paimon', 'go'),
      go: [
        lock('pantalone', 'pant_paimon'),
        { m: 'Dear Tartaglia. Your account has purchased a remarkable quantity of food for someone called "Paimon".' },
        { m: 'Is she an asset? Please advise. I would like to know what she is worth before she eats it.' },
        { choice: [
          { t: "She's emergency food. Long story 😁", fx: { set: { pant_paimon: 'food' } }, go: 'food' },
          { t: 'She is a very dear friend and I like to treat her.', fx: { set: { pant_paimon: 'dear' }, sus: { pantalone: 1 } }, go: 'dear' },
          { t: 'Bill me.', fx: { set: { pant_paimon: 'bill', harb_billme: true } }, go: 'bill' },
        ] },
      ],
      food: [
        { m: 'Emergency food. I see. And how many emergencies does she have per day?' },
        { m: 'Do not answer that. I can see the receipts.' },
        free('pantalone', 'pant_paimon'),
      ],
      dear: [
        { m: '"A very dear friend." "Treat."' },
        { m: 'You write like a greeting card this weekend, dear Tartaglia. It is unsettling.' },
        free('pantalone', 'pant_paimon'),
      ],
      bill: [
        { m: 'I already have. She is now a line item. "Paimon (misc.)".' },
        free('pantalone', 'pant_paimon'),
      ],
    },
  });

  // money sent home
  scene({
    id: 'pant_transfer',
    thread: 'pantalone',
    trigger: { on: 'manual' },
    when: alive,
    nodes: {
      start: waitFor('pantalone', 'pant_transfer', 'go'),
      go: [
        lock('pantalone', 'pant_transfer'),
        { m: 'Dear Tartaglia. I noticed a transfer. I notice every transfer.' },
        { m: 'Sentiment is so very expensive. I have always admired that you pay for it anyway.' },
        { m: 'I will not ask. I will note that I didn\'t.' },
        free('pantalone', 'pant_transfer'),
      ],
    },
  });

  // looking at the OSIAL/PH3 wire
  scene({
    id: 'pant_wire',
    thread: 'pantalone',
    trigger: { on: 'manual' },
    when: alive,
    nodes: {
      start: waitFor('pantalone', 'pant_wire', 'go'),
      go: [
        lock('pantalone', 'pant_wire'),
        { m: 'Dear Tartaglia. You are looking at OSIAL/PH3. I can see you looking. The corporate account tells me when someone opens it, the way a cat tells you when someone opens the fridge.' },
        { m: 'Three million Mora to Sea Lantern Logistics, Sunday at 23:00. Is there a problem?' },
        { choice: [
          { t: 'Cancel it.', fx: { set: { pant_wire: 'cancel', knows_freeze_rule: true } }, go: 'cancel' },
          { t: 'Just admiring my signature 😁', fx: { set: { pant_wire: 'admire' } }, go: 'admire' },
          { t: 'What happens at 23:00 exactly?', fx: { set: { pant_wire: 'ask', knows_freeze_rule: true }, sus: { pantalone: 1 } }, go: 'ask' },
          { t: '[Leave on read]', silent: true, fx: { set: { pant_wire: 'read' } }, go: 'read' },
        ] },
      ],
      cancel: [
        { m: 'I cannot. It is Signora\'s signal, and your signature. Only two things stop that wire: Signora\'s word, or the signatory\'s card being frozen.' },
        { m: 'And you would never freeze your own card, dear Tartaglia. You love spending far too much.' },
        { m: 'Would you?' },
        free('pantalone', 'pant_wire'),
      ],
      admire: [
        { m: 'It is a very confident signature. It slopes upward. People whose signatures slope upward are optimists, or arsonists.' },
        free('pantalone', 'pant_wire'),
      ],
      ask: [
        { m: 'You pitched this project, dear Tartaglia. You should know.' },
        { m: 'At 23:00 the money goes to the contractors, and the contractors go to the pillars. Unless the signatory\'s card is frozen, in which case the money goes nowhere and I go to bed unhappy.' },
        { m: 'Are you feeling quite well?' },
        free('pantalone', 'pant_wire'),
      ],
      read: [
        { m: 'Looking, and not talking. That is how I would do it too.' },
        free('pantalone', 'pant_wire'),
      ],
    },
  });

  // the card is frozen (bank app, or a scene) → Pantalone within the minute, Signora within two
  scene({
    id: 'pant_freeze',
    thread: 'pantalone',
    trigger: { on: 'flag', flag: 'card_frozen', delay: 45 },
    when: alive,
    nodes: {
      start: waitFor('pantalone', 'pant_freeze', 'go'),
      go: [
        lock('pantalone', 'pant_freeze'),
        { if: (s) => !F(s).card_frozen, go: 'already' },
        { m: 'Dear Tartaglia.' },
        { m: 'You have frozen your card.' },
        { m: 'In doing so you have frozen OSIAL/PH3. Three million Mora are now sitting in the cold, like one of your fish.' },
        { choice: [
          { t: 'Lost my wallet on the pier. Safety first 😁', fx: { set: { freeze_excuse: 'wallet' } }, go: 'wallet' },
          { t: 'I froze it. Leave it frozen.', fx: { set: { freeze_excuse: 'defiant' } }, go: 'defiant' },
          { t: "Oops, sorry! I'll unfreeze it.", fx: { set: { freeze_excuse: 'oops' }, sus: { pantalone: 2 } }, go: 'oops' },
          { t: '[Leave on read]', silent: true, fx: { set: { freeze_excuse: 'read' } }, go: 'read' },
        ] },
      ],
      already: [
        { m: 'Dear Tartaglia. Your card was frozen for a little while. It is warm again. I aged a year.' },
        free('pantalone', 'pant_freeze'),
      ],
      wallet: [
        { m: 'Your wallet. On the pier. Where you went swimming, I am told.' },
        { m: 'How fortunate that the only payment your lost wallet could have made is the one Signora wanted most.' },
        { m: 'I believe you completely. I am writing that down so that I remember I said it.' },
        free('pantalone', 'pant_freeze'),
      ],
      defiant: [
        { m: 'Then I shall note that you did. In ink.' },
        { m: 'Signora will notice within the minute. I would not want to be your phone.' },
        free('pantalone', 'pant_freeze'),
      ],
      oops: [
        { m: '"Oops"?' },
        { m: 'You have never said "oops" in your life. You say "ha!" and then something is on fire.' },
        free('pantalone', 'pant_freeze'),
      ],
      read: [
        { m: 'Very well. The money and I will wait together, in the cold.' },
        free('pantalone', 'pant_freeze'),
      ],
    },
  });

  scene({
    id: 'pant_thaw',
    thread: 'pantalone',
    trigger: { on: 'manual' },
    when: alive,
    nodes: {
      start: waitFor('pantalone', 'pant_thaw', 'go'),
      go: [
        lock('pantalone', 'pant_thaw'),
        { m: 'Thank you, dear Tartaglia. The money is warm again.' },
        { if: (s) => s.now < at('+2 23:00'), go: 'before' },
        { m: 'A little late for OSIAL/PH3, of course. But the dumpling budget is very relieved.' },
        free('pantalone', 'pant_thaw'),
      ],
      before: [
        { m: 'OSIAL/PH3 will release on time, Sunday at 23:00. Everything is as it should be.' },
        free('pantalone', 'pant_thaw'),
      ],
    },
  });

  scene({
    id: 'sig_freeze',
    thread: 'signora',
    trigger: { on: 'flag', flag: 'card_frozen', delay: 100 },
    when: alive,
    nodes: {
      start: waitFor('signora', 'sig_freeze', 'go'),
      go: [
        { if: (s) => !F(s).card_frozen, go: 'skip' },
        lock('signora', 'sig_freeze'),
        { m: 'You froze your card.' },
        { m: 'How childish. How very effective.' },
        { m: 'Unfreeze it, Tartaglia. Or I will come to you, and I do not knock.' },
        { choice: [
          { t: 'Make me.', fx: { set: { sig_freeze: 'make' } }, go: 'make' },
          { t: 'Lost my wallet. Tragic 😁', fx: { set: { sig_freeze: 'wallet' } }, go: 'wallet' },
          { t: "Okay, okay. I'll unfreeze it.", fx: { set: { sig_freeze: 'cave' }, sus: { signora: 2 } }, go: 'cave' },
          { t: '[Leave on read]', silent: true, fx: { set: { sig_freeze: 'read' } }, go: 'read' },
        ] },
      ],
      make: [
        { m: 'I intend to.' },
        free('signora', 'sig_freeze'),
      ],
      wallet: [
        { m: 'Then I hope it was not the only thing you lost on that pier.' },
        free('signora', 'sig_freeze'),
      ],
      cave: [
        { typing: 3 },
        { m: '"Okay, okay."' },
        { m: 'Tartaglia has never given in to me twice in one breath. Not in two years.' },
        { m: 'I will watch the account. And I will watch you.' },
        free('signora', 'sig_freeze'),
      ],
      read: [
        { m: 'Your silence is noted. So is your card.' },
        free('signora', 'sig_freeze'),
      ],
      skip: [{ end: true }],
    },
  });

  // logging into the intranet himself (he never does; he has Ekaterina)
  scene({
    id: 'sig_intranet',
    thread: 'signora',
    trigger: { on: 'manual' },
    when: alive,
    nodes: {
      start: waitFor('signora', 'sig_intranet', 'go'),
      go: [
        lock('signora', 'sig_intranet'),
        { fx: { sus: { signora: 1 } } },
        { m: 'You logged into the intranet and opened the Osial protocol.' },
        { m: 'You never log in. You have Ekaterina for that. You have never read a document longer than a menu.' },
        { choice: [
          { t: 'I can read, Signora.', fx: { set: { sig_intranet: 'read' } }, go: 'canread' },
          { t: "Ekaterina's asleep. Unlike some people.", fx: { set: { sig_intranet: 'ekat' } }, go: 'asleep' },
          { t: '[Leave on read]', silent: true, fx: { set: { sig_intranet: 'silent' } }, go: 'silent' },
        ] },
      ],
      canread: [
        { m: 'Then read page eleven. Signatory: Tartaglia. Countersignature: removed.' },
        free('signora', 'sig_intranet'),
      ],
      asleep: [
        { m: 'How considerate of you, to let her sleep. Is that new?' },
        free('signora', 'sig_intranet'),
      ],
      silent: [
        { m: 'Read it twice. It does not get better.' },
        free('signora', 'sig_intranet'),
      ],
    },
  });

  // ── The Balladeer's Gossip (sus.scara ≥ 8, or the bluefin quiz failed twice) ──
  scene({
    id: 'caught_scara',
    thread: 'scara',
    trigger: { on: 'sus', who: 'scara', at: 8 },
    when: alive,
    nodes: {
      start: [
        { typing: 3 },
        { m: "ok. i'm done pretending i haven't noticed" },
        { if: (s) => num(s, 'scara_quiz_fail') >= 2, go: 'quiz' },
        { m: "you don't call me fishwife back. you use full stops. you've been POLITE" },
        { go: 'more' },
      ],
      quiz: [
        { m: "you don't know what you sent me for my birthday. you don't know its NAME" },
        { m: 'the eleventh would die before he forgot that fish. he talks about it at every meeting. every. meeting' },
        { go: 'more' },
      ],
      more: [
        { m: 'the eleventh has never once in his life been careful. you are being so careful' },
        { m: 'whoever you are: thank you. this is the best weekend i have had in years' },
        { m: 'attention, table', th: 'harb', from: 'scara' },
        { m: "the eleventh's phone has a tourist in it", th: 'harb', from: 'scara' },
        { m: "it's been playing him since friday. badly. i have screenshots. i have SO many screenshots", th: 'harb', from: 'scara' },
        { m: 'Thank you, Scaramouche. We will collect it.', th: 'harb', from: 'signora' },
        { m: 'Oh dear. Oh dear, oh dear.', th: 'harb', from: 'pulci' },
        { react: 'like', from: 'capitano', on: 'them', th: 'harb' },
        { m: '♪ a stranger in the shell ♪', th: 'harb', from: 'columbina' },
        { m: "run, tourist. it's more fun if you run" },
        { wait: 4 },
        { ending: 'caught_scara' },
      ],
    },
  });
})();
