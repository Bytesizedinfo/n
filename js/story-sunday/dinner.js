/* The dinner — the one finale of "Sunday at Lotus Pier" (docs/SUNDAY.md "The dinner", docs/sunday/c.md).
   JC.sunday.finale() is played by the engine's { dinner: true } step: it marks Saturday done, reads the table
   (JC.sunday.table), builds the tap-through cards (0–3 Saturday cards, then Sunday at Lotus Pier beat by beat),
   records the night (JC.sunday.record) and returns JC.os.dinner(cards). Then the engine shows the 'sunday'
   ending card registered below, with the outcome title, a summary and Jiang Cheng's side.
   Every line here is earned by a flag: seats, dishes, threats (table.js) and the story flags behind them. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => (s && s.flags) || {};
  const aff = (s, id) => ((s && s.aff) || {})[id] || 0;
  const num = (s, k) => (typeof F(s)[k] === 'number' ? F(s)[k] : 0);
  const has = (id) => !!(JC.art && JC.art.has && JC.art.has(id));
  const art = (id) => (has(id) ? id : undefined);
  const card = (kicker, text, img) => {
    const t = (Array.isArray(text) ? text : [text]).filter(Boolean);
    return t.length ? { kicker, text: t, art: img ? art(img) : undefined } : null;
  };
  const list = (xs) => (xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
  const trace = () => { try { return JC.story.trace() || []; } catch (e) { return []; } };

  // ── Outcomes (table.outcome ids, docs/SUNDAY.md "Outcomes") ─────────
  const TITLES = {
    full: 'A Full Table',
    gate: 'Outside the Gate',
    two_parties: 'Two Parties',
    photos: 'Photos from Jin Ling',
    six: 'Six Bowls',
    five: 'Five Bowls',
    tea: 'Tea after Dinner',
    empty: 'The Empty Chair',
  };
  const ART = { full: 'end_true', gate: 'end_burned', two_parties: 'end_koigate', photos: 'end_zidian', six: 'end_true', five: 'end_reunited', tea: 'end_tea', empty: 'end_unsent' };

  /** Everything a beat needs, computed once per dinner. */
  function ctx(s, t) {
    const f = F(s);
    const st = (k) => t.seats[k].state;
    const seated = (k) => JC.sunday.SEATED.includes(st(k));
    const c = { s, f, t, st, seated, out: t.outcome, soup: t.dishes.soup, root: t.dishes.root, bell: t.dishes.bell, cake: t.dishes.cake };
    c.wwx = st('wwx') === 'yes';
    c.gate = st('wwx') === 'outside';
    c.lans = c.wwx || c.gate; // Lan Wangji comes where Wei Ying comes (even to the wrong side of a gate)
    c.jl = st('jl') === 'yes';
    c.jlLate = st('jl') === 'late';
    c.kids = st('sz') === 'yes';
    c.lxc = st('lxc');
    c.wn = st('wn');
    c.nhs = st('nhs') === 'yes';
    c.you = st('you');
    c.atTable = c.you === 'table';
    c.photos = c.you === 'photos';
    c.fairy = st('fairy') === 'in';
    c.honoured = !!t.seats.ajie.honoured;
    // who eats at the table (Jin Ling counts only if he is there for the soup)
    const diners = ['Jiang Cheng'];
    if (c.jl) diners.push('Jin Ling');
    if (c.wwx) diners.push('Wei Wuxian', 'Lan Wangji');
    if (c.lxc === 'yes') diners.push('Lan Xichen');
    if (c.wn === 'yes') diners.push('Wen Ning');
    if (c.kids) diners.push('Sizhui', 'Jingyi');
    if (c.nhs) diners.push('Nie Huaisang');
    if (c.atTable) diners.push('you');
    c.diners = diners;
    c.n = diners.length;
    return c;
  }
  const NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const word = (n) => NUM[n] || String(n);

  // ═════════════════════════════════════════════════════════════════
  // SATURDAY (0–3 cards, in this order of priority)
  // ═════════════════════════════════════════════════════════════════
  function satGusu(c) {
    if (!c.f.burned || !c.f.burned_mended) return null;
    return card('Saturday, 10:06 a.m. · The Jingshi', [
      'Tang Mei’s car gets him to Gusu in an hour and forty minutes, which is not legal. He stands at the door of the Jingshi with nothing in his hands. Wei Wuxian opens it with his eyes still swollen.',
      '“I didn’t send that,” Jiang Cheng says. And then, because it is the truest thing he has: “I used to think it. I don’t anymore. Six-thirty. Bring the pot.”',
    ]);
  }
  function satScandal(c) {
    const f = c.f;
    if (!f.scandal && !f.party_moved) return null;
    const koi = f.scandal_kind !== 'balcony';
    if (f.scandal_fixed && !f.party_moved) {
      if (f.lxc_board) {
        return card('Saturday, 8:02 a.m. · Koi Tower', [
          'Lan Xichen telephones Jin Zixun before breakfast and asks, very politely, whether the board would really like to explain a press wall to the Lanling Charity Trust, of which he is chair.',
          'The press wall is withdrawn by nine. Nobody has ever withdrawn anything for Jiang Cheng before. He doesn’t know where to put it.',
        ], 'p_gala_hall');
      }
      if (koi) {
        return card('Saturday, 11:30 a.m. · Lanling', [
          'Jin Ling goes to the valet’s house in a tie, with a box of pastries and a face like a funeral, and apologises with his own mouth. The valet gives Fairy a biscuit. His granddaughter takes a photo for the chemistry class.',
          'There is nothing left to put on a press wall. The Jin board finds something else to be outraged about by lunch. The koi get a plaque.',
        ], 'p_koi_pond_car');
      }
      return card('Saturday, 11:00 a.m. · Wavelet', [
        '@teaspiller_qh posts a correction. “Sources say a certain CEO simply needed some air. Sources apologise to the air. 🪭”',
        'Nobody believes it. Nobody needs to. The Jin board drops the idea of a press party, and Lan Xichen likes the post, which is somehow worse.',
      ]);
    }
    return card('Saturday, 4:10 p.m. · Koi Tower', [
      koi
        ? 'The Jin Group announces that the young master’s eighteenth birthday will be celebrated at Koi Tower, with a press wall, a string quartet and a statement about responsible driving. The koi pond is roped off for photographs.'
        : 'The Jin Group announces that the young master’s eighteenth birthday will be celebrated at Koi Tower, with a press wall, a string quartet and absolutely no balconies.',
      c.lans ? 'Jin Ling texts his uncle one line: “ill escape. save me soup.”' : 'Jin Ling texts his uncle one line: “ill escape. save me cake.”',
    ]);
  }
  function satTea(c) {
    const f = c.f;
    if (!f.tea_yes) return null;
    const s = c.s;
    const arrive = f.burned_mended
      ? 'He is already in Gusu. He walks over from the Jingshi with his sleeves still damp from Wei Wuxian’s kitchen, past three thousand rules, and doesn’t read a single one.'
      : s.done && s.done.ea_tea
        ? 'The mist lies on Cloud Recesses as if it has nowhere else to be. A man in a grey coat (not the purple one; Tang Mei was very clear) walks up the stone steps past three thousand rules and doesn’t read a single one.'
        : 'The mist lies on Cloud Recesses as if it has nowhere else to be. A man in a purple coat walks up the stone steps past three thousand rules and doesn’t read a single one.';
    let second;
    if (f.xichen_draft_sent && c.lxc === 'yes') second = 'The water is at eighty-five degrees. Over the second cup Lan Xichen answers the letter, properly, where he can see Jiang Cheng’s face while he does. Then he asks about Sunday. “I said six-thirty,” Jiang Cheng says. He didn’t, technically. Nobody mentions it.';
    else if (c.lxc === 'yes') second = 'The water is at eighty-five degrees. Over the second cup Lan Xichen asks whether he is still welcome tomorrow. “I said six-thirty,” Jiang Cheng says. He didn’t, technically. Somebody else did. Nobody mentions it.';
    else second = 'The water is at eighty-five degrees. They talk about lotus seasons and port authorities and not about Sunday; they are both, it turns out, very bad at this. At the door Jiang Cheng says, “There’ll be cake. After.” It is the closest he gets.';
    return card('Saturday, 2:58 p.m. · The Hanshi', [arrive, second], 'p_tea_hanshi');
  }
  function satSoup(c) {
    if (c.soup === 'none') return null;
    const root = c.root === 'honghu' ? ' The lotus root came in an Ops van at noon, twenty kilos of it, with a note from Old Huang: 👍.' : '';
    if (c.soup === 'right') return card('Saturday, 9:40 p.m. · The Jingshi kitchen', 'Attempt six. Low fire. Two hours. Wei Wuxian sits on the floor in front of the stove and does not touch the knob once, and Lan Wangji does not have to open a single window.' + root);
    if (c.soup === 'close') return card('Saturday, 9:40 p.m. · The Jingshi kitchen', 'Attempt six is close. Attempt seven is closer. Lan Wangji opens only two windows, which in that kitchen counts as a triumph.' + root);
    return card('Saturday, 11:50 p.m. · The Jingshi kitchen', 'Attempt six catches on the bottom. Wei Wuxian decides the fire is “basically right”, scrapes, tastes, decides again, and goes to bed at three with the pot on the counter like a sleeping animal.' + root);
  }
  function satBell(c) {
    if (c.bell === 'given') return card('Saturday, 10:15 p.m. · Lotus Pier', 'He takes the bell out of the jeweller’s gold box and lays it on purple velvet. It rings once as he does it, exactly the way it used to. He stands in the empty kitchen until it stops.', 'p_silver_bell');
    if (c.bell === 'unboxed') return card('Saturday, 10:15 p.m. · Lotus Pier', 'The bell stays in the jeweller’s box. Gold. He looks at it twice and decides it doesn’t matter. It will matter for exactly one minute.');
    return null;
  }

  // ═════════════════════════════════════════════════════════════════
  // SUNDAY (normal: you are at the table, thanked, or nowhere near it)
  // ═════════════════════════════════════════════════════════════════
  function gate(c) {
    const f = c.f;
    const k = 'Sunday, 6:29 p.m. · The gate';
    const van = c.wn === 'yes' || c.wn === 'drives' ? ' Behind him, Wen Ning’s van ticks as it cools.' : '';
    if (c.wwx) {
      return card(k, [
        'Wei Wuxian stands outside the gate at Lotus Pier holding a pot with a chipped lid, because he promised himself he would wait one minute so he wouldn’t be early.' + van,
        f.huang_list
          ? 'He doesn’t get the minute. Old Huang opens the gate with a laminated guest list in his other hand, and Wei Wuxian’s name is at the top of it, in the Boss’s handwriting. “Boss said,” the old man tells him. “Next time, let him in.”'
          : 'He doesn’t get the minute. Old Huang opens the gate before he can knock. “Boss said,” the old man tells him, “next time, let him in.” Jiang Cheng said it two years ago. Nobody ever told Wei Wuxian. Now somebody has.',
      ], 'end_reunited');
    }
    if (c.gate) {
      return card(k, [
        'Wei Wuxian is standing outside the gate with the pot with the chipped lid, and Lan Wangji beside him, holding the good bowls. He told himself one minute. It has been eleven.',
        'Nobody told Old Huang to open it. So he does what he did in 2024: he brings out tea, and stands with them on the wrong side of the gate, and says nothing at all.',
      ], 'end_burned');
    }
    if (c.jlLate) {
      return card(k, 'At 6:29 Old Huang opens the gate for nobody. The young master is in Lanling, under a press wall, smiling for cameras with his jaw set exactly like his uncle’s.' + (f.huang_list ? ' The laminated guest list in Old Huang’s pocket is very short tonight.' : ''));
    }
    const kids = c.kids ? ' Sizhui and Jingyi spill out of the back seat; Jingyi is already filming.' : '';
    return card(k, 'At 6:29 Old Huang opens the gate for the young master, who is two minutes late and sulking about it from the passenger seat of a car he is no longer allowed to drive.' + kids + (f.huang_list ? ' Old Huang ticks them off a laminated list, one by one. 👍' : ''));
  }
  function waiting(c) {
    const f = c.f;
    const p1 = c.root === 'honghu'
      ? 'Jiang Cheng has been in the kitchen since four, with his sleeves rolled up and twenty kilos of the wrong order on the counter. He has not admitted to waiting.'
      : 'Jiang Cheng has been in the kitchen since four, with his sleeves rolled up. He has not admitted to waiting.';
    let p2;
    if (c.jl) {
      p2 = 'Jin Ling comes through the door at 6:31 in a jacket his uncle chose and he pretends he chose, and says “It’s not a big deal” four times before he has his shoes off.';
      if (c.kids) p2 += ' Sizhui has a seating plan in a spreadsheet. Jingyi has taken forty photos, thirty-eight of them blurry.';
      if (f.car_handled && !f.car_cover) p2 += ' Nobody mentions the pond. Everybody thinks about the pond.';
    } else if (c.jlLate) {
      p2 = 'Jin Ling sends a photo every twenty minutes from Koi Tower: a string quartet; a cake in the shape of the company logo; a selfie, scowling. The last one says “escaping”.';
      if (c.kids) p2 += ' Sizhui and Jingyi came anyway, with the spreadsheet. They set his place.';
    }
    return card('6:31 p.m. · The kitchen', [p1, p2]);
  }
  function bowls(c) {
    const k = '6:40 p.m. · The table';
    if (c.wwx) {
      const extra = c.n > 4;
      const p = ['Lan Wangji brought the good bowls. He owns exactly five. Four of them are for the people at the table, and the fifth goes at the end, where nobody sits.'];
      if (extra) p.push(c.atTable
        ? 'Tonight there are ' + word(c.n) + ' people, so Old Huang brings more from the back of the cupboard, mismatched, the ones that survived the fire. There are six bowls on one side of the table now. One of them is yours.'
        : 'Tonight there are ' + word(c.n) + ' people, so Old Huang brings more from the back of the cupboard, mismatched, the ones that survived the fire.');
      return card(k, p);
    }
    if (c.n <= 1) return card(k, 'The table at Lotus Pier seats twelve. Tonight it is set for one, with a cake that isn’t cut and a bowl at the end that nobody sits at.');
    return card(k, 'The table at Lotus Pier seats twelve. Tonight Jiang Cheng sets ' + word(c.n) + ' places himself, then one more at the end, where nobody will sit. He doesn’t explain it. Nobody asks.' + (c.atTable ? ' One of the places is yours.' : ''));
  }
  function soup(c) {
    const k = '6:52 p.m. · The soup';
    const root = c.root === 'honghu' ? ' The lotus root is from the four hundred kilos. Old Huang tells everyone, twice.' : c.root === 'canteen' ? ' The lotus root is from the canteen’s soup week. Auntie Chen sent it with instructions.' : '';
    const jl = c.jl;
    if (c.soup === 'right') {
      return card(k, [
        'There is soup. Two hours, low fire, and nobody rushed it.' + (jl ? ' Jin Ling has never tasted his mother’s soup before. He eats three bowls and blames the steam for his eyes.' : '') + root,
        'Somewhere in the middle Jiang Cheng says, without looking up, “It’s fine. The soup. It’s fine.” Wei Wuxian has to leave the table for a minute. Everybody lets him.',
      ], 'p_lotus_root_soup');
    }
    if (c.soup === 'close') {
      return card(k, 'The soup is close. Jiang Cheng tastes it, puts the spoon down and says, “The fire was wrong.” Then he has a second bowl, and a third, and doesn’t say anything else, which from him is a speech.' + (jl ? ' Jin Ling watches him the whole time and has four.' : '') + root, 'p_lotus_root_soup');
    }
    if (c.soup === 'almost' && c.wwx) {
      return card(k, 'The soup has caught at the bottom. Everyone can taste it. Jiang Cheng eats two bowls in silence and then says, to nobody, “She burned it once too. Winter 2006. I had the flu.” Wei Wuxian, who swore never to tell, puts his spoon down very carefully.' + root);
    }
    // no soup from Gusu tonight
    const pot = c.gate ? ' Wei Wuxian’s pot is on the other side of the gate.' : '';
    return card(k, 'There is a pot on the stove that Jiang Cheng made himself at four o’clock, from a note on his phone. It is not hers. It is not even close.' + pot + (jl ? ' Jin Ling has two bowls and says it’s good, which is a lie, which is the kindest thing anyone does all night.' : '') + root);
  }
  function fairy(c) {
    const f = c.f;
    if (!c.fairy) {
      if (!c.jl && !c.jlLate) return null;
      return card('7:05 p.m. · The garden', 'Fairy is in the garden, barking at the koi in the east pond, because nobody told Old Huang she was allowed in. ' + (c.jl ? 'Jin Ling passes her a rib through the window when he thinks nobody is looking. Everybody is looking.' : 'Old Huang sits on the step with her and shares his duck.'));
    }
    const badge = f.dog_friday ? ' She is wearing her new badge. It says Head of Morale.' : '';
    let p = 'Fairy is not allowed inside, and is inside.' + badge;
    if (c.wwx) p += ' She lies across Wei Wuxian’s feet for two hours. He does not move. He says it’s fine. Lan Wangji feeds her rib bones under the table and believes nobody can see.';
    else p += ' She eats a rib bone she was not given and leans her whole weight against Jiang Cheng’s leg until he gives her another.';
    return card('7:05 p.m. · Under the table', p);
  }
  function xichen(c) {
    const f = c.f;
    const qr = f.qr_invited ? ' At eight a courier brings a box of Gusu tea cakes: “For the young master’s eighteenth. — Lan Qiren.” Lan Xichen laughs until he has to put his cup down.' : '';
    if (c.lxc === 'yes') {
      return card('7:20 p.m. · White peony', [
        'Lan Xichen came with a tin of white peony and sits, by somebody’s careful arrangement, next to Jiang Cheng.' + (f.lxc_first_name ? ' Jiang Cheng calls him Xichen in front of everyone, once, by accident, and the whole table goes very quiet and then very loud.' : ''),
        'When it is time for tea, Jiang Cheng gets up and makes it himself: rinse the cups first, eighty-five degrees, no sugar. Nobody says a word.' + (c.nhs ? ' Not even Nie Huaisang.' : '') + qr,
      ]);
    }
    if (c.lxc === 'late') {
      return card('8:40 p.m. · The door', 'Halfway between the soup and the cake there is a knock. Lan Xichen, with a tin of white peony, apologising for the hour. Jiang Cheng gets up to put the kettle on himself, eighty-five degrees, no sugar, and nobody says a word.' + qr);
    }
    if (f.lxc_invited) return card('8:00 p.m. · A courier', 'A courier brings a tin of white peony, no card. Jiang Cheng knows anyway. He puts it on the shelf next to the other one and doesn’t open it.');
    return null;
  }
  function wenning(c) {
    const f = c.f;
    if (c.wn === 'yes') {
      return card('7:30 p.m. · The end of the table', [
        'Wen Ning sits at the very end of the table, as if he might be asked to leave, and apologises to the soup. It is his first dinner at Lotus Pier since 2008.',
        'When the pot comes round, Jiang Cheng fills his bowl himself. “Eat,” he says. Wen Ning eats.' + (f.wn_accomplice ? ' He has not said one word about Friday night. He saw nothing. He will always have seen nothing.' : ''),
      ]);
    }
    if (c.wn === 'drives') {
      if (c.lans) return card('7:30 p.m. · The van', 'Wen Ning drove the Lans and won’t come in. He sits in the van outside the gate with the engine off, the way he always does. At eight Jin Ling takes him a bowl through the window. At nine Jiang Cheng walks out himself, stands by the van and says, “Next time, come in.”', 'p_wn_van');
      return card('5:10 p.m. · The van', 'Wen Ning brings Sandu home from the garage before dinner, washed, smelling only slightly of koi, and leaves before anyone can thank him. Jiang Cheng stands in the drive for a while, looking at the road.', 'p_wn_van');
    }
    return null;
  }
  function huaisang(c) {
    const f = c.f;
    if (c.nhs) {
      return card('7:45 p.m. · The fan', 'Nie Huaisang arrives late with a purple fan for Jin Ling, nine lotus petals, hand-painted, and does not take a single photo all night. He just watches, with the face of a man reading the best gossip of his life and keeping every word of it.' + (c.atTable && f.nhs_knows ? ' Once, passing you, he raises the fan and whispers, “I know nothing.”' : ''));
    }
    if (f.nhs_leak) return card('7:45 p.m. · Qinghe', 'In Qinghe, @teaspiller_qh posts a blurry photo of the Lotus Pier gate: “A certain birthday tonight 👀🪭”. Old Huang closes the gate. Jiang Cheng doesn’t look at his phone once.');
    return null;
  }
  function gift(c) {
    const late = c.jlLate;
    const k = late ? '10:20 p.m. · Purple velvet' : '8:10 p.m. · Purple velvet';
    const pre = late ? 'At 10:20 Jin Ling comes through the gate still in his tuxedo, starving, with a press badge round his neck. He eats cold soup standing up. Then his uncle hands him a box. ' : 'Then his uncle hands Jin Ling a box. ';
    if (c.bell === 'given') {
      return card(k, [
        pre + 'Inside, on purple velvet, is a silver bell engraved with a lotus. It was his mother’s. It rings exactly the way it used to.',
        'Jin Ling doesn’t say anything for a long time. Then he says, “This is the worst gift you’ve ever given me,” in a voice that cracks clean in half, and hugs his uncle so hard that both of them have to pretend it never happened.',
      ], 'p_silver_bell');
    }
    if (c.bell === 'unboxed') {
      return card(k.replace('Purple velvet', 'A gold box'), [
        pre + 'It is gold. Jin Ling complains about it for one whole minute. “A Jiang bell. In GOLD, jiujiu.”',
        'Then he opens it, and the bell inside rings exactly the way his mother’s did, and he stops complaining, and doesn’t start again all night.',
      ], 'p_silver_bell');
    }
    if (!c.jl && !late) return null;
    return card(k.replace('Purple velvet', 'The gift'), pre + 'It is a bow. It is a very good bow. Jin Ling says it’s fine, and carries it around for the rest of the night, and sleeps with it propped against the sofa.');
  }
  function toast(c) {
    const f = c.f;
    if (!c.jl && !c.jlLate) return null;
    const k = c.jlLate ? '10:40 p.m. · The toast' : '8:30 p.m. · The toast';
    const p = ['Jiang Cheng does not make toasts. He stands up anyway, with his tea.'];
    if (f.toast_edited) p.push('He reads it off his phone. Somebody finished the first sentence for him in the middle of Friday night. He reads all of it anyway, in his flat board-meeting voice, and doesn’t say who wrote it, and has to stop once.');
    else if (c.wwx) p.push('“Eighteen years ago your mother—” he says, and stops. “—would have made soup,” Wei Wuxian says quietly. “She did,” says Jiang Cheng, and sits down, and that is the toast.');
    else p.push('“Eighteen years ago your mother—” he says, and stops. “I know, jiujiu,” Jin Ling says. That is the toast.');
    if (num(c.s, 'ops_morale') >= 3) p.push('Old Huang plays a voice message from Ops: three hundred and forty people singing happy birthday, badly, with a dog barking in the middle of it.');
    return card(k, p);
  }
  function emptyBowl(c) {
    const f = c.f;
    const k = '9:00 p.m. · The last bowl';
    if (c.honoured) {
      const p = ['There is a bowl at the end of the table that nobody sits at. When the soup came round, Jiang Cheng filled it first.'];
      if (f.memo_sent) p.push('Nobody mentions it. Wei Wuxian keeps looking at it, and then at his brother, as if a voice memo from a temple road were still playing somewhere in the room.');
      else if (f.ajie_wrote) p.push('On his phone, in a thread that never delivers, there is a message from Friday night that he didn’t write. He has read it eleven times. He hasn’t deleted it.');
      else if (f.wwx_thanked) p.push('Nobody mentions it. Wei Wuxian sits next to it all night, and once, when he thinks nobody sees, he moves the spoon so it’s straight.');
      return card(k, p);
    }
    return card(k, 'There is a bowl at the end of the table that nobody sits at. Nobody fills it. Nobody moves it, either.' + (f.memo_deleted ? ' On his phone, in Recently Deleted, there is a voice memo with twenty-nine days left on it.' : ''));
  }
  function you(c) {
    const f = c.f;
    if (c.atTable) {
      const p1 = 'And you. Old Huang took your coat at the gate and called you “young master” by accident.' +
        (c.fairy ? ' Fairy knocked you over and has decided you are hers.' : '') +
        (c.wwx ? ' Lan Wangji said “Mn” in a way you understood, somehow, to mean welcome.' : '') +
        (f.jl_knows ? ' Jin Ling kept your secret until Saturday morning, and then told everyone, and saved you the seat next to the dog.' : '');
      const line = f.told_recipe && c.soup === 'right' ? '“You were right about the fire.”' : f.car_handled ? '“The car. Fine.”' : '“Did you eat.”';
      return card('9:15 p.m. · You', [p1, 'Jiang Cheng hasn’t said a word to you all night. Then, passing the pot, he says, ' + line + ' And that is how you know.']);
    }
    if (c.you === 'thanks') {
      return card('Monday · Jinxing Road 27', 'You aren’t there. You find out about it on Monday, when a box arrives at your door: a slice of lotus seed cake, a lotus root the size of your forearm, and a card in square, impatient handwriting. “Thank you. Don’t make it a thing. — J.C.”');
    }
    return card('9:15 p.m. · Nobody’s seat', 'You aren’t there. Nobody at the table knows you exist. But once, between the soup and the cake, Jiang Cheng reads a message from Friday night that he didn’t send, puts the phone face down, and looks for a moment like a man who would like to thank whoever did.');
  }
  function last(c) {
    const f = c.f;
    switch (c.out) {
      case 'full':
        return card('11:40 p.m. · The kitchen', 'After everyone has gone, Jiang Cheng washes the pot with the chipped lid himself and puts it back on the kitchen shelf where it used to live. Every chair at the table was used tonight. Even, in its way, the last one.', ART.full);
      case 'six':
        return card('11:20 p.m. · The kitchen', 'There were six bowls tonight. He washes all of them himself, dries them, and then, for no reason he could explain to anyone, puts one of the odd ones on a shelf of its own.', ART.six);
      case 'five':
        return card('11:10 p.m. · The kitchen', 'After everyone has gone, he washes the pot himself and puts it back on the kitchen shelf where it used to live. It is still there.', ART.five);
      case 'gate':
        return card('9:40 p.m. · The gate', 'At 9:40 Jiang Cheng walks down to the gate with two bowls from his own pot. He opens it. He doesn’t say anything; neither does Wei Wuxian. They sit on the step outside and eat cold soup that isn’t hers, shoulder to shoulder. It isn’t fixed. But the gate is open.', ART.gate);
      case 'two_parties':
        return card('11:30 p.m. · The sofa', 'Jin Ling falls asleep on the sofa in his tuxedo, with the press badge still round his neck and Fairy across his feet. Two parties. He went to the one that counted last, and stayed the longest.', 'end_jl_hero');
      case 'tea':
        return card('11:00 p.m. · The kettle', 'When the others have gone, the kettle is still warm. Lan Xichen stays for one more cup, and then another. At some point the tea goes cold. Neither of them notices.', ART.tea);
      default:
        return card('10:30 p.m. · The table', c.jl
          ? 'Jin Ling falls asleep on the sofa with the dog. Jiang Cheng sits at a table that seats twelve, with the plates of a very small birthday and his phone face down, and the bowl at the end, and thinks about everyone he didn’t answer.'
          : 'Jiang Cheng sits at a table that seats twelve, with his phone face down and the bowl at the end, and thinks about everyone he didn’t answer.', ART.empty);
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // SUNDAY as photos from Jin Ling (Zidian: he found you; you are not invited)
  // ═════════════════════════════════════════════════════════════════
  function photoCards(c) {
    const f = c.f;
    const cards = [];
    const K = (t) => 'Sunday, ' + t + ' · Unknown number';
    if (c.jlLate) {
      cards.push(card(K('5:58 p.m.'), [
        'Your phone buzzes. A photo, from a number you don’t know: a press wall with the Jin logo on it, and a teenager in a tuxedo in front of it, scowling.',
        '“this is jin ling. jiujiu wrote ur number on a receipt for the police. i took it. he said no police btw. he said get lost which for him is basically a hug”',
        '“escaping in 20 min”',
      ]));
    } else {
      cards.push(card(K('6:47 p.m.'), [
        'Your phone buzzes. A photo, from a number you don’t know: the gate at Lotus Pier, lanterns lit, an old man giving the camera a thumbs-up.',
        '“this is jin ling. jiujiu wrote ur number on a receipt for the police. i took it. he said no police btw. he said get lost which for him is basically a hug”',
      ]));
    }
    const bowlsN = c.n + 1;
    let cap;
    if (c.soup === 'right') cap = '“wei wuxian brought my moms soup. jiujiu said its fine. he had three bowls. FINE”';
    else if (c.wwx) cap = '“wei wuxian brought soup. its a little burnt. jiujiu ate it anyway and didnt say anything mean. i think hes sick”';
    else if (c.gate) cap = '“wei wuxian is outside the gate. jiujiu keeps looking at the window. nobody is allowed to say anything”';
    else cap = '“jiujiu made soup from a NOTE on his phone. its bad. im having two”';
    cards.push(card(K('7:02 p.m.'), ['A photo of the table from above, slightly crooked. You count ' + word(bowlsN) + ' bowls.', cap], c.soup !== 'none' ? 'p_lotus_root_soup' : undefined));
    if (c.fairy) cards.push(card(K('7:15 p.m.'), ['A photo of Fairy under the table, chewing something she wasn’t given.', f.dog_friday ? '“head of morale. on duty”' : '“she got in. nobody knows how. (i know how)”']));
    const people = [];
    if (c.lxc === 'yes' || c.lxc === 'late') people.push('“lan xichen came' + (c.lxc === 'late' ? ' after dinner' : '') + '. jiujiu made him TEA. himself. with a thermometer”');
    if (c.wn === 'yes') people.push('“wen ning came in!!! first time at lotus pier since before i was born. he said sorry to the soup”');
    if (c.nhs) people.push('“huaisang hasnt posted anything all night. suspicious”');
    if (people.length) cards.push(card(K('7:40 p.m.'), ['A blurry photo of people laughing at something just out of frame.'].concat(people.slice(0, 2))));
    if (c.bell !== 'none') cards.push(card(K('8:12 p.m.'), ['A photo of a silver bell, slightly out of focus, on ' + (c.bell === 'given' ? 'purple velvet' : 'a gold box lid') + '.', '“it was my moms”', '“dont text back im not crying”'], 'p_silver_bell'));
    cards.push(card(K('9:01 p.m.'), ['A photo of the end of the table: one bowl, nobody behind it.', c.honoured ? '“its for my mom. he never says that but it is. this year he filled it first”' : '“its for my mom. he never says that but it is. nobody touches it”']));
    cards.push(card(K('11:02 p.m.'), [
      'Last photo: Jiang Cheng asleep in a chair with the dog’s head on his knee.',
      '“he changed his passcode btw. its not my birthday anymore. i hate it”',
      f.car_handled ? '“ok bye. thanks for the car thing or wtv”' : '“ok bye stranger”',
    ]));
    return cards;
  }

  function build(s, t) {
    const c = ctx(s, t);
    if (c.photos) return photoCards(c).filter(Boolean);
    const sat = [satGusu(c), satScandal(c), satTea(c), satSoup(c), satBell(c)].filter(Boolean).slice(0, 3);
    const sun = [gate(c), waiting(c), bowls(c), soup(c), fairy(c), xichen(c), wenning(c), huaisang(c), gift(c), toast(c), emptyBowl(c), you(c), last(c)].filter(Boolean);
    // at most 14 cards: drop the least essential Sunday beats first
    let cards = sat.concat(sun);
    const DROP = [fairy, huaisang, waiting, wenning];
    for (let i = 0; cards.length > 14 && i < DROP.length; i++) {
      const gone = DROP[i](c);
      if (gone) cards = cards.filter((x) => !x || x.kicker !== gone.kicker);
    }
    return cards;
  }

  // ═════════════════════════════════════════════════════════════════
  // The finale and the one ending
  // ═════════════════════════════════════════════════════════════════
  JC.sunday = JC.sunday || {};
  JC.sunday.TITLES = TITLES;
  /** The cards for the current night (tests and the lead can preview them). */
  JC.sunday.cards = (s) => { s = s || S.view(); return build(s, JC.sunday.table(s)); };
  JC.sunday.finale = () => {
    S.applyFx({ set: { saturday_done: true } });
    const s = S.view();
    const t = JC.sunday.table(s);
    const cards = build(s, t);
    JC.sunday.record(t, TITLES[t.outcome] || 'Sunday at Lotus Pier');
    return JC.os.dinner(cards);
  };

  const T = (s) => JC.sunday.table(s);
  const lastOutcome = () => { try { const r = (JC.state.d.endings || {}).sunday; return (r && r.last && r.last.outcome) || null; } catch (e) { return null; } };
  const SUMMARY = {
    full: 'Every seat was filled. Every bowl, even the last one, even yours. It took one night of being someone else and one morning of telling the truth.',
    gate: 'Wei Wuxian came anyway, and waited on the wrong side of the gate, because the last thing his brother had said to him was not his brother at all.',
    two_parties: 'The Jin board got the afternoon. Lotus Pier got the night. Jin Ling went to the party that counted last, and stayed the longest.',
    photos: 'He found you. You weren’t invited. Sunday happened anyway, and it reached you one photo at a time, from a teenager who should have been asleep.',
    six: 'There were six bowls on Sunday. One of them was yours.',
    five: 'Five bowls on Sunday, Lan Wangji’s good ones. Thirteen years late, and nobody said so.',
    tea: 'No soup from Gusu this year. But there was white peony at eighty-five degrees, and someone to drink it with after the cake.',
    empty: 'A table for twelve, a very small birthday and a bowl at the end that nobody sat at. Most of the questions that night were never answered.',
  };
  function whoSat(s) {
    const t = T(s);
    const I = JC.sunday.SEAT_INFO || {};
    const names = ['jl', 'wwx', 'lwj', 'lxc', 'wn', 'sz', 'jy', 'nhs'].filter((k) => JC.sunday.SEATED.includes(t.seats[k].state)).map((k) => (I[k] && I[k].name) || k);
    if (t.seats.you.state === 'table') names.push('you');
    if (!names.length) return 'At the table: Jiang Cheng, and the last bowl.';
    return 'At the table with Jiang Cheng: ' + list(names) + '. ' + (t.seats.ajie.honoured ? 'The last bowl was filled first.' : 'The last bowl stayed empty.');
  }

  S.ending({
    id: 'sunday', n: 1, title: 'Sunday at Lotus Pier', tag: 'Sunday',
    hint: 'Every night ends at the same table. Who sits there is up to you.',
    get art() { const o = lastOutcome(); return (o && ART[o]) || 'end_reunited'; },
    text: [
      (s) => SUMMARY[T(s).outcome] || SUMMARY.empty,
      (s) => whoSat(s),
      (s) => {
        const f = F(s);
        const fixed = [];
        if (f.burned && f.burned_mended) fixed.push('drove to Gusu on Saturday morning to unsay what “he” had said');
        if (f.scandal && f.scandal_fixed) fixed.push('kept the birthday at Lotus Pier');
        if (f.told_recipe) fixed.push('passed on the fire: two hours, low');
        if (fixed.length) return 'Because of that night, Jiang Cheng ' + list(fixed) + '.';
        if (f.returned_early) return 'You gave the phone back before morning. Whatever you left unanswered, he answered himself, or didn’t.';
        return null;
      },
    ],
    jc: [
      (s) => {
        const f = F(s);
        if (f.zidian) return 'When Jiang Cheng got his phone back, he changed the passcode in your stairwell. It is nobody’s birthday now. Jin Ling is insufferable about this.';
        if (f.returned_how === 'fairy') return 'When Jiang Cheng got his phone back, it was handed to him at one in the morning by his nephew, who was soaking wet, furious and trying not to smile. “Fairy has a new favourite,” Jin Ling said. “It’s not you.”';
        if (f.returned_how === 'desk' || f.phone_at_desk) return 'When Jiang Cheng got his phone back, it was in an envelope at the Golden Peony’s front desk with “Room 1808” on it. He read every message from the night before, twice, standing in the lobby in yesterday’s suit.';
        if (f.returned_how === 'swift') return 'When Jiang Cheng got his phone back, it came with a Swift Ride found-item number, #SR-1016-2347, and a very small rating for himself. He read every message in the back of Master Wu’s car.';
        if (f.returned_early) return 'When Jiang Cheng got his phone back, in the middle of the night, he read every message twice in a hotel bathrobe. Most of them were people asking if he was all right.';
        if (f.wn_accomplice) return 'When Jiang Cheng got his phone back, Wen Ning brought it at ten, with Tang Mei in the passenger seat of the van, and apologised for having seen nothing.';
        return 'When Jiang Cheng got his phone back, at ten on Saturday, from Tang Mei, he had already read everything on his laptop. He read it all again anyway.';
      },
      (s) => {
        const f = F(s);
        if (f.memo_sent) return 'The memo had been sent. Two years in a phone in a drawer, and a stranger had pressed Share. He didn’t unsend it. He didn’t delete the reply, either: “you kept this for two years?”';
        if (f.memo_heard && !f.wwx_thanked) return 'Untitled 14 said “played”. Not by him. On Sunday night, after everyone left, he sat in the car outside Lotus Pier until the engine went cold, then pressed Share and sent it before he could stop himself.';
        if (f.wwx_invited && !f.burned) return 'He kept the yes to Wei Wuxian. He had a whole morning to type “That wasn’t me.” He didn’t.';
        if (f.tea_yes) return 'He kept the tea. He told himself he had always been going to go. Tang Mei let him.';
        return null;
      },
      (s) => {
        const f = F(s);
        const t = T(s);
        if (t.seats.you.state === 'table') return 'On Monday he finally changed his passcode, to the night a stranger found his phone in a taxi: 161026. “Six bowls,” he told Tang Mei, when she asked how Sunday went. “Don’t make it a thing.”';
        if (f.renamed_wwx && !f.renamed_wwx_cold) return 'Wei Wuxian is still saved as “' + f.renamed_wwx + '” in his phone. “Leave it,” he told Jin Ling. “It’s fine.” It is the second time that weekend he has said it and meant something else entirely.';
        if (t.outcome === 'gate') return '“It isn’t fixed,” he told Tang Mei on Monday. Then, after a while: “He came anyway.”';
        if (t.outcome === 'empty') return '“It was fine,” he told Tang Mei on Monday. She cleared his Thursday without being asked.';
        if (t.outcome === 'tea') return '“He stayed for tea,” he told Tang Mei on Monday, and then looked at his screen very hard until she left.';
        return '“It was fine,” he told Tang Mei on Monday, when she asked how Sunday went. She has worked for him for nine years. She knew exactly what he meant.';
      },
    ],
  });
})();
