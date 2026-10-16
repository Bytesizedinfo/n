# Jiang Cheng's Phone

An interactive iPhone story. You slide into a taxi in Lanling at 11:47 PM and find a phone in a matte purple case.
It belongs to Jiang Cheng, CEO of the Yunmeng Jiang Group (a modern AU of *Mo Dao Zu Shi*). You crack the passcode,
and from then on everyone who texts or calls believes **you are him**. Reply like Jiang Cheng would — or don't — and
see which of the 13 endings the night leads to.

Everything on the phone works: Messages with branching conversations and years of history, Phone and FaceTime calls
with live captions and choices, Mail, Photos, Camera, Notes, Calendar, Reminders, Clock, Weather, Maps, Find My,
Wallet, Music (synthesized), Health, Stocks, Voice Memos, Safari with a small fictional web, a social app (Wavelet),
food delivery (Lotus Eats), ride-hailing (Swift Ride), a mini-game (Lotus Leap), Calculator, Contacts and a full Settings
app — plus the lock screen, passcode, Control Center, Notification Center, Dynamic Island, Spotlight, App Library,
widgets, jiggle mode and the app switcher.

## Play
- Open `dist/standalone.html` in a browser, or the published Artifact.
- Desktop: drag up from the bottom bar (or tap it / press Esc) to go home; drag down from the top-right for
  Control Center and the top-left for notifications; the side buttons on the frame work.
- Settings → Story has Endings, Rewind to Last Choice, Restart Story, message speed and the suspicion meter.

## Develop
No build step for development: open `index.html` (it loads every file listed in `js/manifest.js`).

```
python3 tools/manifest.py      # after adding/renaming files
python3 tools/build.py         # single-file bundles in dist/
node tools/storytest.js 30     # validate the story graph + 30 automated playthroughs
node tools/sweep.js 80         # click-sweep every app for dead controls and errors
```

- `docs/DEV.md` — architecture, APIs (UI kit, story engine, app registration), conventions.
- `docs/STORY.md` — the story bible: characters, places, timeline, endings, flags, art ids.
- `js/core/` OS shell, UI kit, keyboard, story engine · `js/apps/` one file per app · `js/story/` message history,
  scenes, calls and endings · `js/art/` hand-written SVG illustrations · `css/` styles.

Fan work. Characters from *Mo Dao Zu Shi* by Mo Xiang Tong Xiu; all apps, brands, places and phone numbers in the
phone are fictional.
