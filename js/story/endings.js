/* The 13 endings. Conditions: docs/STORY.md "Endings"; the finale computation lives in
   js/story/scenes/finale.js (true > reunited > tea > jl_hero > legend > unsent > honest). */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const E = (d) => JC.story.ending(Object.assign({ art: 'end_' + d.id }, d));
  // Paragraphs can depend on how the night went: { if: (s) => …, t: 'text', else: 'text' } (see JC.story.endingText).
  const desk = (s) => !!s.flags.phone_at_desk;
  const fairyHome = (s) => s.flags.fairy_where === 'home' || !!s.done.r_fm_jl_fairy || !!s.done.r_ride_pet_fairy_from;

  E({
    id: 'honest', n: 1, title: 'The Honest Stranger', tag: 'Truth',
    hint: "Sometimes the right thing is the shortest message you'll ever send.",
    text: [
      { if: desk, t: 'You give it back. It takes one more taxi ride than keeping it would have, and it costs you the rest of the night.', else: 'You tell the truth. It takes four words longer than lying would have, and it costs you the rest of the night.' },
      { if: desk, t: 'The night manager of the Golden Peony is called Mr. Liang. He takes the purple phone in both hands, writes "Room 1808" on an envelope in very careful characters, and does not ask your name. Nobody yells. That is the strange part.', else: 'Nobody yells. That is the strange part. Somebody calls the Golden Peony, somebody knocks on Room 1808, and a man in a hotel bathrobe is told that his phone has been found by a stranger who said so.' },
      { if: desk, t: 'At ten the next morning your own phone rings, a number you don\'t know. "Tang Mei," says a woman\'s voice. "Mr. Liang described you. Thank you. He won\'t say it, so I\'m saying it now, and he can owe me."', else: 'At ten the next morning a woman in a grey coat rings your doorbell, holds out her hand for the purple case, and looks at you for one long, assessing second. "Tang Mei," she says. "Thank you. He won\'t say it, so I\'m saying it now, and he can owe me."' },
      'You never find out how Sunday went. You think about it more than you expected to.',
    ],
    jc: [
      { if: desk, t: 'When Jiang Cheng got his phone back, it was in an envelope at the front desk with "Room 1808" on it. He read every message from the night before, twice, standing in the lobby in yesterday\'s suit.', else: 'When Jiang Cheng got his phone back, he read every message from the night before, twice, in the back of a car going nowhere in particular.' },
      'Most of them were people asking if he was all right. At a red light he typed "I\'m fine." to four different people, and for once it was almost true.',
      { if: desk, t: 'He asked Mr. Liang what the stranger looked like. Mr. Liang said: tired, and honest. He didn\'t do anything with that. He just kept it.', else: "He kept the stranger's address. He didn't do anything with it. He just kept it." },
    ],
  });

  E({
    id: 'wen_ning', n: 2, title: 'Wen Ning Saw Nothing', tag: 'Kindness',
    hint: 'The kindest voice in the phone is also the most frightened. Let him hear yours.',
    text: [
      'Wen Ning arrives in an old van with "Yiling Radish Co." painted on the side and a tow rope coiled on the passenger seat, as if it lives there. It does.',
      "He doesn't ask your name. He holds out both hands for the phone as if you are giving him something breakable, says sorry three times and, once, very quietly, thank you.",
      'At dawn he leaves it at the front desk of the Golden Peony in an envelope addressed "Mr. Jiang, Room 1808" in careful handwriting. Then he drives three blocks, parks, and sits in the van for twenty minutes, shaking a little, before he can go home.',
      'If anyone ever asks, he saw nothing. Nobody ever asks. Nobody ever asks Wen Ning anything.',
    ],
    jc: [
      'When Jiang Cheng got his phone back, the envelope smelled faintly of radishes.',
      "He knew that handwriting. He'd been signing for its apologies for years.",
      'He sat on the edge of the hotel bed for a long time. Then he called Wen Ning, actually called, with his voice, and said "Thank you" for the second time that month. Wen Ning dropped the phone. They both pretended he hadn\'t.',
    ],
  });

  E({
    id: 'busted', n: 3, title: 'I Know Nothing', tag: 'Gossip',
    hint: 'Someone in this phone is much smarter than he pretends to be.',
    text: [
      'Nie Huaisang knows. Of course he knows. He probably knew before you did.',
      "He keeps your secret beautifully. He keeps everyone's secret beautifully, which is how he came to own most of them.",
      'The price is forty-one screenshots, delivered before dawn, and a promise never to speculate about who runs @teaspiller_qh. You were never going to. You are no longer sure of anything.',
      'By morning the phone is at Lotus Pier HQ, delivered by courier with a hand-painted fan in the envelope. In tiny, careful brushstrokes, the fan says: I KNOW NOTHING.',
    ],
    jc: [
      'When Jiang Cheng got his phone back, there was a fan in the envelope, and he knew.',
      '"Huaisang," he said into Nie Huaisang\'s voicemail. That was the whole message. It was enough.',
      'Three days later #BalconyGate trended again, with details nobody should have known. Jiang Cheng stared at the post for a long time. Then, for reasons he will never explain, he liked it.',
    ],
  });

  E({
    id: 'zidian', n: 4, title: 'Zidian Is Waiting', tag: 'Caught',
    hint: 'Everyone has a limit. His has a name.',
    text: [
      'You pushed it too far. The family compared notes, Lotus Pier HQ compared call logs, and in a hotel room across Lanling a man opened his laptop, clicked Find My, and said a word that made the night clerk put down the phone.',
      'At Yunmeng Jiang Group they have a name for what happens next. They call it Zidian, after the amethyst ring that was his mother\'s, the one he turns on his finger when someone is about to have the worst day of their life.',
      'Not long after, there is a knock on your door. It is not a loud knock. That is the frightening part.',
      'He is shorter than you expected and much angrier, and he holds out one hand without a word. You put the phone in it. He looks at the screen. He looks at you. He turns the ring once.',
      '"Get lost," he says, which you later learn is the closest thing to forgiveness he keeps in stock.',
    ],
    jc: [
      "When Jiang Cheng got his phone back, he changed the passcode in your stairwell. It is nobody's birthday now. Jin Ling is insufferable about this.",
      'Then he read everything you had sent, standing in the drizzle on Jinxing Road, and his face did several things in a row that nobody was there to see.',
      'He did not press charges. He did send a fruit basket to Master Wu Lihua, for reasons Master Wu still does not understand.',
    ],
  });

  E({
    id: 'burned', n: 5, title: 'Burned Bridges', tag: 'Family',
    hint: "There is one sentence he has thought for thirteen years and never said. Don't say it for him.",
    text: [
      'You sent it. Five words he had thought for thirteen years and never once said out loud, and you said them for him, in the middle of the night, to the one person they would hurt most.',
      'Wei Wuxian read them. The typing bubble came and went. Then: "ok". Then: "goodnight". Then nothing at all. Not in his thread, not in the family chat, not even a radish.',
      'On the roof of the Jingshi, Lan Wangji sat beside his husband until the sky went grey and said nothing, because there was nothing to say that would undo it.',
      "You put the phone face down on the table. It doesn't buzz again all night. That is the worst part.",
    ],
    jc: [
      'When Jiang Cheng got his phone back, he read it at a red light. "You should have stayed gone." From him.',
      'He did not go to Lotus Pier. He drove to Gusu before dawn, too fast, and stood at the gate of the Jingshi with nothing in his hands.',
      'Wei Wuxian opened the door with his eyes still swollen. Jiang Cheng said, "I didn\'t send that." And then, because it was the truest thing he had: "I used to think it. I don\'t anymore."',
      "It isn't fixed. But on Sunday at 6:29, someone stands outside the gate at Lotus Pier for one minute, so that he won't be early.",
    ],
  });

  E({
    id: 'koigate', n: 6, title: '#KoiPondGate', tag: 'Scandal',
    hint: '"Blame the valet," you said. "Nobody will find out," you said.',
    text: [
      'By two in the morning #KoiPondGate has eighteen thousand likes. By four, somebody has made a remix called "Blame the Valet", and it slaps.',
      "The valet's granddaughter is in Jin Ling's chemistry class, and she has video. In it, a teenager in a gold tie and sunglasses, at night, points at a sixty-year-old man holding a dog biscuit and says, \"It was him.\"",
      'The Lanling Daily runs it on the front page: YOUNG MASTER, OLD VALET, ONE (1) POND. The koi are fine. The koi are famous.',
      'You turn the phone off. You turn it back on. It has 211 notifications. You turn it off again.',
    ],
    jc: [
      'When Jiang Cheng got his phone back, Jin Ling was already waiting in the lobby of the Golden Peony with two coffees and the face of a boy who knows exactly how much trouble he is in.',
      "They went to the valet's house together. Jin Ling apologized. Jiang Cheng quietly paid for the granddaughter's university through a foundation with a very boring name.",
      'Jin Ling\'s driving test has been postponed until he is, in his uncle\'s words, "thirty, or dead". The koi got a plaque.',
    ],
  });

  E({
    id: 'fairy', n: 7, title: "Fairy's New Favorite", tag: 'Dog',
    hint: 'She is a very good girl. She has also never met you.',
    text: [
      { if: fairyHome, t: 'Jinxing Road, after midnight, in the drizzle. A car stops outside number 27 and a teenager in a tuxedo climbs out, holding the leash of the largest, wettest black dog you have ever seen.', else: 'The east gate of Koi Tower, after midnight, in the drizzle. A teenager in a tuxedo is holding the leash of the largest, wettest black dog you have ever seen.' },
      'He looks at you. He looks at the phone in your hand, the matte purple case. He looks at you again. "Who," says Jin Ling, heir to the Jin Group, "the hell are you."',
      'Fairy does not care who you are. Fairy plants two enormous wet paws on your shoulders and licks your entire face, which she has only ever done to one other person in her life.',
      'You explain. Jin Ling listens, scowling, while his dog leans her whole pond-scented weight against your legs and refuses to move. "Traitor," he tells her. She wags.',
      { if: fairyHome, t: 'In the end he takes the phone, Fairy takes your sofa, and it is decided, by Fairy, that everyone is staying until the rain stops.', else: 'In the end he takes the phone, Fairy takes you, and it is decided, by Fairy, that you are walking them both home.' },
    ],
    jc: [
      'When Jiang Cheng got his phone back, it was handed to him by his nephew, who was soaking wet, furious and, for some reason, trying not to smile.',
      '"Fairy has a new favorite," Jin Ling said. "It\'s not you." Jiang Cheng said that was impossible. Fairy then refused to get out of a stranger\'s car for twenty minutes.',
      'The stranger has been invited to Fairy\'s birthday party. Fairy does not have a birthday. Jin Ling made one up.',
    ],
  });

  E({
    id: 'unsent', n: 8, title: 'Unsent', tag: 'Family',
    hint: 'You heard it. He never sent it. Somebody has to.',
    text: [
      'You listened to it. Seventy-two seconds of a man on the road outside a temple, trying to say thank you to his brother, failing, and trying again.',
      "You didn't send it. Maybe it wasn't yours to send. Maybe you were afraid of what it would do. The night ended the way most of his nights end: with everything important still unsaid.",
      'In the morning you told him the truth. He didn\'t ask what you had listened to, and you didn\'t say. But Voice Memos keeps a small, merciless record: Untitled 14. Played.',
    ],
    jc: [
      'When Jiang Cheng got his phone back, he saw it straight away. Untitled 14. Played. Not by him.',
      'For two years he had told himself it did not need sending; that Wei Wuxian knew; that some things are better left in a phone in a drawer. A stranger had listened to it once and handed it back, and suddenly that was unbearable.',
      'He sat in the car outside Lotus Pier until the engine went cold. Then he pressed Share, chose the name he had saved as a joke and never changed, and sent it before he could stop himself.',
      'The reply took four minutes. "you kept this for two years?" Jiang Cheng typed "Don\'t make it a thing.", deleted it, and called him instead.',
    ],
  });

  E({
    id: 'reunited', n: 9, title: 'Lotus Pier, Reunited', tag: 'Family',
    hint: 'Some invitations are thirteen years late. Send them anyway.',
    text: [
      'Sunday, 6:29 p.m. Wei Wuxian stands outside the gate at Lotus Pier holding a pot with a chipped lid, because he promised to wait one minute so he would not be early.',
      'He doesn\'t get the minute. Old Huang opens the gate before he can knock. "Boss said," the old man tells him, "next time, let him in." Jiang Cheng said it two years ago. Nobody ever told Wei Wuxian. Now somebody has.',
      'There is soup. Two hours, low fire, and nobody rushed it. Jin Ling has never tasted his mother\'s soup before. He eats three bowls and blames the steam for his eyes.',
      'Lan Wangji brought the good bowls. There are five. Four people sit down at the table, and nobody mentions the fifth bowl, and nobody moves it.',
      'Somewhere in the middle of dinner Jiang Cheng says, without looking up, "It\'s fine. The soup. It\'s fine." Wei Wuxian has to leave the table for a minute. Everybody lets him.',
    ],
    jc: [
      'When Jiang Cheng got his phone back, he found a yes he hadn\'t sent and a thank-you he had been trying to say for two years, both delivered, both read.',
      'He had a whole morning to type "That wasn\'t me." Instead he sent two messages from his laptop: "Ignore everything this phone sent last night." And then: "Except Sunday."',
      'After everyone left, he washed the pot himself and put it back on the kitchen shelf where it used to live. It is still there.',
    ],
  });

  E({
    id: 'tea', n: 10, title: 'Tea at the Hanshi', tag: 'Romance',
    hint: "Eighty-five degrees. No sugar. Three o'clock. Say yes like you mean it.",
    text: [
      'Saturday, 2:58 p.m. The mist lies on the Cloud Recesses as if it has nowhere else to be. A man in a grey coat (not the purple one; Tang Mei was very clear) walks up the stone steps past three thousand rules and does not read a single one.',
      'The Hanshi smells of rain and white peony. The water is at eighty-five degrees. Lan Xichen is standing in the doorway, and has been, Jiang Cheng suspects, for some time.',
      'They drink the first cup without talking. Over the second, Lan Xichen says, "You came." Jiang Cheng says, "I said three." He did not, technically. Somebody else did. Nobody mentions it.',
      'At some point the tea goes cold. Neither of them notices.',
    ],
    jc: [
      'When Jiang Cheng got his phone back, he read the balcony thread from the bottom up, then from the top down. Then he took the train he had always been going to take.',
      'On the train he opened the locked note called "Private", the one that had said only "Xichen —" for three weeks, and finished it. He never sent it. Somewhere around the fourth cup, he read it out loud instead.',
      'Lan Xichen did not answer for a long moment. Then he reached across the table and put his hand over Jiang Cheng\'s, and left it there, and that was the answer.',
      'Nie Huaisang knew within the hour. Nobody knows how. Nobody ever does.',
    ],
  });

  E({
    id: 'jl_hero', n: 11, title: 'Jiujiu of the Year', tag: 'Nephew',
    hint: 'A car in a pond, a wet dog, a secret party, one teenager. Keep them all in one piece.',
    text: [
      'Sunday. Jin Ling turns eighteen at Lotus Pier, which is quiet and full of family, exactly the way he never said he wanted it.',
      'The cake is lotus seed paste. He says he hates lotus seed paste. He has two slices. Jingyi takes forty photos, thirty-eight of them blurry. Sizhui has a spreadsheet. Fairy is not allowed inside, and is inside.',
      'Then his uncle hands him a small box wrapped in purple paper. Inside, on velvet, is a silver bell engraved with a lotus. It was his mother\'s. It rings exactly the way it used to.',
      'Jin Ling doesn\'t say anything for a long time. Then he says, "This is the worst gift you\'ve ever given me," in a voice that cracks clean in half, and hugs his uncle so hard that both of them have to pretend it never happened.',
      'The car is fine. The koi are fine. The kid, it turns out, is more than fine.',
    ],
    jc: [
      'When Jiang Cheng got his phone back, he discovered that "he" had handled a car in a koi pond, a soaking wet dog, a secret birthday group and a teenager in crisis, without threatening to break anyone\'s legs more than the usual amount.',
      'Jin Ling told everyone at school that his uncle was "weirdly chill" that night. Jiang Cheng has decided to let him keep believing it.',
      'He did, however, confiscate every key to Sandu. Both sets. And the spare. And the coat.',
    ],
  });

  E({
    id: 'legend', n: 12, title: 'Group Chat Legend', tag: 'Work',
    hint: 'Leadership is mostly soup and saying yes to things.',
    text: [
      'Monday, 9:00. The Q4 board meeting at Lotus Pier is interrupted, eleven minutes in, by the smell of three hundred and forty bowls of lotus root soup.',
      'Nobody at Yunmeng Jiang Group quite knows what happened on Friday night. The ops chat is screenshotted, printed and pinned to the canteen wall. A-Bai develops a devotion to his CEO that HR describes as "a lot".',
      'Old Huang tells the story of the night the Boss said nice things to anyone who will listen, and several people who won\'t. In his version, the Boss also cried. He did not. Probably.',
      'There is a hand-drawn poster of Fairy by the lifts now. Nobody remembers who authorized it. Her badge says Head of Morale.',
    ],
    jc: [
      'When Jiang Cheng got his phone back, he scrolled through the ops group with the face of a man reading his own obituary and finding it unexpectedly flattering.',
      'He considered issuing a correction. Tang Mei looked at him. He did not issue a correction.',
      'He now has to say "good work" at least once a quarter, or Old Huang worries. Lately, privately, he has started to mean it.',
    ],
  });

  E({
    id: 'true', n: 13, title: 'Good Samaritan, Truly', tag: 'Secret',
    hint: "Be him so well that he'd want to meet you. Then tell him the truth.",
    text: [
      'You found a phone in a taxi and, for one night, you were the person everyone in it needed. Then, in the morning, you told the truth.',
      'Sunday, 6:30 p.m. Lotus Pier. The gate is already open. Old Huang takes your coat, shakes your hand for slightly too long, and calls you "young master" by accident.',
      'Wei Wuxian hugs you before anyone tells him who you are. Jin Ling tells him. Wei Wuxian hugs you again. Fairy knocks you over. Lan Wangji says "Mn" in a way you understand, somehow, to mean welcome.',
      'There are six bowls now. One of them is yours. The fifth, the one nobody moves, is still at the end of the table, and when the soup comes round, Jiang Cheng fills it first.',
      'Halfway between the soup and the cake, Lan Xichen arrives with a tin of white peony, and Jiang Cheng gets up to put the kettle on himself, eighty-five degrees, no sugar, and nobody says a word. Not even Nie Huaisang, who was not invited, and is here.',
    ],
    jc: [
      'When Jiang Cheng got his phone back, he spent a long time deciding how angry to be. He settled on "not very", which alarmed everyone.',
      'He read every message. The yes to Sunday. The tea. The car. The thank-you, delivered at last. He had spent years not saying things, and a stranger had said them for him, carefully, the way he would have if he were braver.',
      'So he set a sixth bowl. And on Monday he finally changed his passcode, to the night a stranger found his phone in a taxi: 161026.',
    ],
  });
})();
