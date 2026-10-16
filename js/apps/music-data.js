/* Music — catalog: artists, albums, songs (with original lyrics), playlists, stations, extra cover art.
   Everything here is fictional. Facts: docs/STORY.md. Loaded before music-engine.js and music.js. */
(function () {
  'use strict';
  const JC = window.JC;

  // ── Extra cover art (playlists/albums without a cover_* from the art pack) ──
  JC.art.def('cover_mu_lotuspier', {
    title: 'Lotus Pier Nights', w: 600, h: 600, tags: ['cover'],
    svg: (w, h) => {
      let petals = '';
      for (let i = 0; i < 9; i++) {
        const a = -90 + (i - 4) * 19;
        petals += `<path d="M300 300 C ${300 - 26} 236, ${300 - 18} 176, 300 150 C ${300 + 18} 176, ${300 + 26} 236, 300 300Z" transform="rotate(${a + 90} 300 300)" fill="none" stroke="#e9cf8f" stroke-width="5" stroke-opacity="${0.55 + (4 - Math.abs(i - 4)) * 0.1}"/>`;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1236"/><stop offset=".62" stop-color="#3d2466"/><stop offset="1" stop-color="#140d27"/></linearGradient><radialGradient id="m" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#f6e6b8" stop-opacity=".35"/><stop offset="1" stop-color="#f6e6b8" stop-opacity="0"/></radialGradient></defs>` +
        `<rect width="600" height="600" fill="url(#b)"/><circle cx="300" cy="250" r="230" fill="url(#m)"/>` +
        `<g transform="translate(0 40)">${petals}<path d="M190 300 Q300 340 410 300" stroke="#e9cf8f" stroke-width="5" fill="none"/></g>` +
        `<rect x="0" y="392" width="600" height="208" fill="#0e0a1d" fill-opacity=".55"/>` +
        `<g stroke="#e9cf8f" stroke-opacity=".35" stroke-width="3"><path d="M120 412h360M170 430h260M220 448h160"/></g>` +
        `<text x="48" y="520" font-family="Georgia,'Noto Serif SC',serif" font-size="54" fill="#f4ead2">Lotus Pier</text>` +
        `<text x="48" y="568" font-family="Georgia,'Noto Serif SC',serif" font-style="italic" font-size="40" fill="#e9cf8f">Nights</text>` +
        `<text x="552" y="566" text-anchor="end" font-family="-apple-system,Helvetica,Arial" font-size="16" letter-spacing="3" fill="#cdb9f2" fill-opacity=".8">九瓣莲</text></svg>`;
    },
  });
  JC.art.def('cover_mu_rainlanling', {
    title: 'Rain in Lanling', w: 600, h: 600, tags: ['cover'],
    svg: (w, h) => {
      let rain = '';
      for (let i = 0; i < 70; i++) {
        const x = (i * 97) % 640 - 20, y = (i * 53) % 600, l = 22 + (i % 5) * 9;
        rain += `<path d="M${x} ${y}l-6 ${l}" />`;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1f2e"/><stop offset="1" stop-color="#173e4f"/></linearGradient><radialGradient id="l" cx=".72" cy=".3" r=".35"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>` +
        `<rect width="600" height="600" fill="url(#s)"/><circle cx="430" cy="180" r="210" fill="url(#l)"/>` +
        `<path d="M432 110v330" stroke="#0a1620" stroke-width="10"/><path d="M432 112q-40 0-46 26" stroke="#0a1620" stroke-width="8" fill="none"/><circle cx="386" cy="142" r="9" fill="#ffe2a6"/>` +
        `<path d="M0 470h600v130H0z" fill="#0a1922"/><g fill="#ff4d4d" fill-opacity=".8"><circle cx="150" cy="452" r="9"/><circle cx="204" cy="452" r="9"/></g><path d="M110 470c10-34 26-46 70-46s64 12 74 46" fill="#ffd23f" fill-opacity=".9"/>` +
        `<g stroke="#bfe6f5" stroke-opacity=".38" stroke-width="2" stroke-linecap="round">${rain}</g>` +
        `<g fill="#ffd27a" fill-opacity=".18"><ellipse cx="180" cy="520" rx="90" ry="10"/><ellipse cx="430" cy="540" rx="60" ry="7"/></g>` +
        `<text x="44" y="96" font-family="-apple-system,Helvetica,Arial" font-weight="700" font-size="50" fill="#e8f4f8">Rain in</text>` +
        `<text x="44" y="150" font-family="-apple-system,Helvetica,Arial" font-weight="700" font-size="50" fill="#e8f4f8">Lanling</text></svg>`;
    },
  });
  JC.art.def('cover_mu_zidian', {
    title: 'Zidian', w: 600, h: 600, tags: ['cover'],
    svg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><radialGradient id="g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8f4dff" stop-opacity=".55"/><stop offset="1" stop-color="#8f4dff" stop-opacity="0"/></radialGradient></defs>` +
      `<rect width="600" height="600" fill="#0b0712"/><circle cx="300" cy="290" r="250" fill="url(#g)"/>` +
      `<circle cx="300" cy="290" r="150" fill="none" stroke="#b98cff" stroke-width="14"/><circle cx="300" cy="290" r="150" fill="none" stroke="#f2e6ff" stroke-width="3"/>` +
      `<path d="M318 120 262 282h48l-34 170 96-196h-52l42-136z" fill="#f2e6ff" stroke="#b98cff" stroke-width="6" stroke-linejoin="round"/>` +
      `<text x="300" y="520" text-anchor="middle" font-family="Impact,'Arial Black',Helvetica,Arial" font-size="58" letter-spacing="6" fill="#f2e6ff">ZIDIAN</text>` +
      `<text x="300" y="560" text-anchor="middle" font-family="-apple-system,Helvetica,Arial" font-weight="700" font-size="20" letter-spacing="8" fill="#b98cff">PURPLE LIGHTNING</text></svg>`,
  });
  JC.art.def('cover_mu_shenyao', {
    title: 'Old Songs from the Lake', w: 600, h: 600, tags: ['cover'],
    svg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="600" height="600" fill="#efe4cf"/>` +
      `<path d="M0 330c90-30 170-40 300-24s210 6 300-20v314H0z" fill="#c9b79a" fill-opacity=".55"/>` +
      `<path d="M0 360c120-22 220-18 320-8s200 8 280-10" stroke="#8a7458" stroke-width="3" fill="none" stroke-opacity=".6"/>` +
      `<path d="M60 250c40-60 90-80 130-70 30 8 50 40 90 30" stroke="#6d5a44" stroke-width="5" fill="none" stroke-opacity=".5"/>` +
      `<path d="M330 380h120l-20 22h-84z" fill="#4a3b2c"/><path d="M386 380v-58l34 50z" fill="#4a3b2c" fill-opacity=".8"/>` +
      `<g fill="#d98c8c" fill-opacity=".75"><circle cx="140" cy="420" r="16"/><circle cx="170" cy="440" r="10"/></g>` +
      `<rect x="500" y="56" width="52" height="68" rx="6" fill="#b3261e"/><text x="526" y="102" text-anchor="middle" font-family="'Ma Shan Zheng','Noto Serif SC',serif" font-size="32" fill="#f4e7cf">瑶</text>` +
      `<text x="48" y="110" font-family="'Noto Serif SC',Georgia,serif" font-size="46" fill="#3b2f23">沈瑶</text>` +
      `<text x="48" y="150" font-family="Georgia,serif" font-style="italic" font-size="24" fill="#5d4a37">Shen Yao</text>` +
      `<text x="48" y="540" font-family="Georgia,serif" font-size="30" fill="#3b2f23">Old Songs from the Lake</text>` +
      `<text x="48" y="572" font-family="-apple-system,Helvetica,Arial" font-size="15" letter-spacing="3" fill="#7a6650">YUNMENG · 2006</text></svg>`,
  });

  // ── Artists ───────────────────────────────────────────────────────
  const artists = [
    { id: 'gusu', name: 'Gusu Strings Ensemble', art: 'cover_cloud_ambient', genre: 'Classical', bio: 'A guqin and xiao collective from the Cloud Recesses conservatory. Their rehearsals are silent. Their concerts are not. Founded by a music professor who, according to the liner notes, “prefers not to be credited.”' },
    { id: 'yiling', name: 'Yiling Laozu & the Radishes', art: 'cover_yiling_flute', genre: 'Folk', bio: 'Folk-punk flute band from Burial Mounds hill, Yiling. The frontman plays a black dizi with a red tassel and sells radishes at the merch table. Their drummer is a session musician from Gusu who does not smile in photos.' },
    { id: 'purple', name: 'Purple Lightning', art: 'cover_mu_zidian', genre: 'Rock', bio: 'Industrial gym-rock duo from Yunmeng. Songs about discipline, iron, early mornings and telling people to get lost. They have never given an interview. They have declined several.' },
    { id: 'koipond', name: 'Koi Pond Boys', art: 'cover_koi_records', genre: 'Pop', bio: 'Seven-member boy group signed to Koi Records, Lanling. Matching gold jackets. Choreography so tight it has its own fan account.' },
    { id: 'peony', name: 'Peony & the Golden Carp', art: 'cover_koi_records', genre: 'Pop', bio: 'Lanling’s favourite wedding band, turned chart act. Every gala at Koi Tower ends with “Peony Season.” Every single one.' },
    { id: 'drift', name: 'LANLING DRIFT', art: 'cover_aling_mix', genre: 'Chiptune', bio: 'Pop-punk chiptune duo. Both members failed their driving test twice. They wrote an album about it.' },
    { id: 'fairy8', name: '8-Bit Fairy', art: 'cover_aling_mix', genre: 'Chiptune', bio: 'Anonymous bedroom chiptune producer. Rumoured to be a Lanling International student. Every track is named after a dog.' },
    { id: 'shenyao', name: 'Shen Yao', art: 'cover_mu_shenyao', genre: 'Folk', bio: 'Yunmeng folk singer. Her 2006 album “Old Songs from the Lake” was played in every kitchen on the lake for three summers.' },
    { id: 'nighttaxi', name: 'Night Taxi', art: 'cover_rain', genre: 'Lo-Fi', bio: 'Anonymous lo-fi producer who records rain from the back seats of Lanling cabs. Every track is one ride long.' },
  ];

  // ── Albums ────────────────────────────────────────────────────────
  const albums = [
    { id: 'ln', title: 'Lotus Nocturnes', artist: 'gusu', art: 'cover_lotus_nocturnes', year: 2023, genre: 'Classical', label: 'Cloud Recesses Editions', accent: '#d9b25f', songs: ['ln1', 'ln2', 'ln3', 'ln4', 'ln5'] },
    { id: 'cl', title: 'cloud', sub: 'Ambient Works for Still Mornings', artist: 'gusu', art: 'cover_cloud_ambient', year: 2021, genre: 'Ambient', label: 'Cloud Recesses Editions', accent: '#7f9cc4', songs: ['cr1', 'cr2', 'cr3', 'cr4', 'cr5'] },
    { id: 'yl', title: 'Yiling Laozu & the Radishes', artist: 'yiling', art: 'cover_yiling_flute', year: 2024, genre: 'Folk', label: 'Burial Mounds Records', accent: '#e8513c', songs: ['yl1', 'yl2', 'yl3', 'yl4', 'yl5'] },
    { id: 'zd', title: 'Zidian', artist: 'purple', art: 'cover_mu_zidian', year: 2025, genre: 'Rock', label: 'Nine Petals Music', accent: '#a46bff', songs: ['pl1', 'pl2', 'pl3', 'pl4', 'pl5'] },
    { id: 'kr', title: 'Koi Records Presents: Golden Hour', artist: 'various', art: 'cover_koi_records', year: 2026, genre: 'Pop', label: 'Koi Records', accent: '#f0a33a', songs: ['kt1', 'kt2', 'kt3', 'kt4', 'kt5', 'kt6'] },
    { id: 'sy', title: 'Old Songs from the Lake', artist: 'shenyao', art: 'cover_mu_shenyao', year: 2006, genre: 'Folk', label: 'Yunmeng Lake Records', accent: '#c9a77c', songs: ['sj1', 'sj2', 'sj3', 'sj4'] },
    { id: 'rn', title: 'rain', sub: 'sounds for 4 a.m.', artist: 'nighttaxi', art: 'cover_rain', year: 2025, genre: 'Lo-Fi', label: 'Night Taxi', accent: '#5aa5c6', songs: ['rn1', 'rn2', 'rn3'] },
  ];

  // ── Lyrics (original). Each array item is one 2-bar phrase. 'I'/'C'/'O' = instrumental phrases. ──
  const L = {
    yl1: [ // Radish Season
      'I', 'I',
      ['A', 'Up on the hill where the cold wind blows,'], ['A', 'nobody asks where the farmer goes.'], ['A', 'Pull ’em up white and pull ’em up round —'], ['A', 'best little crop on the Burial Mound.'],
      ['B', 'Oh, it’s radish season, radish season,'], ['B', 'don’t need a rhyme and don’t need a reason.'], ['B', 'Bring me a basket, bring me a friend —'], ['B', 'radish season never ends.'],
      ['A', 'My husband says the rows are crooked,'], ['A', 'I say that’s how the good ones look.'], ['A', 'Sell ’em on Sunday down by the bridge,'], ['A', 'two for a song and three for a kiss.'],
      ['B', 'Oh, it’s radish season, radish season,'], ['B', 'don’t need a rhyme and don’t need a reason.'], ['B', 'Bring me a basket, bring me a friend —'], ['B', 'radish season never ends.'],
      'C', 'C',
      ['B', 'Oh, it’s radish season, radish season,'], ['B', 'don’t need a rhyme and don’t need a reason.'], ['B', 'Bring me a basket, bring me a friend —'], ['B', 'radish season never ends.'],
      'O', 'O',
    ],
    yl2: [ // Don't Bring the Dog
      'I', 'I',
      ['A', 'You can bring the wine, you can bring the noise,'], ['A', 'you can bring your cousins and the neighbour’s boys,'], ['A', 'bring a cake, bring a kite, bring a dragon on a string —'], ['A', 'just leave out the one thing. You know the thing.'],
      ['B', 'Don’t bring the dog! (No!) Don’t bring the dog!'], ['B', 'Not the little one, not the big one, not the one that eats the log.'], ['B', 'I will cook, I will sing, I will hold the door —'], ['B', 'but you bring the dog, I’m on the roof once more.'],
      ['A', 'There’s a black one in Lanling and she’s big as a car,'], ['A', 'she sits on the roof like she thinks she’s a star.'], ['A', 'They call her a fairy. I call her a beast.'], ['A', 'She looked at me once and I ran three miles east.'],
      ['B', 'Don’t bring the dog! (No!) Don’t bring the dog!'], ['B', 'Not the little one, not the big one, not the one that eats the log.'], ['B', 'I will cook, I will sing, I will hold the door —'], ['B', 'but you bring the dog, I’m on the roof once more.'],
      'C', 'C',
      ['B', 'Don’t bring the dog! (No!) Don’t bring the dog!'], ['B', 'Not the little one, not the big one, not the one that eats the log.'], ['B', 'I will cook, I will sing, I will hold the door —'], ['B', '…okay, she can come. She stays by the door.'],
      'O', 'O',
    ],
    yl5: [ // Come Home for Soup
      'I', 'I',
      ['A', 'There’s a pot on the stove that I can’t get right,'], ['A', 'burnt it twice on a Tuesday night.'], ['A', 'Lotus root, the way she made —'], ['A', 'some things stay when the people fade.'],
      ['B', 'Come home for soup, come home for soup,'], ['B', 'leave the gate a little open and I’ll find my way through.'], ['B', 'Five bowls on the table, one for every name —'], ['B', 'come home for soup. It won’t taste the same.'],
      ['A', 'I stood at your gate for twenty minutes, maybe more.'], ['A', 'The old man brought me tea. I didn’t knock on the door.'], ['A', 'I left before the lanterns, I left before the rain —'], ['A', 'next time, I swear, I’ll knock again.'],
      ['B', 'Come home for soup, come home for soup,'], ['B', 'leave the gate a little open and I’ll find my way through.'], ['B', 'Five bowls on the table, one for every name —'], ['B', 'come home for soup. It won’t taste the same.'],
      'C', 'C',
      ['B', 'Come home for soup, come home for soup —'], ['B', 'the door was always open. I just never walked through.'], ['B', 'Five bowls on the table, one for every name.'], ['B', 'Come home for soup. It’ll taste the same.'],
      'O', 'O',
    ],
    pl4: [ // Get Lost
      'I', 'I',
      ['A', 'Don’t call me, don’t text me, I’m under the bar,'], ['A', 'don’t tell me to smile, I know who you are.'], ['A', 'Ninety kilos. One more rep —'], ['A', 'lightning in my veins and purple in my step.'],
      ['B', 'Get lost! (Get lost!)'], ['B', 'I said get lost! (Get lost!)'], ['B', 'Nobody talks before six a.m. —'], ['B', 'get lost, and don’t come back again.'],
      ['A', 'You want a minute? Make an appointment.'], ['A', 'You want a hug? That’s a disappointment.'], ['A', 'Nine petals on my jacket, iron in my hand —'], ['A', 'I don’t need you to understand.'],
      ['B', 'Get lost! (Get lost!)'], ['B', 'I said get lost! (Get lost!)'], ['B', 'Nobody talks before six a.m. —'], ['B', 'get lost, and don’t come back again.'],
      'C', 'C',
      ['B', 'Get lost! (Get lost!)'], ['B', 'I said get lost! (Get lost!)'], ['B', 'Nobody talks before six a.m. —'], ['B', 'get lost… and come back for dinner. Again.'],
      'O', 'O',
    ],
    kt2: [ // Peony Season
      'I', 'I',
      ['A', 'Gold on the water, lights on the tower,'], ['A', 'everybody dancing for a peony flower.'], ['A', 'You looked at me from across the hall —'], ['A', 'balcony lights, and I forgot it all.'],
      ['B', 'It’s peony season, it’s peony season,'], ['B', 'and I can’t think of a single reason to leave.'], ['B', 'Say it again under silver light —'], ['B', 'peony season, stay tonight.'],
      ['A', 'You said a thing I can’t repeat at all,'], ['A', 'I counted the koi like they’d break my fall,'], ['A', 'ran down the stairs like a fool in the rain —'], ['A', 'if you ask me twice, I’ll answer again.'],
      ['B', 'It’s peony season, it’s peony season,'], ['B', 'and I can’t think of a single reason to leave.'], ['B', 'Say it again under silver light —'], ['B', 'peony season, stay tonight.'],
      'C', 'C',
      ['B', 'It’s peony season, it’s peony season,'], ['B', 'and I can’t think of a single reason to leave.'], ['B', 'Say it again under silver light —'], ['B', 'peony season, stay tonight.'],
      'O', 'O',
    ],
    kt3: [ // Learner Permit
      'I', 'I',
      ['A', 'Got my learner permit, got my uncle’s keys,'], ['A', 'mirror, signal, maneuver, please.'], ['A', 'Left at the tower, right at the pond —'], ['A', 'hey, where’d the road go? Road’s gone.'],
      ['B', 'Beep beep, I’m seventeen,'], ['B', 'fastest heir you’ve ever seen.'], ['B', 'Parallel parking? Not my thing —'], ['B', 'call me when the koi start swimming.'],
      ['A', 'Dog in the back seat, dog on the roof,'], ['A', 'officer, I swear I’ve got proof:'], ['A', 'the brakes were there when I left the ball —'], ['A', 'technically I didn’t hit anything at all.'],
      ['B', 'Beep beep, I’m seventeen,'], ['B', 'fastest heir you’ve ever seen.'], ['B', 'Parallel parking? Not my thing —'], ['B', 'call me when the koi start swimming.'],
      'C', 'C', 'C', 'C',
      ['B', 'Beep beep, I’m seventeen,'], ['B', 'fastest heir you’ve ever seen.'], ['B', 'Parallel parking? Not my thing —'], ['B', 'call me when the koi start swimming.'],
      ['B', 'Beep beep, I’m almost eighteen,'], ['B', 'nicest car you’ve ever seen,'], ['B', 'half in the water, half on the lawn —'], ['B', 'please don’t tell my uncle. He’ll know anyway.'],
      'O', 'O',
    ],
    sj1: [ // Lotus Root Soup
      'I', 'I',
      ['A', 'Slice the root in coins of white,'], ['A', 'count the holes like stars at night,'], ['A', 'ribs and ginger, slow and low —'], ['A', 'wait the way that sisters know.'],
      ['B', 'And if you’re far, and if you’re cold,'], ['B', 'there’s a bowl kept warm, there’s a hand to hold.'], ['B', 'Every pot a little light —'], ['B', 'come home before the end of night.'],
      ['A', 'Little brother, don’t you frown,'], ['A', 'I saved the sweetest piece for you now.'], ['A', 'One for you and one for him,'], ['A', 'and one for me when the lamps go dim.'],
      ['B', 'And if you’re far, and if you’re cold,'], ['B', 'there’s a bowl kept warm, there’s a hand to hold.'], ['B', 'Every pot a little light —'], ['B', 'come home before the end of night.'],
      'O', 'O',
    ],
    sj2: [ // Little Lotus, Sleep
      'I', 'I',
      ['A', 'Little lotus, close your eyes,'], ['A', 'the moon is sailing through the skies,'], ['A', 'the water’s still, the wind is low,'], ['A', 'someone’s humming, soft and slow.'],
      ['B', 'Sleep, sleep, the lake will keep'], ['B', 'every star too high to reach,'], ['B', 'and when you wake, the sun will be'], ['B', 'a golden boat come home to me.'],
      ['A', 'Little lotus, don’t you cry,'], ['A', 'your uncle’s grumbling, by and by.'], ['A', 'He’ll hum it wrong, he’ll hum it right,'], ['A', 'and stay beside you through the night.'],
      ['B', 'Sleep, sleep, the lake will keep'], ['B', 'every star too high to reach,'], ['B', 'and when you wake, the sun will be'], ['B', 'a golden boat come home to me.'],
      'O', 'O',
    ],
  };

  // ── Songs ─────────────────────────────────────────────────────────
  // style: guqin | ambient | folk | gym | chip | pop | ballad | lofi.  dur = target seconds (instrumentals).
  const songs = [
    { id: 'ln1', title: 'Lotus Pier at Dusk', artist: 'gusu', album: 'ln', style: 'guqin', bpm: 72, dur: 192 },
    { id: 'ln2', title: 'Nine Petals', artist: 'gusu', album: 'ln', style: 'guqin', bpm: 80, dur: 161 },
    { id: 'ln3', title: 'Lanterns on the Lake', artist: 'gusu', album: 'ln', style: 'guqin', bpm: 68, dur: 178 },
    { id: 'ln4', title: 'The Pavilion Waits', artist: 'gusu', album: 'ln', style: 'guqin', bpm: 64, dur: 204 },
    { id: 'ln5', title: 'Night Ferry to Yunmeng', artist: 'gusu', album: 'ln', style: 'guqin', bpm: 76, dur: 156 },
    { id: 'cr1', title: 'Three Thousand Rules', artist: 'gusu', album: 'cl', style: 'ambient', bpm: 66, dur: 140 },
    { id: 'cr2', title: 'Mist over Gusu', artist: 'gusu', album: 'cl', style: 'ambient', bpm: 60, dur: 185 },
    { id: 'cr3', title: 'Cold Spring', artist: 'gusu', album: 'cl', style: 'ambient', bpm: 70, dur: 167 },
    { id: 'cr4', title: 'Hanshi, Early Snow', artist: 'gusu', album: 'cl', style: 'ambient', bpm: 62, dur: 196 },
    { id: 'cr5', title: 'Library Pavilion', artist: 'gusu', album: 'cl', style: 'ambient', bpm: 68, dur: 118 },
    { id: 'yl1', title: 'Radish Season', artist: 'yiling', album: 'yl', style: 'folk', bpm: 112, lyrics: L.yl1 },
    { id: 'yl2', title: 'Don’t Bring the Dog', artist: 'yiling', album: 'yl', style: 'folk', bpm: 122, lyrics: L.yl2, explicit: false },
    { id: 'yl3', title: 'Chenqing', artist: 'yiling', album: 'yl', style: 'folk', bpm: 96, dur: 188 },
    { id: 'yl4', title: 'Burial Mounds Barn Dance', artist: 'yiling', album: 'yl', style: 'folk', bpm: 126, dur: 146 },
    { id: 'yl5', title: 'Come Home for Soup', artist: 'yiling', album: 'yl', style: 'folkslow', bpm: 84, lyrics: L.yl5 },
    { id: 'pl1', title: 'Zidian', artist: 'purple', album: 'zd', style: 'gym', bpm: 128, dur: 178 },
    { id: 'pl2', title: 'Sandu (Unsheathed)', artist: 'purple', album: 'zd', style: 'gym', bpm: 132, dur: 164 },
    { id: 'pl3', title: 'Discipline', artist: 'purple', album: 'zd', style: 'gym', bpm: 124, dur: 190 },
    { id: 'pl4', title: 'Get Lost', artist: 'purple', album: 'zd', style: 'gym', bpm: 128, lyrics: L.pl4, explicit: true },
    { id: 'pl5', title: 'Iron Lotus', artist: 'purple', album: 'zd', style: 'gym', bpm: 130, dur: 206 },
    { id: 'kt1', title: 'Golden Carp Rave', artist: 'koipond', album: 'kr', style: 'chip', bpm: 148, dur: 138 },
    { id: 'kt2', title: 'Peony Season', artist: 'peony', album: 'kr', style: 'pop', bpm: 112, lyrics: L.kt2 },
    { id: 'kt3', title: 'Learner Permit', artist: 'drift', album: 'kr', style: 'chip', bpm: 152, lyrics: L.kt3, explicit: true },
    { id: 'kt4', title: 'Fairy Zoomies', artist: 'fairy8', album: 'kr', style: 'chip', bpm: 160, dur: 107 },
    { id: 'kt5', title: 'Koi Pond Speedrun', artist: 'fairy8', album: 'kr', style: 'chip', bpm: 156, dur: 112 },
    { id: 'kt6', title: 'Heir Apparent', artist: 'koipond', album: 'kr', style: 'pop', bpm: 116, dur: 159 },
    { id: 'sj1', title: 'Lotus Root Soup', artist: 'shenyao', album: 'sy', style: 'ballad', bpm: 72, lyrics: L.sj1 },
    { id: 'sj2', title: 'Little Lotus, Sleep', artist: 'shenyao', album: 'sy', style: 'ballad', bpm: 66, lyrics: L.sj2 },
    { id: 'sj3', title: 'The Long Way Home', artist: 'shenyao', album: 'sy', style: 'ballad', bpm: 76, dur: 185 },
    { id: 'sj4', title: 'Paper Boats', artist: 'shenyao', album: 'sy', style: 'ballad', bpm: 70, dur: 168 },
    { id: 'rn1', title: 'Rain on Jinxing Road', artist: 'nighttaxi', album: 'rn', style: 'lofi', bpm: 78, dur: 172 },
    { id: 'rn2', title: 'Taxi Window', artist: 'nighttaxi', album: 'rn', style: 'lofi', bpm: 82, dur: 146 },
    { id: 'rn3', title: '4 A.M., Lanling', artist: 'nighttaxi', album: 'rn', style: 'lofi', bpm: 74, dur: 134 },
  ];

  // ── Playlists (seeded into the store so edits persist) ─────────────
  JC.store.seed('mplaylists', [
    { id: 'pl_lotus', title: 'Lotus Pier Nights', art: 'cover_mu_lotuspier', by: 'Jiang Cheng', desc: 'For when the office is finally quiet.', songs: ['ln1', 'ln2', 'cr4', 'ln3', 'sj4', 'ln4', 'cr2', 'ln5'], t: '-1 01:14', dl: true },
    { id: 'pl_gym', title: 'Gym — Do Not Talk To Me', art: 'cover_gym', by: 'Jiang Cheng', desc: '05:30. Headphones in. Get lost.', songs: ['pl1', 'pl3', 'pl2', 'pl4', 'pl5'], t: '+0 05:31', dl: true },
    { id: 'pl_aling', title: 'A-Ling made this 🔥', art: 'cover_aling_mix', by: 'A-Ling', byId: 'jl', desc: 'jiujiu ur music is so depressing. listen to this instead. DONT delete it. — a-ling', songs: ['kt3', 'kt1', 'kt4', 'kt6', 'pl4', 'kt5', 'kt2', 'yl2'], t: '-31 22:40', dl: false },
    { id: 'pl_shijie', title: 'Shijie', art: 'cover_shijie', by: 'Jiang Cheng', desc: '', songs: ['sj1', 'sj2', 'sj4', 'sj3', 'ln3'], t: '2026-02-12 00:04', dl: true },
    { id: 'pl_rain', title: 'Rain in Lanling', art: 'cover_mu_rainlanling', by: 'Jiang Cheng', desc: '', songs: ['rn1', 'cr2', 'rn2', 'ln5', 'sj3', 'rn3'], t: '-1 23:58', dl: false },
  ]);
  // library-wide state (favorites, downloads, recently played, pre-adds)
  JC.store.seed('mlib', [
    { id: 'lib', favs: ['ln1', 'sj1', 'sj2', 'pl4', 'yl5', 'cr4'], dlAlbums: ['ln', 'sy'], preadd: false, eq: null,
      recent: [
        { kind: 'playlist', id: 'pl_gym', t: '+0 05:31' },
        { kind: 'playlist', id: 'pl_lotus', t: '-1 01:14' },
        { kind: 'album', id: 'cl', t: '-2 22:51' },
        { kind: 'album', id: 'yl', t: '-3 23:40' },
        { kind: 'playlist', id: 'pl_rain', t: '-4 23:58' },
        { kind: 'album', id: 'sy', t: '-9 02:10' },
        { kind: 'playlist', id: 'pl_shijie', t: '2026-02-12 00:04' },
      ],
      plays: { yl5: 37, sj1: 112, sj2: 64, ln1: 41, pl4: 88, cr4: 19, kt3: 0 },
    },
  ]);

  // ── Radio stations & search categories ─────────────────────────────
  const stations = [
    { id: 'st_lotusfm', name: 'Lotus FM 88.7', live: true, show: 'Late Night Lake', host: 'with DJ Peony', desc: 'Guqin, folk and quiet songs for the lake after dark.', styles: ['guqin', 'ambient', 'ballad'], color: ['#3b2a63', '#a26fd6'] },
    { id: 'st_koi', name: 'Koi Tower Radio', live: true, show: 'Gala Afterparty', host: 'LIVE from Lanling', desc: 'The Koi Records sound, all night.', styles: ['chip', 'pop'], color: ['#7a4b00', '#f2b33d'] },
    { id: 'st_iron', name: 'Iron Hour', live: false, show: '24/7', host: 'Workout', desc: 'Heavy, fast, no small talk.', styles: ['gym'], color: ['#16001f', '#7b2ff7'] },
    { id: 'st_rain', name: 'Rain Radio', live: false, show: '24/7', host: 'Lo-fi & rain', desc: 'Lo-fi beats and Lanling weather.', styles: ['lofi', 'ambient'], color: ['#0c2433', '#3f8fb0'] },
    { id: 'st_folk', name: 'Yiling Folk Station', live: false, show: '24/7', host: 'Folk', desc: 'Flutes, radishes, barn dances.', styles: ['folk', 'folkslow'], color: ['#5a1208', '#e8513c'] },
  ];
  const categories = [
    { id: 'c_guqin', title: 'Guqin & Classical', styles: ['guqin'], color: '#8a6a2f' },
    { id: 'c_ambient', title: 'Ambient', styles: ['ambient'], color: '#4f6f96' },
    { id: 'c_workout', title: 'Workout', styles: ['gym'], color: '#6a2bd1' },
    { id: 'c_chip', title: 'Chiptune', styles: ['chip'], color: '#d1477a' },
    { id: 'c_pop', title: 'Pop', styles: ['pop'], color: '#e0812b' },
    { id: 'c_folk', title: 'Folk', styles: ['folk', 'folkslow', 'ballad'], color: '#b8432f' },
    { id: 'c_rain', title: 'Rain & Lo-Fi', styles: ['lofi'], color: '#2f7f8f' },
    { id: 'c_sleep', title: 'Sleep', ids: ['sj2', 'cr2', 'cr4', 'rn3', 'ln4', 'sj4'], color: '#3a3f8f' },
  ];

  const byId = {};
  songs.forEach((s) => { byId[s.id] = s; });
  const albumById = {};
  albums.forEach((a) => { albumById[a.id] = a; });
  const artistById = {};
  artists.forEach((a) => { artistById[a.id] = a; });
  artistById.various = { id: 'various', name: 'Various Artists', art: 'cover_koi_records', genre: 'Pop', bio: 'Koi Records compilation.' };

  JC.musicData = {
    songs, albums, artists, stations, categories,
    song: (id) => byId[id] || null,
    album: (id) => albumById[id] || null,
    artist: (id) => artistById[id] || null,
    artistName: (id) => (artistById[id] ? artistById[id].name : id),
    art: (s) => (s && albumById[s.album] ? albumById[s.album].art : 'cover_lotus_nocturnes'),
  };
})();
