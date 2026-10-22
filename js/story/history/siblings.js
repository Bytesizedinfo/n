/* History — Childe's DMs with his family: Teucer, Tonia, Anthon, Mama, Papa (2023 → Friday 23:47).
   Voices: docs/STORY.md "Who is who". Owner: S1b (Family). Live scenes: js/story/scenes/family-*.js.
   Planted for later: the elves (Grigory, Little Masha, Old Pyotr), Sir Fang on night shift, Reel Rush 2,047,
   the tooth for the Liyue tooth fairy, Tonia's letter in the drawer with the fishing hooks, her notebook, Mama's
   pelmeni recipe, Papa's guilt about the cave and Pulcinella. */
(function () {
  'use strict';
  const JC = window.JC;
  const T = (def) => JC.story.thread(def);

  // ── Teucer ───────────────────────────────────────────────────────
  T({
    id: 'teucer',
    members: ['teucer'],
    pinned: true,
    history: [
      ['2025-09-13 16:10', 'teucer', 'BROTHER'],
      ['2025-09-13 16:10', 'teucer', 'BROTHER'],
      ['2025-09-13 16:10', 'teucer', 'BROTHER ITS ME. on my WATCH'],
      ['2025-09-13 16:12', 'me', 'TEUCER!!! 😁 you have your own messages now!! this is the best day of my life'],
      ['2025-09-13 16:12', 'teucer', 'mine 2'],
      ['2025-09-13 16:14', 'teucer', '', { voice: { dur: 9, text: '“Brother, can you hear me? I’m talking into my WRIST. Like a SPY.”' } }],
      ['2025-09-13 16:15', 'me', 'loud and clear, Agent Teucer 🐟'],

      ['2025-09-20 18:31', 'teucer', 'do the elves at the factory have names'],
      ['2025-09-20 18:40', 'me', 'of course they do 😁'],
      ['2025-09-20 18:40', 'me', 'there\'s Grigory, who paints all the eyes. Little Masha, who\'s in charge of glitter. and Old Pyotr, who only makes trains and gets grumpy if you ask for anything else'],
      ['2025-09-20 18:41', 'teucer', 'why only trains'],
      ['2025-09-20 18:43', 'me', 'a long time ago he made a doll and it looked at him funny. trains don\'t look at you'],
      ['2025-09-20 18:43', 'teucer', '😮'],
      ['2025-09-20 18:44', 'teucer', 'is there a elf for fish toys'],
      ['2025-09-20 18:44', 'me', 'that\'s me 😁'],
      ['2025-09-20 18:44', 'teucer', 'UR NOT A ELF'],
      ['2025-09-20 18:45', 'me', 'I\'m the tallest elf'],

      ['2025-10-02 19:05', 'teucer', '', { voice: { dur: 14, text: '“Brother, Sir Fang wants to know if wolves can work at the toy factory. He would be a guard. He would guard the trains so Old Pyotr isn’t sad.”' } }],
      ['2025-10-02 19:20', 'me', 'Sir Fang is HIRED 🐺 night shift, guarding the trains. the pay is one fish a day'],
      ['2025-10-02 19:21', 'teucer', 'he says ok'],

      ['2025-10-28 22:14', 'teucer', 'brother r u awake'],
      ['2025-10-28 22:14', 'teucer', 'the dark is very dark tonight'],
      ['2025-10-28 22:15', 'teucer', 'Sir Fang is guarding but he is a bit scared to'],
      ['2025-10-28 22:16', 'me', 'Sir Fang isn\'t scared. Sir Fang is an ICE WOLF. ice wolves see in the dark, that\'s their whole thing 🐺⭐'],
      ['2025-10-28 22:16', 'me', 'and if anything comes he goes AWOOOO and I hear it all the way from here'],
      ['2025-10-28 22:17', 'teucer', 'even from the snow palace'],
      ['2025-10-28 22:17', 'me', 'even from there'],
      ['2025-10-28 22:18', 'teucer', 'ok'],
      ['2025-10-28 22:18', 'teucer', 'goodnight brother 🐟'],
      ['2025-10-28 22:18', 'me', 'goodnight Teucer ❤️🐟'],

      ['2025-11-11 08:30', 'teucer', '', { voice: { dur: 18, text: '“THANK YOU FOR SNOW LANCER! He has a spear! Little Masha did the glitter SO good! I’m taking him to school! Mama says I’m NOT taking him to school. I’m taking him to school in my SOCK.”' } }],
      ['2025-11-11 08:41', 'me', 'smuggle him in Teucer. that\'s an order ⚔️😁'],

      ['2025-11-20 17:02', 'teucer', 'brother whats ur favrite fish'],
      ['2025-11-20 17:30', 'me', 'today? a sturgeon. tomorrow? whatever bites 🎣'],
      ['2025-11-20 17:31', 'teucer', 'mine is the one i caught'],
      ['2025-11-20 17:31', 'me', 'Ajax the fish. the legend 🐟'],

      ['2025-12-20 07:50', 'teucer', 'how many days until u come home'],
      ['2025-12-20 07:52', 'me', 'FOUR 😁'],
      ['2025-12-20 07:52', 'teucer', '4!!!!!!!!!!'],
      ['2025-12-21 07:49', 'teucer', '3!!!!!!!!!!'],
      ['2025-12-22 07:51', 'teucer', '2!!!!!!!!!!'],
      ['2025-12-23 07:48', 'teucer', '1!!!!!!!!!! 🐟🐟🐟'],

      ['2026-01-15 19:12', 'teucer', 'I DOWNLOADED REEL RUSH ON MAMAS IPAD'],
      ['2026-01-15 19:12', 'teucer', '1,212!!!!! beat THAT 🎣'],
      ['2026-01-15 19:40', 'me', '1,212? cute 😁'],
      ['2026-01-15 19:52', 'me', '1,640. good luck, fish boy 🎣⚔️'],
      ['2026-01-15 19:52', 'teucer', '😤😤😤😤😤'],
      ['2026-01-23 18:05', 'teucer', '1,700!!!!!!!!!'],
      ['2026-01-23 18:30', 'me', '1,812 😁'],
      ['2026-01-23 18:31', 'teucer', 'how do u get the GOLDEN fish'],
      ['2026-01-23 18:33', 'me', 'patience. you let it run before you pull. just like real fishing'],
      ['2026-01-23 18:33', 'teucer', 'real fishing is COLD'],

      ['2026-03-10 20:02', 'teucer', '', { voice: { dur: 16, text: '“Brother, are you going to live in Liyue forever? Mama said ‘for now’. How long is for now?”' } }],
      ['2026-03-10 20:15', 'me', 'for now means until the job\'s done 🐟'],
      ['2026-03-10 20:15', 'me', 'and then I come home and we go out on Papa\'s boat for a whole day. just us'],
      ['2026-03-10 20:16', 'teucer', 'PROMISE'],
      ['2026-03-10 20:16', 'me', 'promise ❤️'],

      ['2026-04-05 18:44', 'teucer', 'tonia says there are no elves'],
      ['2026-04-05 18:44', 'teucer', 'ARE THERE ELVES'],
      ['2026-04-05 18:50', 'me', 'Teucer. who painted the special eyes on your Snow Owl?'],
      ['2026-04-05 18:50', 'teucer', 'grigory'],
      ['2026-04-05 18:51', 'me', 'and who did the glitter on Snow Lancer\'s spear?'],
      ['2026-04-05 18:51', 'teucer', 'little masha'],
      ['2026-04-05 18:51', 'me', 'so 😁'],
      ['2026-04-05 18:52', 'teucer', 'HA. i told tonia. she made a face'],

      ['2026-05-30 17:20', 'teucer', '1,950!!!!!!!!!! 🎣'],
      ['2026-05-30 21:02', 'me', '2,030 😁 the throne is MINE'],
      ['2026-05-30 21:03', 'teucer', 'NOT FOR LONG'],

      ['2026-06-18 18:10', 'teucer', 'brother'],
      ['2026-06-18 18:10', 'teucer', 'glacier guardians has a FORTRESS now. the FROST FORTRESS. it has a drawbridge that WORKS'],
      ['2026-06-18 18:11', 'teucer', 'just saying'],
      ['2026-06-18 18:20', 'me', 'just saying, huh 😁'],
      ['2026-06-18 18:21', 'teucer', 'my birthday is november 11 btw'],
      ['2026-06-18 18:21', 'teucer', 'just saying'],

      ['2026-08-19 08:05', 'teucer', '', { voice: { dur: 21, text: '“Brother, I lost my tooth! The top one! Mama says the tooth fairy pays in mora. Does the tooth fairy go to Liyue? Because I’m keeping the tooth until I visit you.”' } }],
      ['2026-08-19 08:30', 'me', 'the tooth fairy has a Liyue branch 😁 bring it. she pays double here'],
      ['2026-08-19 08:30', 'teucer', 'DOUBLE'],

      ['2026-09-12 19:00', 'teucer', 'what did u name todays fish'],
      ['2026-09-12 19:04', 'me', 'Anthon'],
      ['2026-09-12 19:04', 'teucer', 'AGAIN 😂😂'],

      ['2026-10-10 18:22', 'teucer', 'NEW RECORD'],
      ['2026-10-10 18:22', 'teucer', '2,047!!!!!!!!!!!!!!'],
      ['2026-10-10 18:23', 'teucer', 'BEAT THAT FISH MAN 🎣😤⭐'],
      ['2026-10-10 18:40', 'me', '…2,047??'],
      ['2026-10-10 18:40', 'me', 'who taught you to fish like that'],
      ['2026-10-10 18:41', 'teucer', 'U DID'],
      ['2026-10-10 18:43', 'me', 'oh it\'s ON. next time I see you. in person. prepare to cry 😁⚔️🐟'],

      ['2026-10-14 21:05', 'teucer', 'i am not telling u anything'],
      ['2026-10-14 21:05', 'teucer', 'about anything'],
      ['2026-10-14 21:05', 'teucer', 'there is no surprise'],
      ['2026-10-14 21:06', 'me', 'what surprise 😁'],
      ['2026-10-14 21:06', 'teucer', 'EXACTLY'],
      ['2026-10-14 21:08', 'teucer', 'but if there WAS a surprise we could do reel rush IN PERSON'],
      ['2026-10-14 21:08', 'teucer', 'and i would WIN'],

      ['2026-10-16 18:40', 'teucer', 'brother do u like fish that is frozen'],
      ['2026-10-16 18:52', 'me', 'Teucer did you pack me a FROZEN FISH'],
      ['2026-10-16 18:52', 'teucer', 'mama took it out'],
      ['2026-10-16 18:53', 'teucer', 'it was for u'],
      ['2026-10-16 18:55', 'me', 'that\'s the nicest thing anyone has ever packed for me ❤️🐟'],
      ['2026-10-16 23:33', 'teucer', '', { u: 1, voice: { dur: 12, text: '“BROTHER!! WE’RE ON THE PLANE!!! It’s a SURPRISE so don’t look!!! (Tonia, in the background: “Teucer, he knows.”) He does NOT know! Okay bye! Sir Fang says bye! The plane is so BIG—”' } }],
      ['2026-10-16 23:35', 'teucer', 'tonia says the watch has to go on AIRPLANE MODE', { u: 1 }],
      ['2026-10-16 23:35', 'teucer', 'what is airplane mode. is my watch a PLANE now ✈️🐟', { u: 1 }],
    ],
  });

  // ── Tonia ────────────────────────────────────────────────────────
  T({
    id: 'tonia',
    members: ['tonia'],
    history: [
      ['2024-03-22 22:10', 'tonia', 'Ajax. Can I ask you something without Mama reading over my shoulder?'],
      ['2024-03-22 22:11', 'tonia', 'The letter that came in the winter, with the gold stamp. You took it to your room without opening it in front of us. Was it about the promotion?'],
      ['2024-03-22 22:20', 'me', 'nosy 😁 yes. boring paperwork. Northland Toys belongs to Northland Bank Group, so everything comes on bank paper with gold stamps. very corporate'],
      ['2024-03-22 22:21', 'tonia', 'I didn\'t know toy companies belonged to banks.'],
      ['2024-03-22 22:22', 'me', 'everything belongs to a bank, Tonia. even the bank belongs to a bank'],
      ['2024-03-22 22:22', 'tonia', 'That isn\'t true.'],
      ['2024-03-22 22:24', 'tonia', '…Is it?'],
      ['2024-03-22 22:25', 'me', 'goodnight Tonia ❤️'],

      ['2024-06-04 17:30', 'tonia', 'We have to write an essay at school, “What I want to be.” I want to write “something like my brother.” But I don\'t know what to write that you do. Not exactly.'],
      ['2024-06-04 17:48', 'me', 'write “he makes kids happy for a living” 😁'],
      ['2024-06-04 17:49', 'tonia', 'Do you?'],
      ['2024-06-04 18:02', 'me', 'write it anyway'],

      ['2024-12-09 21:40', 'tonia', 'Papa was very quiet at dinner. He went out and sat in the boat. It isn\'t frozen in yet, so he just sat there in the dark.'],
      ['2024-12-09 21:41', 'tonia', 'Mama says it\'s the day you got lost. I was seven, I don\'t remember much. I remember everybody shouting your name in the woods. I remember the lanterns.'],
      ['2024-12-09 21:41', 'tonia', 'Are you okay, Ajax?'],
      ['2024-12-09 21:55', 'me', 'I\'m okay, Tonia. promise. that was a long time ago. I came back, didn\'t I? 😁'],
      ['2024-12-09 21:57', 'tonia', 'You came back different. Mama says so when she thinks we\'re asleep.'],
      ['2024-12-09 21:58', 'me', 'different good or different bad?'],
      ['2024-12-09 22:06', 'tonia', 'She didn\'t say.'],

      ['2025-03-09 07:05', 'me', 'HAPPY BIRTHDAY TONIA!!! 🎂 fourteen!! check the porch 😁'],
      ['2025-03-09 08:12', 'tonia', 'The complete Inspector Volkov. All twenty-two. Signed.'],
      ['2025-03-09 08:12', 'tonia', 'Ajax, he died in 1974.'],
      ['2025-03-09 08:15', 'me', 'I\'m very resourceful'],
      ['2025-03-09 08:16', 'tonia', 'Thank you, bratik. I\'m going to read them in order. I already know the banker did it.'],

      ['2025-07-20 07:12', 'tonia', 'Happy birthday, bratik. I know you\'ll get a hundred messages today, so I\'ll keep this short.'],
      ['2025-07-20 07:12', 'tonia', 'Teucer drew you as a giant holding a fish the size of the house. Anthon pretends he doesn\'t miss you; he wore your old jacket to school all week. Mama set out your plate on Sunday again. Papa looks at the door when the wind moves it.'],
      ['2025-07-20 07:13', 'tonia', 'We\'re all fine. We just notice you\'re not here. That\'s all. Happy birthday.'],
      ['2025-07-20 07:40', 'me', 'that\'s not short Tonia 😭❤️'],
      ['2025-07-20 07:41', 'me', 'thank you. tell Anthon the jacket suits him. don\'t tell him I said that'],

      ['2025-10-21 20:30', 'tonia', 'There was something on the news about the Fatui in Mondstadt. Papa turned it off. Anthon says the Fatui are the bank. Is that true?'],
      ['2025-10-21 20:52', 'me', 'the Fatui are… a department. security. very boring. nothing to do with toys'],
      ['2025-10-21 20:53', 'tonia', 'So you know them.'],
      ['2025-10-21 20:55', 'me', 'everybody at the bank knows the security guys, Tonia 😁 they hold the door'],
      ['2025-10-21 20:59', 'tonia', 'Okay.'],

      ['2026-03-09 07:30', 'me', 'HAPPY 15TH!!! 🎂 it\'s on the porch. it\'s from Liyue. it came by ship. it\'s been on a BOAT, Tonia'],
      ['2026-03-09 09:10', 'tonia', 'A silk scarf. It smells like the sea. Thank you.'],
      ['2026-03-09 09:11', 'tonia', 'I\'m fifteen now. You can tell me things.'],
      ['2026-03-09 09:14', 'me', 'I tell you lots of things!!'],
      ['2026-03-09 09:16', 'tonia', 'You tell me lots of things that aren\'t things.'],

      ['2026-07-22 22:40', 'tonia', 'Mama keeps saying “xiansheng” like it\'s his name.'],
      ['2026-07-22 22:41', 'tonia', 'Is he your friend? Or is he… you know.'],
      ['2026-07-22 22:50', 'me', 'FRIEND. he\'s a friend. he\'s very old-fashioned. he reads books about rocks'],
      ['2026-07-22 22:51', 'tonia', 'You said his name four times in one voice message to Mama.'],
      ['2026-07-22 22:58', 'me', '…he\'s a good friend'],
      ['2026-07-22 22:59', 'tonia', 'Okay.'],
      ['2026-07-22 23:01', 'tonia', 'I\'m only saying I would be fine with it. Whatever it is.', { react: [{ by: 'me', t: 'love' }] }],

      ['2026-10-11 16:40', 'tonia', 'Ajax. This came to the house today. Mama was at the market, so I signed for it.'],
      ['2026-10-11 16:40', 'tonia', '', { img: 'p_tonia_letter' }],
      ['2026-10-11 16:41', 'tonia', 'It\'s addressed to “Harbinger Tartaglia (Ajax)”. By hand of the Palace. Who is Harbinger Tartaglia? Why is your name in brackets, like the other one is the real one?'],
      ['2026-10-11 16:58', 'me', '😁 corporate stuff!! the directors are all called harbingers. it\'s an old company tradition, like a knighthood but with more paperwork'],
      ['2026-10-11 16:58', 'me', 'Tartaglia is my work name. everyone gets one. it\'s silly'],
      ['2026-10-11 16:59', 'me', 'don\'t open my mail, nosy 💧'],
      ['2026-10-11 17:01', 'tonia', 'I didn\'t open it. It has a window. I read what was in the window.'],
      ['2026-10-11 17:01', 'tonia', '“Your status as the Eleventh…” is what was in the window. The Eleventh what, Ajax?'],
      ['2026-10-11 17:06', 'me', 'the eleventh director! the Q3 review!! it\'s a performance review, Tonia. I\'m doing great btw 😁'],
      ['2026-10-11 17:10', 'tonia', 'Okay.'],
      ['2026-10-11 17:31', 'tonia', 'I put it in your old room. In the drawer with the fishing hooks. Mama didn\'t see it.'],
      ['2026-10-11 17:33', 'me', 'thank you ❤️'],
      ['2026-10-11 17:34', 'tonia', 'I\'m not doing it for you. I\'m doing it because Mama has enough to worry about.'],

      ['2026-10-14 21:20', 'tonia', 'Are you sure it\'s okay that Mr. Pulcinella pays for everything? Papa went out to the boat again after the phone call.'],
      ['2026-10-14 21:31', 'me', 'it\'s fine!! he likes our family. he\'s like a grandpa who owns a bank'],
      ['2026-10-14 21:32', 'tonia', 'Papa doesn\'t like him.'],
      ['2026-10-14 21:33', 'me', 'Papa doesn\'t like anyone who doesn\'t own a boat 😁'],
      ['2026-10-14 21:35', 'tonia', 'That isn\'t why.'],

      ['2026-10-16 23:30', 'tonia', 'Mama just called me at the gate. We\'re boarding.', { u: 1 }],
      ['2026-10-16 23:31', 'tonia', 'Ajax… a woman called the house asking for “the Eleventh”. Mama is pretending it\'s normal.', { u: 1 }],
    ],
  });

  // ── Anthon ───────────────────────────────────────────────────────
  T({
    id: 'anthon',
    members: ['anthon'],
    history: [
      ['2024-05-11 16:20', 'anthon', 'bro can u send money for a game'],
      ['2024-05-11 16:20', 'anthon', 'mama said ask u'],
      ['2024-05-11 16:41', 'me', 'what game'],
      ['2024-05-11 16:41', 'anthon', 'its educational'],
      ['2024-05-11 16:42', 'me', 'what does it teach'],
      ['2024-05-11 16:42', 'anthon', 'shooting'],
      ['2024-05-11 16:43', 'me', 'no 😁'],
      ['2024-05-11 16:43', 'anthon', 'u literally have a SWORD collection'],
      ['2024-05-11 16:44', 'me', 'that\'s different. those are decorative'],
      ['2024-05-11 16:44', 'anthon', 'u sharpen them'],

      ['2025-02-02 20:10', 'anthon', 'ok real question. how many toys have u actually sold. like ever. a number'],
      ['2025-02-02 20:18', 'me', 'millions'],
      ['2025-02-02 20:18', 'anthon', 'name one'],
      ['2025-02-02 20:19', 'me', 'the Snow Owl'],
      ['2025-02-02 20:19', 'anthon', 'name one u didnt give teucer'],
      ['2025-02-02 20:25', 'me', '…the Frost Knight'],
      ['2025-02-02 20:25', 'anthon', 'BRO'],

      ['2025-09-13 16:30', 'anthon', 'teucer has a watch now. this is ur fault. u will get 400 messages a day'],
      ['2025-09-13 16:35', 'me', 'best thing that\'s ever happened to me'],
      ['2025-09-13 16:35', 'anthon', 'ok weirdo'],

      ['2025-11-30 21:15', 'anthon', 'bro is it true u disappeared for 3 days when u were 14 and came back with a sword'],
      ['2025-11-30 21:40', 'me', 'it was a stick'],
      ['2025-11-30 21:40', 'anthon', 'papa said sword'],
      ['2025-11-30 21:41', 'me', 'Papa exaggerates. see: the whale 🐋'],
      ['2025-11-30 21:41', 'anthon', 'lmaooo ok fair'],
      ['2025-11-30 21:50', 'anthon', 'he looked weird when he said it tho'],

      ['2026-01-19 18:02', 'anthon', 'ur ripple has zero pics of u fishing. tonia found ur OTHER account. ajax.fishes. 40 fish. zero faces'],
      ['2026-01-19 18:30', 'me', 'how did she find that. it\'s PRIVATE'],
      ['2026-01-19 18:30', 'anthon', 'tonia finds everything bro'],
      ['2026-01-19 18:31', 'anthon', 'also u named a tuna after a coworker?? who is scaramouche'],
      ['2026-01-19 18:33', 'me', 'a colleague. he\'s small and mean and he hates fish. so 😁'],
      ['2026-01-19 18:33', 'anthon', 'legendary'],

      ['2026-04-14 23:10', 'anthon', 'im top 100 in snezhnaya'],
      ['2026-04-14 23:40', 'me', 'in what'],
      ['2026-04-14 23:40', 'anthon', 'dont worry about it'],
      ['2026-04-14 23:41', 'me', 'it\'s 11pm on a school night'],
      ['2026-04-14 23:41', 'anthon', 'and ur awake too. checkmate'],

      ['2026-07-02 19:00', 'anthon', '', { link: { title: 'FrostByte Pro X — wireless gaming headset (does not sound like a fridge)', site: 'feiyun.market', url: 'https://feiyun.market/item/frostbyte-pro-x' } }],
      ['2026-07-02 19:00', 'anthon', 'no reason'],
      ['2026-07-02 19:31', 'me', 'what\'s wrong with your old headset'],
      ['2026-07-02 19:31', 'anthon', 'it sounds like a fridge'],
      ['2026-07-02 19:31', 'anthon', 'every time someone talks it hums. my whole squad thinks i live in a kitchen'],

      ['2026-09-05 08:40', 'anthon', 'THANK U BRO'],
      ['2026-09-05 08:41', 'anthon', 'its not enough for the headset'],
      ['2026-09-05 08:41', 'anthon', 'jk its exactly enough'],
      ['2026-09-05 08:41', 'anthon', 'jk its not'],
      ['2026-09-05 09:00', 'me', 'happy birthday, carp 😁🐟'],

      ['2026-10-10 18:50', 'anthon', 'teucer got 2047 on reel rush and is now insufferable. he made a crown out of the cereal box'],
      ['2026-10-10 19:02', 'me', 'I\'ll handle it ⚔️😁'],
      ['2026-10-10 19:02', 'anthon', 'pls. he made me bow'],

      ['2026-10-14 21:25', 'anthon', 'bro why does pulcinella care about teucer and tonias vacation. hes the MAYOR. dont mayors have like. potholes'],
      ['2026-10-14 21:39', 'me', 'he\'s a generous man'],
      ['2026-10-14 21:40', 'anthon', 'papa said “generous” in a weird voice'],
      ['2026-10-14 21:40', 'anthon', 'like when he says the ice is “fine”'],

      ['2026-10-16 20:01', 'anthon', 'theyre leaving. i have the house to myself'],
      ['2026-10-16 20:01', 'anthon', 'well. mama and papa are here'],
      ['2026-10-16 20:02', 'anthon', 'but the BATHROOM is mine'],
    ],
  });

  // ── Mama ─────────────────────────────────────────────────────────
  T({
    id: 'mama',
    members: ['mama'],
    pinned: true,
    history: [
      ['2023-04-02 18:30', 'mama', '', { voice: { dur: 64, text: '“My sun, it’s Sunday and you didn’t call, so I’m calling you with my thumb. The ice is breaking up in the bay, you can hear it all night like somebody moving furniture. Teucer thinks it’s a giant. I told him it’s a giant. Your father is fixing the boat and swearing at it in a whisper so the children don’t hear. Eat something. Call me. Not in that order.”' } }],
      ['2023-04-02 19:02', 'me', 'Mama!! sorry!! training ran late. I ate. I promise I ate ❤️'],
      ['2023-04-02 19:03', 'mama', 'What did you eat?'],
      ['2023-04-02 19:05', 'me', '…a sandwich'],
      ['2023-04-02 19:06', 'mama', 'A sandwich is not food. A sandwich is a plate with ideas.'],

      ['2023-11-19 11:40', 'mama', 'You asked for the recipe. Here it is. Write it down, my sun, I won\'t live forever. (I will. But write it down.)'],
      ['2023-11-19 11:41', 'mama', '', { voice: { dur: 88, text: '“Pelmeni. Pork and beef, half and half. Onion grated, not chopped — your father chops it and it’s wrong. Salt, black pepper, a little ice water in the filling, that’s the secret, it keeps them juicy. The dough is flour, one egg, water, salt, rest it under a bowl while you make tea. Roll it thin. Thinner. Pinch the edges twice — gently, like you’re closing a letter. Boil them until they float, then one minute more. Smetana. Dill if you’re fancy. And you eat them hot, with somebody, never alone. That last part is the most important part.”' } }],
      ['2023-11-19 11:58', 'me', 'saved forever ❤️ the last part too'],

      ['2024-03-23 08:10', 'mama', 'Director at nineteen. Are they working you too hard? Do they feed you at the bank? At the toy company. You know what I mean.'],
      ['2024-03-23 08:30', 'me', 'it\'s the same building Mama 😁 they feed me. there\'s a canteen. the soup is terrible'],
      ['2024-03-23 08:31', 'mama', 'I will send soup.'],
      ['2024-03-23 08:31', 'me', 'Mama you can\'t mail soup'],
      ['2024-03-23 08:33', 'mama', 'Watch me.'],

      ['2024-12-09 19:20', 'mama', 'Your father is out on the boat. You know what day it is. Call him tonight, my sun. He won\'t call you. He wants to.'],
      ['2024-12-09 19:31', 'me', 'I\'ll call him tonight ❤️'],

      ['2025-08-11 07:15', 'mama', 'You didn\'t call on Sunday. You always call on Sunday. I sat by the phone like a girl waiting for a dance. Your father read the newspaper upside down for an hour.'],
      ['2025-08-11 07:40', 'me', 'Mama I\'m so sorry. work went late, a big project. I\'ll call tonight, I promise ❤️'],
      ['2025-08-11 07:41', 'mama', 'Big projects, big projects. Don\'t let them make you hard, my sun. You had such soft hands when you were small.'],

      ['2025-10-27 13:02', 'mama', 'My sun, the toy commission came. Ajax, it is too much again. Your father says you should save it. I say you should buy a coat. A real one. With a lining.'],
      ['2025-10-27 13:30', 'me', 'Mama, it\'s for you!! buy the coat for YOU 😁'],
      ['2025-10-27 13:31', 'mama', 'I have a coat. I have had the same coat since 1998. It is a good coat.'],

      ['2026-03-08 22:02', 'mama', 'Liyue is so far, my sun. Who will make you eat over there?'],
      ['2026-03-08 22:10', 'me', 'I\'ll find someone 😁'],
      ['2026-03-08 22:12', 'mama', 'Find someone. I mean it. Find someone who makes you eat. Someone who makes you sit down.'],

      ['2026-05-10 20:44', 'mama', 'Is your xiansheng married?'],
      ['2026-05-10 20:50', 'me', 'MAMA'],
      ['2026-05-10 20:51', 'mama', 'I\'m only asking! He sounds lonely. All those funerals.'],
      ['2026-05-10 20:55', 'me', 'he\'s not married. he lives with like four hundred teacups'],
      ['2026-05-10 20:56', 'mama', 'Hm.'],

      ['2026-07-21 09:20', 'mama', 'Your friend gave you a fishing rod for your birthday.'],
      ['2026-07-21 09:20', 'mama', 'A man doesn\'t give a fishing rod lightly, my sun. Your father gave me a fishing rod. That was 1994.'],
      ['2026-07-21 09:41', 'me', 'MAMA IT\'S NOT LIKE THAT'],
      ['2026-07-21 09:42', 'mama', 'Of course not. Eat something.'],

      ['2026-09-20 12:15', 'mama', '', { img: 'food_borscht' }],
      ['2026-09-20 12:15', 'mama', 'Borscht. Your plate is on the table. I know you\'re not coming. I set it anyway. Don\'t make that face, I can feel you making that face.'],
      ['2026-09-20 12:30', 'me', 'I\'m making the face ❤️ I miss your borscht'],
      ['2026-09-20 12:31', 'mama', 'Then come home and eat it.'],

      ['2026-10-14 21:50', 'mama', 'Mr. Pulcinella is so generous with us, my sun. First your school, now this. You thank him for me. I always forget.'],
      ['2026-10-14 22:04', 'me', 'I will, Mama.'],

      ['2026-10-15 20:11', 'mama', 'I left you a message on the telephone. I hummed the fish song at the end. Don\'t laugh at your mother.'],
      ['2026-10-15 21:30', 'me', 'never ❤️ I listened twice'],

      ['2026-10-16 21:15', 'mama', 'My sun, Mr. Pulcinella\'s office called. A driver will be waiting at arrivals with a sign for the children, and they\'re staying at the Liyue Harbor Grand! Three nights! Isn\'t that kind? You\'ll go to the hotel for breakfast, yes?'],
      ['2026-10-16 22:45', 'mama', 'They\'re through. I\'m driving home. Your father fell asleep before the end of the car park. The road is dark and I\'m talking to you instead of the radio. Eat something tonight, my sun. I love you.'],
    ],
  });

  // ── Papa ─────────────────────────────────────────────────────────
  T({
    id: 'papa',
    members: ['papa'],
    history: [
      ['2024-03-22 20:02', 'papa', 'Heard about the promotion from your mother. Called Pulcinella to thank him. He laughed. I don\'t like it when he laughs. Be careful, son. — Papa'],
      ['2024-03-22 20:30', 'me', 'I\'m always careful Papa 😁'],
      ['2024-03-22 20:41', 'papa', 'You\'ve never been careful once in your life. — Papa'],

      ['2024-12-09 23:10', 'papa', 'Six years. — Papa'],
      ['2024-12-09 23:15', 'me', 'I know, Papa. I\'m okay. ❤️'],

      ['2025-06-30 08:00', 'me', 'happy birthday Papa!!! 🎣 go catch something bigger than me'],
      ['2025-06-30 19:40', 'papa', 'Cod, eleven kilos. Not bigger than you. Close. — Papa'],

      ['2025-08-23 06:12', 'papa', 'Saw the old seal on the rocks at the point. Same one as when you were small. One eye now. Still fat. Still there. Some things last. — Papa'],
      ['2025-08-23 07:01', 'me', 'say hi to him for me 🐟'],

      ['2025-12-09 22:47', 'papa', 'Seven years today.'],
      ['2025-12-09 22:52', 'papa', 'I think about the cave. I think about what I did after. You came back from the sea smiling like that, with your hands cut up, and I was afraid. I sent you to Pulcinella because I didn\'t know what else to do with my own son. Your mother says I should say this out loud. I\'m writing it instead. I\'m sorry, son. — Papa'],
      ['2025-12-09 23:05', 'me', 'Papa. you don\'t have to be sorry'],
      ['2025-12-09 23:06', 'me', 'you sent me somewhere I could learn. I\'m good at it. I\'m the best at it 😁'],
      ['2025-12-09 23:20', 'papa', 'That\'s what frightens me. — Papa'],
      ['2025-12-09 23:31', 'me', 'I love you Papa'],
      ['2025-12-10 05:40', 'papa', 'I know. — Papa'],

      ['2026-03-08 21:50', 'papa', 'Liyue. Warm water. Strangers. Keep your back to the wall. — Papa'],
      ['2026-03-08 22:00', 'me', 'always ⚔️'],

      ['2026-07-20 06:30', 'papa', 'Twenty-two. When I was twenty-two I had a boat, a wife and no sense. You have more sense than me. Happy birthday. — Papa'],
      ['2026-07-20 07:05', 'me', 'thank you Papa ❤️ the boat\'s still the best one in Morepesok'],

      ['2026-10-14 21:45', 'papa', 'Pulcinella booked the children\'s trip. I did not ask him to. I don\'t like owing that man twice. Look after them, son. — Papa'],
      ['2026-10-14 22:10', 'me', 'I will, Papa. I promise.'],
    ],
  });
})();
