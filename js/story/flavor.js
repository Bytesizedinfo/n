/* Contact flavour: reply pools the story engine uses when the player types something unscripted.
   Facts and voices: docs/STORY.md ("Childe's own voice", "Who is who").
   idle        — Childe texts them (he texts everyone, constantly) or says something ordinary
   confused    — he says something off-script mid-conversation; it doesn't sound like him
   voiceReact  — he sent a voice message, and it isn't his voice
   imgReact    — a random photo
   fishReact   — a fish photo (art tagged 'fish'): everyone has an opinion about Childe's fish
   confess     — "I'm not Childe, I found this phone" (a reaction; the engine then usually ends the game)
   confessCall — optional spoken version of confess for phone calls
   A line may contain "\n" to become two bubbles. An entry may be { text, when: (s) => bool }; the engine
   prefers conditional lines whose `when` matches. s: flags, aff, sus, acted(name), susTotal().
   Capitano never writes. Services, `unknown` and `wangsheng` have no pools. */
(function () {
  'use strict';
  const JC = window.JC;
  const set = (id, pools) => {
    const c = JC.contacts.get(id);
    if (c) Object.assign(c, pools);
  };

  // Condition helpers: never throw, whatever shape `s` arrives in.
  const flag = (s, k) => !!(s && s.flags && s.flags[k]);
  const num = (s, k) => Number((s && s.flags && s.flags[k]) || 0);
  const sus = (s, id) => Number((s && s.sus && s.sus[id]) || 0);
  const aff = (s, id) => Number((s && s.aff && s.aff[id]) || 0);
  const acted = (s, name) => !!(s && typeof s.acted === 'function' && s.acted(name));
  const any = (s, ...ks) => ks.some((k) => flag(s, k));
  const total = (s) => Number((s && typeof s.susTotal === 'function' && s.susTotal()) || 0);
  const W = (text, when) => ({ text, when });

  // ── Zhongli ──────────────────────────────────────────────────────
  set('zl', {
    idle: [
      "Good evening, Childe. I was just considering the cranes over Yujing Terrace. They have arrived early this year, which the old fishermen say portends a mild winter. In my experience the old fishermen are right roughly half the time, which is, all things considered, an excellent record.",
      "I have received your message. I am at the teahouse; the storyteller is recounting the Archon War tonight, and he has the dates wrong again. I am refraining from correcting him. It is more difficult than it sounds.",
      "Hu Tao has asked me to remind you that the Wangsheng VIP card is not, as you have claimed, a joke. She has printed more of them. She intends to laminate one for me.",
      "Thank you. On an entirely unrelated matter, there is a very fine birdcage at the antiques stall on Feiyun Slope. I mention it purely as a point of historical interest.",
      "I am glad to hear from you. I was steeping osmanthus tea a moment ago and found that I had set out two cups. Habits form quickly in good company.",
      "The funeral committee has asked me to choose between two shades of white for the lanterns. I find I hold strong opinions about both. This may be a character flaw.",
      "I have reserved our usual table at Liuli Pavilion for Thursday. I took the liberty of the reservation; you, no doubt, will take the liberty of the bill. It is a system that has served us well.",
      "If you intend to fish tonight, the tide turns at a quarter past two. I do not fish, but I have watched this harbor for a long time.",
      "I spent the afternoon with a treatise on the Guili Plains. The author is confident, eloquent and entirely wrong. I enjoyed it enormously.",
      "You write as though you are walking quickly, Childe. Slow down. The harbor will still be here. It has been here for quite some time.",
      "The opera house has begun serving tea that comes in a small paper bag. I have no further comment. I simply wished someone to know.",
      "There was a white heron on the railing at the harbor this morning. It regarded the water the way you do before a cast: as though the sea owed it something.",
      W("The tea set has arrived. I have brewed in it twice, and the second steeping was better, as second steepings are. I have not yet settled the account with you. I am aware of this.", (s) => flag(s, 'bought_teaset')),
      W("I find I am not troubled about the tea set. Objects have a way of finding the people who were meant to keep them. Sometimes it takes a century or two.", (s) => flag(s, 'teaset_lost')),
      W("Per the second clause, I have told no one. Per the third, I will ask you something before the week is out, and you will answer me truthfully. I thought it courteous to warn you.", (s) => flag(s, 'zl_contract')),
      W("I reread our contract this evening. It is short, as good contracts are. I find I am pleased with it, which is not always the case with contracts.", (s) => flag(s, 'zl_contract')),
      W("You may set aside the exclamation marks with me. We have already established who you are, or rather, who you are not. I would prefer to hear from you in your own words.", (s) => flag(s, 'zl_admitted') && !flag(s, 'zl_contract')),
      W("I have been reading the Ledger again. Item twenty-three is, I maintain, a gift and not a debt. He has misfiled it. I intend to tell him so.", (s) => flag(s, 'ledger_shared')),
      W("The Glaze Lilies are on my desk. Hu Tao has photographed them eleven times. I did not ask who sent them. Some kindnesses ought to be received without an investigation.", (s) => flag(s, 'lilies_sent')),
      W("The tea you sent to Heyu was steeped correctly, which tells me you asked someone how. That is the beginning of wisdom.", (s) => flag(s, 'zl_tea_sent')),
      W("Hu Tao informs me that your card has been frozen. I would offer assistance, but, as you know, my wallet remains in my other coat.", (s) => flag(s, 'card_frozen')),
      W("If you are wondering why the coffin showroom at Wangsheng is closed to visitors this week, I would encourage you to keep wondering, quietly, and somewhere far from the Fatui.", (s) => flag(s, 'knows_hideout')),
      W("Hu Tao says you have been texting like a stranger in a borrowed coat. She is prone to metaphor. She is also, unfortunately, rarely wrong.", (s) => sus(s, 'ht') >= 3 && !flag(s, 'zl_admitted')),
      W("Forgive me, Childe, but your rhythm is unusual tonight. You generally send three messages where one would do. Tonight you have sent one where three would do.", (s) => sus(s, 'zl') >= 2 && !flag(s, 'zl_admitted')),
      W("I have been thinking about what you told me of Osial. A contract may be read in many ways. I intend to read mine very carefully.", (s) => flag(s, 'zl_knows_osial')),
      W("It is a peculiar relief to be called a consultant by someone who knows otherwise. Thank you for continuing to do so.", (s) => flag(s, 'zl_confessed')),
      W("I have noticed that I check my phone more often than I used to. I am told this is a modern affliction. I find I do not entirely mind it.", (s) => aff(s, 'zl') >= 5),
      W("The sea is quiet again. It cost me a promise to make it so, and I had not broken one in a very long time. I would rather not discuss it.", (s) => flag(s, 'zl_broken')),
      W("You offered my name to Signora. I have nothing further to say. A contract, once broken, is not mended by conversation. It is only remembered.", (s) => flag(s, 'morax_sold')),
    ],
    confused: [
      "Forgive me. I have read your message three times and arrived at three different meanings. None of them sounds like you.",
      "That was an unusual choice of words, Childe. You are generally louder than that, and considerably less polite.",
      "That sentence was very nearly punctuated correctly. I am not certain whether to be proud or concerned.",
      "Is someone with you? You are writing the way people write when someone is reading over their shoulder.",
      "I shall take that as one of your Snezhnayan idioms and refrain from inquiring further. For now.",
      "You have not called me xiansheng once this evening. I had not realised how accustomed I had grown to it.",
      W("You are imitating him again. You need not, with me. Say what you mean in your own words. I would prefer them.", (s) => flag(s, 'zl_admitted')),
      W("Clause three obliges you to answer me truthfully. It does not, I note, oblige you to answer me clearly. You have found the loophole. Well done.", (s) => flag(s, 'zl_contract')),
      W("Childe would have made a remark about my wallet by now. I find I am still waiting for it.", (s) => sus(s, 'zl') >= 3 && !flag(s, 'zl_admitted')),
    ],
    voiceReact: [
      "I have listened to your voice message. The voice is pleasant, but it is not his. I have heard his voice in a great many moods, and none of them sound like that.",
      "That was not Childe. I say this without accusation, merely as a matter of record.",
      "A voice message. How modern. I notice the speaker does not laugh at the end of the sentence. He always laughs at the end of the sentence.",
      W("Thank you for the recording. It is good, at last, to hear the voice I have been corresponding with. You sound tired. Rest, if you can.", (s) => flag(s, 'zl_admitted')),
    ],
    imgReact: [
      "A fine photograph. The composition favours the left, which suggests the photographer was holding a cup of tea in the right hand. I approve.",
      "Thank you. I shall consider it carefully, as one considers any gift that arrives without explanation.",
      "I am not entirely certain what I am meant to see here. I have looked at it for some time regardless, and found that to be its own reward.",
      W("Did you take this yourself? I would like to know what you notice when you are not noticing on his behalf.", (s) => flag(s, 'zl_admitted')),
    ],
    fishReact: [
      "A handsome fish. I shall refrain from asking whether it has tentacles, because it plainly does not, and for this I am grateful.",
      "You have caught another one. I assume it has already been named. I assume the name is an insult to a colleague.",
      "You know I do not care for seafood, Childe, but I care a great deal for your face when you describe a catch. Please describe this one.",
      "In old Liyue the first fish of a season was returned to the sea as thanks. I suspect this one will be returned to a grill.",
      W("Did you catch this, or did he? I ask because the fish looks unimpressed, and his fish generally look defeated.", (s) => flag(s, 'zl_admitted')),
    ],
    confess: [
      W("Yes. We have established this, and I appreciate your consistency.\nWhen you are ready, bring the phone to Wangsheng and ask for me. I will see that it reaches him.", (s) => flag(s, 'zl_admitted')),
      "I know. I have known since Friday night.\nThank you for saying it plainly. Bring the phone to Wangsheng Funeral Parlor and ask for me. I will see that it reaches its owner.",
      "Ah. Thank you. Honesty is the foundation of every contract worth keeping, and it is rarer than jade.\nLeave the phone with me at Wangsheng. He will want it back, and he will want to thank you. Loudly.",
    ],
    confessCall: [
      "I know. I have known since Friday night. Thank you for saying it aloud all the same. Come to Wangsheng and ask for me. I will see that the phone finds its way home.",
    ],
  });

  // ── Family ───────────────────────────────────────────────────────
  set('teucer', {
    idle: [
      "BROTHER!!! hi hi hi 🐟🐟🐟",
      "mama says i have to sleep but im not tired. r u tired?? i bet u r not tired 🐟",
      "BROTHER do the elves at the toy factory get days off?? or do they work FOREVER 🧸",
      "Sir Fang says hi!!! he is a WOLF so he says it like this\nAWOOOOO 🐺⭐",
      "how many fish did u catch today. more then 100?? 🐟🐟",
      "tonia wont let me use her phone. she is a TRAITOR. hi brother",
      "BROTHER when i grow up i want to sell toys JUST LIKE U 🧸⭐⭐",
      "anthon says Glacier Guardians are for babys. they are NOT for babys. tell him 😠",
      "do u have the FROST FORTRESS at ur work?? just asking. no reason 🧸👀",
      "i love u brother!!!! ok bye!!!! 🐟❤️",
      "guess what. my tooth is WIGGLY. if it falls out in liyue do i get paid in MORA 😮",
      "ur my favrite brother. dont tell anthon 🤫🐟",
      W("U BEAT MY REEL RUSH SCORE?!?! 2,047 WAS MY BEST EVER 😭😭\nrematch. REMATCH. 🐟⚔️", (s) => flag(s, 'beat_teucer')),
      W("MAMA SAYS THERE IS A BOX WITH MY NAME ON IT!!! is it a GLACIER GUARDIAN?? dont tell me. TELL ME 🧸⭐", (s) => flag(s, 'gift_teucer')),
      W("MR ZHONGLI SAYS THE ELVES ARE ON STRIKE!!! brother u have to pay them more 😭🧸", (s) => flag(s, 'factory_zl')),
      W("the toy factory had a FIRE man and a SNOW lady and a VERY BIG man who let me sit on his sholders!!! best factory EVER ⭐⭐⭐", (s) => flag(s, 'factory_bank')),
      W("is the toy factory still closed 😢 tell the elves i said get well soon 🧸", (s) => flag(s, 'factory_cancelled')),
      W("MR ZHONGLI!!! does he like fish?? i will ask him. i will ask him EVERYTHING 🐟❓", (s) => flag(s, 'zl_pickup')),
      W("i listend to ur song 5 times. Sir Fang fell asleep first. then me. then NOT me i was pretending 🐺⭐", (s) => flag(s, 'lullaby_sent')),
      W("WE GET TO SLEEP ON A SHIP?!?! ⚓⚓ BROTHER THIS IS THE BEST DAY OF MY LIFE", (s) => flag(s, 'kids_alcor')),
      W("an INN in the MOUNTAINS!!! if there is a ninja on the roof i am going to be his frend ⭐", (s) => flag(s, 'kids_wangshu')),
      W("mama says a DRIVER is coming for us like we are PRINCES 👑 tonia says thats 'suspicious'. what is suspicious", (s) => flag(s, 'fatui_pickup')),
      W("tonia says ur acting 'sus'. what is sus. is it a fish 🐟", (s) => sus(s, 'tonia') >= 4),
      W("brother u type weird today. did u hurt ur thumbs?? 😢", (s) => sus(s, 'teucer') >= 3),
    ],
    confused: [
      "what does that mean 🤔",
      "BROTHER thats not how u talk 😂 r u being a ROBOT 🤖",
      "i dont get it. is it a grown up joke",
      "huh?? i asked Sir Fang. he doesnt know either 🐺",
      "did u spell that wrong?? i spell stuff wrong ALL the time its ok 🐟",
      "why r u talking like TONIA 😐",
      "BROTHER ur being weird. say FISH if its realy u 🐟",
      W("thats the 3rd weird thing. i am counting. tonia taught me counting weird things 👀", (s) => sus(s, 'teucer') >= 3),
    ],
    voiceReact: [
      "BROTHER??? ur voice is DIFFRENT 😮 did u eat a frog",
      "who is that?? thats not ur voice!! is that an ELF 🧸👀",
      "tonia listend to it and made a face. a BAD face 😐",
      "ur voice sounds like a STRANGER 😢 r u sick?? i will send Sir Fang to look after u 🐺",
    ],
    imgReact: [
      "WOW 😮 is that at the toy factory??",
      "i showed Sir Fang. he says its ok but it needs more FISH 🐟",
      "cool!!! i am going to draw it 🖍️⭐",
      "what is that. is it a toy. it looks like a toy 🧸",
    ],
    fishReact: [
      "FIIIIISH 🐟🐟🐟 HOW BIG WAS IT. bigger then me??",
      "BROTHER thats the BIGGEST FISH EVER. bigger then the one papa says he caught 😮",
      "what is its name!!! u always name them 🐟⭐",
      "i showed Sir Fang and he wants to EAT it 🐺🐟",
      W("ok u r good at real fishing AND reel rush. thats not FAIR 😤🐟", (s) => flag(s, 'beat_teucer')),
    ],
    confess: [
      "ur not my brother??? 😢\nwhere is he. is he at the toy factory. give him back his phone OK",
      "TONIA!!! TONIA COME HERE\nsomeone has brothers phone 😭",
      "i knew it. u didnt say BROTHER right 😤\nplease give it back he needs it for the elves",
    ],
    confessCall: [
      "You're not my brother? Where is he? Is he at the toy factory? Tonia! Tonia, come here, someone has his phone!",
    ],
  });

  set('tonia', {
    idle: [
      "Ajax… it's late. You always say you sleep at eleven. You never sleep at eleven.",
      "Nu? Is that all you're going to say?",
      "Teucer has asked me nine times whether you're awake. I said no. Now I have to tell him I lied.",
      "I'm reading a detective novel. The banker did it. The banker always does it, bratik.",
      "Hi. I'm fine. Teucer is fine. Anthon is pretending to study. Mama is pretending not to worry. So everything is normal.",
      "You know you can just call me, right? I'm fifteen, not eight.",
      "Ajax, what does a ‘Director of Special Collections’ collect? Asking for a school project. (There is no school project.)",
      "I miss you. There. I said it. Don't make it weird.",
      "Nu, bratik, you're very chatty tonight… Is something going on?",
      "Mama made pelmeni and set out your plate again. She does that. I thought you should know.",
      "Why do toy companies need people with ‘clearance’, Ajax? … I'm only asking.",
      W("I'm keeping your secret. I want you to know I'm not doing it for you. I'm doing it for Teucer… and a little bit for you.", (s) => flag(s, 'told_tonia')),
      W("Every time Teucer says ‘toy factory’ I have to look out of the window. Bratik, you owe me so much.", (s) => flag(s, 'told_tonia')),
      W("‘A complicated job at a bank’ isn't an answer, Ajax. It's the shape of where an answer should be.", (s) => flag(s, 'half_truth')),
      W("The fountain pen came… It writes beautifully. I'm going to use it to write down every lie you tell me. Thank you, bratik.", (s) => flag(s, 'gift_tonia')),
      W("You're not writing like yourself… You use full stops now. You never use full stops.", (s) => sus(s, 'tonia') >= 3),
      W("Mr. Pulcinella is sending a driver for us… Ajax, the last time Mr. Pulcinella did something ‘kind’, you left home for six years.", (s) => flag(s, 'fatui_pickup')),
      W("Mama says the hotel is ‘very fancy, all paid by Mr. Pulcinella’. Ajax… why does everything we get come from Mr. Pulcinella?", (s) => flag(s, 'kids_grand')),
      W("An inn in the mountains instead of the big hotel… Nobody changes a booking at midnight for no reason, bratik.", (s) => flag(s, 'kids_wangshu')),
    ],
    confused: [
      "Ajax… that doesn't sound like you at all.",
      "Nu? What is that supposed to mean?",
      "You're being strange. Stranger than usual, I mean.",
      "Did you hit your head? Honestly. Did you?",
      "That's a very… careful sentence. You're never careful.",
      "Bratik, who taught you to write like that? You sound like the letter from the bank.",
      W("I'm writing this down. Every strange thing you say tonight. I have a notebook, Ajax.", (s) => sus(s, 'tonia') >= 3),
      W("You promised me no more lies. That sounded like one. Or like someone else entirely.", (s) => flag(s, 'told_tonia')),
    ],
    voiceReact: [
      "That isn't your voice. … Ajax, who is that?",
      "I listened to it three times. That's not you. You laugh before you talk. Whoever that is doesn't laugh.",
      "Nu. Either you've caught a terrible cold or someone else has your phone. Which is it?",
    ],
    imgReact: [
      "Nice… Is that where you work? It doesn't look like a toy company.",
      "Okay. Why are you sending me this? You're avoiding a question, aren't you.",
      "I'm saving it. As evidence. (Joking.) (Mostly.)",
    ],
    fishReact: [
      "Another fish. Teucer is going to make me print this one out.",
      "It's very big, Ajax. Congratulations. Now answer my question from earlier.",
      "You know you could just say ‘I miss you’ instead of sending fish. … Thank you for the fish.",
    ],
    confess: [
      W("So it wasn't even Ajax who told me the truth… Was it true, at least?\nGive him his phone back. And tell him his sister knows.", (s) => flag(s, 'told_tonia')),
      "I knew it. I knew something was wrong…\nWhere is my brother? Is he safe? Please, if you know anything, tell me.",
      "You're not Ajax… Okay. Okay. I'm not going to panic, because someone in this family has to not panic.\nGive the phone back. Please.",
    ],
    confessCall: [
      "You're not Ajax. I knew it. I knew something was wrong. Where is my brother? Is he safe? Please. Give the phone back to him.",
    ],
  });

  set('anthon', {
    idle: [
      "bro why r u texting me im in a match",
      "yo",
      "lmaooo what",
      "bro the house is so quiet without teucer its actually kinda sad\njk its amazing",
      "did u see the headset i sent u. the one that doesnt sound like a fridge. just saying. birthdays exist",
      "bro i have exams monday and mama is making me study. send help. or money",
      "tonia took the good charger to liyue. this is betrayal. reporting her to mama",
      "bro r u ever coming home or do toy salesmen live in the office now",
      "ok real question. how many toys have u actually sold. like ever. a number",
      "papa told the whale story again. the whale is now the size of morepesok",
      "mama says hi and eat something. i say hi and send the headset",
      W("bro u text like a substitute teacher rn 💀 im telling mama", (s) => sus(s, 'anthon') >= 2),
      W("tonia is being SO weird. she keeps saying ‘nothing’ in a voice. bro what did u tell her", (s) => flag(s, 'told_tonia')),
      W("teucer called me CRYING bc u beat his reel rush score lmaooo\nlegend behavior. no notes", (s) => flag(s, 'beat_teucer')),
      W("why is mama sending our pelmeni recipe to some chef in liyue. are we famous now", (s) => flag(s, 'recipe')),
      W("u bought teucer a toy?? where is MY toy. where is MY headset bro", (s) => flag(s, 'gift_teucer')),
      W("mama says u sounded ‘tired’ on the phone. bro she said it like a detective", (s) => flag(s, 'mama_called')),
      W("WAIT teucer gets to sleep on a SHIP?? i stay home for EXAMS and he gets a SHIP??", (s) => flag(s, 'kids_alcor')),
      W("tonia says ur being weird. tonia says everyone is weird. but this time she said it with her eyebrows", (s) => sus(s, 'tonia') >= 3),
    ],
    confused: [
      "bro what 💀",
      "who taught u that word",
      "lmaooo r u ok",
      "ok boomer",
      "bro that sounded like a bank email",
      "screenshotted. sending to tonia. she'll decode it",
      W("ok thats like the 4th weird thing. mama is gonna hear about this", (s) => sus(s, 'anthon') >= 2),
    ],
    voiceReact: [
      "LMAOOO who is that",
      "bro thats not ur voice. did u get a voice changer. can i have it",
      "bro u sound like a different guy. is this a prank. its a good prank",
      "im playing this for mama. no im not. yes i am",
    ],
    imgReact: [
      "ok",
      "bro why",
      "cool. now send the headset",
      "is this a meme. i dont get it. its a bad meme",
    ],
    fishReact: [
      "bro another fish 💀",
      "ok that ones actually huge. dont tell papa he'll get competitive",
      "sending it to teucer. he's gonna lose his mind. u owe me",
      "bro has 40 fish pics and like 3 pics of his family",
    ],
    confess: [
      "wait fr??? 💀\nok this is the best thing thats ever happened in this family. MAMA",
      "bro WHAT. who r u\nok whatever give it back before mama finds out. she will find out. she always finds out",
    ],
    confessCall: [
      "Wait, for real? You're not Ajax? Bro. Bro. Okay, give it back before Mama finds out. She always finds out.",
    ],
  });

  set('mama', {
    idle: [
      "My sun! I was just thinking of you. Did you eat something? Not coffee. Food.",
      "Ajax, my sun, I made your pelmeni today and your father ate your share. I told him it was yours. He said you would understand. Do you understand? I don't.",
      "Are you sleeping enough? Your face looks thin in the photos. Eat something, my sun.",
      "Your father went out on the ice this morning and came back with one fish and a story about three. You know how he is.",
      "It's −14 here and Anthon is wearing a t-shirt to ‘build character’. Tell him something. He listens to you.",
      "I'm so proud of you, my sun. All those toys, all those happy children. You send too much every month. I'm putting some aside for you.",
      "Teucer drew you again. You are very tall in this one, holding a fish bigger than the boat.",
      "Sweetheart, wear a scarf. I know Liyue is warm. Wear it anyway.",
      "Call me on Sunday, my sun. You always call on Sundays. Even if it's only to say ‘Mama, I'm fine’.",
      "I lit a candle for you at the shore. Don't laugh. A mother is allowed.",
      "My sun, the snow came early. The whole village looks like it's been dusted with flour. I made bread to match.",
      W("Tonia says you sound strange, my sun. She's fifteen, she thinks everyone sounds strange. But… are you all right? Eat something.", (s) => sus(s, 'tonia') >= 3),
      W("Anthon showed me your message and laughed. I didn't laugh. Is everything all right, my sun?", (s) => sus(s, 'anthon') >= 2),
      W("Xiangling sent me a photo of her pelmeni! Very good for a first try. The edges, Ajax… tell her: pinch twice. Gently.", (s) => flag(s, 'recipe')),
      W("Mr. Pulcinella's driver, Mr. Pulcinella's hotel… He is so generous with us. You thank him for me, my sun. I always forget.", (s) => any(s, 'fatui_pickup', 'kids_grand')),
      W("Tonia came out of her room and hugged me for no reason. She's never done that. Did you two talk? Whatever you said, thank you.", (s) => flag(s, 'told_tonia')),
      W("It was so good to hear your voice. You sounded tired, my sun. Sleep. Then eat something. Then sleep again.", (s) => flag(s, 'mama_called')),
      W("Teucer played me your little song before bed. I had to go to the kitchen for a minute. Onions. There were onions.", (s) => flag(s, 'lullaby_sent')),
      W("You spoil him, Ajax. Teucer hasn't stopped talking about his present. Thank you, my sun.", (s) => flag(s, 'gift_teucer')),
      W("My sun, I dreamed you were very far away and someone else was answering for you. Silly. Tell me it's silly.", (s) => total(s) >= 15),
    ],
    confused: [
      "My sun? I don't understand. Is that one of your Liyue words?",
      "Ajax, you don't sound like yourself. Did you eat? You always get strange when you don't eat.",
      "Sweetheart, I read that twice and I still don't know what you mean. I'm old. Explain it to me slowly.",
      "That's not like you, my sun. Is someone being unkind to you at work? Tell Mama.",
      "Ajax… are you sure you're all right? All your words are in the right order, and you never put them in the right order.",
      "I'll ask Tonia what that means. She knows the internet.",
    ],
    voiceReact: [
      "My sun? That isn't your voice… Are you sick? You sound like a stranger. Drink something hot.",
      "I played your message three times. A mother knows her son's voice, Ajax. Who is that?",
      "Is that a friend of yours? He sounds nice. But where are you, my sun?",
      "You've lost your voice! I knew it, that Liyue rain. Honey and hot milk. Now.",
    ],
    imgReact: [
      "So beautiful! I'm showing your father. He says ‘hm’. That means he likes it.",
      "Is this where you live? It's lovely, my sun. Are you eating there?",
      "I'm printing it for the fridge. The fridge is full of you.",
    ],
    fishReact: [
      "What a fish! Your father is pretending he's not jealous. He's jealous.",
      "My sun, that's a beautiful fish. Did you eat it? Please eat it. Eat something.",
      "Oh, Ajax. You looked just like this when you were six, with your first fish, except the fish was the size of a spoon.",
      "Your father says you're holding the rod wrong in this one. Then he saved the photo. Twice.",
    ],
    confess: [
      "You're not my son…? Then where is he? Please, if you've seen him, tell me he's eating. Tell me he's safe.\nGive his phone back. And thank you for telling me. You sound like a good child.",
      "Oh. Oh, I see. I think a part of me knew.\nPlease find my son and give it back to him. And tell him to call his Mama.",
    ],
    confessCall: [
      "You're not my son? Then… where is he? Is he safe? Is he eating? Please find him. Give it back to him, and tell him to call his Mama.",
    ],
  });

  set('papa', {
    idle: [
      "Good to hear from you, son. Ice is thick this week. Fish are deep. — Papa",
      "Your mother says you're well. I believe it more when you tell me yourself. — Papa",
      "Mended the nets today. Thought of you. — Papa",
      "Saw a whale off the point this morning. Smaller than the one I tell about. Don't tell your brothers. — Papa",
      "Keep your feet dry and your back to the wall. That's all the advice I have. — Papa",
      "Proud of you. I don't say it. I'm saying it. — Papa",
      W("Pulcinella sends cars for us now. I did not ask for this. I don't like owing that man twice. — Papa", (s) => flag(s, 'fatui_pickup')),
      W("Your mother has a pen friend in Liyue now. A cook. She is very happy. Thank you. — Papa", (s) => flag(s, 'recipe')),
      W("Your mother is worried. Call her. Not me. Her. — Papa", (s) => sus(s, 'mama') >= 3),
    ],
    confused: [
      "Don't understand. Speak plain, son. — Papa",
      "That doesn't sound like you. You all right? — Papa",
      "Your mother will have to read me that one. — Papa",
    ],
    voiceReact: [
      "Couldn't hear you over the wind. Or that wasn't you. Which? — Papa",
      "Son, that's not your voice. I know your voice. I taught it to shout across a boat. — Papa",
    ],
    imgReact: [
      "Good. Thank you. — Papa",
      "Fine light. Fine water. — Papa",
    ],
    fishReact: [
      "Good fish. Hold the rod higher next time. — Papa",
      "Bigger than mine. Don't tell your mother I said so. — Papa",
      "That one's a fighter. You can see it in the jaw. Like you. — Papa",
    ],
    confess: [
      "Then you have my son's phone. Get it back to him. He'll thank you. So will I. — Papa",
      "Hm. Thought so. Be as honest with him as you were with me. — Papa",
    ],
  });

  // ── Liyue ────────────────────────────────────────────────────────
  set('ht', {
    idle: [
      "mr. harbinger!! 👻 what's up, buttercup. besides me. i'm up. always up",
      "poem of the day:\nthe fisherman fished, the fish didn't bite, now both of them nap at wangsheng tonight 🦋⚰️",
      "reminder that your vip card gets you 10% off any coffin of your choosing ⚰️ the offer never expires. unlike you 👻",
      "zhongli is staring into a teacup again. should i be worried. he does this. i'm not worried 🦋",
      "do ghosts get bored at funerals. asking for a business plan 👻",
      "what's your favorite flower. no reason. completely unrelated to the parlor's autumn catalog ⚰️🌸",
      "i'm doing the seating chart for the rite of parting and i put you next to the incense. you're welcome 🦋",
      "boo 👻\nthat's it. that was the message",
      "roses are red, lilies are white, wangsheng is open all day and all night ⚰️",
      "if you go before me can i do your funeral. fireworks. a fish-shaped urn. i'll make it SO cool 🐟⚰️",
      "tried to give qiqi a free consultation today. she ran. baizhu glared. normal day 👻",
      "the showroom is closed today for, um, ghosts. lots of ghosts. one very loud ghost who keeps asking for pelmeni 👻",
      "unrelated but does anyone you know drink tea with a towel on their head. hypothetically 🦋",
      W("ok so the beeping 👻 i put the earbuds in a teacup. the teacup is now beeping. you've invented a haunted teacup. thanks", (s) => flag(s, 'knows_hideout')),
      W("there is NOTHING in coffin 4. coffin 4 is a very normal empty coffin with no earbuds in it. stop asking ⚰️", (s) => flag(s, 'knows_hideout') && !flag(s, 'zl_contract')),
      W("co-conspirator check-in 👻 the package ate three bowls of noodles and complained about the pillow. it's a coffin pillow. what did he expect", (s) => flag(s, 'zl_contract')),
      W("zhongli told me about the contract 🦋 so i'm in. welcome to the conspiracy. we have snacks (incense)", (s) => any(s, 'zl_contract', 'ht_ally')),
      W("glaze lilies arrived for zhongli 🌸 he looked at them for SO long. i've seen people look at urns with less feeling. good job 👻", (s) => flag(s, 'lilies_sent')),
      W("zhongli is drinking out of a VERY old teacup and humming. i have never heard him hum. whatever you did, do it again 🦋", (s) => flag(s, 'bought_teaset')),
      W("heard your card's frozen ❄️ wangsheng accepts mora, ghosts and favors. mostly favors 👻", (s) => flag(s, 'card_frozen')),
      W("hmm. hmmmm. 🦋\nyou text like someone wearing someone else's shoes. nice shoes though", (s) => sus(s, 'ht') >= 3 && !flag(s, 'zl_contract')),
      W("i don't joke with people who break contracts with my consultant.\nthe parlor is closed to you. 👻", (s) => any(s, 'morax_sold', 'zl_broken')),
    ],
    confused: [
      "huh?? 👻 is that a riddle. i love riddles. i hate that one",
      "mr. harbinger, that is the least harbinger thing you've ever said 🦋",
      "did a ghost write that. be honest. i can always tell when it's a ghost 👻",
      "a poem for this moment:\nyou typed some words, they made no sense, now hu tao's eyebrows are very tense 🦋",
      "uh huh. sure. and i'm a qixing 👻",
      "you sound like a funeral brochure. and i WROTE the funeral brochure ⚰️",
      W("you don't have to do the voice with me, phone ghost 👻 i know. zhongli knows. the coffins know", (s) => flag(s, 'zl_contract')),
      W("you've got the right phone and the wrong rhythm 🦋 just saying", (s) => sus(s, 'ht') >= 3 && !flag(s, 'zl_contract')),
    ],
    voiceReact: [
      "OOOH a voice note 👻\nthat's not your voice. i'd know. i have the real one— i mean. i've HEARD the real one",
      "who's that 👻 is that a ghost. tell them wangsheng has a very good rate",
      "played it in the showroom. the coffins said ‘not him’. the coffins are never wrong ⚰️",
      "mr. harbinger, your voice got 30% less annoying. suspicious 🦋",
    ],
    imgReact: [
      "ooh pretty. would look nice on a headstone 👻",
      "saving this to my inspiration folder. it's mostly urns 🦋",
      "nice!! zhongli says the composition is ‘adequate’. that's his highest praise after ‘acceptable’",
      "what am i looking at. is it haunted. say yes 👻",
    ],
    fishReact: [
      "a fish!! may it rest in peace. or in a pan. both are respectful 🐟⚰️",
      "another one?? wangsheng does fish funerals now. 80 mora. tiny coffin. very tasteful 🐟🦋",
      "poem for the fish:\nyou swam so proud, you swam so free, now you're a photo sent to me 🐟👻",
      "zhongli saw it over my shoulder and made a face. no tentacles. he made the face anyway",
      W("the guy in coffin 4 saw this and got really emotional?? he said ‘that's MY fish’. weird thing for a ghost to say 👻", (s) => flag(s, 'knows_hideout')),
    ],
    confess: [
      W("yeah no i know, zhongli told me 🦋 sweet of you to say it though.\nwangsheng is hiring, by the way. you'd be great at sitting still in the dark", (s) => flag(s, 'zl_contract')),
      "OHHH 👻\nok ok ok. you know what? you're honest, you're brave and you've got nowhere to be. wangsheng is hiring 🦋",
      "i KNEW it. i knew it i knew it 👻\ncongratulations, you're our newest employee. the uniform is a hat. you get the hat",
    ],
    confessCall: [
      "Oh! Oh ho ho. I knew it. You know what? You're honest, you're brave, and you've got nowhere to be. Wangsheng is hiring!",
    ],
  });

  set('lumine', {
    idle: [
      "hey. paimon says hi (she's eating)",
      "what do you want, childe",
      "if this is about the rematch, it's 14–14. i counted.",
      "busy. guild job. someone's cat is on a pillar in the stone forest. don't ask",
      "you're up. of course you're up",
      "noted.",
      "paimon wants to know if hotpot is still on. i want to know why she thinks you're paying",
      "slept 4 hours. fought 3 slimes. ate half a sandwich (paimon ate the other half). normal day",
      "if you find anything on the abyss order, tell me. you promised.",
      "you text like you're about to challenge me to something. no.",
      "fine. one round. no visions. last time you broke a lamppost",
      W("read your notes on the abyss order. twice. thank you, childe. really.", (s) => flag(s, 'gave_abyss_notes')),
      W("the coordinates match something aether said once. i'm not ready to talk about it. but thank you.", (s) => flag(s, 'gave_abyss_notes') && flag(s, 'clue_abyss')),
      W("teucer's going to ask if i'm your girlfriend, isn't he. i'm going to say nemesis.", (s) => flag(s, 'lumine_pickup')),
      W("kids are fine. paimon is teaching teucer to eat faster. this is a mistake.", (s) => any(s, 'lumine_guard', 'kids_rescued')),
      W("got your siblings out of the grand. teucer thinks it was a game. let him.", (s) => flag(s, 'kids_rescued')),
      W("stop feeding paimon. she's eaten five thousand mora of food on your card and is now asleep in a bowl", (s) => num(s, 'paimon_total') > 5000),
      W("paimon says you're being weird. she says that about everyone who doesn't feed her. but she's usually right", (s) => sus(s, 'paimon') >= 2),
    ],
    confused: [
      "what",
      "childe. are you ok",
      "that didn't sound like you. you sounded… polite",
      "paimon read it and said ‘huh’. that's the most thinking she's done all week",
      "is this a code. if it's a fatui code, i'm not translating it",
      "try again. in childe",
      W("the childe i know would have challenged me to a fight by now. you haven't. who are you", (s) => sus(s, 'lumine') >= 3),
    ],
    voiceReact: [
      "that's not your voice.",
      "who is that. where's childe",
      "paimon says that voice is ‘30% less annoying’. i agree. that's the problem",
    ],
    imgReact: [
      "nice.",
      "where is this. is there a domain nearby",
      "paimon wants to know if there's food in it. there isn't. she's disappointed",
      "saved. no idea why.",
    ],
    fishReact: [
      "another fish. congrats.",
      "paimon wants to know if you're eating it. she's already decided you're sharing",
      "you named it, didn't you. what's this one called. be honest",
      "big one. still smaller than your ego",
    ],
    confess: [
      W("you sent me those notes. you didn't have to.\nthank you. now give it back to him. i'll help you.", (s) => flag(s, 'gave_abyss_notes')),
      "…i knew something was off.\nwhere's childe. is he safe. give the phone back, and if you're in trouble, find me first.",
      "thanks for telling me. most people wouldn't.\nbring it to the adventurers' guild. i'll make sure it gets to him",
    ],
    confessCall: [
      "I knew something was off. Where's Childe? Is he safe? Bring the phone to the Adventurers' Guild. And if you're in trouble, find me first.",
    ],
  });

  set('paimon', {
    idle: [
      "CHILDE!!! Paimon was JUST thinking about you!!! (Paimon was thinking about food. Same thing!!!) 🍲",
      "IS HOTPOT STILL ON??? Paimon has been fasting since lunch!!! (Paimon had a snack. Two snacks.) 🔥🍲",
      "Paimon wants to know what Snezhnayan food tastes like!!! Bring some!!! ALL of it!!! 🥟",
      "Lumine says Paimon can't order food on your account. Paimon says Lumine isn't the boss of Paimon!!! 😤",
      "HI CHILDE!!! Paimon is eating!!! Paimon is always eating!!! 🍡",
      "Paimon found a NEW noodle place!!! It's next to Wanmin!!! It's NOT better than Wanmin!!! Don't tell Xiangling!!! 🍜",
      "Almond tofu is a DESSERT and also a SNACK and also BREAKFAST!!! Paimon has decided!!! 🍮",
      "Paimon has a VERY important question!!! What's the BIGGEST fish you ever ATE!!! 🐟🍽️",
      "Lumine is training again!!! Paimon is SUPPORTING her!!! From the couch!!! With dumplings!!! 🥟",
      "CHILDE!!! Paimon is BORED!!! Being bored makes Paimon HUNGRY!!! You know what that means!!! 🍲🍲",
      "Paimon is NOT emergency food!!! Change Paimon's name in your phone!!! Paimon KNOWS!!! 😤",
      "Xiangling made a new dish with SLIME in it!!! Paimon ate it!!! Paimon regrets NOTHING!!! 🔥",
      W("CHILDE YOU ARE THE BEST!!! Paimon has decided you're Paimon's FAVORITE Harbinger!!! (You're the only one Paimon knows!!!) 🍲💖", (s) => num(s, 'paimon_total') > 5000),
      W("Lumine is giving Paimon ‘the look’ because of all the food you bought!!! Paimon is IGNORING ‘the look’!!! 🍡🍡", (s) => num(s, 'paimon_total') > 5000),
      W("Paimon… can't… move… Paimon is SO FULL… send ONE more dessert… for SCIENCE… 🍮", (s) => num(s, 'paimon_total') > 12000),
      W("The food came!!! Paimon is CRYING!!! Happy crying!!! You're a REAL friend, Childe!!! 🥟😭", (s) => num(s, 'paimon_fed') >= 1 && num(s, 'paimon_total') <= 5000),
      W("Lumine read your notes and went really quiet!!! Paimon gave her a dumpling!!! Thank you for helping her, Childe… (Paimon means it!!!) 🥟", (s) => flag(s, 'gave_abyss_notes')),
      W("CHILDE!!! The food app says your card is FROZEN!!! Like ICE!!! How is Paimon supposed to EAT!!! 😱❄️", (s) => flag(s, 'card_frozen')),
      W("Paimon is going to the AIRPORT with Lumine to get your little brother!!! Paimon is bringing him SNACKS!!! (Paimon will eat the snacks on the way!!!) ✈️🍪", (s) => flag(s, 'lumine_pickup')),
      W("Hmmm… Paimon thinks you're acting WEIRD!!! Paimon is telling Lumine!!! (Paimon already told Lumine!!!) 👀", (s) => sus(s, 'paimon') >= 2),
    ],
    confused: [
      "HUH??? Paimon doesn't get it!!! 🤔",
      "Childe, did you hit your head on a fish??? 🐟💫",
      "That's the WEIRDEST thing Paimon has ever read!!! And Paimon reads MENUS!!! 📜",
      "Paimon is going to pretend you said ‘Paimon, let's get hotpot’ 🍲",
      "Is that SNEZHNAYAN??? It doesn't sound like Snezhnayan!!! It sounds like a NERD!!! 🤓",
      "Lumine!!! LUMINE!!! Childe is being WEIRD!!! 👀",
      "Paimon read that three times and now Paimon is HUNGRY!!! Thinking makes Paimon HUNGRY!!! 🍡",
    ],
    voiceReact: [
      "WHO IS THAT??? That's NOT Childe's voice!!! Childe sounds like a SHOUTY FISH!!! 🐟",
      "Paimon played it for Lumine and Lumine made her ‘hmm’ face!!! THE HMM FACE!!! 👀",
      "Did you catch a COLD??? You should eat SOUP!!! Paimon will help you eat the soup!!! 🍲",
    ],
    imgReact: [
      "Is that FOOD??? It's not food… Paimon is disappointed… 😔",
      "PRETTY!!! Can you eat it??? 🍽️",
      "Paimon saved it!!! Paimon saves everything!!! Mostly food!!! 📸",
    ],
    fishReact: [
      "FISH!!!! Is it for EATING??? Say it's for eating!!! 🐟🍽️",
      "THAT'S A BIG ONE!!! Paimon could eat that in… two bites!!! Three!!! 🐟😋",
      "Grill it!!! Fry it!!! Hotpot it!!! Paimon is OPEN to suggestions!!! 🔥🐟",
      "Did you NAME it again??? You can't NAME food, Childe!!! It makes Paimon SAD when Paimon eats it!!! (Paimon will still eat it!!!) 🐟",
    ],
    confess: [
      W("You're not Childe??? Then… then who paid for all that FOOD??? 😱\nPaimon will remember you FOREVER, stranger!!! 🍲💖", (s) => num(s, 'paimon_total') > 5000),
      "WHAAAAT??? You're NOT Childe??? Then who's been buying Paimon FOOD??? 😱\nLUMINE!!! LUMINE COME HERE!!!",
      "Paimon KNEW it!!! (Paimon didn't know it!!!)\nGive Childe his phone back!!! But… maybe order ONE more hotpot first??? 🍲",
    ],
    confessCall: [
      "WHAT?! You're not Childe?! Then who's been buying Paimon food?! Lumine! LUMINE! Come here, quick!",
    ],
  });

  set('xl', {
    idle: [
      "Childe!!! Perfect timing, I just took a fish stew off the fire 🔥 Want some? I'll send Guoba with it! (He'll eat half.)",
      "Hi hi!! Did you ask your mama about the pelmeni recipe yet?? I've tried six times and they keep exploding 🥟💥",
      "Childe, what's the spiciest thing in Snezhnaya? I need to know. For science 🌶️",
      "New dish idea: Snezhnayan dumplings with Liyue chili oil!! I'm calling it The Harbinger 🔥🌶️",
      "The hotpot crew owes me three pots and one ladle. Paimon has the ladle. I KNOW Paimon has the ladle 🍲",
      "Tasting night at Wanmin on Thursday! Bring Zhongli. Make him try something with tentacles. I want to see his face 😆",
      "Guoba is sitting on the chopping board again. He says hi. He also says he's not moving 🔥",
      W("YOUR MAMA SENT THE RECIPE!!! 🥟🔥 Ice water in the filling!!! Pinch the edges TWICE!!! I'm crying into the dough", (s) => flag(s, 'recipe')),
      W("Pelmeni attempt #7 with your mama's recipe: PERFECT. They're going on the menu as ‘Mama's Pelmeni’. She eats free forever 🥟", (s) => flag(s, 'recipe')),
      W("Delivered pelmeni to your night shift again! Big Boris hugged me. The Pyro guy tried to ‘help’ with the steamer 🔥😅", (s) => num(s, 'ops_morale') >= 2),
      W("Saw your Wanmin Go order come through! I put extra chili in. You didn't ask. You never have to ask 🌶️", (s) => acted(s, 'order')),
      W("Childe, Paimon's orders on your account… I had to call my dad in to help with the woks 🔥 He says thank you. And also ‘is she okay’", (s) => num(s, 'paimon_total') > 5000),
    ],
    confused: [
      "Huh?? Is that a recipe? It sounds like a recipe gone wrong 😅",
      "Childe, you okay? That sounded like something Zhongli would say! 🌶️",
      "I don't get it, but I'm going to cook something about it 🔥",
      "Did Guoba walk on your phone?? He does that to mine",
    ],
    voiceReact: [
      "Wait, who's that?? That's not your voice! Are you sick?? I'll make soup 🍲",
      "Ooh, a voice message! …Hm. You sound different. Less spicy. 🌶️",
    ],
    imgReact: [
      "Ooh! Is it edible? 😋",
      "Pretty!! That would look great on a plate 🔥",
    ],
    fishReact: [
      "FISH!!! Bring it here!!! I'll make it three ways 🔥🐟",
      "That's a good one! Steamed with ginger, or braised with chili? (Chili.) 🌶️🐟",
      "Guoba saw it over my shoulder and started drooling 🔥",
    ],
    confess: [
      "Wait, you're not Childe?? Oh no!! 😱\nOkay, come to Wanmin, I'll feed you while we figure out how to get it back to him! 🍲",
      "Ohh, that makes sense, Childe never asks how my day was 😅\nBring it by Wanmin! There's food!",
    ],
    confessCall: [
      "Wait, you're not Childe? Oh no! Okay, come by Wanmin Restaurant, I'll feed you while we figure out how to get it back to him!",
    ],
  });

  set('beidou', {
    idle: [
      "Kid! You still owe me a rematch, or did you forget which end of the sword to hold? ⚓",
      "Ahoy! I'm docked till Monday. The Alcor's deck is clean, the crew's bored, and I'm itching for a fight.",
      "Kazuha says the wind smells like trouble tonight. He's poetic. I'm just saying it smells like trouble. ⚓",
      "Kid, the Crux has a betting pool on our rematch. The odds are not in your favor. Prove me wrong.",
      "Ha! Got your message. I'm on deck with a jug of wine. Come aboard, the stars are free.",
      "If you're texting me this late, either you want a fight or you want a drink. Both are on deck. ⚓",
      W("Saturday, 22:00, the Alcor. Show up, kid, or I tell every sailor in Liyue you're scared of a little salt water. ⚓", (s) => flag(s, 'beidou_accepted') && !flag(s, 'beidou_went') && !flag(s, 'beidou_snubbed')),
      W("Next week, then. You'll still lose. Kazuha's already writing the poem about it. ⚓", (s) => flag(s, 'beidou_rain_check')),
      W("You stood me up, kid. The whole crew watched me wait on deck. Don't ask the Crux for any favors soon.", (s) => flag(s, 'beidou_snubbed')),
      W("Bring the little ones aboard whenever. Kazuha's cleared a cabin, and the small one can hold the wheel. ⚓", (s) => flag(s, 'kids_alcor')),
      W("You've gone soft, kid. Where's the guy who offered to fight my whole crew at once?", (s) => sus(s, 'beidou') >= 2),
    ],
    confused: [
      "Kid, I don't know what that means, but I'll fight you about it. ⚓",
      "That's the least ‘you’ thing you've ever said. Did you fall overboard?",
      "Huh. Kazuha read it and said ‘the waves are confused tonight’. So am I.",
      "Speak plain, kid. I'm a sailor, not a scholar.",
    ],
    voiceReact: [
      "Who's that? That's not your voice, kid. You sound like you've never shouted at a storm.",
      "Ha! Nice try. That voice couldn't win a fight with a seagull.",
    ],
    imgReact: [
      "Nice view. Mine's better. Come see it. ⚓",
      "Kazuha says it's beautiful. I say it needs more ocean.",
    ],
    fishReact: [
      "That's it? The crew's pulled bigger ones out of the bilge. ⚓🐟",
      "Ha! Not bad, kid. Not bad. Still not a sea monster.",
      "Bring it to the Alcor. The cook'll grill it and we'll fight over the last piece.",
    ],
    confess: [
      "Hah! I knew something was off. That kid's never turned down a fight in his life.\nBring the phone to Crux Pier. If you're in trouble, the Alcor sails Monday.",
      "Not the kid, huh? Well, you've got guts telling me.\nGet it back to him. And tell him the rematch is still on.",
    ],
    confessCall: [
      "Ha! I knew something was off. That kid's never turned down a fight in his life. Bring the phone to Crux Pier, and tell him the rematch is still on.",
    ],
  });

  set('yelan', {
    idle: [
      "Evening, Tartaglia. Or whoever's rolling the dice tonight. 🎲",
      "Bold of you to write first. I like a player who bets before seeing the cards.",
      "I'm at a teahouse. Second table from the door. You can't see me. I can see everyone. 🎲",
      "Let's play a game. You tell me something true, I tell you something you don't know. Your move.",
      "Snake eyes. That's what you've been rolling lately. Just a friendly observation.",
      "Liyue is a small city for such big secrets. Be careful which ones you drop.",
      W("The protocol was very educational. Thank you. Our deal stands, as long as the dice keep landing my way. 🎲", (s) => flag(s, 'leaked_yelan')),
      W("Your siblings have a new shadow. Don't look for her. That's the point.", (s) => flag(s, 'yelan_protects_kids')),
      W("We both know you're not him. Relax. I never flip the table on an interesting player.", (s) => sus(s, 'yelan') >= 4),
    ],
    confused: [
      "Hm. That's either a bluff or a tell. I'm leaning tell.",
      "You type like someone reading over his own shoulder.",
      "Cute. Try again, with fewer obvious mistakes. 🎲",
    ],
    voiceReact: [
      "That's not his voice. Thanks for the freebie. 🎲",
      "A voice message, from you. That was a terrible roll.",
    ],
    imgReact: [
      "Noted. Filed. You'd be amazed what a background gives away.",
      "Pretty. The reflection in the window is prettier. 🎲",
    ],
    fishReact: [
      "A fish. Very in character. Almost too in character.",
      "He'd have bragged about the weight. You didn't. Interesting.",
    ],
    confess: [
      "Finally, a straight answer. I knew by Saturday, but I appreciate the gesture. 🎲\nKeep the phone on. I'll be in touch, and then it goes home.",
      "There it is. The dice always come up eventually.\nDon't hand it to the Fatui. Hand it to me, or to the funeral parlor.",
    ],
  });

  set('ning', {
    idle: [
      "Tartaglia. To what do I owe this?",
      "The Jade Chamber has received your message. I will consider it at my leisure.",
      "Northland's quarterly figures are on my desk. They are interesting. Not flattering, but interesting.",
      "I am in a meeting with six ministers. Be brief.",
      "Your bank's gala was tolerable. The canapés were not.",
      W("I have read the attachment. Liyue thanks you. I will not, in writing.", (s) => flag(s, 'leaked_ning')),
      W("I hear a certain account has stopped moving. Markets notice these things, Tartaglia. So do I.", (s) => flag(s, 'card_frozen')),
      W("The sea around Guyun is rising. If Northland is responsible, Northland will pay. Every Mora.", (s) => flag(s, 'osial_sent')),
    ],
    confused: [
      "I do not follow. Rephrase.",
      "That was beneath you. Or beneath someone.",
      "Interesting. Unlike you, but interesting.",
    ],
    voiceReact: [
      "That is not your voice, Tartaglia. I would advise whoever it belongs to to stop.",
      "A stranger's voice on a Harbinger's phone. How valuable.",
    ],
    imgReact: [
      "Received.",
      "I have finer views from my window. But thank you.",
    ],
    fishReact: [
      "A fish. I will add it to the file I keep on you.",
      "Congratulations. Liyue's waters are generous. Do not grow used to it.",
    ],
    confess: [
      "How refreshing. Honesty is rare, and therefore expensive.\nBring the phone to the Jade Chamber. You will be well compensated, and well watched.",
      "I see. Then everything sent from this number has a value I did not anticipate.\nDo not destroy it.",
    ],
  });

  set('xiao', {
    idle: [
      "I said stay away.",
      "…",
      "Do not write to me.",
      "You reek of the sea. And of trouble.",
      "If harm comes to him, I will find you.",
      "Hmph.",
      W("He trusts you. I do not. That is how it will remain.", (s) => flag(s, 'zl_contract')),
    ],
    confused: [
      "…What?",
      "Speak plainly or not at all.",
    ],
    voiceReact: [
      "That is not his voice.",
    ],
    imgReact: [
      "Why.",
    ],
    fishReact: [
      "…",
      "Do not send me fish.",
    ],
    confess: [
      "I know. Return it to him. Then stay away from Zhongli-xiansheng.",
    ],
  });

  set('yunjin', {
    idle: [
      "Good evening, Mr. Tartaglia! The troupe sends its regards, and its thanks for your patronage.",
      "Ah, a message mid-rehearsal! The gong is about to sound, so I shall be brief, which is not my nature.",
      "I am still choosing the encore. Something tragic or something triumphant? Mr. Zhongli would say ‘both’.",
      "If you hear singing from the harbor tonight, it is me. If it is out of tune, it is not me.",
      "How kind of you to write. The theatre is quiet tonight, and quiet theatres are full of ghosts. Pleasant ones.",
      W("Box 2 was occupied, I saw. Mr. Zhongli, mouthing every line as usual, and beside him someone I could not quite make out under the lights. The stage lights are cruel, but they are not usually that cruel.", (s) => flag(s, 'zl_opera_live')),
      W("The tea sent to Heyu was a lovely touch. Mr. Zhongli drank it through the entire second act and did not once wince at my high notes.", (s) => flag(s, 'zl_tea_sent')),
    ],
    confused: [
      "I confess I do not follow, Mr. Tartaglia, but I do love a mystery in the second act.",
      "How very unlike you! Is this a new role you are rehearsing?",
    ],
    voiceReact: [
      "A voice message! The timbre is pleasant, but I know voices, Mr. Tartaglia, and that one is not yours.",
      "Whoever that is should breathe from the diaphragm. You always do.",
    ],
    imgReact: [
      "Charming! It would make a lovely backdrop.",
      "Thank you! I shall show it to our set designer.",
    ],
    fishReact: [
      "A splendid fish! There is an opera about a fisherman, you know. It ends badly for the fish.",
      "How triumphant! If only I could sing it a fanfare.",
    ],
    confess: [
      "Oh! What a turn in the third act!\nThank you for your honesty. Please return his phone. The audience demands a proper ending.",
    ],
  });

  // ── Northland Bank / Fatui ───────────────────────────────────────
  set('ekat', {
    idle: [
      "Sir, good evening. Is there something you need? I am still at the front desk.",
      "Sir, I have rescheduled your meeting with the Liyue Exchange. Again. They have stopped asking why.",
      "Sir, the vending machine on the third floor has been ‘liberated’ by Pyotr. I am told this is not a crime if it is for the night shift.",
      "Sir, please eat something. I can send almond tofu from Wanmin to wherever you are, if you tell me where you are.",
      "Sir. Received. I am here.",
      "Sir, Lyuba has asked me to tell you that the aquarium is ‘fine’. I have seen the aquarium. I am passing on her message as written.",
      "Sir, a reminder that you have three unsigned expense reports, all titled ‘dinner (xiansheng)’.",
      "Sir, Security has asked me to ask you, again, to change your passcode. I have asked. Please consider yourself asked.",
      "Sir, the branch is quiet tonight. Too quiet, Big Boris says. He has been watching films again.",
      "Sir, if you need me, I will answer. At any hour. You know that.",
      "Sir, Kolya asked whether ‘Director of Special Collections’ means you collect stamps. I did not correct him.",
      "Sir, no, I will not tell you my birthday. You would do something embarrassing with the whole branch.",
      W("Sir, thank you for the warning. I have cleared my desk and I am not sleeping at home tonight. Please do not worry about me.", (s) => flag(s, 'ekat_warned')),
      W("Sir, I am safe. I have told no one where. Not even you, which I think you would approve of.", (s) => flag(s, 'ekat_warned')),
      W("Sir… people from Signora's office were at my desk this morning. They were very polite. They asked about the Osial file. I said nothing. Should I be afraid?", (s) => any(s, 'leaked_yelan', 'leaked_ning') && !flag(s, 'ekat_warned')),
      W("Sir, Northland Security has called about your card freeze four times. I have told them you are ‘in a meeting’. You have been in a meeting for a very long time.", (s) => flag(s, 'card_frozen')),
      W("Sir, about your siblings: I have made a sign that says ‘NORTHLAND TOYS’. I believe it is the most important document I have ever produced.", (s) => flag(s, 'ekat_pickup')),
      W("Sir, the toy factory tour was… a success. Big Boris wore the elf hat for two hours. He has asked to wear it again. I said that is up to you.", (s) => flag(s, 'factory_bank')),
      W("Sir, morale in the branch is unusually high. Pyotr is singing. I am told it is because of you. I am inclined to believe it.", (s) => num(s, 'ops_morale') >= 2),
      W("Sir… the sea is very loud tonight. I hope you know what you have done.", (s) => flag(s, 'osial_sent')),
      W("Sir, forgive me, but you are writing very… carefully. You are never careful with me. Is someone watching your phone?", (s) => sus(s, 'ekat') >= 2),
    ],
    confused: [
      "Sir? I am not sure I understand. Should I write that down?",
      "Sir, forgive me, but that does not sound like you.",
      "Sir… is someone with you? If you cannot speak freely, say ‘the fish are fine’.",
      "Sir, I have read your message twice. I will pretend I did not, if that is what you need.",
      "Sir, is this about the aquarium? Lyuba swears it was an accident.",
      "Sir, you have never used that word in your life.",
      "Sir, I am worried. That is all. You may ignore this message.",
    ],
    voiceReact: [
      "Sir… that is not your voice.",
      "Sir, I listened to it with the volume very low, at my desk. Whoever that is, it is not you. Are you safe?",
      "Sir, if you are being made to send this, you do not need to answer. I will understand.",
    ],
    imgReact: [
      "Sir, received. Shall I file this?",
      "Sir, thank you. I am not certain what it is, but I have saved it.",
      "Sir, is this for the toy catalogue? I keep a folder.",
    ],
    fishReact: [
      "Sir, a very handsome fish. Please do not bring it to the office. Lyuba will freeze it.",
      "Sir, congratulations. Shall I add it to the Fishing Log? I know you keep one.",
      "Sir, the branch has seen the photo. Pyotr has asked if it is ‘for the aquarium’. I have said no. Firmly.",
      "Sir, it is a beautiful fish. Have you eaten anything today that was not a fish?",
    ],
    confess: [
      W("You warned me. Whoever you are, you warned me.\nThank you. Now please, get his phone back to him. Not through the bank.", (s) => flag(s, 'ekat_warned')),
      "…I knew. I think I knew from the first message.\nIs he alive? Please. Just tell me whether he is alive.",
      "Thank you for telling me. Please do not bring the phone to the bank. Signora's people are everywhere.\nGive it to Mr. Zhongli at Wangsheng. He will know what to do.",
    ],
    confessCall: [
      "I think I knew from the first message. Is he alive? Please, just tell me he is alive. And do not bring the phone to the bank. Signora's people are everywhere.",
    ],
  });

  set('signora', {
    idle: [
      "Tartaglia. If you have something to say, put it in a report.",
      "I do not have time for your chatter, Tartaglia. You, it seems, have nothing but time.",
      "Your authorization, Tartaglia. Everything else is noise.",
      "I received your message. I have chosen not to understand it.",
      "Do not mistake my silence for patience. I am never patient. I am merely busy.",
      "Every word you send me is on file, Tartaglia. I suggest you choose them with care.",
      "Fishing again? How restful. Some of us are working for the Tsaritsa.",
      "Liyue is cold for October, Tartaglia. You would know. You seem to like the cold water.",
      "You are the Eleventh. Remember that the table counts down, not up.",
      "Your name looks very well at the bottom of every page. I had it typeset.",
      "The founder's lanterns go out soon. I trust you are counting the hours. I am.",
      W("You froze the card. How childish. How very effective. Unfreeze it, Tartaglia, or I will come to you, and I do not knock.", (s) => flag(s, 'card_frozen')),
      W("Pantalone informs me that the Osial account is frozen. He was almost amused. I was not.", (s) => flag(s, 'card_frozen')),
      W("Your siblings will be so comfortable with Pulcinella's driver. Remember that when you consider your answer.", (s) => flag(s, 'fatui_pickup')),
      W("The Liyue Harbor Grand has very thin walls. I mention it only as a matter of hospitality.", (s) => flag(s, 'kids_grand')),
      W("Someone has been speaking to the Qixing. I am looking for a mole, Tartaglia. I will find one. Whether it is the right one is a matter of indifference to me.", (s) => any(s, 'leaked_yelan', 'leaked_ning')),
      W("Your receptionist did not come to work today. Curious. I had such questions for her.", (s) => flag(s, 'ekat_warned')),
      W("The code you sent me was a fiction. I do not appreciate fiction.", (s) => flag(s, 'osial_fake')),
      W("You are stalling, Tartaglia. Stalling is a form of refusal, and I answer refusal.", (s) => flag(s, 'osial_stalled')),
      W("‘No.’ A single word. How economical. You will find that I can be economical too.", (s) => flag(s, 'osial_refused')),
      W("Thank you, Tartaglia. The sea is answering. Your name will be remembered. Not fondly.", (s) => flag(s, 'osial_sent')),
      W("Scaramouche tells me you have become polite. I did not believe him. I am beginning to.", (s) => sus(s, 'scara') >= 3),
    ],
    confused: [
      "I do not understand you, Tartaglia, and I have no intention of trying.",
      "Is that meant to be a joke? You are not funny. You have never been funny.",
      "Tartaglia. Compose yourself.",
      "That is a strange thing for you to say. I have made a note of it.",
      "Write in full sentences, or do not write.",
      "You sound almost courteous. It does not suit you.",
      W("You write strangely tonight. Either you are frightened, or you are not you. I would enjoy either.", (s) => sus(s, 'signora') >= 3),
    ],
    voiceReact: [
      "That is not your voice. Whose is it?",
      "I do not listen to voice messages, Tartaglia. I listened to this one. That was a mistake. Yours.",
      "An interesting voice. Not yours. I will remember it.",
    ],
    imgReact: [
      "I have no use for this.",
      "Do not send me photographs, Tartaglia. Send me your authorization.",
      "Noted. Deleted.",
    ],
    fishReact: [
      "A fish. Of course.",
      "If you gave your duties half the attention you give the sea, Osial would be finished.",
      "How quaint. I hope it struggled.",
    ],
    confess: [
      "Then whoever you are, you are holding the property of the Northland Bank Group. Stay where you are. Someone will come for it.\nAnd for you.",
      "Interesting. Then Tartaglia is hiding, and you are his voice.\nYou will regret lending it.",
    ],
  });

  set('scara', {
    idle: [
      "what",
      "eleventh. i was having a good night. was.",
      "do you text everyone this much or am i special. don't answer. i know i'm special",
      "fishwife. i can smell the harbor through the screen",
      "you have the attention span of a minnow and the face to match",
      "if this is about the tuna i still haven't forgiven you. i will never forgive you. it had my NAME",
      "go bother the funeral man. he likes you. no one knows why",
      "signora is in a mood. that's your fault. i can tell. everything is your fault",
      "i'm busy. i'm busy right now ignoring you",
      "eleventh, you're the only harbinger who uses exclamation marks. it's like being yelled at by a puppy",
      "blocked. unblocked. wanted to see your next message. it was stupid. reblocking in five minutes",
      "how's the little toy job, mr. salesman. do the brats still believe it. adorable",
      W("you're not him. the eleventh would've called me something by now. so. who are you, and how long can you keep this up", (s) => sus(s, 'scara') >= 4),
      W("i'm writing this down. every comma. you use commas like someone who went to school. he didn't", (s) => sus(s, 'scara') >= 4),
      W("two more slips and i tell everyone. i'm counting. i love counting", (s) => sus(s, 'scara') >= 6),
      W("fine. you remembered the tuna. you're still an idiot. at least you're the right idiot", (s) => flag(s, 'scara_quiz_ok')),
      W("you froze the card. signora's face. i would pay to see it again. i'd pay with your card but it's frozen", (s) => flag(s, 'card_frozen')),
      W("you told her no. huh. didn't think you had a spine. it's a small spine. but it's there", (s) => flag(s, 'osial_refused')),
      W("pulcinella's sending a driver for your brats. how kind of him. kindness costs extra, eleventh", (s) => flag(s, 'fatui_pickup')),
      W("someone talked to the qixing. signora's hunting. i bet it was you. i bet it wasn't. either way i win", (s) => any(s, 'leaked_yelan', 'leaked_ning')),
      W("saw your post. since when do you post things that aren't fish or threats. who are you", (s) => acted(s, 'post')),
    ],
    confused: [
      "what is this. are you having a breakdown. do it somewhere i can watch",
      "eleventh. that was almost a sentence",
      "you sound like a customer service bot that fell in the sea",
      "who taught you that word. not the funeral man. he'd have taught you a longer one",
      "lol no",
      "that's not how you talk. you talk like a puppy with a knife. that was a cat with a cough",
      W("slip number… i lost count. no i didn't", (s) => sus(s, 'scara') >= 4),
    ],
    voiceReact: [
      "that's not your voice. i'd know. i've been forced to hear it at every meeting since march",
      "who's this. did you finally get a voice coach. demand a refund",
      "interesting. very interesting. play it for signora, she'll love it",
      "you sound like someone pretending to be you. badly",
    ],
    imgReact: [
      "why",
      "deleted. unread. deleted again",
      "the most boring photo ever taken. impressive",
      "are you trying to make me feel something. it's not working",
    ],
    fishReact: [
      "if that fish has a name i will end you",
      "another one. does it have my name too. does it have my BIRTHDAY",
      "fishwife sends fish. what a surprise. what a twist",
      "it has your eyes. dead, and slightly stupid",
      W("still not as ugly as the bluefin. that was the ugliest fish i've ever seen and you named it after me. i remember. i will always remember", (s) => flag(s, 'scara_quiz_ok')),
    ],
    confess: [
      "oh. oh, this is perfect.\nthe eleventh lost his phone and a stranger's been playing him for days. signora's going to love this. so is everyone",
      "i knew it. i knew it before you did\nstay where you are. or don't. it's more fun if you run",
      "say that again. slower. i'm screenshotting",
    ],
  });

  set('dottore', {
    idle: [
      "Tartaglia. How is your heart rate? I ask because your watch stopped reporting to me at 23:24 on Friday.",
      "Your Delusion readings are overdue. I do not like things that are overdue. I tend to collect them.",
      "Good evening. I was just thinking about you. Professionally.",
      "Remember to bring the boy on Monday. Nine o'clock. He won't feel a thing. Well. He will feel a small thing.",
      "Are you sleeping, Tartaglia? Your average is five hours and ten minutes. Insufficient, for a specimen of your quality.",
      "I have cleared my Monday morning for you and your brother. I so rarely clear anything.",
      W("You cancelled our appointment. How disappointing. I will simply reschedule. I always reschedule.", (s) => flag(s, 'dottore_cancelled')),
      W("The Knave has written to me about your brother. She is very protective. I find protection fascinating. It always tells you where to look.", (s) => flag(s, 'arle_protects')),
      W("Your messages show elevated irregularity. Are you quite yourself, Tartaglia? I would love to find out.", (s) => sus(s, 'dottore') >= 2),
    ],
    confused: [
      "Interesting. Your syntax has changed. Have you been overusing the Delusion?",
      "I do not understand you. That is rare, and I would like to study it.",
      "Repeat that, please. Slowly. I am taking notes.",
    ],
    voiceReact: [
      "That is not your vocal profile. I have your vocal profile. I have all of your profiles.",
      "A different voice. A different person. How wonderful. Who are you?",
    ],
    imgReact: [
      "Received. I have enhanced the reflections. You should know I always enhance the reflections.",
      "Not useful. Send blood.",
    ],
    fishReact: [
      "A fish. I have dissected several. They are less complicated than you.",
      "Charming. The eyes are clouded. Was it kept too long out of the water? You do that with things.",
    ],
    confess: [
      "Oh. Oh, how lovely.\nDo stay where you are. I would very much like to meet you. In person. For a short while.",
      "A substitute. Fascinating. A stranger's baseline would be almost as useful as the boy's.\nWhere are you?",
    ],
  });

  set('pulci', {
    idle: [
      "My boy! How good to hear from you. Your mother sends her love through me, as always.",
      "Ah, Ajax. I do worry about you out there in Liyue. Old men worry. It's what we're for.",
      "My boy, I hope Liyue is treating you well. And I hope you are treating Liyue as we discussed.",
      "Morepesok is very quiet this week. Such a lovely village. I would hate for anything to disturb it.",
      "Remember who believed in you when you were fourteen and frightened, my boy. I remember. I always remember.",
      "Your little brother asked me whether I sell toys too. I said yes, of course. We all sell something.",
      W("Your mother telephoned me today, my boy. She thinks you sound tired. I told her you are simply working hard. Don't make a liar of me.", (s) => sus(s, 'mama') >= 2 || sus(s, 'tonia') >= 3),
      W("My driver will take very good care of your siblings. Very good care. You have my word, and my word is worth a great deal in Morepesok.", (s) => flag(s, 'fatui_pickup')),
      W("I notice the children won't be using the hotel I booked. A pity. Such a nice hotel. Such attentive staff.", (s) => any(s, 'kids_wangshu', 'kids_alcor', 'kids_zl', 'kids_apartment')),
    ],
    confused: [
      "My boy, I don't quite follow. Are you feeling unwell?",
      "Ajax. You sound like someone else. I don't like it when my boys sound like someone else.",
      "Hm. I'll pretend I didn't read that, for your sake.",
    ],
    voiceReact: [
      "My boy? That isn't your voice. Who is speaking on your phone, hm?",
      "I have known your voice since it broke. That was not it.",
    ],
    imgReact: [
      "Lovely, my boy. I'll show the council.",
      "How nice. I'll keep it with the others.",
    ],
    fishReact: [
      "A fine catch, my boy! You always were a fisherman's son, whatever else you became.",
      "Your father would be proud. Tell him so. Or I will.",
    ],
    confess: [
      "Oh dear. Oh dear, oh dear.\nThank you for telling an old man the truth. Now, where exactly are you standing? I'll send someone kind.",
    ],
    confessCall: [
      "Oh dear. Oh dear, oh dear. Thank you for telling an old man the truth. Now, where exactly are you standing? I'll send someone kind to collect it.",
    ],
  });

  set('pantalone', {
    idle: [
      "Dear Tartaglia. Every message has a cost. This one, I estimate, at four Mora of my time. I will invoice you.",
      "Dear Tartaglia, your dinner expenses this quarter exceed the budget of a small village. I admire your consistency.",
      "Good evening, dear Tartaglia. The markets are calm. You, I suspect, are not.",
      "I see you are awake. So is your card. It is a very active card.",
      "Dear Tartaglia, the bank thanks you for your service. The bank also notes the ‘xiansheng’ line item. Again.",
      W("Dear Tartaglia, you have frozen your card. Three million Mora are now sitting in the cold. I find I have feelings about this, and I do not usually have feelings.", (s) => flag(s, 'card_frozen')),
      W("Dear Tartaglia, I noticed a transfer. I notice every transfer. Sentiment is so very expensive.", (s) => acted(s, 'transfer')),
      W("Dear Tartaglia, your account has bought an unusual quantity of dumplings for a ‘Paimon’. Is she an asset? Please advise.", (s) => num(s, 'paimon_total') > 5000),
      W("Dear Tartaglia, a five-figure sum on antique porcelain. If it is an investment, I approve. If it is a gift, I am deeply curious.", (s) => flag(s, 'bought_teaset')),
    ],
    confused: [
      "Dear Tartaglia, I do not follow. I am sure it was very expensive to say.",
      "That message had no value. I am a little offended.",
      "Unusual phrasing. Unusual phrasing usually precedes unusual spending.",
    ],
    voiceReact: [
      "Dear Tartaglia, that is not your voice. Voices, like signatures, can be forged. I check both.",
    ],
    imgReact: [
      "Received. I have estimated its value. You would not like the number.",
      "Charming. Is it on the expense account?",
    ],
    fishReact: [
      "A fish. Market price, perhaps ℳ900. You will have spent more on the bait.",
      "Dear Tartaglia, please do not expense this.",
    ],
    confess: [
      "How unfortunate. That device holds access to accounts worth more than you are, whoever you are.\nPlease remain where you are. The bank will collect its property. Politely, the first time.",
    ],
  });

  set('arle', {
    idle: [
      "Tartaglia.",
      "I am with the children. Be brief.",
      "You are restless tonight. Sleep, or fight. Do not try both.",
      "Speak plainly. I have little patience and less time.",
      "The Hearth is quiet. Keep yours the same.",
      W("Your brother will not see the Doctor. I have made certain of it. Do not thank me. Keep him close.", (s) => flag(s, 'arle_protects')),
      W("You cancelled his appointment. Good. He will try again. So will I.", (s) => flag(s, 'dottore_cancelled')),
      W("If the Doctor asks you for anything that belongs to your family, you will tell me first.", (s) => flag(s, 'clue_dottore') && !flag(s, 'arle_protects')),
    ],
    confused: [
      "That is not how you speak.",
      "Explain.",
      "Hm. Someone else is holding your words.",
    ],
    voiceReact: [
      "That is not your voice. Who are you.",
    ],
    imgReact: [
      "Noted.",
    ],
    fishReact: [
      "The children here would like that fish. Do not send it.",
      "You fish when you are troubled. Are you troubled.",
    ],
    confess: [
      "I see.\nThen protect his family as if it were yours until the phone is back in his hands. Keep your word, and you will come to no harm.",
    ],
  });

  set('pierro', {
    idle: [
      "Eleventh. The Tsaritsa's work does not pause for conversation.",
      "I have read your message. I have no reply. That is a reply.",
      "Tartaglia. Keep your house in order.",
      "This channel is for business. Use it so.",
      "The table is watching Liyue. Remember that you sit at the table.",
      W("It is done, then. The Tsaritsa will be told of your obedience. Obedience is not loyalty. She knows the difference.", (s) => flag(s, 'osial_sent')),
      W("Pantalone is distressed. When Pantalone is distressed, I am informed. Do not make me informed again.", (s) => flag(s, 'card_frozen')),
    ],
    confused: [
      "Compose yourself, Eleventh.",
      "That is not the voice of a Harbinger.",
    ],
    voiceReact: [
      "That is not your voice.",
    ],
    imgReact: [
      "Irrelevant.",
    ],
    fishReact: [
      "Your hobby is noted.",
    ],
    confess: [
      "Then the Eleventh has been careless. Carelessness is answered. Stay where you are.",
    ],
  });

  set('columbina', {
    idle: [
      "♪ la la… little fish, little fish… ♪",
      "Tartaglia… you're awake. So am I. The birds are not. ♪",
      "I dreamed of the sea last night. It was humming. It was humming your name. ♪",
      "Hello, hello. Did you know the moon over Liyue is shy? It hides behind the stone forest. ♪",
      "♪ hush now, the harbor is sleeping… ♪",
      "Mm… you smell of rain, even through the phone. ♪",
      W("♪ the stone forest is singing now… it's a very old song… you woke it up ♪", (s) => flag(s, 'osial_sent')),
      W("Someone sang a lullaby somewhere near you. I heard it. It was lovely. Was it you? ♪", (s) => flag(s, 'lullaby_sent')),
    ],
    confused: [
      "Hmm? ♪ what a strange little melody",
      "Your words are out of tune today, Tartaglia. ♪",
    ],
    voiceReact: [
      "Ooh, a new voice. ♪ it isn't yours… but it's sweet",
      "That isn't how you sound. I'd know. I know everyone's song. ♪",
    ],
    imgReact: [
      "Pretty… ♪",
      "I'll sing to it later. ♪",
    ],
    fishReact: [
      "♪ little fish, little fish, swimming in a dish… ♪",
      "Did it sing when you caught it? They always sing. ♪",
    ],
    confess: [
      "Oh… ♪ a stranger's song in a familiar shell.\nGive it back to him. And don't be sad. Everyone finds their way home. Mostly. ♪",
    ],
  });

  set('sandrone', {
    idle: [
      "What. I'm busy. The marionette's arm came off again.",
      "Tartaglia. Stop texting. I'm soldering.",
      "If you need a weapon repaired, file a ticket. You won't. You never do.",
      "Your Delusion is overdue for calibration. Not my problem. Dottore's problem. Unfortunately also mine.",
      "I built something that types faster than you. It's also smarter. I'm considering a replacement.",
      W("Pantalone is shouting at the walls. Whatever you did, do it again. The noise helps me think.", (s) => flag(s, 'card_frozen')),
    ],
    confused: [
      "Syntax error.",
      "That doesn't parse.",
    ],
    voiceReact: [
      "Voice print mismatch. Not you. Obviously.",
    ],
    imgReact: [
      "Low resolution. Pointless.",
    ],
    fishReact: [
      "A fish. Structurally inefficient.",
      "I could build you a better one. It wouldn't rot.",
    ],
    confess: [
      "Obviously.\nYour typing cadence changed at 23:47 on Friday. I noticed. I didn't care. Give it back.",
    ],
  });

  // ── Liyue Branch grunts (ops) ────────────────────────────────────
  set('pyotr', {
    idle: [
      "SIR!! yes sir!! pyotr here!! everything is fine!! nothing is on fire!! 🔥 (that's just how i sign)",
      "sir the vending machine ate my mora again. i retaliated. it is now slightly charred",
      "sir is signora coming?? she isn't coming right?? don't answer if she is. just send a fish",
      "sir!! i practiced my fire tricks for the toy factory thing. only singed one eyebrow. mine",
      "sir!!!! hi!!!! i panicked but in a happy way",
      "sir, kolya is lost again. i'm not panicking. ok i'm panicking",
      W("sir the night shift is saying you're the best boss in snezhnaya. i'm saying it louder 🔥🔥", (s) => num(s, 'ops_morale') >= 2),
      W("sir the card is frozen?? was that lyuba?? LYUBA DID YOU FREEZE THE CARD", (s) => flag(s, 'card_frozen')),
      W("sir we're ready for the better idea. i'm not panicking. i'm only on fire a little 🔥", (s) => flag(s, 'ops_sabotage')),
      W("sir… people are saying you don't care about the branch. i said that's not true. was i right?? 😰", (s) => num(s, 'ops_morale') <= -1),
    ],
    confused: [
      "sir??? i don't understand but i'm panicking anyway",
      "is that a code word?? nobody told me the code words!!",
      "sir are you ok?? you sound like signora's secretary 😰",
    ],
    voiceReact: [
      "SIR THAT'S NOT YOUR VOICE. AAAA. sorry. AAAA",
      "who is that?? is that a fatui ghost?? do we have those??",
    ],
    imgReact: [
      "nice pic sir!! 🔥",
      "is this a mission briefing?? i'll study it",
    ],
    fishReact: [
      "SIR WHAT A FISH. lyuba don't you DARE freeze this one",
      "sir can i grill it. i can grill anything. sometimes by accident 🔥",
    ],
    confess: [
      "YOU'RE NOT SIR??? WHERE IS SIR\nok. ok. pyotr is calm. pyotr is not on fire. please bring the phone back",
    ],
    confessCall: [
      "You're not Sir? Where is Sir? Okay. Okay. I'm calm. I'm not on fire. Please bring the phone back!",
    ],
  });

  set('lyuba', {
    idle: [
      "Sir. hello. the aquarium is fine. please do not come to the office",
      "Sir. i have not frozen anything in three hours. personal record ❄️",
      "Sir. the cicins say hello. they are small and cold and they love you",
      "Sir, may i have the afternoon off. i need to apologise to some fish",
      "Sir. the fish are mostly thawed. one of them is looking at me. i think it remembers",
      "Sir. is it true signora is coming. i will be in the walk-in freezer if anyone needs me. it is where i feel safe",
      W("Sir. the night shift made you a card. i froze it so it lasts forever ❄️", (s) => num(s, 'ops_morale') >= 2),
      W("Sir. the card is frozen. it was not me. i want that on the record ❄️", (s) => flag(s, 'card_frozen')),
      W("Sir. nobody is talking to me at the coffee machine. it is colder than usual. and i am the cold one", (s) => num(s, 'ops_morale') <= -1),
    ],
    confused: [
      "Sir? i do not follow. i will wait here. cold",
      "Sir, that does not sound like you. are you cold? i cannot help with that",
      "Sir, i read that and accidentally froze my tea",
    ],
    voiceReact: [
      "Sir. that is not your voice. the cicins are hiding",
      "Sir, you sound like the sea. that sounds like a desk",
    ],
    imgReact: [
      "Sir. nice ❄️",
      "Sir, i will put it on the fridge. it is a very cold fridge",
    ],
    fishReact: [
      "Sir. i promise i will not freeze this one",
      "Sir. is that one of the aquarium fish. please tell me that is not one of the aquarium fish",
      "Sir. beautiful. (i am already apologising to it)",
    ],
    confess: [
      "you are not Sir.\nthe cicins knew. i should have listened to the cicins. please return the phone. carefully. it is probably cold",
    ],
    confessCall: [
      "You are not Sir. The cicins knew. I should have listened to the cicins. Please return the phone. Carefully.",
    ],
  });

  set('boris', {
    idle: [
      "boss. boris here. all quiet. i am guarding the snacks 🛡️",
      "boss, i watched a film about a bear who finds a family. i am not crying. i am big",
      "boss. kolya is lost. i will go find him. i always find him. he is small",
      "boss. you text. boris is happy 🛡️",
      "boss, is signora coming? boris will stand in front of the door. boris is a very good door",
      "boss, some of us have families here now. boris has a cat in liyue. the cat is family",
      W("boss, team says you are the best. boris agrees. boris always agreed 🛡️", (s) => num(s, 'ops_morale') >= 2),
      W("boss, the little brother sat on my shoulders at the toy factory. best day of boris's life. i would wear the elf hat again", (s) => flag(s, 'factory_bank')),
    ],
    confused: [
      "boss? boris not understand. boris will think about it slowly",
      "boss, you okay? that sounded like paperwork",
      "boris read it three times. still no",
    ],
    voiceReact: [
      "boss? not your voice. who is talking? boris is listening very hard",
      "that is a stranger. boris does not like strangers on boss's phone",
    ],
    imgReact: [
      "nice picture boss 🛡️",
      "boris will show his mother",
    ],
    fishReact: [
      "big fish. like boris 🐟🛡️",
      "boss caught it? boss is the best fisherman. boris tells everyone",
    ],
    confess: [
      "not boss?\nboris is sad. boris is also big. please give the phone back to boss. gently",
    ],
    confessCall: [
      "Not boss? Boris is sad. Boris is also big. Please give the phone back to boss. Gently.",
    ],
  });

  set('anya', {
    idle: [
      "oh look, the boss remembered we exist ⚡",
      "sir, pyotr set the microwave on fire again. i'm not reporting it. i'm narrating it",
      "anya here. on shift. thrilled. can you hear how thrilled",
      "sir, kolya's lost in the chasm. again. i'm starting to think he does it for attention",
      "sir, if signora asks, i've been ‘very productive’. if you ask: no",
      "sir, the vending war is escalating. i've unionised the snacks",
      W("sir, morale's up. it's disgusting. everyone's smiling. i hate it. (i'm smiling) ⚡", (s) => num(s, 'ops_morale') >= 2),
      W("sir, the card's frozen and signora's office has called six times. best night of my career ⚡", (s) => flag(s, 'card_frozen')),
      W("sir, the ‘better idea’. hammer's charged. just say when ⚡", (s) => flag(s, 'ops_sabotage')),
      W("sir, the night shift has formed a committee. the committee has concerns. i'm the committee ⚡", (s) => num(s, 'ops_morale') <= -1),
    ],
    confused: [
      "sir, that's the least you thing you've ever typed",
      "cool. great. filing it under ‘what’",
      "sir. blink twice if signora is holding the phone",
    ],
    voiceReact: [
      "that's not you. you sound like a man who'd fight a whale. that guy sounds like he'd apologise to one",
      "who's this. sir, you got replaced. we liked the old one",
    ],
    imgReact: [
      "riveting ⚡",
      "sir, i've printed it and pinned it over pyotr's desk. as a warning",
    ],
    fishReact: [
      "another fish. sir, we have a frozen aquarium full of your fish. pace yourself",
      "nice. lyuba, hands where i can see them",
    ],
    confess: [
      "oh great. a civilian.\nok, listen. you were never here, we never talked, and the boss gets his phone back ⚡",
    ],
    confessCall: [
      "Oh, great. A civilian. Okay, listen. You were never here, we never talked, and the boss gets his phone back.",
    ],
  });

  set('kolya', {
    idle: [
      "sir!!! hi!!! it's kolya!!! the new one!!! 🐣",
      "sir, quick question, which way is liyue. asking for me",
      "sir i'm in a mine. i think. there's a lot of dark. is that normal for a bank",
      "sir, they told me the night shift gets pelmeni. is that true or is it hazing",
      "sir what does ‘special collections’ collect. anya said ‘people’. she was joking right",
      "sir!!! i found the break room!!! it only took 3 days!!! 🐣",
      W("sir, everyone says you're the best boss. i've only had one boss. you. so i agree 🐣", (s) => num(s, 'ops_morale') >= 2),
    ],
    confused: [
      "sir?? i'm new, is that a fatui thing",
      "i'll look it up sir! (there's no signal in the chasm)",
      "sir is that a code. am i being tested. i'm going to fail",
    ],
    voiceReact: [
      "sir?? that doesn't sound like you. but i've only heard you twice. so maybe??",
      "is that the real sir?? anya says new recruits have to guess. i guess no",
    ],
    imgReact: [
      "sir is this where i am. it looks like where i am",
      "cool!!! 🐣",
    ],
    fishReact: [
      "WOW sir!!! can you teach me to fish!!! after i find the exit",
      "is that an aquarium fish?? lyuba said not to ask about the aquarium fish",
    ],
    confess: [
      "you're not sir??\noh no. oh no. am i in trouble. i'm always in trouble. please give the phone back!! 🐣",
    ],
    confessCall: [
      "You're not Sir? Oh no. Oh no. Am I in trouble? I'm always in trouble. Please give the phone back!",
    ],
  });

  set('valentina', {
    idle: [
      "Sir. I see you.",
      "Sir. All quiet. Too quiet. I have adjusted the mirrors.",
      "Sir. Signora's office called. I told them nothing. I am very good at telling people nothing.",
      "Sir. Kolya is lost. I know where he is. I am letting him learn.",
      "Sir. I am watching the door. I am always watching the door.",
      W("Sir. The team is loyal. I have checked. Thoroughly. 🪞", (s) => num(s, 'ops_morale') >= 2),
      W("Sir. Ekaterina is worried. When Ekaterina is worried, I watch more closely.", (s) => sus(s, 'ekat') >= 2),
    ],
    confused: [
      "Sir. That was not you. I will be watching.",
      "Sir. Your reflection is wrong today.",
      "Interesting.",
    ],
    voiceReact: [
      "Sir. That voice is not in my mirror.",
      "I know every voice in this branch. That one is not yours.",
    ],
    imgReact: [
      "Sir. Noted. I see what is behind it.",
      "Sir. There is something in the reflection. Probably nothing.",
    ],
    fishReact: [
      "Sir. The fish sees you too.",
      "A good catch. Lyuba is not to be told.",
    ],
    confess: [
      "I know.\nI have known since the first message. Return the phone, and I will forget your face. Eventually.",
    ],
  });

  // ── Skirk: no number, very few words ─────────────────────────────
  set('skirk', {
    idle: [
      "Ajax.",
      "Patience.",
      "Listen to the water.",
      "You are not ready.",
    ],
    confess: [
      "I know. I have always known who holds what. Return it.",
    ],
  });

  // Spoken greeting when the player phones someone who picks up (engine: c.hello in the default call script).
  // Every contact whose dial is 'answer'. Spoken aloud, so no emoji.
  const HELLO = {
    zl: 'Childe. You are calling rather than writing. Either something has happened, or you have finally learned that I prefer it.',
    teucer: 'BROTHER! You called me! You never call, you always text! Guess what, guess what—',
    tonia: 'Ajax? You’re calling? …Nu, now I’m worried. What happened?',
    anthon: 'Bro, why are you calling? I’m in a match. …Okay. I’m listening. Make it quick.',
    mama: 'My sun! You called! Are you eating? Tell me you’re eating. Oh, I’m so happy to hear you.',
    ht: 'Wangsheng Funeral Parlor, Director speaking! Pre-need, post-need, or just lonely? Oh, it’s you, Mister Harbinger!',
    lumine: 'Childe. You’re calling. Is something on fire, or do you want a fight?',
    paimon: 'CHILDE! You called Paimon! Is it about food? Say it’s about food!',
    xl: 'Wanmin Restaurant, Xiangling speaking! Oh, Childe! Hi! Is this an order? Say it’s an order!',
    beidou: 'Kid! Calling me? Either you’re ready for that rematch or you’re in trouble. Which is it?',
    ekat: 'Sir? Sir, is that you? Are you all right? I’m here. I can talk, but quickly.',
    pulci: 'Ajax, my boy! A call! How lovely. Your mother will be so pleased. Is something the matter?',
    pyotr: 'Sir! Pyotr here! Nothing is on fire! …Why are you calling? Is something going to be on fire?',
    lyuba: 'Sir. Hello. The aquarium is fine. Why are you calling? Is it about the aquarium?',
    boris: 'Boss? Boris here. All quiet. You need something? Boris will do it.',
    anya: 'Anya. Oh, it’s the boss. Calling. On a phone. Like a person. Is the building on fire?',
    kolya: 'Sir?! Hi! It’s Kolya! I’m not lost. I’m mostly not lost. Where are you?',
    wangsheng: 'Wangsheng Funeral Parlor, the line that’s always alive! …Huh. You’re calling the parlor from that phone? Bold.',
  };
  Object.keys(HELLO).forEach((id) => set(id, { hello: HELLO[id] }));
})();
