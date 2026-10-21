/* Message history — Lan Wangji, Wen Ning, Lan Sizhui, Lan Jingyi, Mianmian. Facts: docs/STORY.md */
(function () {
  'use strict';
  const { story } = window.JC;

  // ── Lan Wangji: writes only when Wei Ying can't, or about Wei Ying ──
  story.thread({
    id: 'lwj',
    members: ['lwj'],
    name: null,
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2023-03-05 08:02', 'lwj', "This is Lan Wangji. Wei Ying is safe. He is staying at the Jingshi."],
      ['2023-03-05 09:15', 'me', "I didn't ask."],
      ['2023-03-05 09:16', 'lwj', "You did not."],

      ['2023-06-11 08:30', 'lwj', "The courtyard has been repaired. Wei Ying asks whether you are hurt."],
      ['2023-06-11 09:00', 'me', "No."],
      ['2023-06-11 09:01', 'lwj', "He is."],
      ['2023-06-11 09:10', 'me', "Is it bad."],
      ['2023-06-11 09:11', 'lwj', "A bruise. He is proud of it."],
      ['2023-06-11 09:12', 'me', "Idiot."],
      ['2023-06-11 09:12', 'lwj', "Mn."],

      ['2024-06-22 03:40', 'lwj', "Wei Ying is not sleeping. He is waiting for your reply."],
      ['2024-06-22 03:41', 'lwj', "I am not asking you to reply. I am telling you."],

      ['2024-12-08 23:02', 'lwj', "Wei Ying has influenza. He asked me not to tell you."],
      ['2024-12-08 23:30', 'me', "Then why are you telling me."],
      ['2024-12-08 23:31', 'lwj', "Because he asked me not to."],
      ['2024-12-08 23:40', 'me', "Is he eating."],
      ['2024-12-08 23:41', 'lwj', "No."],
      ['2024-12-09 18:20', 'lwj', "He ate all of it."],
      ['2024-12-09 18:35', 'me', "All of what."],
      ['2024-12-09 18:36', 'lwj', "Mn."],

      ['2025-05-20 23:20', 'lwj', "Thank you for coming."],
      ['2025-05-20 23:41', 'me', "I left early."],
      ['2025-05-20 23:41', 'lwj', "You came."],

      ['2025-08-30 22:30', 'lwj', "Brother has withdrawn. He asks that no one visit."],
      ['2025-08-30 22:41', 'me', "Is he eating."],
      ['2025-08-30 22:42', 'lwj', "Some."],
      ['2025-08-30 22:42', 'me', "Leave food at the door anyway."],
      ['2025-08-30 22:43', 'lwj', "Mn."],

      ['-1 22:10', 'lwj', "The soup was edible today."],
      ['-1 22:31', 'me', "Only edible."],
      ['-1 22:32', 'lwj', "It is close. He says the fire is wrong."],

      ['+0 22:16', 'lwj', "Wei Ying would like to know whether you will dance."],
      ['+0 22:18', 'me', "No."],
      ['+0 22:18', 'lwj', "I told him."],
    ],
  });

  // ── Wen Ning: formal apologies, a slow thaw ───────────────────────
  story.thread({
    id: 'wn',
    members: ['wn'],
    name: null,
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2023-03-06 10:00', 'wn', "M-Mr. Jiang, this is Wen Ning. I'm sorry to message you. Mr. Wei asked me to tell you that he is well and that he is sorry. I'm sorry too. — Wen Ning"],
      ['2023-05-02 21:30', 'wn', "Mr. Jiang, I know I'm the last person you want to hear from. I'm sorry about Qiongqi Pass. I know it doesn't change anything. I have wanted to say it for fourteen years. — Wen Ning"],
      ['2024-06-22 09:15', 'wn', "Mr. Jiang, I'm sorry I told you the way I did. In the rain. My sister made me promise never to tell, and I broke it. I think she would have wanted me to, in the end. I'm sorry. — Wen Ning"],
      ['2024-07-03 23:48', 'me', "Where is she buried."],
      ['2024-07-03 23:52', 'wn', "In Yiling, Mr. Jiang. The hill cemetery behind the old clinic. Third row, under the camphor tree. Sorry. — Wen Ning"],
      ['2026-04-05 17:30', 'me', "I left flowers for your sister."],
      ['2026-04-05 17:41', 'wn', "M-Mr. Jiang. Thank you. She would have said flowers are a waste of money."],
      ['2026-04-05 17:41', 'wn', "She would have kept them anyway. — Wen Ning"],
      ['-6 15:20', 'wn', "Mr. Jiang, I'll be driving Mr. Wei and Hanguang-jun to the gala on Friday. If you need a ride afterward, my van has room. Sorry if this is strange. — Wen Ning"],
      ['-6 16:02', 'me', "I'll manage."],
      ['-6 16:03', 'wn', "Of course. Sorry. — Wen Ning"],
      ['-6 16:10', 'me', "Thank you for offering."],
      ['-6 16:14', 'wn', "!!!"],
      ['-6 16:14', 'wn', "You're welcome, Mr. Jiang. — Wen Ning"],
    ],
  });

  // ── Lan Sizhui: Jin Ling's best friend, "Sect Leader Jiang" ───────
  story.thread({
    id: 'sz',
    members: ['sz'],
    name: null,
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2024-03-16 20:10', 'sz', "Good evening, Sect Leader Jiang! This is Lan Sizhui, Jin Ling's friend from Cloud Recesses. Jin Ling left his archery glove in our dorm. Should I send it to Lotus Pier?"],
      ['2024-03-16 20:40', 'me', "Send it to him directly. He'll lose it again anyway."],
      ['2024-03-16 20:41', 'sz', "Understood! Sorry, I know it's Mr. Jiang now. Old habit."],
      ['2024-03-16 20:45', 'me', "Either is fine."],
      ['2024-06-22 00:30', 'sz', "Sect Leader Jiang, I'm sorry to message so late. Jin Ling is staying in our dorm tonight. He's okay. He doesn't want to talk yet, but he ate some congee. I thought you'd want to know."],
      ['2024-06-22 00:52', 'me', "Thank you, Sizhui. Keep him there. I'll come in the morning."],
      ['2024-06-22 00:53', 'sz', "I will. Please drive safely."],
      ['2025-10-19 10:00', 'sz', "Mr. Jiang, thank you for having us at Lotus Pier for Jin Ling's birthday! The lotus root cakes were amazing. Jingyi ate eleven."],
      ['2025-10-19 10:20', 'me', "I counted twelve."],
      ['2025-10-19 10:21', 'sz', "He says twelve is a lie. (It was thirteen.)"],
      ['-2 18:30', 'sz', "Sect Leader Jiang, I'm collecting short video messages from everyone for Jin Ling's birthday. Would you record one? Even ten seconds is fine!"],
      ['-2 19:05', 'me', "No."],
      ['-2 19:05', 'sz', "Understood! 😊"],
      ['-1 23:40', 'me', "Five seconds."],
      ['-1 23:41', 'sz', "That's perfect!! Thank you, Mr. Jiang!"],
      ['-1 23:42', 'sz', "Also, could you send a photo of Jin Ling when he was little? For the slideshow. He'll hate it."],
      ['-1 23:50', 'me', "", { img: 'p_jl_kid' }],
      ['-1 23:50', 'sz', "Is he wearing a gold crown?"],
      ['-1 23:51', 'me', "He insisted."],
      ['-1 23:51', 'sz', "This is perfect. 😊", { react: [{ by: 'me', t: 'like' }] }],
    ],
  });

  // ── Lan Jingyi: caps, typos, 💀 ───────────────────────────────────
  story.thread({
    id: 'jy',
    members: ['jy'],
    name: null,
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2025-06-21 02:13', 'jy', "MR JIANG is jin ling with u"],
      ['2025-06-21 02:13', 'jy', "hes not answering and he has my charger"],
      ['2025-06-21 02:20', 'me', "It's two in the morning. He's asleep."],
      ['2025-06-21 02:20', 'jy', "oh ok sorry 💀"],
      ['2025-06-21 02:21', 'jy', "wait why r u awake"],

      ['-5 17:45', 'jy', "jin ling ur uncle looked at me like i was a bug today 💀"],
      ['-5 17:52', 'me', "You are."],
      ['-5 17:52', 'jy', "MR JIANG", { effect: 'loud' }],
      ['-5 17:52', 'jy', "WRONG CHAT"],
      ['-5 17:53', 'jy', "IM SO SORRY 💀💀💀"],
      ['-5 17:53', 'jy', "pls dont tell jin ling"],
      ['-5 18:01', 'me', "Tell him yourself."],

      ['-2 17:40', 'jy', "MR JIANG can we do fireworks at the party"],
      ['-2 17:45', 'me', "No."],
      ['-2 17:45', 'jy', "small ones"],
      ['-2 17:46', 'me', "No."],
      ['-2 17:46', 'jy', "sparklers"],
      ['-2 17:47', 'me', "Lan Jingyi."],
      ['-2 17:47', 'jy', "ok no fireworks 💀"],
    ],
  });

  // ── Mianmian: old classmate, architect, kind and dry ─────────────
  story.thread({
    id: 'mian',
    members: ['mian'],
    name: null,
    pinned: false,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      ['2023-03-05 10:30', 'mian', "Heard the news. Are you okay?"],
      ['2023-03-05 11:02', 'me', "Why does everyone keep asking that."],
      ['2023-03-05 11:05', 'mian', "Because we know you. Come for dinner Sunday. I'll make the fish you pretend not to like."],
      ['2023-03-05 11:20', 'me', "Fine."],

      ['2023-07-18 14:00', 'mian', "Pavilion drawings are in your inbox. Before you say no: your sister would have liked the railing."],
      ['2023-07-18 16:45', 'me', "That's a cheap move."],
      ['2023-07-18 16:46', 'mian', "Did it work?"],
      ['2023-07-18 17:30', 'me', "It worked."],

      ['2024-04-13 23:05', 'mian', "Thanks for dinner. You didn't have to pay for everyone."],
      ['2024-04-13 23:20', 'me', "Huaisang was reaching for his wallet very slowly."],
      ['2024-04-13 23:21', 'mian', "Fair."],

      ['2025-05-20 22:40', 'mian', "You left before the toasts."],
      ['2025-05-20 22:52', 'me', "I had work."],
      ['2025-05-20 22:53', 'mian', "You had a face. I saw it."],
      ['2025-05-20 22:54', 'mian', "Come by tomorrow. I'll make tea and not ask."],
      ['2025-05-20 23:10', 'me', "Fine."],

      ['2026-09-30 21:15', 'mian', "You checked your phone four times at dinner tonight. You never check your phone at dinner."],
      ['2026-09-30 21:30', 'me', "Work."],
      ['2026-09-30 21:31', 'mian', "Work doesn't make you do that with your face."],
      ['2026-09-30 21:33', 'me', "Do what."],
      ['2026-09-30 21:33', 'mian', "Smile, Jiang Cheng. It's called smiling."],

      ['-3 16:00', 'mian', "Tangtang made A-Ling a birthday card. It's mostly a dog. Allegedly. Can you pick it up?"],
      ['-3 16:40', 'me', "Tomorrow morning."],
      ['-2 08:20', 'me', "Picked up the card. The dog has six legs."],
      ['-2 08:22', 'mian', "She says it's running."],

      ['+0 20:12', 'mian', "How's the gala? Huaisang says you're seated next to Zewu-jun."],
      ['+0 20:30', 'me', "Huaisang talks too much."],
      ['+0 20:31', 'mian', "That's not a no."],
      ['+0 20:35', 'me', "Go to sleep."],
      ['+0 20:35', 'mian', "It's 8:35, Jiang Cheng."],
    ],
  });
})();
