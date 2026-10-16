# Core requests

## From Music / Health / Stocks / Lotus Leap / Settings
- **css/os.css `#screen button { background:none; padding:0; color:inherit }`** (specificity 1-0-1) beats `.btn.k-filled/.k-gray/.k-tinted`,
  `.btn.s-*` padding and `.navbtn` glass backgrounds in css/ui.css (0-2-0), so `JC.ui.btn` fills are invisible everywhere. Suggest
  `:where(#screen) button { … }` (zero specificity). My apps work around it with div-based buttons.
  *(Fixed by the lead; the div buttons stay, they're harmless.)*
- **os.js `hwAction()` ignores the Action Button setting.** Settings › Action Button writes core setting `actionButton` ∈
  `silent | focus | camera | flashlight | memo | music | translate | magnifier | controls | none` (also mirrored in
  `prefs.actionButton`). Suggest: `silent` → current toggle; `camera`/`memo` → `os.open('camera'|'voicememos')`;
  `flashlight`/`focus` → `os.setToggle(...)`; `none` → haptic only; the rest → open Control Center.
- **notify.js doesn't honour notification settings.** Settings writes core `notifOff` (`{ appId: true }` = Allow
  Notifications off), per-app `prefs['notif.' + appId]` = `{ allow, lock, center, banners, sounds, badges, previews }`, and
  core `previews` (`'always' | 'unlocked' | 'never'`, already in state.js defaults). Suggest suppressing banners/sounds per
  app and hiding the body text on the Lock Screen when previews ≠ always.
- **audio.js `ring()` always plays the built-in pattern.** Settings › Sounds stores core `ringtone` (and `texttone`,
  `voicemail`, `newmail`, `sentmail`); `JC.settingsKit.playTone(name)` already synthesises every tone name (incl. the custom
  "A-Ling Screaming") and could be reused for incoming calls/messages.
- **Text Size isn't applied globally.** Core `textSize` (0.82–1.36) is only previewed inside Settings. Bold Text, Reduce
  Motion, Classic Invert and Grayscale are applied by js/apps/settings.js itself (`#screen.set-bold`, `.set-reduce-motion`,
  `.set-invert`, `.set-gray`, plus a `#set-nightshift` tint overlay for Night Shift/True Tone) — fine to keep there, but core
  may prefer to own them (and `textSize`) in os.js/os.css.
- **Lock Screen has no Now Playing widget.** `JC.music` exposes `nowPlaying()` → `{ id, title, artist, album, art, playing,
  pos, dur }`, `toggle/next/prev/play(id)` and emits `JC.bus 'music'`; Control Center already uses it. The Dynamic Island
  activity is registered by js/apps/music-engine.js.
- New story acts my apps emit (no engine changes needed, listed for scene authors): `med_log {med, slot, status}`,
  `mood_log {valence, feel[]}`, `health_share {to:'jl', accept, topics?}`, `setting {key, value}` (keys: `passcode`,
  `faceAlt`, `wifiNet`, `appearance`, `textSize`, `boldText`, `reduceMotion`, `readReceipts`, `msgPhotos`, `clearHistory`),
  `game_score {score}`.

