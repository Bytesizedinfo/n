/* Message history — Nie Huaisang. Gossip, favors, "I don't know!". Facts: docs/STORY.md */
(function () {
  'use strict';
  const { story } = window.JC;

  story.thread({
    id: 'nhs',
    members: ['nhs'],
    name: null,
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2023-03-04 20:15', 'nhs', "Brother Jiang!!! Did you hear?!?! 😭😭"],
      ['2023-03-04 20:15', 'nhs', "Brother Wei is ALIVE!!! He's in Gusu!!!"],
      ['2023-03-04 20:16', 'nhs', "I don't know anything else, I swear 🙈"],
      ['2023-03-04 21:40', 'me', "I heard."],
      ['2023-03-04 21:41', 'nhs', "Are you okay?? 🥺"],
      ['2023-03-04 21:50', 'me', "Why wouldn't I be."],
      ['2023-03-04 21:50', 'nhs', "No reason!! 🙈"],

      ['2023-05-08 11:20', 'nhs', "Brother Jiang~ tiny tiny favor 🙏"],
      ['2023-05-08 11:20', 'nhs', "My fan shop needs to ship 2,000 fans to Gusu for the summer market"],
      ['2023-05-08 11:21', 'nhs', "And YMJ is the best logistics company in the whole country 😭🙏"],
      ['2023-05-08 11:21', 'nhs', "Family discount? 👀"],
      ['2023-05-08 11:40', 'me', "We're not family."],
      ['2023-05-08 11:40', 'nhs', "Summer '07 is family!! 😭"],
      ['2023-05-08 11:45', 'me', "Ten percent."],
      ['2023-05-08 11:45', 'nhs', "I knew you loved me 🪭"],
      ['2023-05-08 11:46', 'me', "Five percent."],
      ['2023-05-08 11:46', 'nhs', "Ten is perfect!! Thank you Brother Jiang 🙏🙏"],

      ['2023-07-29 15:00', 'nhs', "Made you something!! 🪭🪷"],
      ['2023-07-29 15:00', 'nhs', "Hand-painted purple lotus. One of a kind 😭"],
      ['2023-07-29 15:20', 'me', "I don't use fans."],
      ['2023-07-29 15:20', 'nhs', "Brother Jiang, it's 38 degrees in Yunmeng 👀"],
      ['2023-07-29 15:31', 'me', "Send it."],
      ['2023-07-29 15:31', 'nhs', "Already in the mail hehe~"],

      ['2024-04-13 23:30', 'nhs', "Brother Jiang, thank you for paying tonight!!! 😭🙏"],
      ['2024-04-13 23:30', 'nhs', "I'll get it next time, promise"],
      ['2024-04-13 23:45', 'me', "You said that in 2007."],
      ['2024-04-13 23:45', 'nhs', "Did I? I don't remember! 🙈"],

      // The night of Guanyin Temple.
      ['2024-06-22 02:10', 'me', "Did you know."],
      ['2024-06-22 02:12', 'nhs', "Know what, Brother Jiang? 🙈"],
      ['2024-06-22 02:12', 'me', "About him. Before tonight."],
      ['2024-06-22 02:15', 'nhs', "I don't know anything! I'm just a man who paints fans 🪭"],
      ['2024-06-22 02:16', 'me', "Huaisang."],
      ['2024-06-22 02:20', 'nhs', "..."],
      ['2024-06-22 02:21', 'nhs', "Get some sleep, Brother Jiang. It's been a long night for everyone."],

      ['2025-09-20 13:00', 'nhs', "Brother Jiang, have you heard from Xichen-ge? 😭 He won't see anyone, not even Wangji-xiong"],
      ['2025-09-20 14:12', 'me', "No."],
      ['2025-09-20 14:12', 'nhs', "If you do, will you tell me? 🙏"],
      ['2025-09-20 14:15', 'me', "No."],
      ['2025-09-20 14:15', 'nhs', "😭"],

      ['2026-01-20 21:55', 'nhs', "Brother Jiang, do you follow @teaspiller_qh? 👀"],
      ['2026-01-20 21:55', 'nhs', "They posted a list of the hottest single CEOs and you're #3!!! 😭"],
      ['2026-01-20 22:05', 'me', "I don't follow gossip."],
      ['2026-01-20 22:06', 'nhs', "Of course not hehe~"],
      ['2026-01-20 22:25', 'me', "You're number two."],
      ['2026-01-20 22:26', 'nhs', "Am I?? I had no idea!! I didn't read it closely!! 🙈"],
      ['2026-01-20 22:26', 'nhs', "What an honor 😭🪭"],

      ['2026-03-17 10:30', 'nhs', "Gossip!! 👀 The Jin board fought for TWO HOURS about this year's gala budget"],
      ['2026-03-17 10:30', 'nhs', "Someone wanted a koi-shaped ice sculpture"],
      ['2026-03-17 10:40', 'me', "I don't care."],
      ['2026-03-17 10:40', 'nhs', "You'll care when you see it~ 🪭"],

      ['2026-09-25 19:40', 'nhs', "ZEWU-JUN IS BACK 👀👀👀"],
      ['2026-09-25 19:40', 'nhs', "", { link: { title: 'Zewu-jun returns to Cloud Recesses after a year away', site: 'Lanling Daily', url: 'https://lanlingdaily.lanling/culture/zewu-jun-returns' } }],
      ['2026-09-25 19:41', 'nhs', "Did you know?? 🙈"],
      ['2026-09-25 22:40', 'me', "Why would I know."],
      ['2026-09-25 22:41', 'nhs', "No reason~"],
      ['2026-09-25 22:41', 'nhs', "He looks well! A little thin. Someone should feed him 👀"],
      ['2026-09-25 22:50', 'me', "Someone should mind their own business."],

      ['-13 16:20', 'nhs', "Brother Jiang, you're coming to the Jin gala, right?? 🙏 I'm on the seating committee this year hehe"],
      ['-13 17:02', 'me', "Why are you on the seating committee."],
      ['-13 17:02', 'nhs', "I don't know! They asked! 🙈"],

      ['-3 11:15', 'nhs', "Final seating chart is done~ 🪭"],
      ['-3 11:30', 'me', "Where am I."],
      ['-3 11:30', 'nhs', "Somewhere lovely!! 👀"],
      ['-3 11:31', 'me', "Huaisang."],
      ['-3 11:31', 'nhs', "Oh no I have a meeting byeee 🙈"],

      ['+0 18:54', 'me', "You changed the seating chart."],
      ['+0 18:55', 'nhs', "I don't know what you mean!! 🙈"],
      ['+0 18:55', 'nhs', "Check your email hehe~"],
      ['+0 18:57', 'me', "I'm next to him."],
      ['+0 18:57', 'nhs', "Next to who? 👀"],
      ['+0 18:58', 'me', "Get lost."],
      ['+0 18:58', 'nhs', "Enjoy the soup course, Brother Jiang~ 🪭"],

      ['+0 23:44', 'nhs', "Brother Jiang!!! What happened on the balcony?!?! Everyone saw you two 👀", { u: 1 }],
    ],
  });
})();
