# Childe's Phone — Developer Guide

Vanilla HTML/CSS/JS, no build step, no frameworks. Every file is a classic script that attaches to the global
namespace `window.JC`. Files load in the order listed in `index.html`. Story/content files only *register* data at load
time; nothing runs until `JC.boot()` at the end.

Read `docs/STORY.md` for every fact about the characters and the world. Everything story-specific that the engine
needs (names, passcode, app names, jokes, the bank, start time…) lives in **`js/data/world.js`** (`JC.world`, see
"World config" below); core files never hard-code story values.

## Golden rules
1. **No dead UI.** Every element that looks tappable must do something real: navigate, open a sheet, toggle, edit data,
   play a sound, or show a believable in-world alert. Give tappable elements the `.tap` class (or use the kit helpers,
   which do it for you) and attach the handler with `onTap`. Run `index.html#audit` to list tappable elements with no handler.
2. **iOS 26 look.** Use the kit (`JC.ui.*`) and the CSS tokens (`var(--label)`, `var(--blue)` …). Never hard-code a
   colour that only works in light or only in dark mode. The phone has its own appearance (light/dark) via
   `#screen.dark`; your CSS must look right in both.
3. **Logical points.** The screen is 402 × 874 CSS px (iPhone 17 Pro points). Never use `vh`/`vw` inside the phone.
   Use `var(--safe-top)` (54px, status bar + island) and `var(--safe-bottom)` (34px, home indicator) for padding.
4. **Own your files.** Only edit the files your task owns. If you need something from core, note it in your report
   and work around it locally.
5. **Story acts.** Apps must report meaningful player actions with `JC.story.act(name, payload)` (list below) so the
   story can react.
6. **No external resources** except Google Fonts (already loaded). No images from the web. Illustrations come from `JC.art`.
7. Never use `alert()`, `confirm()`, `prompt()`; use `JC.ui.alert` etc.

## File map
```
index.html             loads everything (order matters)
css/os.css             frame, lock, home, status bar, island, CC, notification UI, keyboard   (core)
css/ui.css             kit components: nav bars, lists, controls, sheets, alerts, menus        (core)
css/apps/<app>.css     one stylesheet per app (owned by that app's author)
js/core/util.js        JC.h, JC.util
js/data/world.js       JC.world  (every story-specific value core reads; loads right after util.js)
js/core/state.js       JC.state  (persistence, rewind)
js/core/time.js        JC.time   (in-game clock)
js/core/store.js       JC.store  (app data collections)
js/core/icons.js       JC.icon, app icons
js/core/art.js         JC.art    (illustration registry & renderer)
js/core/audio.js       JC.audio
js/core/keyboard.js    JC.kb     (on-screen iOS keyboard)
js/core/ui.js          JC.ui     (component kit)
js/core/notify.js      JC.notify (banners, notification center, badges)
js/core/os.js          JC.os     (springboard, lock screen, gestures, control center, app windows)
js/core/story.js       JC.story  (branching engine, chapters, time controls, aftermath)
js/core/bank.js        JC.bank   (the one bank balance every app charges)
js/core/boot.js        JC.boot
js/data/contacts.js    JC.contacts
js/art/*.js            illustrations
js/apps/<app>.js       one file per app
js/story/history/*.js  pre-existing message threads
js/story/scenes/*.js   live branching scenes, calls, endings
tools/storytest.js     story validator + playthroughs (routes in tools/routes/*.js)
```
Core load order is fixed in `tools/manifest.py` (`CORE`); everything else is picked up by folder.

## DOM helper — `JC.h(selector, props?, ...children)`
```js
const { h } = JC;
h('div.row.tap', { onTap: () => open(), style: { color: 'var(--red)' } }, 'Delete')
h('button.btn#save', { onTap, disabled: false, data: { id: 3 } }, [icon, 'Save'])
```
- selector: `tag.class.class#id` (tag defaults to `div`).
- props: `class` (string|array|object), `style` (string|object, supports `--vars`), `onTap`/`onClick` (click, marks
  the element tappable for the audit), any `onEvent` (lower-cased event name), `html`, `text`, `data`, `attrs`, `ref(el)`,
  plus element properties (`value`, `placeholder`, `type` …).
- children: strings, numbers, nodes, arrays, `null`/`false` (skipped).
- `JC.util`: `clamp, lerp, uid(prefix), wait(ms), esc(str), debounce, throttle, pick(arr), shuffle, fmtTime(ms|Date),
  fmtDate(ms, style), fmtRelative(ms), fmtDur(sec), longPress(el, fn), drag(el, handlers)`.

## In-game time — `JC.time`
- The clock starts at **`JC.world.start`** (`'YYYY-MM-DD HH:MM'`); day 0 is that date. `JC.time.now()` → ms (in-game),
  `JC.time.date()` → Date, `JC.time.START` (ms), `JC.time.BASE` (day 0 at 00:00).
- `JC.time.parse(str)` accepts `'-3 21:04'` (3 days before day 0 at 21:04), `'+0 23:12'` (day 0), `'+1 07:40'`
  (day 1), `'2009-02-12 18:30'` (absolute), `'23:12'` (day 0).
