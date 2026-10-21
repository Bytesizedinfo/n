/* Message history — group "YMJ Ops 🔔" (Old Huang, Liu Qian, A-Bai, Tang Mei). Facts: docs/STORY.md */
(function () {
  'use strict';
  const { story } = window.JC;

  story.thread({
    id: 'ops',
    members: ['huang', 'liu', 'bai', 'ea'],
    name: 'YMJ Ops 🔔',
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2026-08-03 08:30', 'liu', "Liu Qian (Ops) named the conversation “YMJ Ops 🔔”.", { sys: true }],
      ['2026-08-03 08:30', 'liu', "Good morning all! New ops group for urgent items only ✅"],
      ['2026-08-03 08:31', 'liu', "• Shipping delays • Warehouse issues • Anything the CEO must know tonight, not Monday"],
      ['2026-08-03 08:33', 'huang', "", { voice: { dur: 4, text: "Received. Good morning everybody." } }],
      ['2026-08-03 08:33', 'huang', "👍"],
      ['2026-08-03 08:35', 'bai', "hi everyone!! 🙇"],
      ['2026-08-03 08:40', 'ea', "Urgent items only. Noted."],
      ['2026-08-03 09:02', 'me', "Urgent means urgent."],
      ['2026-08-03 09:02', 'liu', "Understood ✅"],

      ['2026-08-05 12:10', 'bai', "is the canteen open on saturday?"],
      ['2026-08-05 12:11', 'ea', "Not urgent."],
      ['2026-08-05 12:11', 'bai', "sorry 🙇"],

      ['2026-08-12 17:45', 'huang', "", { voice: { dur: 16, text: "Boss. Typhoon warning for Thursday. I tie the boats, I move the trucks to high ground. Like always." } }],
      ['2026-08-12 17:46', 'huang', "👍"],
      ['2026-08-12 17:50', 'liu', "• Thursday shipments moved to Wednesday • Qinghe route on hold • Office staff work from home Thursday"],
      ['2026-08-12 18:05', 'me', "Good."],
      ['2026-08-14 07:20', 'huang', "", { voice: { dur: 11, text: "Boss. Typhoon pass. One tree fall down. On my car. Ha ha ha." } }],
      ['2026-08-14 07:24', 'me', "Is anyone hurt."],
      ['2026-08-14 07:25', 'huang', "Only car. 👍"],
      ['2026-08-14 07:26', 'me', "Expense it."],
      ['2026-08-14 07:26', 'huang', "👍👍👍"],

      ['2026-08-20 14:02', 'bai', "the forklift in warehouse b is making a noise"],
      ['2026-08-20 14:03', 'ea', "Not urgent."],
      ['2026-08-20 14:03', 'bai', "its on fire a little"],
      ['2026-08-20 14:03', 'ea', "Urgent."],
      ['2026-08-20 14:04', 'me', "Get everyone out of B. Now."],
      ['2026-08-20 14:09', 'huang', "", { voice: { dur: 9, text: "Fire out. Small fire. Forklift dead. Everybody fine." } }],
      ['2026-08-20 14:09', 'huang', "👍"],
      ['2026-08-20 14:15', 'liu', "• Forklift: deceased • Insurance claim: filed • New forklift: ordered"],
      ['2026-08-20 14:20', 'me', "Good. A-Bai, you did the right thing."],
      ['2026-08-20 14:20', 'bai', "🙇🙇🙇"],

      ['2026-08-28 10:00', 'liu', "Lotus seed export numbers are in: +14% vs last year 🎉"],
      ['2026-08-28 10:01', 'huang', "👍👍"],
      ['2026-08-28 10:30', 'me', "Good."],

      ['2026-09-07 16:00', 'liu', "", { img: 'p_ops_meeting' }],
      ['2026-09-07 16:00', 'liu', "Q4 planning session summary ✅"],
      ['2026-09-07 16:04', 'ea', "Who drew the dog."],
      ['2026-09-07 16:04', 'liu', "No comment."],
      ['2026-09-07 16:05', 'bai', "it was me 🙇"],
      ['2026-09-07 16:20', 'me', "Erase the dog."],
      ['2026-09-07 16:21', 'liu', "Respectfully, Mr. Jiang, the dog stays until the board meeting. Morale."],

      ['2026-09-15 18:10', 'huang', "", { voice: { dur: 13, text: "Boss. Young master and Fairy visit today. Fairy jump in the lotus pond. Again." } }],
      ['2026-09-15 18:11', 'me', "Is the pond all right."],
      ['2026-09-15 18:11', 'huang', "Pond fine. Fairy happy. Young master wet. 👍", { react: [{ by: 'me', t: 'haha' }] }],

      ['2026-09-24 11:30', 'ea', "Mid-Autumn mooncakes for all staff: delivered. The CEO paid. Don't make it a thing."],
      ['2026-09-24 11:31', 'bai', "thank u boss!!! 🥮🙇"],
      ['2026-09-24 11:31', 'huang', "👍👍👍"],
      ['2026-09-24 11:33', 'liu', "Thank you, Mr. Jiang! 🥮"],
      ['2026-09-24 11:40', 'me', "She said don't make it a thing."],

      ['-9 11:00', 'liu', "FYI team: the Bring Your Dog to Work Friday proposal (with poster!) is with the CEO ✅"],
      ['-9 11:01', 'liu', "• 41 staff dog owners • 87% in favor • East courtyard only"],
      ['-9 11:05', 'huang', "", { voice: { dur: 10, text: "I support. I will supervise. Dogs listen to me. Boss also listened to me, when he was small." } }],
      ['-9 11:06', 'bai', "i don't have a dog but i would pet all of them 🙇"],
      ['-9 11:08', 'ea', "I'm not getting involved."],

      ['-6 10:15', 'liu', "Canteen soup week starts Monday 19th! We need 40 kg of lotus root ✅"],
      ['-6 10:15', 'liu', "@A-Bai can you place the order? Delivery Friday please"],
      ['-6 10:20', 'bai', "on it!!! 🙇"],
      ['-5 13:05', 'bai', "order placed!! 👍 delivery friday"],
      ['-5 13:06', 'huang', "👍"],
      ['-5 13:20', 'ea', "Noted."],

      ['-3 09:00', 'liu', "• Q4 deck: final • Board: Monday 9:00 • No edits after Sunday noon, please"],
      ['-3 09:12', 'me', "Slide 7 is wrong."],
      ['-3 09:12', 'ea', "Slide 7 is fine."],
      ['-3 09:13', 'liu', "Slide 7 is fine, Mr. Jiang."],
      ['-3 09:13', 'huang', "👍"],
      ['-3 09:14', 'bai', "what's on slide 7 🙇"],
      ['-3 09:14', 'ea', "Not urgent."],

      ['-2 13:55', 'bai', "BOSS THE MILK TEA 🙇🙇🙇"],
      ['-2 13:55', 'bai', "the whole warehouse says thank u"],
      ['-2 13:56', 'huang', "👍👍👍👍"],
      ['-2 13:58', 'ea', "He said don't make it a thing."],
      ['-2 13:58', 'bai', "ok!!! not a thing!!! 🙇"],

      ['-1 07:30', 'huang', "", { voice: { dur: 12, text: "Everybody. Lotus root for soup week come Friday night, late. I wait at the east gate. No problem." } }],
      ['-1 07:31', 'huang', "👍"],
      ['-1 07:40', 'liu', "Thank you, Old Huang! ✅"],

      ['+0 08:30', 'liu', "Happy Friday team! Gala tonight for the CEO 🎉"],
      ['+0 08:30', 'liu', "Friendly reminder: Dog Friday decision is due tonight 🐕"],
      ['+0 08:41', 'ea', "Leave him alone."],
      ['+0 08:42', 'liu', "Respectfully, he said Friday night."],
      ['+0 08:42', 'bai', "🙇"],
      ['+0 08:43', 'huang', "👍"],

      ['+0 16:40', 'huang', "", { voice: { dur: 9, text: "Boss. Canteen auntie ask: lotus root soup Monday, yes? I say yes." } }],
      ['+0 16:40', 'huang', "👍"],
      ['+0 17:02', 'me', "Yes."],

      ['+0 23:45', 'huang', "Boss. Lotus root delivery arrived. 400 KG. We ordered 40. 👍", { u: 1 }],
    ],
  });
})();
