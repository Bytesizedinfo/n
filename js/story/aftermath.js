/* Aftermath — “Where everyone ended up”: one line per chat on the ending screen, first matching outcome wins.
   Chats and outcomes per docs/STORY.md "Aftermath". Owner: S4 (core story). Helpers: js/story/endings.js. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const F = (s) => s.flags;
  const sus = (s, id) => (s.sus && s.sus[id]) || 0;
  const H = () => JC.storyHelpers;
  const rule = (id, s) => H().endingRule(id, s);

  JC.story.aftermath([
    { id: 'zhongli', name: 'Zhongli', avatar: 'zl', outcomes: [
      { id: 'knows', when: (s) => !!(F(s).zl_confessed && F(s).told_childe_morax),
        line: 'Knows everything, and so does Childe. Thursday dinners now come with very long stories about the Archon War.' },
      { id: 'north', when: (s) => rule('northbound', s),
        line: 'Followed him north with a small travelling case and no proper coat. Is learning to fish through ice.' },
      { id: 'honored', when: (s) => !!(F(s).zl_contract && !F(s).zl_broken && !F(s).morax_sold),
        line: 'Contract honored. He reread it on Monday night and smiled at clause three.' },
      { id: 'broken', when: (s) => !!(F(s).zl_broken || F(s).morax_sold),
        line: 'Contract broken. He keeps the paper in a drawer, folded once, and has not thrown it away.' },
      { id: 'never', line: 'Never signed anything. He still wonders who was so careful with the phone.' },
    ] },

    { id: 'teucer', name: 'Teucer', avatar: 'teucer', outcomes: [
      { id: 'saw', when: (s) => !!F(s).facetime_cam || sus(s, 'teucer') >= 4,
        line: 'Saw through it. Tells everyone at school that his brother’s phone was haunted for a weekend.' },
      { id: 'heartbroken', when: (s) => rule('leverage', s),
        line: 'Came home from the Grand with forty-one dessert menus and a question nobody will answer.' },
      { id: 'proud', when: (s) => !!(F(s).beat_teucer && F(s).gift_teucer),
        line: 'Proud of you, and furious about Reel Rush. Practising every night for the Christmas rematch.' },
      { id: 'believes', line: 'Still believes in the toy factory, the elves, and a brother who never misses a message.' },
    ] },

    { id: 'tonia', name: 'Tonia', avatar: 'tonia', outcomes: [
      { id: 'reported', when: (s) => !!F(s).facetime_cam,
        line: 'Reported you to the Millelith, to Mama and to the family group, in that order.' },
      { id: 'stranger', when: (s) => !!F(s).tonia_knows_stranger,
        line: 'Knows a stranger had his phone. Has made Ajax promise to check his pockets for the rest of his life.' },
      { id: 'furious', when: (s) => sus(s, 'tonia') >= 6,
        line: 'Furious, and right. Has started a list titled THINGS AJAX IS NOT TELLING ME.' },
      { id: 'keeps', when: (s) => !!F(s).told_tonia,
        line: 'Keeps the secret with you. Teucer gets the toy factory; she gets the truth.' },
      { id: 'suspects', line: 'Still suspects. Reads every message from him twice, looking for semicolons.' },
    ] },

    { id: 'parents', name: 'Mama & Papa', avatar: 'mama', outcomes: [
      { id: 'recipe', when: (s) => !!F(s).recipe,
        line: 'Sent the pelmeni recipe to a chef in Liyue. “The dill question is settled. — Papa”' },
      { id: 'worried', when: (s) => sus(s, 'mama') >= 3 || !H().kidsSafe(s),
        line: 'Worried. Mama keeps a candle in the window. Papa started the whale story early this year.' },
      { id: 'relieved', line: 'Relieved. The kids came home sunburnt and full of stories about elves.' },
    ] },

    { id: 'signora', name: 'La Signora', avatar: 'signora', outcomes: [
      { id: 'outplayed', when: (s) => H().osialStopped(s) && !F(s).osial_sent,
        line: 'Outplayed. Has requested a transfer to somewhere with fewer fish.' },
      { id: 'obeyed', when: (s) => !!F(s).osial_sent,
        line: 'Got her code. Wrote “Good.” Has not said a kind word since.' },
      { id: 'hunting', when: (s) => !!(F(s).osial_fake || F(s).osial_stalled),
        line: 'Hunting. She knows she was lied to. She doesn’t yet know by whom.' },
      { id: 'waiting', line: 'Still waiting for her authorization. In writing.' },
    ] },

    { id: 'scaramouche', name: 'Scaramouche', avatar: 'scara', outcomes: [
      { id: 'fooled', when: (s) => !!F(s).scara_quiz_ok,
        line: 'Fooled. Remembers that weekend as the Eleventh at his most tolerable, and it haunts him.' },
      { id: 'blackmail', when: (s) => sus(s, 'scara') >= 5,
        line: 'Knows something. Keeps a folder. Sends one purple dot every Monday, just so you remember.' },
      { id: 'bored', line: 'Bored. Blocked the fishwife again. Unblocked him by dinner.' },
    ] },

    { id: 'lumine', name: 'Lumine & Paimon', avatar: 'lumine', outcomes: [
      { id: 'allies', when: (s) => !!(F(s).gave_abyss_notes || F(s).lumine_knows),
        line: 'Allies. Lumine has a door to open in the Chasm; Paimon has your number, and uses it.' },
      { id: 'fed', when: (s) => (F(s).paimon_fed || 0) >= 3,
        line: 'Well fed. There is now a Wanmin Go combo called “The Childe”. It is very large.' },
      { id: 'lied', line: 'Lied to, gently. Lumine noticed the full stops. She’s being polite about it.' },
    ] },

    { id: 'hutao', name: 'Hu Tao', avatar: 'ht', outcomes: [
      { id: 'hired', when: (s) => !!F(s).ht_hired || (sus(s, 'ht') >= 5 && !F(s).zl_contract),
        line: 'New employee: you. Badge says TRAINEE (LIVING). Do not open number four.' },
      { id: 'ally', when: (s) => !!F(s).ht_ally,
        line: 'Co-conspirator. Wrote you a poem. It rhymes “phone” with “unknown” four times.' },
      { id: 'suspicious', line: 'Suspicious. Texts the phone a single 👻 at 3 AM, just to see who answers.' },
    ] },

    { id: 'ops', name: 'Liyue Branch 🐟', avatar: 'lyuba', outcomes: [
      { id: 'union', when: (s) => !!F(s).ops_sabotage,
        line: 'A union of comrades. The reprimand from Zapolyarny is framed in the break room.' },
      { id: 'loyal', when: (s) => (F(s).ops_morale || 0) >= 2,
        line: 'Loyal. Lyuba thawed the aquarium. Every fish survived, including the one named after Signora.' },
      { id: 'mutiny', when: (s) => (F(s).ops_morale || 0) <= -1,
        line: 'Mutiny. The vending machine has declared itself an independent state.' },
      { id: 'silent', line: 'Never really answered. They still wonder why Sir stopped saying “good work, comrades”.' },
    ] },

    { id: 'yelan', name: 'Yelan', avatar: 'yelan', outcomes: [
      { id: 'kept', when: (s) => !!(F(s).leaked_yelan && F(s).yelan_protects_childe),
        line: 'Deal kept. She rolled a six, and a Harbinger walked free.' },
      { id: 'broken', when: (s) => !!F(s).leaked_yelan,
        line: 'Deal bent. She took everything you gave her and kept nothing back for him. You never asked.' },
      { id: 'knew', when: (s) => sus(s, 'yelan') >= 4,
        line: 'Knew it wasn’t him by Saturday. Never made her move. Still thinks about it.' },
      { id: 'never', line: 'Never met. An unknown number that went quiet on Saturday afternoon.' },
    ] },

    { id: 'beidou', name: 'Beidou', avatar: 'beidou', outcomes: [
      { id: 'went', when: (s) => !!F(s).beidou_went,
        line: 'Rematch lost gloriously, in three rounds. Kazuha wrote a poem. You fall over in it.' },
      { id: 'rain', when: (s) => !!F(s).beidou_rain_check,
        line: 'Rain check. Next week. She’ll still win, and has told the whole harbor so.' },
      { id: 'snubbed', when: (s) => !!F(s).beidou_snubbed,
        line: 'Snubbed. Waited on deck till midnight. The Crux doesn’t carry no-shows.' },
      { id: 'owed', line: 'Still owed a rematch. Sharpening something.' },
    ] },

    { id: 'skirk', name: '—', avatar: 'skirk', outcomes: [
      { id: 'followed', when: (s) => !!F(s).chasm_went,
        line: 'Followed. She looked at you, decided you weren’t worth keeping, and let you go. You’re fine with that.' },
      { id: 'answered', when: (s) => !!F(s).skirk_answered,
        line: 'Answered. Three in the morning, very few words, and a set of coordinates you will never forget.' },
      { id: 'unanswered', line: 'Unanswered. “Ajax.” Nobody wrote back.' },
    ] },

    { id: 'ekaterina', name: 'Ekaterina', avatar: 'ekat', outcomes: [
      { id: 'danger', when: (s) => !!((F(s).leaked_yelan || F(s).leaked_ning) && !F(s).ekat_warned),
        line: 'In danger. Signora went looking for a mole, and Ekaterina’s desk is the closest to the door.' },
      { id: 'foreman', when: (s) => !!F(s).factory_bank,
        line: 'Promoted to toy-factory foreman. Owns a felt hat now. Will not discuss it.' },
      { id: 'safe', when: (s) => !!F(s).ekat_warned,
        line: 'Safe. Took the cicins and a week’s leave, and left the office keys in the frozen aquarium.' },
      { id: 'steady', line: 'Kept the front desk running all weekend. Has a great many questions for Sir.' },
    ] },
  ]);
})();
