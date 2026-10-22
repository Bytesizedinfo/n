/* Calls — Childe's 01:30 call (the deal), his Sunday text, and what happens when the player phones people.
   Your voice is not Childe's: speaking is risky, silence often works, and some people hear the difference at once.
   Owner: S4 (core story). Facts: docs/STORY.md. The Monday Wangsheng call lives in scenes/finale.js. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;
  const F = (s) => s.flags;
  const H = () => JC.storyHelpers;
  const CH = ['fri_night', 'sat_dawn', 'sat_noon', 'sat_night', 'sun_rite', 'sun_night', 'mon'];
  const chN = (s) => CH.indexOf(s.chapter);
  const after = (s, str) => s.now >= JC.time.parse(str);

  // ══════════════════════════════════════════════════════════════
  // Friday 01:30 — the deal (the hinge of the game)
  // ══════════════════════════════════════════════════════════════
  // The scene rings him through, then watches how the call ended: answered (deal made or refused inside the call),
  // missed (he tries again two in-game minutes later, then leaves a voicemail), or hung up on (refused → short path).
  const busy = () => !!S.call();
  const dealt = (s) => !!(F(s).deal_childe || F(s).deal_refused);
  S.scene({
    id: 'core_childe_call', thread: 'unknown', arc: 'core', ch: 'fri_night', required: true,
    trigger: { on: 'time', at: '+1 01:30' },
    nodes: {
      start: [
        { if: busy, go: 'line' },
        { call: 'call_childe' },
        { wait: 2 },
        { go: 'watch1' },
      ],
      line: [{ wait: 3 }, { go: 'start' }],
      watch1: [
        { if: busy, go: 'w1' },
        { wait: 2 },
        { if: dealt, go: 'done' },
        { if: (s) => F(s).cc_hungup, go: 'hungup' },
        { go: 'retry' },
      ],
      w1: [{ wait: 2 }, { go: 'watch1' }],
      retry: [
        { wait: 20 },
        { if: dealt, go: 'done' },
        { if: busy, go: 'retry' },
        { call: 'call_childe2' },
        { wait: 2 },
        { go: 'watch2' },
      ],
      watch2: [
        { if: busy, go: 'w2' },
        { wait: 2 },
        { if: dealt, go: 'done' },
        { if: (s) => F(s).cc_hungup, go: 'hungup' },
        { fx: { set: { deal_voicemail: true } } },
        { go: 'done' },
      ],
      w2: [{ wait: 2 }, { go: 'watch2' }],
      hungup: [
        { fx: { set: { deal_refused: true, deal_hungup: true } } },
        { start: 'core_short', delay: 2 },
        { go: 'done' },
      ],
      done: [{ end: true }],
    },
  });

  function childeNodes(open) {
    return {
      start: open.concat([
        { choice: [
          { t: '"…Who is this?"', go: 'who' },
          { t: '"…Childe?"', go: 'name' },
          { t: '(Stay silent)', go: 'silent' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ]),
      who: [{ say: 'The guy whose phone you’re holding. Blue case. Red fish. A sticker my little brother put on crooked.' }, { go: 'pitch' }],
      name: [{ say: '…Heh. You read the lock screen. Good. Then you know who I am.' }, { say: 'Mostly.' }, { go: 'pitch' }],
      silent: [
        { say: 'Smart. Don’t say anything you don’t have to.' },
        { say: '…You’re still there. I can hear the water slapping the pilings. You’re on Pier 7, aren’t you.' },
        { go: 'pitch' },
      ],
      pitch: [
        { say: 'Listen. I don’t have long.' },
        { say: 'If that phone goes silent, the people looking for me will know I’m running.' },
        { say: 'And my brother and sister land here in six hours. They don’t know anything. They think I sell toys.' },
        { say: 'So keep it alive. Answer like me. Until Monday.' },
        { say: 'I’ll owe you.' },
        { go: 'ask' },
      ],
      ask: [{ choice: [
        { t: '"Okay. Until Monday."', go: 'agree' },
        { t: '"What’s in it for me?"', go: 'bargain' },
        { t: '"Who’s looking for you?"', go: 'looking', if: (s) => !F(s).cc_looking },
        { t: '"Why shouldn’t I just take it to the Millelith?"', go: 'police', if: (s) => !F(s).cc_police },
        { t: '"No. I can’t."', go: 'refuse' },
        { t: '(Hang up)', go: 'hang' },
      ] }],
      looking: [
        { fx: { set: { cc_looking: true } } },
        { say: 'The people I work for. Long story. It ends with somebody in the sea, and I already did that part tonight.' },
        { say: 'If a woman called Signora writes, be cold. Never apologise to her. She can smell it through glass.' },
        { go: 'ask' },
      ],
      police: [
        { fx: { set: { cc_police: true } } },
        { say: 'You could. They’d be very polite about it.' },
        { say: 'And by noon my phone would be sitting on a desk at the bank, and the bank is who I’m running from.' },
        { say: '…Turn it over. Look at the sticker.' },
        { say: 'He’s eight. He’s on a plane right now, and he thinks I’ll be at the gate.' },
        { go: 'ask' },
      ],
      bargain: [
        { say: 'Ha! Okay. Okay, I like you.' },
        { say: 'Mora. A lot of it. You name the number on Monday.' },
        { say: 'Just not from the account that says “for the kids”. Touch that one and I find you.' },
        { choice: [
          { t: '"Deal."', fx: { set: { deal_paid: 1 } }, go: 'agree' },
          { t: '"Double it."', fx: { set: { deal_paid: 2 } }, go: 'double' },
          { t: '"No deal."', go: 'refuse' },
        ] },
      ],
      double: [
        { say: 'Double a number you haven’t named yet. Sure. Double.' },
        { say: 'You’re going to be a natural at this.' },
        { go: 'agree' },
      ],
      refuse: [
        { say: '…Yeah. Okay. Fair. You don’t know me.' },
        { say: 'Then do one thing for me. In the morning, take it up to Wangsheng Funeral Parlor on Feiyun Slope. Give it to the girl in the hat. Say it’s from the pier.' },
        { say: 'She’ll know.' },
        { fx: { set: { deal_refused: true } } },
        { start: 'core_short', delay: 4 },
        { say: 'Bye, stranger. Don’t lose the fish.' },
        { hangup: true },
      ],
      agree: [
        { fx: { set: { deal_childe: true } } },
        { start: 'core_deal' },
        { say: '…Heh.' },
        { say: 'Okay. Okay! You might actually be saving my life. We’ll see.' },
        { say: 'Rules. Three of them. Fast.' },
        { say: 'One. Teucer gets exclamation marks. Two, minimum. He counts.' },
        { say: 'Two. Nobody at the bank gets a “please” or a “sorry”. Not ever. They’ll know.' },
        { say: 'Three.' },
        { say: '…There’s a man saved as Xiansheng. If he writes, be nice to him. Pay for whatever he wants.' },
        { say: 'He’ll work you out by breakfast. He works out everything. When he does, don’t lie to him. He hates that more than anything.' },
        { choice: [
          { t: '"Where are you?"', go: 'where' },
          { t: '"Why did you leave it on the bench?"', go: 'why' },
          { t: '"Okay. Go."', go: 'bye' },
        ] },
      ],
      where: [
        { say: 'Somewhere dry, finally. Somewhere with a lot of… furniture.' },
        { say: 'Don’t come looking. If you can find me, so can they.' },
        { go: 'bye' },
      ],
      why: [
        { say: 'Because it’s the one thing they can track.' },
        { say: '…So now they’re tracking you. Heh. Welcome to the job.' },
        { go: 'bye' },
      ],
      bye: [
        { say: '(Somewhere behind him, a girl’s delighted whisper: “psst! footsteps! back in the box, Mr. Harbinger—”)', from: 'sys' },
        { say: 'Gotta go. Keep it charged.' },
        { say: 'And don’t lose the fish.' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    };
  }

  const VOICEMAIL = 'Hey. Whoever has my phone. You’re not picking up, which, fair, I wouldn’t either. Listen. If my phone goes quiet, the people looking for me will know I’m running, and my brother and sister land here in six hours. They don’t know anything. Keep it alive. Answer like me. Until Monday. Teucer gets exclamation marks. Nobody at the bank gets a sorry. If a man called Xiansheng writes, be nice to him. I’ll owe you. …And don’t lose the fish.';

  const HUNG = [{ fx: { set: { cc_hungup: true } } }];
  S.call({
    id: 'call_childe', from: 'unknown', ring: 25,
    onHangup: HUNG,
    nodes: childeNodes([
      { say: '(No Caller ID. Wind. Water dripping somewhere close. Someone breathing hard, trying not to.)', from: 'sys' },
      { say: 'Whoever has my phone. Don’t hang up.' },
    ]),
  });
  S.call({
    id: 'call_childe2', from: 'unknown', ring: 25, voicemail: VOICEMAIL,
    onHangup: HUNG,
    nodes: childeNodes([
      { say: '(No Caller ID, again.)', from: 'sys' },
      { say: 'Come on. Come on, pick u— oh. Hi. Okay.' },
      { say: 'Whoever has my phone. Don’t hang up.' },
    ]),
  });

  // listening to that voicemail is as good as a yes
  S.onAct({
    id: 'core_vm_deal', act: 'voicemail_play', once: true, arc: 'core',
    match: (p, s) => {
      if (F(s).deal_refused) return false;
      try { const v = JC.store.get('voicemails', p.id); return !!(v && v.contact === 'unknown'); } catch (e) { return false; }
    },
    fx: { set: { deal_childe: true } },
  });
  // agreed (from the call) — recorded by a scene so the deal belongs to the core arc
  S.scene({
    id: 'core_deal', thread: 'unknown', arc: 'core', trigger: { on: 'manual' },
    nodes: { start: [{ fx: { set: { deal_childe: true } } }] },
  });
  // chapter 1 ended (Later…) before 01:30: the calls happened while you slept
  S.scene({
    id: 'core_childe_dawn', thread: 'unknown', arc: 'core', ch: 'sat_dawn',
    trigger: { on: 'chapter', ch: 'sat_dawn', delay: 6 },
    when: (s) => !F(s).deal_childe && !F(s).deal_refused && !F(s).deal_voicemail,
    nodes: {
      start: [
        { run: (api) => {
          const t1 = JC.time.parse('+1 01:30');
          try {
            api.store.add('calls', { contact: 'unknown', num: 'No Caller ID', t: t1, dir: 'missed', dur: 0 }, { front: true });
            api.store.add('calls', { contact: 'unknown', num: 'No Caller ID', t: t1 + 120000, dir: 'missed', dur: 0 }, { front: true });
            api.store.add('voicemails', { contact: 'unknown', num: 'No Caller ID', t: t1 + 150000, dur: 41, text: VOICEMAIL, heard: false }, { front: true });
          } catch (e) { /* phone collections not seeded */ }
          try { api.story.phoneBadge(); } catch (e) { /* optional */ }
        } },
        { notify: { app: 'phone', title: 'Voicemail', body: 'Unknown left you a voicemail at 1:32 AM (0:41).', open: { app: 'phone', intent: { tab: 'voicemail' } } } },
        { fx: { set: { deal_voicemail: true } } },
      ],
    },
  });

  // ══════════════════════════════════════════════════════════════
  // Sunday night — one text from the burner (if you kept the deal)
  // ══════════════════════════════════════════════════════════════
  S.scene({
    id: 'core_unknown_sunday', thread: 'unknown', arc: 'core', ch: 'sun_night',
    trigger: { on: 'chapter', ch: 'sun_night', delay: 60 },
    when: (s) => !!(F(s).deal_childe || F(s).deal_voicemail),
    nodes: {
      start: [
        { m: 'it’s me. borrowed a phone' },
        { m: 'don’t reply, this one doesn’t take messages' },
        { if: (s) => F(s).fatui_pickup && !F(s).kids_rescued, go: 'grand', else: 'kids' },
      ],
      grand: [
        { m: 'pulcinella’s people have the kids. i know. it’s not your fault. i should have told you what that car was' },
        { m: 'tonight she’ll use them. whatever signora says about teucer, she means it a little less than she says it. and a little more than you’d like', d: 4 },
        { m: 'i don’t know what i’d do. that’s the truth. i’ve never not known before' },
        { go: 'code' },
      ],
      kids: [
        { if: (s) => H().kidsSafe(s), go: 'kids_ok' },
        { m: 'tonia says they’re okay. tonia says it the way she says everything, like she’s daring the world to argue' },
        { go: 'code' },
      ],
      kids_ok: [
        { m: 'teucer sounds happy. tonia sounds like tonia. i don’t know how you did that' },
        { if: (s) => F(s).gift_teucer, go: 'gift' },
        { go: 'code' },
      ],
      gift: [{ m: 'he says i bought him something amazing. thank you for having good taste with my money 😁' }, { go: 'code' }],
      code: [
        { m: 'signora’s deadline is tonight. half past ten. she’ll want the code in my notes', d: 3 },
        { m: 'i wrote that project. august. i was angry and bored and i wanted to make a god show his face' },
        { m: 'don’t give it to her' },
        { if: (s) => F(s).zl_contract || F(s).zl_admitted, go: 'zl' },
        { go: 'end' },
      ],
      zl: [
        { if: (s) => F(s).zl_broken || F(s).morax_sold, go: 'zl_bad' },
        { m: 'xiansheng says you’re keeping your word. he doesn’t say that about anyone. he barely says it about me' },
        { go: 'end' },
      ],
      zl_bad: [{ m: 'xiansheng isn’t talking to anyone tonight. i don’t know what happened. i think you do' }, { go: 'end' }],
      end: [
        { m: 'monday. 8am. i’ll call. pick up this time 🐟' },
      ],
    },
  });

  // ══════════════════════════════════════════════════════════════
  // Dial scripts: the player phones someone. Registered generic → specific (the last match wins).
  // ══════════════════════════════════════════════════════════════
  const D = (cid, def, when) => { S.call(Object.assign({ from: cid }, def)); S.dialScript(cid, def.id, when); };

  // ── Zhongli ───────────────────────────────────────────────────
  D('zl', {
    id: 'dial_zl',
    nodes: {
      start: [
        { say: 'Childe. You have telephoned me. You never telephone. You send nine messages in a row, each with a different fish.' },
        { if: (s) => s.chapter === 'fri_night', go: 'late' },
        { go: 'ask' },
      ],
      late: [{ say: 'It is very late. Is something the matter?' }, { go: 'ask' }],
      ask: [{ choice: [
        { t: '(Stay silent)', go: 'silent' },
        { t: '"Xiansheng! Just wanted to hear your voice!"', label: '"Xiansheng! Just wanted to hear your voice!" (your best Childe)', go: 'voice' },
        { t: '(Tell him the truth)', go: 'truth' },
        { t: '(Hang up)', go: 'hang' },
      ] }],
      silent: [
        { say: '…' },
        { say: 'I see.' },
        { say: 'Then I will speak, and you may listen. Whoever you are, you are holding a phone that belongs to someone I care for. I would ask you to hold it carefully.' },
        { fx: { sus: { zl: 3 } } },
        { hangup: true },
      ],
      voice: [
        { say: '…' },
        { say: 'That is not his voice.' },
        { say: 'It is a kind attempt. His goes up at the end, as though every sentence were a dare.' },
        { fx: { sus: { zl: 3 } } },
        { choice: [
          { t: '(Tell him the truth)', go: 'truth' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      truth: [
        { fx: { set: { told_truth: true } } },
        { say: '…Thank you. I suspected.' },
        { say: 'I would rather read it than hear it, I think. Write to me.' },
        { start: 'confess_zl', inThread: 'zl' },
        { hangup: true },
      ],
      hang: [{ fx: { sus: { zl: 1 } } }, { hangup: 'me' }],
    },
  });
  D('zl', {
    id: 'dial_zl_known',
    nodes: {
      start: [
        { if: (s) => s.chapter === 'sun_rite' && !after(s, '+2 13:00'), go: 'rite' },
        { if: (s) => s.chapter === 'mon', go: 'mon' },
        { say: 'Ah. The person with the phone. Good evening. Or good morning; I confess I have lost track.' },
        { go: 'ask' },
      ],
      ask: [{ choice: [
        { t: '"Is he okay?"', go: 'okay' },
        { t: '"I just wanted to talk to someone who knows."', go: 'talk', if: (s) => !F(s).zl_call_warm },
        { t: '"Did you really never pay for a single dinner?"', go: 'dinner', if: (s) => !F(s).zl_call_dinner },
        { t: '(Hang up)', go: 'bye' },
      ] }],
      okay: [
        { say: 'He is safe. He asked me not to say where. I keep my word, even when I would rather not.' },
        { if: (s) => F(s).knows_hideout, go: 'okay_hideout' },
        { go: 'ask' },
      ],
      okay_hideout: [{ say: 'And I would be grateful if you did not ask Hu Tao about the furniture. She is a very poor liar, and an enthusiastic one.' }, { go: 'ask' }],
      talk: [
        { fx: { set: { zl_call_warm: true }, aff: { zl: 1 } } },
        { say: 'That is a very reasonable thing to want.' },
        { say: 'Carrying another person’s life is heavy. It is heavier when everyone around you believes it is light. I have some experience of this.' },
        { say: 'You are doing better than you think. He would say so. He would say it with too many exclamation marks.' },
        { go: 'ask' },
      ],
      dinner: [
        { fx: { set: { zl_call_dinner: true } } },
        { say: 'Not one. Forty-one dinners.' },
        { say: 'In my defence, he has never once allowed me to try. He reaches for the bill the way a cat reaches for a moving string. I find I do not have the heart to stop him.' },
        { say: 'There is also the matter of my wallet, which is in my other coat. It has been in my other coat for some time.' },
        { go: 'ask' },
      ],
      rite: [
        { say: '(Bells, very far off. A crowd murmuring. Wind on a high terrace.)', from: 'sys' },
        { if: (s) => F(s).zl_confessed, go: 'rite_known' },
        { say: 'I am at the Rite. I cannot talk. Everyone here is wearing white, and they are being very kind about someone who, I suspect, would find the whole thing faintly embarrassing.' },
        { say: 'I will call you after.' },
        { hangup: true },
      ],
      rite_known: [
        { say: 'I am at my own funeral. The eulogy is adequate. The incense is excellent.' },
        { say: 'I will call you when I am dead. Afterward, I mean.' },
        { hangup: true },
      ],
      mon: [
        { if: (s) => F(s).ws_talked, go: 'mon_after' },
        { say: 'He will call you this morning, at eight, from the parlor’s telephone. Answer him truthfully. I believe you will.' },
        { hangup: true },
      ],
      mon_after: [
        { say: 'Pier 7, at half past five. I will be… nearby. I find I cannot quite stay away.' },
        { hangup: true },
      ],
      bye: [{ say: 'Goodnight, then. Sleep, if you can. The sea will keep.' }, { hangup: true }],
    },
  }, (s) => !!(F(s).zl_admitted || F(s).zl_contract));

  // ── Lumine & Paimon ───────────────────────────────────────────
  D('lumine', {
    id: 'dial_lumine',
    nodes: {
      start: [
        { say: 'childe. you never call.' },
        { say: '(Muffled, off the phone: “paimon. shh. it’s childe.” Then, louder, a mouth full of something: “HI CHILDE!!”)', from: 'sys' },
        { choice: [
          { t: '(Stay silent)', go: 'silent' },
          { t: '"Comrade! Just checking in!"', go: 'voice' },
          { t: '(Tell her the truth)', go: 'truth' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      silent: [{ say: '…butt dial. again. i’m hanging up. stop fishing with your phone in your back pocket.' }, { hangup: true }],
      voice: [
        { say: '…your voice is weird.' },
        { say: 'you sound like somebody doing an impression of you. a decent one. but still.' },
        { fx: { sus: { lumine: 2 } } },
        { choice: [
          { t: '"Sea air. Bye!"', go: 'hang' },
          { t: '(Tell her the truth)', go: 'truth' },
        ] },
      ],
      truth: [
        { fx: { set: { told_truth: true } } },
        { say: '…' },
        { say: 'okay. text me. now.' },
        { start: 'confess_lumine', inThread: 'lumine' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  D('lumine', {
    id: 'dial_lumine_known',
    nodes: {
      start: [
        { say: 'hey. it’s you. trouble?' },
        { choice: [
          { t: '"How are the kids?"', go: 'kids', if: (s) => !!(F(s).lumine_pickup || F(s).lumine_guard) },
          { t: '"Any news about your brother?"', go: 'aether', if: (s) => !F(s).lumine_call_aether },
          { t: '"No trouble. Just checking in."', go: 'bye' },
        ] },
      ],
      kids: [
        { say: 'fine. teucer is teaching paimon reel rush. paimon is losing. loudly.' },
        { say: 'the girl watches everything. she’d make a good adventurer. don’t tell her i said that.' },
        { hangup: true },
      ],
      aether: [
        { fx: { set: { lumine_call_aether: true }, aff: { lumine: 1 } } },
        { say: '…still looking.' },
        { if: (s) => F(s).gave_abyss_notes, go: 'aether_notes' },
        { say: 'thanks for asking. he never does. childe, i mean. he asks if i want to fight instead. it’s his way of asking.' },
        { hangup: true },
      ],
      aether_notes: [{ say: 'the notes helped. there’s a door in the chasm i’ve walked past twice. i think it opens from the other side.' }, { hangup: true }],
      bye: [{ say: 'ok. be careful. you’re a worse fighter than him and he’s the one they’re after.' }, { hangup: true }],
    },
  }, (s) => !!F(s).lumine_knows);

  D('paimon', {
    id: 'dial_paimon',
    nodes: {
      start: [
        { say: 'CHILDE!!! Paimon KNEW you’d call about hotpot!!!' },
        { choice: [
          { t: '"Hotpot tomorrow. My treat!"', go: 'treat' },
          { t: '(Stay silent)', go: 'silent' },
          { t: '"Paimon, I’m not Childe."', go: 'truth' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      treat: [
        { say: 'YAYYYY!!! You said it OUT LOUD so it counts as a CONTRACT!!! Paimon is telling everyone!!!' },
        { say: '…Wait. Your voice sounds funny. Did you swallow a fish?? You DID, didn’t you!!' },
        { fx: { set: { paimon_promised: true }, sus: { paimon: 1 } } },
        { hangup: true },
      ],
      silent: [{ say: 'Childe? CHILDE?? Is this a prank?? Paimon is hanging up!!' }, { say: '…Paimon is not hanging up.' }, { say: '…Okay bye!!!' }, { hangup: true }],
      truth: [
        { fx: { set: { told_truth: true } } },
        { say: 'WHAT?!' },
        { say: 'Then who’s paying for HOTPOT?!' },
        { say: 'LUMINE!!! LUMIIIINE!!! There’s a STRANGER in Childe’s PHONE!!!' },
        { start: 'core_honest_call', inThread: 'paimon' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });

  // ── Hu Tao ───────────────────────────────────────────────────
  D('ht', {
    id: 'dial_ht',
    nodes: {
      start: [
        { say: 'Wangsheng Funeral Parlor’s most beautiful director speaking~' },
        { say: 'Ohh. Mr. Harbinger’s phone. Calling me. While Mr. Harbinger is… elsewhere. Interesting~' },
        { choice: [
          { t: '"Hey, Hu Tao! It’s me!"', go: 'voice' },
          { t: '(Stay silent)', go: 'silent' },
          { t: '"What’s in Coffin 4?"', go: 'coffin', if: (s) => !!F(s).knows_hideout },
          { t: '(Tell her the truth)', go: 'truth' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      voice: [
        { say: 'Is it, though? 👻' },
        { say: 'Hm. Hm hm hm. Your voice is a whole octave of wrong, mister.' },
        { fx: { sus: { ht: 3 } } },
        { choice: [
          { t: '(Hang up)', go: 'hang' },
          { t: '(Tell her the truth)', go: 'truth' },
        ] },
      ],
      silent: [{ say: 'Ooh, the silent type. I like that in a client. Most of mine are.' }, { fx: { sus: { ht: 1 } } }, { hangup: true }],
      coffin: [
        { say: 'Coffin four? What coffin four. There are three coffins. There have always been three coffins.' },
        { say: 'Goodbye!' },
        { fx: { sus: { ht: 2 } } },
        { hangup: true },
      ],
      truth: [
        { fx: { set: { told_truth: true } } },
        { say: 'Ooh. A confession! Say it again, slower, in writing. I collect these.' },
        { start: 'confess_ht', inThread: 'ht' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  D('ht', {
    id: 'dial_ht_ally',
    nodes: {
      start: [
        { say: 'Phone person!! 👻 Xiansheng told me everything. Well. He told me one sentence, very slowly, over about four minutes.' },
        { if: (s) => s.chapter === 'mon', go: 'mon' },
        { choice: [
          { t: '"How is he?"', go: 'how' },
          { t: '"Write me a poem."', go: 'poem', if: (s) => !F(s).ht_call_poem },
          { t: '"Just checking in."', go: 'bye' },
        ] },
      ],
      how: [
        { say: 'Eating my noodles and complaining about the coffin lining. He says it’s “too soft to fight in”. Nobody asked him to fight in it!!' },
        { say: 'He says: “tell them to keep it charged.” So. Keep it charged~' },
        { hangup: true },
      ],
      poem: [
        { fx: { set: { ht_call_poem: true }, aff: { ht: 1 } } },
        { say: 'Okay okay. Ahem.' },
        { say: '“Two fools on a pier / one wet, one borrowed / both lying for love / and I’m the one with the coffins.” …Thank you, thank you.' },
        { hangup: true },
      ],
      mon: [
        { say: 'He’ll call you from our landline at eight. I’ll make sure he’s awake. I’m going to use the gong.' },
        { hangup: true },
      ],
      bye: [{ say: 'Byeee~ stay alive! It’s bad for business, but I’ll allow it.' }, { hangup: true }],
    },
  }, (s) => !!(F(s).ht_ally || F(s).zl_contract));

  // ── Ekaterina ─────────────────────────────────────────────────
  D('ekat', {
    id: 'dial_ekat',
    nodes: {
      start: [
        { say: 'Sir?! Sir, is that you? Thank the Tsaritsa. I’ve been calling all night. I— Sir?' },
        { choice: [
          { t: '(Tap the phone twice)', go: 'taps' },
          { t: '"Ekaterina! Everything’s fine!"', go: 'voice' },
          { t: '(Whisper) "Signora knows you warned him. Get out of the office."', go: 'warn', if: (s) => !!F(s).memo31_heard && !F(s).ekat_warned && chN(s) >= 1 },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      taps: [
        { say: '…Two taps.' },
        { say: 'Understood, Sir. You can’t talk.' },
        { say: 'I’ll keep the office quiet. I’ll tell them you’re at— a meeting. Stay safe. Please.' },
        { hangup: true },
      ],
      voice: [
        { say: '…' },
        { say: 'You’re not Sir.' },
        { say: 'Who is this? Where is he? If you’ve hurt him, I swear on the Tsaritsa—' },
        { fx: { sus: { ekat: 3 } } },
        { choice: [
          { t: '(Tell her the truth)', go: 'truth' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      warn: [
        { say: '…How do you know about that call. That was— that was private.' },
        { say: 'You’re not him.' },
        { say: '…But you heard it. And you’re warning me.' },
        { say: 'All right. All right. I’m going. I’ll take the cicins.' },
        { fx: { set: { ekat_warned: true }, sus: { ekat: 2 } } },
        { hangup: true },
      ],
      truth: [
        { fx: { set: { told_truth: true } } },
        { say: 'You found it. On the pier.' },
        { say: '…Then please. Bring it to the bank. To me. Not to anyone else on the top floor. Do you understand? Not to anyone else.' },
        { start: 'core_honest_call', inThread: 'ekat' },
        { hangup: true },
      ],
      hang: [{ fx: { sus: { ekat: 1 } } }, { hangup: 'me' }],
    },
  });

  // ── La Signora ────────────────────────────────────────────────
  D('signora', {
    id: 'dial_signora',
    nodes: {
      start: [
        { say: 'Tartaglia. You telephoned me. How unusual.' },
        { if: (s) => s.chapter === 'sun_night' && !after(s, '+2 22:45') && !F(s).osial_sent, go: 'deadline' },
        { if: (s) => s.chapter === 'mon', go: 'mon' },
        { say: 'If this is an apology, I accept them in writing only.' },
        { choice: [
          { t: '"I’m not apologising."', go: 'cold' },
          { t: '(Stay silent)', go: 'silent' },
          { t: '"I’m sorry."', go: 'sorry' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      cold: [
        { say: 'No. You never do. It is the only consistent thing about you.' },
        { say: 'The line is poor. You sound… smaller. Tomorrow, then. Don’t make me come to you.' },
        { fx: { sus: { signora: 1 } } },
        { hangup: true },
      ],
      silent: [{ say: 'Silence. Sulking suits you. Goodbye, Tartaglia.' }, { hangup: true }],
      sorry: [
        { say: '…Say that again.' },
        { say: 'No. You wouldn’t. Not if I held your brother over the harbor.' },
        { say: 'Who is this?' },
        { fx: { sus: { signora: 3 } } },
        { hangup: true },
      ],
      deadline: [
        { say: 'Do you have my code? You have until half past ten. I will not ask by telephone. I will ask in writing, so that there is a record of your answer.' },
        { hangup: true },
      ],
      mon: [
        { if: (s) => F(s).osial_sent, go: 'mon_good' },
        { say: 'You have nothing to say to me that I want to hear, Tartaglia. Save it for Zapolyarny.' },
        { hangup: true },
      ],
      mon_good: [{ say: 'You did well. Don’t make me say it twice.' }, { hangup: true }],
      hang: [{ hangup: 'me' }],
    },
  });

  // ── Scaramouche ───────────────────────────────────────────────
  D('scara', {
    id: 'dial_scara',
    ringFor: 6,
    nodes: {
      start: [
        { say: '…' },
        { say: 'Did you just call me? Nobody calls me. Eleventh, are you drunk, or dying? Either is fine.' },
        { choice: [
          { t: '"Miss me, Balladeer?"', go: 'voice' },
          { t: '(Stay silent)', go: 'silent' },
          { t: '"How’s my tuna?"', go: 'tuna', if: (s) => !!F(s).clue_bluefin },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      voice: [
        { say: 'Your voice is wrong.' },
        { say: 'Your voice is wrong, and you said “Balladeer” like you read it off a door. Interesting.' },
        { say: 'Don’t hang up. I’m enjoying this.' },
        { fx: { sus: { scara: 3 } } },
        { hangup: true },
      ],
      silent: [{ say: 'Breathing. Charming. Are you in the sea again? Stay there.' }, { fx: { sus: { scara: 1 } } }, { hangup: true }],
      tuna: [
        { say: '…You’re very proud of that fish. It’s pathetic.' },
        { say: 'It was ninety kilos of nothing, and you named it after me because you have the imagination of a wet sock. Goodbye.' },
        { fx: { sus: { scara: -1 } } },
        { hangup: true },
      ],
      hang: [{ fx: { sus: { scara: 1 } } }, { hangup: 'me' }],
    },
  });

  // ── Beidou ────────────────────────────────────────────────────
  D('beidou', {
    id: 'dial_beidou',
    nodes: {
      start: [
        { say: '(Wind. Gulls. Someone on deck yelling about a rope.)', from: 'sys' },
        { if: (s) => F(s).beidou_snubbed, go: 'snubbed' },
        { if: (s) => F(s).beidou_went, go: 'went' },
        { say: 'KID! Ha! You finally use that thing like a phone! What, the rematch got you scared?' },
        { choice: [
          { t: '"Scared? I’m counting the days."', go: 'brave' },
          { t: '(Stay silent)', go: 'silent' },
          { t: '"Actually, I don’t really want to fight you."', go: 'meek' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      brave: [
        { say: 'THAT’S what I like to hear!' },
        { say: '…Your voice sounds weird, though. Somebody punch you in the throat? Good. Means you’ve been practising.' },
        { if: (s) => chN(s) <= 3, go: 'brave_date' },
        { hangup: true },
      ],
      brave_date: [{ say: 'Saturday, ten, my deck. Bring your own ice pack.' }, { fx: { sus: { beidou: 1 } } }, { hangup: true }],
      meek: [
        { say: '…' },
        { say: 'Who are you and what did you do with the kid?' },
        { say: 'Never mind. Don’t tell me. I’ll find out at sea, everyone does.' },
        { fx: { sus: { beidou: 3 } } },
        { hangup: true },
      ],
      silent: [{ say: 'Hello?? Can’t hear you over the gulls! Call me back when you’re not in a cave!' }, { hangup: true }],
      snubbed: [{ say: 'Oh, NOW you call. I waited on deck till midnight with the whole crew, kid. Don’t call my ship. The Crux doesn’t carry no-shows.' }, { hangup: true }],
      went: [{ say: 'Stand-in! How’s the head? Kazuha wrote a poem about your third round. It’s very moving. You fall over in it.' }, { hangup: true }],
      hang: [{ hangup: 'me' }],
    },
  });

  // ── Xiangling ─────────────────────────────────────────────────
  D('xl', {
    id: 'dial_xl',
    nodes: {
      start: [
        { say: 'Childe!! Hi!! Is this about the pelmeni?? I tried again and Guoba ate the whole first batch 🔥' },
        { choice: [
          { t: '"Send a batch to the night shift at the bank. On me!"', go: 'order', if: (s) => !F(s).xl_phone_order },
          { t: '"Teach me how you make hotpot broth."', go: 'broth' },
          { t: '(Stay silent)', go: 'silent' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      order: [
        { fx: { set: { xl_phone_order: true } } },
        { run: (api) => {
          const st = api.state;
          let ok = false;
          try {
            const r = JC.bank ? JC.bank.charge({ amount: 688, merchant: 'Wanmin Go', app: 'lotuseats', cat: 'food', note: 'Pelmeni ×40 (night shift, by phone)', sms: 'WANMIN GO' }) : { ok: true };
            ok = !!(r && r.ok);
          } catch (e) { ok = false; }
          st.flags.xl_order_ok = ok;
          if (ok) {
            try { api.store.add('orders', { rest: 'wanmin', items: [{ name: 'Pelmeni (Snezhnayan)', qty: 40, price: 17.2 }], total: 688, t: JC.time.now(), status: 'cooking', to: 'northland' }, { front: true }); } catch (e) { /* optional */ }
            api.story.act('order', { rest: 'wanmin', items: [{ name: 'Pelmeni (Snezhnayan)', qty: 40 }], total: 688, to: 'northland', app: 'lotuseats' });
          }
        } },
        { if: (s) => F(s).xl_order_ok, go: 'order_ok' },
        { say: 'Oh no, your card got declined!! Is the bank okay?? Is the BANK broke??' },
        { say: 'Don’t worry, I’ll send them a little something anyway. Chefs look after night shifts. It’s the law. My law.' },
        { hangup: true },
      ],
      order_ok: [
        { say: 'On it!! The Liyue Branch is my favourite customer. They always say thank you in a very scary way!' },
        { say: '…Your voice sounds different! Are you cold? I’m putting ginger in the broth for you. No arguments!' },
        { fx: { sus: { xl: 1 } } },
        { hangup: true },
      ],
      broth: [
        { say: 'You want to COOK?? You?? Last time you tried you set the Wanmin kitchen on fire with a Hydro Vision, which shouldn’t even be possible!!' },
        { say: '…Are you okay? You sound really different. Like a person who’s never been on fire.' },
        { fx: { sus: { xl: 2 } } },
        { hangup: true },
      ],
      silent: [{ say: 'Hello? Childe? Oh no, did Guoba sit on your phone again— wait, that was MY phone. Bye!!' }, { hangup: true }],
      hang: [{ hangup: 'me' }],
    },
  });

  // ── Pulcinella ────────────────────────────────────────────────
  D('pulci', {
    id: 'dial_pulci',
    nodes: {
      start: [
        { say: 'My boy! You never telephone your old sponsor.' },
        { if: (s) => chN(s) >= 1 && chN(s) <= 5, go: 'mid' },
        { say: 'Your mother tells me the children are on their way. Isn’t it wonderful? I arranged everything.' },
        { go: 'ask' },
      ],
      mid: [{ say: 'Are the children enjoying Liyue? I do hope my driver was punctual. I chose him myself.' }, { go: 'ask' }],
      ask: [{ choice: [
        { t: '"Why did you book them into the Grand?"', go: 'grand', if: (s) => !!F(s).saw_travel },
        { t: '"Thank you, sir."', go: 'sir' },
        { t: '(Stay silent)', go: 'silent' },
        { t: '(Hang up)', go: 'hang' },
      ] }],
      grand: [
        { say: 'Because it is the best, my boy. Only the best for the Eleventh’s family.' },
        { say: 'And so convenient. Near the bank. Near… everything.' },
        { say: 'You sound tired. Rest. Let the grown-ups worry about the children.' },
        { fx: { sus: { pulci: 1 } } },
        { hangup: true },
      ],
      sir: [
        { say: '…“Sir”?' },
        { say: 'You haven’t called me “sir” since you were fifteen and broke my window with a practice spear.' },
        { say: 'Who is this, please? No. Don’t trouble yourself. I shall find out.' },
        { fx: { sus: { pulci: 3 } } },
        { hangup: true },
      ],
      silent: [
        { say: 'Sulking. Just like when you were small.' },
        { say: 'Well. Give my love to the children. I shall be watching— thinking of them. Fondly.' },
        { hangup: true },
      ],
      hang: [{ fx: { sus: { pulci: 1 } } }, { hangup: 'me' }],
    },
  });

  // ── Wangsheng's landline (before Monday; Monday's calls are in finale.js) ─────
  D('wangsheng', {
    id: 'dial_ws',
    nodes: {
      start: [
        { say: 'Wangsheng Funeral Parlor, Hu Tao speaking! How may we bury you today?' },
        { choice: [
          { t: '"Is Childe there?"', go: 'ask' },
          { t: '(Tell her you found Childe’s phone)', go: 'truth' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      ask: [
        { if: (s) => !!(F(s).ht_ally || F(s).zl_contract), go: 'ask_ally' },
        { say: 'Childe? Never heard of him. There are definitely no tall ginger men in any of our coffins.' },
        { say: 'Especially not number four. Byeee~' },
        { fx: { set: { knows_hideout: true }, sus: { ht: 1 } } },
        { hangup: true },
      ],
      ask_ally: [
        { say: '(Whispering) He’s asleep. In number four. It’s very comfortable. He snores like a walrus. Don’t tell anyone~' },
        { fx: { set: { knows_hideout: true } } },
        { hangup: true },
      ],
      truth: [
        { fx: { set: { told_truth: true } } },
        { say: 'Ooh. The phone person. Tell me in writing, I like to have it on file.' },
        { start: 'confess_ht', inThread: 'ht' },
        { hangup: true },
      ],
      hang: [{ hangup: 'me' }],
    },
  });
  // Monday (from 08:00) or Lost Mode: Childe himself answers — calls defined in scenes/finale.js
  S.dialScript('wangsheng', 'call_ws_short_out', (s) => !!F(s).lost_mode && !F(s).ws_talked);
  S.dialScript('wangsheng', 'call_ws_mon_out', (s) => s.chapter === 'mon' && after(s, '+3 08:00') && !F(s).ws_talked && !F(s).lost_mode);
  S.dialScript('wangsheng', 'call_ws_mon_after', (s) => s.chapter === 'mon' && !!F(s).ws_talked && !F(s).lost_mode);

  // a confession by phone that the contact's own scene doesn't cover → Return to Sender
  S.scene({
    id: 'core_honest_call', arc: 'core', trigger: { on: 'manual' },
    nodes: { start: [{ wait: 4 }, { ending: 'honest' }] },
  });
})();
