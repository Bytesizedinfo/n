/* Music — catalog: artists, albums, songs (with original lyrics), playlists, stations, extra cover art.
   Everything here is fictional and belongs to Childe's library. Facts: docs/STORY.md. Loaded before
   music-engine.js and music.js. */
(function () {
  'use strict';
  const JC = window.JC;

  // ── Extra cover art (playlists without a cover_* from the art pack) ──
  JC.art.def('cover_mu_xiansheng', {
    title: 'for xiansheng', w: 600, h: 600, tags: ['cover'],
    svg: (w, h) => {
      let petals = '';
      for (let i = 0; i < 6; i++) petals += `<path d="M300 250 C 270 200, 276 150, 300 118 C 324 150, 330 200, 300 250Z" transform="rotate(${i * 60} 300 250)" fill="#f6eedc" fill-opacity=".9" stroke="#d9b25f" stroke-width="3"/>`;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d10"/><stop offset=".7" stop-color="#4a3418"/><stop offset="1" stop-color="#1c130a"/></linearGradient><radialGradient id="m" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#ffd98a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient></defs>` +
        `<rect width="600" height="600" fill="url(#b)"/><circle cx="300" cy="250" r="250" fill="url(#m)"/>${petals}<circle cx="300" cy="250" r="22" fill="#d9b25f"/>` +
        `<path d="M300 272v160" stroke="#7a9a5a" stroke-width="6"/><path d="M300 360c-40-10-70-40-80-70 40 6 70 30 80 70z" fill="#7a9a5a"/>` +
        `<text x="48" y="540" font-family="Georgia,'Noto Serif SC',serif" font-style="italic" font-size="52" fill="#f6eedc">for xiansheng</text>` +
        `<text x="552" y="80" text-anchor="end" font-family="Georgia,serif" font-size="22" letter-spacing="4" fill="#d9b25f">先生</text></svg>`;
    },
  });

  // ── Artists ───────────────────────────────────────────────────────
  const artists = [
    { id: 'yunjin', name: 'Yun Jin', art: 'cover_yunjin_opera', genre: 'Opera', bio: 'Liyue’s leading opera singer and playwright, resident at Heyu Tea House with the Yun Jin Troupe. Her “Divine Damsel of Devastation” is the most talked-about production in the harbor. She once thanked “the gentleman in Box 2 who sings along” from the stage.' },
    { id: 'morepesok', name: 'The Morepesok Ice Fishers', art: 'cover_snezh_folk', genre: 'Folk', bio: 'Five fishermen, an accordion and a frozen bay. They record in a boathouse in Morepesok in the winter, because the acoustics are “honest”. Every Snezhnayan family owns at least one of their albums. Childe’s owns three, signed.' },
    { id: 'choir', name: 'Snezhnaya Children’s Choir', art: 'cover_lullaby', genre: 'Classical', bio: 'Lullabies and winter songs sung by children from the coastal towns. Teucer auditioned in 2025. He was told to “sing a little less loudly”. He did not.' },
    { id: 'riptide', name: 'RIPTIDE', art: 'cover_fight_mix', genre: 'Rock', bio: 'Heavy, fast, wet. A three-piece from the Liyue docks who play the Third-Round Knockout every Friday. Their songs are about fighting, the sea and fighting the sea.' },
    { id: 'chihu', name: 'Chihu Rock Collective', art: 'cover_harbor_lofi', genre: 'Lo-Fi', bio: 'Anonymous producers who record the harbor at night — rigging, lanterns, gulls, a kettle — and put a beat under it. Every track is named after a place on the waterfront.' },
    { id: 'nbchoir', name: 'Northland Bank Corporate Choir', art: 'cover_fatui_anthem', genre: 'Choral', bio: 'Official choir of Northland Bank Group. Attendance at rehearsals is “voluntary” and recorded. Their hold-music arrangement is played at every branch in Teyvat.' },
    { id: 'crux', name: 'The Crew of the Alcor', art: 'cover_sea_shanties', genre: 'Folk', bio: 'Sea shanties from the Crux Fleet, recorded on deck in one take, slightly drunk. Captain Beidou sings the last verse of every song and refuses to rehearse it.' },
    { id: 'glacier', name: 'Glacier Guardians', art: 'cover_teucer_mix', genre: 'Kids', bio: 'The soundtrack to the cartoon every eight-year-old in Snezhnaya is obsessed with. Features Sir Fang, the brave shark knight, and the Frost Fortress (lights up!).' },
  ];

  // ── Albums ────────────────────────────────────────────────────────
  const albums = [
    { id: 'dd', title: 'The Divine Damsel of Devastation', sub: 'Original Cast Recording', artist: 'yunjin', art: 'cover_yunjin_opera', year: 2026, genre: 'Opera', label: 'Heyu Tea House Records', accent: '#c8463a', songs: ['dd1', 'dd2', 'dd3', 'dd4', 'dd5'] },
    { id: 'sf', title: 'Songs of the Frozen Shore', artist: 'morepesok', art: 'cover_snezh_folk', year: 2019, genre: 'Folk', label: 'Morepesok Boathouse', accent: '#7fa6c8', songs: ['sf1', 'sf2', 'sf3', 'sf4'] },
    { id: 'lb', title: 'Lullabies of the North', artist: 'choir', art: 'cover_lullaby', year: 2022, genre: 'Classical', label: 'Zapolyarny Children’s Music', accent: '#9fb7e8', songs: ['lb1', 'lb2', 'lb3', 'lb4'] },
    { id: 'rt', title: 'Riptide', artist: 'riptide', art: 'cover_fight_mix', year: 2025, genre: 'Rock', label: 'Third-Round Records', accent: '#3a8fd6', songs: ['rt1', 'rt2', 'rt3', 'rt4', 'rt5'] },
    { id: 'hl', title: 'harbor lights', sub: 'beats for 2 a.m. on the pier', artist: 'chihu', art: 'cover_harbor_lofi', year: 2026, genre: 'Lo-Fi', label: 'Chihu Rock', accent: '#e8b45a', songs: ['hl1', 'hl2', 'hl3', 'hl4'] },
    { id: 'nb', title: 'Anthem of the Eleven', artist: 'nbchoir', art: 'cover_fatui_anthem', year: 2024, genre: 'Choral', label: 'Northland Bank Group', accent: '#c23b3b', songs: ['nb1', 'nb2', 'nb3'] },
    { id: 'cx', title: 'Shanties of the Alcor', artist: 'crux', art: 'cover_sea_shanties', year: 2025, genre: 'Folk', label: 'Crux Fleet (self-released)', accent: '#d9a441', songs: ['cx1', 'cx2', 'cx3', 'cx4'] },
    { id: 'gg', title: 'Glacier Guardians', sub: 'Original Soundtrack', artist: 'glacier', art: 'cover_teucer_mix', year: 2025, genre: 'Kids', label: 'Mingyun Toys & Games', accent: '#4fc3f7', songs: ['gg1', 'gg2', 'gg3', 'gg4'] },
  ];

  // ── Lyrics (original). Each array item is one 2-bar phrase. 'I'/'C'/'O' = instrumental phrases. ──
  const L = {
    dd2: [ // The Divine Damsel of Devastation
      'I', 'I',
      ['A', 'Out of the dust and the drowning sea'], ['A', 'she rose with a spear and she would not flee.'], ['A', 'The gods of the deep came hungry and grey —'], ['A', 'she stood on the stone and she held them at bay.'],
      ['B', 'O Damsel, Damsel, of ruin and rain,'], ['B', 'who taught the tide it could break again?'], ['B', 'Lay down your spear on the jade-green shore —'], ['B', 'the harbor is sleeping. It needs you no more.'],
      ['A', 'A thousand lanterns, a thousand years,'], ['A', 'a city of merchants, of salt and of tears.'], ['A', 'They built it in gold on the bones of the war —'], ['A', 'and never once asked what the fighting was for.'],
      ['B', 'O Damsel, Damsel, of ruin and rain,'], ['B', 'who taught the tide it could break again?'], ['B', 'Lay down your spear on the jade-green shore —'], ['B', 'the harbor is sleeping. It needs you no more.'],
      'C', 'C',
      ['B', 'O Damsel, Damsel — the lanterns are lit.'], ['B', 'The war is a story. Now tell me of it.'],
      'O', 'O',
    ],
    dd5: [ // Second Act: The Contract
      'I', 'I',
      ['A', 'He wrote it in stone and he signed it in gold,'], ['A', 'a promise to keep till the mountains grow old.'], ['A', 'Six thousand winters, he never once lied —'], ['A', 'and none of them knew he was walking beside.'],
      ['B', 'Keep it, keep it, the word that you gave,'], ['B', 'from the harbor wall to the edge of the grave.'], ['B', 'A god is a promise that nobody breaks —'], ['B', 'so what does it cost him? Whatever it takes.'],
      ['A', 'He sat in the dark with his tea gone cold'], ['A', 'and mouthed every line like a story retold.'], ['A', 'The young man beside him said, “You know it by heart?”'], ['A', '“I knew it,” he said, “before it was art.”'],
      ['B', 'Keep it, keep it, the word that you gave,'], ['B', 'from the harbor wall to the edge of the grave.'], ['B', 'And if one day the contract is done —'], ['B', 'what does a promise become, when it’s won?'],
      'C', 'C',
      ['B', 'Keep it, keep it — and when it is through,'], ['B', 'write a new one. Write it for two.'],
      'O', 'O',
    ],
    sf1: [ // Little Fish, Swim Home
      'I', 'I',
      ['A', 'Little fish under the ice so thin,'], ['A', 'Papa’s line is waiting, Mama’s lamp is in.'], ['A', 'Snow on the rooftops, smoke in the air —'], ['A', 'little fish, swim home, we’ll keep you a chair.'],
      ['B', 'Swim home, swim home, the sea is wide,'], ['B', 'but the shore is warm on the Morepesok side.'], ['B', 'However far the cold current goes —'], ['B', 'swim home, little fish. The harbour knows.'],
      ['A', 'The eldest went south where the waters are blue,'], ['A', 'he writes every month and he says that it’s true:'], ['A', '“I sell little toys and the work isn’t hard” —'], ['A', 'and Mama keeps every last word on a card.'],
      ['B', 'Swim home, swim home, the sea is wide,'], ['B', 'but the shore is warm on the Morepesok side.'], ['B', 'However far the cold current goes —'], ['B', 'swim home, little fish. The harbour knows.'],
      'C', 'O',
    ],
    lb1: [ // Sleep, Little Whale
      'I',
      ['A', 'Sleep, little whale, the stars are out,'], ['A', 'the waves have stopped their running about.'], ['A', 'The boats are in and the nets are dry —'], ['A', 'the moon is a lantern hung in the sky.'],
      ['B', 'Hush now, hush now, the snow is deep,'], ['B', 'your brother is far but he sings you to sleep.'], ['B', 'Over the mountains, over the foam —'], ['B', 'hush now, little whale. He’s coming home.'],
      ['A', 'He’ll bring you a shark with a sword and a crown,'], ['A', 'he’ll bring you the stories from far-away town.'], ['A', 'He’ll lift you up high where the gulls fly free —'], ['A', 'sleep, little whale, and dream of the sea.'],
      ['B', 'Hush now, hush now, the snow is deep,'], ['B', 'your brother is far but he sings you to sleep.'],
      'O',
    ],
    rt4: [ // Hit Me Harder
      'I', 'I',
      ['A', 'Ring the bell and clear the floor,'], ['A', 'I came down here looking for a war.'], ['A', 'Knock me down and I’ll get back up —'], ['A', 'one more round, I haven’t had enough.'],
      ['B', 'Hit me harder! (Harder!)'], ['B', 'Is that all you got? (Harder!)'], ['B', 'Give me something worth the scar —'], ['B', 'hit me harder. Here we are.'],
      ['A', 'Salt in the cut and sea in my eyes,'], ['A', 'nobody here is gonna tell me lies.'], ['A', 'You want a winner? You want a show?'], ['A', 'Stand up straight and let me know.'],
      ['B', 'Hit me harder! (Harder!)'], ['B', 'Is that all you got? (Harder!)'], ['B', 'Give me something worth the scar —'], ['B', 'hit me harder. Here we are.'],
      'C', 'C', 'O',
    ],
    cx1: [ // Beidou's Shanty
      'I', 'I',
      ['A', 'Oh, the Alcor sails at the turn of the tide'], ['A', 'with a crew of rogues and the sea for a bride.'], ['A', 'The Captain’s eye is a storm and a star —'], ['A', 'and nobody asks where the treasures are.'],
      ['B', 'So heave away, me hearties, heave away,'], ['B', 'the Captain don’t lose — she just pauses the play!'], ['B', 'Pour the wine and pass the bread,'], ['B', 'we’ll make the harbour by morning red.'],
      ['A', 'There’s a ginger lad with a grin like a knife'], ['A', 'who arm-wrestled the Captain and nearly lost his life.'], ['A', 'He says that he won, and she says that he cheats —'], ['A', 'and the rematch is Saturday. Bring your own seats.'],
      ['B', 'So heave away, me hearties, heave away,'], ['B', 'the Captain don’t lose — she just pauses the play!'], ['B', 'Pour the wine and pass the bread,'], ['B', 'we’ll make the harbour by morning red.'],
      'C', 'O',
    ],
    gg1: [ // Glacier Guardians Theme
      'I',
      ['A', 'When the snow comes down and the monsters roar,'], ['A', 'who’s gonna stand at the fortress door?'], ['A', 'With a shield of ice and a heart of fire —'], ['A', 'the Guardians are here, and they never tire!'],
      ['B', 'Glacier Guardians! (Go, go, go!)'], ['B', 'Frozen fortress, lights aglow!'], ['B', 'Sir Fang is here and the cannon’s ready —'], ['B', 'Glacier Guardians, steady, steady!'],
      ['A', 'If you’re small, if you’re scared, if the night is long,'], ['A', 'just hum along with the Guardians’ song.'], ['A', 'Your big brother says it, so it must be true:'], ['A', 'there’s a Guardian watching over you!'],
      ['B', 'Glacier Guardians! (Go, go, go!)'], ['B', 'Frozen fortress, lights aglow!'], ['B', 'Sir Fang is here and the cannon’s ready —'], ['B', 'Glacier Guardians, steady, steady!'],
      'O',
    ],
  };

  // ── Songs ─────────────────────────────────────────────────────────
  // style: guqin | ambient | folk | folkslow | gym | chip | pop | ballad | lofi.  dur = target seconds (instrumentals).
  const songs = [
    { id: 'dd1', title: 'Overture: The Pact at Guyun', artist: 'yunjin', album: 'dd', style: 'guqin', bpm: 76, dur: 168 },
    { id: 'dd2', title: 'The Divine Damsel of Devastation', artist: 'yunjin', album: 'dd', style: 'ballad', bpm: 80, lyrics: L.dd2 },
    { id: 'dd3', title: 'Six Thousand Lanterns', artist: 'yunjin', album: 'dd', style: 'guqin', bpm: 68, dur: 196 },
    { id: 'dd4', title: 'Interval: Tea in Box Two', artist: 'yunjin', album: 'dd', style: 'ambient', bpm: 64, dur: 132 },
    { id: 'dd5', title: 'Second Act: The Contract', artist: 'yunjin', album: 'dd', style: 'ballad', bpm: 72, lyrics: L.dd5 },
    { id: 'sf1', title: 'Little Fish, Swim Home', artist: 'morepesok', album: 'sf', style: 'folkslow', bpm: 84, lyrics: L.sf1 },
    { id: 'sf2', title: 'Ice on the Bay', artist: 'morepesok', album: 'sf', style: 'folk', bpm: 116, dur: 158 },
    { id: 'sf3', title: 'Papa’s Boat', artist: 'morepesok', album: 'sf', style: 'folkslow', bpm: 78, dur: 182 },
    { id: 'sf4', title: 'Pelmeni Polka', artist: 'morepesok', album: 'sf', style: 'folk', bpm: 132, dur: 141 },
    { id: 'lb1', title: 'Sleep, Little Whale', artist: 'choir', album: 'lb', style: 'ballad', bpm: 66, lyrics: L.lb1 },
    { id: 'lb2', title: 'The Snow Knows Your Name', artist: 'choir', album: 'lb', style: 'ballad', bpm: 64, dur: 170 },
    { id: 'lb3', title: 'Lamp in the Window', artist: 'choir', album: 'lb', style: 'ballad', bpm: 70, dur: 158 },
    { id: 'lb4', title: 'Seven Stars over Morepesok', artist: 'choir', album: 'lb', style: 'ambient', bpm: 60, dur: 188 },
    { id: 'rt1', title: 'Foul Legacy', artist: 'riptide', album: 'rt', style: 'gym', bpm: 138, dur: 172 },
    { id: 'rt2', title: 'Havoc', artist: 'riptide', album: 'rt', style: 'gym', bpm: 132, dur: 160 },
    { id: 'rt3', title: 'Riptide Flash', artist: 'riptide', album: 'rt', style: 'gym', bpm: 140, dur: 148 },
    { id: 'rt4', title: 'Hit Me Harder', artist: 'riptide', album: 'rt', style: 'gym', bpm: 128, lyrics: L.rt4, explicit: true },
    { id: 'rt5', title: 'Third Round', artist: 'riptide', album: 'rt', style: 'gym', bpm: 130, dur: 196 },
    { id: 'hl1', title: 'Pier 7, 2 a.m.', artist: 'chihu', album: 'hl', style: 'lofi', bpm: 78, dur: 174 },
    { id: 'hl2', title: 'Glaze Lily Tea', artist: 'chihu', album: 'hl', style: 'lofi', bpm: 74, dur: 152 },
    { id: 'hl3', title: 'Lanterns on Yujing', artist: 'chihu', album: 'hl', style: 'ambient', bpm: 66, dur: 190 },
    { id: 'hl4', title: 'Feiyun Slope in the Rain', artist: 'chihu', album: 'hl', style: 'lofi', bpm: 80, dur: 138 },
    { id: 'nb1', title: 'For the Tsaritsa', artist: 'nbchoir', album: 'nb', style: 'ballad', bpm: 70, dur: 204 },
    { id: 'nb2', title: 'Hold Music (Liyue Branch)', artist: 'nbchoir', album: 'nb', style: 'lofi', bpm: 88, dur: 120 },
    { id: 'nb3', title: 'March of the Eleven', artist: 'nbchoir', album: 'nb', style: 'gym', bpm: 120, dur: 176 },
    { id: 'cx1', title: 'Beidou’s Shanty', artist: 'crux', album: 'cx', style: 'folk', bpm: 118, lyrics: L.cx1 },
    { id: 'cx2', title: 'Heave Away to Liyue', artist: 'crux', album: 'cx', style: 'folk', bpm: 124, dur: 150 },
    { id: 'cx3', title: 'Haul the Bluefin', artist: 'crux', album: 'cx', style: 'folk', bpm: 128, dur: 138 },
    { id: 'cx4', title: 'The Long Way North', artist: 'crux', album: 'cx', style: 'folkslow', bpm: 80, dur: 186 },
    { id: 'gg1', title: 'Glacier Guardians Theme', artist: 'glacier', album: 'gg', style: 'pop', bpm: 132, lyrics: L.gg1 },
    { id: 'gg2', title: 'Frost Fortress, Assemble!', artist: 'glacier', album: 'gg', style: 'chip', bpm: 150, dur: 112 },
    { id: 'gg3', title: 'Sir Fang’s March', artist: 'glacier', album: 'gg', style: 'chip', bpm: 144, dur: 104 },
    { id: 'gg4', title: 'Snow Cannon, Go!', artist: 'glacier', album: 'gg', style: 'chip', bpm: 156, dur: 98 },
  ];

  // ── Playlists (seeded into the store so edits persist) ─────────────
  JC.store.seed('mplaylists', [
    { id: 'pl_xiansheng', title: 'for xiansheng', art: 'cover_mu_xiansheng', by: 'Childe', desc: 'he hums the second act. badly. don’t tell him i said that.', songs: ['dd5', 'hl2', 'dd3', 'hl3', 'dd2', 'cx4', 'dd4'], t: '+0 23:02', dl: true },
    { id: 'pl_fight', title: 'PRE-FIGHT', art: 'cover_fight_mix', by: 'Childe', desc: 'loud. louder. louder than that.', songs: ['rt4', 'rt1', 'rt3', 'rt2', 'nb3', 'rt5'], t: '+0 05:28', dl: true },
    { id: 'pl_teucer', title: 'TEUCER’S MIX!!! 🐟', art: 'cover_teucer_mix', by: 'Teucer', byId: 'teucer', desc: 'BROTHER this is the best music in the world. DON’T DELETE IT. — teucer (age 8)', songs: ['gg1', 'gg3', 'gg2', 'sf4', 'gg4', 'cx3', 'gg1'], t: '-31 19:40', dl: false },
    { id: 'pl_home', title: 'home', art: 'cover_snezh_folk', by: 'Childe', desc: '', songs: ['sf1', 'lb1', 'sf3', 'lb2', 'sf2', 'lb3'], t: '-2 02:10', dl: true },
    { id: 'pl_pier', title: 'pier 7, 2 a.m.', art: 'cover_harbor_lofi', by: 'Childe', desc: 'for waiting on a bite', songs: ['hl1', 'hl4', 'lb4', 'hl2', 'cx4', 'hl3'], t: '-5 02:12', dl: false },
    { id: 'pl_ekat', title: 'reception (approved)', art: 'cover_fatui_anthem', by: 'Ekaterina', byId: 'ekat', desc: 'Sir. Please stop changing the lobby music to “Hit Me Harder”. These are the approved tracks. — E.', songs: ['nb2', 'nb1', 'dd4', 'hl3'], t: '-12 09:05', dl: false },
  ]);
  // library-wide state (favorites, downloads, recently played, pre-adds)
  JC.store.seed('mlib', [
    { id: 'lib', favs: ['dd5', 'sf1', 'lb1', 'rt4', 'cx1', 'hl1'], dlAlbums: ['dd', 'sf'], preadd: false, eq: null,
      recent: [
        { kind: 'playlist', id: 'pl_xiansheng', t: '+0 23:02' },
        { kind: 'playlist', id: 'pl_fight', t: '+0 05:28' },
        { kind: 'album', id: 'dd', t: '-1 22:51' },
        { kind: 'playlist', id: 'pl_home', t: '-2 02:10' },
        { kind: 'album', id: 'cx', t: '-6 23:40' },
        { kind: 'playlist', id: 'pl_pier', t: '-5 02:12' },
        { kind: 'album', id: 'lb', t: '-9 21:30' },
      ],
      plays: { dd5: 61, dd2: 34, sf1: 140, lb1: 77, rt4: 92, cx1: 18, hl1: 41, gg1: 3 },
    },
  ]);

  // ── Radio stations & search categories ─────────────────────────────
  const stations = [
    { id: 'st_harborfm', name: 'Harbor FM 98.1', live: true, show: 'Late Night on the Pier', host: 'with DJ Gull', desc: 'Lo-fi, shanties and quiet songs for the harbor after dark.', styles: ['lofi', 'ambient', 'folkslow'], color: ['#13314f', '#e8b45a'] },
    { id: 'st_heyu', name: 'Heyu Opera Hour', live: true, show: 'The Rite Special', host: 'LIVE from Lantern Street', desc: 'Liyue opera all weekend, for the Founder.', styles: ['guqin', 'ballad'], color: ['#4a1220', '#c8463a'] },
    { id: 'st_riptide', name: 'Riptide Radio', live: false, show: '24/7', host: 'Workout', desc: 'Heavy, fast, no small talk.', styles: ['gym'], color: ['#06131f', '#3a8fd6'] },
    { id: 'st_north', name: 'Snezhnaya Folk', live: false, show: '24/7', host: 'Folk', desc: 'Accordions, ice and pelmeni.', styles: ['folk', 'folkslow'], color: ['#1b2a3f', '#9fb7e8'] },
    { id: 'st_kids', name: 'Guardians Radio', live: false, show: '24/7', host: 'Kids', desc: 'Cartoon themes. Very loud. Teucer approved.', styles: ['chip', 'pop'], color: ['#0b4f7c', '#4fc3f7'] },
  ];
  const categories = [
    { id: 'c_opera', title: 'Liyue Opera', styles: ['guqin'], ids: ['dd1', 'dd2', 'dd3', 'dd5'], color: '#a6352c' },
    { id: 'c_ambient', title: 'Ambient', styles: ['ambient'], color: '#4f6f96' },
    { id: 'c_workout', title: 'Workout', styles: ['gym'], color: '#1f6fb5' },
    { id: 'c_kids', title: 'Kids', styles: ['chip', 'pop'], color: '#2aa8d8' },
    { id: 'c_choral', title: 'Choral', ids: ['nb1', 'lb1', 'lb2', 'lb3'], color: '#8a3b3b' },
    { id: 'c_folk', title: 'Folk & Shanties', styles: ['folk', 'folkslow'], color: '#b8792f' },
    { id: 'c_lofi', title: 'Lo-Fi', styles: ['lofi'], color: '#2f7f8f' },
    { id: 'c_sleep', title: 'Sleep', ids: ['lb1', 'lb4', 'hl3', 'dd4', 'lb2', 'sf3'], color: '#3a3f8f' },
  ];

  const byId = {};
  songs.forEach((s) => { byId[s.id] = s; });
  const albumById = {};
  albums.forEach((a) => { albumById[a.id] = a; });
  const artistById = {};
  artists.forEach((a) => { artistById[a.id] = a; });
  artistById.various = { id: 'various', name: 'Various Artists', art: 'cover_harbor_lofi', genre: 'Pop', bio: 'Compilation.' };

  JC.musicData = {
    songs, albums, artists, stations, categories,
    song: (id) => byId[id] || null,
    album: (id) => albumById[id] || null,
    artist: (id) => artistById[id] || null,
    artistName: (id) => (artistById[id] ? artistById[id].name : id),
    art: (s) => (s && albumById[s.album] ? albumById[s.album].art : 'cover_yunjin_opera'),
  };
})();
