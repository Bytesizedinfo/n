/* Contact flavour: reply pools the story engine uses for unscripted player messages.
   idle       — "Jiang Cheng" texts them out of nowhere (they're surprised he wrote first)
   confused   — he sends something weird / off-script mid-conversation
   voiceReact — he sent a voice message?? (and that isn't his voice)
   imgReact   — a random photo
   dogReact   — a dog photo (Wei Wuxian screams, everyone else coos)
   confess    — "I'm not Jiang Cheng, I found this phone"
   A line may contain "\n" to become two bubbles. A-Jie, Mother and Father can't reply, so they have none.
   Voices: docs/STORY.md "Who is who". */
(function () {
  'use strict';
  const JC = window.JC;
  const set = (id, pools) => {
    const c = JC.contacts.get(id);
    if (c) Object.assign(c, pools);
  };

  set('wwx', {
    idle: [
      "JIANG CHENG TEXTED ME FIRST\nlan zhan. LAN ZHAN. come look",
      "who is this and what have u done with jiang cheng",
      "omg hi!!! hi hi hi\nwait is someone dying",
      "u never text first 🥺 is this about sunday",
      "jiang cheng!!! to what do i owe the honor",
      "screenshotted. this is going on the fridge",
      "r u ok?? blink twice. text twice. whatever",
      "u texted me. on purpose. without me texting u first. im going to cry",
      "hi chengcheng 🥺\nok sorry. hi jiang cheng",
      "is this a butt text. it is isnt it 😭",
      "lan zhan says hello\nhe didnt. but he would",
    ],
    confused: [
      "???\njiang cheng what does that mean",
      "did a-ling steal ur phone again 😭",
      "r u drunk. u r never drunk. r u ok",
      "lan zhan come read this. im not crazy right",
      "ok i have no idea what that means but im choosing to be happy about it",
      "jiang cheng. blink if ur being held hostage",
      "that was a very un-jiang-cheng sentence 👀",
    ],
    voiceReact: [
      "JIANG CHENG SENT A VOICE MESSAGE\nwait. thats not ur voice??",
      "u hate voice messages. u said they were for old men and me\nand also who was that 😭",
      "why does ur voice sound like that. r u sick?? do u need soup",
      "lan zhan listened to it 3 times and says it is \"not him\" 👀",
    ],
    imgReact: [
      "what is this 😭\nis this art. r u doing art now",
      "jiang cheng sends photos now??? who r u",
      "ok but why did u send me this at this hour",
      "saving it. framing it. no context needed",
    ],
    dogReact: [
      "NO\nNO NO NO\nJIANG CHENG WHY",
      "DELETE IT\n...is it a nice dog\nNO. DELETE IT",
      "😭😭😭 im telling lan zhan\nlan zhan is cooing. traitor",
      "u know what u did. u always know what u did 😭",
    ],
    confess: [
      "wait WHAT\nok ok dont panic. are u nice?? u seem nice",
      "omg. omg omg. please give it back before he burns down lanling looking for it 😭",
      "...that explains so much\nhe would never. say any of that. hi stranger!!",
    ],
  });

  set('jl', {
    idle: [
      "?? why r u texting me first",
      "jiujiu its late. why r u awake. dont answer that",
      "what. what did i do",
      "ok whatever it is i didnt do it",
      "is this about the chemistry thing",
      "ugh what",
      "u never text first. r u dying",
      "hi?? ok. weird. hi",
      "if this is about my grades theyre fine. mostly",
      "fairy says hi. i say wtv",
    ],
    confused: [
      "??? what",
      "jiujiu did u hit ur head",
      "r u drunk?? u dont even drink",
      "thats so weird. stop being weird",
      "ok who taught u to text like that. was it uncle wei",
      "i dont know what that means and im scared",
    ],
    voiceReact: [
      "WHO IS THAT. thats not ur voice",
      "since when do u send voice messages. and why do u sound like a stranger",
      "jiujiu do u have a cold?? ur voice is so weird",
    ],
    imgReact: [
      "ok? why",
      "what am i looking at",
      "since when do u send pics. u literally only send screenshots of my bank account",
      "cool i guess",
    ],
    dogReact: [
      "aww\nfairy is cuter tho",
      "WHO IS THAT. r u cheating on fairy",
      "is that a new dog?? r we getting a new dog??",
      "ok cute. dont show uncle wei he'll faint",
    ],
    confess: [
      "WHAT\nwho r u. give it back or i swear",
      "...i KNEW something was weird. jiujiu would never\nwhere r u. dont move. im serious",
      "is this a prank. sizhui is this u\nok its not. OK. DONT READ MY MESSAGES",
    ],
  });

  set('lxc', {
    idle: [
      "Wanyin. It's good to hear from you. I was just thinking of you.",
      "Hello, Wanyin. Is everything all right? You don't usually write first.",
      "This is a pleasant surprise. 🙂",
      "Wanyin. I'm here. Take your time.",
      "Good evening, Wanyin. I hope you're resting.",
      "I'm glad you wrote. I was trying very hard not to write to you first.",
      "Wanyin, you're up late. So am I.",
      "Ah. I was just making tea. I'll pour a second cup, in spirit.",
    ],
    confused: [
      "Wanyin? I'm not sure I understand, but I'm listening.",
      "That's not like you. Are you all right?",
      "Forgive me, I think I've missed something.",
      "You sound tired. It's late. We can talk tomorrow.",
      "I'll take that to mean you're all right. Tell me if you're not.",
    ],
    voiceReact: [
      "Wanyin, the voice in your message doesn't sound like yours. Are you unwell?",
      "I listened twice. I'm not sure that was you. Is everything all right?",
      "Your voice sounds different tonight. Are you still at the hotel?",
    ],
    imgReact: [
      "Thank you for sharing this with me.",
      "It's lovely. Where was this?",
      "I'll keep this. Thank you, Wanyin.",
    ],
    dogReact: [
      "What a beautiful dog. I didn't know you still took photos of dogs.",
      "Oh. Is this a friend of Fairy's? Lovely.",
      "Wangji would like this one. Wei Wuxian would not.",
    ],
    confess: [
      "Ah. That explains a great deal. Thank you for telling me the truth. Please keep the phone safe. He'll be looking for it.",
      "I see. I'm glad it was someone kind who found it, whoever you are. Will you make sure it gets back to him?",
    ],
  });

  set('lwj', {
    idle: [
      "Mn.",
      "Jiang Wanyin.",
      "Wei Ying is asleep. Is it urgent.",
      "I will tell him you wrote.",
      "Received.",
      "You do not usually write to me.",
      "Is something wrong.",
      "He is beside me. Shall I give him the phone.",
    ],
    confused: [
      "I do not understand.",
      "Clarify.",
      "That is unlike you.",
      "Mn. ...Are you well.",
      "I will not show this to Wei Ying.",
    ],
    voiceReact: [
      "That was not your voice.",
      "Who is speaking.",
      "Wei Ying heard it. He is asking who that was.",
    ],
    imgReact: [
      "Mn.",
      "Noted.",
      "Why.",
    ],
    dogReact: [
      "Lovely.",
      "I will not show Wei Ying.",
      "Mn. A good dog.",
    ],
    confess: [
      "I see. Return the phone to him. Tonight.",
      "Mn. Thank you for your honesty. Wei Ying will want to speak with you.",
    ],
  });

  set('nhs', {
    idle: [
      "Brother Jiang!!! You texted me first?!?! 😭 Is it my birthday??",
      "Ooh, a message from Brother Jiang 👀 What's the occasion?",
      "Brother Jiang~ to what do I owe the pleasure? 🪭",
      "Hi hi!! Is this about the balcony? 👀👀",
      "Brother Jiang, you never text me first... I'm honored 🙈",
      "Hello?? Who are you and what have you done with Brother Jiang 😭",
      "Oh! I was JUST thinking about you. No reason~ 🪭",
      "Brother Jiang is texting ME at this hour?? 👀 Spill",
      "I don't know anything! Whatever it is, I don't know! 🙈",
      "Hehe~ hello Brother Jiang 🙏",
    ],
    confused: [
      "Brother Jiang?? That doesn't sound like you at all 👀",
      "Hmm. Hmmmm. 👀🪭",
      "Are you okay?? You're being very... chatty 🙈",
      "Brother Jiang, blink twice if someone stole your phone 😭",
      "Ooh, interesting. Very interesting~ 👀",
      "Since when do you text like that?? I'm taking notes 📝",
    ],
    voiceReact: [
      "A VOICE MESSAGE?? From Brother Jiang?? 😭\n...wait, whose voice is that 👀",
      "Brother Jiang hates voice messages. So who is this? 👀🪭",
      "Hmm, you sound different tonight~ Did you catch a cold? Or are you... not you? 👀",
      "Listened three times. Saving it. Very curious~ 🙈",
    ],
    imgReact: [
      "Ooh, what's this? 👀",
      "Brother Jiang is sending PHOTOS now?? Who are you 😭",
      "Saving this for... research 🪭",
      "Pretty!! Where was this taken? 👀",
    ],
    dogReact: [
      "A PUPPY 😭😭 so cute!!",
      "Aww!! Does Brother Wei know you're sending dogs again? 🙈",
      "Cuuute 🥺 Is that Fairy's boyfriend?? 👀",
    ],
    confess: [
      "...oh? 👀\nOh, this is SO much better than the balcony 🪭",
      "Hehe~ I knew it. Brother Jiang would rather die than use an emoji 🙈\nDon't worry! I won't tell anyone. Probably~",
    ],
  });

  set('wn', {
    idle: [
      "M-Mr. Jiang? Is everything all right? Sorry. — Wen Ning",
      "Mr. Jiang! I'm here. Do you need something? Sorry. — Wen Ning",
      "Oh. Mr. Jiang. You've never messaged me first. Sorry, I'm just surprised. — Wen Ning",
      "Hello, Mr. Jiang. Is it about the van? I can come anywhere. — Wen Ning",
      "Is Mr. Wei all right? Sorry. I always assume something happened. — Wen Ning",
      "I'm still in Lanling, if you need anything. Sorry. — Wen Ning",
      "Mr. Jiang. I'm listening. — Wen Ning",
      "Good evening, Mr. Jiang. Sorry for the late reply. It was only a minute. Sorry. — Wen Ning",
    ],
    confused: [
      "I-I'm sorry, Mr. Jiang, I don't think I understand. Sorry. — Wen Ning",
      "Mr. Jiang? That doesn't sound like you. Are you hurt? I can come. — Wen Ning",
      "Sorry, was this message meant for me? — Wen Ning",
      "Mr. Jiang, are you feeling dizzy at all? Any headache? Sorry. Paramedic habit. — Wen Ning",
      "Okay. Sorry. Okay. — Wen Ning",
    ],
    voiceReact: [
      "M-Mr. Jiang? That doesn't sound like your voice. Sorry. — Wen Ning",
      "I listened to it. I'm sorry, but who is speaking? — Wen Ning",
      "Mr. Jiang, your voice sounds very different. Are you having trouble breathing? — Wen Ning",
    ],
    imgReact: [
      "Thank you for sending this, Mr. Jiang. Sorry, should I do something with it? — Wen Ning",
      "It's very nice. Sorry. — Wen Ning",
      "Oh. Thank you. I'll keep it. — Wen Ning",
    ],
    dogReact: [
      "Oh! A dog. It's very cute. Please don't show Mr. Wei. Sorry. — Wen Ning",
      "What a good dog. Thank you for sending it, Mr. Jiang. — Wen Ning",
      "Aww. Sorry. I mean. It's a very nice dog. — Wen Ning",
    ],
    confess: [
      "Oh. Oh no. I— I thought your messages sounded different. I won't tell anyone. I'll help you get it back to him. Sorry. — Wen Ning",
      "Thank you for telling me. Please don't be scared. Mr. Jiang is fair. Mostly. Sorry. — Wen Ning",
    ],
  });

  set('sz', {
    idle: [
      "Good evening, Sect Leader Jiang! Is everything all right?",
      "Mr. Jiang! This is a surprise. How can I help?",
      "Hello, Sect Leader Jiang. Is this about Sunday? I'll keep it quiet!",
      "Oh! Hi, Mr. Jiang. Jin Ling's fine, I promise. I think.",
      "Sect Leader Jiang, good evening! I'm here.",
      "Is Jin Ling in trouble? Sorry. That's always my first guess.",
      "Hello! I'm glad you wrote. Is there anything I can do?",
      "Mr. Jiang, it's late! Should I be worried? 😊",
    ],
    confused: [
      "Sorry, Mr. Jiang, I don't think I understand.",
      "Sect Leader Jiang? Are you all right?",
      "Was that meant for Jin Ling? I can pass it along!",
      "I'll pretend I understood that. 😊",
      "That sounds a little unlike you, Mr. Jiang. Is everything okay?",
    ],
    voiceReact: [
      "Mr. Jiang, sorry, but that doesn't sound like your voice?",
      "Oh! A voice message. Is someone else using your phone?",
      "I listened twice. Is that a friend of yours, Sect Leader Jiang?",
    ],
    imgReact: [
      "Thank you for sharing! It's lovely.",
      "Oh, nice! Should I add it to the slideshow?",
      "That's beautiful, Mr. Jiang.",
    ],
    dogReact: [
      "What a sweet dog! Fairy would be jealous. 😊",
      "Aww! Jingyi is going to scream when I show him.",
      "So cute! Is that a friend of Fairy's?",
    ],
    confess: [
      "Oh! Thank you for being honest. Please don't worry. Could you keep the phone safe? I'll let Jin Ling know.",
      "I see. I thought you sounded very kind tonight. Mr. Jiang is kind too, just quieter about it.",
    ],
  });

  set('jy', {
    idle: [
      "MR JIANG?? 💀 hi",
      "wait why is MR JIANG texting me first 💀💀",
      "i didnt do it",
      "HI MR JIANG. is this about the fireworks. i didnt buy any. yet",
      "omg hi. am i in trouble 💀",
      "MR JIANG texted me i need to tell sizhui",
      "yes sir. hi sir. what sir",
      "hello!!! wait is jin ling with u. dont tell him about the thing",
    ],
    confused: [
      "wat 💀",
      "MR JIANG r u ok",
      "i dont get it but ok",
      "is that a code. is that a secret code 💀",
      "lol wat\nwait was that a joke. MR JIANG MADE A JOKE?",
    ],
    voiceReact: [
      "WHO IS THAT 💀 thats not ur voice",
      "MR JIANG sent a voice message??? and it doesnt sound like him?? im scared",
      "lmao who is that",
    ],
    imgReact: [
      "cool!!!",
      "wat is this lol",
      "nice pic MR JIANG 💀",
    ],
    dogReact: [
      "DOGGY 😭😭😭",
      "OMG CUTE. can it come to the party",
      "is that fairys cousin",
    ],
    confess: [
      "WAIT WHAT 💀💀💀\nur not MR JIANG???",
      "OMG. ok. ok. jin ling is going to lose it\ncan i tell sizhui",
    ],
  });

  set('mian', {
    idle: [
      "Jiang Cheng. You never text first. What's wrong?",
      "Hi. Is everything okay?",
      "This is new. Hi.",
      "Tangtang is asleep, so I have exactly ten minutes. What's up?",
      "Are you okay? Honest answer.",
      "You're up late. Did something happen at the gala?",
      "Hi, Jiang Cheng. I'm here.",
      "Should I be worried? You're texting like a person.",
    ],
    confused: [
      "I'm going to need more context.",
      "That's not like you. Are you okay?",
      "Did Huaisang get into your phone?",
      "Are you drunk? You don't drink.",
      "Okay. I'll pretend that made sense.",
    ],
    voiceReact: [
      "That's not your voice. Who's this?",
      "Jiang Cheng doesn't send voice messages. So who are you?",
      "Are you sick? You sound like a stranger.",
    ],
    imgReact: [
      "Nice. What's the occasion?",
      "Pretty. Did you take this?",
      "Okay, who are you and why are you sending me photos.",
    ],
    dogReact: [
      "Cute. Tangtang will want to see this.",
      "Oh, sweet dog. Don't let Wei Wuxian see.",
      "Another dog photo. You're not fooling anyone, you know.",
    ],
    confess: [
      "Ah. That explains the punctuation. Thank you for telling me. Get it back to him; he'll be frantic.",
      "Okay. Honestly, I'm relieved. I thought he'd had a stroke.",
    ],
  });

  set('ea', {
    idle: [
      "Mr. Jiang. It's late. Is this urgent?",
      "Noted. What do you need.",
      "If this is about slide 7: no.",
      "I'm off duty. Go to sleep.",
      "Is the hotel on fire? No? Then Monday.",
      "Mr. Jiang. Did someone die, or are you rewriting the deck again.",
      "Yes?",
      "You texted first. Something is wrong. What is it.",
      "Monday 9:00. Whatever it is can wait until Monday 8:59.",
    ],
    confused: [
      "I don't understand. That's rare.",
      "Mr. Jiang, are you well? That was nearly friendly.",
      "Noted. I have no idea what that means.",
      "Please tell me you haven't been drinking with the Jin board.",
      "I'll file that under \"not urgent\".",
    ],
    voiceReact: [
      "That isn't your voice.",
      "You don't send voice messages. Who is this?",
      "Noted. Whose voice was that?",
    ],
    imgReact: [
      "Noted.",
      "Is this for the board deck? It's not going in the board deck.",
      "Received. I'm not asking.",
    ],
    dogReact: [
      "Cute. Liu Qian will use this as leverage.",
      "A dog. Is this your answer about Friday?",
      "Noted. Don't show Liu Qian.",
    ],
    confess: [
      "Noted. I knew he'd lose that phone one day. Leave it at the Golden Peony front desk, Room 1808. I'll tell them you're coming.",
      "Thank you for telling me. Please don't read his email.",
    ],
  });

  set('huang', {
    idle: [
      "Boss. Received. 👍",
      "Boss!! You text me. Everything ok? 👍",
      "Yes Boss. I am awake. Always awake. 👍👍",
      "Boss. All fine at Lotus Pier. 👍",
      "Boss, you sleep now. Too late. 👍",
      "Received Boss. I tell the boys. 👍👍👍",
      "Hello Boss!! 👍",
      "Boss. Ok. 👍",
    ],
    confused: [
      "Boss?? I don't understand. 👍",
      "Boss, you ok? You sound different. 👍",
      "Ha ha. Boss make joke? 👍",
      "Boss I am old. Say again Simple. 👍",
      "??? 👍",
    ],
    voiceReact: [
      "Boss?? Who is talking? Not your voice. 👍",
      "Boss you have cold? Voice is strange. Drink hot water. 👍",
      "Boss, I listen 3 times. Not you. Who? 👍",
    ],
    imgReact: [
      "Very nice photo Boss. 👍👍",
      "Boss. Received. 👍",
      "Beautiful. I show my wife. 👍",
    ],
    dogReact: [
      "Good dog!! Very Strong dog. 👍👍",
      "Boss, nice dog. Bring to Dog Friday? Ha ha. 👍",
      "Very good dog. Don't show Mr. Wei. Ha ha. 👍",
    ],
    confess: [
      "You are not Boss?? Then who?? Where is Boss??\nOk. You bring phone to Lotus Pier. I give you tea. 👍",
      "Not Boss. I knew. Boss never write so long. 👍",
    ],
  });

  set('liu', {
    idle: [
      "Good evening, Mr. Jiang! Is this about Dog Friday? 🐕",
      "Mr. Jiang! Happy to help.\n• I'm available • I have my laptop",
      "Hello! Quick check: is this urgent or Monday-urgent?",
      "Mr. Jiang, good evening. Ops is all green on my side ✅",
      "Hi! Is this a yes on Dog Friday? 👀",
      "Received, Mr. Jiang. Standing by.",
      "Hello! I'll take notes. Go ahead. 📝",
      "Mr. Jiang! Late night. Should I wake A-Bai?",
    ],
    confused: [
      "Sorry, Mr. Jiang, could you clarify?\n• Is it about shipping • Or the dogs",
      "I'm not sure I follow. Should I loop in Tang Mei?",
      "Noted! ...Actually, could you say that again?",
      "Mr. Jiang, is everything okay? That's unusual for you.",
      "Understood. (I didn't understand.)",
    ],
    voiceReact: [
      "Mr. Jiang, that doesn't sound like you? Is someone else on your phone?",
      "Received a voice message. Sorry, who is speaking?",
      "Oh! A voice note. That doesn't sound like your voice, Mr. Jiang.",
    ],
    imgReact: [
      "Thank you! Filed. 📁",
      "Nice photo! Can I use it for the newsletter?",
      "Received ✅",
    ],
    dogReact: [
      "A DOG 🐕 Is this a yes??",
      "So cute!! Adding to the Dog Friday deck.",
      "Mr. Jiang, I'm choosing to read this as approval. 🐕",
    ],
    confess: [
      "Oh! Okay. Thank you for telling me.\n• Please keep the phone safe • Call Lotus Pier HQ in the morning",
      "Understood. Please don't approve anything. Especially the dogs.",
    ],
  });

  set('bai', {
    idle: [
      "boss!!! sorry. hi. what did i do 🙇",
      "boss im so sorry. wait what is this about 🙇",
      "hi boss!! im awake!! 🙇",
      "boss is this about the lotus root 🙇🙇",
      "yes boss!! sorry boss!! 🙇",
      "boss i swear i checked the numbers twice 🙇",
      "boss u texted me?? am i fired 🙇",
      "hello boss!!! everything is fine!! mostly 🙇",
    ],
    confused: [
      "sorry boss i dont understand 🙇",
      "boss r u ok?? 🙇",
      "is that a typo boss? i make those too 🙇",
      "sorry!! sorry. what? 🙇",
      "boss i will google it 🙇",
    ],
    voiceReact: [
      "boss?? thats not ur voice 🙇",
      "who is that boss 🙇",
      "boss r u sick? ur voice sounds so different 🙇",
    ],
    imgReact: [
      "nice boss!! 🙇",
      "received boss!! 🙇",
      "is this for work boss? 🙇",
    ],
    dogReact: [
      "DOG 😭 so cute boss 🙇",
      "is this for dog friday??? 🙇🐕",
      "boss i want to pet him 🙇",
    ],
    confess: [
      "WAIT. ur not boss??? im so sorry. why am i sorry 🙇",
      "oh no. ok. i wont tell anyone. please dont tell boss i said anything 🙇",
    ],
  });

  // Spoken greeting when the player phones someone who picks up (engine: c.hello in the default call script).
  const HELLO = {
    wwx: 'Jiang Cheng?! You called me? You never call me. Who died?',
    jl: 'Jiujiu? Why are you calling? …What did I do.',
    lxc: 'Wanyin? …Hello. I’m glad you called.',
    lwj: 'Lan Wangji.',
    nhs: 'Brother Jiang!! You never call! What happened? Tell me everything~',
    wn: 'M-Mr. Jiang? Hello? Is everything all right? Sorry.',
    sz: 'Sect Leader Jiang? Good evening! Is Jin Ling okay?',
    jy: 'MR JIANG?? Uh. Hi. Hello. I didn’t do it.',
    huang: 'Boss! Huang here. All fine at Lotus Pier. You need something?',
    bai: 'B-boss?! Hi! Sorry! I’m awake! What did I do?',
  };
  Object.keys(HELLO).forEach((id) => set(id, { hello: HELLO[id] }));

  set('qr', {
    idle: [
      "Jiang Cheng. Your message has been received. Kindly direct correspondence to my email. — Lan Qiren",
      "Jiang Cheng. It is past nine o'clock. — Lan Qiren",
      "Jiang Cheng. State your business concisely. — Lan Qiren",
      "Jiang Cheng. If this concerns Wei Wuxian, I do not wish to know. — Lan Qiren",
      "Jiang Cheng. I was asleep. As is proper. — Lan Qiren",
      "Jiang Cheng. Received. — Lan Qiren",
      "Jiang Cheng. If this concerns the board, the board meets on Monday. — Lan Qiren",
      "Jiang Cheng. Text messages are not correspondence. — Lan Qiren",
    ],
    confused: [
      "Jiang Cheng. I do not understand this message. — Lan Qiren",
      "Jiang Cheng. Kindly write in complete sentences. — Lan Qiren",
      "Jiang Cheng. Has Wei Wuxian taken your telephone? — Lan Qiren",
      "Jiang Cheng. This is unbecoming. — Lan Qiren",
      "Jiang Cheng. I will assume this was sent in error. — Lan Qiren",
    ],
    voiceReact: [
      "Jiang Cheng. I do not listen to voice messages. — Lan Qiren",
      "Jiang Cheng. Xichen played this for me. That is not your voice. — Lan Qiren",
      "Jiang Cheng. Whoever that was, they mumble. — Lan Qiren",
    ],
    imgReact: [
      "Jiang Cheng. Received. — Lan Qiren",
      "Jiang Cheng. I do not see the purpose of this image. — Lan Qiren",
      "Jiang Cheng. Noted. — Lan Qiren",
    ],
    dogReact: [
      "Jiang Cheng. Dogs are not permitted at Cloud Recesses. — Lan Qiren",
      "Jiang Cheng. A dog. Why. — Lan Qiren",
      "Jiang Cheng. It appears to be a well-behaved dog. That is all. — Lan Qiren",
    ],
    confess: [
      "To whoever holds this telephone: return it to its owner at once. Honesty is the first rule. — Lan Qiren",
      "Then you will cease writing in his name immediately. — Lan Qiren",
    ],
  });
})();
