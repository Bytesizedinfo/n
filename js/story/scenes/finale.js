/* Finale — Monday's 08:00 call from the real Childe (Wangsheng's landline), the recap, the 17:30 hand-back on Pier 7,
   and the rule-based ending. Also the short path (deal refused: Lost Mode at Saturday dawn) and the core mid-story
   endings that belong to no arc (total suspicion, a located Ripple post, a Harbor Ride lost-item report).
   Owner: S4 (core story). Facts: docs/STORY.md. Ending rules: js/story/endings.js. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;
  const F = (s) => s.flags;
  const H = () => JC.storyHelpers;
  const rule = (id) => (s) => H().endingRule(id, s);
  const top = (s) => { try { const q = S.qualifying(); return q.length ? q[0].id : 'honest'; } catch (e) { return 'honest'; } };
  const busy = () => !!S.call();

  const LOST = 'This phone belongs to a toy salesman. Please return it. Reward: one (1) fish. Call Wangsheng Funeral Parlor.';

  // ══════════════════════════════════════════════════════════════
  // Monday 08:00 — the real Childe calls from Wangsheng
  // ══════════════════════════════════════════════════════════════
  // The scene rings him through and watches the outcome: talked (truth or lie) → done; ignored or hung up on
  // before saying anything → he tries once more 30 s later; ignored twice → the cold path.
  S.scene({
    id: 'core_ws_mon', thread: 'wangsheng', arc: 'core', ch: 'mon', required: true,
    trigger: { on: 'time', at: '+3 08:00' },
    when: (s) => !F(s).lost_mode,
    nodes: {
      start: [
        { if: (s) => F(s).ws_talked, go: 'done' },
        { if: busy, go: 'line' },
        { call: 'call_ws_mon' },
        { wait: 2 },
        { go: 'watch' },
      ],
      line: [{ wait: 3 }, { go: 'start' }],
      watch: [
        { if: busy, go: 'w' },
        { wait: 2 },
        { if: (s) => F(s).ws_talked, go: 'done' },
        { fx: { inc: { ws_ignored: 1 } } },
        { if: (s) => (F(s).ws_ignored || 0) >= 2, go: 'cold' },
        { go: 'again' },
      ],
      w: [{ wait: 2 }, { go: 'watch' }],
      again: [
        { wait: 30 },
        { if: (s) => F(s).ws_talked, go: 'done' },
        { if: busy, go: 'again' },
        { call: 'call_ws_mon2' },
        { wait: 2 },
        { go: 'watch' },
      ],
      cold: [{ start: 'core_ws_cold' }, { go: 'done' }],
      done: [{ end: true }],
    },
  });
  // the cold path: the Fatui get there first, or the phone simply goes home
  const fatuiClose = (s) => s.susTotal() >= 15 || !!((F(s).osial_fake || F(s).osial_stalled || F(s).osial_refused) && !H().osialStopped(s));
  S.scene({
    id: 'core_ws_cold', thread: 'signora', arc: 'core', trigger: { on: 'manual' },
    nodes: {
      start: [
        { fx: { set: { ws_cold: true, finale: true } } },
        { wait: 8 },
        { if: fatuiClose, go: 'fatui' },
        { time: '+90m', card: 'He stops calling. An hour later, someone slides a Wangsheng VIP card under your door. On the back, in a hurried hand: “ok. I get it. leave it with the girl in the hat. — A.”' },
        { wait: 2 },
        { ending: 'honest' },
      ],
      fatui: [
        { notify: { app: 'findmy', title: 'Find My', body: 'This iPhone’s location is now being shared with Northland Bank Group IT.' } },
        { m: 'Tartaglia.', d: 2 },
        { m: 'You stopped answering your own funeral parlor. That was careless.' },
        { m: 'Stay where you are. Two of my colleagues are bringing tea.' },
        { wait: 4 },
        { ending: 'caught_fatui' },
      ],
    },
  });

  /** shared Monday call: `open` = the first lines (incoming, second try, or the player dialling) */
  function monNodes(open) {
    const truthOpt = { t: '"I found your phone on Pier 7 on Friday night. I’ve been you ever since."', label: '(Tell him the truth)', go: 'truth' };
    return {
      start: open.concat([
        { fx: { set: { ws_answered: true } } },
        { if: (s) => F(s).zl_contract, go: 'ctx_contract' },
        { if: (s) => F(s).zl_admitted, go: 'ctx_admitted' },
        { go: 'ctx_none' },
      ]),
      ctx_contract: [
        { say: 'Xiansheng told me about you. He said you signed a contract with him on Saturday morning.' },
        { if: (s) => F(s).zl_broken || F(s).morax_sold, go: 'ctx_broken' },
        { say: 'He said you kept it. He doesn’t say that about anybody. He barely says it about me.' },
        { go: 'who' },
      ],
      ctx_broken: [{ say: 'He won’t say anything else about you. He won’t say anything at all, actually. That’s new.' }, { go: 'who' }],
      ctx_admitted: [{ say: 'Xiansheng says you told him the truth on Saturday. He says that like it’s the highest compliment he knows. It probably is.' }, { go: 'who' }],
      ctx_none: [{ say: 'Four days. I’ve been lying in the dark hearing about you secondhand. You’ve been busy.' }, { go: 'who' }],
      who: [
        { say: 'So. Before anything else. Who am I talking to?' },
        { choice: [
          truthOpt,
          { t: '"This is Childe."', label: '(Lie) “This is Childe.”', go: 'lie_childe' },
          { t: '"I only found it this morning."', label: '(Lie) “I only found it this morning.”', go: 'lie_found' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      lie_childe: [
        { say: 'Ha! No, it isn’t. I’m Childe. I’d know. I’ve been him for twenty-two years.' },
        { say: 'Try again.' },
        { choice: [
          truthOpt,
          { t: '"I only found it this morning."', label: '(Lie) “I only found it this morning.”', go: 'lie_found' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      lie_found: [
        { say: 'This morning. On Pier 7.' },
        { if: (s) => F(s).gift_teucer, go: 'lf_gift' },
        { if: (s) => F(s).beat_teucer, go: 'lf_game' },
        { if: (s) => F(s).zl_admitted, go: 'lf_zl' },
        { say: 'Funny. My sister says I’ve been texting like a stranger since Friday.' },
        { go: 'lf_choice' },
      ],
      lf_gift: [{ say: 'Funny. My brother says I bought him a present on Saturday. The best present I’ve ever bought him, apparently.' }, { go: 'lf_choice' }],
      lf_game: [{ say: 'Funny. My brother says I beat his Reel Rush score on Saturday and he is never, ever forgiving me.' }, { go: 'lf_choice' }],
      lf_zl: [{ say: 'Funny. Xiansheng says he had a long talk with you on Saturday morning.' }, { go: 'lf_choice' }],
      lf_choice: [{ choice: [
        { t: '"…Okay. I’ve had it since Friday. I found it on the pier, and I’ve been you."', label: '(Come clean)', go: 'truth' },
        { t: '"Your sister’s wrong."', label: '(Stick to the lie)', go: 'lie_stick' },
        { t: '(Hang up)', go: 'hang' },
      ] }],
      lie_stick: [
        { say: '…Sure. Okay. You found it this morning.' },
        { say: 'Pier 7. Half past five. Bring it. That’s all I need from you.' },
        { fx: { set: { ws_talked: true, ws_lied: true } } },
        { hangup: true },
      ],

      truth: [
        { fx: { set: { told_truth: true, ws_talked: true, ws_truth: true } } },
        { say: '…Heh.' },
        { say: 'Okay. Okay. A stranger who answers my phone for four days. Sure. Why not.' },
        { say: 'Thanks for saying it straight. Nobody does that with me.' },
        { go: 'fam' },
      ],

      // ── his family ──
      fam: [
        { say: 'Teucer. Tonia. Where are they? Tell me the truth. I can take it. I think.' },
        { choice: [
          { t: '"They’re safe. They’re with people you trust."', go: 'fam_safe', if: (s) => H().kidsSafe(s) && !F(s).kids_rescued },
          { t: '"Pulcinella’s people had them. Your friends got them out."', go: 'fam_rescued', if: (s) => !!F(s).kids_rescued },
          { t: '"Pulcinella’s driver picked them up. They were at the Grand."', go: 'fam_grand', if: (s) => !!F(s).fatui_pickup && !F(s).kids_rescued },
          { t: '"They’re okay. I think. I did my best."', go: 'fam_unsure', if: (s) => !H().kidsSafe(s) && !F(s).fatui_pickup },
          { t: '"They’re fine. Everything’s fine."', label: '(Lie) “They’re fine. Everything’s fine.”', go: 'fam_lie', if: (s) => !H().kidsSafe(s) },
        ] },
      ],
      fam_safe: [
        { if: (s) => F(s).zl_pickup, go: 'fs_zl' },
        { if: (s) => F(s).lumine_pickup, go: 'fs_lumine' },
        { if: (s) => F(s).ekat_pickup, go: 'fs_ekat' },
        { if: (s) => F(s).yelan_protects_kids, go: 'fs_yelan' },
        { say: 'Safe. Okay. Okay.' },
        { go: 'fs_more' },
      ],
      fs_zl: [{ say: 'Xiansheng picked them up? Of course he did. He’s good with kids. He’s good at lying to them gently, too. Better than me.' }, { go: 'fs_more' }],
      fs_lumine: [{ say: 'Comrade picked them up? Ha! Teucer must have lost his mind. She has a SWORD.' }, { go: 'fs_more' }],
      fs_ekat: [{ say: 'Ekaterina. Of course. I’m giving her a raise. I’m giving her my office. I’m giving her the aquarium, if it ever thaws.' }, { go: 'fs_more' }],
      fs_yelan: [{ say: 'The Qixing’s spy has been watching my brother and sister. …I honestly don’t know whether to thank you or move house.' }, { go: 'fs_more' }],
      fs_more: [
        { if: (s) => F(s).gift_teucer, go: 'fs_gift' },
        { go: 'tonia' },
      ],
      fs_gift: [
        { say: 'He says I bought him something. He says it’s the best thing I’ve ever bought him, which is rude, because I once bought him a sled.' },
        { say: 'What did I buy him? …No. Don’t tell me. Let me find out from him.' },
        { go: 'tonia' },
      ],
      fam_rescued: [
        { say: 'They were taken? And you got them back?' },
        { say: '…' },
        { say: 'I owe you. I owe whoever walked into that hotel more than I can ever pay. And I’m good at paying.' },
        { go: 'tonia' },
      ],
      fam_grand: [
        { fx: { inc: { recap_hard: 1 } } },
        { say: '…Pulcinella’s driver.' },
        { say: 'Pulcinella taught me to fight. I was fourteen. He bought me my first spear and told me I was going to be somebody.' },
        { say: 'And now he’s going to use my brother and sister to keep me on a leash.' },
        { say: '…Not your fault. You didn’t know what that car was. I didn’t tell you.' },
        { go: 'tonia' },
      ],
      fam_unsure: [{ say: '…Okay. Thank you for not lying to me about it. Everybody else would have.' }, { go: 'tonia' }],
      fam_lie: [
        { fx: { inc: { recap_lies: 1 } } },
        { say: '…You paused before “fine”.' },
        { say: 'It’s okay. I do that too.' },
        { go: 'tonia' },
      ],
      tonia: [
        { if: (s) => F(s).told_tonia, go: 'tonia_q' },
        { go: 'zl' },
      ],
      tonia_q: [
        { say: 'And Tonia called Mama last night and said, quote, “he’s not a toy salesman and I don’t care.” Did you tell her?' },
        { choice: [
          { t: '"I told her the truth about the letter."', go: 'tonia_yes' },
          { t: '"No."', label: '(Lie) “No.”', go: 'tonia_no' },
        ] },
      ],
      tonia_yes: [
        { say: '…Good.' },
        { say: 'She deserved it. I’m a coward about her. I always have been. She’s braver than me and she knows it.' },
        { go: 'zl' },
      ],
      tonia_no: [
        { fx: { inc: { recap_lies: 1 } } },
        { say: 'Huh. Then she worked it out by herself. …Yeah. That’s Tonia.' },
        { go: 'zl' },
      ],

      // ── Zhongli ──
      zl: [
        { say: 'Okay. Next one. And be honest, because I’ll find out anyway.' },
        { say: 'Xiansheng.' },
        { say: '…Did you send it?' },
        { if: (s) => !F(s).memo_zl_heard && !F(s).memo_zl_sent, go: 'zl_explain' },
        { go: 'zl_q' },
      ],
      zl_explain: [{ say: 'There’s a voice memo. It says “don’t send” in the title. Did you—' }, { go: 'zl_q' }],
      zl_q: [{ choice: [
        { t: '"Yes. I sent it."', go: 'zl_sent', if: (s) => !!F(s).memo_zl_sent },
        { t: '"No."', label: '(Lie) “No.”', go: 'zl_sent_lie', if: (s) => !!F(s).memo_zl_sent },
        { t: '"No. I listened to it. I didn’t send it."', go: 'zl_kept', if: (s) => !F(s).memo_zl_sent && !!F(s).memo_zl_heard },
        { t: '"Send what?"', go: 'zl_what', if: (s) => !F(s).memo_zl_sent && !F(s).memo_zl_heard },
      ] }],
      zl_sent: [
        { say: 'You sent WHAT?' },
        { say: '…' },
        { say: '…' },
        { say: 'What did he say.' },
        { choice: [
          { t: '"He listened to it. More than once."', go: 'zl_sent_good', if: (s) => (s.aff.zl || 0) >= 5 },
          { t: '"He didn’t say much."', go: 'zl_sent_quiet', if: (s) => (s.aff.zl || 0) < 5 },
          { t: '"Ask him yourself."', go: 'zl_sent_ask' },
        ] },
      ],
      zl_sent_good: [{ say: '…More than once.' }, { say: '(A long breath, the kind you take before going under.)', from: 'sys' }, { say: 'Okay. Okay.' }, { go: 'zl_msg' }],
      zl_sent_quiet: [{ say: '…That’s how he says a lot, you know. Not saying much.' }, { say: 'Okay.' }, { go: 'zl_msg' }],
      zl_sent_ask: [{ say: 'Ha. Yeah. Yeah, I’ll— yeah. I’ll do that. Probably. Once I can feel my face.' }, { go: 'zl_msg' }],
      zl_sent_lie: [
        { fx: { inc: { recap_lies: 1 } } },
        { say: 'Huh. Okay.' },
        { say: 'Because Hu Tao says xiansheng has been sitting in her back room since Saturday listening to something on repeat with his eyes closed. But okay.' },
        { say: 'You’re a terrible liar. It’s almost nice.' },
        { go: 'zl_msg' },
      ],
      zl_kept: [
        { say: '…Good.' },
        { say: 'Good. Thank you.' },
        { say: '…Was it bad? It was bad, wasn’t it. I was drunk on osmanthus wine and I said “trade” like a banker.' },
        { choice: [
          { t: '"It was honest."', go: 'zl_kept_honest' },
          { t: '"You should tell him yourself."', go: 'zl_kept_tell' },
        ] },
      ],
      zl_kept_honest: [{ say: '…Yeah. That’s the problem with it.' }, { go: 'zl_msg' }],
      zl_kept_tell: [{ say: 'Yeah. Someday. When I’m brave.' }, { say: 'I’m brave about everything else. It’s so stupid.' }, { go: 'zl_msg' }],
      zl_what: [{ say: 'Nothing! Nothing. Good. Forget I asked. Forget the whole— good.' }, { go: 'zl_msg' }],

      zl_msg: [
        { if: (s) => F(s).zl_message, go: 'zl_msg_q' },
        { go: 'morax' },
      ],
      zl_msg_q: [{ choice: [
        { t: '"He asked me to give you a message: Thursday is still yours, and this time he is paying."', label: '(Deliver Zhongli’s message)', go: 'zl_msg_give' },
        { t: '(Keep it to yourself. Let him say it.)', go: 'zl_msg_keep' },
      ] }],
      zl_msg_give: [
        { fx: { set: { zl_msg_delivered: true }, aff: { zl: 1 } } },
        { say: '…He said that?' },
        { say: 'He’s PAYING? He doesn’t even have— he hasn’t carried Mora since I met him—' },
        { say: '(He laughs. It cracks in the middle.)', from: 'sys' },
        { say: 'Okay. Thursday. Okay.' },
        { go: 'morax' },
      ],
      zl_msg_keep: [
        { fx: { aff: { zl: -1 } } },
        { say: '…You had a look on your face just then. I can hear it.' },
        { say: 'Fine. Keep your secrets. Everybody else does.' },
        { go: 'morax' },
      ],

      morax: [
        { if: (s) => !!(F(s).zl_confessed || F(s).knows_morax) && !F(s).morax_sold, go: 'morax_q' },
        { go: 'osial' },
      ],
      morax_q: [{ choice: [
        { t: '"There’s something you should know about Zhongli. He’s Rex Lapis."', label: '(Tell him who Zhongli really is)', go: 'morax_tell' },
        { t: '(Keep Zhongli’s secret)', go: 'morax_keep' },
      ] }],
      morax_tell: [
        { fx: { set: { told_childe_morax: true } } },
        { if: (s) => F(s).morax_kept, go: 'morax_broke' },
        { if: (s) => F(s).morax_tell, go: 'morax_promise' },
        { go: 'morax_said' },
      ],
      morax_broke: [{ fx: { aff: { zl: -2 } } }, { go: 'morax_said' }],
      morax_promise: [{ fx: { aff: { zl: 1 } } }, { go: 'morax_said' }],
      morax_said: [
        { say: 'He’s—' },
        { say: '…' },
        { say: '(Nine seconds of silence. The longest of his life, probably.)', from: 'sys' },
        { say: '…The cranes. He always knew what the cranes were doing. He knew the name of every rock on the harbor.' },
        { say: 'And Osial. I pitched Osial to make Liyue’s god show his face, and he was sitting across the table from me. Every Thursday.' },
        { say: 'He let me pay for EVERYTHING.' },
        { go: 'osial' },
      ],
      morax_keep: [
        { if: (s) => F(s).morax_tell, go: 'morax_keep_promise' },
        { go: 'osial' },
      ],
      morax_keep_promise: [{ fx: { aff: { zl: -1 }, set: { morax_withheld: true } } }, { go: 'osial' }],

      // ── Osial ──
      osial: [
        { say: 'Last thing. Osial. Signora’s deadline was last night. What happened?' },
        { choice: [
          { t: '"I sent her the code."', go: 'os_sent', if: (s) => !!F(s).osial_sent },
          { t: '"Nothing happened."', label: '(Lie) “Nothing happened.”', go: 'os_sent_lie', if: (s) => !!F(s).osial_sent },
          { t: '"It’s stopped. It didn’t happen."', go: 'os_how', if: (s) => H().osialStopped(s) },
          { t: '"I didn’t give her the code. But I didn’t stop the money either."', go: 'os_none', if: (s) => !F(s).osial_sent && !H().osialStopped(s) },
        ] },
      ],
      os_sent: [
        { say: '…' },
        { say: 'Yeah. I saw the sea from the window. Hu Tao made me watch from the attic.' },
        { say: 'That one’s mine, not yours. I wrote that project in August because I was angry and bored and I wanted to see a god.' },
        { say: '…Well. I think I saw one.' },
        { go: 'quit' },
      ],
      os_sent_lie: [
        { fx: { inc: { recap_lies: 1 } } },
        { say: 'The sea came up to the second step of Feiyun Slope last night. Don’t.' },
        { go: 'quit' },
      ],
      os_how: [
        { say: 'How?' },
        { if: (s) => F(s).leaked_yelan, go: 'os_yelan' },
        { go: 'os_2' },
      ],
      os_yelan: [{ say: 'The Qixing’s spy has the protocol? …She’s going to be insufferable about it. Good.' }, { go: 'os_2' }],
      os_2: [{ if: (s) => F(s).leaked_ning, go: 'os_ning' }, { go: 'os_3' }],
      os_ning: [{ say: 'You mailed it to Ningguang. To the TIANQUAN. Ha! That’s the most dangerous thing anyone’s done with my email.' }, { go: 'os_3' }],
      os_3: [{ if: (s) => F(s).ops_sabotage, go: 'os_ops' }, { go: 'os_4' }],
      os_ops: [{ say: 'The Liyue Branch did something to the resonators? Lyuba’s report just says “lovingly”. I’m scared to ask.' }, { go: 'os_4' }],
      os_4: [{ if: (s) => F(s).card_frozen, go: 'os_card' }, { go: 'os_5' }],
      os_card: [{ say: 'And you froze my card. So the wire never went. And I couldn’t buy anything. Heh. Fair.' }, { go: 'os_5' }],
      os_5: [{ if: (s) => F(s).zl_amended, go: 'os_zl' }, { go: 'os_done' }],
      os_zl: [{ say: 'And xiansheng went to the Golden House and “read a contract very carefully”. That’s all he’ll say. He said it with a straight face.' }, { go: 'os_done' }],
      os_done: [{ say: 'So it’s over. Osial’s asleep, and my name’s still on every page, and somehow I’m still standing.' }, { go: 'quit' }],
      os_none: [
        { say: '…Then she’ll pin it on me. Three million Mora gone, and my signature on every page.' },
        { say: 'Heh. Classic Rosalyne.' },
        { say: 'That’s okay. That’s a fight I know how to have.' },
        { go: 'quit' },
      ],

      // ── what now ──
      quit: [
        { say: '…Okay. That’s everything.' },
        { say: 'Funny. I spent four days in a box deciding whether to go back to them or not.' },
        { choice: [
          { t: '"Quit. Today. You have a way out."', go: 'urge' },
          { t: '"Go back and fight them from the inside."', go: 'inside' },
          { t: '"That’s your call, not mine."', go: 'yours' },
        ] },
      ],
      urge: [
        { if: rule('defector'), go: 'defect' },
        { say: 'With what?' },
        { if: (s) => !((F(s).leaked_yelan && F(s).yelan_protects_childe) || F(s).leaked_ning), go: 'cant_proof' },
        { go: 'cant_2' },
      ],
      cant_proof: [{ say: 'My name’s on every page of that protocol, and nobody outside the bank who could protect me has seen it.' }, { go: 'cant_2' }],
      cant_2: [{ if: (s) => !F(s).card_frozen, go: 'cant_money' }, { go: 'cant_3' }],
      cant_money: [{ say: 'The money moves on my signature. Nobody stopped it.' }, { go: 'cant_3' }],
      cant_3: [{ if: (s) => !H().kidsSafe(s), go: 'cant_kids' }, { go: 'cant_4' }],
      cant_kids: [{ say: 'And they know exactly where my brother and sister are.' }, { go: 'cant_4' }],
      cant_4: [{ if: (s) => !F(s).ekat_warned, go: 'cant_ekat' }, { go: 'cant_end' }],
      cant_ekat: [{ say: 'And Ekaterina’s still at that desk. They’d start with her. They always start with whoever’s nearest.' }, { go: 'cant_end' }],
      cant_end: [{ say: 'Not today.' }, { say: '…But thanks. Nobody’s ever told me to before.' }, { go: 'meet' }],
      defect: [
        { say: '…A way out.' },
        { say: 'The protocol’s with people who can’t be bought. The money’s frozen. Ekaterina’s safe. The kids are safe.' },
        { say: '…Huh.' },
        { say: 'Yeah. Yeah, okay. I’ve never quit anything in my life. Might be fun.' },
        { fx: { set: { defected: true } } },
        { go: 'meet' },
      ],
      inside: [{ say: 'Ha. That’s what I always say. It sounds different when someone else says it.' }, { go: 'meet' }],
      yours: [{ say: 'Yeah. It is.' }, { say: 'Weird. Everybody else has been making my calls all weekend. Including you.' }, { go: 'meet' }],

      meet: [
        { if: (s) => F(s).deal_paid, go: 'meet_paid' },
        { say: 'Pier 7. Half past five. Bring my phone. I’ll bring… I don’t know. A fish.' },
        { go: 'meet_end' },
      ],
      meet_paid: [
        { say: 'Pier 7. Half past five. Bring my phone. I’ll bring your Mora.' },
        { if: (s) => F(s).deal_paid === 2, go: 'meet_double' },
        { say: 'And a fish.' },
        { go: 'meet_end' },
      ],
      meet_double: [{ say: 'Double. I remember. I’m a man of my word. Ask anyone. Don’t ask Signora.' }, { go: 'meet_end' }],
      meet_end: [
        { say: 'And— hey.' },
        { if: (s) => (F(s).recap_lies || 0) >= 2, go: 'meet_cool' },
        { say: 'Thanks. Really.' },
        { hangup: true },
      ],
      meet_cool: [{ say: 'Never mind. See you there.' }, { hangup: true }],

      hang: [{ hangup: 'me' }],
    };
  }

  S.call({
    id: 'call_ws_mon', from: 'wangsheng', ring: 25,
    nodes: monNodes([
      { say: '(The Wangsheng landline. Somewhere close, a gong struck once, very hard. A girl’s voice: “HE’S AWAKE!”)', from: 'sys' },
      { say: 'Ow. Okay. Hi.' },
      { say: 'Hey. It’s me. The guy whose phone you’ve got. The real one.' },
    ]),
  });
  S.call({
    id: 'call_ws_mon2', from: 'wangsheng', ring: 25,
    nodes: monNodes([
      { say: '(The Wangsheng landline, again.)', from: 'sys' },
      { say: 'Hey. Don’t hang up on me twice. It’s bad for my ego, and my ego is load-bearing.' },
    ]),
  });
  S.call({
    id: 'call_ws_mon_out', from: 'wangsheng',
    nodes: monNodes([
      { say: 'Wangsheng Funeral Parlor, Hu Tao spea— oh! It’s YOU. Hold on.' },
      { say: '(Off the phone:) MISTER HARBINGER! PHONE! IT’S YOUR PHONE! CALLING YOU!' },
      { say: '(Footsteps. A heavy lid sliding. Someone tall hitting his head on something.)', from: 'sys' },
      { say: 'Ow. Hi. It’s me.' },
    ]),
  });
  S.call({
    id: 'call_ws_mon_after', from: 'wangsheng',
    nodes: {
      start: [
        { say: 'Wangsheng Funeral Parlor! Oh, it’s you again~ He’s getting ready. He’s ironing a scarf. Why does he own an iron? Why does a man who lives in a coffin own an IRON?' },
        { say: 'See you at the pier! I’m not coming. I’m definitely not coming. Byeee~' },
        { hangup: true },
      ],
    },
  });

  // ══════════════════════════════════════════════════════════════
  // Monday 17:30 — the hand-back on Pier 7
  // ══════════════════════════════════════════════════════════════
  S.scene({
    id: 'core_pier_pre', thread: 'ht', arc: 'core', ch: 'mon',
    trigger: { on: 'time', at: '+3 17:08' },
    when: (s) => !F(s).lost_mode && !F(s).ws_cold,
    nodes: {
      start: [
        { if: (s) => F(s).ht_ally || F(s).zl_contract, go: 'ally' },
        { m: 'someone very tall just left my parlor wearing my coat' },
        { m: 'if you see him, tell him it’s dry clean only 👻' },
        { go: 'ekat' },
      ],
      ally: [
        { m: 'he LEFT!! he’s coming!!' },
        { m: 'he borrowed my coat!!! it’s too small for him!!! he looks like a sausage in a funeral 👻' },
        { m: 'good luck phone person. it was fun haunting this weekend with you' },
        { go: 'ekat' },
      ],
      ekat: [
        { if: (s) => F(s).ekat_warned, go: 'ekat_safe' },
        { m: 'Sir? A message came for you through the parlor: “Pier 7, half five, bring the fish.” I don’t know what it means. I’m passing it on.', th: 'ekat', from: 'ekat' },
        { end: true },
      ],
      ekat_safe: [
        { m: 'Whoever you are. I’m told it’s Pier 7 at half past five. I’ve told everyone at the branch to stay away.', th: 'ekat', from: 'ekat' },
        { m: '(They won’t.)', th: 'ekat', from: 'ekat' },
      ],
    },
  });

  S.scene({
    id: 'core_pier', thread: 'zl', arc: 'core', ch: 'mon', required: true,
    trigger: { on: 'time', at: '+3 17:30' },
    when: (s) => !F(s).lost_mode && !F(s).ws_cold,
    nodes: {
      start: [
        { fx: { set: { finale: true } } },
        { if: busy, go: 'hold' },
        { if: (s) => F(s).osial_sent, go: 'c_broken' },
        { time: '+0m', card: 'Monday, 5:30 PM. Pier 7. The bench is where it was. The tea is long gone. The sea doesn’t look any different from Friday night, which seems unfair of it.' },
        { go: 'c2' },
      ],
      hold: [{ wait: 4 }, { go: 'start' }],
      c_broken: [
        { time: '+0m', card: 'Monday, 5:30 PM. What’s left of Pier 7. Half the boards are gone, and the bench stands on its own little island of planks. You sit on it anyway.' },
        { go: 'c2' },
      ],
      c2: [
        { time: '+1m', card: 'You turn the phone over in your hands one last time. The crooked sticker. The little red fish. Four days of somebody else’s life, still warm from your pocket.' },
        { if: (s) => !F(s).ws_talked, go: 'c_never' },
        { go: 'c3' },
      ],
      c_never: [
        { time: '+1m', card: 'You never answered his calls. He came anyway. Of course he did. He has never once in his life waited to be invited.' },
        { go: 'c3' },
      ],
      c3: [
        { if: (s) => ['contract', 'fulfilled'].includes(top(s)), go: 'c_zl' },
        { if: (s) => top(s) === 'godofcontracts', go: 'c_zl_cold' },
        { if: (s) => top(s) === 'comrades', go: 'c_ops' },
        { if: (s) => top(s) === 'fishfry', go: 'c_fry' },
        { if: (s) => top(s) === 'twins', go: 'c_lumine' },
        { if: (s) => top(s) === 'true', go: 'c_crowd' },
        { go: 'c4' },
      ],
      c_zl: [{ time: '+1m', card: 'Someone sits down beside you on the bench without a word: a long dark coat, amber eyes, the smell of osmanthus. Zhongli looks at the sea. So do you. Neither of you needs to say anything yet.' }, { go: 'c4' }],
      c_zl_cold: [{ time: '+1m', card: 'Zhongli is standing at the railing at the end of the pier. He doesn’t turn around when you sit down. He doesn’t need to. You can feel exactly how far away he is.' }, { go: 'c4' }],
      c_ops: [{ time: '+1m', card: 'Six people in Northland Bank uniforms are standing at the end of the pier in a very straight line, trying very hard to look as if they are not waiting for anybody.' }, { go: 'c4' }],
      c_fry: [{ time: '+1m', card: 'Somebody has set up a grill at the end of the pier. It smells incredible. A very large man in armour waves a spatula at you.' }, { go: 'c4' }],
      c_lumine: [{ time: '+1m', card: 'Lumine is sitting on the railing with her pack already on and her sword across her knees. Paimon is asleep on top of the pack, holding a dumpling.' }, { go: 'c4' }],
      c_crowd: [{ time: '+1m', card: 'Pier 7 is strangely crowded for a Monday. Nobody is fishing. Everybody is pretending to.' }, { go: 'c4' }],
      c4: [
        { if: (s) => top(s) === 'vigil', go: 'c_cuffs' },
        { if: (s) => F(s).ws_lied, go: 'c_lied' },
        { time: '+1m', card: 'Footsteps on the boards behind you. Fast. The way he does everything.' },
        { go: 'last' },
      ],
      c_cuffs: [{ time: '+1m', card: 'Footsteps on the boards behind you: three sets. Two of them belong to the Millelith.' }, { go: 'last' }],
      c_lied: [{ time: '+1m', card: 'Footsteps on the boards behind you, unhurried. He knows you lied to him this morning. He has decided to let you watch him know it.' }, { go: 'last' }],
      last: [
        // he types these himself, the moment the phone is his again
        { if: (s) => F(s).zl_broken || F(s).morax_sold, go: 'last_fam' },
        { me: 'xiansheng. it’s me. the real one 🐟', th: 'zl' },
        { go: 'last_fam' },
      ],
      last_fam: [
        { if: (s) => F(s).fatui_pickup && !F(s).kids_rescued, go: 'fin' },
        { me: 'it’s me!! the real one!! did everyone miss me?? 😁', th: 'fam' },
        { go: 'fin' },
      ],
      fin: [{ wait: 1 }, { endings: 'finale' }],
    },
  });

  // ══════════════════════════════════════════════════════════════
  // The short path: the deal was refused → Saturday dawn, Lost Mode
  // ══════════════════════════════════════════════════════════════
  S.scene({
    id: 'core_short', thread: 'unknown', arc: 'core', trigger: { on: 'manual' },
    nodes: {
      start: [
        { fx: { set: { deal_refused: true, lost_mode: true, finale: true } } },
        { if: (s) => F(s).deal_hungup, go: 'hung' },
        { go: 'dawn' },
      ],
      hung: [{ m: 'you hung up. ok' }, { m: 'that’s a no, then. fair' }, { go: 'dawn' }],
      dawn: [
        { wait: 3 },
        { time: '+1 07:05', card: 'Saturday, 7:05 AM. You took his phone home and left it face down on the kitchen table, and you didn’t sleep much. When you turn it over, the screen has changed.' },
        { run: (api) => { try { api.os.lostMode({ message: LOST, phone: '(0761) 555 0144', contact: 'wangsheng' }); } catch (e) { /* optional */ } } },
        { notify: { app: 'findmy', title: 'Find My', body: 'This iPhone has been marked as lost. A message from the owner is shown on the Lock Screen.' } },
        { wait: 3 },
        { m: 'BROTHER WE CAN SEE THE SEA!!! 🐟🐟🐟 the plane is going DOWN on purpose!!', th: 'teucer', from: 'teucer' },
        { m: 'Ajax. Why does Find My say your phone is lost?', th: 'tonia', from: 'tonia' },
        { if: (s) => F(s).fatui_pickup, go: 'mama_fatui' },
        { m: 'They land in half an hour!! Did you get my messages, my sun? Eat something before the airport ❤️', th: 'mama', from: 'mama' },
        { go: 'ring' },
      ],
      mama_fatui: [
        { m: 'Mr. Pulcinella says his driver will be waiting for them with a sign!! So kind ❤️ Did you get my messages, my sun?', th: 'mama', from: 'mama' },
        { go: 'ring' },
      ],
      ring: [
        { wait: 10 },
        { if: (s) => F(s).ws_talked, go: 'end' },
        { if: busy, go: 'ring' },
        { call: 'call_ws_short' },
        { wait: 2 },
        { go: 'end' },
      ],
      // whether he got through (incoming or the Lost Mode “Call” button) or not, the morning ends here
      end: [{ wait: 3 }, { if: busy, go: 'end' }, { endings: 'finale' }],
    },
  });

  function shortNodes(open) {
    return {
      start: open.concat([
        { fx: { set: { ws_talked: true } } },
        { if: (s) => F(s).deal_hungup, go: 'hungup' },
        { say: 'Hey. It’s me. The guy you said no to.' },
        { go: 'main' },
      ]),
      hungup: [{ say: 'Hey. It’s me. The guy you hung up on.' }, { go: 'main' }],
      main: [
        { say: 'That’s fine. Really. You don’t owe me anything.' },
        { say: 'But you’ve still got my phone. So let’s do this the easy way.' },
        { choice: [
          { t: '"I’m sorry. I couldn’t do it."', go: 'sorry' },
          { t: '"Where do I bring it?"', go: 'where' },
          { t: '"I almost said yes."', go: 'almost' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      sorry: [{ say: 'Don’t be. Honestly? Smartest thing anyone’s done all weekend. I wouldn’t have done it for me either.' }, { go: 'where' }],
      almost: [{ fx: { set: { told_truth: true } } }, { say: '…Heh. Almost counts for something. Not much. Something.' }, { go: 'where' }],
      where: [
        { say: 'Wangsheng Funeral Parlor, up on Feiyun Slope. Leave it with the girl in the hat. She’ll pretend she’s never heard of me. Let her.' },
        { if: (s) => F(s).fatui_pickup && !F(s).kids_rescued, go: 'kids_bad' },
        { if: (s) => H().kidsSafe(s), go: 'kids_ok' },
        { say: 'I’ll find a way to get to the airport myself. Don’t worry about it. Worrying is my job.' },
        { go: 'bye' },
      ],
      kids_bad: [
        { say: 'And my brother and sister land in half an hour, and Pulcinella’s driver is going to be standing there with a sign. I know.' },
        { say: 'Not your problem. It was never your problem.' },
        { say: '…I’ll handle it.' },
        { go: 'bye' },
      ],
      kids_ok: [
        { say: 'And somebody’s meeting the kids at the airport. Somebody you sorted out before you said no?' },
        { say: '…Thanks. That’s more than I’d have done for a stranger.' },
        { go: 'bye' },
      ],
      bye: [
        { say: 'Leave the fish charm on. Teucer made it.' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    };
  }
  S.call({
    id: 'call_ws_short', from: 'wangsheng', ring: 25,
    nodes: shortNodes([{ say: '(The Wangsheng landline. Behind the voice, a girl is singing a funeral song to the tune of a nursery rhyme.)', from: 'sys' }]),
  });
  S.call({
    id: 'call_ws_short_out', from: 'wangsheng',
    nodes: shortNodes([
      { say: 'Wangsheng Funeral Parlor, Hu Tao spea— ooh. The lost phone is calling. Hold on~' },
      { say: '(A heavy lid sliding. Somebody tall hitting his head.)', from: 'sys' },
    ]),
  });
  // ══════════════════════════════════════════════════════════════
  // Core mid-story endings (no arc owns these triggers)
  // ══════════════════════════════════════════════════════════════
  // total suspicion ≥ 25 → Fatui Hospitality
  S.scene({
    id: 'core_caught_total', thread: 'signora', arc: 'core',
    trigger: { on: 'sus', who: 'total', at: 25, delay: 6 },
    when: (s) => !F(s).lost_mode,
    nodes: {
      start: [
        { notify: { app: 'findmy', title: 'Find My', body: 'This iPhone’s location is now being shared with Northland Bank Group IT.' } },
        { m: 'Tartaglia.', d: 2 },
        { m: 'Or whoever you are. Half of Liyue has noticed you are not him. I noticed on Friday.' },
        { m: 'Stay exactly where you are. Two of my colleagues are bringing tea.' },
        { wait: 5 },
        { ending: 'caught_fatui' },
      ],
    },
  });
  // a Ripple post with a location after Saturday noon → they know where the phone is
  S.onAct({
    id: 'core_post_loc', act: 'post', once: true, arc: 'core',
    match: (p, s) => !!(p && (p.loc || p.place)) && s.now >= JC.time.parse('+1 12:00') && !F(s).lost_mode,
    start: 'core_caught_post', delay: 4,
  });
  S.scene({
    id: 'core_caught_post', thread: 'signora', arc: 'core', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'A photograph. With a location. How generous of you, Tartaglia.', d: 2 },
        { m: 'Stay there.' },
        { wait: 5 },
        { ending: 'caught_fatui' },
      ],
    },
  });
  // Harbor Ride → report the phone as a found item → Return to Sender
  S.scene({
    id: 'core_reported_lost', thread: 'ride', arc: 'core',
    trigger: { on: 'act', act: 'ride_report_lost', delay: 3 },
    nodes: {
      start: [
        { m: 'Harbor Ride Lost & Found: Thanks for your report. We’ve matched it to a trip on 16/10 (Liuli Pavilion → Pier 7) and notified the account holder.' },
        { m: 'Harbor Ride: Your driver Mr. Fang will collect the item from you. He says, and we quote: “I knew that young man would lose something. He spent the whole ride looking at the other one instead of his pockets.”' },
        { fx: { set: { reported_lost: true, told_truth: true } } },
        { wait: 4 },
        { ending: 'honest' },
      ],
    },
  });
})();
