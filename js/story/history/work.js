/* Message history — Tang Mei (EA), Old Huang, Liu Qian (Ops), A-Bai (Logistics), Lan Qiren. Facts: docs/STORY.md */
(function () {
  'use strict';
  const { story } = window.JC;

  // ── Tang Mei, executive assistant since 2017 ─────────────────────
  story.thread({
    id: 'ea',
    members: ['ea'],
    name: null,
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2017-09-04 09:07', 'ea', "Good morning, Mr. Jiang. Tang Mei, your new executive assistant. Your 9:00 is here. You are not."],
      ['2017-09-04 09:09', 'me', "Traffic."],
      ['2017-09-04 09:09', 'ea', "You live on the premises."],
      ['2017-09-04 09:12', 'me', "Coming."],

      ['2019-11-11 15:30', 'ea', "Facilities says you threatened the printer again."],
      ['2019-11-11 15:41', 'me', "It jammed four times."],
      ['2019-11-11 15:41', 'ea', "Noted. The printer stays. You may glare at it."],

      ['2023-03-06 11:20', 'ea', "Mr. Wei called the front desk. Twice. He asked if you are \"still mad\". I said you are always mad. He said \"fair\"."],
      ['2023-03-06 11:35', 'me', "Don't put him through."],
      ['2023-03-06 11:35', 'ea', "Noted."],

      ['2024-06-23 08:00', 'ea', "I've cleared your week. Don't argue."],
      ['2024-06-23 08:05', 'me', "I have the shipping review."],
      ['2024-06-23 08:06', 'ea', "Liu Qian has the shipping review. Go home."],

      ['2025-10-27 17:40', 'ea', "2 November is cleared. As every year."],
      ['2025-10-27 18:02', 'me', "Noted."],

      ['2026-08-31 10:15', 'ea', "Lanling International updated its records. Jin Ling has listed you as \"Emergency contact (only for REAL emergencies)\". I approved the wording."],

      ['2026-09-25 08:40', 'me', "Cloud Recesses Tea Shop. One tin of white peony, the good one. Delivered to the Hanshi today. No card."],
      ['2026-09-25 08:41', 'ea', "Noted."],
      ['2026-09-25 10:02', 'ea', "Confirmed. Delivered to the Hanshi by 15:00. No card, as instructed."],
      ['2026-09-25 10:03', 'ea', "I'm not asking."],
      ['2026-09-25 10:10', 'me', "Good."],

      ['-9 09:20', 'ea', "Liu Qian's proposal is in your inbox. There is a poster. I've seen it. It has a dog doodle."],
      ['-9 09:31', 'me', "Why are you warning me."],
      ['-9 09:31', 'ea', "So you can't say you weren't warned."],

      ['-4 08:15', 'ea', "Board — Q4, Monday 19th, 9:00. The deck is final. If you rewrite slide 7 at 2 AM again, I'm telling Old Huang."],
      ['-4 08:15', 'ea', "", { link: { title: 'Board — Q4 (FINAL).deck', site: 'YMJ Drive', url: 'https://drive.lotuspier.yunmeng/board/q4-final' } }],
      ['-4 08:30', 'me', "Slide 7 is wrong."],
      ['-4 08:30', 'ea', "Slide 7 is fine. Go back to sleep."],
      ['-4 08:31', 'me', "I've been up since five."],
      ['-4 08:31', 'ea', "I know. That's the problem."],

      ['-2 10:00', 'ea', "Lanling International: parent-teacher conference Thursday 16:00. You're listed as guardian. I've moved your 16:00."],
      ['-2 10:12', 'me', "Fine."],

      ['-1 09:10', 'ea', "Golden Peony, Room 1808, under your name from tonight. Gala tomorrow 19:00, Koi Tower."],
      ['-1 09:11', 'ea', "You are not driving back after the gala. You've slept four hours a night all week. I mean it."],
      ['-1 09:30', 'me', "I'm not an idiot."],
      ['-1 09:30', 'ea', "Noted."],
      ['-1 17:55', 'me', "His teacher wants a follow-up meeting about a chemistry incident."],
      ['-1 17:56', 'ea', "Noted. I'll find you a lawyer."],
      ['-1 17:58', 'me', "It's not that bad."],
      ['-1 17:58', 'ea', "Then I'll find you a chemist."],

      ['+0 18:40', 'ea', "Gala in twenty minutes. Smile at the Jin board once. Once is enough."],
      ['+0 18:41', 'me', "No."],
      ['+0 18:41', 'ea', "Noted."],
      ['+0 21:05', 'ea', "Going offline. Board Monday 9:00. Don't email me before Monday 7:00."],
      ['+0 21:20', 'me', "No promises."],
      ['+0 21:20', 'ea', "Noted. Good night, Mr. Jiang."],
    ],
  });

  // ── Old Huang, head of Lotus Pier security ───────────────────────
  story.thread({
    id: 'huang',
    members: ['huang'],
    name: null,
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2019-09-11 18:00', 'huang', "", { voice: { dur: 9, text: "Boss. Typhoon coming Thursday. I tie down the boats. Don't worry." } }],
      ['2019-09-11 18:01', 'huang', "👍"],
      ['2019-09-11 18:30', 'me', "Move the trucks to high ground."],
      ['2019-09-11 18:30', 'huang', "Boss. Received. 👍👍"],

      ['2024-06-29 17:10', 'huang', "", { voice: { dur: 34, text: "Boss. Mr. Wei come to the gate today. He stand there twenty minutes. Look at the lake. I did not let him in, you said nobody. But I give him tea. And one tea egg. He said tell you nothing. So I tell you nothing." } }],
      ['2024-06-29 17:11', 'huang', "👍"],
      ['2024-06-29 22:48', 'me', "Next time, let him in."],
      ['2024-06-29 22:49', 'huang', "👍👍👍"],

      ['2025-03-03 08:00', 'huang', "", { voice: { dur: 28, text: "Boss. Today thirty years I work at Lotus Pier. Your father hire me. You were this tall. You fall in the lake, I pull you out. Wei Wuxian pull you back in. Ha ha ha." } }],
      ['2025-03-03 08:12', 'me', "Thirty years. Take the day off."],
      ['2025-03-03 08:12', 'huang', "No. 👍"],

      ['2025-07-19 10:20', 'huang', "", { voice: { dur: 12, text: "Boss. Fairy in the lotus pond again. I try with the net. She bite the net. Young master is laughing." } }],
      ['2025-07-19 10:21', 'huang', "👍"],

      ['2026-05-30 19:05', 'huang', "Boss. Come to the dock. Big Fish. 👍👍"],
      ['2026-05-30 19:06', 'me', "Why."],
      ['2026-05-30 19:06', 'huang', "Just Come. 👍"],

      ['-5 19:30', 'huang', "", { voice: { dur: 21, text: "Boss. You drive to Lanling this week? Careful. My cousin in Lanling, he has tow truck. Anything happen, you call me, I call him." } }],
      ['-5 19:31', 'huang', "👍"],
      ['-5 19:50', 'me', "Nothing will happen."],
      ['-5 19:50', 'huang', "👍"],

      ['-1 07:15', 'huang', "Boss. Drive careful. Rain in Lanling. 👍"],
      ['-1 07:40', 'me', "I'm always careful."],
      ['-1 07:40', 'huang', "Ha ha. 👍👍"],

      ['+0 18:30', 'huang', "", { voice: { dur: 8, text: "Boss. Tang Mei send me photo of you in the suit. Very handsome. Like your father." } }],
      ['+0 18:31', 'huang', "👍"],
      ['+0 18:45', 'me', "Why does Tang Mei have a photo."],
      ['+0 18:45', 'huang', "👍"],
    ],
  });

  // ── Liu Qian, operations: bullet points, brave ───────────────────
  story.thread({
    id: 'liu',
    members: ['liu'],
    name: null,
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2026-04-17 16:40', 'liu', "Quick idea for staff morale, Mr. Jiang: Bring Your Dog to Work Friday? 🐕"],
      ['2026-04-17 17:05', 'me', "We'll see."],
      ['2026-04-17 17:05', 'liu', "I'll take that as a maybe! I'll prepare a proposal. 📊"],

      ['2026-07-03 09:00', 'liu', "Good morning, Mr. Jiang! Q2 summary:"],
      ['2026-07-03 09:00', 'liu', "• On-time delivery: 98.2%"],
      ['2026-07-03 09:00', 'liu', "• Lotus seed exports: +14% year on year"],
      ['2026-07-03 09:01', 'liu', "• Warehouse B roof: fixed (thanks to Mianmian Studio)"],
      ['2026-07-03 09:20', 'me', "Good."],

      ['-9 08:30', 'liu', "Good morning, Mr. Jiang! As promised in April, the full proposal: Bring Your Dog to Work Friday 🐕"],
      ['-9 08:30', 'liu', "", { img: 'p_dogfriday_poster' }],
      ['-9 08:31', 'liu', "• 41 staff dog owners"],
      ['-9 08:31', 'liu', "• Pilot: four Fridays, east courtyard only"],
      ['-9 08:31', 'liu', "• Old Huang has volunteered to supervise"],
      ['-9 08:32', 'liu', "• Fairy invited as honorary mascot"],
      ['-9 10:02', 'me', "No."],
      ['-9 10:03', 'liu', "Noted! I'll follow up with data. 📊"],

      ['-6 09:15', 'liu', "Follow-up as promised 📊"],
      ['-6 09:15', 'liu', "• Staff survey: 87% in favor"],
      ['-6 09:15', 'liu', "• Staff with allergies: 0 (checked)"],
      ['-6 09:16', 'liu', "• Tang Mei: abstained"],
      ['-6 10:40', 'me', "Tang Mei abstained?"],
      ['-6 10:41', 'liu', "She said, quote, \"I'm not getting involved.\""],

      ['-2 16:30', 'liu', "Gentle reminder re: Dog Friday ✅"],
      ['-2 16:30', 'liu', "• Decision needed this week"],
      ['-2 16:31', 'liu', "• Staff are asking daily"],
      ['-2 16:31', 'liu', "• A-Bai has started a sign-up sheet (unauthorized)"],
      ['-2 17:05', 'me', "I'll decide Friday night."],
      ['-2 17:05', 'liu', "Thank you, Mr. Jiang! I'll hold you to that. 🙂"],

      ['+0 18:05', 'liu', "Have a wonderful gala, Mr. Jiang! Friendly reminder: Friday night is tonight 🐕"],
    ],
  });

  // ── A-Bai, junior logistics coordinator ─────────────────────────
  story.thread({
    id: 'bai',
    members: ['bai'],
    name: null,
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2026-05-12 14:05', 'bai', "boss im so sorry 🙇"],
      ['2026-05-12 14:05', 'bai', "the qinghe shipment went to qingyang"],
      ['2026-05-12 14:20', 'me', "Fix it."],
      ['2026-05-12 14:20', 'bai', "fixing!!! 🙇🙇"],

      ['2026-08-07 16:30', 'bai', "boss is it ok if i leave at 5 today, my cat is sick 🙇"],
      ['2026-08-07 16:41', 'me', "Go."],
      ['2026-08-07 16:41', 'bai', "thank u boss!!! 🙇"],

      ['-5 13:10', 'bai', "boss the canteen lotus root order is placed!! delivery friday 👍"],
      ['-5 13:40', 'me', "Why are you telling me."],
      ['-5 13:40', 'bai', "liu qian said report everything 🙇"],
      ['-5 13:41', 'me', "Not to me."],
      ['-5 13:41', 'bai', "sorry boss 🙇🙇"],
    ],
  });

  // ── Lan Qiren: formal letters by SMS ─────────────────────────────
  story.thread({
    id: 'qr',
    members: ['qr'],
    name: null,
    pinned: false,
    muted: false,
    service: 'sms',
    fails: false,
    history: [
      ['2023-03-06 08:00', 'qr', "Jiang Cheng. I have been informed that Wei Wuxian has returned and is residing at the Jingshi. I trust Yunmeng will conduct itself with restraint. — Lan Qiren"],
      ['2023-03-06 09:30', 'me', "Received."],
      ['2025-04-28 08:00', 'qr', "Jiang Cheng. Regarding the ceremony on 20 May: you are seated at table two. Kindly remain until the tea ceremony has concluded. — Lan Qiren"],
      ['2025-04-28 08:40', 'me', "Received."],
      ['2025-06-02 08:00', 'qr', "Jiang Cheng. The Academy board thanks Yunmeng Jiang Group for funding the repairs after last summer's floods. The Wall has also been cleaned. — Lan Qiren"],
      ['2025-06-02 08:15', 'me', "Received."],
      ['2026-09-28 08:00', 'qr', "Jiang Cheng. Xichen has resumed his duties. I am told that you wrote to him during his absence. The family is grateful. This message requires no reply. — Lan Qiren"],
      ['-3 08:00', 'qr', "Jiang Cheng. The board's letter regarding Q4 sponsorship has been sent to your email. Kindly reply by email, not by text message. — Lan Qiren"],
      ['-3 08:20', 'me', "Received."],
    ],
  });
})();
