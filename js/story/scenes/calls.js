/* Calls — Wen Ning's towing call, Wei Wuxian's FaceTime, and what happens when the player calls people.
   Your voice is not Jiang Cheng's: speaking is risky, silence often works. Facts: docs/STORY.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => s.flags || {};
  const night = (s) => !F(s).night_done;

  // Endings fired from a scene, so they still happen after a call is hung up.
  S.scene({ id: 'honest_after_call', thread: 'jl', trigger: { on: 'manual' }, nodes: { start: [{ wait: 3 }, { ending: 'honest' }] } });

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
        { say: "Let me help. I'll tow the car, and then I'll come and get the phone and take it to him. He doesn't have to know it was you. He doesn't have to know it was me either, if that's better." },
        { say: 'Sorry. That was a lot of words.' },
        { start: 'wn_ending' },
        { hangup: true },
      ],
      hang: [{ start: 'wn_after_realized' }, { hangup: true }],
    },
  });

  S.scene({
    id: 'wn_after_hangup',
    thread: 'wn',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => F(s).wn_realized, go: 'realized' },
        { wait: 6 },
        { m: "Sorry, I think we got cut off. I'll tow it unless you say no. Sorry. — Wen Ning" },
        { fx: { set: { wn_towed: true } } },
        { start: 'wn_tow_done' },
      ],
      realized: [{ start: 'wn_after_realized' }],
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
        { m: 'wen ning towed it!!! with a ROPE. his van says yiling radish co on the side. everyone is filming', th: 'jl', from: 'jl' },
        { m: 'he apologized to the koi', th: 'jl', from: 'jl' },
      ],
    },
  });

  // He knows. He is too kind, and too scared, to tell anyone → Wen Ning Saw Nothing.
  S.scene({
    id: 'wn_after_realized',
    thread: 'wn',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { wait: 15 },
        { m: "I'm sorry. I won't tell anyone." },
        { m: 'But Mr. Jiang will be worried about his phone. He gets worried, and then he gets angry, and then he gets sad, and he never lets anyone see the last part.' },
        { m: "Could you leave it at the Golden Peony front desk? I can take it there for you, if you're scared. I understand being scared. — Wen Ning" },
        { wait: 5 },
        { ending: 'wen_ning' },
      ],
    },
  });
  S.scene({
    id: 'wn_ending',
    thread: 'wn',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { wait: 4 },
        { m: 'Where are you? I can come now. The car can wait. The koi can wait. Sorry. — Wen Ning' },
        { wait: 5 },
        { ending: 'wen_ning' },
      ],
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
        { start: 'wwx_honest_end' },
        { hangup: true },
      ],
      hang: [{ start: 'wwx_ft_hung' }, { hangup: true }],
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
        { wait: 4 },
        { ending: 'honest' },
      ],
      lie: [
        { m: 'jiang cheng does not own a ceiling fan' },
        { m: 'lan zhan is calling him at the hotel right now' },
        { wait: 6 },
        { m: 'He is awake. He is looking for his laptop.', th: 'lwj', from: 'lwj' },
        { m: 'He said a word I will not repeat.', th: 'lwj', from: 'lwj' },
        { wait: 4 },
        { ending: 'zidian' },
      ],
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
        { wait: 4 },
        { ending: 'honest' },
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
        { start: 'honest_after_call' },
        { hangup: true },
      ],
      hang: [{ hangup: true }],
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
        { start: 'wwx_honest_end' },
        { hangup: true },
      ],
      hang: [{ hangup: true }],
    },
  });
  S.dialScript('wwx', 'call_wwx_out', (s) => night(s) && !F(s).burned);

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
        { start: 'honest_after_call' },
        { hangup: true },
      ],
      hang: [{ hangup: true }],
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
      hang: [{ hangup: true }],
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
            { t: '"Wen Ning."', go: 'voice' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      silent: [
        { say: "…I think the line is bad. Sorry. I'll text you. Sorry." },
        { start: 'wn_after_silent_out' },
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
        { say: "I won't tell anyone. Let me help. I can bring it to him. He doesn't have to know it was you." },
        { start: 'wn_ending' },
        { hangup: true },
      ],
      hang_r: [{ start: 'wn_after_realized' }, { hangup: true }],
      hang: [{ hangup: true }],
    },
  });
  S.dialScript('wn', 'call_wn_out', night);
  S.scene({
    id: 'wn_after_silent_out',
    thread: 'wn',
    trigger: { on: 'manual' },
    nodes: { start: [{ wait: 8 }, { m: 'Sorry, the line was bad. Did you need something? I can come. — Wen Ning' }] },
  });

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
      hang: [{ hangup: true }],
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
        { start: 'honest_after_call' },
        { hangup: true },
      ],
      hang_r: [{ start: 'lwj_after_hang' }, { hangup: true }],
      hang: [{ hangup: true }],
    },
  });
  S.dialScript('lwj', 'call_lwj_out', night);
  S.scene({
    id: 'lwj_after_hang',
    thread: 'lwj',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { wait: 6 },
        { m: 'I have informed the Golden Peony front desk.' },
        { m: 'He is awake now.' },
        { wait: 4 },
        { ending: 'zidian' },
      ],
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
        { start: 'honest_after_call' },
        { hangup: true },
      ],
      hang: [{ hangup: true }],
    },
  });
  S.dialScript('hq', 'call_hq_night', (s) => !F(s).lost_mode);

})();
