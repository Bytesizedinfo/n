/* Endings — all 24. Rules, priorities and texts per docs/STORY.md "Endings". Owner: S4 (core story).

   JC.storyHelpers = { kidsSafe, osialStopped, recalled, weekend, endingRule } — computed outcomes, shared with scenes:
     kidsSafe(s)      the kids are out of the Fatui's hands (pickup + lodging, or Yelan's protection, or a rescue)
     osialStopped(s)  Project Osial did not happen (no code sent, and something stopped it)
     recalled(s)      the Tsaritsa summons Childe north on Monday's 18:00 ferry (unless he quit, or Zhongli fixed Osial)
     weekend(s)       the weekend really happened (the deal was not refused: not the short path)
     endingRule(id,s) does finale ending `id` qualify right now

   Mid-story endings (fired with { ending: id }): honest (also the finale fallback), caught_scara, caught_fatui,
   wangsheng, rematch, paimon, facetime, abyss. Finale endings are picked by { endings: 'finale' } (scenes/finale.js).
   Texts are written to hold for every path that can reach them. `jc` continues the heading
   “When Childe got his phone back…” (JC.world.brand.epilogue). */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const E = (def) => JC.story.ending(Object.assign({ art: 'end_' + def.id }, def));
  const F = (s) => s.flags;

  // ── Computed helpers (STORY.md) ────────────────────────────────────
  /** ((safe pickup ∧ safe lodging) ∨ yelan_protects_kids ∨ kids_rescued) ∧ ¬(fatui_pickup ∧ ¬kids_rescued) */
  function kidsSafe(s) {
    const f = s.flags;
    if (f.fatui_pickup && !f.kids_rescued) return false;
    if (f.kids_rescued || f.yelan_protects_kids) return true;
    // a Harbor Ride to arrivals only counts when Tonia was told to wait for it at the desk
    const pickup = !!(f.zl_pickup || f.lumine_pickup || f.ekat_pickup || (f.ride_kids && (f.tonia_desk || f.told_tonia)));
    const badBed = !!(f.kids_grand || f.kids_apartment);
    return pickup && !badBed;
  }
  /** ¬osial_sent ∧ (leaked_yelan ∨ leaked_ning ∨ ops_sabotage ∨ zl_amended ∨ card_frozen); an explicit
      `osial_stopped` flag from the Osial arc (e.g. “Ask the founder.”) counts too */
  function osialStopped(s) {
    const f = s.flags;
    if (f.osial_sent) return false;
    return !!(f.osial_stopped || f.leaked_yelan || f.leaked_ning || f.ops_sabotage || f.zl_amended || f.card_frozen);
  }
  /** ¬defected ∧ ¬zl_amended */
  function recalled(s) {
    return !s.flags.defected && !s.flags.zl_amended;
  }
  /** the player kept Childe's deal (or at least never refused it) */
  function weekend(s) {
    return !s.flags.deal_refused;
  }
  JC.storyHelpers = { kidsSafe, osialStopped, recalled, weekend };

  // ── Finale conditions (named so `true` can compose them) ──────────────
  const aff = (s, id) => (s.aff && s.aff[id]) || 0;
  const sus = (s, id) => (s.sus && s.sus[id]) || 0;
  const C = {
    contract: (s) => weekend(s) && !!F(s).memo_zl_sent && aff(s, 'zl') >= 6 && !!F(s).zl_contract && !F(s).zl_broken && osialStopped(s) && !recalled(s),
    northbound: (s) => weekend(s) && !!F(s).memo_zl_sent && !!F(s).told_childe_morax && recalled(s) && aff(s, 'zl') >= 5 && !F(s).zl_broken,
    defector: (s) => weekend(s) && !!((F(s).leaked_yelan && F(s).yelan_protects_childe) || F(s).leaked_ning) && !!F(s).card_frozen && kidsSafe(s) && !!F(s).ekat_warned,
    teucer: (s) => weekend(s) && kidsSafe(s) && !!F(s).gift_teucer && !F(s).told_tonia && !!(F(s).factory_zl || F(s).factory_bank) && sus(s, 'teucer') < 4,
    comrades: (s) => weekend(s) && !!F(s).ops_sabotage && osialStopped(s) && (F(s).ops_morale || 0) >= 3,
    fulfilled: (s) => weekend(s) && !!F(s).told_childe_morax && !F(s).memo_zl_sent && !!F(s).zl_confessed && !F(s).zl_broken,
    tonia: (s) => weekend(s) && !!F(s).told_tonia && kidsSafe(s) && sus(s, 'tonia') < 6,
    twins: (s) => weekend(s) && !!F(s).gave_abyss_notes && !!F(s).clue_abyss && !!(F(s).lumine_pickup || F(s).lumine_guard),
    vigil: (s) => weekend(s) && !!F(s).leaked_yelan && !F(s).yelan_protects_childe && osialStopped(s),
    fishfry: (s) => weekend(s) && !!F(s).beat_teucer && (F(s).ops_morale || 0) >= 2 && !!F(s).lullaby_sent,
    unspoken: (s) => weekend(s) && !!F(s).memo_zl_heard && !F(s).memo_zl_sent && aff(s, 'zl') >= 3,
    godofcontracts: (s) => weekend(s) && !!(F(s).zl_broken || F(s).morax_sold || (F(s).zl_contract && F(s).osial_sent)),
    scapegoat: (s) => weekend(s) && !osialStopped(s) && !F(s).osial_sent,
    // the short path can end here too: the kids were left to the driver before the deal was refused
    leverage: (s) => !!F(s).fatui_pickup && !F(s).kids_rescued,
    osial: (s) => weekend(s) && !!F(s).osial_sent,
  };
  C.true = (s) => (C.teucer(s) || C.tonia(s)) && (C.contract(s) || C.northbound(s)) && (C.defector(s) || C.comrades(s)) &&
    s.susTotal() < 12 && !!F(s).told_truth;
  JC.storyHelpers.endingRule = (id, s) => {
    if (id === 'honest') return true;
    try { return !!(C[id] && C[id](s || JC.story.api())); } catch (e) { return false; }
  };

  // ════════════════════════════════════════════════════════════════
  // Mid-story endings
  // ════════════════════════════════════════════════════════════════

  E({
    id: 'honest', n: 1, title: 'Return to Sender', tag: 'Truth',
    finale: true, priority: 17, arcs: ['core'], // no `when`: the fallback when nothing else qualifies
    hint: 'Sometimes the bravest thing you can type is the truth. (Or you could just report the phone lost.)',
    text: [
      'However it happened (a confession typed too fast, a lost-item report to Harbor Ride, a stranger’s voice on a funeral parlor’s landline), the phone went home, and you stopped being Childe.',
      'It was strange how quickly the weight came off. For a while you had been an older brother, a Harbinger, a man who paid for every dinner and never lost a fishing argument. Now you were just somebody from Chihu Rock, Lane 3, who had found a phone on a pier and hadn’t been able to leave it ringing.',
      'Nobody gave you a medal. Somebody did give you a Wangsheng VIP card, ten percent off, valid for one (1) funeral, “for honesty, which is rarer than you’d think in our line of work.” You keep it in your wallet. You hope you never use it.',
      'You walked home the long way, along the harbor. The cold tea was gone from Pier 7. So was the rod. Someone had come back for them.',
      'Not every story needs a twist. Some of them only need someone to say, plainly, this isn’t mine, and give it back.',
    ],
    jc: [
      '…the first thing he did was scroll. Up, and up, and up, through however much of his life you had lived on his behalf, his lips moving silently like a man reading a letter from home.',
      'He stopped at Teucer’s messages for a long time. He stopped at Xiansheng’s for longer.',
      'Then he wrote one line to every chat at once, which is the most Childe thing anyone has ever done: “it’s me!! the real one!! did everyone miss me?? 😁” Forty-one replies came in under a minute. Thirty-eight were some version of WHO WAS THAT, THEN. Two were Paimon, asking about hotpot. The last was from Zhongli, and it said only: “Welcome back.”',
      'He never found out your name. He told the story for years anyway, at dinners he always paid for: the stranger on Pier 7 who found his phone and, in the end, simply gave it back. “Honest,” he’d say, the way other people say the name of a rare fish.',
    ],
  });

  E({
    id: 'caught_scara', n: 2, title: 'The Balladeer’s Gossip', tag: 'Caught',
    hint: 'One Harbinger reads every message twice, and remembers every fish.',
    text: [
      'Scaramouche didn’t send a threat. He sent a screenshot.',
      'It landed in “Harbingers 🧊” at an hour when decent people sleep: your last three messages to him, arranged beside three real ones from Childe’s past, every difference circled in purple. “Exhibit A: punctuation. Exhibit B: no fish. Exhibit C: he has never, in his entire miserable life, forgotten what he named that tuna.”',
      '“Our Eleventh,” he wrote underneath, “has been replaced by someone with manners. I’d say congratulations, but I don’t like either of you.”',
      'Columbina sang a little song about it. Pantalone froze the card “as a precaution”. Capitano reacted with a single 👍, which nobody could interpret. And La Signora, who had been waiting all weekend for exactly this kind of mistake, read the thread twice and did not reply at all, which was worse than anything she could have said.',
      'Within the hour, Northland IT wiped the phone remotely. The lock screen said only: “This device is the property of Northland Bank Group.” You left it on the bench at Pier 7, where you’d found it, and walked away without looking back. Somewhere, distantly, you were sure someone was laughing.',
    ],
    jc: [
      '…it was a brick. Northland IT had wiped everything: the Ledger, the fishing log, four hundred photos of fish, a lullaby he had recorded for his little brother in his best terrible voice.',
      'He carried it into Scaramouche’s office in person and set it on the desk. “You did this.” “You did this,” said Scaramouche, without looking up. “You left your phone on a pier. I merely noticed. Noticing is a public service.”',
      'Childe broke his door. Scaramouche billed him for it. The invoice is still pinned to the Liyue Branch fridge, next to a photo of a very large bluefin tuna named after the man who sent it.',
    ],
  });

  E({
    id: 'caught_fatui', n: 3, title: 'Fatui Hospitality', tag: 'Dark',
    hint: 'Let too many people wonder about him. Or tell the whole harbor exactly where you are.',
    text: [
      'They were very polite about it. That was the worst part.',
      'They found you the way the Fatui find everything: by following the money, the messages and the little blue dot. Two of them, in long grey coats. One smiled. The other didn’t need to. “Northland Bank,” said the one who smiled. “You have something of ours. Would you like to come and talk about it over tea? It’s very good tea. We insist.”',
      'The tea was very good. The room had no windows. Someone asked you questions in a calm voice for a long time: what you had read, whom you had told, what you had sent, and whether you happened to know where the Eleventh was sleeping. You told them the truth, mostly because they already seemed to know it.',
      'In the end they let you go, with a non-disclosure agreement forty pages long and a complimentary Northland Bank tote bag. You still have the tote. You can’t bring yourself to use it.',
      'You never saw the phone again. The last thing on its screen, as they slid it out of your hand, was a message from Teucer: a row of fish, and the word “BROTHER??”',
    ],
    jc: [
      '…it came in a sealed evidence bag, with a note in La Signora’s handwriting: “Lost property. Try harder.”',
      'Every message the stranger had sent was printed and filed under his name, in a folder thick enough to stop a door. Signora read the best ones aloud at the Monday briefing. Scaramouche asked for copies.',
      'Childe spent a week being asked, very politely, why he hadn’t simply stayed beside his phone. He said, through his teeth, that he had been busy not being kidnapped. Nobody found this as funny as he did.',
      'He went looking for you afterward. Not to hurt you: to apologise, which he is terrible at. He never found you. The Fatui had made sure of that, too.',
    ],
  });

  E({
    id: 'wangsheng', n: 4, title: 'Wangsheng Is Hiring', tag: 'Comedy',
    hint: 'The funeral director always knows. Unless somebody has already vouched for you.',
    text: [
      'Hu Tao worked it out the way she works out everything: instantly, gleefully, and in verse.',
      '“a stranger with a borrowed tongue / sang his songs but sang them wrong / now the fish man’s in a box / and YOU’RE the one who holds the… locks? phone. holds the phone. ok that one needs work 👻”',
      'She didn’t call the Millelith. She didn’t call the Fatui. She called you, and asked, in the voice of someone ordering noodles, whether you had ever considered a career in the funeral industry. “You can talk to people who aren’t there. You can be someone you’re not with a straight face. You’re a natural! Dental plan! Spooky hours!”',
      'You went to the parlor to give the phone back. You left with a uniform, a laminated badge that said TRAINEE (LIVING), and a mop for the coffin showroom, where you were told under no circumstances to open number four.',
      'You opened number four. Inside was a very tall, slightly damp young man eating noodles out of a carton, who looked at you, then at his own phone in your hand, and said: “Oh. It’s you.”',
    ],
    jc: [
      '…it was handed to him through the lid of Coffin 4 by Hu Tao, who had tied a little black ribbon around it “for the ceremony”.',
      'He spent the rest of the week trying to poach Wangsheng’s new trainee for the Northland Bank. Hu Tao countered with a better offer. He countered with a figure that made Ekaterina put her head down on her desk. Hu Tao countered with “a coffin of your choosing, at cost, for life.”',
      'You stayed at Wangsheng. Of course you did. Some nights Zhongli brings tea to the night shift, and on Thursdays a ginger Harbinger turns up with dinner for everyone and complains about the bill the whole time he’s paying it.',
    ],
  });

  E({
    id: 'rematch', n: 5, title: 'Third-Round Knockout', tag: 'Comedy',
    hint: 'A captain is owed a rematch. Show up for it.',
    text: [
      'You followed the map to Crux Pier because a captain had been promised a rematch, and somewhere on the way you forgot the small detail that you have never thrown a punch in your life.',
      'The Alcor was lit like a festival. The whole crew had turned out to watch, with buckets of popcorn and a betting board chalked on the mast. Kazuha was playing something on a leaf. Beidou stood in the middle of the deck with her sleeves rolled up and her grin wide, and then she saw you, and the grin went sideways.',
      '“You’re not the kid,” she said. “Well. You’re a kid. You’re not MY kid. Where’s the ginger one?” The crew booed. You don’t know what came over you: the lanterns, maybe, or the weekend. You said, “I’m his stand-in.” And you put up your fists.',
      'It lasted three rounds, which the crew still talks about. The first you spent ducking. The second, dodging, mostly by falling over. In the third, Beidou tapped you on the forehead with one finger, very gently, and the deck rose up to meet you like an old friend.',
      'You woke in a hammock with an ice pack, a bowl of fish stew, and a new nickname you are not allowed to repeat. The phone was gone. Beidou had returned it to its owner “by ship’s courier, with a note”.',
    ],
    jc: [
      '…there was a note from Beidou taped over the sticker on the back: “Your stand-in lasted three rounds. You lasted two, last time. Think about it.”',
      'He thought about it. He thought about it for an entire day. Then he marched down to Crux Pier and demanded a rematch with the stand-in, specifically, “for honor”.',
      'Beidou refused, on the grounds that it would be “like watching a shark fight a very brave sandwich”. Childe bought the whole crew dinner at Third-Round Knockout instead, and in the photo pinned above the counter there you are, ice pack and all, between the captain and the Harbinger, the three of you laughing.',
    ],
  });

  E({
    id: 'paimon', n: 6, title: 'Emergency Food', tag: 'Comedy',
    hint: 'How much can Paimon eat? There is only one way to find out.',
    text: [
      'It started with one hotpot set for four. It ended with Wanmin Go naming a dish after Paimon.',
      'Somewhere past ℳ20,000 (around the third order of everything on the menu, delivered to an address Paimon described as “wherever Paimon is right now”), the Northland Bank fraud system had a small electronic breakdown. Pantalone himself wrote, which he has done four times in his career: “Dear Tartaglia. Who, or what, is Emergency Food?”',
      'Then everyone wrote. Ekaterina, in a panic. Signora, in a single cold line. The bank’s automated service, which by then had learned to sound disappointed. And through it all Paimon kept sending photos of empty plates with one word underneath each: “MORE??”',
      'Lumine was the one who worked it out. “childe would never let her order that much,” she wrote. “he’d let her order exactly that much and then complain about it for a week. you didn’t complain once. who are you.”',
      'You told her. She came to collect the phone herself, with Paimon drifting behind her, full for the first time in recorded history, fast asleep on a raft of takeaway boxes.',
    ],
    jc: [
      '…there were forty-three receipts waiting for him, and a bank statement so long it scrolled like the end credits of a film.',
      'He read every line. Then he laughed until Hu Tao came to check he wasn’t dying, because ℳ20,000 of noodles is objectively the funniest thing that has ever happened to the Northland Bank Group, and Pantalone’s message was going on his wall.',
      'Paimon sent him a thank-you card. It was a photograph of herself, asleep in a bowl. He framed it next to the bluefin.',
    ],
  });

  E({
    id: 'facetime', n: 7, title: 'Stranger on the Screen', tag: 'Dark-comic',
    hint: 'Some calls should stay voice-only.',
    text: [
      'The FaceTime connected. For one second you were looking at the most excited face in Liyue: gap-toothed, beanie askew, Sir Fang the ice wolf pressed right up against the camera for a proper introduction.',
      'Then Teucer saw you.',
      'He didn’t scream. That’s what you remember. He just went very still, the way kids do when the world does something it isn’t supposed to, and said in a small voice: “You’re not my brother.” And then, smaller: “Where’s my brother?”',
      'Tonia took the phone off him so fast the picture smeared. Her face filled the screen: fifteen, furious, and terrified underneath. “Who are you. Where is Ajax. I’m screenshotting you. I’m calling the police. I’m calling MAMA.” She did all three, in that order, while you were still trying to explain.',
      'By lunchtime there were Millelith officers, Fatui agents and one very worried funeral director looking for the stranger in the screenshot. Teucer drew a picture of you for the police sketch artist. Everyone agreed it was very accurate. He gave you horns.',
    ],
    jc: [
      '…he didn’t look at it. He went straight to his brother, who flung himself at his legs so hard they both fell over.',
      '“There was a STRANGER in your PHONE,” Teucer told him, very seriously. “With a FACE.” Childe said yes, he knew, and that Teucer had been very brave to notice. Tonia said nothing at all, which meant she was going to say a great deal later.',
      'The screenshot is still on Tonia’s phone. She shows it to him whenever he says he’s “just at the toy factory”. It works every time.',
    ],
  });

  E({
    id: 'abyss', n: 8, title: 'Where the Abyss Looks Back', tag: 'Secret',
    hint: 'Someone writes at three in the morning. Answer her. Then go where she points.',
    text: [
      'You went to the Chasm because a woman with no number told you to, at three in the morning, in very few words. Even now you can’t explain it, except that the phone hummed in your hand like a held breath, and the map on it pointed down.',
      'The old mine road was empty. The Millelith barrier had been bent back by something with no interest in barriers. At the bottom of the shaft the air changed: colder, older, full of a sound like the sea heard through a wall.',
      'She was waiting at the edge of the light. Tall, pale-haired, a sword at her hip that reflected nothing. She looked at you for a long time. “You are not Ajax,” said Skirk. “Ajax would have come faster.”',
      'She didn’t hurt you. She didn’t need to. She told you what the stone forest was holding down, and what had been stirring under it all weekend, and what a boy of fourteen had seen down here one winter that made him love fighting more than sleep. Then she held out her hand for the phone, and you gave it to her, because some people you simply obey.',
      'You walked back up into a grey dawn. You don’t remember the climb. You remember the sea, very still, and the feeling that something at the bottom of the world had looked at you, briefly, and decided you were not worth keeping.',
    ],
    jc: [
      '…it was Skirk who gave it to him. She walked into Wangsheng without being told where to look, stood over Coffin 4, and said: “Ajax.”',
      'He sat up so fast he hit his head on the lid. He had not seen her in eight years. She handed him the phone, and a small cold stone from the bottom of the Chasm, and said only: “Your stranger was braver than you were at that age. Be ashamed.”',
      'He kept the stone. He doesn’t talk about that night. But sometimes he walks out to the end of Pier 7 alone and looks toward Guyun, and if you happen to be there too, he nods at you like a fellow soldier, and neither of you says a word.',
    ],
  });

  // ════════════════════════════════════════════════════════════════
  // Finale endings (Monday 17:30, Pier 7; or the short path at Saturday dawn)
  // ════════════════════════════════════════════════════════════════

  E({
    id: 'contract', n: 9, title: 'A Contract Renewed', tag: 'Zhongli',
    finale: true, priority: 2, arcs: ['zl', 'osial', 'core'], when: C.contract,
    hint: 'Send what he begged himself not to send. Sign Zhongli’s contract and keep it. Keep the sea asleep, and keep Childe in Liyue.',
    text: [
      'Zhongli came to Pier 7 at half past five, which you had not expected, and he was carrying a wallet, which nobody had expected, least of all (judging by his expression) Zhongli.',
      'He had heard the memo. Of course he had: you had sent it, a stranger’s thumb on another man’s courage, and he had listened to it (he told you this plainly, the way he says everything) eleven times, on Yujing Terrace, with a cup of tea going cold in his hand. “He called it the stupidest sentence he had ever said,” Zhongli observed. “He was mistaken. I have heard a great many sentences.”',
      'When Childe came down the pier, damp at the knees and grinning as if the whole weekend had been his idea, Zhongli did not let him speak. He took a folded paper from his coat. A contract, handwritten, short, as good contracts are. Dinner, weekly, for an unspecified duration. The party of the first part would pay. Every time.',
      'Childe read it twice. Then he laughed, and his voice cracked in the middle, and he said, “Xiansheng, you don’t even HAVE—” and Zhongli opened the wallet. Inside was Mora, a great deal of it, and one Glaze Lily, pressed flat.',
      'You had kept your end of a contract signed on a Saturday morning with a man who keeps every word. Neither of them noticed you leave. That was, you think, the point.',
    ],
    jc: [
      '…he did not look at it for a long time. He was busy. He was having dinner. (He did not pay.)',
      'Much later, at home, he found the voice memo in the thread with a small grey “Read” under it, and he put his face in his hands and made a sound Ekaterina described the next morning as “a kettle, but sad, but happy”.',
      'Liyue kept him. Snezhnaya, for reasons never fully explained in any memo, let it. Every Thursday there is a table for two by the window at Liuli Pavilion, and when the bill arrives on its little lacquered tray, a man who never used to carry money reaches for it first, and Childe complains about it, loudly and happily, for the rest of the night.',
    ],
  });

  E({
    id: 'northbound', n: 10, title: 'Northbound', tag: 'Zhongli',
    finale: true, priority: 3, arcs: ['zl', 'osial', 'core'], when: C.northbound,
    hint: 'Send the memo. Tell Childe who Zhongli really is. Then let the north call him home.',
    text: [
      'The summons came at noon, in the Tsaritsa’s own cipher: the Eleventh Harbinger would board the 18:00 ferry north and explain Project Osial in person. There was no appeal. There never is.',
      'So the hand-back on Pier 7 was quick. Childe took his phone, thumbed through it, stopped at one sent voice memo and went the colour of the lanterns. Then he looked up, past you, at the man walking down the pier in a long dark coat with a small travelling case, the kind nobody has made for a hundred years.',
      '“Xiansheng,” Childe said. “You can’t. It’s Snezhnaya. It’s minus fourteen. You hate the cold. You don’t have a ticket.” “I have retired,” said Zhongli, who had attended his own funeral the day before and found the eulogy adequate. “I find I have a great deal of time. And I am told the tea in Morepesok is dreadful. Someone ought to do something about it.”',
      'You had told Childe who Zhongli was that morning, on a funeral parlor’s landline. He had gone so quiet you thought the line had dropped. Now he only laughed, the cracked, astonished laugh of a man who has spent six months falling for a god without being told, and picked up the travelling case himself.',
      'The ferry left at six. You stood at the end of the pier and watched it go: two figures at the stern rail, one tall and still, one restless and pointing at the sea, already arguing about fish.',
    ],
    jc: [
      '…the ferry was somewhere past Guyun, and he was trying to explain Reel Rush to a six-thousand-year-old man who kept asking why the fish were so angry.',
      'He played the memo once, on deck, one earbud each. Zhongli listened with his eyes closed. At the end, at “Ajax, do not send this,” he said, “You did, though,” and Childe said, “I DIDN’T!! A STRANGER DID!!” and Zhongli said, “Mm. Then I owe the stranger a great deal.”',
      'What was said in Zapolyarny that week is sealed. But the Eleventh kept his title, and that winter 4 Pristan Lane acquired a very tall, very polite house guest who never carried money, who drank Mama’s terrible tea without comment, and who listened to every one of Teucer’s stories as if it were history. Which, he said, it was.',
    ],
  });

  E({
    id: 'defector', n: 11, title: 'The Eleventh Resigns', tag: 'Fatui',
    finale: true, priority: 4, arcs: ['osial', 'fam', 'core'], when: C.defector,
    hint: 'Put the evidence in hands that will protect him. Freeze the money. Warn Ekaterina. Keep the kids safe.',
    text: [
      'Childe resigned from the Northland Bank Group at 17:42 on a Monday, standing on Pier 7, by text, to “Harbingers 🧊”, where it sat between Columbina’s song lyrics and Capitano’s thumbs-up. It said: “no. — A.” It has since become something of a legend.',
      'He could, because of you. The Osial protocol was in the hands of people in Liyue who could not be bought. The card that would have poured three million Mora into the sea was frozen solid. Ekaterina had been warned in time. His brother and sister were somewhere the Fatui couldn’t reach, with Sir Fang buckled into a seat of his own.',
      '“They’ll come after you,” you said. “Probably,” he said cheerfully, wringing seawater out of his scarf. “I’ve been fighting since I was fourteen. I’d just like to choose the fights myself for once.” Then he looked at you sideways. “You froze my card. Do you know how many dinners that card has paid for?” “Forty-one,” you said. He stared at you. “Heh,” he said. “You really were me for a while, huh.”',
      'The Qixing gave him a temporary residence permit and a very long questionnaire. Under “previous employment” he wrote: toys.',
    ],
    jc: [
      '…there were two hundred and six messages from the Fatui on it, in escalating order of politeness, ending with one from Pantalone that just said: “Dear Tartaglia. Your pension.”',
      'He blocked them one by one, humming. Then he called home, on his own phone, in his own voice, and told his mother the truth for the first time in eight years: there was no toy factory. There had never been a toy factory. He was so sorry about the toy factory.',
      'There was a long silence on the line from Morepesok. Then Mama said, “My sun. We knew. Toys don’t pay that well.” In the background, Teucer was shouting that he still believed in the elves.',
      'He lives in Liyue now, and runs a fishing school on Pier 7 for children too restless for ordinary school. The sign over it is in Teucer’s handwriting. It says WORLD’S BEST BIG BROTHER, and underneath, smaller: FISHING LESSONS. NO REFUNDS.',
    ],
  });

  E({
    id: 'teucer', n: 12, title: 'The Toy Factory', tag: 'Family',
    finale: true, priority: 5, arcs: ['fam', 'zl', 'ops'], when: C.teucer,
    hint: 'Make the toy factory real: a tour, a present, and a big brother who never slips.',
    text: [
      'Teucer flew home on Monday at 13:10 with a window seat, a brand-new toy, and the unshakable conviction that his big brother runs the greatest toy factory in the world.',
      'You made sure of it. Somewhere between Friday night and Monday morning, the lie Childe had kept alive for five years with nothing but bank transfers and exclamation marks became real. There was a factory tour. There were elves, or something very like elves, depending on whom you ask. There was a very serious factory manager who answered every question with historical precision. There was a button Teucer was allowed to press that made a machine go WHOOSH. It did nothing else. It didn’t need to.',
      'Tonia watched all of it with narrowed eyes and said nothing, which, from Tonia, is a kind of applause.',
      'From the gate he sent one last voice note, fifty-one seconds long, mostly the word BROTHER at different volumes, ending with: “tell the elves thank you.”',
      'You listened to it at Pier 7 at sunset, just before you handed the phone back. You didn’t cry. The sea was simply very bright.',
    ],
    jc: [
      '…the first thing he played was that voice note. Then he played it again. Then he turned toward the water and said, to nobody in particular, “I owe the elves a raise.”',
      'He still sends money home every month, marked “toy commission”. But now there is also a parcel: a new Glacier Guardian, a scarf for Sir Fang, once an entire Frost Fortress, and a card signed “from everyone at the factory”. The signatures are in thirty different handwritings. One of them, in beautiful old-fashioned brushwork, just says: Manager.',
      'Teucer is nine now. He has started asking difficult questions. Childe has started answering some of them. Not the one about the elves. Never that one.',
    ],
  });

  E({
    id: 'comrades', n: 13, title: 'Comrade Tartaglia', tag: 'Friends',
    finale: true, priority: 6, arcs: ['ops', 'osial', 'zl'], when: C.comrades,
    hint: 'The Liyue Branch has families too. Earn their loyalty, then let them have a better idea.',
    text: [
      'Project Osial died on Sunday night, killed by the six worst employees in the history of the Northland Bank Group.',
      'Nobody has ever fully explained what the Liyue Branch did out at Guyun. Lyuba’s report says “froze it (lovingly)”. Kolya’s says he got lost, found a big machine and sat on it. Pyotr’s is mostly apologies. Big Boris’s is a drawing. Anya’s says “ask Valentina”. Valentina’s is a single photograph of her own reflection, which nobody in Zapolyarny has been able to look at for long.',
      'They did it because, all weekend, someone holding their director’s phone had treated them like people instead of grunts: answered when they were scared, asked about the fish, remembered that some of them had families here. When it mattered, they remembered it back.',
      'On Monday evening, all six of them came down to Pier 7 in uniform and stood in a row and saluted. Childe, who had just been handed his phone and had no idea what had happened, saluted back out of reflex.',
      '“Comrade Tartaglia,” said Big Boris, and burst into tears. “Ignore him, he does this,” said Anya. “We might all be fired,” said Pyotr. “Sir,” said Lyuba. “The fish are fine.”',
    ],
    jc: [
      '…he read the Liyue Branch group chat from the bottom up, and had to sit down on the pier.',
      'Zapolyarny formally reprimanded the Liyue Branch for “collective insubordination, resonator damage, and an aquarium”. Childe signed the reprimand himself, had it framed, then took the whole night shift to Wanmin for pelmeni, paid, made a speech, and made Boris cry again.',
      'They call him Comrade now, all of them, even in official memos. Signora finds it unbearable. That, Childe says, is the best part.',
    ],
  });

  E({
    id: 'fulfilled', n: 14, title: 'Contract Fulfilled', tag: 'Zhongli',
    finale: true, priority: 7, arcs: ['zl', 'core'], when: C.fulfilled,
    hint: 'Learn who Zhongli is from Zhongli himself, and carry that truth to Childe. Leave the memo where it is.',
    text: [
      'Rex Lapis died on the first of October. His funeral was on Sunday. On Monday morning, on the landline of the parlor that had buried him, you told his best friend that he was alive and well and had been eating dinner on Childe’s tab for six months.',
      'Childe didn’t believe you. Then he did. Then he went silent for nine whole seconds, the longest silence in his recorded history, and said, very quietly: “The cranes. He always knew what the cranes were doing. He knew the name of every rock.” And then, much louder: “He let me pay for EVERYTHING.”',
      'That evening Zhongli came to Pier 7 to say goodbye to a phone. He thanked you formally, with a small bow from a very old world, for carrying a secret the length of a weekend and setting it down in the right place. “It is a strange relief,” he said, “to be known.”',
      'Then Childe came down the pier, and stopped a few steps away, and looked at Zhongli the way a sailor looks at a coastline he has passed a hundred times and never mapped. “Six thousand years,” he said. “Nearer five thousand nine hundred,” said Zhongli. “I was rounding.”',
      'Neither of them mentioned the voice memo. You had left it where it was, unsent, in the folder marked don’t. Some things a person should say for himself.',
    ],
    jc: [
      '…he made Zhongli sit on the bench at the end of the pier and tell him everything, from the beginning, and Zhongli, who has six thousand years of beginning, started with a long tangent about the geology of Guyun.',
      'They stayed until the lanterns went out. Childe asked about the wars. Zhongli asked about the fishing. At some point Childe said, “You should have told me,” and Zhongli said, “Yes,” and that was the whole argument, and it was enough.',
      'He still hasn’t sent the memo. He has deleted it four times. It keeps coming back, because, Ekaterina suspects, he keeps restoring it from Recently Deleted. “One day,” he says. Zhongli, who has all the time in the world, says only, “I find I am very patient.”',
    ],
  });

  E({
    id: 'tonia', n: 15, title: 'What Big Brother Does', tag: 'Family',
    finale: true, priority: 8, arcs: ['fam', 'friends'], when: C.tonia,
    hint: 'Answer Tonia’s question about the letter honestly. Then keep both kids out of the Fatui’s hands.',
    text: [
      'Tonia had found the letter in the kitchen drawer: Northland Bank, Zapolyarny, addressed in heavy ink to “Harbinger Tartaglia”. She had been carrying the question around ever since, like a stone in her shoe. This weekend, somebody on her brother’s phone finally answered it honestly.',
      'She didn’t cry. She is fifteen and from Morepesok; she reorganised. Within a day she had a plan for keeping Teucer away from anything Fatui-shaped, a list of every adult in Liyue who could be trusted (it was short), and one rule: “Teucer keeps the toy factory. That’s his. We don’t touch it.”',
      'All weekend she was your accomplice. She steered Teucer past the bank. She answered Mama’s questions in a voice so calm it was practically a weapon. Whenever anyone in a long grey coat came within twenty metres of her little brother, she suddenly needed to show him a very interesting bird.',
      'On Monday, from the queue at the gate, she texted the phone one last time: “I know you’re not him. I’ve known since Saturday. You don’t use enough exclamation marks.” And then: “Thank you for telling me the truth. He never would have. Tell him I said that. Tell him nu, bratik, it’s my turn now.”',
      'You read it on Pier 7 with the sun going down. Then you gave the phone back to the man it belonged to, and watched him read it too.',
    ],
    jc: [
      '…he read Tonia’s message on the pier and laughed, and then stopped laughing, and said “she said nu, bratik” in a voice that wobbled exactly once.',
      'He called her that night. They talked for three hours; mostly she talked. She has a list. He is not allowed to lie to her any more, about anything, ever, starting now. And she gets to decide what Teucer knows and when, “because you’ll mess it up, Ajax, you always say too much or nothing.”',
      'He agreed to everything. It’s the first contract he has ever signed without reading it. He says it’s the best one he has.',
    ],
  });

  E({
    id: 'twins', n: 16, title: 'Brother, Sister', tag: 'Friends',
    finale: true, priority: 9, arcs: ['friends', 'fam'], when: C.twins,
    hint: 'Lumine is looking for her brother. Give her the Abyss and the coordinates, and let her help with yours.',
    text: [
      'Lumine had been looking for her brother for a long time. She didn’t talk about it much (that was Paimon’s job), but every message she had ever sent Childe was, underneath, the same question: do you know where he is.',
      'This weekend, somebody on Childe’s phone finally answered it. The Abyss notes, in his cramped handwriting from the year he came back from the sea; and coordinates scrawled on a photograph of a map, from a woman who signs her messages with one word. Put together, they pointed down. Into the Chasm. To a door Lumine had walked past twice.',
      'She paid you back the only way she knows how: by showing up. She stood between Childe’s brother and sister and the Fatui without being asked twice, with Paimon providing commentary and snacks.',
      'On Monday evening she came to Pier 7 for the hand-back with her sword on her back and her pack already on. “going down tonight,” she said. “thought you should know. you helped.” Paimon hugged your head, which is what she does instead of crying.',
      '“Tell him,” Lumine said, nodding at the man walking toward you down the pier, “his notes were good. And that I know what it’s like. Being the one who goes looking.” Then she was gone, and you understood that the whole weekend had been about brothers and sisters, and that some of them were still lost, and some of them were about to be found.',
    ],
    jc: [
      '…the newest message was from Lumine, sent from somewhere with no signal and delivered hours late: “found a door. he’s been here. thank you, childe. (both of you.)”',
      'He stood very still on the pier. Then he dug out the rest of his notes from 2018, the ones he had never shown anyone, with the drawings he had made at fourteen of a sky the wrong colour, sealed them in a waterproof bag labelled “for comrade”, and left them with Hu Tao for safekeeping.',
      'Lumine came back three weeks later, thinner, with a cut on her cheek and a light in her face nobody had seen in years. She didn’t say much. But that night the group chat changed its name to “hotpot crew (+1 soon) 🔥”, and Childe paid for everything.',
    ],
  });

  E({
    id: 'vigil', n: 17, title: 'Night Vigil', tag: 'Fatui',
    finale: true, priority: 10, arcs: ['osial', 'zl'], when: C.vigil,
    hint: 'Give Yelan everything she asks for, and forget to ask for anything in return.',
    text: [
      'Yelan kept her word exactly. That was the problem.',
      'You had given her everything she needed: Ekaterina’s voice on a recording, and a protocol with Childe’s name on every page. She took it to the Qixing, and Project Osial died in a closed room at the Jade Chamber before a single resonator on Guyun could hum. Liyue was safe. The sea stayed asleep.',
      'But you never asked her what would happen to the man whose name was on every page, so she never promised. On Monday the Millelith came for the Eleventh Harbinger. They let him walk down to Pier 7 for the hand-back, because Yelan has a sense of theatre: two officers at a polite distance, and Childe in handcuffs he could have broken at any moment and didn’t. He took the phone from you with both hands, the cuffs chiming like a wind bell.',
      'He spent that night in a cell beneath the Jade Chamber. You spent it on the harbor wall outside, because going home felt wrong. Around three in the morning a small window high in the tower creaked open, and somebody inside whistled the first bars of a Snezhnayan lullaby, badly, and you whistled the rest back.',
    ],
    jc: [
      '…he was allowed exactly one call, from a Millelith desk phone, under supervision, and he spent it on Teucer, who wanted to know whether the factory was open on Tuesdays.',
      'The Qixing held him for nine days. From Snezhnaya, Signora called him “the scapegoat who confessed”, which he had not. On the ninth day Zhongli arrived with tea and a book on Liyue contract law, and walked out with him past the guards on the strength of a precedent from the year 1203 that nobody else had read.',
      'The first thing he did as a free man was find Yelan and shake her hand, which alarmed her more than anything else he could possibly have done. “Good game,” he said. “Rematch?” She has been avoiding him ever since.',
    ],
  });

  E({
    id: 'fishfry', n: 18, title: 'Fish Fry', tag: 'Friends',
    finale: true, priority: 11, arcs: ['fam', 'ops'], when: C.fishfry,
    hint: 'Beat Teucer at Reel Rush. Sing him to sleep. Keep the night shift fed.',
    text: [
      'By Monday evening the Liyue Branch had decided, collectively and without consulting anyone, that there would be a fish fry.',
      'So the hand-back on Pier 7 took place in a cloud of smoke and steam: Big Boris at a borrowed grill, Pyotr setting things on fire on purpose for once, Lyuba keeping the drinks so cold they hurt your teeth, Anya heckling, Kolya lost somewhere between the pier and the car park, and Valentina at the end of the pier like a lighthouse with opinions.',
      'Someone had taped a screenshot to the railing: REEL RUSH, NEW HIGH SCORE, Teucer’s 2,047 beaten at last. Beneath it, a printout of a crayon note Teucer had photographed on the plane home: “REMATCH AT CHRISTMAS. I WILL WIN. I LOVE YOU.” And beneath that, someone had written: “He played the lullaby the whole flight. The cabin crew asked for a copy.”',
      'Childe arrived, took his phone, saw the score, saw the crayon, heard about the lullaby from three directions at once, and said nothing for a while. Then he took the spatula away from Boris and said, “Move. You’re doing it wrong. Who taught you to cook fish,” and the evening began properly.',
      'You stayed until the lanterns came on. Somebody put a paper plate in your hands. It was, genuinely, the best fish you have ever eaten.',
    ],
    jc: [
      '…there were two hundred new photos of the fish fry on it, most of them blurry, every one of them taken by Kolya, who had borrowed it “for one picture”.',
      'He sent the best one to Teucer. Teucer sent back a voice note of himself singing the lullaby back to him, wildly off-key, with Sir Fang on harmonies. Childe made it his ringtone. It is the worst ringtone in the Northland Bank Group. He will not change it.',
      'The score stands. Teucer practises every night. Childe, who has never lost a fishing argument in his life, has started to suspect this might be the year he finally does, and finds that he is looking forward to it.',
    ],
  });

  E({
    id: 'unspoken', n: 19, title: 'Unspoken', tag: 'Zhongli',
    finale: true, priority: 12, arcs: ['zl', 'core'], when: C.unspoken,
    hint: 'Listen to the memo he never meant to send. Don’t send it.',
    text: [
      'You listened to it once, with the volume all the way down: “for xiansheng (don’t send)”. One minute and forty-eight seconds of a man being brave on osmanthus wine, and then begging himself not to be.',
      'You didn’t send it. Every time Zhongli wrote (long, careful paragraphs about cranes and contracts and the age of the sea), your thumb hovered over the share button, and every time you heard him say it: Ajax, do not send this. It wasn’t yours to send.',
      'So you carried it all weekend. Whenever Zhongli wrote about him, late at night, you answered with something true and small, and left the large thing where it was.',
      'On Monday at Pier 7 you gave the phone back with the memo still inside it, still unsent, still saying I like you to nobody. Childe took it and checked (you saw him check, quickly, the way you touch a pocket for your keys), and his shoulders came down half an inch.',
      '“Thanks,” he said. Only that. It sounded different in his real voice.',
    ],
    jc: [
      '…he went to dinner with Zhongli on Thursday, same as always, and paid, same as always, and complained about it, same as always.',
      'Over the second pot of tea, Zhongli remarked that the person who had held his phone had been “unusually kind, and unusually careful with what was not theirs”. Childe said, “Yeah,” and looked into his cup, and said nothing else for a while, which Zhongli noticed, because he notices everything.',
      'The memo is still in the folder. One day he’ll send it, or say it out loud, or Zhongli will say it first. Some things take a long time. As it turns out, they both have plenty.',
    ],
  });

  E({
    id: 'godofcontracts', n: 20, title: 'The God of Contracts', tag: 'Zhongli',
    finale: true, priority: 13, arcs: ['zl', 'osial'], when: C.godofcontracts,
    hint: 'Break a contract with the one who wrote the rules for contracts.',
    text: [
      'There is a saying in Liyue older than the harbor: those who break a contract shall suffer the wrath of the Geo Archon. People say it the way they say mind the step. This weekend you learned it isn’t a figure of speech.',
      'Somewhere between Saturday and Monday a contract broke, and you were holding the pen. Zhongli did not shout. He has never needed to. He simply stopped writing long paragraphs. When he wrote at all it was in short, flat sentences, each one perfectly punctuated, set down like stones in a line. “I see.” “That was not our agreement.” “I will handle it.”',
      'And he did, alone, the way he once handled everything. Hu Tao stopped covering for you within the hour. On Sunday night men in long grey coats searched the coffin showroom at Wangsheng and knew exactly which lid to lift. It was empty. Someone had moved its occupant an hour earlier. Someone always keeps his word, even when you don’t.',
      'On Monday at Pier 7, Zhongli was there when you gave the phone back. He didn’t look at you. He looked at Childe, the way you might look at a lantern you had thought had gone out, and then he turned and walked away along the harbor without a word. Childe watched him go. Then he asked you, very quietly, “What did you do?”',
      'You told him. It took a long time. The sea was very calm while you talked, the way it is after a storm, when there is nothing left in it to give.',
    ],
    jc: [
      '…he went straight to the Lane of Stone Lions and knocked on Zhongli’s door for an hour. It did not open.',
      'It opened the next day. Zhongli made tea. They did not talk about it, the way two people don’t talk about a crack in a cup they both still drink from. Childe paid for dinner that Thursday. And the next. And the next.',
      '“A broken contract is not an ended one,” Zhongli told him, months later, out of nowhere, over noodles. “It is a debt. Debts can be paid.” Childe said, “Add it to the ledger,” and Zhongli very nearly smiled, and that was the beginning of the long way back.',
    ],
  });

  E({
    id: 'scapegoat', n: 21, title: 'The Scapegoat', tag: 'Fatui',
    finale: true, priority: 14, arcs: ['osial', 'zl', 'ops'], when: C.scapegoat,
    hint: 'Keep Signora’s code from her, but let her money move.',
    text: [
      'Osial slept. You never gave La Signora her code, and without it the resonators on Guyun stood silent among the stone pillars all Sunday night, like guests at a party nobody came to.',
      'But nobody stopped the money. At 23:00 the wire released, exactly on schedule: three million Mora to Sea Lantern Logistics, a company that turned out to be a post-office box and a very good lawyer. By Monday morning it had vanished. Every document it had passed through carried one signature.',
      'Signora’s report reached Zapolyarny before breakfast. It was a masterpiece: calm, regretful, devastating. A reckless young Harbinger, a failed project of his own invention, a fortune lost to the sea. She recommended leniency. That was the cruellest line in it.',
      'The summons came at noon: the 18:00 ferry north, to answer for Osial in person. Childe met you at Pier 7 first, took his phone, read the report Ekaterina had forwarded, and laughed, a short bright angry laugh like a struck match. “She’s good,” he said. “I’ll give her that. I’ll give it to her face.”',
      'He thanked you, and he meant it. You had held the line for four days with nothing but a borrowed voice. It just wasn’t enough to stop a woman who had been planning his fall since August.',
    ],
    jc: [
      '…he had six hours before the ferry, and he spent them on calls: Mama, Teucer, Tonia, Zhongli, Ekaterina. Every call was cheerful. Every one was a goodbye he didn’t say out loud.',
      'Zapolyarny took his title for a year. They did not take his Vision, or his place in the Tsaritsa’s private estimation, which is apparently higher than Signora would like. He spent the winter in the far north fighting things in the ice and writing very long letters to Liyue about fish.',
      'Every letter to the Lane of Stone Lions ended the same way: “Keep my table at Liuli Pavilion. I’m coming back, xiansheng. Don’t you dare pay for anything until I do.” Zhongli has kept the table. He has not paid. It is the first contract either of them has made without writing it down.',
    ],
  });

  E({
    id: 'leverage', n: 22, title: 'Pulcinella’s Guests', tag: 'Family',
    finale: true, priority: 15, arcs: ['fam', 'friends', 'osial'], when: C.leverage,
    hint: 'Let Mr. Pulcinella’s driver take care of everything.',
    text: [
      'LA 711 landed at 07:40 on Saturday. Mr. Pulcinella’s driver was waiting at Arrivals with a hand-lettered sign, a bag of Snezhnayan sweets and a very warm smile, exactly as arranged. You arranged it. You just didn’t know what you were arranging.',
      'The Liyue Harbor Grand Hotel is a beautiful place to be a hostage. Teucer had a suite with a view of the harbor and a room-service menu with forty-one desserts. Tonia had a phone that only seemed to find a signal in the lobby, where a polite man in a grey coat was always reading the same newspaper. Neither of them ever saw a lock. Neither of them ever needed to.',
      'From then on, every message the Harbingers sent Childe carried a little extra weight. “Your siblings send their love, my boy,” Pulcinella wrote. “Such lovely children. It would be a pity if their holiday were spoiled by any unpleasantness on your side.” It wasn’t a threat. Pulcinella has never needed to make one.',
      'Nobody was hurt. That is what people say afterwards, as if it settles anything. Nobody was hurt; the kids flew home on Monday with souvenir slippers from the Grand; and the Eleventh Harbinger belonged, a little more than before, to the man who had paid for their tickets.',
    ],
    jc: [
      '…he read everything, from the photo at Arrivals to Pulcinella’s last message, and he did not shout. He went very quiet and very calm, the way the sea goes before it does something.',
      'He called Morepesok. He told his mother the kids had loved the hotel. He told Teucer the factory had been closed for the elves’ holiday. When Tonia came on the line he said, “I’m sorry. I’ll fix it.” She said, “You always say that,” and hung up, and he stood there holding the phone for a long time.',
      'Then he went back to work. That winter he did everything Zapolyarny asked, faster and better than anyone had ever done it, and smiled at Pulcinella at every meeting, and waited. Childe is very good at waiting for a fight. He just isn’t used to waiting this long.',
    ],
  });

  E({
    id: 'osial', n: 23, title: 'Osial Rises', tag: 'Fatui',
    finale: true, priority: 16, arcs: ['osial', 'core'], when: C.osial,
    hint: 'Give La Signora exactly what she asks for.',
    text: [
      'You sent the code on Sunday night: OSL-0918-ΛΣ, typed carefully, so you wouldn’t get it wrong. Signora replied with one word: “Good.” It was the only kind thing she said to Childe’s phone all weekend, and it was the worst message anyone sent.',
      'At 23:00 the money moved. A few minutes later the resonators on Guyun began to sing, a low wrong note you could feel in your teeth from Chihu Rock. Then the sea out past the stone forest stood up.',
      'Osial is old. It was old when Liyue was a fishing village, older than the contracts that pinned it under the stone, and it rose out of the water like a mountain remembering it could move. The harbor lights went out. The Crux Fleet put to sea against all sense. On Yujing Terrace, where the white lanterns from the funeral still hung, a man in a long coat stood at the railing very still, and then was not there any more.',
      'By dawn it was over. Nobody will tell you exactly how. The Ministry of Civil Affairs calls it “a severe weather event”. The fishermen of Liyue call it the Night the Sea Woke Up, and they say it went back to sleep because someone asked it to, in a voice it had to obey.',
      'On Monday, at what was left of Pier 7, Childe took his phone from you with a hand that shook, very slightly. “I pitched it,” he said. “In August. I was angry and bored and I wanted to see a god.” He looked out at the broken pillars of the stone forest. “Well. I saw one.”',
    ],
    jc: [
      '…the first message he opened was from Zhongli, sent at 04:12 on Monday morning, and it said only: “The sea is asleep. I am very tired. Please do not do this again.”',
      'The Tsaritsa recalled him that week. Signora had been very careful: it was his project, his signature, his code. Childe went without a word of protest. He has never refused a fight, and this one, he says, he deserves to lose.',
      'Liyue rebuilt Pier 7 by Christmas. The new boards are pale and smell of resin. At the very end, someone has bolted a small brass plaque to the railing, the kind you only notice if you fish there at night. It says: FOR THE ONES WHO KEPT THE SEA. — A.',
    ],
  });

  E({
    id: 'true', n: 24, title: 'Ajax', tag: 'Secret',
    finale: true, priority: 1, arcs: ['fam', 'zl', 'osial', 'ops', 'core'], when: C.true,
    hint: 'Keep his family happy, his heart honest, the sea asleep and his name clear. Raise no one’s doubts. And when he finally calls, tell him the truth.',
    text: [
      'At half past five on Monday, Pier 7 was crowded, which it never is.',
      'The Liyue Branch had come, in uniform, pretending to be there by coincidence. Hu Tao had come, because she goes wherever something is ending. Lumine leaned on a bollard with Paimon on her shoulder, eating. Ekaterina stood a little apart with the office cicins in a travel box, for reasons nobody asked about. And at the end of the pier, by the railing where it had all begun, stood Zhongli, hands folded behind his back, watching the sea as if it owed him nothing at all.',
      'Then Childe came down the pier at a run, the way he does everything, and stopped in front of you, and for a moment neither of you knew what to say. You had been him for four days. You had answered his brother’s voice notes and his sister’s long, careful questions. You had stood between his family and the people who wanted to use them. You had sent a voice memo he had begged himself never to send. You had kept his secrets, and other people’s, and the sea.',
      '“So,” he said. “You’re the one who’s been me.” “Yes,” you said. “And I told you the truth.” “You did.” He grinned, and it was the grin from every photo on his phone. “Nobody tells me the truth. It’s very annoying. I liked it.”',
      'He held out his hand: not for the phone; for you. “Ajax,” he said. “That’s my name. Only my family uses it. And him.” A tilt of the head toward the railing, where Zhongli had turned around. “And you, I guess. If you want.”',
      'You gave him his phone. He gave you his name. It seemed, for once, like a fair trade.',
    ],
    jc: [
      '…he didn’t look at it for an hour. He was busy: there were people on the pier he loved, and for once none of them were in danger, and he went down the line like a man at a reunion, hugging every single one of them, including Valentina, who has never forgiven him.',
      'Later he read everything, every message you had sent as him. He laughed at most of them. At some he went quiet. At the voice memo he made a sound Hu Tao later put into a poem, and then he looked up at Zhongli, who had heard it eleven times, and Zhongli said “Yes” before he could ask anything at all.',
      'That night he added a new contact to his phone: no surname, a fish emoji, and a number in Chihu Rock. The first message he ever sent it was a forwarded voice note from Teucer, sent from the plane home (“tell the elves thank you”), and then: “the elves say you’re welcome. dinner thursday? i’m paying 😁”',
      'You still have that message. You never answered the part about the bill. You both know who’s paying.',
    ],
  });
})();
