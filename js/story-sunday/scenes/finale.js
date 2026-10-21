/* Finale — the night clock, falling asleep, Saturday 07:38 (Lost Mode), and the real Jiang Cheng calling from
   Lotus Pier HQ at 07:41 to go through Sunday seat by seat. Then Tang Mei at ten and { dinner: true }.
   Also the consequence scenes `early_return` (the phone goes back tonight) and `zidian_fall` (he finds you),
   the Swift Ride lost-item report, and the passcode change.
   Edition bible: docs/SUNDAY.md · this file: docs/sunday/c.md · facts: docs/STORY.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => s.flags || {};
  const aff = (s, id) => (s.aff && s.aff[id]) || 0;
  const num = (s, k) => (typeof F(s)[k] === 'number' ? F(s)[k] : 0);
  const night = (s) => !F(s).night_done;
  // The one finish of the edition: the dinner cinematic, then the 'sunday' ending (js/core/story.js).
  // (`end` is never reached — the dinner step finishes the game — it only keeps tools/storytest.js's step list happy.)
  const DINNER = { dinner: true, end: true };
  const table = (s) => JC.sunday.table(s);
  const trust = (s) => JC.sunday.trust(s);
  // the night is over early: the phone went back, or he came for it
  const gone = (s) => !!(F(s).returned_early || F(s).zidian);

  // ── What "he" did through the other apps: Jiang Cheng brings up the two most notable (in this order) ──
  // Lines are his asides on the call. Flags come from the react-*.js files (docs/reactions/*.md).
  const sentSelfie = () => { try { return JC.story.trace().some((x) => /selfie/i.test(x.text) && /^sent|^posted/i.test(x.text)); } catch (e) { return false; } };
  const finishedNote = () => { try { return JC.story.trace().some((x) => /^finished his letter/i.test(x.text)); } catch (e) { return false; } };
  const APP_REMARKS = [
    { if: (s) => F(s).soup_owned, lines: ['You told him about the soup.', "Both times. He wasn't supposed to know about the first one."] },
    { if: (s) => !!(F(s).wwx_draft || F(s).found_draft), lines: ['That draft was two years old.', 'You found it. You sent it.'] },
    { if: (s) => !!F(s).xichen_draft_sent, lines: ['You sent him the note. The locked one.', () => (finishedNote() ? '…And you finished it. What did I say?' : 'I started that a year ago. I never got past the first line.')] },
    { if: (s) => !!F(s).toast_edited, lines: ["You finished my toast. The one in Recently Deleted.", "…I'm not reading that out loud.", "(He is going to read it out loud.)"] },
    { if: (s) => !!F(s).jiujiu_memo_deleted, lines: ['You deleted A-Ling saying jiujiu. The first time he got it right.', "It's in Recently Deleted. Thirty days. Don't touch it again."] },
    { if: (s) => !!F(s).wwx_meds_stopped, lines: ['You turned off the medication sharing.', 'He checks it every night at 8:05.', "…I'll turn it back on."] },
    { if: (s) => !!F(s).mom_vm_heard, lines: ["You played my mother's voicemail.", '…Did she sound angry?', "She always sounded angry. She wasn't."] },
    { if: (s) => !!F(s).renamed_wwx, lines: [(s) => 'And Wei Wuxian is saved as "' + F(s).renamed_wwx + '" in my phone now.', '…Leave it.'] },
    { if: (s) => !!F(s).renamed_wwx_cold, lines: ['You renamed Wei Wuxian in my phone.', 'Somehow you made it worse.'] },
    { if: (s) => !!F(s).deleted_wwx_contact, lines: ['You deleted Wei Wuxian from my contacts.', '…I know the number.'] },
    { if: (s) => !!(F(s).deleted_ajie || F(s).deleted_moon), lines: ['You deleted—', "…It's in Recently Deleted. Thirty days. Don't touch anything else."] },
    { if: (s) => F(s).took_selfie && sentSelfie(), lines: ['You sent people a picture of your face. From my phone.', "Half my contacts know what you look like now. I don't."] },
    { if: (s) => !!F(s).looked_up_return, lines: ["You looked up how to give it back. It's in my history.", '…It took you long enough.'] },
    { if: (s) => !!(F(s).told_recipe && s.done.r_web_cmt_soup), lines: ['You told him about the fire. On a recipe website. As me.'] },
    { if: (s) => F(s).soup_sent && !F(s).soup_owned, lines: ["And there's a pot of Auntie Lu's going to the Jingshi at ten-thirty.", "…It's the right soup."] },
    { if: (s) => F(s).fed_jc === true, lines: ['And somebody sent food to my room at one in the morning. From my account.', '…It was good.'] },
    { if: (s) => F(s).fed_jc === 'later', lines: ['And breakfast is coming to my room. From my own account.'] },
    { if: (s) => !!s.done.r_mu_shijie, lines: ["A-Ling says you played his mother's songs.", 'He saw that playlist in September. He never said anything. Neither did I.'] },
    { if: (s) => !!F(s).soup_song_seen, lines: ['You played the soup song. A-Ling saw.', "He's watched me play it forty times. He never said a word about it until you."] },
    { if: (s) => !!F(s).loc_nhs, lines: ['You shared my location with Nie Huaisang.', "He's going to ask about Jinxing Road for the rest of my life."] },
    { if: (s) => !!F(s).knows_swap, lines: ["You read Huaisang's seating email.", 'Then you know whose fault the balcony was.'] },
    { if: (s) => !!F(s).tea_cal && !!F(s).tea_yes, lines: ['You answered his calendar invitation.', 'He says it informed him very formally.'] },
    { if: (s) => !!F(s).renamed_lxc, lines: [(s) => 'Zewu-jun is "' + F(s).renamed_lxc + '" in my phone now.', 'Leave that too.'] },
    { if: (s) => !!s.done.r_hl_jl, lines: ['You showed A-Ling my heart rate.', (s) => (F(s).lxc_saw_121 ? '…It was hot in there. Now Xichen knows too.' : '…It was hot in there.')] },
    { if: (s) => !!(s.done.r_focus_wwx || s.done.r_focus_jl), lines: ['You put my phone on Do Not Disturb.', "Wei Wuxian thinks he's the disturb. He's right."] },
    { if: (s) => !!F(s).tea_alarm, lines: ["There's an alarm on my phone labelled 'Tea'.", "…I'll keep it."] },
    { if: (s) => !!F(s).med_alarm_off, lines: ['You turned off my medication alarm.', 'A-Ling set those.'] },
    { if: (s) => !!F(s).wallpaper_changed, lines: ['You changed my wallpaper.', (s) => (/fairy|dog/i.test(String(F(s).wallpaper_changed)) ? '…To the dog. Leave it.' : 'Change it back.')] },
    { if: (s) => !!F(s).dog_friday_mail, lines: ['Liu Qian has my approval in writing now. Sent after midnight.'] },
    { if: (s) => !!F(s).wn_paid, lines: ['You paid Wen Ning for the tow. He kept fifty for petrol.', '…Good.'] },
    { if: (s) => !!F(s).ate_on_card, lines: ['You ate on my card.', '…Did you eat enough.'] },
    { if: (s) => !!F(s).huang_fridge, lines: ['Old Huang says thank you for whatever you sent the house. He ate it. That is the rule.'] },
  ];
  const remarks = (s) => APP_REMARKS.filter((r) => { try { return r.if(s); } catch (e) { return false; } }).slice(0, 2);
  const remark = (k, j) => (s) => {
    const r = remarks(s)[k];
    const l = r && r.lines[j];
    try { return typeof l === 'function' ? l(s) : l || null; } catch (e) { return null; }
  };

  // ── The night clock: 23:47 → ~02:00 in ~35 minutes of play ──────
  // Jumps on top of the 1:1 clock, so the arcs land near their beats (car ~00:03, moon ~01:00).
  const tick = (wait, by) => [
    { wait },
    { if: (s) => F(s).night_done, go: 'stop' },
    { time: by },
  ];
  S.scene({
    id: 'night_clock',
    thread: 'ea',
    trigger: { on: 'unlock', delay: 170 },
    when: night,
    nodes: {
      start: [
        { time: '+12m' },
        ...tick(250, '+12m'),
        ...tick(300, '+15m'),
        ...tick(300, '+15m'),
        ...tick(300, '+15m'),
        ...tick(300, '+15m'),
        ...tick(300, '+12m'),
        ...tick(300, '+6m'),
      ],
      stop: [{ end: true }],
    },
  });

  // ── Falling asleep (~02:00, or earlier once every arc has settled) ─
  const settled = (s) => ['wwx_done', 'jl_done', 'lxc_done', 'ops_done', 'nhs_done'].every((k) => F(s)[k]);
  S.scene({
    id: 'night_end',
    thread: 'ea',
    trigger: { on: 'unlock', delay: 1560 },
    when: night,
    nodes: {
      start: [
        { if: (s) => F(s).night_done || gone(s), go: 'stop' },
        { if: settled, go: 'sleepy' },
        { fx: { inc: { night_wait: 1 } } },
        { if: (s) => num(s, 'night_wait') >= 14, go: 'sleepy' },
        { wait: 45 },
        { go: 'start' },
      ],
      sleepy: [
        { run: (api) => { try { api.os.setBattery(10); } catch (e) { /* optional */ } } },
        { notify: { app: 'settings', title: 'Low Battery', body: '10% of battery remaining' } },
        { wait: 20 },
        { if: (s) => gone(s), go: 'stop' },
        { fx: { set: { night_done: true } } },
        { time: '07:38', card: 'You plug his phone into your charger and close your eyes. Just for a minute. Across Lanling a wet dog is asleep on someone’s bed, a pot is cooling on a stove in Gusu, and in Room 1808 Jiang Cheng is asleep with no idea what he said tonight, or what he has agreed to on Sunday.' },
        { run: (api) => { try { api.os.setBattery(100); } catch (e) { /* optional */ } } },
        { start: 'morning' },
      ],
      stop: [{ end: true }],
    },
  });

  // ── Saturday, 07:38 ──────────────────────────────────────────────
  // The lock screen renders its own "This iPhone has been lost." title above this message.
  // He read everything on his laptop at six. From it he answers a few people himself: the morning messages
  // follow the table (who "he" said yes to, what broke, what is still open).
  const LOST = 'Please call Lotus Pier HQ. — J.C. Return it. I mean it.';
  const scandalOpen = (s) => !!(F(s).scandal && !F(s).scandal_fixed);
  const burnedOpen = (s) => !!(F(s).burned && !F(s).burned_mended);
  S.scene({
    id: 'morning',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: gone, go: 'done' },
        { fx: { set: { lost_mode: true, finale: true } } },
        { run: (api) => { try { api.os.lostMode({ message: LOST, phone: '+86 555 0716 0000', contact: 'hq' }); } catch (e) { /* optional */ } } },
        { wait: 4 },
        { m: "To whoever has this phone: this is Tang Mei, Mr. Jiang's assistant." },
        { m: 'He will call it from the Lotus Pier HQ line at 7:41. He was specific about the minute.' },
        { m: 'He has a list. It is about Sunday.' },
        { m: 'Please answer. He is calm.' },
        { m: '(He is not calm.)' },
        { if: burnedOpen, go: 'm_burned' },
        { if: (s) => F(s).wwx_invited, go: 'm_wwx', else: 'm_jl' },
      ],
      m_wwx: [
        { me: 'Ignore everything this phone sent last night.', th: 'wwx' },
        { wait: 3 },
        { me: 'Except Sunday.', th: 'wwx' },
        { m: 'JIANG CHENG', th: 'wwx', from: 'wwx' },
        { m: 'ur LAPTOP just said "except sunday"', th: 'wwx', from: 'wwx' },
        { m: "IT STANDS. lan zhan it stands. i'm crying at 7am", th: 'wwx', from: 'wwx' },
        { m: '…wait. who did i talk to last night', th: 'wwx', from: 'wwx' },
        { go: 'm_jl' },
      ],
      // the thread is silent; Lan Wangji is not
      m_burned: [
        { m: 'He has not slept.', th: 'lwj', from: 'lwj' },
        { m: 'He is on the roof.', th: 'lwj', from: 'lwj' },
        { m: 'Come.', th: 'lwj', from: 'lwj' },
        { go: 'm_jl' },
      ],
      m_jl: [
        { m: 'jiujiu called me from the HOTEL PHONE', th: 'jl', from: 'jl' },
        { m: 'he says he lost his phone in a taxi last night??', th: 'jl', from: 'jl' },
        { if: scandalOpen, go: 'm_jl_board' },
        { if: (s) => F(s).car_handled, go: 'm_jl_car' },
        { m: 'so who have i been texting', th: 'jl', from: 'jl' },
        { go: 'm_lxc' },
      ],
      m_jl_board: [
        { m: 'also the board wants to move my birthday to koi tower', th: 'jl', from: 'jl' },
        { m: 'with a PRESS WALL', th: 'jl', from: 'jl' },
        { m: 'whoever u are. if ur talking to him. tell him no', th: 'jl', from: 'jl' },
        { go: 'm_lxc' },
      ],
      m_jl_car: [
        { m: 'so who got sandu out of the pond', th: 'jl', from: 'jl' },
        { m: '…', th: 'jl', from: 'jl' },
        { m: 'whoever u are. thanks i guess', th: 'jl', from: 'jl' },
        { go: 'm_lxc' },
      ],
      m_lxc: [{ if: (s) => F(s).tea_yes, go: 'm_lxc_tea', else: 'ring' }],
      m_lxc_tea: [
        { me: 'Three.', th: 'lxc' },
        { m: 'Good morning, Wanyin. Three. 🙂', th: 'lxc', from: 'lxc' },
        { go: 'ring' },
      ],
      ring: [
        { wait: 10 },
        { time: '07:41' },
        { if: (s) => F(s).hq_talked || gone(s), go: 'done' },
        { call: 'call_hq' },
      ],
      done: [{ end: true }],
    },
  });

  // ═════════════════════════════════════════════════════════════════
  // THE CALL. Shared by the incoming call, the player phoning HQ, and his callback after a hang-up.
  // Shape: who are you → did you read my messages → why → Sunday, seat by seat (A-Ling, Wei Wuxian, Wen Ning,
  // Xichen, Huaisang, Ops/Old Huang/Fairy, A-Jie) → his asides (passcode, APP_REMARKS) → you → Tang Mei at ten.
  // ═════════════════════════════════════════════════════════════════
  const soupKnown = (s) => !!(F(s).soup_note_read || s.done.r_note_soup || F(s).ajie_read);
  function hqNodes(opening, ignoreFlag, after) {
    const ignore = [{ fx: { set: { [ignoreFlag]: true } } }, { start: after }, { hangup: 'me' }];
    const first = [
      { t: `"I found it in the taxi. I'm sorry."`, go: 'truth' },
      { t: '"Swift Ride, Master Wu speaking."', label: '(Pretend to be the taxi driver)', go: 'driver' },
      { t: '(Say nothing)', go: 'silent' },
      { t: '(Hang up)', go: 'hang' },
    ];
    return {
      start: [{ fx: { set: { hq_talked: true } } }, ...opening, { choice: first }],
      hang: ignore,
      silent: [
        { say: 'I can hear you breathing.' },
        { say: "I've had a long night. You've had my phone for eight hours. Say something." },
        { choice: [
            { t: `"I found it in the taxi. I'm sorry."`, go: 'truth' },
            { t: '"Swift Ride, Master Wu speaking."', label: '(Pretend to be the taxi driver)', go: 'driver' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      driver: [
        { say: 'Master Wu is a woman.' },
        { say: "And she called Swift Ride at six this morning to say my phone wasn't in her car. Try again." },
        { choice: [
            { t: `"…Okay. I'm not the driver. I found it."`, go: 'truth' },
            { t: `"…I'm her husband."`, go: 'husband' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      husband: [
        { say: 'Her husband.' },
        { say: 'Put Master Wu on.' },
        { choice: [
            { t: `"…Fine. I'm not her husband. I found it."`, go: 'truth' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],

      truth: [
        { fx: { set: { told_truth: true, hq_truth: true } } },
        { say: '…' },
        { say: 'Fine.' },
        { say: 'Where are you.' },
        { choice: [
            { t: '"Jinxing Road 27. Lanling."', go: 'where' },
            { t: '"I can bring it to you myself."', go: 'bring' },
          ] },
      ],
      bring: [
        { say: "You're not taking my phone on any more trips. Where are you." },
        { choice: [
            { t: '"Jinxing Road 27. Lanling."', go: 'where' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      where: [
        { say: (s) => (F(s).wn_pickup || F(s).wn_accomplice ? "Stay there. Wen Ning says he's collecting it at half past eight. Let him. Don't touch anything else." : "Stay there. Someone will come for it at ten. Don't touch anything else.") },
        { say: '…' },
        { say: 'Did you read my messages?' },
        { choice: [
            { t: '"Some of them."', go: 'read_some' },
            { t: '"I answered some of them."', go: 'answered' },
            { t: '"No."', label: '(Lie) "No."', go: 'lie' },
          ] },
      ],
      lie: [
        { fx: { inc: { trust_bonus: -1 } } },
        { say: 'I have a laptop.' },
        { say: "I read every message this phone sent last night. At six o'clock this morning. In a hotel bathrobe." },
        { go: 'why' },
      ],
      read_some: [
        { say: 'Some.' },
        { say: 'And?' },
        { choice: [
            { t: '"…And I answered some of them."', go: 'answered' },
            { t: `"And I'm sorry."`, go: 'answered' },
          ] },
      ],
      answered: [
        { say: 'I know.' },
        { say: 'I have a laptop. I read every one of them at six this morning, in a hotel bathrobe, while Old Huang called me four times.' },
        { go: 'why' },
      ],
      why: [
        { say: 'So. Tell me why.' },
        { choice: [
            { t: '"They kept texting. They sounded like they needed an answer."', go: 'why_needed' },
            { t: `"I didn't want them to think you weren't there."`, go: 'why_there' },
            { t: '"Honestly? It was fun."', go: 'why_fun' },
          ] },
      ],
      why_needed: [
        { say: '…They always sound like that.' },
        { say: "That doesn't mean you answer." },
        { say: "…It usually doesn't mean I answer, either." },
        { go: 'sun' },
      ],
      why_there: [
        { say: '…' },
        { say: "I wasn't." },
        { say: 'I was asleep in Room 1808 like an idiot.' },
        { go: 'sun' },
      ],
      why_fun: [
        { say: 'Fun.' },
        { say: "You put my whole family's blood pressure through the roof and you found it fun." },
        { say: '…Tch. Apparently they did too.' },
        { go: 'sun' },
      ],

      // ── Sunday, seat by seat ─────────────────────────────────────
      sun: [
        { say: 'Fine. Then you can help me with this.' },
        { say: "Sunday. Six-thirty. Lotus Pier. A-Ling turns eighteen." },
        { say: (s) => {
          const n = table(s).filled;
          return n >= 7 ? "I wrote the table down at six this morning. Apparently I'm hosting a very different dinner from the one I planned." : n >= 4 ? 'I wrote the table down at six this morning. It is longer than it was on Friday.' : 'I wrote the table down at six this morning. It is a short list.';
        } },
        { say: 'We go through it. Seat by seat. Then you go back to whatever you do.' },
        { go: 'jl' },
      ],

      // A-Ling
      jl: [
        { if: scandalOpen, go: 'jl_scandal' },
        { if: (s) => !!F(s).party_moved, go: 'jl_moved' },
        { if: (s) => F(s).car_handled, go: 'jl_car' },
        { if: (s) => F(s).car_known, go: 'jl_pond' },
        { go: 'jl_kids' },
      ],
      jl_scandal: [
        { if: (s) => !!F(s).lxc_board, go: 'jl_lxc' },
        { say: (s) => (F(s).scandal_kind === 'balcony'
          ? "Huaisang's account posted the balcony again. With my name on it. And Xichen's."
          : "A-Ling's car is on the front page of the Lanling Daily. 'Young master, old valet, one pond.'") },
        { say: 'The Jin board wants to move his birthday to Koi Tower. A press dinner. A wall with their logo on it.' },
        { say: 'They want an answer by noon.' },
        { choice: [
            { t: `"Call the board. It's his birthday, not a product launch."`, go: 'jl_fix' },
            { t: '"Have A-Ling apologise to the valet. In person."', if: (s) => F(s).scandal_kind !== 'balcony', go: 'jl_fix_valet' },
            { t: '"Let them have the afternoon. He can come home after."', go: 'jl_split' },
          ] },
      ],
      jl_moved: [
        { say: "And A-Ling's birthday is at Koi Tower now. Sizhui's spreadsheet says so. In a cell coloured gold." },
        { say: 'Dinner at Lotus Pier after. If he escapes.' },
        { choice: [
            { t: '"Move it back. Lotus Pier. Six-thirty."', go: 'jl_back' },
            { t: '"Leave it. He comes home after."', go: 'jl_split' },
          ] },
      ],
      jl_back: [
        { fx: { set: { party_moved: false, venue_lp: true, venue_kt: false }, log: 'Had Jiang Cheng move the birthday back to Lotus Pier', once: 'hq_back' } },
        { say: "…The Jin board will say I'm stealing him." },
        { say: "I raised him. They can say what they like." },
        { go: 'jl_kids' },
      ],
      jl_fix: [
        { fx: { set: { scandal_fixed: true, scandal_fixed_by: 'call', party_moved: false, venue_lp: true }, log: 'Talked Jiang Cheng into calling the Jin board', once: 'hq_board' } },
        { say: '…Jin Zixun is going to cry.' },
        { say: 'Good.' },
        { say: 'Lotus Pier. Six-thirty. No wall.' },
        { go: 'jl_kids' },
      ],
      jl_fix_valet: [
        { fx: { set: { scandal_fixed: true, scandal_fixed_by: 'valet', party_moved: false, venue_lp: true }, log: 'Sent Jin Ling to apologise to the valet in person', once: 'hq_board' } },
        { say: 'With his own mouth. In a tie.' },
        { say: "…Fine. Then there's nothing left to put on a wall." },
        { go: 'jl_kids' },
      ],
      jl_split: [
        { say: 'Two parties.' },
        { say: "He'll hate the first one. He'll come to the second one late, in a tuxedo, starving." },
        { say: '…Fine.' },
        { go: 'jl_kids' },
      ],
      jl_lxc: [
        { fx: { set: { scandal_fixed: true, scandal_fixed_by: 'lxc', party_moved: false, venue_lp: true } } },
        { say: 'Xichen called Jin Zixun at eight this morning. Apparently he asked very politely.' },
        { say: 'The press wall has been withdrawn. Nobody has ever withdrawn anything for me.' },
        { say: "…Don't say anything." },
        { go: 'jl_kids' },
      ],
      jl_car: [
        { say: 'Sandu is out of the pond.' },
        { if: (s) => F(s).wn_towed, go: 'jl_car_wn' },
        { say: "Old Huang's cousin towed it. Apparently one of the koi is famous now." },
        { go: 'jl_kids' },
      ],
      jl_car_wn: [
        { say: 'Wen Ning towed it. With a rope. In a van that says Radish on the side.' },
        { go: 'jl_kids' },
      ],
      jl_pond: [
        { say: 'And my car is still in a koi pond.' },
        { say: "You didn't think to mention that to anyone." },
        { go: 'jl_kids' },
      ],
      jl_kids: [{ if: (s) => F(s).bday_planned, go: 'jl_plan' }, { go: 'wwx' }],
      jl_plan: [
        { say: 'Sizhui sent me a spreadsheet at six. Cake, venue, seating. It has tabs.' },
        { say: (s) => (F(s).cake_ok ? "Lotus seed paste. He'll say he hates it. He'll have two slices." : null) },
        { if: (s) => F(s).gift_bell && !F(s).bell_ready, go: 'bell' },
        { if: (s) => F(s).gift_bell, go: 'bell_ok' },
        { go: 'wwx' },
      ],
      bell: [
        { say: 'You told them about the bell.' },
        { say: "It's polished. It's still in the jeweller's box." },
        { say: 'Which box does it go in?' },
        { choice: [
            { t: '"The purple velvet one."', go: 'bell_purple' },
            { t: '"The gold one. It\'s the Jin Group."', go: 'bell_gold' },
            { t: '(Say nothing)', go: 'wwx' },
          ] },
      ],
      bell_purple: [
        { fx: { set: { bell_ready: true }, log: 'Reminded him the bell goes in the purple velvet box', once: 'hq_bell' } },
        { say: '…You read my reminders, too.' },
        { say: "He'll complain about the colour for one minute. Good." },
        { go: 'wwx' },
      ],
      bell_gold: [
        { say: 'Gold.' },
        { say: "It's a Jiang bell. It was his mother's." },
        { say: "…I'll remember." },
        { go: 'wwx' },
      ],
      bell_ok: [{ say: 'And the bell is in the purple box. Somebody saw to that.' }, { go: 'wwx' }],

      // Wei Wuxian
      wwx: [
        { if: burnedOpen, go: 'wwx_burned' },
        { if: (s) => F(s).wwx_invited, go: 'wwx_yes' },
        { if: (s) => F(s).wwx_maybe, go: 'wwx_maybe' },
        { go: 'wwx_none' },
      ],
      wwx_burned: [
        { say: 'And you told Wei Wuxian he should have stayed gone.' },
        { say: '(For a long time there is nothing on the line. Somewhere behind him a hotel door closes.)', from: 'sys' },
        { say: "From my phone. In my words. I've thought them. I have never once said them." },
        { say: "Lan Wangji texted me at five. One word." },
        { say: (s) => (F(s).burned_gate ? 'He also says someone promised him the gate would be open. …That was you, too.' : F(s).burned_regret ? "And you told Lan Wangji you didn't mean it. In my voice. He says it still sounded like me." : null) },
        { say: (s) => (F(s).memo_sent ? 'He played the memo twice. On the roof. Lan Wangji says that was the only time he stopped crying.' : null) },
        { choice: [
            { t: '"Go to Gusu. Now. Before he decides you meant it."', go: 'wwx_go' },
            { t: `"Tell him it wasn't you."`, go: 'wwx_tell' },
            { t: '"Give him some time."', go: 'wwx_time' },
          ] },
      ],
      wwx_tell: [
        { say: 'A text. After that.' },
        { say: 'No. That needs a car.' },
        { go: 'wwx_go' },
      ],
      wwx_go: [
        { fx: { set: { burned_mended: true, wwx_invited: true }, inc: { trust_bonus: 1 }, log: 'Sent Jiang Cheng to Gusu to unsay it', once: 'hq_gusu' } },
        { say: 'Tang Mei. A car to Gusu. Now.' },
        { say: "(That wasn't to you.)" },
        { say: "Two hours. He'll still be on the roof. Lan Wangji will have made him stay up there with a blanket." },
        { say: "I'll tell him I didn't send it. And then I'll tell him six-thirty. In person. Since apparently that's what it takes." },
        { go: 'wwx_soup' },
      ],
      wwx_time: [
        { say: 'Time.' },
        { say: 'He had thirteen years of time.' },
        { if: (s) => !!(F(s).burned_gate || F(s).burned_regret || F(s).memo_sent), go: 'wwx_time_no' },
        { say: '…Fine.' },
        { go: 'memo' },
      ],
      // something from the night already reached him; Jiang Cheng won't let it be the last word
      wwx_time_no: [
        { say: '…No.' },
        { say: "Somebody already told him something better than what I said. I'm not leaving it to somebody." },
        { go: 'wwx_go' },
      ],
      wwx_yes: [
        { say: 'You told Wei Wuxian yes.' },
        { say: 'For Sunday. At Lotus Pier.' },
        { say: '(A long pause.)', from: 'sys' },
        { say: 'Six-thirty?' },
        { choice: [
            { t: `"He's bringing the soup."`, go: 'wwx_soup' },
            { t: `"He's bringing her pot."`, go: 'wwx_pot' },
          ] },
      ],
      wwx_pot: [
        { say: '…' },
        { say: 'He kept the pot.' },
        { say: 'Of course he kept the pot.' },
        { go: 'wwx_soup' },
      ],
      wwx_soup: [
        { if: (s) => F(s).told_recipe, go: 'soup_told' },
        { say: (s) => (F(s).soup_practiced ? 'Lan Wangji says he has been practising. The smoke alarm only went off twice this week.' : "He'll burn it. He always rushes the fire.") },
        { choice: [
            { t: '"Tell him. Two hours, low fire."', if: soupKnown, go: 'soup_tell' },
            { t: '"Maybe he needs to hear it from you."', go: 'soup_you' },
            { t: '"Then let him burn it."', go: 'memo' },
          ] },
      ],
      soup_told: [
        { say: 'And you told him about the fire.' },
        { say: 'Low fire. Two hours. She texted me that in 2008. I never told him.' },
        { say: '…Now he knows.' },
        { go: 'memo' },
      ],
      soup_tell: [
        { fx: { set: { told_recipe: true, recipe_from_jc: true }, log: 'Got Jiang Cheng to pass on the soup: two hours, low fire', once: 'hq_recipe' } },
        { say: '…How do you know that.' },
        { say: 'The note. Of course. You read my notes.' },
        { say: "I'll text him. From the laptop. 'Two hours. Low fire. Don't rush it.' Nothing else." },
        { go: 'memo' },
      ],
      soup_you: [
        { say: 'Tch.' },
        { say: "It's her recipe. It isn't mine to give." },
        { say: "…Stay out of my soup." },
        { go: 'memo' },
      ],
      wwx_maybe: [
        { say: 'And you told Wei Wuxian "not no".' },
        { say: 'He has a notebook now. With a section for me.' },
        { choice: [
            { t: '"Turn it into a yes."', go: 'maybe_yes' },
            { t: `"Leave it. It's yours to answer."`, go: 'maybe_leave' },
          ] },
      ],
      maybe_yes: [
        { fx: { set: { wwx_invited: true }, log: 'Talked him into turning “not no” into yes', once: 'hq_maybe' } },
        { say: '…Six-thirty.' },
        { say: "From the laptop. Before I change my mind." },
        { go: 'wwx_soup' },
      ],
      maybe_leave: [{ say: '…It is.' }, { go: 'memo' }],
      wwx_none: [
        { say: 'Wei Wuxian asked about Sunday. Three times. You didn’t answer him either.' },
        { say: "…Good. That one's mine." },
        { go: 'memo' },
      ],
      memo: [
        { if: (s) => F(s).memo_sent, go: 'memo_sent' },
        { if: (s) => F(s).wwx_thanked, go: 'memo_thanked' },
        { if: (s) => F(s).memo_heard, go: 'memo_heard' },
        { go: 'wn' },
      ],
      memo_sent: [
        { say: '…And you sent it.' },
        { say: 'The memo.' },
        { say: '(For a while there is only his breathing, and somewhere behind him a hotel door closing.)', from: 'sys' },
        { say: 'Two years I kept that.' },
        { say: "Fine. That's— fine." },
        { go: 'wn' },
      ],
      memo_thanked: [
        { say: 'And you thanked him. For the—' },
        { say: 'Tch.' },
        { say: '…Good. Someone had to.' },
        { go: 'wn' },
      ],
      memo_heard: [
        { say: 'And you listened to it. The memo. It says "played".' },
        { say: "Don't tell anyone what's on it." },
        { say: "…Don't tell me how it sounded, either." },
        { go: 'wn' },
      ],

      // Wen Ning
      wn: [
        { if: (s) => F(s).wn_accomplice, go: 'wn_acc' },
        { if: (s) => F(s).wn_invited, go: 'wn_yes' },
        { if: (s) => F(s).wn_towed, go: 'wn_tow' },
        { go: 'lxc' },
      ],
      wn_acc: [
        { say: 'Wen Ning called me at seven. He says he saw nothing.' },
        { say: 'He says it like a man who saw everything.' },
        { say: "He's coming to dinner. I asked him. He dropped the phone." },
        { go: 'lxc' },
      ],
      wn_yes: [
        { say: 'And Wen Ning is coming to dinner. Apparently I asked him.' },
        { say: 'First time at Lotus Pier since 2008.' },
        { say: '…Good.' },
        { go: 'lxc' },
      ],
      wn_tow: [
        { say: 'Wen Ning called the hotel at seven to apologise for towing my car. Four times.' },
        { say: 'He wants to know if he should bring the van on Sunday. To drive the Lans.' },
        { choice: [
            { t: '"Tell him to stay for dinner."', go: 'wn_stay' },
            { t: '"Let him drive."', go: 'wn_drive' },
          ] },
      ],
      wn_stay: [
        { fx: { set: { wn_invited: true }, log: 'Had Jiang Cheng ask Wen Ning to stay for dinner', once: 'hq_wn' } },
        { say: 'Stay. For dinner.' },
        { say: "…He's going to drop the phone when I say it." },
        { go: 'lxc' },
      ],
      wn_drive: [{ say: "He'll sit in the van all night with the engine off. He always does." }, { go: 'lxc' }],

      // Xichen
      lxc: [
        { if: (s) => F(s).tea_yes, go: 'tea_yes' },
        { if: (s) => F(s).tea_declined, go: 'tea_no' },
        { if: (s) => F(s).lxc_invited, go: 'tea_open' },
        { go: 'nhs' },
      ],
      tea_yes: [
        { say: 'And tea.' },
        { say: "Today. Three o'clock. With Xichen." },
        { say: '…With Zewu-jun.' },
        { choice: [
            { t: '"He said you liked the white peony."', go: 'tea2' },
            { t: '"You should go."', go: 'tea2' },
          ] },
      ],
      tea2: [
        { say: "I wasn't going to go." },
        { say: '(A pause.)', from: 'sys' },
        { say: '…I was going to go.' },
        { say: (s) => (F(s).ride_gusu ? "And there's a car booked to Cloud Recesses. On my account. …I'll take it." : null) },
        { if: (s) => F(s).lxc_sunday, go: 'lxc_sun' },
        { go: 'lxc_ask' },
      ],
      lxc_sun: [
        { say: 'And he asked about Sunday. You said yes.' },
        { say: "…He'll bring tea. He always brings tea." },
        { go: 'nhs' },
      ],
      lxc_ask: [
        { say: (s) => (F(s).lxc_sunday_no ? 'He asked about Sunday. You told him it was family.' : "He didn't ask about Sunday. He wouldn't. He'd wait to be asked.") },
        { choice: [
            { t: '"Ask him. At tea."', go: 'lxc_ask_do' },
            { t: '"Let him come after dinner. With the peony."', go: 'lxc_after' },
          ] },
      ],
      lxc_ask_do: [{ if: (s) => aff(s, 'lxc') >= 2, go: 'lxc_ask_yes', else: 'lxc_ask_see' }],
      lxc_ask_yes: [
        { fx: { set: { lxc_sunday: true }, log: 'Told Jiang Cheng to ask Lan Xichen to Sunday', once: 'hq_lxc' } },
        { say: 'At tea.' },
        { say: "He'll say yes. He always says yes. That's the problem." },
        { go: 'nhs' },
      ],
      lxc_ask_see: [
        { say: "…I'll see." },
        { say: "Don't say anything about the last time I said that." },
        { go: 'nhs' },
      ],
      lxc_after: [{ say: 'After dinner.' }, { say: "…There'll be cake. He likes the cake." }, { go: 'nhs' }],
      tea_no: [
        { say: "And you declined Xichen's tea. In my calendar." },
        { choice: [
            { t: '"Go anyway. Three o\'clock."', go: 'tea_go' },
            { t: '"Maybe another day."', go: 'tea_later' },
          ] },
      ],
      tea_open: [
        { say: 'Xichen asked me to tea. Nobody answered him. He sent the moon at one in the morning instead.' },
        { choice: [
            { t: '"Go. Three o\'clock."', go: 'tea_go' },
            { t: '"Maybe another day."', go: 'tea_later' },
          ] },
      ],
      tea_go: [
        { fx: { set: { tea_yes: true }, log: 'Talked him into tea at the Hanshi after all', once: 'hq_tea' } },
        { say: "…Three o'clock." },
        { say: 'I was going to go anyway.' },
        { go: 'nhs' },
      ],
      tea_later: [{ say: '…Another day. Fine.' }, { say: 'He said the tea keeps.' }, { go: 'nhs' }],

      // Nie Huaisang
      nhs: [
        { if: (s) => F(s).nhs_leak, go: 'nhs_leak' },
        { if: (s) => F(s).nhs_ally, go: 'nhs_ally' },
        { if: (s) => F(s).nhs_knows, go: 'nhs_knows' },
        { go: 'ops' },
      ],
      nhs_ally: [
        { say: "Huaisang has asked me four times since six whether he's invited. Apparently you told him yes." },
        { say: '…He stopped posting. First time since 2019.' },
        { go: 'ops' },
      ],
      nhs_leak: [
        { say: "And Huaisang's account posted everything. You traded with him and you lost." },
        { say: "He'll send a fan to apologise. It'll be a very good fan." },
        { go: 'ops' },
      ],
      nhs_knows: [{ say: 'Huaisang knows. Of course he knows.' }, { say: 'He sent me a fan. It says I KNOW NOTHING.' }, { go: 'ops' }],

      // Ops, the gate, the dog
      ops: [
        { if: (s) => F(s).ops_keep, go: 'ops_keep' },
        { if: (s) => num(s, 'ops_morale') >= 3, go: 'ops_morale' },
        { go: 'huang' },
      ],
      ops_keep: [
        { say: 'Twenty kilos of lotus root from the warehouse are going to Lotus Pier for Sunday. On the Ops budget.' },
        { say: 'Tang Mei approved it at 6:04. She wants you to know she has seen the invoice.' },
        { if: (s) => num(s, 'ops_morale') >= 3, go: 'ops_morale' },
        { go: 'huang' },
      ],
      ops_morale: [
        { say: 'And my operations group thinks I have become a different person.' },
        { say: "Old Huang sent me a voice message. He's crying. Happy crying, he says." },
        { go: 'huang' },
      ],
      huang: [
        { say: (s) => (F(s).huang_list ? 'Old Huang has a guest list for the gate. Laminated. He read it to me over the phone. Twice.' : null) },
        { say: (s) => (F(s).fairy_inside || F(s).dog_friday ? 'And the dog is allowed inside on Sunday, apparently. By my order.' : null) },
        { go: 'ajie' },
      ],

      // A-Jie
      ajie: [{ if: (s) => F(s).ajie_wrote, go: 'ajie_yes' }, { go: 'pass' }],
      ajie_yes: [
        { say: '…' },
        { say: 'You wrote to my sister.' },
        { say: "It didn't go through." },
        { say: 'It never does.' },
        { say: 'What did you say to her?' },
        { choice: [
            { t: '"That A-Ling turns eighteen on Sunday."', go: 'ajie_sunday' },
            { t: '"That you still write to her."', go: 'ajie2' },
            { t: '(Say nothing)', go: 'ajie2' },
          ] },
      ],
      ajie_sunday: [
        { say: '…' },
        { say: "I'll set her bowl." },
        { say: 'I always set her bowl.' },
        { go: 'pass' },
      ],
      ajie2: [{ say: '…' }, { say: 'Okay.' }, { go: 'pass' }],

      // asides
      pass: [{ if: (s) => F(s).changed_passcode, go: 'pass_yes' }, { go: 'apps' }],
      pass_yes: [
        { say: 'And you changed my passcode.' },
        { choice: [
            { t: '"Your old one was a birthday card."', go: 'pass2' },
            { t: '"Jin Ling told you to. Twice."', go: 'pass2' },
          ] },
      ],
      pass2: [{ say: '…Tch.' }, { say: 'Fine.' }, { go: 'apps' }],
      apps: [
        { say: remark(0, 0) }, { say: remark(0, 1) }, { say: remark(0, 2) },
        { say: remark(1, 0) }, { say: remark(1, 1) }, { say: remark(1, 2) },
        { go: 'you' },
      ],

      // ── You ──────────────────────────────────────────────────────
      you: [
        { fx: { set: { hq_closing: true } } },
        { say: (s) => {
          const T = trust(s);
          return T >= 5 ? '…You did more with my phone in one night than I did with it all year.'
            : T >= 2 ? "Some of what you did, I'd have done. Eventually. Slower."
              : "Most of what you did, I'm going to spend the weekend undoing.";
        } },
        { say: 'So. What do you want.' },
        { choice: [
            { t: '"Nothing. I just wanted it to go back."', go: 'you_nothing' },
            { t: '"To know how Sunday goes."', go: 'you_sunday' },
            { t: '"The reward. Obviously."', go: 'you_reward' },
            { t: '"Change your passcode."', if: (s) => !F(s).changed_passcode, go: 'you_pass' },
          ] },
      ],
      you_nothing: [
        { fx: { inc: { trust_bonus: 1 } } },
        { say: 'Nobody wants nothing.' },
        { say: '…Fine.' },
        { go: 'decide' },
      ],
      you_sunday: [
        { fx: { inc: { trust_bonus: 1 }, set: { you_asked: true } } },
        { say: 'How Sunday goes.' },
        { say: 'You want to know how Sunday goes.' },
        { go: 'decide' },
      ],
      you_reward: [
        { say: "There is no reward. There's Tang Mei." },
        { say: "She's worse." },
        { go: 'decide' },
      ],
      you_pass: [
        { say: '…I know. Everybody knows. A-Ling tells me twice a week.' },
        { say: "I'll change it to something nobody can guess." },
        { go: 'decide' },
      ],
      decide: [
        { if: (s) => trust(s) >= 5 || (trust(s) >= 4 && F(s).you_asked) || (F(s).jl_knows && trust(s) >= 2), go: 'invite' },
        { go: 'bye' },
      ],
      bye: [
        { say: "Someone will come for the phone at ten. Tang Mei. Don't argue with her. Nobody wins." },
        { say: '…' },
        { say: (s) => (F(s).you_asked ? "Sunday will go the way it goes. You'll never know. That's what happens when you give things back." : "And— you didn't throw it in a river. Fine.") },
        { go: 'end' },
      ],
      invite: [
        { fx: { set: { you_invited: true }, log: 'Was invited to Sunday dinner by Jiang Cheng himself', once: 'hq_invite' } },
        { say: '…' },
        { say: 'Sunday.' },
        { say: 'Six-thirty. Lotus Pier.' },
        { say: (s) => (table(s).seats.wwx.state === 'yes' ? "Wei Wuxian is bringing soup. Apparently there's enough. There's always enough, with her recipe." : "There'll be soup. There's always soup.") },
        { say: "Don't bring anything. Don't be late." },
        { choice: [
            { t: `"I'll be there."`, go: 'invite_yes' },
            { t: '"Are you sure?"', go: 'invite_sure' },
          ] },
      ],
      invite_sure: [{ say: "I don't ask twice." }, { go: 'invite_yes' }],
      invite_yes: [
        { say: 'Good.' },
        { say: 'Tang Mei will still come at ten. I need my phone. I am not an idiot.' },
        { say: '…Six-thirty.' },
        { go: 'end' },
      ],
      end: [
        { fx: { set: { sat_call_done: true } } },
        { start: 'sat_ten' },
        { hangup: true },
      ],
    };
  }

  // If he was hung up on during the call he calls back once ("hq_after1"); a second hang-up (or two unanswered
  // calls) means Zidian. Hanging up during his goodbye just ends the call.
  const firstIgnore = [{ fx: { set: { hq_ignored1: true } } }, { start: 'hq_after1' }];
  S.call({
    id: 'call_hq',
    from: 'hq',
    ring: 25,
    missed: firstIgnore,
    onHangup: firstIgnore,
    nodes: hqNodes([{ say: 'You. Whoever has my phone.' }, { say: "Don't hang up." }], 'hq_ignored1', 'hq_after1'),
  });
  S.call({
    id: 'call_hq_out',
    from: 'hq',
    onHangup: firstIgnore,
    nodes: hqNodes([
      { say: 'Lotus Pier, Yunmeng Jiang Gr—' },
      { say: '(A click. One bar of hold music. The switchboard patches you through to a hotel room in Lanling.)', from: 'sys' },
      { say: 'You. Whoever has my phone.' },
      { say: "Don't hang up." },
    ], 'hq_ignored1', 'hq_after1'),
  });
  S.dialScript('hq', 'call_hq_out', (s) => !!F(s).lost_mode && !F(s).hq_talked && !gone(s));

  const secondIgnore = [{ fx: { set: { hq_ignored2: true } } }, { start: 'hq_after2' }];
  const hq2 = hqNodes([
    { if: (s) => !!F(s).hq_truth, go: 'resume' },
    { say: 'You hung up on me.' },
    { say: 'Nobody hangs up on me. Not twice.' },
    { say: 'Last chance.' },
  ], 'hq_ignored2', 'hq_after2');
  hq2.resume = [
    { say: 'You hung up on me. In the middle of Sunday.' },
    { say: "Don't do that again. I'm told I'm a lot. I'm aware." },
    { go: 'sun' },
  ];
  S.call({ id: 'call_hq2', from: 'hq', ring: 25, missed: secondIgnore, onHangup: secondIgnore, nodes: hq2 });

  S.scene({
    id: 'hq_after1',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => F(s).hq_closing || F(s).sat_call_done || gone(s), go: 'fin' },
        { fx: { inc: { trust_bonus: -1 } } },
        { wait: 15 },
        { call: 'call_hq2' },
      ],
      fin: [{ fx: { set: { sat_call_done: true } } }, { start: 'sat_ten' }],
    },
  });
  S.scene({
    id: 'hq_after2',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => F(s).hq_closing || F(s).sat_call_done || gone(s), go: 'fin' },
        { wait: 3 },
        { fx: { set: { zidian: true }, log: 'Hung up on Jiang Cheng. Twice.', once: 'hq_zidian' } },
        { start: 'zidian_fall' },
      ],
      fin: [{ fx: { set: { sat_call_done: true } } }, { start: 'sat_ten' }],
    },
  });

  // ── Saturday, ten o'clock: someone comes for the phone. Then Sunday. ─
  // table.js routes unknown consequence ids to 'saturday': during the night they change nothing.
  S.scene({
    id: 'saturday',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => !!(F(s).sat_call_done && !s.done.sat_ten && !gone(s)), go: 'go' },
        { run: () => console.info('[sunday] an old { ending } outside the finale was ignored (it is a flag now).') },
      ],
      go: [{ start: 'sat_ten' }],
    },
  });
  S.scene({
    id: 'sat_ten',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => !!(s.done.early_return || (s.done.zidian_fall && F(s).zidian)), go: 'off' },
        { wait: 4 },
        { if: (s) => F(s).wn_accomplice || F(s).wn_pickup, go: 'wn' },
        { m: 'Mr. Jiang has finished his call. He says it was "fine".' },
        { if: (s) => F(s).you_invited, go: 'inv' },
        { m: 'I will be at your door at ten. Please have the phone charged. He will check.' },
        { go: 'ten' },
      ],
      inv: [
        { m: 'He has also asked me to add a place to Sunday for "the person with my phone".' },
        { m: 'I have worked for him for nine years. He has never once asked me to add a place.' },
        { m: 'I will be at your door at ten.' },
        { time: '10:00', card: 'At ten exactly a woman in a grey coat rings your doorbell, holds out her hand for the purple case, and looks at you for one long, assessing second. “Tang Mei,” she says. “Thank you. He won’t say it, so I’m saying it now.” At the bottom of the stairs she turns. “Six-thirty. He’ll pretend he forgot he asked. He didn’t.”' },
        DINNER,
      ],
      wn: [
        { m: 'Mr. Jiang has finished his call. Wen Ning will collect the phone at half past eight, as he arranged. He insisted. He will hand it to me at ten. I am told he has already apologised to the van.' },
        { if: (s) => F(s).you_invited, go: 'wn_inv' },
        { go: 'wn_go' },
      ],
      wn_inv: [
        { m: 'Mr. Jiang has also asked me to add a place to Sunday for "the person with my phone". In nine years he has never asked me to add a place.' },
        { go: 'wn_go' },
      ],
      wn_go: [
        { time: '08:30', card: 'At half past eight an old van with “Yiling Radish Co.” on the side pulls up outside. Wen Ning holds out both hands for the phone as if it might break, says sorry three times and, once, very quietly, thank you. “You were kind to them all night,” he says. “I’ll tell him that. It’s true.”' },
        DINNER,
      ],
      ten: [
        { time: '10:00', card: 'At ten exactly a woman in a grey coat rings your doorbell, holds out her hand for the purple case, and looks at you for one long, assessing second. “Tang Mei,” she says. “Thank you. He won’t say it, so I’m saying it now, and he can owe me.”' },
        DINNER,
      ],
      off: [{ end: true }],
    },
  });

  // ═════════════════════════════════════════════════════════════════
  // CONSEQUENCES (docs/SUNDAY.md "Consequences"): the phone goes back tonight, or he comes for it.
  // ═════════════════════════════════════════════════════════════════
  // Who you told, from the confession scenes (confess.js / calls.js); the person who takes the phone.
  const confidant = (s) => {
    const to = F(s).told_to;
    if (to === 'jl' || to === 'lxc' || to === 'huang') return to;
    if (to === 'wwx' || to === 'lwj') return 'wwx';
    if (to) return 'ea'; // Tang Mei, HQ, a group chat: Tang Mei sends the car
    const d = s.done || {};
    if (d.confess_jl) return 'jl';
    if (d.confess_wwx || d.wwx_honest_end || d.confess_lwj) return 'wwx';
    if (d.confess_lxc) return 'lxc';
    return 'ea';
  };
  const JL_NOTE = [
    'jiujiu read this',
    '',
    'the person who had ur phone is ok. fairy says so. fairy is never wrong (except about the bath in 2019)',
    '',
    'they helped with the car thing. they didnt tell anyone. they gave it back themselves',
    '',
    'i want them at my birthday. its my birthday. i get to want things',
    '',
    '— A-Ling',
  ].join('\n');
  const how = (s) => (F(s).phone_at_desk ? 'desk' : F(s).returned_how || 'confess');
  S.scene({
    id: 'early_return',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { fx: { set: { night_done: true, returned_early: true, told_truth: true } } },
        { if: (s) => how(s) === 'fairy', go: 'fairy' },
        { if: (s) => how(s) === 'desk', go: 'desk' },
        { if: (s) => how(s) === 'swift', go: 'swift' },
        { if: (s) => confidant(s) === 'jl', go: 'c_jl' },
        { if: (s) => confidant(s) === 'wwx', go: 'c_wwx' },
        { if: (s) => confidant(s) === 'lxc', go: 'c_lxc' },
        { if: (s) => confidant(s) === 'huang', go: 'c_huang' },
        // a selfie come-clean in a group chat (told_to: 'fam', 'bday', …) or with nobody named
        { if: (s) => how(s) === 'selfie' && (!F(s).told_to || F(s).told_to === 'fam'), go: 'selfie' },
        { go: 'c_ea' },
      ],
      // Jin Ling took it: he keeps your secret till morning and wants you at his birthday
      fairy: [
        { wait: 2 },
        { run: (api) => {
          try {
            const now = api.time.now();
            api.store.add('notes', { id: 'n_jl_stranger', folder: 'notes', title: 'jiujiu read this', body: JL_NOTE, t: now, created: now, pinned: true, locked: false }, { front: true });
            api.notify.push({ app: 'notes', title: 'Notes', body: 'jiujiu read this', open: { app: 'notes', intent: { id: 'n_jl_stranger' } } });
          } catch (e) { /* notes not ready */ }
        } },
        { wait: 3 },
        { if: (s) => F(s).fairy_where === 'gate', go: 'fairy_gate' },
        { time: '+20m', card: 'He takes the phone. Fairy takes your sofa. Jin Ling stands in your doorway in a wet tuxedo, scowling at the two of you, and says, “I’m not telling him who you are till morning. He’d drive here.” Then, at the door: “Sunday. Six-thirty. I’m inviting you. It’s my birthday, so it counts.”' },
        DINNER,
      ],
      fairy_gate: [
        { time: '+20m', card: 'He takes the phone. Fairy takes you: she leans her whole wet weight against your legs under the east gate’s lamp and refuses to move. “Traitor,” Jin Ling tells her. Then, to you, scowling: “I’m not telling him who you are till morning. He’d drive here. Sunday. Six-thirty. I’m inviting you. It’s my birthday, so it counts.”' },
        DINNER,
      ],
      c_huang: [
        { wait: 2 },
        { m: '', d: 3, voice: { dur: 12, text: 'Okay. Okay. Not Boss. I understand. I call Tang Mei. She is awake, she is always awake. You stay. Somebody come. Thank you, ah. 👍' }, th: 'huang', from: 'huang' },
        { m: '👍👍', th: 'huang', from: 'huang' },
        { time: '+25m', card: 'Huang Er’s tow truck pulls up outside Jinxing Road 27, lights flashing for no reason, sent by a cousin in Yunmeng who does not trust taxis. He takes the phone in both hands, gives you a thumbs-up exactly like Old Huang’s, and drives it to the Golden Peony at forty kilometres an hour.' },
        DINNER,
      ],
      desk: [
        { time: '+40m', card: 'Upstairs, in Room 1808, a man in a hotel bathrobe opens an envelope from the front desk and finds his phone in it. He reads every message from the night before, twice, standing up. Then he sits down on the edge of the bed for a long time and doesn’t call anyone.' },
        DINNER,
      ],
      swift: [
        { wait: 3 },
        { m: '[Swift Ride] Master Wu Lihua has accepted your found-item return. She is turning the car around. ETA 12 min.', th: 'swift', from: 'swift' },
        { wait: 3 },
        { time: '+12m', card: 'A grey electric sedan pulls up outside Jinxing Road 27. Master Wu holds out her hand for the purple phone, looks at you over her glasses, and says, “You could have kept it.” Then: “Good.” She drives it to the Golden Peony herself and makes the night manager sign for it.' },
        DINNER,
      ],
      selfie: [
        { wait: 2 },
        { m: 'ok nice stranger with the honest face', th: 'fam', from: 'wwx' },
        { m: 'lan zhan is calling the golden peony', th: 'fam', from: 'wwx' },
        { m: 'u have a very trustworthy face. its annoying', th: 'fam', from: 'jl' },
        { m: 'Stay where you are. Someone will come.', th: 'fam', from: 'lwj' },
        { time: '+30m', card: 'The someone is Tang Mei, in a grey coat at one in the morning, who looks at your face for one long second as if to check it against the photo. “Thank you,” she says. “He won’t say it, so I’m saying it now, and he can owe me.”' },
        DINNER,
      ],
      c_jl: [
        { wait: 2 },
        { m: 'ok', th: 'jl', from: 'jl' },
        { m: 'ok im sending someone', th: 'jl', from: 'jl' },
        { m: 'dont give it to anyone except a guy called huang er. he has a tow truck. hes old huangs cousin. hes the only person awake in lanling', th: 'jl', from: 'jl' },
        { time: '+25m', card: 'A tow truck pulls up outside Jinxing Road 27 with its lights flashing for no reason. Huang Er takes the phone in both hands, gives you a thumbs-up exactly like his cousin’s, and drives it to the Golden Peony at forty kilometres an hour.' },
        DINNER,
      ],
      c_wwx: [
        { wait: 2 },
        { if: (s) => F(s).returned_how === 'facetime' || F(s).wwx_saw_face, go: 'c_wwx_face' },
        { m: 'ok. ok ok ok', th: 'wwx', from: 'wwx' },
        { m: "lan zhan is getting the car keys. we're in lanling still. 15 min", th: 'wwx', from: 'wwx' },
        { m: "don't let him yell at u. he yells at everyone he likes", th: 'wwx', from: 'wwx' },
        { time: '+15m', card: 'Wei Wuxian takes the phone out of your hands as if it might be hot, and then hugs you, briefly and without asking. Lan Wangji, behind him, says “Thank you,” and means it. They drive it to the Golden Peony together and wake up the night manager.' },
        DINNER,
      ],
      c_wwx_face: [
        { m: 'ok. stranger with the face', th: 'wwx', from: 'wwx' },
        { m: "lan zhan is getting the car keys. we're still in lanling. 15 min. don't move", th: 'wwx', from: 'wwx' },
        { time: '+15m', card: 'Wei Wuxian recognises you before the car has stopped. He takes the phone out of your hands as if it might be hot, then hugs you, briefly and without asking. “You have a very honest face,” he says. “It’s really annoying.” Lan Wangji, behind him, says “Thank you,” and means it.' },
        DINNER,
      ],
      c_lxc: [
        { wait: 2 },
        { m: 'Thank you for telling me. I know that cannot have been easy.', th: 'lxc', from: 'lxc' },
        { m: "I've telephoned the Golden Peony. A car will come for it. Please don't worry about anything else.", th: 'lxc', from: 'lxc' },
        { time: '+25m', card: 'The driver brings a note in careful brushwork: “Thank you for keeping him company tonight. — L.X.” You hand over the purple phone. You keep the note.' },
        DINNER,
      ],
      c_ea: [
        { wait: 2 },
        { m: "This is Tang Mei, Mr. Jiang's assistant. I've been told you have his phone, and that you said so." },
        { m: 'Thank you. A car will be outside Jinxing Road 27 in twenty minutes. Please give the phone to the driver. Do not answer anything else.' },
        { m: 'He is awake. He is calm.' },
        { m: '(He is not calm.)' },
        { time: '+20m', card: 'The car is black and very clean. The driver holds out a gloved hand for the purple phone and says “Thank you” in a voice that suggests Tang Mei told him to. You stand on the step in the drizzle until the tail lights are gone. The phone is somebody else’s again.' },
        DINNER,
      ],
    },
  });

  // Zidian: total suspicion ≥ 25 (family.js caught_total → { ending: 'zidian' } → JC.sunday.consequence), or the
  // second hang-up on the morning call. The family compares notes; he finds you; you are not invited.
  S.scene({
    id: 'zidian_fall',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        // too late to matter: the phone already went back, or he already decided about you on the call
        { if: (s) => !!(F(s).returned_early || F(s).hq_closing || F(s).sat_call_done), go: 'moot' },
        { fx: { set: { zidian: true, night_done: true } } },
        { wait: 4 },
        { if: (s) => !!F(s).hq_ignored2, go: 'morning' },
        { m: "This is Tang Mei, Mr. Jiang's assistant. He is awake." },
        { m: 'He has your location. He has a taxi. He has his shoes on, which took a while.' },
        { m: 'I would put the kettle on.' },
        { go: 'knock' },
      ],
      morning: [
        { m: 'He has your address. He has Find My. He has a taxi waiting.' },
        { m: 'I would put the kettle on.' },
        { go: 'knock' },
      ],
      knock: [
        { wait: 4 },
        { time: '+25m', card: 'There is a knock on your door. It is not a loud knock. That is the frightening part. He is shorter than you expected and much angrier, and he holds out one hand without a word. You put the phone in it. He looks at the screen. He looks at you. He turns the ring on his finger once. “Get lost,” he says, which you later learn is the closest thing to forgiveness he keeps in stock.' },
        DINNER,
      ],
      moot: [{ fx: { set: { zidian: false } } }],
    },
  });

  // ── Reporting the phone in Swift Ride → it goes back tonight ─────
  S.scene({
    id: 'swift_report',
    thread: 'swift',
    trigger: { on: 'act', act: 'ride_report_lost' },
    when: (s) => !gone(s) && !F(s).sat_call_done,
    nodes: {
      start: [
        { wait: 3 },
        { m: '[Swift Ride] Thank you. Found-item report #SR-1016-2347 has been sent to the driver, Master Wu Lihua, and to the account holder.' },
        { wait: 6 },
        { m: '[Swift Ride] The account holder has been contacted at his registered email. Please keep the item safe. Thank you for being a Swift Ride Good Samaritan!' },
        { wait: 3 },
        { fx: { set: { told_truth: true, returned_early: true, returned_how: 'swift' }, log: 'Reported the phone as found in Swift Ride', once: 'swift_report' } },
        { start: 'early_return' },
      ],
    },
  });

  // ── The passcode is no longer a birthday card ────────────────────
  S.scene({
    id: 'passcode_changed',
    thread: 'jl',
    trigger: { on: 'act', act: 'setting', match: (p) => !!p && p.key === 'passcode' },
    nodes: { start: [{ fx: { set: { changed_passcode: true } } }] },
  });
})();
