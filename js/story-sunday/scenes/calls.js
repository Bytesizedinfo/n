/* "Sunday at Lotus Pier" — calls: Wen Ning's towing call (and his Sunday), Wei Wuxian's FaceTime, and what
   happens when the player calls people. Your voice is not Jiang Cheng's: speaking is risky, silence often works.
   Nothing here ends the game: a confession on a call sends the phone back tonight (early_return, writer C);
   Wen Ning finding out makes him an accomplice (wn_accomplice, below); getting caught → zidian_fall (writer C).
   Table flags set here: wn_invited, wn_accomplice/wn_knows, wwx_invited/wwx_maybe, told_truth/returned_early/returned_how,
   zidian. Facts: docs/STORY.md. Notes: docs/sunday/a.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => s.flags || {};
  const night = (s) => !F(s).night_done;
  /** start a consequence scene another writer owns (it may not exist yet: warn instead of failing) */
  const goTo = (id) => ({ run: () => {
    if (!S.defs.scenes[id]) { console.warn('[sunday] consequence scene missing:', id); return; }
    if (!S.view().done[id]) S.start(id);
  } });
  /** The Honest Stranger, Sunday edition: the flags (set inside the call, so they stick even if the player hangs up) */
  const told = (how, who) => ({ fx: { set: { told_truth: true, returned_early: true, returned_how: how, told_to: who } } });
  const zidian = [{ fx: { set: { zidian: true } } }, goTo('zidian_fall'), { end: true }];
  const WN_IN = { hint: 'Wen Ning will be at the table.' };

  // The phone goes back tonight (started from a call, so it still happens after the call is hung up).
  S.scene({ id: 'call_truth_after', thread: 'ea', trigger: { on: 'manual' }, nodes: { start: [{ wait: 3 }, goTo('early_return'), { end: true }] } });

  // ── Wen Ning calls about the tow ─────────────────────────────────
  S.call({
    id: 'call_wn',
    from: 'wn',
    ring: 25,
    missed: [{ start: 'wn_after_missed' }],
    onHangup: [{ start: 'wn_after_hangup' }],
    voicemail: "Mr. Jiang, it's Wen Ning. Sorry. About the car — I'm still in Lanling, I have the van and a tow rope. I'll go to Koi Tower unless you say no. Sorry. Okay. Bye. Sorry.",
    nodes: {
      start: [
        { say: 'M-Mr. Jiang?' },
        { say: "It's Wen Ning. Sorry. Sorry for calling so late." },
        { say: 'Jin Ling said you wanted me to… the car. The pond. I have a tow rope. I always have a tow rope. Sorry.' },
        { say: 'Is it all right if I tow it?' },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: '"…Mm."', go: 'mm' },
            { t: '"Thank you, Wen Ning."', go: 'voice' },
            { t: `"Wen Ning. I'm not Jiang Cheng."`, go: 'truth' },
          ] },
      ],
      silent: [
        { say: '…Mr. Jiang?' },
        { say: "I'll— I'll take that as a yes. You don't have to say anything. I know you don't like talking to me." },
        { say: "I'll be careful with the koi. Sorry. Bye." },
        { fx: { set: { wn_towed: true } } },
        { start: 'wn_tow_done' },
        { hangup: true },
      ],
      mm: [
        { say: 'O-okay! Mm. Okay.' },
        { say: "I'll be careful with the koi. Thank you for— I mean— sorry. I'll go now." },
        { fx: { set: { wn_towed: true } } },
        { start: 'wn_tow_done' },
        { hangup: true },
      ],
      voice: [
        { say: '…' },
        { say: "Mr. Jiang doesn't— um." },
        { say: "Mr. Jiang has only said thank you to me once. Last Saturday. It didn't sound like— your voice is— sorry. Who is this?" },
        { fx: { set: { wn_realized: true } } },
        { choice: [
            { t: '"…Mm." (lower, gruffer)', go: 'recover' },
            { t: '"I found his phone in a taxi."', go: 'truth' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      recover: [
        { say: 'O-oh! Sorry! Sorry. The line is bad. You sound like you have a cold.' },
        { say: "I'll tow it. Please drink something warm. Sorry." },
        { fx: { set: { wn_towed: true, wn_realized: false }, sus: { wn: 3 } } },
        { start: 'wn_tow_done' },
        { hangup: true },
      ],
      truth: [
        { say: '…Oh.' },
        { say: "Oh no. Is he— is Mr. Jiang all right? He's at the Golden Peony, isn't he. He always stays at the Golden Peony." },
        { say: "I won't tell anyone. I'm not good at telling people things." },
        { say: "I'll tow the car first. The koi have had a long night. Then— let me think. I'll text you. Sorry. That was a lot of words." },
        { fx: { set: { told_truth: true, told_to: 'wn', wn_told: true, wn_knows: true, wn_accomplice: true, wn_towed: true } } },
        { start: 'wn_accomplice' },
        { hangup: true },
      ],
      hang: [
        { fx: { set: { wn_knows: true, wn_accomplice: true, wn_towed: true } } },
        { start: 'wn_accomplice' },
        { hangup: 'me' },
      ],
    },
  });

  S.scene({
    id: 'wn_after_hangup',
    thread: 'wn',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => F(s).wn_realized || F(s).wn_accomplice, go: 'realized' },
        { if: (s) => F(s).wn_towed, go: 'done' },
        { wait: 6 },
        { m: "Sorry, I think we got cut off. I'll tow it unless you say no. Sorry. — Wen Ning" },
        { fx: { set: { wn_towed: true } } },
        { start: 'wn_tow_done' },
      ],
      realized: [{ fx: { set: { wn_knows: true, wn_accomplice: true, wn_towed: true } } }, { start: 'wn_accomplice' }],
      done: [{ end: true }],
    },
  });

  S.scene({
    id: 'wn_after_missed',
    thread: 'wn',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { wait: 20 },
        { m: "Mr. Jiang, sorry. I called about the car. I'm still at Koi Tower with the van." },
        { m: "I'll tow it unless you say no. — Wen Ning" },
        { choice: [
            { t: 'Do it.', fx: { set: { wn_towed: true } }, go: 'yes' },
            { t: 'No.', go: 'no' },
            { t: 'Thank you, Wen Ning.', fx: { set: { wn_towed: true }, sus: { wn: 1 } }, go: 'thanks' },
          ] },
      ],
      yes: [{ m: 'Okay! Doing it. Sorry. — Wen Ning' }, { start: 'wn_tow_done' }],
      no: [
        { fx: { set: { wn_declined: true } } },
        { m: "Okay. Sorry. I'll go home. — Wen Ning" },
        { m: '(The koi look a little worried, though.)' },
      ],
      thanks: [
        { m: '!!' },
        { m: "Y-you're welcome, Mr. Jiang!! That's twice this month!!" },
        { m: "Sorry. I'm just— I'm very happy. Okay. Towing. — Wen Ning" },
        { start: 'wn_tow_done' },
      ],
    },
  });

  // The tow, then the van on Sunday (cross-storyline beat 3).
  S.scene({
    id: 'wn_tow_done',
    thread: 'wn',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { wait: 60 },
        { m: 'Done. The car is out. The koi are all fine. I counted them with Jin Ling. Twenty-three.', img: 'p_wn_van' },
        { m: "Sandu is in the Golden Peony garage. I gave the keys to the night manager. Sorry, I didn't know where else. — Wen Ning" },
        { fx: { set: { car_handled: true } } },
        { log: 'Let Wen Ning tow Sandu out of the koi pond with his radish van', once: 'wn:tow' },
        { m: 'wen ning towed it!!! with a ROPE. his van says yiling radish co on the side. everyone is filming', th: 'jl', from: 'jl' },
        { m: 'he apologized to the koi', th: 'jl', from: 'jl' },
        { if: (s) => !night(s) || !!(F(s).wn_invited || F(s).wn_accomplice || F(s).wn_sunday_asked), go: 'end' },
        { wait: 25 },
        { fx: { set: { wn_sunday_asked: true } } },
        { if: (s) => !!F(s).burned, go: 'ask_gate' },
        { if: (s) => !!F(s).wn_may_ask, go: 'ask_may' },
        { m: 'Mr. Jiang, sorry. One more thing.' },
        { m: "Wei Wuxian asked if I could drive them on Sunday. To Lotus Pier. In the van. Is that all right? I'll wait outside. I don't mind waiting. I have a thermos. — Wen Ning" },
        { go: 'q' },
      ],
      ask_may: [
        { m: "Mr. Jiang, sorry. Wei Wuxian says you said I could ask you myself. So I'm asking. Sorry." },
        { m: "On Sunday, may I drive them to Lotus Pier? I'll wait outside. I have a thermos. — Wen Ning" },
        { go: 'q' },
      ],
      ask_gate: [
        { m: "Mr. Jiang, sorry. Wei Wuxian asked me to drive them to Lotus Pier on Sunday. He said 'only as far as the gate'." },
        { m: "I don't know what that means. He sounded sad. Should I still bring the van? — Wen Ning" },
        { go: 'q' },
      ],
      q: [
        { choice: [
            { t: 'Drive them. Then come in and eat.', fx: { set: { wn_invited: true } }, go: 'in' },
            { t: 'Six-thirty. Park inside the gate.', fx: { set: { wn_invited: true } }, go: 'gate' },
            { t: 'Drive them.', fx: { set: { wn_drives: true } }, go: 'drive' },
            { t: 'Thank you, Wen Ning!! Please stay for dinner 🙏', fx: { set: { wn_invited: true }, sus: { wn: 2 } }, go: 'sweet' },
          ], timeout: 120, onTimeout: 'quiet' },
      ],
      in: [
        { m: 'Come in?' },
        { m: 'And eat? At the table?' },
        { m: "Sorry. I'm going to sit in the van for a minute. — Wen Ning" },
        { log: 'Told Wen Ning to come in and eat on Sunday. His first dinner at Lotus Pier since 2008', once: 'wn:invited' },
        WN_IN,
      ],
      gate: [
        { m: "Inside the gate. Okay. Okay. Should I bring something? I'll bring something. Sorry. — Wen Ning" },
        { m: "(Wei Wuxian says 'inside the gate' means come in. He's crying. Is that right?) — Wen Ning" },
        { log: 'Told Wen Ning to park inside the Lotus Pier gate on Sunday. He understood, eventually', once: 'wn:invited' },
        WN_IN,
      ],
      drive: [
        { m: "Okay! I'll drive. I'll wait outside. It's a good van for waiting. — Wen Ning" },
        { log: 'Asked Wen Ning to drive the Lans to Lotus Pier on Sunday. Only to drive', once: 'wn:drive' },
      ],
      sweet: [
        { m: '…' },
        { m: "Mr. Jiang, are you all right? You said so many words. And the little hands. Sorry. Thank you. I'll come. Sorry. — Wen Ning" },
        { log: 'Invited Wen Ning to stay for dinner on Sunday, with folded hands', once: 'wn:invited' },
        WN_IN,
      ],
      quiet: [{ m: "I'll bring the van and wait outside. That's fine. Sorry for asking. — Wen Ning" }],
      end: [{ end: true }],
    },
  });

  // Wei Wuxian told him he's invited in (wwx_wenning, family.js) — or the player said it on the phone.
  S.scene({
    id: 'wn_told',
    thread: 'wn',
    polite: true,
    trigger: { on: 'manual' },
    when: night,
    nodes: {
      start: [
        { fx: { set: { wn_sunday_asked: true } } },
        { if: (s) => !!F(s).wn_accomplice, go: 'knows' },
        { m: "Mr. Jiang, sorry. Wei Wuxian just called me. He was crying a little. Good crying, he says." },
        { m: 'He says you said I should come in on Sunday. And eat. At the table.' },
        { m: "Is that true? I can just drive. I don't mind. — Wen Ning" },
        { choice: [
            { t: "It's true. Six-thirty.", go: 'yes' },
            { t: 'Bring the thermos anyway.', go: 'thermos' },
            { t: '[Leave him on read]', silent: true, go: 'read' },
          ], timeout: 120, onTimeout: 'read' },
      ],
      yes: [{ m: 'Okay.' }, { m: "Okay. Thank you. I'll bring something. Not soup. Wei Wuxian says if I bring soup he'll fight me. — Wen Ning" }],
      thermos: [{ m: "…Okay! Tea in the thermos. For after. Sorry. Thank you. — Wen Ning" }],
      read: [{ m: "I'll take that as a— I'll come. Wei Wuxian says silence is a yes from you. He has a notebook. — Wen Ning" }],
      knows: [
        { m: 'Wei Wuxian says Mr. Jiang said I should come in on Sunday.' },
        { m: 'I know it was you who said it. Sorry.' },
        { m: "It was a kind thing to say. I'll wait and hear it from him. But I'll iron my shirt, just in case. — Wen Ning" },
      ],
    },
  });

  // ── Consequence: Wen Ning Saw Nothing (docs/SUNDAY.md) ───────────
  // He realized, or you told him. The night goes on: he covers for you and takes the phone back in the morning.
  S.scene({
    id: 'wn_accomplice',
    thread: 'wn',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { fx: { set: { wn_knows: true, wn_accomplice: true } } },
        { wait: 8 },
        { if: (s) => !!(F(s).wn_told || F(s).told_truth), go: 'told' },
        { m: "I'm sorry. I know it isn't Mr. Jiang. I won't tell anyone. — Wen Ning" },
        { go: 'plan' },
      ],
      told: [
        { m: "Thank you for telling me. I won't tell anyone. I'm not good at telling people things. — Wen Ning" },
        { go: 'plan' },
      ],
      plan: [
        { m: 'Mr. Jiang will be worried about his phone. He gets worried, and then he gets angry, and then he gets sad, and he never lets anyone see the last part.' },
        { m: "I'm staying in Lanling tonight anyway. The van doesn't like the mountain road in the dark. I could come for the phone at half past eight and take it to the Golden Peony on the way. He doesn't have to know it was you. — Wen Ning" },
        { m: "Until then— sorry— people are saying things to him tonight that they've waited a long time to say. Maybe someone should answer them kindly. — Wen Ning" },
        { choice: [
            { t: 'Half past eight. Thank you, Wen Ning.', go: 'deal' },
            { t: 'Why are you helping me?', go: 'why' },
            { t: "Won't you tell him it was me?", go: 'tell' },
          ], timeout: 120, onTimeout: 'deal' },
      ],
      why: [
        { m: 'Because last Saturday Mr. Jiang said thank you to me. Out loud. The first time since 2009.' },
        { m: "I'd like him to have a good weekend. It's A-Ling's birthday on Sunday. — Wen Ning" },
        { go: 'deal' },
      ],
      tell: [
        { m: "If he asks, I'll tell him. He'll ask. He always asks." },
        { m: "I'm not good at lying, so I'll tell him you were kind to his family all night. That part is easy. — Wen Ning" },
        { go: 'deal' },
      ],
      deal: [
        { fx: { set: { wn_pickup: true } } },
        { m: "Half past eight, then. If anyone calls and you don't want to talk, let it ring. Mr. Jiang never answers after midnight anyway. — Wen Ning" },
        { log: 'Wen Ning knows. He is covering for you, and will take the phone back to Jiang Cheng in the morning', once: 'wn:accomplice' },
        WN_IN,
      ],
    },
  });
  // Later that night: the accomplice checks in.
  S.scene({
    id: 'wn_accomplice_late',
    thread: 'wn',
    polite: true,
    trigger: { on: 'scene', scene: 'wn_accomplice', delay: 420 },
    when: night,
    nodes: {
      start: [
        { m: 'Sorry. Are you all right? Did you eat? Mr. Jiang always asks people that, so I thought someone should ask you. — Wen Ning' },
        { if: (s) => !!F(s).wwx_invited && !F(s).burned, go: 'pot' },
        { go: 'q' },
      ],
      pot: [
        { m: "Wei Wuxian says Sunday is a yes. He's been cleaning the pot for an hour. Thank you for that. Even if it was you who said it. — Wen Ning" },
        { go: 'q' },
      ],
      q: [
        { choice: [
            { t: 'I ate.', go: 'ate' },
            { t: 'Not yet.', go: 'not_yet' },
            { t: '[Leave him on read]', silent: true, go: 'end' },
          ], timeout: 120, onTimeout: 'end' },
      ],
      ate: [{ m: 'Good. Okay. Good. — Wen Ning' }, { go: 'end' }],
      not_yet: [{ m: "There's a congee place near Jinxing Road that's open all night. Night Owl. The lotus root one is good. Sorry. Paramedic habit. — Wen Ning" }, { go: 'end' }],
      end: [{ end: true }],
    },
  });

  // ── Wei Wuxian FaceTimes the moment he gets a yes ────────────────
  S.call({
    id: 'call_wwx_ft',
    from: 'wwx',
    video: true,
    ring: 25,
    missed: [{ start: 'wwx_ft_missed' }],
    onHangup: [{ start: 'wwx_ft_hung' }],
    nodes: {
      start: [
        { say: '(FaceTime. Wei Wuxian in radish-print pyjamas, lit by his phone and pure joy.)', from: 'sys' },
        { say: 'JIANG CHENG. Say it again. Say it to my FACE.' },
        { choice: [
            { t: '(Keep your thumb over the camera)', go: 'covered' },
            { t: '(Show your face)', go: 'face' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      covered: [
        { say: 'Jiang Cheng, your camera is black.' },
        { say: 'Are you in a closet? …Are you crying in a closet?' },
        { say: "It's okay! I'm not crying either! (I am.) Lan Zhan, he's crying in a closet." },
        { say: '(Somewhere off-screen, Lan Wangji says: "Wei Ying. Let him.")', from: 'sys' },
        { say: 'Okay. Okay. I just wanted to see. Bye. Six-thirty!' },
        { fx: { aff: { wwx: 1 } } },
        { hangup: true },
      ],
      face: [
        { say: '…' },
        { say: 'Hi?' },
        { say: "You're not Jiang Cheng." },
        { say: "Why do you have Jiang Cheng's phone? Why is your ceiling different? Who ARE you?" },
        { fx: { set: { wwx_saw_face: true }, sus: { wwx: 6 } } },
        { choice: [
            { t: `"I found his phone in a taxi. I'm sorry."`, go: 'truth' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      truth: [
        { say: 'A TAXI.' },
        { say: '…Is he okay? Where is he? Is he— okay. Okay. Breathe, Wei Ying.' },
        { say: 'Lan Zhan, call the Golden Peony. He always stays at the Golden Peony.' },
        { say: '…So the yes. For Sunday. That was you?' },
        { say: '(He laughs, a little wet.)', from: 'sys' },
        { say: "That's okay. I'm keeping it anyway. I'm going to make him say it himself." },
        told('facetime', 'wwx'),
        { start: 'wwx_honest_end' },
        { hangup: true },
      ],
      hang: [{ start: 'wwx_ft_hung' }, { hangup: 'me' }],
    },
  });

  S.scene({
    id: 'wwx_ft_missed',
    thread: 'wwx',
    trigger: { on: 'manual' },
    nodes: { start: [{ wait: 5 }, { m: 'coward' }, { m: '❤️' }, { m: "ok. i'll see ur face on sunday" }] },
  });

  S.scene({
    id: 'wwx_ft_hung',
    thread: 'wwx',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => F(s).wwx_saw_face, go: 'saw' },
        { wait: 3 },
        { m: 'u hung up on me!!!' },
        { m: 'rude. accepted. six thirty ❤️' },
      ],
      saw: [
        { if: (s) => !!F(s).told_truth, go: 'stop' },
        { wait: 3 },
        { m: 'WHO WAS THAT' },
        { m: 'WHO ARE U' },
        { m: 'is he ok?? where is jiang cheng' },
        { m: 'I called the Golden Peony. Jiang Wanyin is in Room 1808. He does not have his phone.', th: 'lwj', from: 'lwj' },
        { m: 'ok stranger. u have one chance. tell me the truth' },
        { choice: [
            { t: 'I found it in a taxi. I was going to give it back.', go: 'truth' },
            { t: "It's me, idiot.", fx: { sus: { wwx: 3 } }, go: 'lie' },
            { t: '[Leave him on read]', silent: true, go: 'lie' },
          ] },
      ],
      truth: [
        { m: 'a TAXI' },
        { m: '…ok. ok. thank u for telling me' },
        { m: "give it to the front desk at the golden peony. or to wen ning. wen ning is the nicest person alive, he'll take it" },
        { m: '(and stop answering my texts as him!!! i almost cried!!!)' },
        { m: '(i did cry)' },
        { if: (s) => !!F(s).wwx_invited, go: 'truth_yes' },
        { go: 'truth_end' },
      ],
      truth_yes: [{ m: "i'm keeping the yes. he's going to have to say it himself now. on sunday. to my FACE" }, { go: 'truth_end' }],
      truth_end: [
        told('facetime', 'wwx'),
        { log: 'Showed Wei Wuxian your face on FaceTime, then told him the truth', once: 'truth:wwx' },
        { wait: 4 },
        goTo('early_return'),
        { end: true },
      ],
      lie: [
        { m: 'jiang cheng does not own a ceiling fan' },
        { m: 'lan zhan is calling him at the hotel right now' },
        { wait: 6 },
        { m: 'He is awake. He is looking for his laptop.', th: 'lwj', from: 'lwj' },
        { m: 'He said a word I will not repeat.', th: 'lwj', from: 'lwj' },
        { log: 'Showed Wei Wuxian a stranger’s face and told him it was Jiang Cheng', once: 'zidian' },
        { wait: 4 },
      ].concat(zidian),
      stop: [{ end: true }],
    },
  });

  S.scene({
    id: 'wwx_honest_end',
    thread: 'wwx',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { wait: 8 },
        { m: "lan zhan called the hotel. he's asleep. he's fine. he's going to be SO mad" },
        { m: 'thank u for telling me. really' },
        { log: 'Told Wei Wuxian the truth, out loud', once: 'truth:wwx' },
        { wait: 4 },
        goTo('early_return'),
        { end: true },
      ],
    },
  });

  // ── The player calls people ──────────────────────────────────────
  S.call({
    id: 'call_jl_out',
    from: 'jl',
    nodes: {
      start: [
        { say: 'JIUJIU.' },
        { say: "Okay before you yell— wait. You're CALLING me? You never call. You text 'Call me.' and then I have to call YOU." },
        { say: '…Hello?' },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: '"Jin Ling."', go: 'voice' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      silent: [
        { say: "You're breathing weird. Is this a butt dial? Did you butt-dial me?" },
        { say: "Okay. I'm hanging up. I'm telling Wei Wuxian you butt-dialed me." },
        { fx: { sus: { jl: 1 } } },
        { hangup: true },
      ],
      voice: [
        { say: '…' },
        { say: "Who is this? You're not— why do you sound like that?" },
        { fx: { sus: { jl: 4 } } },
        { choice: [
            { t: '"…I have a cold."', go: 'cold' },
            { t: '"I found his phone in a taxi."', go: 'truth' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      cold: [
        { say: "You never get colds. You said colds are for people who don't run." },
        { say: '…Whatever. Drink something hot. Fairy says hi. Bye.' },
        { fx: { sus: { jl: 2 } } },
        { hangup: true },
      ],
      truth: [
        { say: 'WHAT.' },
        { say: 'Then who have I been— oh my god. Oh my god, the koi photo.' },
        { say: 'He always stays at the Golden Peony. Room 1808. Take it THERE.' },
        { say: "And delete the koi photo. I'm serious. I'm calling the hotel. Bye." },
        told('call', 'jl'),
        { start: 'call_truth_after' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  S.dialScript('jl', 'call_jl_out', night);

  S.call({
    id: 'call_wwx_out',
    from: 'wwx',
    nodes: {
      start: [
        { say: "JIANG CHENG IS CALLING ME. Lan Zhan. LAN ZHAN. He's calling me. On the PHONE." },
        { say: 'Hello?? Hi. What happened. Who died.' },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: '"…Sunday. Six-thirty."', if: (s) => !F(s).wwx_invited, go: 'sunday' },
            { t: '"…Wen Ning comes in. On Sunday."', if: (s) => !!F(s).wwx_invited && !F(s).wn_invited, go: 'wen_ning' },
            { t: '"Wei Wuxian."', go: 'voice' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      silent: [
        { say: "…Okay. I can hear you breathing. It's okay. You don't have to say anything." },
        { say: 'Is this about Sunday? Breathe once for yes.' },
        { say: '…' },
        { say: "That was a breath. I'm counting it. I'm counting it as a not no." },
        { fx: { set: { wwx_maybe: true } } },
        { hangup: true },
      ],
      sunday: [
        { say: '…' },
        { say: 'Your voice sounds weird. Did you cry? JIANG CHENG, DID YOU CRY?' },
        { say: "No— don't answer. I'm taking it. Six-thirty. I'm hanging up before you change your mind!" },
        { fx: { set: { wwx_invited: true }, sus: { wwx: 2 }, aff: { wwx: 1 } } },
        { log: 'Told Wei Wuxian “Sunday. Six-thirty.” out loud, on the phone', once: 'wwx:yes' },
        { hint: 'Wei Wuxian is coming home on Sunday.' },
        { hangup: true },
      ],
      wen_ning: [
        { say: '…Wen Ning? Comes IN?' },
        { say: "Jiang Cheng, your voice is doing something very weird and I'm not asking. I'm not asking! I'm calling him. Bye!" },
        { fx: { set: { wn_invited: true }, sus: { wwx: 2 } } },
        { log: 'Told Wei Wuxian, out loud, that Wen Ning comes in on Sunday', once: 'wn:invited' },
        WN_IN,
        { start: 'wn_told', delay: 30 },
        { hangup: true },
      ],
      voice: [
        { say: '…Jiang Cheng?' },
        { say: 'You sound— wow, the hotel wifi is really bad, huh. You sound like a completely different person.' },
        { fx: { sus: { wwx: 3 } } },
        { choice: [
            { t: '(Hang up)', go: 'hang' },
            { t: `"I'm not him. I found his phone."`, go: 'truth' },
          ] },
      ],
      truth: [
        { say: '…What?' },
        { say: 'Is he okay? Where— okay. Okay. He always stays at the Golden Peony. Lan Zhan, call the Golden Peony.' },
        { say: '…Did I just tell a stranger about the soup?' },
        { say: '(A wet laugh.)', from: 'sys' },
        { say: "That's okay. Somebody should hear about the soup." },
        told('call', 'wwx'),
        { start: 'wwx_honest_end' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  S.dialScript('wwx', 'call_wwx_out', (s) => night(s) && !F(s).burned);

  // After "You should have stayed gone": Lan Wangji has his phone. Nothing said here mends it.
  S.call({
    id: 'call_wwx_burned',
    from: 'wwx',
    nodes: {
      start: [
        { say: '…' },
        { say: 'Lan Wangji.' },
        { say: 'He left his phone with me. He is on the roof.' },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: `"Tell him I didn't mean it."`, go: 'voice' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      silent: [
        { say: '(A long silence. Somewhere above him, very faintly, a flute starts and stops.)', from: 'sys' },
        { say: 'He is making the soup anyway.' },
        { say: 'Goodnight.' },
        { hangup: true },
      ],
      voice: [
        { say: 'Your voice is strange tonight.' },
        { say: 'You will tell him yourself. In person. Not through me.' },
        { fx: { set: { burned_regret: true }, sus: { lwj: 2 } } },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  S.dialScript('wwx', 'call_wwx_burned', (s) => night(s) && !!F(s).burned);

  S.call({
    id: 'call_lxc_out',
    from: 'lxc',
    nodes: {
      start: [
        { say: 'Wanyin?' },
        { say: '…You called.' },
        { say: "I'm glad. I wasn't asleep." },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: '"…Hi."', go: 'hi' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      silent: [
        { say: "That's all right. We don't have to talk." },
        { say: "I'll just stay on the line for a minute, if that's all right with you." },
        { say: '(Wind chimes. Water poured into a cup. Somewhere far off, a bell in the mist.)', from: 'sys' },
        { say: 'Goodnight, Wanyin.' },
        { fx: { aff: { lxc: 1 } } },
        { hangup: true },
      ],
      hi: [
        { say: '…Wanyin, your voice sounds different. Is your throat all right?' },
        { say: "It's the cold air on the balcony, I expect. I'm sorry. I kept you out there." },
        { fx: { sus: { lxc: 1 } } },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: `"I'm not him. I found his phone."`, go: 'truth' },
          ] },
      ],
      truth: [
        { say: '…Ah.' },
        { say: 'Then I owe you an apology as well. I have said a great many things tonight to someone I have never met.' },
        { say: 'Is he safe? He would be at the Golden Peony. He always is.' },
        { say: 'Thank you for telling me. Please make sure he gets it back.' },
        told('call', 'lxc'),
        { start: 'call_truth_after' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  S.dialScript('lxc', 'call_lxc_out', night);

  S.call({
    id: 'call_nhs_out',
    from: 'nhs',
    nodes: {
      start: [
        { say: 'BROTHER JIANG IS CALLING ME??' },
        { say: 'Brother Jiang never calls me! Brother Jiang calls me "a liability"!' },
        { say: 'Hello? Hellooo?' },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: '"Huaisang."', go: 'voice' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      silent: [
        { say: 'Hehe~ a butt dial? Brother Jiang, you butt-dialed me after midnight?' },
        { say: "I'm telling everyone. I mean— I'm telling no one! Bye!" },
        { fx: { sus: { nhs: 1 } } },
        { hangup: true },
      ],
      voice: [
        { say: '…' },
        { say: 'Oh. That is NOT Brother Jiang.' },
        { say: 'Hehe. Hello, stranger.' },
        { fx: { sus: { nhs: 5 } } },
        { start: 'caught_nhs' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  S.dialScript('nhs', 'call_nhs_out', night);

  S.call({
    id: 'call_wn_out',
    from: 'wn',
    nodes: {
      start: [
        { say: 'M-Mr. Jiang?! Is everything all right? Is it Jin Ling? Is it Wei Wuxian? Sorry— hello.' },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: '"Sunday. Six-thirty. Come in."', if: (s) => !F(s).wn_invited, go: 'sunday' },
            { t: '"Wen Ning."', go: 'voice' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      silent: [
        { say: "…I think the line is bad. Sorry. I'll text you. Sorry." },
        { start: 'wn_after_silent_out' },
        { hangup: true },
      ],
      sunday: [
        { say: '…S-Sunday?' },
        { say: 'Come in? At Lotus Pier? Mr. Jiang, is that— your voice sounds— is it a cold? Sorry. Paramedic habit.' },
        { say: 'Yes. Yes, Mr. Jiang. Thank you. Sorry. Thank you. I have to sit down.' },
        { fx: { set: { wn_invited: true, wn_sunday_asked: true }, sus: { wn: 2 } } },
        { log: 'Called Wen Ning and invited him to Sunday dinner, out loud', once: 'wn:invited' },
        WN_IN,
        { hangup: true },
      ],
      voice: [
        { say: '…' },
        { say: "Sorry— who is this? You're not Mr. Jiang. Mr. Jiang never says my name like that. He says it like a cough." },
        { fx: { set: { wn_realized: true } } },
        { choice: [
            { t: '"I found his phone in a taxi."', go: 'truth' },
            { t: '(Hang up)', go: 'hang_r' },
          ] },
      ],
      truth: [
        { say: '…Oh.' },
        { say: "Is he all right? He's at the Golden Peony, isn't he." },
        { say: "I won't tell anyone. Let me help. Let me think. I'll text you. Sorry." },
        { fx: { set: { told_truth: true, told_to: 'wn', wn_told: true, wn_knows: true, wn_accomplice: true } } },
        { start: 'wn_accomplice' },
        { hangup: true },
      ],
      hang_r: [{ fx: { set: { wn_knows: true, wn_accomplice: true } } }, { start: 'wn_accomplice' }, { hangup: 'me' }],
      hang: [{ hangup: 'me' }],
    },
  });
  S.dialScript('wn', 'call_wn_out', night);
  S.scene({
    id: 'wn_after_silent_out',
    thread: 'wn',
    trigger: { on: 'manual' },
    nodes: { start: [{ wait: 8 }, { m: 'Sorry, the line was bad. Did you need something? I can come. — Wen Ning' }] },
  });
  // He knows (wn_accomplice): he answers the stranger, not Mr. Jiang.
  S.call({
    id: 'call_wn_knows',
    from: 'wn',
    nodes: {
      start: [
        { say: "Hello? Is that— you? The person with Mr. Jiang's phone? Sorry. Is everything all right?" },
        { choice: [
            { t: '"Everything\'s fine. Just checking."', go: 'fine' },
            { t: '"Is the van all right?"', go: 'van' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      fine: [
        { say: 'Oh. Okay. Me too. I mean— I am fine. Thank you for checking. Nobody checks. Sorry.' },
        { say: 'Half past eight. I set three alarms. Goodnight.' },
        { hangup: true },
      ],
      van: [
        { say: "The van? It's fine. It smells of radishes and pond. Hanguang-jun is sitting in the back with the radishes again. By choice." },
        { say: 'Goodnight. Sorry. Goodnight.' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  S.dialScript('wn', 'call_wn_knows', (s) => night(s) && !!F(s).wn_accomplice);

  S.call({
    id: 'call_huang_out',
    from: 'huang',
    nodes: {
      start: [
        { say: 'Boss! Is me. Huang.' },
        { say: 'Boss? You there? The line is very quiet. Like a library.' },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: '"Old Huang."', go: 'voice' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      silent: [
        { say: 'Boss is tired. I understand.' },
        { say: 'I take care of everything. Lotus root. Car. Everything. Sleep, Boss.' },
        { say: 'Thumbs up.' },
        { hangup: true },
      ],
      voice: [
        { say: 'Boss! You sound young! Very good! The running is working!' },
        { say: 'I always tell my wife: Boss runs six kilometers every morning, that is why he never gets old.' },
        { say: 'Okay. Sleep. Thumbs up.' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  S.dialScript('huang', 'call_huang_out', night);

  S.call({
    id: 'call_lwj_out',
    from: 'lwj',
    nodes: {
      start: [
        { say: '…' },
        { say: 'Lan Wangji.' },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: '"…Hello."', go: 'voice' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      silent: [
        { say: '(A long silence on both ends. Neither of you breaks it. Somewhere behind him, Wei Wuxian is snoring.)', from: 'sys' },
        { say: 'Wei Ying is asleep.' },
        { say: 'Goodnight.' },
        { hangup: true },
      ],
      voice: [
        { say: 'You are not Jiang Wanyin.' },
        { fx: { sus: { lwj: 5 } } },
        { choice: [
            { t: '"No. I found his phone in a taxi."', go: 'truth' },
            { t: '(Hang up)', go: 'hang_r' },
          ] },
      ],
      truth: [
        { say: 'Mn.' },
        { say: 'Golden Peony. Room 1808. Return it.' },
        { say: 'I will tell Wei Ying in the morning. He will laugh.' },
        told('call', 'lwj'),
        { start: 'call_truth_after' },
        { hangup: true },
      ],
      hang_r: [{ start: 'lwj_after_hang' }, { hangup: 'me' }],
      hang: [{ hangup: 'me' }],
    },
  });
  S.dialScript('lwj', 'call_lwj_out', night);
  // Caught by Lan Wangji and hung up on him: he calls the hotel → Zidian (consequence: zidian_fall, writer C).
  S.scene({
    id: 'lwj_after_hang',
    thread: 'lwj',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { wait: 6 },
        { m: 'I have informed the Golden Peony front desk.' },
        { m: 'He is awake now.' },
        { log: 'Hung up on Lan Wangji after he heard a stranger’s voice. He called the Golden Peony', once: 'zidian' },
        { wait: 4 },
      ].concat(zidian),
    },
  });

  // Lotus Pier HQ at night: the night desk, not him (the morning call is in finale.js).
  S.call({
    id: 'call_hq_night',
    from: 'hq',
    nodes: {
      start: [
        { say: 'Lotus Pier, Yunmeng Jiang Group. Night desk.' },
        { say: "…Hello? Oh— this is the CEO's mobile. Sir?" },
        { choice: [
            { t: '(Stay silent)', go: 'silent' },
            { t: `"I found Mr. Jiang's phone in a taxi."`, go: 'truth' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      silent: [
        { say: "Sir? If you can hear me, the line is very bad. I'll log the call. Goodnight, sir." },
        { hangup: true },
      ],
      truth: [
        { say: "…Oh. Oh, that explains a great deal about the ops group tonight." },
        { say: "Thank you. Truly. I'll let his assistant know. Can you keep it safe until morning? Someone will call you." },
        told('call', 'hq'),
        { start: 'call_truth_after' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  S.dialScript('hq', 'call_hq_night', (s) => !F(s).lost_mode);
})();