## From Phone / Contacts / FaceTime / Mail / Voice Memos / Call UI
- **js/core/story.js: `story.call = () => call;` (calls section) overwrites the authoring method `call(def)`** from the
  `story` object literal, so every `JC.story.call({...})` definition (js/story/scenes/calls.js, finale.js, and the Phone
  keypad's unknown-number calls) is silently dropped, and `JC.story.dial(cid)` returns early whenever a `dialScript`
  points at a call id that was never registered (e.g. calling A-Ling did nothing). Suggested fix:
  `story.call = (def) => { if (def && def.id) { defs.calls[def.id] = def; return def; } return call; };`.
  Workaround in place: js/apps/callui.js installs exactly that dual-purpose wrapper at load (before scenes load).
- `callRecord()` stores `num: contact.phones[0].num`; the Phone app patches the record afterwards when the player dialled a
  different number (e.g. Tang Mei's mobile) or an unknown number. A `num` option on `JC.story.dial(cid, { num })` would be cleaner.

## From Messages / Wavelet
- +1 on the `#screen button` specificity issue above (it also strips `.navbtn` glass/prominent backgrounds, `.navbtn.cap`
  padding and the tint colour). Messages/Wavelet work around it with `#screen .msgapp …` / `#screen .wvapp …` overrides.
- **No API to rename a thread at runtime** (group "Change Name and Photo"). Workaround: Messages sets
  `JC.state.d.threads[id].rename` (which `threadName()` already honours) and posts a sys line via `JC.story.incoming`.
  Suggest `JC.story.rename(id, name)`.
- **No API to restore a removed thread** (Messages "Recently Deleted → Recover"). Workaround: delete
  `JC.state.d.threads[id].removed` + emit `story:threads`. Suggest `JC.story.restore(id)`.
- **No API to delete/hide a single message** ("Delete Message", "More… → Delete", failed "Delete"). Workaround: Messages keeps a
  local hidden-id list (JC.store collection `msgprefs`). Suggest `JC.story.hideMsg(id, msgId)`.
- `JC.story.choose()` delivers the chosen text with `status:'delivered'` even in a `fails:true` thread (A-Jie). Messages renders
  every outgoing message in a dead thread as Not Delivered regardless; the engine could set `status:'failed'` there.
- `JC.story.pending()` doesn't expose the remaining timeout; Messages reads `JC.state.d.runs[].tleft` for its countdown bar.
  Suggest adding `left` (ms) to the pending object.

## From Photos / Camera / Notes / Calendar / Reminders / Clock / Weather
- ~~`#screen button` specificity~~ — fixed in core; the scoped restore block in css/apps/photos.css has been removed.
- ~~`ui.page()` content TDZ~~ — documented in DEV.md.
- **js/core/ui.js / css/ui.css `ui.wheel` (still off by two rows after the rotateX fix)**: `.wheel-item` snaps with
  `scroll-snap-align: start`, but `.wheel-col` has no snapport inset, so the snap positions are `68 + 34·i` instead of
  `34·i`. Rows 0 and 1 can never be selected and any initial value at index 0/1 is re-snapped to index 2 and reported via
  `onChange` — e.g. Clock's timer picker opened at 2 h 5 min 2 s instead of 0 h 5 min 0 s, a 3:00 PM event silently became
  3:10 PM when its time picker opened, and AM could not be chosen in any AM/PM column. Fix: add
  `scroll-padding-top: 68px` to `.wheel-col` (or use `scroll-snap-align: center` on the rows). Workaround in
  Calendar/Clock/Reminders: `[data-app=…] .wheel-col { scroll-padding-top: 68px; }` (delete once core has it). Other apps
  using `JC.ui.wheel` (Settings, Health, …) are affected too.
- css/os.css: `#screen.dark` does not redefine `--knock` (it stays `#ffffff`), so knock-out glyphs (`clock.fill`, `person.crop.circle.fill`,
  `xmark.circle.fill` …) render as solid white discs in dark mode wherever the glyph itself is white — e.g. the Phone tab bar.
  Suggest `--knock` = the surface colour per context (or `#000` in dark). Phone works around it locally in css/apps/phone.css.

## From Maps / Find My / Safari / Swift Ride / Lotus Eats / Wallet
No core changes required; FYI for other app owners and scene authors.
- **Shared APIs.** `JC.mapview` (js/apps/mapview.js): `create(el, opts)` interactive map, `thumb(place|[x,y], opts)` static
  map image, `place(id)`, `route(a, b, 'drive'|'walk')`, `fare(route, tier)`, `hoursInfo(place)`, `fromUser(place)`,
  `callPlace(id)` (businesses in `JC.callui.BIZ` ring through the real call screen; contacts via `JC.story.dial(cid, {num})`),
  `fakeCall({...})` for in-world calls. `JC.wallet` (js/apps/wallet.js): `pay({ merchant, amount, card })` → Promise
  `{ ok, card }` (Wallet Pay sheet: Face ID fails for the stranger → passcode), `charge()/refund()` record a `tx` and send
  the 95588 SMS for card 4417, `balance('cash'|'metro')`. `JC.web` (safari-pages.js) is the fake web; `JC.lotusEatsData`.
- **Story acts emitted** (beyond DEV.md): `findmy_share/findmy_unshare/findmy_ask {id}`, `safari_clear`, `safari_private`,
  `ymj_locked`, `web_comment {url}`, `wallet_view {id}` (hotel/gala/sandu/petk), `wallet_tx {id}`. `ride_report_lost` fires
  only for a *found-item* report on tonight's ride (`{ kind:'found', item, ride:'ride_tonight', no:'SR-1016-2347' }`) so it
  matches the `swift_report` scene text; `order {rest, total, to}` fires on every Lotus Eats order.
- **Consistency for other owners:**
  - Settings › Wallet & Apple Pay lists “Yunmeng Commercial Bank Debit ••0716”. STORY facts make JC’s card **4417** (a credit
    card — the bank e-Statement in Mail has a statement balance). Wallet shows 4417 (Credit) and keeps ••0716 only as an
    expired card under Add › Previous Cards. Suggest Settings show “Yunmeng Commercial Bank · Credit ••4417”. (YMJ Corporate
    ••1992 matches.)
  - Mail’s Pet Kingdom receipt is dated **Sun 11 Oct 14:22**; STORY.md says the p_receipt purchase was **Sat 10 Oct 18:42**
    (¥801.80, card 4417). Wallet follows STORY.md.
  - Mail’s `swiftride://lost` link opens Swift Ride with `{}`; Swift supports `{ report: true }` (jumps straight to Report a
    Lost Item for tonight’s ride). `https://swiftride.app/rate/…` and `https://lotuseats.app/r/<id>` now resolve in Safari.
  - Map place phone numbers now match STORY.md (Golden Peony +86 555 0880 1808, Pet Kingdom +86 555 0601 3300,
    Lanling International +86 555 0418 6600, Cloud Recesses Tea Shop +86 555 0512 2000, Koi Tower events +86 555 0518 0001).
- **Facts my apps introduce** (please merge into STORY.md “Facts added” if you agree — I did not edit it):
  - Swift Ride tonight: Master Wu Lihua’s car is a grey BYD Han EV; receipt SR-1016-2321 (Fare ¥58 + night ¥6, 6.8 km).
    Other past trips: Cloud Recesses → Gusu North Station, Tue 20 May 2025 15:08, ¥86 Comfort (“Left before the toasts.”);
    Guanyin Temple → Lotus Pier Residence, Fri 21 Jun 2024 23:44, ¥92; Laoma Hotpot → Cloud Recesses Guesthouse,
    Sat 13 Apr 2024 22:46, ¥58.
  - Wallet Cash ¥1,288.00: JC sent Wei Wuxian ¥5,200 “For the wedding.” (20 May 2025 15:02); WWX sent ¥5.20 “thank u for
    the soup that u definitely didn’t send 🍲” (10 Dec 2024); Nie Huaisang sent ¥88 “for the hotpot hehe~ 🙈” (14 Apr 2024);
    JC sent A-Ling ¥200 “Learner permit. Don’t crash anything.” (28 Aug 2026).
  - Card 4417 also shows Silver Lotus Jewelers ¥680 “restoration & polish · antique silver bell” (28 Sep 2026), Thursday’s
    drive (Petro Yunmeng ¥486, expressway toll ¥95), rail Yunmeng → Lanling South (23 Sep, 8 Oct) and the Lanling Motors
    deposit/refund on Jin Ling’s ···· 7781. Statement balance ¥38,214.60, due 25 Oct (auto-pay), per the e-Statement mail.
  - Sandu car key: parked Fri 18:41 at the Koi Tower car park; unlocked with the spare key at 23:52; “No Signal” from 23:58
    once `car_known`. Golden Peony: Peony Suite, ¥1,200/night, check-out Sun 18 Oct 12:00. Pet Kingdom Platinum Paw member
    since Oct 2018 (18,240 points). Lanling Metro card balance ¥86.40.
  - Lotus Eats: the 2024 soup was the Large pot (¥148 + fees + ¥8 tip = ¥168, rider Lan Qiu); Grandma Qin’s order ¥136 (4417);
    Night Owl Congee ¥75 and the 38 milk teas ¥878 went on the YMJ card ••1992; Pet Kingdom treats to Koi Tower Residences
    on 18 Oct 2024 (“For Fairy. Do not give to A-Ling.”). The Yiling Radish Co. pop-up runs Sat–Sun from 18:00 at Lanling
    Night Market — closed tonight because WWX is at the gala.