- `JC.time.set(ms)` / `advance(ms)` jump the clock (no cap). `JC.time.freeze(on)` (counted) stops it.
- Pace: the clock advances `JC.time.rate()` in-game ms per real ms = `timeScale × the current chapter's clockRate`
  (both 1 by default), and never runs past `JC.time.cap()` (the current chapter's `until`) on its own.
- Events on `JC.bus`: `tick` (each second the clock shows), `minute`.

## Event bus — `JC.bus.on(name, fn)` / `off` / `emit` / `once`

## Persistent app data — `JC.store`
Collections of plain objects with an `id`. Seed data is registered by the app that owns the collection; the story may
add items. Mutations are persisted automatically.
```js
JC.store.seed('notes', [ { id: 'n1', ... }, ... ]);   // at load time (owner app file)
JC.store.all('notes')            // array (do not mutate directly)
JC.store.get('notes', 'n1')
JC.store.add('notes', item, { front: true })   // returns item (id generated if missing)
JC.store.update('notes', 'n1', { body: '...' })
JC.store.remove('notes', 'n1')
JC.store.on('notes', fn)         // fn(collection) after any change; returns unsubscribe
```
### Collection schemas (owners must honour these; the story writes them)
- `notes` `{id, folder:'notes'|'personal'|'work', title, body, t, created, pinned, locked}` (body plain text; lines
  `- [ ] x` / `- [x] x` render as checklist; a locked note asks for the iPhone passcode, `JC.world.passcode.code` unless the player changed it).
- `photos` `{id, art, t, albums:[], fav, people:[], place, caption, kind:'photo'|'screenshot'|'live'|'video', dur}`
- `albums` `{id, title, cover}`
- `events` `{id, cal:'work'|'home'|'family'|'birthdays', title, start, end, allDay, location, notes, tentative}`
- `reminders` `{id, list, title, done, due, notes, flagged}`; `remlists` `{id, title, color, icon}`
- `mail` `{id, box:'inbox'|'sent'|'drafts'|'junk'|'trash'|'archive', from:{name, addr}, to:[{name, addr}], subject, body, t, read, flagged, attach:[{name, art}]}`
- `calls` `{id, contact, num, t, dir:'in'|'out'|'missed', dur, video}`
- `voicemails` `{id, contact, num, t, dur, text, heard}`
- `memos` `{id, title, t, dur, text, place, fav}`
- `posts` `{id, by, t, art, text, likes, liked, comments:[{by, text, t}]}` (`by` = Ripple handle)
- `tx` `{id, card, merchant, amount (+ charge, − credit), t, cat, note, place, pending, contact, app}` (JC.bank writes these)
- `orders` `{id, rest, items:[{name, qty, price}], total, t, status, to}`
- `rides` `{id, from, to, t, end, price, driver:{name, car, plate, rating}, status}`
- `places` `{id, name, city, x, y, cat, addr, phone, hours, rating, desc}` (Maps owns; ids from STORY.md)
- `history` (Safari) `{id, url, title, t}`

## Contacts — `JC.contacts`
`JC.contacts.get(id)`, `JC.contacts.all()`, `JC.contacts.name(id)` (saved display name), `JC.contacts.full(id)`
(real full name). Contact fields: `id, first, last, display, nick, avatar, phones:[{label,num}], emails:[{label,addr}],
bday, company, title, address, notes, fav, color, related:[{label,id}], wavelet, idle:[], dial, voicemail`.
`JC.ui.avatar(idOrSpec, size)` renders an avatar.

## Illustrations — `JC.art`
```js
JC.art.def('p_fairy_roof', {
  title: 'Fairy on the car roof',
  w: 1200, h: 900,                 // viewBox size; photos 4:3 (1200×900), portrait 900×1200, wallpapers 1206×2622
  tags: ['dog', 'night'],
  svg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">…</svg>`,
});
JC.art.url(id)            // data: URI (cached) — use as <img src> or background-image
JC.art.el(id, { cls, fit: 'cover'|'contain' })   // element with the image
JC.art.has(id), JC.art.meta(id)
```
Unknown ids render a tasteful placeholder, so referencing an id that does not exist yet never breaks.
SVGs are rendered as images (data URIs) so `id`s inside different SVGs never collide. Keep each SVG under ~25 KB and
avoid heavy filters (one light grain `feTurbulence` max).

## Icons — `JC.icon(name, { size = 22, cls })`
SF-Symbol-like outline/filled glyphs, `currentColor`. Names: see `JC.icon.names()` (e.g. `chevron.left`,
`chevron.right`, `plus`, `xmark`, `magnifyingglass`, `square.and.pencil`, `ellipsis`, `ellipsis.circle`, `trash`,
`heart`, `heart.fill`, `star`, `star.fill`, `phone.fill`, `video.fill`, `message.fill`, `envelope`, `info.circle`,
`checkmark`, `play.fill`, `pause.fill`, `forward.fill`, `backward.fill`, `mic.fill`, `camera.fill`, `photo`, `gear`,
`person.fill`, `person.crop.circle`, `location.fill`, `paperplane.fill`, `arrow.up`, `square.and.arrow.up`, `folder`,
`bell.fill`, `moon.fill`, `wifi`, `airplane`, `bolt.fill`, `lock.fill`, `flag.fill`, `clock`, `calendar`, `map`, `house.fill` …).
Apps may add icons with `JC.icon.add({ name: '<svg path markup in a 24×24 box>' })` from their own file.
Story glyphs: `vision.hydro` (water-drop gem), `hare` / `hare.fill`, `snowflake`, `forward.end.fill`, `moon.zzz.fill`;
the story's emblem is `JC.world.brand.emblem` (core never hard-codes one).

**App icons** are 60×60 SVG strings rendered as images. Register one from the app's own file:
```js
JC.appIcon.add('northland', (date) => `<svg ${JC.appIcon.W}><rect width="60" height="60" fill="#0b2a4a"/>…</svg>`);
JC.appIcon(id, size) // element;  JC.appIcon.url(id), JC.appIcon.has(id)
```

## Sounds — `JC.audio.play(name)`
`tap, key, key.delete, key.space, send, receive, notify, lock, unlock, shutter, ring, ring.stop, alert, error, swoosh,
tink, success`. `JC.audio.ctx()` returns the AudioContext (created after the first user gesture). `JC.audio.out` is the
media output node (respects the volume setting).

## UI kit — `JC.ui`
Everything below returns DOM elements or small controller objects.

### Navigation
```js
// inside an app's launch(win):
const nav = JC.ui.nav(win.body, () => rootPage());
function rootPage() {
  return JC.ui.page({
    title: 'Notes', large: true, tint: 'var(--yellow-ui)',
    right: [ JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => JC.ui.menu(e.currentTarget, [...]) }) ],
    search: { placeholder: 'Search', onInput: (q) => page.render() },
    bg: 'grouped',                       // 'grouped' | 'plain' | any css colour
    content: (page) => [ JC.ui.list([...]) ],   // re-run by page.render()
    toolbar: [ JC.ui.spacer(), h('div.tb-label', '12 Notes'), JC.ui.navBtn({ icon: 'square.and.pencil', onTap }) ],
    onShow, onHide,
  });
}
nav.push(page) / nav.pop() / nav.popToRoot() / nav.top() / nav.replace(page)
page.render() / page.setTitle(t) / page.scroll (the scroll element) / page.el
```
Pages get the iOS 26 nav bar (glass back button, large title collapsing into an inline title on scroll), edge-swipe back.
`JC.ui.tabs(win.body, { tabs: [{ id, title, icon, root: () => page }], active, onChange })` builds an app with a floating
glass tab bar and one nav stack per tab; returns `{ select(id), nav(id), current() }`.

### Lists
```js
JC.ui.list([
  { header: 'Connectivity', footer: 'Footer text', rows: [
    { icon: { glyph: 'airplane', bg: 'var(--orange)' }, title: 'Airplane Mode', toggle: { on, onChange } },
    { icon: { glyph: 'wifi', bg: 'var(--blue)' }, title: 'Wi-Fi', detail: 'Golden Peony Guest', chevron: true, onTap },
    { title: 'Name', subtitle: 'Second line', avatar: 'teucer', detail: '11:47', onTap,
      swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap }],   // trailing swipe actions
      lead: [{ text: 'Pin', color: 'var(--orange)', onTap }] },
    { title: 'Sign Out', destructive: true, center: true, onTap },
    { custom: someElement },
  ]},
], { style: 'inset' | 'plain' })
```
Rows without `onTap` and without a control render as plain (non-tappable) rows.

### Controls
`JC.ui.btn({ text, icon, onTap, kind: 'plain'|'filled'|'tinted'|'gray'|'glass', size: 's'|'m'|'l', tint })`,
`JC.ui.navBtn({ icon | text, onTap, prominent })` (glass circle / capsule),
`JC.ui.toggle({ on, onChange })`, `JC.ui.segmented({ items: [...labels], value, onChange })`,
`JC.ui.slider({ value, min, max, step, onInput, icons: [leftGlyph, rightGlyph] })`,
`JC.ui.stepper({ value, min, max, onChange })`,
`JC.ui.search({ placeholder, onInput, onSubmit })`,
`JC.ui.input({ placeholder, value, onInput, onSubmit, multiline, enterkey: 'send'|'search'|'done'|'go'|'return' })` —
real `<input>/<textarea>` wired to the on-screen keyboard (desktop typing works too).
`JC.ui.wheel({ cols: [{ items: [...], value }], onChange })` (iOS picker wheel),
`JC.ui.spacer()`, `JC.ui.empty({ icon, title, text })`, `JC.ui.badge(n)`.

### Overlays (mounted inside the current app window, or the system layer)
```js
await JC.ui.alert({ title, message, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive' }], input: { placeholder } })
// resolves { index, text, value }
JC.ui.actionSheet({ title, message, actions: [{ text, style, onTap }] })
const s = JC.ui.sheet({ title, left: { text: 'Cancel' }, right: { text: 'Done', bold: true, onTap }, content: (sheet) => node, detent: 'medium'|'large', onClose }); s.close()
JC.ui.menu(anchorEl, [{ text, icon, onTap, destructive, checked }, '-' /* separator */])
JC.ui.contextMenu(el, () => ({ items: [...], preview: optionalNode }))   // long-press
JC.ui.toast(text, { icon })
JC.ui.share({ title, subtitle, art, text, kind: 'photo'|'link'|'text'|'memo', payload, actions: [...] })
```
`JC.ui.share` shows contacts (sending really posts into that Messages thread via `JC.story.send`), apps, and actions.

## App registration — `JC.app(def)`
```js
JC.app({
  id: 'notes', name: 'Notes',     // the home screen shows JC.world.apps.names[id] when set
  status: 'dark',                 // status bar text colour on this app: 'dark' (black text) | 'light' | 'auto' (follows appearance)
  launch(win, intent) {           // called once when the app is first opened (or after it was killed)
    // win.body  : element to render into (full screen, under status bar)
    // win.setStatus('light'|'dark'|'auto')
    // win.close()  go home
    return {
      intent(intent) {},          // deep link while running, e.g. { thread: 'zl' }
      show() {}, hide() {},       // foreground/background
      back() { return true },     // optional: handle edge-swipe/Esc; return true if handled
    };
  },
});
JC.os.open('messages', { thread: 'zl' })   // open an app (with optional intent)
JC.os.home()
JC.os.setWallpaper(id) / JC.os.setAppearance('light'|'dark'|'auto') / JC.os.dark (bool)
JC.os.toggles (wifi, bt, airplane, focus, silent, flashlight, lowPower, rotationLock) / JC.os.setToggle(key, on)
JC.os.lostMode({ message, phone, contact })   // Lost Mode panel; "Call" dials contact (default JC.world.contacts.ownerLine)
JC.os.appName(id), JC.os.appIds()     // display name (JC.world.apps.names first); every known app id
JC.os.timeSkip({ to, text, lock })    // the full-screen "time passes" card → Promise
JC.os.battery()                       // percent
```
Badges: `JC.notify.badge(appId, n)`. Notifications: `JC.notify.push({ app, title, subtitle, body, avatar, art,
open: { app, intent }, thread })`.

## Story engine — `JC.story`

### Authoring: threads (history)
```js
JC.story.thread({
  id: 'teucer',              // thread id (DMs use the contact id)
  members: ['teucer'],       // contact ids, not including 'me'
  name: null,                // group name (groups only)
  pinned: true, muted: false,
  service: 'imessage',       // 'imessage' (blue) | 'sms' (green)
  fails: false,              // true: everything the player sends shows "Not Delivered"
  history: [
    ['-2 21:03', 'teucer', 'brother'],
    ['-2 21:03', 'teucer', 'BROTHER!!!'],
    ['-2 21:30', 'me',     'Teucer!! 😁'],
    ['-2 21:31', 'teucer', '', { img: 'p_teucer_drawing' }],
    ['+0 23:40', 'teucer', 'we are on the PLANE tomorrow!!! 🐟', { u: 1 }],   // u:1 = unread (shows on the lock screen)
  ],
});
```
History tuple: `[time, from, text, extra?]` — `from` is `'me'` or a contact id; `extra` may contain:
`u:1` (unread), `img:'artId'`, `voice:{ dur: 12, text: 'transcript' }`, `link:{ title, site, art, url }`,
`loc:{ place: 'pier7' }`, `react:[{ by: 'me'|'teucer', t: 'love'|'like'|'dislike'|'haha'|'emph'|'q' }]`,
`unsent:true`, `edited:true`, `fail:true` (Not Delivered), `effect:'slam'|'loud'|'gentle'|'invisible'`,
`sys:true` (centered system line, e.g. "Tonia named the conversation …"), `sticker:'🐟'`.
A message whose text is only 1–3 emoji renders large automatically.

### Authoring: scenes (live, branching)
```js
JC.story.scene({
  id: 'fam_teucer_plane',
  thread: 'teucer',                     // default thread for steps
  arc: 'fam', ch: 'fri_night',
  trigger: { on: 'unlock', delay: 180 },
  when: (s) => !s.flags.lost_mode,      // optional guard checked when the trigger fires
  nodes: {
    start: [
      { m: 'brother' },
      { m: 'brother', d: 0.6 },
      { m: 'BROTHER' },
      { m: 'i am awake on the PLANE', img: 'p_teucer_window' },
      { choice: [
          { t: "Teucer, it's late. Put the watch away.", fx: { aff: { teucer: 1 } }, go: 'late' },
          { t: 'Did you bring Sir Fang?', fx: { aff: { teucer: 2 } }, go: 'fang' },
          { t: 'Who is this?', fx: { sus: { teucer: 4 } }, go: 'who' },
          { t: '[Leave him on read]', silent: true, go: 'ignored' },
        ], timeout: 90, onTimeout: 'ignored' },
    ],
    late: [ { m: 'ok ok ok' }, ... , { fx: { set: { teucer_slept: true } } } ],
  },
});
```
Scene keys besides `id`, `thread`, `trigger`, `when`, `nodes`: `retry: true` (a failed `when` is checked again every
tick instead of skipping the scene), `arc: 'zl'` (which story arc owns the scene; used by the interconnection lint),
`ch: 'chapterId'`, `required: true`, `expire: 'nodeName' | true` (see Chapters).

**Triggers** (`trigger` is one object, or an **array = any of them**; the earliest due time wins):

| trigger | fires |
|---|---|
| `{ on: 'unlock', delay }` | `delay` s after the phone is first unlocked |
| `{ on: 'scene', scene, delay }` | after another scene finishes |
| `{ on: 'flag', flag, delay }` | when a flag becomes truthy |
| `{ on: 'act', act: 'memo_play' \| ['a', 'b'], match: (p, s) => bool, delay }` | when an app reports the act (any of the list) |
| `{ on: 'open', thread: 'skirk' }` / `{ on: 'open', app: 'voicememos' }` | when that thread / app is opened |
| `{ on: 'time', at: '+1 06:55' }` | when the in-game clock reaches `at` (`'+N HH:MM'`, `'YYYY-MM-DD HH:MM'`, or `'HH:MM'` = day 0, or day 1 before noon). Fires correctly with a fast chapter clock. |
| `{ on: 'chapter', ch: 'sat_dawn', delay }` | `delay` s of play time after that chapter began |
| `{ on: 'sus', who: 'tonia' \| 'total', at: 6, delay }` | when suspicion of `who` (or the sum) reaches `at` |
| `{ on: 'manual' }` | only by a `start` step / `JC.story.start(id)` / an onAct rule |

Delays are seconds of **play time** (they shrink with `timeScale`). A scene with `ch` only arms while its chapter is
current, and is marked `'expired'` when the chapter ends.

**Steps** (a node is an array of steps, executed in order):

| step | meaning |
|---|---|
| `{ m: 'text', from, d, img, voice, link, loc, effect, th }` | Message from a contact (typing indicator first; `d` = typing seconds, default from length). `from` required in groups. `th` sends to another thread. |
| `{ me: 'text', img, th }` | Message sent automatically as the player. |
| `{ choice: [opt…], timeout, onTimeout }` | Wait for the player. Option: `{ t, label, go, fx, silent, send:[…extra bubbles], if: s => bool }`. `t` is the text sent; `label` (optional) is shown on the button instead; `silent: true` sends nothing. Timeout seconds (play time) count only while the player has the thread open. |
| `{ fx: { set: {flag: v}, sus: {id: n}, aff: {id: n}, inc: {counter: n} } }` | Effects (options may carry `fx` too). Suspicion spreads (see Gossip). |
| `{ go: 'node' }` | Jump. |
| `{ if: (s) => bool, go: 'a', else: 'b' }` | Branch (`else` optional = continue). |
| `{ start: 'sceneId', delay }` | Start another scene. |
| `{ wait: seconds }` | Pause. |
| `{ typing: seconds, from }` | Typing indicator that stops without a message. |
| `{ react: 'haha'\|'love'\|'like'\|'dislike'\|'emph'\|'q', from, on: 'me'\|'them' }` | Tapback on the last message (default the player's). |
| `{ unsend: true, from }` | The contact unsends their last message. |
| `{ sys: 'text' }` | System line in the thread. |
| `{ addMember: cid }` / `{ removeMember: cid }` / `{ rename: 'Group name' }` | Change the thread. |
| `{ add: { to: 'notes'\|'mail'\|'events'\|…, item: {...}, notify: true } }` | Add app data. |
| `{ notify: { app, title, body, open } }` | A notification from any app. |
| `{ call: 'callId', delay }` | Incoming call (see calls). |
| `{ time: '+20m' \| '07:38' \| '+1 06:50', card: 'Optional narrator line' }` | Move the in-game clock (with `card` a full-screen "time passes" moment). |
| `{ run: (api) => {} }` | Escape hatch (api = `{ state, os, store, story, notify, time, contacts, ui }`). |
| `{ ending: 'id' }` / `{ endings: ['id', …] }` / `{ endings: (s) => ids }` | Finish the game with an ending (the first id is shown; all are unlocked). |
| `{ endings: 'finale' }` | Finish with the rule-based finale endings: shows the top `JC.story.qualifying()` ending, unlocks all qualifying. |
| `{ end: true }` | End the scene now. |

`s` (in `when`, `if`, `opt.if`, `match`, ending/aftermath `when`) is the live state: `s.flags`, `s.sus`, `s.aff`,
`s.done` (scene id → 1 started | 'skipped' | 'expired'), `s.fin` (finished), `s.endings`, `s.now` (clock ms), `s.eng`
(play ms), `s.chapter` (current chapter id), helpers `s.flag(n)`, `s.count(n)`, `s.susTotal()`,
**`s.acted(name)`** (how many times the act was reported this playthrough) and `s.balance()` (bank balance).
Flags the engine sets itself: `told_truth` (any confession), `card_frozen` (JC.bank).

### Authoring: calls
```js
JC.story.call({
  id: 'call_ekat', from: 'ekat', video: false,
  missed: [ { start: 'ekat_texts_after_missed' } ],   // steps run if declined / unanswered (rings 25 s)
  onHangup: [ { start: 'ekat_hung_up' } ],             // steps run if the player hangs up mid-call
  voicemail: 'Sir, it\'s Ekaterina…',                  // optional voicemail left when missed
  nodes: {
    start: [ { say: 'Sir? It\'s Ekaterina. I\'m sorry to call so late.' },
             { choice: [ { t: '(Stay silent)', go: 'silent' }, { t: '"…Mm."', go: 'mm' }, { t: 'Tell her the truth', go: 'truth' } ] } ],
    silent: [ { say: '…Sir? Your breathing sounds… different.' }, { hangup: true } ],
  },
});
JC.story.dialScript('ekat', 'call_ekat_out', (s) => s.flags.ekat_warned);   // what happens when the PLAYER calls ekat
```
Call steps: `say` (line from the caller, shown as live captions), `choice` (player options; spoken lines in quotes,
actions in parentheses), `hangup` (they hang up), plus every normal step. Unscripted outgoing calls get a sensible
default (rings, then voicemail, or the contact's `hello` / `JC.world.contacts.hello` with options to hang up, stay
silent, or tell the truth; telling the truth ends the game with `JC.world.confess.endings[cid]` or `.fallback`). Dialling
`JC.world.contacts.ownerLine` without a dialScript plays `JC.world.contacts.ownerLineCall`. Ringing, captions and the
outgoing ring time all scale with `timeScale`.

### Authoring: endings & intro
```js
JC.story.ending({ id: 'teucer', n: 14, title: 'The Toy Factory', tag: 'Family', art: 'end_teucer',
  hint: 'Keep the lie, lovingly. Every child deserves a factory.',
  text: ['paragraph', '…'], jc: ['When Childe got his phone back…', '…'] });
JC.story.intro = ['11:47 PM. Liyue Harbor.', '…'];   // prologue lines, one per screen (fallback: JC.world.introFallback)
JC.story.lockNotifs = [ { app: 'phone', title: 'Missed Call', body: 'Tonia (3)', t: '+0 23:12' } ];
JC.story.onSuspicion('tonia', 8, 'caught_tonia');   // start scene when suspicion reaches a threshold
JC.story.onTotalSuspicion(25, 'caught_total');
```
`jc` is the epilogue block; its heading is `JC.world.brand.epilogue`.

**Rule-based (finale) endings.** Give an ending `finale: true` and a condition; the finale step picks for you:
```js
JC.story.ending({ id: 'contract_renewed', n: 3, title: 'A Contract Renewed', finale: true,
  priority: 1,                    // lower = shown first when several qualify
  arcs: ['zl', 'osial'],          // documentation for the lint (it measures what `when` actually reads)
  when: (s) => s.flags.zl_contract && s.flags.osial_stopped,   // no `when` = always qualifies (use one as the fallback)
  text: [...], jc: [...], hint: '...' });
JC.story.qualifying()             // finale endings whose `when` passes, sorted by priority (then n)
// in the last scene:  { endings: 'finale' }   → shows qualifying()[0], unlocks every qualifying one
```
`{ ending }` and `{ endings: [...] }` keep working.

**Aftermath ("Where everyone ended up").** Every chat gets one outcome line on page 2 of the ending screen:
```js
JC.story.aftermath([
  { id: 'zhongli', name: 'Zhongli', avatar: 'zhongli', outcomes: [      // avatar = contact id
    { id: 'honored', when: (s) => s.flags.zl_contract && !s.flags.zl_broken, line: 'Contract honored. He paid for tea.' },
    { id: 'never',   line: 'Never signed. He still wonders.' },          // no `when` = catch-all
  ] },
]);
```
The first matching outcome per chat wins; a chat with no match is left out. Calling `aftermath()` again with the same
chat id replaces it. The result is computed when the game ends and saved; found outcomes persist across restarts (like
endings) and show in the Endings gallery ("Zhongli · 2 of 5"). Runtime: `JC.story.aftermathResult()` →
`[{ id, name, avatar, outcome, line, total }]` (live), `JC.story.aftermathLast()` → `{ ending, list }` (frozen at the
ending), `JC.story.aftermathFound()` → `[{ id, name, avatar, found, total, outcomes: [{ id, line, found, at }] }]`.

### onAct: repeatable reactions to app acts
```js
JC.story.onAct({
  id: 'paimon_fed',                       // required for `once`; also the key of s.actOnce
  act: 'order' | ['order', 'charge'],     // one act or any of a list ('*' = every act)
  match: (p, s) => p.app === 'lotuseats', // optional payload filter
  fx: { inc: { paimon_meals: 1 } } | ((p, s) => fx),   // effects (function form may return null)
  start: 'paimon_thanks', delay: 20,      // optional: start a scene (delay in play seconds)
  notify: { app: 'messages', title: 'Paimon', body: '!!!' },   // optional notification (after `delay`)
  once: false,                            // true: fires the first time only
  arc: 'lumine',                          // optional, for the interconnection lint
});
```
Rules run on every `JC.story.act(name, payload)` (repeatable unless `once`), never after the game has ended. Counters
live in the save (`s.acts[name]`, `s.actOnce[id]`), so rewind is exact. `JC.world.acts` rules are registered at boot.

### Chapters (multi-day play)
```js
JC.story.chapter({
  id: 'sat_dawn', n: 2, title: 'Cranes', label: 'Saturday morning',
  at: '+1 06:50',                 // the clock jumps here when the chapter begins (ignored for the first chapter)
  card: 'Saturday, 06:50. You fell asleep on the couch with his phone on your chest.',   // time-skip card text
  clockRate: 10,                  // in-game seconds per play second while current (× timeScale). Default 1.
  until: '+1 09:30',              // the clock never runs past this on its own during the chapter
  maxWait: 1500,                  // optional: move on after this many play seconds regardless
  settle: (s, dflt) => dflt() && s.flags.kids_landed,   // optional: replaces the default settle test
  settleDelay: 8,                 // seconds settle must hold before moving on (default 8)
});
```
Register chapters in play order. The first chapter begins at the first unlock. Scenes join a chapter with
`ch: 'sat_dawn'`; `required: true` scenes define when it is done; `expire: 'nodeName' | true` says what happens if the
chapter ends first.
- **Default settle:** the chapter has at least one `required` scene, every required scene has finished (or was
  skipped/expired), and none of the chapter's scenes is mid-conversation (no pending choice, no typing; a run sitting
  in a `wait` step does not block). A chapter with no required scenes only ends by `maxWait` or Later….
- **Moving on** (settled for `settleDelay` s, `maxWait` reached, or `JC.story.later()`): unfinished chapter scenes
  expire (pending choice cancelled, then the `expire` node runs instantly, messages without typing, or the scene just
  ends); unstarted ones are marked `'expired'`; the time-skip card plays (`JC.os.timeSkip({ to, text: card })`, phone
  locks), the clock is set to `at`, the battery goes to 100 % if the day changed; `story:chapter` fires and the new
  chapter's triggers arm. The last chapter never auto-advances.
- `JC.story.later()` → true if it moved on. `JC.story.canLater()`: chapters exist, a next chapter exists, no timed
  choice is pending, no call is active, no time card is showing.
- `JC.story.currentChapter()` → chapter def + `{ index, startedAt, day }` (`day` = weekday name) | null;
  `JC.story.nextChapter()`; `JC.story.chapters()` → defs + `{ index, started }`.
- UI: "Later…" on the lock screen and a Control Center tile (both show the next chapter's `label`, only while
  `canLater()`); Settings → Story shows the chapter and day and "Skip to Next Chapter".
- Use `{ on: 'chapter', ch, delay }` to schedule a chapter's scenes, and `'+N HH:MM'` for every `time` trigger.

### Time controls
- Setting `timeScale` ∈ {1, 2, 4, 8}: play time and the clock run that much faster, so trigger delays, typing, waits,
  call captions, ringing and timed choices all shrink proportionally. Message Speed (`settings.speed`) is separate.
- `JC.story.setTimeScale(n)` (snaps to 1/2/4/8, returns it), `JC.story.timeScale()`.
- `JC.story.skipNext()`: jumps play time and the clock to the next scheduled step, armed trigger or `on: 'time'`
  trigger (clock set exactly to its `at`); with nothing scheduled it calls `later()` when possible. Returns
  `'step' | 'trigger' | 'time' | 'later' | false`. `JC.story.nextEvent()` → `{ in: playMs, kind } | null`.
- `JC.story.hurry(threadId)`: the contact typing there delivers now (tapping the typing bubble in Messages does this).
- `JC.story.pause(on)` / `JC.story.paused()`: freezes the clock, play time and timed choices (JC.time.freeze).
- UI: Control Center hare tile (tap cycles 1→2→4→8, long-press = skip to next, orange while paused), status-bar
  badge (⏩ 4× / ⏸), Settings → Story (Time Speed, Skip to Next Event, Pause Story), desktop keys `]` faster,
  `[` slower, `\` skip to next (ignored while typing).
- Tests: `JC.story._ff = true` (schedule from due time) and `JC.story._advance(ms)` (play time + clock, honoring
  clockRate and `until`).

### Gossip (suspicion spreads)
`JC.world.gossip = [{ from: 'tonia', to: 'mama', share: 0.5 }]` (also `JC.story.gossip(edges)`): when suspicion of
`from` rises by n (scene fx, option fx, onAct fx, or the engine's own off-script bumps), `to` gets `share × n`. One hop
only. Suspicion raised inside a group thread also gives every other member `JC.world.groupShare × n` (default 0.5).
Every change emits `story:sus` `{ who, by, via }` (`via` = the gossiping contact, `'group:<thread>'`, or null).
`{ on: 'sus', who, at }` triggers and `onSuspicion` hooks see the spread values.

### Contact flavour (unscripted replies)
Pools on the contact, set in `js/story/flavor.js`: `idle`, `confused`, `voiceReact`, `imgReact`, `confess`,
`confessCall`, plus any pool named in `JC.world.imgPools` (art tag → pool, e.g. `{ dog: 'dogReact' }`). A pool may mix
strings with **reactive lines** `{ text, when: (s) => bool }`: lines whose `when` passes are preferred (60 % of the
time when there are plain lines too, always when there are none); failing lines are skipped. `"\n"` splits bubbles.

### Runtime API (apps)
```js
JC.story.threads()            // [{ id, name, members, group, pinned, muted, unread, last, typing }]
JC.story.messages(threadId)   // normalized: { id, t, from, text, img, voice, link, loc, react:[], unsent, edited, fail, effect, sys, sticker, status:'sent'|'delivered'|'read'|'failed', readAt }
JC.story.pending(threadId)    // null | { options: [{ i, label, text, silent }], timeout, left }
JC.story.choose(threadId, i)
JC.story.send(threadId, { text } | { img } | { voice } | { loc } | { memo })   // free message from the player
JC.story.typing(threadId)     // contact id currently typing, or null
JC.story.setOpen(threadId|null), JC.story.markRead(threadId)
JC.story.react(threadId, msgId, type), JC.story.pin(threadId, on), JC.story.mute(threadId, on), JC.story.remove(threadId)
JC.story.threadFor(contactId) // DM thread id (created on demand);  JC.story.members(threadId) → contact ids
JC.story.sus(contactId), JC.story.susTotal(), JC.story.flag(name), JC.story.aff(contactId), JC.story.api() // the `s` object
JC.story.act(name, payload)   // report player actions
JC.story.dial(contactId, { video })   // player places a call
JC.story.call()               // current call state or null
JC.story.answer(), JC.story.decline(), JC.story.callChoose(i), JC.story.hangup()
JC.story.endings()            // [{ id, n, title, tag, hint, unlocked, at }]
JC.story.rewind(), JC.story.restart()
// + chapters, time controls and aftermath (above)
```
Bus events: `story:thread` ({ thread, msg }), `story:threads`, `story:typing` ({ thread, who }), `story:pending`
({ thread }), `story:call` (call state), `story:act` ({ name, p }), `story:fx` (the fx object, whenever effects
apply), `story:sus` ({ who, by, via, value }), `story:ending` ({ id, also }), `story:reset` (rewind/restart),
`story:chapter` ({ id, n, title, label, index }), `story:chapter:end` ({ id, next, why: 'settled'|'maxWait'|'later' }),
`story:time` ({ scale, paused }), `story:skip` ({ kind, ms }), `bank` (see JC.bank), `wallet:tx` (tx).

### Story acts (apps MUST emit these)

| app | act | payload |
|---|---|---|
| OS | `open_app`, `unlock`, `wallpaper` | `{ app }` (automatic), `{ first }`, `{ id }` |
| Messages | `open_thread`, `send`, `tapback` | `{ thread }`, `{ thread, kind, text, art, memo }`, `{ thread, msg, t }` |
| Calls (engine) | `call_start`, `call_end` | `{ contact, dir }`, `{ contact, dur, answered }` |
| Bank (JC.bank) | `charge`, `decline`, `transfer`, `card_freeze` | `{ amount, merchant, app, cat, card, tx, balance }`, `{ amount, merchant, app, card, reason }`, `{ to, amount, memo }`, `{ on }` |
| Voice Memos | `memo_play`, `memo_share`, `memo_delete` | `{ id }`, `{ id, to }`, `{ id }` |
| Photos / Camera | `photo_view`, `photo_delete`, `photo_fav`, `photo_taken` | `{ id }` |
| Notes | `note_open`, `note_edit` | `{ id }` |
| Safari | `visit` | `{ url }` |
| Maps / Find My | `place_view`, `directions`, `findmy_sound`, `findmy_view` | `{ place }`, `{ place }`, `{ id }`, `{ id }` |
| Wanmin Go (`lotuseats`) | `order` | `{ rest, total, to }` |
| Harbor Ride (`swift`) | `ride_view`, `ride_report_lost` | `{ id }`, `{}` |
| Ripple (`wavelet`) | `post`, `like`, `comment`, `dm` | `{ text, art }`, `{ post }`, `{ post, text }`, `{ to, text }` |
| Wallet | `wallet_tx` | `{ id }` |
| Games | `game_score` | `{ score }` |
| Phone | `voicemail_play` | `{ id }` |
| Mail | `mail_open`, `mail_send` | `{ id }`, `{ to, subject, body }` |
| Calendar | `event_open`, `event_add` | `{ id }` |
| Settings | `setting` | `{ key, value }` |

List every act the story uses in `JC.world.actVocab` (storytest warns about triggers / onAct rules using others).

## One wallet — `JC.bank`
Every app that spends money uses the same balance. Cards and accounts come from `JC.world.bank`; the main card draws
on the main balance; other card ids are recorded but not balance-checked.
```js
JC.bank.balance(accountId?)   // main account balance (or another account's)
JC.bank.accounts()            // [{ id, name, number, balance, main }]
JC.bank.cards(), JC.bank.mainCard(), JC.bank.isBankCard(cardId)
JC.bank.check({ amount, card })                       // → { ok, reason: 'frozen'|'funds' } (no side effects)
JC.bank.charge({ amount, merchant, app, cat, note, card, place, contact, sms, quiet })   // → { ok, reason, tx }
JC.bank.credit({ amount, merchant, app, cat, note, card })   // refunds, incoming money → { ok, tx }
JC.bank.transfer({ to: contactId, amount, memo })     // → { ok, reason, tx }; act 'transfer'
JC.bank.freeze(on), JC.bank.frozen()                  // flag card_frozen + act 'card_freeze'
JC.bank.on(fn)                                        // fn({ kind: 'charge'|'decline'|'credit'|'freeze', balance, frozen, tx, reason }) → unsubscribe
JC.bank.reasonText(reason)                            // user-facing decline text
```
A charge writes a `tx` record (Wallet's schema, plus `app`), sends the bank SMS from `JC.world.bank.sms` (unless
`quiet`), emits act `charge` (or `decline`, with no money moved) and bus `bank` + `wallet:tx`. Checkouts: confirm with
`JC.wallet.pay({ …, record: false })` (Face ID / passcode sheet; it pre-checks the bank and shows "Payment Declined"),
then call `JC.bank.charge(...)` and show an alert when `ok` is false (see `js/apps/lotuseats.js`).

## World config — `JC.world` (`js/data/world.js`)
Loaded right after util.js (state.js and keyboard.js read it at load time). Core reads **only** from here for
story-specific values. Keys (all optional unless marked):

| key | used for |
|---|---|
| `storageKey` (required) | localStorage key of the save (`'childephone.v1'`); change it when saves must not collide |
| `start` (required) | in-game start `'YYYY-MM-DD HH:MM'`; `'+N HH:MM'` is relative to that day |
| `introFallback` | prologue lines when `JC.story.intro` is empty |
| `endings` | expected number of endings (gallery fallback; storytest checks it) |
| `device` | `{ battery, wallpaper, owner, mirroring, mdm, files, print, emergency: ['112', …] }`: starting battery %, default wallpaper art id, owner name, Screen Mirroring / delete-app (MDM) / Save to Files / Print alert texts, numbers treated as emergency |
| `passcode` | `{ code, wrong: { tries, thread, text }, hints: [byTries…], hintLast, unavailHint }`: the passcode, the message that arrives after `tries` wrong guesses, hint per number of wrong tries, the "iPhone Unavailable" hint |
| `medicalId` | `{ name, age, rows: [[label, value]…], contacts: [{ id, rel, fallback }] }` |
| `contacts` | `{ noReply: [ids], failSend: [ids], ownerLine: id, ownerLineCall: { nodes }, hello: { normal, emergency } }`: who never replies, whose messages show Not Delivered, the owner's office line (Lost Mode "Call Owner", and its scripted answer when dialled), how contacts greet "the owner" |
| `confess` | `{ re: /…/i, endings: { contactId: endingId }, fallback: endingId }`: confession matcher and the default ending per contact (when there's no `confess_<id>` scene) |
| `imgPools` | `{ artTag: poolName }` reply pool for sent photos carrying that tag (default `imgReact`) |
| `acts` | onAct rules registered at boot (see onAct) |
| `actVocab` | every act name the story uses (storytest warns about others) |
| `gossip` | `[{ from, to, share }]` suspicion edges; `groupShare` (default 0.5) for group threads |
| `siri` | `{ where, weather, owner, joke, extra: [[/re/, 'answer']…] }` |
| `keyboard` | `{ frequent: [emoji], dict: 'space separated story words', completions: { 'abc': [3 suggestions] } }` |
| `apps` | `{ names: { id: 'Display Name' }, home: { pages, dock, hidden }, library: [[category, [ids]]…], spotlightApps: [ids], quick: { appId: [{ text, icon, intent }] } }` (a `quick` list replaces that app's built-in quick actions) |
| `people` | `{ share: [contact ids for the share sheet], spotlight: [contact ids for empty Spotlight] }` |
| `widgets` | `{ weather: { city, label, fallback }, lockEvent: { match: /re/, fallback: { title, when } }, calendar: [events when none], memories: { art, title, kicker, intent }, note: { title } }` |
| `brand` | `{ title, tagline, emblem (JC.icon glyph), replyAs, dictation, epilogue, allFound, someFound, restart, endingsHint }` |
| `money` | `{ symbol: 'ℳ', fmt: (n) => string }` used by `JC.util.fmtMoney` and the keyboard |
| `bank` | `{ name, main: cardId, balance, cards: [{ id, name, last, kind }], accounts: [{ id, name, number, main, balance }], sms: { thread, from, text: (kind, tx) => string \| null } }` (`kind`: charge, credit, decline) |
| `test` | `{ flags: [flags set outside static fx], actions: [{ id, p, after, only, not, repeat, run(T) }] }` for storytest |

The page shell (`css/page.css`) defines the story palette used inside the phone: `--cap-glyph` (caption glyph), and
`--story-hi`, `--story-hi-soft`, `--story-accent`, `--story-btn`, `--story-card`, `--story-card-line`, `--story-dim`,
`--story-night1/2` (time-skip card), `--story-lost`, `--story-wg-bg1/2`, `--story-wg-hole`, `--story-wg-fg`,
`--story-ring` (endings widget). `css/os.css` only reads them, with fallbacks. (`--story-accent` must be a literal
colour, or leave it undefined to follow `--purple`.)

### App id → display name
App ids never change (≈250 references); display names come from `JC.world.apps.names`, which win over the `name` an
app registers.

| id | display name | note |
|---|---|---|
| `wavelet` | Ripple | Instagram-like |
| `lotuseats` | Wanmin Go | food delivery |
| `swift` | Harbor Ride | rides |
| `reelrush` | Reel Rush | new; canvas fishing game |
| `northland` | Northland Bank | new; the app for `JC.bank` |
| `feiyun` | Feiyun Market | new; marketplace with auctions |
| everything else | the iOS name (Messages, Phone, Wallet…) | |

## App author guide (read before writing an app)

### Files, naming, loading
- Your app lives in `js/apps/<id>.js` (+ optional extra files `js/apps/<id>-*.js`) and `css/apps/<id>.css`.
  After creating or renaming a file run `python3 tools/manifest.py` (regenerates `js/manifest.js`, which `index.html`
  and the bundler use). Do not edit `index.html`.
- **Prefix every CSS class you invent** with a short app prefix (`msg-`, `ph-`, `mail-`, `ntz-` …) and scope rules under
  your window body class (add one in `launch`: `win.body.classList.add('app-notes')`). Never style bare kit classes
  globally (`.row`, `.list`, `.page`, `.btn` …) — override them only inside `.app-<id> …`.
- Read `js/apps/calculator.js` for the pattern. `launch(win, intent)` builds the UI once; return `{ intent, show, hide, back, destroy }`.
- Seeds: `JC.store.seed('<collection>', [...])` at the top level of your file (runs at load). Times may be strings in
  the `JC.time.parse` formats ('-3 21:04', '+0 23:21', '2009-02-12 18:30').
- Listen for changes with `JC.store.on(col, fn)`, `JC.bus.on('story:thread', fn)` etc. and re-render (`page.render()`).
- Things that must exist before your app is opened (badges, island activities) go in `JC.bus.on('boot', () => {...})`.

### Look & feel checklist (iOS 26)
- Nav bars: glass circle/capsule buttons (`JC.ui.navBtn`), large titles that collapse on scroll (`large: true`).
- Lists: inset grouped, 26px radius sections (`JC.ui.list`). Separators inset. Row heights ≥ 44.
- Tab bars: floating glass capsule (`JC.ui.tabs`).
- Sheets slide up with grabber; alerts are capsule-button glass cards (`JC.ui.sheet`, `JC.ui.alert`).
- Colours only from tokens: `--bg --bg2 --gbg --cell --label --label2 --label3 --sep --fill* --blue --green --red --orange
  --yellow --pink --purple --indigo --teal --tint --glass --glass-strong --material`. Both light and dark must look right
  (Settings → Display can switch; test both by toggling `JC.os.setAppearance('dark')`).
- Typography: SF-style stack is inherited. Sizes: large title 34/700, title 28, headline 17/600, body 17, subhead 15,
  footnote 13, caption 12. Use `font-variant-numeric: tabular-nums` for digits in columns.
- Every tappable thing: `onTap` (via `JC.h` or `JC.ui.onTap`). Long-press menus via `JC.ui.contextMenu` where iOS has them.
- Keep the app usable at screen heights from 600 to 874 px (`var(--H)`), and with the keyboard open (window shrinks).

### Shared runtime hooks you may need
- `JC.os.island.start(id, { priority, width, compact: () => ({ left: Node, right: Node }), expanded: (el) => {}, onTap })`,
  `JC.os.island.update(id)`, `JC.os.island.stop(id)`, `JC.os.island.flash(text, icon, color)`.
- `JC.notify.push({...})`, `JC.notify.badge(app, n)`.
- `JC.os.open(appId, intent)`, `JC.os.home()`, `JC.os.setStatus('light'|'dark'|'auto')` (status-bar text for the current screen).
- `JC.os.isOpen(appId)`, `JC.os.online()`, `JC.os.battery()`, `JC.os.setWallpaper(id)`, `JC.os.setAppearance(a)`,
  `JC.os.setToggle(k, v)`, `JC.os.showEndings()`, `JC.os.confirmRestart()`, `JC.story.rewind()`, `JC.state.setting(k, v)`.
- `JC.time.now()` (in-game ms) — use it for "now" everywhere, never `Date.now()` for displayed times.
- Music must expose `JC.music = { nowPlaying() → {title, artist, art, playing} | null, toggle(), next(), prev() }` and emit
  `JC.bus.emit('music')` on change (Control Center reads it).
- The incoming/active call screen is drawn by `js/apps/callui.js` into `#call-layer`, driven by `JC.bus.on('story:call', call)`
  and `JC.story.call()` (phases: 'ringing' | 'active' | 'ended'; `call.dir` 'in'|'out'; `call.lines` [{who, text}];
  `call.pend.options` [{i, label}]; actions `JC.story.answer() / decline() / callChoose(i) / hangup()`).

### Intents each app must accept (deep links used by notifications, Spotlight, share sheet, other apps)
messages `{thread}` `{compose: {text|img|memo|loc}}` · phone `{tab}` `{call: cid}` · contacts `{contact}` · facetime `{call}` ·
mail `{id}` `{compose: {to, subject, body}}` · voicememos `{id}` · wavelet `{id}` `{post}` `{user}` `{compose}` ·
photos `{id}` `{photo}` `{album}` `{memory}` · camera `{selfie}` · notes `{id}` `{note}` `{compose, title}` ·
calendar `{id}` `{date}` · reminders `{id}` `{list}` · clock `{tab, create}` · weather `{city}` · safari `{url}` `{search}` `{newTab}` ·
maps `{place}` `{directions}` `{share}` · findmy `{id}` `{tab}` · swift `{id}` · lotuseats `{id}` `{rest}` · wallet `{id}` `{card}` ·
music `{tab}` `{play}` · stocks `{symbol}` · settings `{page: 'wifi'|'battery'|'wallpaper'|'display'|'endings'|'general'|'about'|'faceid'|'screentime'|'notifications'|'sounds'|'story'}`.
An intent `{ id }` always means "open that item of your main collection".

### Testing your app
```js
// node script (put it in the scratchpad, not the repo)
const T = require('/home/user/n/tools/pw.js');
const { page, done } = await T.open({});          // desktop viewport; { mobile: true } for a phone viewport; { dark: true }
await T.skipIntro(page); await T.unlock(page);     // dismiss the prologue, type the passcode
await page.evaluate(() => JC.os.open('notes'));   await page.waitForTimeout(800);
await T.shot(page, 'notes-home');                  // PNG of the device into $SHOTS (set process.env.SHOTS)
const errors = await done();                       // console + page errors (ignore font ERR_FAILED)
```
Look at your screenshots with the Read tool, in light and dark, and fix what looks wrong. Click through every control.
`T.unlock(page)` types the current passcode (`JC.world.passcode.code` unless changed).

### Story tester — `tools/storytest.js`
```
node tools/storytest.js [runs=30] [--verbose]   static checks + randomized playthroughs (endings, chapters, Aftermath tally)
node tools/storytest.js --routes [--route name]  scripted playthroughs in tools/routes/*.js; each must land on `expect`
node tools/storytest.js 30 --lint                + interconnection lint (arc × arc read matrix)
node tools/storytest.js 30 --scale 8             play at timeScale 8
node tools/storytest.js 6 --inject stub.js       run a script in the page first (stub content while writing)
```
Exit code 1 on static errors, stuck runs, failed routes, lint failures or page errors.
- **Routes** (`tools/routes/<name>.js`): `module.exports = { name, expect: 'endingId', calls: 'decline'|'answer', steps }`.
  Steps: `{ choose: { thread, match: /label regex/ } }`, `{ act: [name, payload] }`, `{ later: true }`,
  `{ wait: seconds }`, `{ dial: contactId }`, `{ answer: true | contactId }`, `{ callChoose: { match } }`,
  `{ hangup: true }`, `{ send: [thread, text] }`, `{ open: threadId }`, `{ app: appId }`, `{ assert: 's.flags.x' }`,
  `{ until: 's.flags.x' }` (`within: seconds` on any waiting step, default 3600). Waiting steps fast-forward play time;
  calls the route doesn't handle are declined (or answered, first option). See `tools/routes/old-honest-hq.js`.
- **Lint**: flags are owned by the arcs whose scenes (`arc`) or onAct rules (`arc`) write them (`fx.set/inc/aff/sus`,
  option fx). Reads are recorded per arc at runtime (a Proxy on `s.flags` / `s.aff` / `s.sus` / `s.acted` while
  `when` / `if` / `match` run) and by scanning condition source. Finale endings' `when` is evaluated with recording
  proxies. FAIL: a finale ending reads flags of fewer than 2 arcs; an arc's flags are never read by another arc.
  Warning only when no scene declares `arc`.
- **Act vocabulary**: with `JC.world.actVocab` set, triggers / onAct rules using an act outside it are warned about.
- **Chapters**: playthroughs fast-forward through chapters (instant transitions), call Later… when things are quiet,
  and report chapters reached and why each ended.

### Notes from integration
- `JC.ui.page({ content })` renders synchronously inside the constructor: inside `content(pg)` use the `pg` argument, not
  the `const page = …` you are assigning (TDZ error).
- `JC.story.call(def)` registers a call script; `JC.story.call()` (no argument) returns the live call.
- Extra engine APIs: `JC.story.rename(id, name)`, `JC.story.restore(id)`, `JC.story.removed()`, `JC.story.hideMsg(id, msgId)`,
  `JC.story.dial(cid, { video, num })`; `JC.story.pending(id).left` = ms left on a timed choice.
- Story tests fast-forward play time by bumping `JC.state.d.eng` (with chapters: `JC.story._advance(ms)`, which moves
  the clock too). Set `JC.story._ff = true` (and keep `speed` at 1) when you do (chapter transitions are then instant): steps are then scheduled from when they were due rather than from the 200 ms tick that noticed them, so
  messages and trigger delays keep their real proportions. Without it, every message stretches to two ticks of
  fast-forwarded time and night-only scenes (Fairy, the Ops group) never get their turn. Real play never sets it.
