/* "Sunday at Lotus Pier" — family: Wei Wuxian, the voice memo "Untitled 14", A-Jie's thread, group `fam`.
   Everything here answers one question: who sits at Jin Ling's 18th on Sunday, and what is in the pot.
   Table flags set here (docs/SUNDAY.md, docs/sunday/a.md): wwx_invited, wwx_maybe, burned, told_recipe,
   soup_practiced, wwx_thanked, ajie_wrote, wn_invited (via Wei Wuxian), zidian (caught_total → zidian_fall).
   Consequence scene owned here: burned_after. Facts: docs/STORY.md. Format: docs/DEV.md "Story engine". */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => s.flags || {};
  const night = (s) => !F(s).night_done;
  // One scene with choices per thread at a time: poll until the thread is free, then hold it.
  // Night scenes give up quietly once the night is over (an 'off' node is added automatically).
  const waitFor = (k, next, self, anytime) => [
    ...(anytime ? [] : [{ if: (s) => !!F(s).night_done, go: 'off' }]),
    { if: (s) => !F(s)['busy_' + k], go: next },
    { wait: 6 },
    { go: self || 'start' },
  ];
  const usesOff = (nodes) => Object.keys(nodes).some((n) => (nodes[n] || []).some((st) => st && st.go === 'off'));
  const scene = (def) => {
    if (def.nodes && !def.nodes.off && usesOff(def.nodes)) def.nodes.off = [{ end: true }];
    return S.scene(def);
  };
  const lock = (k) => ({ fx: { set: { ['busy_' + k]: true } } });
  const free = (k) => ({ fx: { set: { ['busy_' + k]: false } } });
  const isMemo = (p) => !!p && p.id === 'memo14';
  const target = (p) => String((p && (p.to || p.thread)) || '');
  const canThank = (s) => !F(s).wwx_thanked && !F(s).memo_sent;
  // story.act('memo_share') already sets memo_sent before triggers fire, so the climax guards on its own flag.
  const climaxOk = (s) => !F(s).burned && !F(s).memo_climax;
  /** start a consequence scene another writer owns (it may not exist yet: warn instead of failing) */
  const goTo = (id) => ({ run: () => {
    if (!S.defs.scenes[id]) { console.warn('[sunday] consequence scene missing:', id); return; }
    if (!S.view().done[id]) S.start(id);
  } });
  /** optional one-liners in a row: each node plays its lines only if cond(s), then moves on */
  const chain = (prefix, items, next) => {
    const nodes = {};
    items.forEach((it, i) => {
      const to = i + 1 < items.length ? prefix + (i + 1) : next;
      nodes[prefix + i] = [{ if: (s) => !it.if(s), go: to }].concat(it.lines, [{ go: to }]);
    });
    return nodes;
  };
  const YES_LOG = { log: 'Told Wei Wuxian he could come home to Lotus Pier on Sunday', once: 'wwx:yes' };
  const YES_HINT = { hint: 'Wei Wuxian is coming home on Sunday.' };

  // The real thank-you, without the memo (for players who found out some other way).
  function thanksNodes() {
    return {
      thanks: [
        { m: 'for what?' },
        { m: "the soup? i haven't even brought it yet" },
        { choice: [
            { t: 'You know what for.', go: 'thanks_real' },
            { t: 'The liver.', go: 'thanks_real' },
            { t: 'For the soup.', go: 'thanks_soup' },
          ] },
      ],
      thanks_real: [
        { typing: 8 },
        { wait: 3 },
        { typing: 5 },
        { m: 'oh', d: 2 },
        { m: 'jiang cheng' },
        { m: "i told u two years ago. u don't owe me anything. u never answered so i thought maybe u were mad" },
        { m: "i didn't do it so u'd say thank you" },
        { m: "i did it because ur my brother. that's it. that's the whole reason" },
        { m: "and u never have to say it again. ok? i heard it. i'm keeping it" },
        { fx: { set: { wwx_thanked: true }, aff: { wwx: 3 } } },
        { log: 'Said thank you to Wei Wuxian. For 2008', once: 'wwx:thanks' },
        { hint: 'Wei Wuxian will remember that.' },
        { if: (s) => F(s).wwx_invited, go: 'thanks_end' },
        { m: 'so. sunday?' },
        { choice: [
            { t: 'Six-thirty. Bring the soup.', fx: { set: { wwx_invited: true }, aff: { wwx: 1 } }, go: 'thanks_yes' },
            { t: "Don't make it a thing.", go: 'thanks_thing' },
          ] },
      ],
      thanks_yes: [
        { m: '😭😭😭' },
        { m: "ok. i'm going home. i'm bringing her pot" },
        YES_LOG,
        YES_HINT,
        { go: 'thanks_end' },
      ],
      thanks_thing: [
        { m: "too late. it's a thing. it's the biggest thing" },
        { m: "i'll ask about sunday tomorrow. goodnight jiang cheng" },
        { fx: { set: { wwx_maybe: true, wwx_done: true } } },
        free('wwx'),
      ],
      thanks_end: [
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],
      thanks_soup: [
        { m: 'ur welcome??' },
        { m: 'weird. ok. goodnight' },
        free('wwx'),
      ],
    };
  }

  // ── 1. Sunday ────────────────────────────────────────────────────
  scene({
    id: 'wwx_sunday',
    thread: 'wwx',
    trigger: { on: 'unlock', delay: 12 },
    when: night,
    nodes: {
      start: waitFor('wwx', 'ask'),
      ask: [
        lock('wwx'),
        { m: 'ok' },
        { m: 'i know ur awake' },
        { m: 'u always read everything at midnight and then pretend u were asleep' },
        { m: 'last week i asked and then i said forget i asked and then i said dont forget i asked' },
        { m: "so. asking properly. i'm going to be serious for ONE (1) message. don't interrupt" },
        { typing: 7 },
        { wait: 2 },
        { m: 'can i come home on sunday', d: 3 },
        { m: "to lotus pier. for a-ling's birthday dinner. six-thirty, it says so on ur calendar with a question mark. a-ling showed me" },
        { m: "and i want to bring the soup. shijie's soup. lotus root and pork ribs" },
        { m: "i've been practicing. lan zhan says it's edible now" },
        { m: 'he didnt say that. he said "mn". but it was an encouraging mn' },
        { m: "i'll sit wherever. i'll sit outside. i'll sit next to FAIRY. that's how serious i am" },
        { m: 'ok that was more than one message' },
        { choice: [
            { t: "Fine. Six-thirty. Don't be late.", fx: { set: { wwx_invited: true }, aff: { wwx: 1 } }, go: 'yes' },
            { t: 'Why.', go: 'why' },
            { t: "Of course you can come!! I've missed you so much 🥺", fx: { set: { wwx_invited: true }, sus: { wwx: 4 }, aff: { wwx: 1 } }, go: 'sweet' },
            { t: 'No.', go: 'no' },
          ], timeout: 150, onTimeout: 'on_read' },
      ],

      yes: [
        { m: '!!!!!!!!!!!!!!!', d: 0.6 },
        { m: 'JIANG CHENG' },
        { m: "ok ok ok i'm calm" },
        { m: "i'm not calm. LAN ZHAN. I'M GOING HOME" },
        { m: "he says mn. he's smiling. u can't tell but he is. i can tell" },
        { m: "6:30. i'll be there at 6:29 and stand outside the gate for one minute so i'm not early" },
        { go: 'yes_tail' },
      ],
      yes_soft: [
        { m: 'wait', d: 0.6 },
        { m: 'wait wait wait' },
        { m: 'really?' },
        { m: 'jiang cheng really??' },
        { m: "ok. i'm bringing it in her pot. the big one with the chipped lid" },
        { m: "i took it when i left. it's the only thing i took" },
        { m: "i'm bringing it home" },
        { go: 'yes_tail' },
      ],
      yes_pot: [
        { m: 'ok', d: 2 },
        { m: "ok i'm crying. lan zhan is pretending he isn't" },
        { go: 'yes_tail' },
      ],
      yes_tail: [
        YES_LOG,
        YES_HINT,
        { m: 'wait' },
        { m: 'i need to see ur face when u say yes. hold on' },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
        { call: 'call_wwx_ft', delay: 5 },
      ],

      why: [
        { m: 'why??', d: 0.8 },
        { m: "because it's a-ling's 18th and i missed his 2nd through his 14th" },
        { m: "because it's been thirteen years" },
        { m: 'because shijie would have made the soup and somebody has to' },
        { typing: 4 },
        { m: "because it's home, jiang cheng" },
        { choice: [
            { t: '…Six-thirty. Bring the soup.', fx: { set: { wwx_invited: true }, aff: { wwx: 2 } }, go: 'yes_soft' },
            { t: "You'll burn it.", go: 'burn' },
            { t: 'You left. For thirteen years.', go: 'left' },
            { t: 'I need to think.', fx: { set: { wwx_maybe: true } }, go: 'think' },
          ] },
      ],
      burn: [
        { m: 'i burned the first four', img: 'p_soup_fail' },
        { m: 'the smoke alarm in the jingshi knows my name now' },
        { m: 'number five was edible tho', img: 'p_lotus_root_soup' },
        { m: 'lan zhan said "the fire is wrong" and then had two bowls. lan zhan has never had two bowls of anything in his life' },
        { choice: [
            { t: 'Then bring number five.', fx: { set: { wwx_invited: true }, aff: { wwx: 2 } }, go: 'yes_soft' },
            { t: 'A-Jie never burned it.', go: 'never_burned' },
            { t: "I'll think about it.", fx: { set: { wwx_maybe: true } }, go: 'think' },
          ] },
      ],
      never_burned: [
        { m: 'she did once' },
        { m: 'winter 2006. u had the flu and she was making it for u. she made me swear never to tell u' },
        { m: 'she laughed so hard she had to sit on the kitchen floor. then she made it again. u said it was the best one' },
        { m: "so. now u know. she'd want u to know" },
        { m: "she'd want me to bring it" },
        { choice: [
            { t: 'Six-thirty.', fx: { set: { wwx_invited: true }, aff: { wwx: 2 } }, go: 'yes_soft' },
            { t: 'You made that up.', fx: { aff: { wwx: 1 } }, go: 'made_up' },
            { t: 'I need to think.', fx: { set: { wwx_maybe: true } }, go: 'think' },
          ] },
      ],
      made_up: [
        { m: 'i did NOT. ask the pot' },
        { m: 'i still have the pot' },
        { go: 'pot' },
      ],
      pot: [
        { m: 'her pot. the big one with the chipped lid' },
        { m: "i took it when i left. it's the only thing i took" },
        { m: 'i want to bring it home' },
        { choice: [
            { t: 'Bring the pot. Six-thirty.', fx: { set: { wwx_invited: true }, aff: { wwx: 3 } }, go: 'yes_pot' },
            { t: 'I need to think.', fx: { set: { wwx_maybe: true } }, go: 'think' },
          ] },
      ],
      left: [
        { typing: 5 },
        { wait: 2 },
        { m: 'i know' },
        { m: "i know. i'm not asking u to pretend i didn't" },
        { m: "i'd do it so differently. i'd do almost all of it differently" },
        { m: "i just don't want to miss another one" },
        { choice: [
            { t: 'Six-thirty.', fx: { set: { wwx_invited: true }, aff: { wwx: 2 } }, go: 'yes_soft' },
            { t: 'You should have stayed gone.', fx: { set: { burned: true, wwx_hurt: true } }, go: 'burned' },
            { t: 'I know you would.', fx: { aff: { wwx: 1 } }, go: 'know' },
            { t: 'I need to think.', fx: { set: { wwx_maybe: true } }, go: 'think' },
          ] },
      ],
      know: [
        { typing: 3 },
        { m: '…' },
        { m: "that's the nicest thing u've said to me since 2023" },
        { m: 'including at my wedding. u said "the food is fine" and left before the toasts' },
        { go: 'pot' },
      ],

      no: [
        { typing: 4 },
        { wait: 3 },
        { m: 'ok', d: 0.5 },
        { m: "ok. that's fair" },
        { m: 'can i ask why' },
        { choice: [
            { t: 'You know why.', fx: { set: { wwx_hurt: true } }, go: 'know_why' },
            { t: 'You should have stayed gone.', fx: { set: { burned: true, wwx_hurt: true } }, go: 'burned' },
            { t: "…Not no. I don't know.", fx: { set: { wwx_maybe: true } }, go: 'not_no' },
            { t: '[Leave him on read]', silent: true, fx: { set: { wwx_hurt: true } }, go: 'read_no' },
          ] },
      ],
      know_why: [
        { m: 'yeah', d: 2 },
        { m: 'yeah i do' },
        { m: "ok. i'll make the soup anyway. i'll give a jar to wen ning and he can leave it at the gate. he's braver than me" },
        { m: 'goodnight jiang cheng' },
        { log: 'Told Wei Wuxian no. He is making the soup anyway', once: 'wwx:no' },
        { hint: 'Wei Wuxian will remember that.' },
        free('wwx'),
      ],
      not_no: [
        { m: '"not no"' },
        { m: "i'm writing that down" },
        { m: 'lan zhan is also writing it down. he has a notebook. there is a section for u' },
        { m: "ok. i'll ask again before sunday. u can say not no again. i'll take it" },
        { log: 'Told Wei Wuxian “not no”. Lan Wangji wrote it down', once: 'wwx:maybe' },
        free('wwx'),
      ],
      read_no: [
        { typing: 6 },
        { wait: 4 },
        { typing: 3 },
        { m: 'ok' },
        { log: 'Told Wei Wuxian no, then left him on read', once: 'wwx:no' },
        free('wwx'),
      ],
      think: [
        { m: 'ok' },
        { m: 'think. thinking is allowed' },
        { m: "i'll be here. i'm always here now" },
        { m: "that sounded like a threat. it's not. it's a radish fact" },
        { log: 'Told Wei Wuxian you would think about Sunday', once: 'wwx:maybe' },
        free('wwx'),
      ],
      on_read: [
        { m: 'ok. left on read. classic' },
        { m: 'i\'ll take it as a "not no"' },
        { fx: { set: { wwx_maybe: true } } },
        free('wwx'),
      ],

      sweet: [
        { typing: 4 },
        { m: '…' },
        { m: 'jiang cheng' },
        { m: 'are u drunk' },
        { m: 'u said MISSED. and u used the 🥺. that is MY emoji' },
        { m: 'did lan xichen say something on that balcony that broke ur brain' },
        { choice: [
            { t: 'Get lost.', go: 'sweet_lost' },
            { t: 'I meant it.', fx: { sus: { wwx: 1 }, aff: { wwx: 1 } }, go: 'sweet_meant' },
            { t: 'Maybe I am a little drunk.', fx: { sus: { wwx: 3 } }, go: 'sweet_drunk' },
          ] },
      ],
      sweet_lost: [
        { m: 'OK THERE he is' },
        { m: "i'm screenshotting the 🥺 and having it framed. it's going on the wall of the jingshi" },
        { m: '6:30?? no take backs' },
        { go: 'yes_tail' },
      ],
      sweet_meant: [
        { m: '…', d: 3 },
        { m: "ok i'm crying now. lan zhan i'm crying" },
        { m: 'i missed u too. i missed u so much it was stupid' },
        { m: "6:30. i'm bringing the soup" },
        { go: 'yes_tail' },
      ],
      sweet_drunk: [
        { m: 'jiang cheng' },
        { m: "u don't drink" },
        { m: "u haven't had a drink since 2008. u won't even eat the rum cake at new year" },
        { m: '…' },
        { m: 'are u ok?? did u hit ur head?? is this a lan xichen thing' },
        { m: "ok. i'm taking the yes. i'm not giving it back. 6:30" },
        YES_LOG,
        { hint: 'Wei Wuxian noticed.' },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],

      burned: [
        { wait: 4 },
        { typing: 6 },
        { wait: 5 },
        { typing: 3 },
        { wait: 8 },
        { m: 'ok', d: 1 },
        { wait: 6 },
        { m: 'ok jiang cheng' },
        { m: 'goodnight' },
        { log: 'Told Wei Wuxian he should have stayed gone', once: 'wwx:burned' },
        { hint: 'Wei Wuxian will remember that.' },
        free('wwx'),
        { start: 'burned_after', delay: 20 },
      ],
    },
  });

  // ── Consequence: Burned Bridges (docs/SUNDAY.md "Consequences") ──
  // The night goes on without him. Nothing here mends it: only the Saturday call can (burned_mended, writer C).
  // burned_regret / burned_gate only tell the call what the stranger said afterwards.
  scene({
    id: 'burned_after',
    thread: 'lwj',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { fx: { set: { burned: true, wwx_done: true } } },
        { m: 'Wei Ying showed me what you sent.', d: 3 },
        { m: 'He is on the roof of the Jingshi. He goes there when he does not want me to see his face.' },
        { m: 'I will sit with him.' },
        { m: 'You were wrong.' },
        { choice: [
            { t: '[Say nothing]', silent: true, go: 'after' },
            { t: "I didn't mean it.", fx: { set: { burned_regret: true } }, go: 'didnt' },
            { t: "Tell him I'm sorry.", fx: { set: { burned_regret: true }, sus: { lwj: 2 } }, go: 'sorry' },
          ], timeout: 120, onTimeout: 'after' },
      ],
      didnt: [
        { m: 'Then you will say so. In person.' },
        { m: 'Not tonight.' },
        { go: 'after' },
      ],
      sorry: [
        { m: 'You have never used that word.' },
        { m: 'Tell him yourself. In person.' },
        { go: 'after' },
      ],
      after: [
        { wait: 20 },
        { m: 'jiujiu', th: 'jl', from: 'jl' },
        { m: 'what did u say to wei wuxian', th: 'jl', from: 'jl' },
        { m: 'sizhui says hanguang-jun just cancelled his 8am class. he NEVER cancels', th: 'jl', from: 'jl' },
        { m: 'jiujiu what did u do', th: 'jl', from: 'jl' },
        { hint: 'The night goes on without him.' },
        { wait: 150 },
        { if: (s) => !night(s), go: 'end' },
        { m: 'He came down.' },
        { m: 'He is making the soup anyway. Batch six. He did not burn it.' },
        { m: 'He says he will bring it on Sunday and leave it at the gate. He will not come in. He will not be asked.' },
        { if: (s) => !!F(s).burned_regret, go: 'told' },
        { go: 'gate_q' },
      ],
      told: [
        { m: 'I told him what you said.' },
        { m: 'He did not answer. He turned the fire down.' },
        { go: 'gate_q' },
      ],
      gate_q: [
        { choice: [
            { t: '[Say nothing]', silent: true, go: 'end' },
            { t: 'The gate will be open.', fx: { set: { burned_gate: true } }, go: 'gate' },
            { t: 'Good.', go: 'cold' },
          ], timeout: 120, onTimeout: 'end' },
      ],
      gate: [
        { m: 'That is not mine to carry.' },
        { m: 'Tell him yourself. Before Sunday.' },
        { log: 'Told Lan Wangji the gate would be open. He would not carry the message', once: 'burned:gate' },
        { go: 'end' },
      ],
      cold: [{ m: '…' }, { m: 'Mn.' }, { go: 'end' }],
      end: [{ end: true }],
    },
  });

  // ── 1b. "Can Wen Ning drive us. And come in?" (cross-storyline beat 1) ─
  scene({
    id: 'wwx_wenning',
    thread: 'wwx',
    polite: true,
    trigger: { on: 'flag', flag: 'wwx_invited', delay: 100 },
    when: (s) => night(s) && !F(s).burned,
    nodes: {
      start: waitFor('wwx', 'go'),
      go: [
        lock('wwx'),
        { if: (s) => !!F(s).wn_invited, go: 'heard' },
        { m: 'ok one more thing and then i let u sleep' },
        { m: 'wen ning drove us to the gala tonight. in the radish van. lan zhan sat in the back with the radishes. by choice' },
        { m: 'can he drive us on sunday' },
        { typing: 4 },
        { m: 'and can he come in' },
        { m: "he'd never ask. he'd park outside the gate for three hours with a thermos and say it was fine" },
        { m: "it's been since 2008 for him too, jiang cheng. he still says 'lotus pier' like it's a church" },
        { if: (s) => !!F(s).wn_towed, go: 'towed' },
        { go: 'q' },
      ],
      towed: [
        { m: 'and he pulled sandu out of a POND for u tonight. with a ROPE. that has to count for something' },
        { go: 'q' },
      ],
      q: [
        { choice: [
            { t: 'He comes in. He eats.', fx: { set: { wn_invited: true }, aff: { wwx: 1 } }, go: 'in' },
            { t: "He can drive. That's all.", go: 'drive' },
            { t: 'Tell him to ask me himself.', go: 'self' },
            { t: 'Of course!! The more the merrier 🥰', fx: { set: { wn_invited: true }, sus: { wwx: 3 } }, go: 'sweet' },
          ], timeout: 120, onTimeout: 'quiet' },
      ],
      in: [
        { m: '…' },
        { m: 'ok' },
        { m: "i'm not telling him. YOU tell him. he'll faint. it'll be beautiful" },
        { m: "lan zhan says we need a sixth good bowl. he's ordering one. from a potter in gusu. at one in the morning" },
        { log: 'Told Wei Wuxian that Wen Ning should come in and eat on Sunday', once: 'wn:invited' },
        { hint: 'Wen Ning will be at the table.' },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
        { start: 'wn_told', delay: 40 },
      ],
      sweet: [
        { m: '"the more the merrier"??' },
        { m: 'jiang cheng ur the LESS the merrier guy. u have a sign' },
        { m: "…i'm not questioning it. i'm telling wen ning before u change ur mind" },
        { log: 'Told Wei Wuxian that Wen Ning should come in on Sunday, with an emoji', once: 'wn:invited' },
        { hint: 'Wen Ning will be at the table.' },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
        { start: 'wn_told', delay: 40 },
      ],
      drive: [
        { m: "jiang cheng. it's 2026" },
        { m: "ok. he drives. i'll work on the rest. i have till sunday" },
        { fx: { set: { wn_drives: true } } },
        free('wwx'),
      ],
      self: [
        { m: "ask u HIMSELF?? he'll say 'oh no, i couldn't.' he says that about CHAIRS" },
        { m: "fine. i'll tell him u said he could ask. that's practically a yes" },
        { fx: { set: { wn_may_ask: true } } },
        free('wwx'),
      ],
      quiet: [
        { m: "ok that's a not no for wen ning too. it's a not no kind of night" },
        free('wwx'),
      ],
      // Wen Ning got his invitation first (after the tow): Wei Wuxian heard
      heard: [
        { m: 'jiang cheng' },
        { m: 'wen ning just texted me. in CAPITAL LETTERS. wen ning has never used capital letters in his life' },
        { m: 'u invited him IN??' },
        { m: "lan zhan is ordering a sixth good bowl. i'm not crying. it's the soup steam" },
        free('wwx'),
      ],
    },
  });

  // ── 2. He comes back to it (only if Sunday is still open) ────────
  scene({
    id: 'wwx_followup',
    thread: 'wwx',
    trigger: { on: 'scene', scene: 'wwx_sunday', delay: 360 },
    when: (s) => night(s) && !F(s).burned && !F(s).wwx_invited,
    nodes: Object.assign({
      start: waitFor('wwx', 'soup'),
      soup: [
        lock('wwx'),
        { m: 'hey' },
        { m: 'not asking again. just an update' },
        { m: "i'm making a practice batch. right now. after midnight. lan zhan is supervising", img: 'p_lotus_root_soup' },
        { if: (s) => !!F(s).ops_keep, go: 'honghu' },
        { if: (s) => !!F(s).ops_soup, go: 'canteen' },
        { go: 'ribs' },
      ],
      honghu: [
        { m: "also old huang sent me a voice message. he still has my number from 2024. it was forty seconds of wind and then 'twenty kilo honghu lotus root, for sunday 👍'" },
        { m: 'honghu root. the kind she used. the supermarket ones are sad. they are SAD roots' },
        { go: 'ribs' },
      ],
      canteen: [
        { m: "also a-ling says ur canteen is doing soup week out of FOUR HUNDRED KILOS of lotus root??" },
        { m: "auntie chen is making it for 340 people and i can't make it for six" },
        { go: 'ribs' },
      ],
      ribs: [
        { m: "the lotus root goes in after the ribs. i remember her saying that. i don't remember much from 2009 but i remember that" },
        { if: (s) => !!F(s).told_recipe, go: 'soup_known' },
        { m: 'and something about the fire. i forget the fire part' },
        { choice: [
            { t: "Low fire. Two hours. Don't rush it.", fx: { aff: { wwx: 2 }, set: { told_recipe: true } }, go: 'recipe' },
            { t: 'Go to sleep, Wei Wuxian.', go: 'sleep' },
            { t: 'Thank you.', if: canThank, go: 'thanks' },
            { t: 'Omg that looks amazing!! 😍', fx: { sus: { wwx: 3 } }, go: 'gush' },
          ] },
      ],
      // the player already told him the fire part in a recipe comment (react-social.js r_web_cmt_soup)
      soup_known: [
        { m: 'and the fire. low. two hours. someone told me that on a recipe site tonight' },
        { m: "i'm not going to make it a thing. it's just that she said it exactly like that" },
        { m: 'jiang cheng. can i come home on sunday' },
        { choice: [
            { t: 'Six-thirty. Bring the soup.', fx: { set: { wwx_invited: true }, aff: { wwx: 1 } }, go: 'yes' },
            { t: "We'll see.", fx: { set: { wwx_maybe: true } }, go: 'see' },
            { t: 'Thank you.', if: canThank, go: 'thanks' },
          ] },
      ],
      recipe: [
        { typing: 4 },
        { m: '…' },
        { m: "that's exactly what she said" },
        { m: 'word for word. how do u remember that' },
        { log: 'Told Wei Wuxian the part of A-Jie’s recipe he forgot: low fire, two hours', once: 'wwx:recipe' },
        { hint: 'The soup will taste like hers.' },
        { choice: [
            { t: 'She texted it to me. In 2008.', fx: { aff: { wwx: 1 } }, go: 'wrote' },
            { t: 'Someone had to remember.', fx: { aff: { wwx: 1 } }, go: 'wrote' },
          ] },
      ],
      wrote: [
        { m: 'of course' },
        { m: 'of course u kept it' },
        { m: 'lan zhan. LAN ZHAN. it was the fire. she told jiang cheng and jiang cheng KEPT it' },
        { m: 'jiang cheng. can i come home on sunday' },
        { choice: [
            { t: 'Six-thirty. Bring the soup.', fx: { set: { wwx_invited: true }, aff: { wwx: 2 } }, go: 'yes' },
            { t: "We'll see.", fx: { set: { wwx_maybe: true } }, go: 'see' },
          ] },
      ],
      yes: [
        { m: '!!!!!!!!' },
        { m: "LAN ZHAN TURN OFF THE STOVE. no. leave it on. low fire. two hours. don't rush it" },
        { m: "i'm going home" },
        YES_LOG,
        YES_HINT,
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],
      see: [
        { m: '"we\'ll see" is a not no' },
        { m: "it's going in the notebook" },
        free('wwx'),
      ],
      sleep: [
        { m: "u go to sleep. ur the one with the four-hour sleep average" },
        { m: 'yes i know about that. a-ling told me. a-ling tells me things now. it is very weird and i love it' },
        free('wwx'),
      ],
      gush: [
        { m: '"amazing"??' },
        { m: '😍??' },
        { m: 'jiang cheng the last time i made soup u said it tasted like a pond' },
        { m: 'lan zhan. lan zhan come here. jiang cheng sent heart eyes' },
        { m: 'he says mn. but concerned' },
        free('wwx'),
      ],
    }, thanksNodes()),
  });

  // ── 2b. The practice batches (soup_practiced; cross-storyline beat 2) ─
  scene({
    id: 'wwx_practice',
    thread: 'wwx',
    polite: true,
    trigger: { on: 'unlock', delay: 1150 },
    when: (s) => night(s) && !F(s).burned && !!(F(s).wwx_invited || F(s).wwx_maybe),
    nodes: {
      start: waitFor('wwx', 'pot'),
      pot: [
        lock('wwx'),
        { if: (s) => !!(s.done && s.done.wwx_followup), go: 'seven' },
        { m: 'update from the jingshi kitchen' },
        { m: "batch six. i'm not sleeping. lan zhan isn't sleeping either. he's 'reading'. he's been on the same page for an hour", img: 'p_lotus_root_soup' },
        { go: 'root' },
      ],
      seven: [
        { m: 'batch seven' },
        { m: 'lan zhan has stopped opening the windows. that is called PROGRESS', img: 'p_lotus_root_soup' },
        { go: 'root' },
      ],
      root: [
        { if: (s) => !!F(s).ops_keep && !(s.done && s.done.wwx_followup), go: 'honghu' },
        { if: (s) => !!F(s).ops_soup && !F(s).ops_keep && !(s.done && s.done.wwx_followup), go: 'canteen' },
        { go: 'taste' },
      ],
      honghu: [
        { m: "also old huang sent me a voice message. he still has my number from 2024. forty seconds of wind and then 'twenty kilo honghu lotus root, for sunday 👍'" },
        { m: "honghu root. the kind she used. i'll practice with the sad supermarket ones and on sunday i'll use URS" },
        { go: 'taste' },
      ],
      canteen: [
        { m: "also a-ling says ur canteen is making soup for 340 people out of the 400 kilos" },
        { m: "auntie chen is doing it for 340 and i can't do it for six. i'm not jealous. i'm a little jealous" },
        { go: 'taste' },
      ],
      taste: [
        { m: 'lan zhan tasted it. he said "closer"' },
        { m: 'CLOSER. closer to WHAT. he won\'t say. he just looks at the pot like it owes him money' },
        { if: (s) => !!F(s).told_recipe, go: 'known' },
        { choice: [
            { t: "Low fire. Two hours. Don't rush it.", fx: { set: { told_recipe: true, soup_practiced: true }, aff: { wwx: 2 } }, go: 'fire' },
            { t: 'Salt at the end. Not the start.', fx: { set: { soup_practiced: true }, aff: { wwx: 1 } }, go: 'salt' },
            { t: 'Go to sleep, Wei Wuxian.', go: 'sleep' },
            { t: 'Yum!! Save me some 😋', fx: { sus: { wwx: 3 } }, go: 'yum' },
          ], timeout: 120, onTimeout: 'quiet' },
      ],
      known: [
        { m: "the fire's right now. low. two hours. i've been staring at it for an hour and forty minutes" },
        { m: "it's still not HERS though" },
        { choice: [
            { t: 'Salt at the end. Not the start.', fx: { set: { soup_practiced: true }, aff: { wwx: 1 } }, go: 'salt' },
            { t: "It won't be hers. It'll be yours. That's enough.", fx: { set: { soup_practiced: true }, aff: { wwx: 2 } }, go: 'yours' },
            { t: 'Go to sleep, Wei Wuxian.', go: 'sleep' },
          ], timeout: 120, onTimeout: 'quiet' },
      ],
      fire: [
        { m: '…' },
        { m: "that's exactly what she said" },
        { m: "no. don't tell me how u remember. i know how. u keep everything" },
        { log: 'Told Wei Wuxian the part of A-Jie’s recipe he forgot: low fire, two hours', once: 'wwx:recipe' },
        { hint: 'The soup will taste like hers.' },
        { go: 'end' },
      ],
      salt: [
        { m: 'salt at the END??' },
        { m: "lan zhan. we've been salting at the START. for SIX BATCHES" },
        { m: 'she always tasted it last, right before the lid. i thought she was just tasting. she was SALTING' },
        { log: 'Told Wei Wuxian A-Jie salted the soup last', once: 'wwx:salt' },
        { hint: 'The soup will be closer to hers.' },
        { go: 'end' },
      ],
      yours: [
        { m: 'mine' },
        { m: 'ok' },
        { m: "ok i'm going to stop crying into it. that's ALSO salt" },
        { log: 'Told Wei Wuxian his soup did not have to be hers', once: 'wwx:salt' },
        { hint: 'The soup will be closer to hers.' },
        { go: 'end' },
      ],
      sleep: [{ m: "after this batch. it has forty minutes left. i'm not leaving it. she never left it" }, { go: 'end' }],
      yum: [
        { m: 'save u SOME??' },
        { m: 'jiang cheng u said my last soup tasted like a pond' },
        { m: "ur being so weird tonight. lan zhan says it's the balcony" },
        { go: 'end' },
      ],
      quiet: [{ m: "ok. i'll just keep stirring. she never stirred. i'm stopping" }, { go: 'end' }],
      end: [free('wwx')],
    },
  });

  // ── 3. Goodnight (last chance, ~01:30) ───────────────────────────
  // What he has heard from everyone else tonight, if they told him (tea via Lan Wangji, the bell via Sizhui …).
  const NEWS = [
    { if: (s) => !!F(s).lxc_sunday, lines: [{ m: "also lan zhan says xichen-ge asked if he's allowed to come on sunday. ON SUNDAY. jiang cheng what happened on that balcony" }] },
    { if: (s) => !!F(s).tea_yes && !F(s).lxc_sunday, lines: [{ m: "also lan zhan says xichen-ge is boiling water. at this hour. testing temperatures 'for tomorrow at three'. he has never tested a temperature in his life. what did u DO" }] },
    { if: (s) => !!F(s).gift_bell && !!F(s).wwx_invited, lines: [{ m: "sizhui told me about the bell. shijie's bell. for a-ling" }, { m: "ok i have to stop reading my phone in bed, i'm crying on lan zhan" }] },
    { if: (s) => !!(F(s).fairy_taken || F(s).dog_friday || F(s).fairy_inside) && !!F(s).wwx_invited, lines: [{ m: 'wait. is fairy going to be at dinner. INSIDE' }, { m: "i said i'd sit next to her. i'm a man of my word. lan zhan will sit between us" }] },
    { if: (s) => !!F(s).wn_invited, lines: [{ m: 'wen ning is ironing a shirt for sunday. right now. he has ONE shirt' }] },
    { if: (s) => !!F(s).scandal && !F(s).scandal_fixed, lines: [{ m: "and if the jin board moves a-ling's party to koi tower i'm bringing the soup THERE. in her pot. past the press" }] },
  ];
  scene({
    id: 'wwx_goodnight',
    thread: 'wwx',
    trigger: { on: 'unlock', delay: 1650 },
    when: (s) => night(s) && !F(s).burned,
    nodes: Object.assign({
      start: waitFor('wwx', 'gn'),
      gn: [
        lock('wwx'),
        { m: 'jiang cheng' },
        { m: 'lan zhan made me go to bed' },
        { m: "i'm in bed. texting u from bed. he's pretending to be asleep so i'll stop" },
        { go: 'news0' },
      ],
      split: [{ if: (s) => F(s).wwx_invited, go: 'gn_yes', else: 'gn_maybe' }],
      gn_yes: [
        { m: 'see u sunday!!! 6:29 outside the gate!!!' },
        { choice: [
            { t: 'Six-thirty. Not six twenty-nine.', fx: { aff: { wwx: 1 } }, go: 'gn_end' },
            { t: 'Goodnight.', label: '[Send him the puppies]', silent: true, fx: { aff: { wwx: 1 } }, go: 'gn_puppies' },
            { t: 'Thank you.', if: canThank, go: 'thanks' },
            { t: 'Night night 🥰', fx: { sus: { wwx: 3 } }, go: 'gn_weird' },
          ] },
      ],
      gn_maybe: [
        { m: "the offer's open till sunday 6:29pm" },
        { m: 'goodnight' },
        { choice: [
            { t: 'Six-thirty. Bring the soup.', fx: { set: { wwx_invited: true }, aff: { wwx: 2 } }, go: 'gn_late_yes' },
            { t: 'Goodnight, Wei Wuxian.', fx: { aff: { wwx: 1 } }, go: 'gn_end' },
            { t: 'Thank you.', if: canThank, go: 'thanks' },
            { t: '[Leave him on read]', silent: true, go: 'gn_read' },
          ] },
      ],
      gn_late_yes: [
        { m: '…' },
        { m: 'LAN ZHAN WAKE UP' },
        { m: "he was awake. he says he was awake the whole time. he's smiling. i'm going home" },
        YES_LOG,
        YES_HINT,
        { go: 'gn_end' },
      ],
      gn_end: [
        { m: 'goodnight chengcheng' },
        { m: "(don't kill me)" },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],
      gn_puppies: [
        { me: 'Goodnight.', img: 'p_puppies' },
        { m: 'JIANG CHENG' },
        { m: 'NOT THE PUPPIES' },
        { m: "it's 2am. i have to look at them in the DARK" },
        { m: '…ok the middle one is a little bit cute' },
        { m: 'goodnight u monster. six thirty ❤️' },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],
      gn_weird: [
        { m: 'night night??' },
        { m: 'ok now i KNOW lan xichen broke ur brain' },
        { go: 'gn_end' },
      ],
      gn_read: [
        { m: 'goodnight anyway' },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],
    }, chain('news', NEWS, 'split'), thanksNodes()),
  });

  // ── 4. Untitled 14 ───────────────────────────────────────────────
  // The flag is set whenever it is played (also in the morning).
  scene({
    id: 'memo_heard_flag',
    thread: 'wwx',
    trigger: { on: 'act', act: 'memo_play', match: isMemo },
    nodes: { start: [{ fx: { set: { memo_heard: true } } }, { log: 'Listened to “Untitled 14”, the thank-you he never sent', once: 'memo14:play' }] },
  });

  // The quiet beat after the player listens to it.
  scene({
    id: 'memo_listen',
    thread: 'wwx',
    polite: true,
    trigger: { on: 'act', act: 'memo_play', match: isMemo, delay: 25 },
    when: (s) => night(s) && !F(s).burned && !F(s).memo_sent,
    nodes: {
      start: waitFor('wwx', 'kites'),
      kites: [
        lock('wwx'),
        { m: 'random but' },
        { m: 'do u remember the kites at the lake pavilion' },
        { m: 'u always got urs stuck in the same willow' },
        { m: 'and shijie would bribe the gardener with soup to climb up and get it' },
        { m: "lan zhan's playing the guqin in the other room and i got nostalgic. ignore me" },
        { choice: [
            { t: 'It was your kite. Every time.', fx: { aff: { wwx: 1 } }, go: 'yours' },
            { t: 'I remember.', fx: { aff: { wwx: 1 } }, go: 'remember' },
            { t: '[Say nothing]', silent: true, go: 'quiet' },
          ] },
      ],
      yours: [
        { m: 'LIES' },
        { m: '…' },
        { m: 'ok it was mine. it was mine every time' },
        { m: 'and u climbed the willow for it once and fell in the lake and she laughed so hard she cried' },
        free('wwx'),
      ],
      remember: [
        { m: 'yeah' },
        { m: 'me too' },
        free('wwx'),
      ],
      quiet: [free('wwx')],
    },
  });

  // The climax: the memo reaches him.
  scene({
    id: 'memo_to_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'memo_share', match: (p) => isMemo(p) && target(p) === 'wwx' },
    when: climaxOk,
    nodes: {
      start: [
        { fx: { set: { memo_sent: true, memo_climax: true }, aff: { wwx: 3 } } },
        { wait: 6 },
        { typing: 9 },
        { wait: 5 },
        { typing: 6 },
        { wait: 7 },
        { typing: 11 },
        { wait: 3 },
        { m: 'you kept this for two years?', d: 2 },
        { wait: 4 },
        { m: 'Thank you.', th: 'lwj', from: 'lwj' },
        { hint: 'Wei Wuxian will remember that.' },
        { go: 'q' },
      ],
      q: waitFor('wwx', 'talk', 'q', true),
      talk: [
        lock('wwx'),
        { choice: [
            { t: "Don't make it a thing.", go: 'thing' },
            { t: "I wasn't going to send it.", go: 'wasnt' },
            { t: 'Yes. 🥺❤️', fx: { sus: { wwx: 3 } }, go: 'emoji' },
            { t: '[Say nothing]', silent: true, go: 'nothing' },
          ] },
      ],
      thing: [
        { m: 'jiang cheng' },
        { m: "it's already a thing" },
        { m: "it's the biggest thing that has ever happened in this chat. and this chat has four years of me sending u radishes" },
        { go: 'after' },
      ],
      wasnt: [
        { m: 'i know' },
        { m: "i know u weren't" },
        { m: "i'm so glad u did" },
        { go: 'after' },
      ],
      emoji: [
        { m: "ok the emoji is deeply weird but i'm too busy crying to investigate" },
        { go: 'after' },
      ],
      nothing: [
        { m: "it's ok" },
        { m: "u don't have to say anything" },
        { m: 'u already did' },
        { go: 'after' },
      ],
      after: [
        { m: "i'd do it again" },
        { m: "i typed that to u two years ago and unsent it. i'm not unsending it now" },
        { m: "i'd do it a hundred times. don't answer that. i know u won't" },
        { m: 'lan zhan is listening to it again. he\'s on 4. he says ur voice is "very loud for a thank you"' },
        { if: (s) => F(s).wwx_invited, go: 'end_inv' },
        { m: '…so' },
        { m: 'sunday?' },
        { choice: [
            { t: 'Six-thirty. Bring the soup.', fx: { set: { wwx_invited: true }, aff: { wwx: 1 } }, go: 'yes' },
            { t: 'Go to sleep, Wei Wuxian.', fx: { set: { wwx_maybe: true } }, go: 'end_no' },
          ] },
      ],
      yes: [
        { m: '😭😭😭' },
        { m: "ok. ok. i'm going home" },
        YES_LOG,
        YES_HINT,
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],
      end_inv: [
        { m: "see u sunday. i'm bringing her pot. the big one" },
        { m: "and i'm putting a bowl out for her. don't argue. u'd have done it anyway" },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],
      end_no: [
        { m: "ok. i'm going to sleep. i'm not going to sleep. i'm going to listen to it again" },
        { fx: { set: { wwx_done: true } } },
        free('wwx'),
      ],
    },
  });

  // After "You should have stayed gone": the memo still reaches him. It does not undo the night (no burned_mended).
  scene({
    id: 'memo_to_wwx_burned',
    thread: 'lwj',
    trigger: { on: 'act', act: 'memo_share', match: (p) => isMemo(p) && target(p) === 'wwx' },
    when: (s) => !!F(s).burned && !F(s).memo_climax,
    nodes: {
      start: [
        { fx: { set: { memo_sent: true, memo_climax: true } } },
        { wait: 40 },
        { m: 'He played it on the roof.' },
        { m: 'Twice.' },
        { wait: 6 },
        { m: 'He says you do not get to say both things in one night.' },
        { m: 'He came down. He is still making the soup.' },
        { log: 'Sent Wei Wuxian “Untitled 14” after telling him to stay gone. He played it twice on the roof', once: 'memo14:burned' },
        { hint: 'Wei Wuxian heard it.' },
      ],
    },
  });

  // Shared to the family group instead: Jin Ling finds out about the liver.
  scene({
    id: 'memo_to_fam',
    thread: 'fam',
    trigger: { on: 'act', act: 'memo_share', match: (p) => isMemo(p) && target(p) === 'fam' },
    when: climaxOk,
    nodes: {
      start: [
        { fx: { set: { memo_sent: true, memo_climax: true }, aff: { wwx: 3, jl: 1 } } },
        { wait: 5 },
        { m: '?', from: 'jl' },
        { m: 'why is there a voice memo in the family chat', from: 'jl' },
        { wait: 30 },
        { m: 'wait', from: 'jl' },
        { m: 'WAIT', from: 'jl' },
        { m: 'what liver', from: 'jl' },
        { m: 'jiujiu WHAT LIVER', from: 'jl' },
        { typing: 8, from: 'wwx' },
        { wait: 4 },
        { typing: 6, from: 'wwx' },
        { m: 'you kept this for two years?', from: 'wwx' },
        { m: 'Thank you.', th: 'lwj', from: 'lwj' },
        { m: 'wei wuxian. did u give jiujiu ur LIVER', from: 'jl' },
        { m: "part of it!!! it grows back!!! a-ling that's the whole trick with livers", from: 'wwx' },
        { m: 'IN 2008??? WHEN U WERE SIXTEEN???', from: 'jl' },
        { m: '…', from: 'jl' },
        { m: "ok i'm going to cry at my own birthday and it's both of ur faults", from: 'jl' },
        { hint: 'The family will remember that.' },
        { go: 'q' },
      ],
      q: waitFor('fam', 'talk', 'q', true),
      talk: [
        lock('fam'),
        { choice: [
            { t: "Don't make it a thing.", go: 'thing' },
            { t: 'It grows back. He said so.', go: 'grows' },
            { t: '[Say nothing]', silent: true, go: 'after' },
          ] },
      ],
      thing: [
        { m: "IT'S A THING", from: 'jl' },
        { m: "it's a thing a-ling. we're making it a thing", from: 'wwx' },
        { m: 'Mn.', from: 'lwj' },
        { go: 'after' },
      ],
      grows: [
        { m: "that's not the POINT", from: 'jl' },
        { m: 'it is a little bit the point', from: 'wwx' },
        { go: 'after' },
      ],
      after: [
        { m: "jiujiu. wei wuxian. i'm only saying this once", from: 'jl' },
        { m: 'ur both idiots. thanks. goodnight', from: 'jl' },
        { m: 'he said thanks!!! lan zhan he said THANKS. it runs in the family', from: 'wwx' },
        { if: (s) => !F(s).wwx_invited, go: 'ask' },
        free('fam'),
      ],
      ask: [
        { m: 'so is wei wuxian coming on sunday or what. i want a straight answer. in THIS chat', from: 'jl' },
        { choice: [
            { t: 'Six-thirty.', fx: { set: { wwx_invited: true }, aff: { wwx: 1, jl: 1 } }, go: 'ask_yes' },
            { t: "Go to sleep, both of you.", fx: { set: { wwx_maybe: true } }, go: 'ask_no' },
          ], timeout: 90, onTimeout: 'ask_no' },
      ],
      ask_yes: [
        { m: 'SIX THIRTY', from: 'wwx' },
        { m: 'ok. good. finally', from: 'jl' },
        YES_LOG,
        YES_HINT,
        { fx: { set: { wwx_done: true } } },
        free('fam'),
      ],
      ask_no: [{ m: "that's a not no. i'm a not no expert now", from: 'wwx' }, free('fam')],
    },
  });

  // Shared to Lan Wangji: he plays it for Wei Ying.
  scene({
    id: 'memo_to_lwj',
    thread: 'lwj',
    trigger: { on: 'act', act: 'memo_share', match: (p) => isMemo(p) && target(p) === 'lwj' },
    when: climaxOk,
    nodes: {
      start: [
        { fx: { set: { memo_sent: true, memo_climax: true }, aff: { wwx: 2 } } },
        { wait: 25 },
        { m: 'This is not for me.' },
        { m: 'He is awake. He is not supposed to be.' },
        { m: 'I will play it for him.' },
        { wait: 40 },
        { m: 'jiang cheng', th: 'wwx', from: 'wwx' },
        { m: 'lan zhan just played me something', th: 'wwx', from: 'wwx' },
        { m: 'you kept this for two years?', th: 'wwx', from: 'wwx' },
        { wait: 5 },
        { m: 'Thank you.' },
        { hint: 'Wei Wuxian will remember that.' },
      ],
    },
  });

  // Shared into a big group chat: everyone hears it.
  scene({
    id: 'memo_to_alumni',
    thread: 'alumni',
    trigger: { on: 'act', act: 'memo_share', match: (p) => isMemo(p) && target(p) === 'alumni' },
    when: climaxOk,
    nodes: {
      start: [
        { fx: { set: { memo_sent: true, memo_climax: true }, aff: { wwx: 3 } } },
        { wait: 30 },
        { m: '👀', from: 'nhs' },
        { m: '…', from: 'nhs' },
        { m: 'Oh, Jiang Cheng.', from: 'mian' },
        { m: "Mr. Jiang, I'm sorry. I told you that night because I thought you should know. I'm sorry it was so hard. — Wen Ning", from: 'wn' },
        { typing: 9, from: 'wwx' },
        { wait: 4 },
        { m: 'you kept this for two years?', from: 'wwx' },
        { m: 'Thank you.', th: 'lwj', from: 'lwj' },
        { m: '(I am not crying. I am a chairman. Chairmen do not cry 😭)', from: 'nhs' },
        { m: 'Nobody screenshot this. Huaisang, I mean you.', from: 'mian' },
        { m: '…deleted my screenshot 🙈', from: 'nhs' },
        { hint: 'Wei Wuxian will remember that.' },
      ],
    },
  });
  scene({
    id: 'memo_to_bday',
    thread: 'bday',
    trigger: { on: 'act', act: 'memo_share', match: (p) => isMemo(p) && target(p) === 'bday' },
    when: climaxOk,
    nodes: {
      start: [
        { fx: { set: { memo_sent: true, memo_climax: true }, aff: { wwx: 3 } } },
        { wait: 30 },
        { m: 'wait', from: 'jy' },
        { m: 'what liver 💀', from: 'jy' },
        { m: 'Jingyi.', from: 'sz' },
        { m: '…Mr. Wei, is that true?', from: 'sz' },
        { typing: 8, from: 'wwx' },
        { m: 'you kept this for two years?', from: 'wwx' },
        { m: 'Thank you.', th: 'lwj', from: 'lwj' },
        { m: 'this chat was supposed to be about CAKE 😭', from: 'jy' },
        { m: "I'm going to pretend I'm not crying in a group called DO NOT ADD JIN LING 🙈", from: 'nhs' },
        { hint: 'Wei Wuxian will remember that.' },
      ],
    },
  });

  // Sent to the wrong people.
  scene({
    id: 'memo_to_jl',
    thread: 'jl',
    trigger: { on: 'act', act: 'memo_share', match: (p) => isMemo(p) && target(p) === 'jl' },
    when: (s) => !F(s).memo_sent,
    nodes: {
      start: [
        { wait: 15 },
        { m: 'why did u send me a voice memo in the middle of the night' },
        { wait: 30 },
        { m: 'wait' },
        { m: 'what liver' },
        { m: 'jiujiu what LIVER' },
        { m: 'is this about wei wuxian??' },
        { m: '…' },
        { m: 'oh' },
        { m: 'ok' },
        { m: "i'm not going to make it a thing" },
        { m: '(send it to HIM. not me. idiot)' },
        { m: '(and let him come on sunday. i want him there. i never said that. ok bye)' },
        { fx: { set: { memo_to_jl: true }, aff: { jl: 1 }, sus: { jl: 1 } } },
      ],
    },
  });
  scene({
    id: 'memo_to_nhs',
    thread: 'nhs',
    trigger: { on: 'act', act: 'memo_share', match: (p) => isMemo(p) && target(p) === 'nhs' },
    nodes: {
      start: [
        { wait: 15 },
        { m: 'Brother Jiang…' },
        { m: '🙈🙈🙈' },
        { m: "I'm going to pretend I didn't hear this. I'm very, very good at pretending" },
        { m: '…but Brother Jiang would never send ME this. Not in a hundred years 👀' },
        { fx: { sus: { nhs: 4 } } },
        { hint: 'Nie Huaisang noticed.' },
      ],
    },
  });
  scene({
    id: 'memo_to_lxc',
    thread: 'lxc',
    trigger: { on: 'act', act: 'memo_share', match: (p) => isMemo(p) && target(p) === 'lxc' },
    nodes: {
      start: [
        { wait: 20 },
        { m: 'Wanyin, I think this was meant for someone else.' },
        { m: "I stopped it after the first few seconds. It isn't mine to hear." },
        { m: 'But if it is what I think it is, please send it to him. Whatever it costs you, it will cost less than not sending it.' },
        { fx: { sus: { lxc: 1 }, aff: { lxc: 1 } } },
      ],
    },
  });

  // ── 5. The family group reacts ───────────────────────────────────
  scene({
    id: 'fam_car',
    thread: 'fam',
    trigger: { on: 'flag', flag: 'car_known', delay: 50 },
    when: night,
    nodes: {
      start: waitFor('fam', 'go'),
      go: [
        lock('fam'),
        { m: 'A-LING', from: 'wwx' },
        { m: "WHY IS THERE A VIDEO OF SANDU IN A POND ON JINGYI'S STORY", from: 'wwx' },
        { m: 'DELETE IT', from: 'jl' },
        { m: 'how does jingyi even HAVE it', from: 'jl' },
        { m: 'Sizhui sent it to him.', from: 'lwj' },
        { m: 'SIZHUI???', from: 'jl' },
        { m: 'a-ling are u ok. is the car ok. is fairy ok', from: 'wwx' },
        { m: 'not that i care about fairy. fairy is a monster. is she ok', from: 'wwx' },
        { m: 'everyone is FINE. jiujiu is handling it', from: 'jl' },
        { if: (s) => !!F(s).car_cover, go: 'valet' },
        { if: (s) => !!F(s).wn_asked && !F(s).wn_declined, go: 'van' },
        { go: 'q' },
      ],
      valet: [
        { m: 'jingyi\'s caption says "VALET DID IT 💀"', from: 'wwx' },
        { m: 'a-ling. the valet is sixty. he gave fairy a biscuit', from: 'wwx' },
        { m: '…', from: 'jl' },
        { m: 'Jin Ling.', from: 'lwj' },
        { go: 'q' },
      ],
      van: [
        { m: "wait is that WEN NING'S VAN in the background?? he's meant to be driving US home", from: 'wwx' },
        { m: 'he has a tow rope. why does he have a tow rope', from: 'jl' },
        { m: 'He always has a tow rope.', from: 'lwj' },
        { go: 'q' },
      ],
      q: [
        { m: 'jiang cheng is handling it?? is he yelling?? i want to hear the yelling', from: 'wwx' },
        { choice: [
            { t: 'Everyone in this chat is grounded.', go: 'grounded' },
            { t: "I'm handling it.", go: 'handling' },
            { t: 'Relax fam, all good 👍', fx: { sus: { jl: 2, wwx: 2 } }, go: 'fam' },
            { t: '[Say nothing]', silent: true, go: 'quiet' },
          ] },
      ],
      grounded: [
        { m: "EVERYONE?? i'm 34", from: 'wwx' },
        { m: 'Mn.', from: 'lwj' },
        { m: "lan zhan don't ACCEPT it", from: 'wwx' },
        { m: 'lol', from: 'jl' },
        { go: 'end' },
      ],
      handling: [
        { m: 'see', from: 'jl' },
        { m: "he's handling it", from: 'jl' },
        { m: 'he only says "handling it" when someone is about to die', from: 'wwx' },
        { go: 'end' },
      ],
      fam: [
        { m: '"fam"??', from: 'jl' },
        { m: 'who taught him fam', from: 'wwx' },
        { m: 'Not me.', from: 'lwj' },
        { go: 'end' },
      ],
      quiet: [
        { m: "he's typing in another chat. he's handling it", from: 'jl' },
        { go: 'end' },
      ],
      end: [free('fam')],
    },
  });

  // If Wei Wuxian is invited, Jin Ling hears about it.
  scene({
    id: 'fam_invited',
    thread: 'fam',
    trigger: { on: 'flag', flag: 'wwx_invited', delay: 45 },
    when: (s) => night(s) && !F(s).burned,
    nodes: {
      start: waitFor('fam', 'go'),
      go: [
        lock('fam'),
        { m: '@A-Ling', from: 'wwx' },
        { m: 'guess who is coming to ur birthday dinner', from: 'wwx' },
        { m: "everyone?? it's a dinner", from: 'jl' },
        { m: 'ME. AT LOTUS PIER. JIANG CHENG SAID YES', from: 'wwx' },
        { m: '…', from: 'jl' },
        { m: 'for real?', from: 'jl' },
        { m: 'He did.', from: 'lwj' },
        { m: 'ok', from: 'jl' },
        { m: 'cool', from: 'jl' },
        { m: 'wtv', from: 'jl' },
        { m: 'u invited him? for real?', th: 'jl', from: 'jl' },
        { m: "ok. that's cool", th: 'jl', from: 'jl' },
        { m: "(that's really cool)", th: 'jl', from: 'jl' },
        { fx: { aff: { jl: 1 } } },
        { m: 'I will bring the good bowls.', from: 'lwj' },
        { m: 'we have good bowls??', from: 'wwx' },
        { m: 'We have five.', from: 'lwj' },
        { m: "is wei wuxian bringing MOM'S soup. the real one. not the pond one", from: 'jl' },
        { m: 'the real one. i am practicing so hard a-ling. the smoke alarm is my best friend', from: 'wwx' },
        { sys: 'Wei Wuxian named the conversation “Lotus Pier Family 🪷🍲 SUNDAY!!!”.' },
        { rename: 'Lotus Pier Family 🪷🍲 SUNDAY!!!' },
        { choice: [
            { t: "Don't make it a thing.", go: 'thing' },
            { t: 'Six-thirty. Not a minute early.', go: 'time' },
            { t: 'Family.', label: '[Rename it “Family.”]', silent: true, go: 'family' },
            { t: 'Stand.', label: '[Let the new name stand]', silent: true, fx: { aff: { wwx: 1 } }, go: 'stand' },
          ] },
      ],
      family: [
        { sys: 'You named the conversation “Family.”.' },
        { rename: 'Family.' },
        { m: 'classic', from: 'wwx' },
        { m: 'worth it', from: 'wwx' },
        { go: 'end' },
      ],
      stand: [
        { wait: 20 },
        { m: 'wait', from: 'jl' },
        { m: "he didn't change it back", from: 'jl' },
        { m: 'HE LET IT STAND. LAN ZHAN SCREENSHOT THIS', from: 'wwx' },
        { m: 'Done.', from: 'lwj' },
        { fx: { set: { fam_name_stood: true } } },
        { log: 'Let Wei Wuxian rename the family chat “SUNDAY!!!”', once: 'fam:stand' },
        { go: 'end' },
      ],
      thing: [
        { m: "it's a thing!!!", from: 'wwx' },
        { m: "it's a little bit a thing", from: 'jl' },
        { go: 'end' },
      ],
      time: [
        { m: '6:29 outside the gate. i know the rules', from: 'wwx' },
        { m: 'there are no rules. ur making up rules', from: 'jl' },
        { m: 'There are three thousand rules.', from: 'lwj' },
        { go: 'end' },
      ],
      end: [free('fam')],
    },
  });

  // The scandal reaches the family chat: is Sunday still at Lotus Pier? (Writer B owns the scandal itself.)
  scene({
    id: 'fam_scandal',
    thread: 'fam',
    polite: true,
    trigger: { on: 'flag', flag: 'scandal', delay: 120 },
    when: (s) => night(s) && !F(s).scandal_fixed,
    nodes: {
      start: waitFor('fam', 'go'),
      go: [
        lock('fam'),
        { if: (s) => F(s).scandal_kind === 'balcony', go: 'balcony' },
        { m: 'A-LING', from: 'wwx' },
        { m: '#KOIPONDGATE IS TRENDING. lan zhan showed me. lan zhan does not show me things', from: 'wwx' },
        { m: 'i KNOW. everyone in my chemistry class knows', from: 'jl' },
        { go: 'move' },
      ],
      balcony: [
        { m: 'jiang cheng', from: 'wwx' },
        { m: 'the tea account says there is a FULL STORY. about the balcony. with a PHOTO', from: 'wwx' },
        { m: 'Delete this.', from: 'lwj' },
        { m: "it's not in this chat, lan zhan. it's on the internet. u can't delete the internet", from: 'wwx' },
        { go: 'move' },
      ],
      move: [
        { m: 'the jin board texted ME. they want to move my birthday to koi tower. a PRESS party', from: 'jl' },
        { m: '"to manage the narrative". i turn eighteen on sunday. i am not a NARRATIVE', from: 'jl' },
        { m: 'is sunday still at lotus pier??', from: 'wwx' },
        { if: (s) => !!F(s).wwx_invited, go: 'pot' },
        { go: 'q' },
      ],
      pot: [{ m: "i've already wrapped the pot in a towel", from: 'wwx' }, { go: 'q' }],
      q: [
        { m: 'Wei Ying. Let him answer.', from: 'lwj' },
        { choice: [
            { t: "Sunday is at Lotus Pier. I'll deal with the board.", fx: { set: { sunday_held: true }, aff: { jl: 1 } }, go: 'held' },
            { t: 'Nobody is moving anything.', fx: { set: { sunday_held: true }, aff: { jl: 1 } }, go: 'held' },
            { t: 'Koi Tower could be fun! 🎉', fx: { sus: { jl: 3, wwx: 2 } }, go: 'fun' },
            { t: '[Say nothing]', silent: true, go: 'quiet' },
          ], timeout: 90, onTimeout: 'quiet' },
      ],
      held: [
        { m: 'ok', from: 'jl' },
        { m: 'ok good', from: 'jl' },
        { m: "(someone on the jin board is going to cry on monday)", from: 'wwx' },
        { m: 'Mn.', from: 'lwj' },
        { log: 'Told the family Sunday stays at Lotus Pier, whatever the Jin board says', once: 'fam:held' },
        { hint: 'A-Ling will remember that.' },
        { go: 'end' },
      ],
      fun: [
        { m: 'FUN??', from: 'jl' },
        { m: 'u hate koi tower. u call it "the aquarium"', from: 'jl' },
        { m: "is this a lan xichen thing. it's a lan xichen thing", from: 'wwx' },
        { go: 'end' },
      ],
      quiet: [{ m: "he's quiet. that means he's going to fix it. or kill someone. one of those", from: 'wwx' }, { go: 'end' }],
      end: [free('fam')],
    },
  });

  // ── 6. A-Jie (cross-storyline beat 4: her bowl) ──────────────────
  // Everything sent here fails ("Not Delivered"); the thread itself does that. Anytime (also in the morning).
  const AJIE_DONE = [
    { wait: 3 },
    { log: 'Wrote to A-Jie’s disconnected number. Not Delivered', once: 'ajie' },
    { hint: 'Her bowl will be on the table on Sunday.' },
  ];
  scene({
    id: 'ajie_open',
    thread: 'ajie',
    trigger: { on: 'open', thread: 'ajie' },
    nodes: {
      start: [
        { fx: { set: { ajie_read: true } } },
        { wait: 5 },
        { choice: [
            { t: 'Your son turns eighteen on Sunday.', fx: { set: { ajie_wrote: true } }, go: 'sent' },
            { t: 'A-Xian is coming home on Sunday. He is bringing your pot.', if: (s) => !!F(s).wwx_invited && !F(s).burned, fx: { set: { ajie_wrote: true } }, go: 'sent' },
            { t: 'I told him about the fire. Low. Two hours.', if: (s) => !!F(s).told_recipe, fx: { set: { ajie_wrote: true } }, go: 'sent' },
            { t: 'He still writes to you. I thought someone should tell you.', fx: { set: { ajie_wrote: true } }, go: 'sent' },
            { t: '[Close the thread]', silent: true, go: 'closed' },
          ] },
      ],
      sent: AJIE_DONE,
      closed: [{ end: true }],
    },
  });
  scene({
    id: 'ajie_write',
    thread: 'ajie',
    trigger: { on: 'act', act: 'send', match: (p) => !!p && p.thread === 'ajie' },
    nodes: { start: [{ fx: { set: { ajie_wrote: true } } }].concat(AJIE_DONE) },
  });

  // ── 7. Total suspicion ≥ 25: they compare notes → Zidian (consequence: zidian_fall, writer C) ─
  scene({
    id: 'caught_total',
    thread: 'fam',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'ok is it just me', from: 'jl' },
        { m: 'or is jiujiu being SO weird tonight', from: 'jl' },
        { m: 'NOT JUST U', from: 'wwx' },
        { m: 'he used an emoji at me. a real one. on purpose', from: 'wwx' },
        { m: 'he was NICE to me. like on purpose nice. zero leg threats', from: 'jl' },
        { m: 'is he having a stroke. lan zhan is he having a stroke', from: 'wwx' },
        { typing: 5, from: 'lwj' },
        { m: 'I called the Golden Peony.', from: 'lwj' },
        { m: 'Jiang Wanyin is in Room 1808. The front desk woke him.', from: 'lwj' },
        { m: 'He says he lost his phone in a taxi at 23:36.', from: 'lwj' },
        { m: '…', from: 'wwx' },
        { m: '…', from: 'jl' },
        { m: 'then who have we been TALKING to', from: 'wwx' },
        { m: 'He asked the front desk for a laptop. And for the words "Find My".', from: 'lwj' },
        { choice: [
            { t: 'I can explain.', go: 'explain' },
            { t: 'I was only trying to help.', go: 'help' },
            { t: '[Turn the phone face down]', silent: true, go: 'down' },
          ] },
      ],
      explain: [
        { m: "u have about ten minutes. that's how long it takes him to find his shoes", from: 'wwx' },
        { go: 'end' },
      ],
      help: [
        { m: 'ok that is kind of sweet', from: 'wwx' },
        { m: "it's NOT sweet it's CREEPY", from: 'jl' },
        { m: 'run', from: 'jl' },
        { go: 'end' },
      ],
      down: [
        { m: 'stranger if ur reading this. run', from: 'jl' },
        { go: 'end' },
      ],
      end: [
        { wait: 6 },
        { fx: { set: { zidian: true } } },
        { log: 'The family compared notes. Jiang Cheng woke up in Room 1808 and asked for a laptop', once: 'zidian' },
        goTo('zidian_fall'),
        { end: true },
      ],
    },
  });

  S.onTotalSuspicion(25, 'caught_total');
})();
