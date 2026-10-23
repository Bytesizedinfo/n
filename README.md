# Childe's Phone

An interactive iPhone story set in a modern AU of *Genshin Impact*. It's Friday, 11:47 PM, on Pier 7 in Liyue Harbor.
Someone has left behind a fishing rod with its line cut, a cold cup of osmanthus tea, and a phone in a Hydro-blue case
with a red fish charm and a sticker that says WORLD'S BEST BIG BROTHER.

The phone belongs to **Childe**: Tartaglia, Ajax, the Eleventh Harbinger of Northland Bank. Crack the passcode, and
from then on everyone who texts or calls believes **you are him**. You keep the phone from Friday night to Monday
evening, across seven chapters. Reply like Childe would, or don't. Everything you say, buy, open and find moves the
weekend toward one of **24 endings**, and an Aftermath page shows where every conversation ended up.

The main threads:
- **Zhongli**, the funeral consultant who never carries Mora. A four-day romance route with five endings of its own.
- **Teucer and Tonia**, landing at 07:40 on Saturday, convinced their brother sells toys.
- **Signora's Project Osial**, a frame-up timed for the end of Rex Lapis's funeral.
- **The Liyue Branch night shift**, a frozen aquarium and a vending-machine war.
- **Side threads:** Lumine and Paimon, Hu Tao, Beidou, Yelan, Scaramouche, and someone who only writes at 03:00.

Everything on the phone works:
- **Communication:** Messages, with branching chats and years of history; Phone and FaceTime calls, with live
  captions and choices; Mail; Contacts.
- **Media:** Photos (with metadata clues), Camera, Notes, Voice Memos, Music (synthesized).
- **Organizer:** Calendar, Reminders, Clock, Weather, Maps of Liyue Harbor, Find My.
- **Money:** Wallet; Northland, a bank with card freezes and statements; Feiyun Market, shopping and live auctions.
- **Other apps:** Health, Stocks, Calculator and Settings. Safari has a small fictional web: Liyue Archives, the
  Northland intranet, airline status and news that reacts to what you do.
- **Fictional services:** Ripple (social), Wanmin Go (food delivery), Harbor Ride (ride-hailing), and the Reel Rush
  fishing game.
- **The OS:** lock screen, Control Center, Notification Center, Dynamic Island, Spotlight, App Library, widgets,
  jiggle mode and the app switcher.

## Play
- Open `dist/standalone.html` in a browser, or the published Artifact.
- Time is yours. Speed up the clock (1× / 2× / 4× / 8×) from the hare tile in Control Center, Settings → Story,
  or the `[` and `]` keys. Long-press the tile to skip to the next message, tap a typing bubble to hurry it, and use
  **Later…** on the lock screen to jump to the next chapter once nothing urgent is waiting.
- On desktop:
  - Go home by dragging up from the bottom bar, tapping it, or pressing Esc.
  - Drag down from the top-right for Control Center, or from the top-left for notifications.
  - The side buttons on the frame work.
- Settings → Story has Endings, Rewind to Last Choice, Restart Story, message speed and the suspicion meter.

## Develop
There's no build step for development. Open `index.html`, which loads every file listed in `js/manifest.js`.

```
python3 tools/manifest.py           # after adding/renaming files
python3 tools/build.py              # single-file bundles in dist/
node tools/storytest.js 30 --lint   # validate the story graph, 30 automated playthroughs, interconnection lint
node tools/storytest.js --routes    # one scripted playthrough per ending (tools/routes/*.js)
node tools/sweep.js 80              # click-sweep every app for dead controls and errors
```

- `docs/STORY.md` is the story bible: cast, places, the four-day timeline, chapters, flags, endings and art ids.
- `docs/DEV.md` covers architecture, APIs (UI kit, story engine, app registration) and conventions.
- Where things live:
  - `js/data/world.js`: every story-specific value the engine reads (the passcode, home screen, act rules, gossip).
  - `js/core/`: the OS shell, UI kit, keyboard, and the story engine.
  - `js/apps/`: one file per app.
  - `js/story/`: message history, scenes, calls, endings and aftermath.
  - `js/art/`: hand-written SVG illustrations.
  - `css/`: styles.

This is fan work. Characters are from *Genshin Impact* by HoYoverse. All apps, brands, places and phone numbers in
the phone are fictional.
