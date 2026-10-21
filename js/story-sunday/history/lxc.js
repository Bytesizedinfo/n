/* Message history — Lan Xichen, saved as "Zewu-jun".
   2023–2025 a little; Sep 2025 → Sep 2026 Jiang Cheng writes alone; Mid-Autumn 2026 he answers. Facts: docs/STORY.md */
(function () {
  'use strict';
  const { story } = window.JC;

  story.thread({
    id: 'lxc',
    members: ['lxc'],
    name: null,
    pinned: true,
    muted: false,
    service: 'imessage',
    fails: false,
    history: [
      // ── Before ───────────────────────────────────────────────────
      ['2023-06-11 09:20', 'lxc', "Wanyin, good morning. Wangji tells me there was a disagreement in the Jingshi courtyard last night. I hope you and Wei Wuxian are both all right."],
      ['2023-06-11 10:05', 'me', "We're fine. The lantern isn't."],
      ['2023-06-11 10:12', 'lxc', "The lantern has been replaced. Uncle has added a rule about it."],
      ['2023-06-11 10:13', 'lxc', "It's a very specific rule."],
      ['2023-06-11 10:20', 'me', "Tch."],

      ['2023-09-02 16:40', 'lxc', "Thank you for the lotus seeds. Uncle claims he doesn't care for them. He has eaten half the box."],
      ['2023-09-02 17:15', 'me', "This year's harvest. Too many, as usual."],
      ['2023-09-02 17:20', 'lxc', "They taste like summer. I'd forgotten Yunmeng summers had a taste."],

      ['2024-06-22 07:30', 'me', "Are you all right."],
      ['2024-06-25 23:02', 'lxc', "Thank you for asking, Wanyin. I'm not. I will be."],
      ['2024-06-25 23:10', 'me', "Eat something."],
      ['2024-06-25 23:14', 'lxc', "Wangji said the same thing. In fewer words."],

      ['2024-11-19 14:00', 'me', "The board approved it. The Academy's flood repairs are funded."],
      ['2024-11-19 14:30', 'lxc', "Wanyin, you didn't have to do that."],
      ['2024-11-19 14:32', 'me', "It's a tax write-off."],
      ['2024-11-19 14:35', 'lxc', "Of course it is. Thank you all the same."],

      ['2025-08-30 21:40', 'lxc', "Wanyin, I'm going to step away for a while. I don't know for how long. Please don't worry, and please don't come."],
      ['2025-08-30 21:55', 'me', "I'm not worried."],
      ['2025-08-30 21:55', 'me', "Eat something."],

      // ── A year of seasons. No replies. ──────────────────────────
      ['2025-09-07 22:10', 'me', "The lotus seeds are in. Too many, as usual."],
      ['2025-09-16 23:30', 'me', "It rained all week. The lake is high."],
      ['2025-10-06 22:45', 'me', "Mid-Autumn. A-Ling ate four mooncakes and blamed the dog."],
      ['2025-10-18 23:50', 'me', "A-Ling turned seventeen. He wants a car. He's not getting a car."],
      ['2025-10-27 21:05', 'me', "The lotus root harvest started. The workers sing while they dig. Badly."],
      ['2025-11-15 06:20', 'me', "First frost on the dock this morning."],
      ['2025-11-30 23:58', 'me', "You don't have to answer these."],
      ['2025-12-12 20:00', 'me', "Wei Wuxian sent me a radish with a face drawn on it. I ate it. I don't know why I'm telling you."],
      ['2025-12-21 22:15', 'me', "Winter solstice. Old Huang made four hundred dumplings for forty people."],
      ['2026-01-10 08:40', 'me', "It snowed in Yunmeng. It never snows in Yunmeng."],
      ['2026-01-10 08:41', 'me', "A-Ling built a snow dog. Fairy was offended."],
      ['2026-01-28 07:15', 'me', "The lake froze at the edges. Just the edges."],
      ['2026-02-17 00:30', 'me', "New Year. I lit the lanterns on the pier. It was quiet."],
      ['2026-03-08 18:20', 'me', "The willows along the lake are green again."],
      ['2026-03-11 23:20', 'me', "The Lanling port authority has held three of our barges for nine days over a form that does not exist."],
      ['2026-03-11 23:21', 'me', "I called. They transferred me four times. The fourth person was the first person."],
      ['2026-03-11 23:23', 'me', "I drove there. They were at lunch. It was ten in the morning."],
      ['2026-03-11 23:24', 'me', "They asked for the form again. I asked them to show me the form. They could not show me the form."],
      ['2026-03-11 23:26', 'me', "Tang Mei says I'm not allowed to drive there again."],
      ['2026-03-11 23:27', 'me', "I'm telling you because you're the only one who won't answer."],
      ['2026-03-19 01:20', 'me', "The port authority found a second form that does not exist. We have the barges back. I don't want to talk about it."],
      ['2026-03-22 22:40', 'me', "Rain every day. The lotus leaves are coming up anyway."],
      ['2026-04-05 21:00', 'me', "Qingming. I swept the graves. It rained, as it always does."],
      ['2026-04-20 06:50', 'me', "The first leaves are flat on the water now. Round. Stubborn."],
      ['2026-05-15 23:30', 'me', "I'm thirty-four today. A-Ling bought me a cake shaped like his dog. I don't know why everyone thinks I like dogs."],
      ['2026-05-30 20:10', 'me', "Old Huang caught a fish with his hands. He's sixty-three. He made me watch."],
      ['2026-06-14 06:30', 'me', "The first buds."],
      ['2026-06-27 23:10', 'me', "Plum rain. Everything smells like the lake."],
      ['2026-07-06 05:55', 'me', "", { img: 'p_lotus_pond_day' }],
      ['2026-07-06 05:55', 'me', "The lotus are blooming. You should see them."],
      ['2026-07-21 14:00', 'me', "Thirty-nine degrees. The tourists are melting. The lotus don't care."],
      ['2026-08-19 23:40', 'me', "The staff left early for Qixi. I stayed late. Nothing to do with Qixi."],
      ['2026-08-28 17:00', 'me', "A-Ling got his learner permit. Gusu has more trees than Yunmeng. Warn them."],
      ['2026-08-30 22:00', 'me', "A year."],
      ['2026-09-13 06:45', 'me', "Seed pods. The village kids steal them from the edge of the pond. I let them."],
      ['2026-09-25 18:30', 'me', "Mid-Autumn again. The moon's too bright. A-Ling is here. The mooncakes are terrible this year."],

      // ── He answers ───────────────────────────────────────────────
      ['2026-09-25 21:14', 'lxc', "Wanyin, I read all of your messages. Thank you.", { effect: 'gentle' }],
      ['2026-09-25 21:31', 'me', "You're back."],
      ['2026-09-25 21:33', 'lxc', "I'm back. I'm sorry it took a year."],
      ['2026-09-25 21:40', 'me', "Did you eat."],
      ['2026-09-25 21:42', 'lxc', "I did. Wangji left mooncakes at the door. And someone left a tin of white peony on the table in the Hanshi."],
      ['2026-09-25 21:42', 'lxc', "The shop says the order came from Yunmeng."],
      ['2026-09-25 21:50', 'me', "Coincidence."],
      ['2026-09-25 21:52', 'lxc', "Of course. 🙂"],
      ['2026-09-25 21:53', 'lxc', "Happy Mid-Autumn, Wanyin. The moon is very bright here too."],

      ['2026-09-28 20:10', 'lxc', "Uncle tells me he wrote to you. I hope it was brief."],
      ['2026-09-28 20:25', 'me', "Four lines. He said no reply was required."],
      ['2026-09-28 20:26', 'lxc', "Did you reply?"],
      ['2026-09-28 20:26', 'me', "No reply was required."],
      ['2026-09-28 20:28', 'lxc', "He'll respect that more than you know."],

      ['-12 07:02', 'lxc', "", { img: 'p_cloud_recesses' }],
      ['-12 07:02', 'lxc', "The gates this morning. The mist came back while I was away. Or perhaps I simply stopped looking."],
      ['-12 07:30', 'me', "Still ugly."],
      ['-12 07:33', 'lxc', "You said that in 2007 as well."],
      ['-12 07:34', 'me', "I was right in 2007."],

      ['-9 21:40', 'lxc', "I've been rereading your messages. The one about the snow dog made me laugh in a board meeting. Uncle was not pleased."],
      ['-9 21:55', 'me', "Fairy is still offended."],

      ['-3 19:20', 'lxc', "Wangji says Wei Wuxian has made soup every evening this week. The Jingshi smells wonderful and only slightly burnt."],
      ['-3 19:21', 'lxc', "He says he remembers every part of your sister's recipe except the fire."],
      ['-3 19:40', 'me', "It isn't complicated."],
      ['-3 19:42', 'lxc', "Then it would only take you a sentence."],
      ['-3 19:55', 'me', "Tch."],

      ['-2 21:47', 'lxc', "It's raining on the Hanshi roof. I've been listening to it for an hour instead of reading board papers."],
      ['-2 21:52', 'me', "Read the board papers."],
      ['-2 21:53', 'lxc', "You first."],
      ['-2 21:55', 'me', "I read mine at six this morning."],
      ['-2 21:56', 'lxc', "Of course you did."],
      ['-2 22:03', 'me', "Are you still awake in five minutes."],
      ['-2 22:03', 'lxc', "Yes."],
      ['-2 22:47', 'lxc', "Thank you for calling. I'd forgotten what your voice sounds like when you aren't angry."],
      ['-2 22:49', 'me', "I'm always angry."],
      ['-2 22:50', 'lxc', "Not for forty-one minutes."],
      ['-2 22:52', 'lxc', "If you're still in Lanling on Saturday, Gusu is two hours by train. The offer of tea stands. Saturday afternoon, perhaps three?"],
      ['-2 23:05', 'me', "I'll see."],

      ['-1 20:15', 'lxc', "Will I see you at the gala tomorrow?"],
      ['-1 20:31', 'me', "A-Ling would never forgive me if I didn't go."],
      ['-1 20:32', 'lxc', "Then I'll see you there."],

      ['+0 18:52', 'lxc', "I've just seen the seating chart. Please know that this was not my doing."],
      ['+0 18:57', 'me', "I know whose doing it was."],
      ['+0 18:58', 'lxc', "I thought you might. 🙂"],

      ['+0 23:31', 'lxc', "Wanyin, did you get home safely? I'm sorry if I spoke out of turn on the balcony.", { u: 1 }],
    ],
  });
})();
