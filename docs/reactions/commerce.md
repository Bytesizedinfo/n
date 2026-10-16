# App reactions — commerce & getting around

Lotus Eats · Swift Ride · Wallet · Maps · Find My. Scenes: `js/story/scenes/react-commerce.js` (76 scenes, all
`polite: true`, ids `r_…`). Facts: docs/STORY.md. Engine conventions: docs/DEV.md "App reactions".

**How these reactions behave**
- Reactions in the busy-lock threads (`wwx`, `jl`, `lxc`, `nhs`, `ops`) wait for `busy_<thread>` to clear and hold
  it while they talk, like the main scenes do (`waitFor` / `lock` / `free`). Each choice has a timeout, so an
  ignored question can't hold the thread all night.
- All reactions are **night-only** (`match` checks `!night_done`, so a morning act doesn't use them up). The
  exceptions are the Golden Peony front desk, the Gusu reservation, and the flag-only scenes for Maps, Wallet and
  dinner on his card.
- **Logs.** The apps log the action itself, because they know the details: dish, amount, destination
  (`Sent Jin Ling ¥1,818.00 from his Wallet Cash`, `Called a Swift Pet to Koi Tower on his Swift account (¥104)`).
  The scenes log story outcomes (`Told Wei Wuxian the soup was from him. Both times.`) and the actions apps don't
  log (Maps, the front desk). Every log has a `once` key.
- **Balance.** Affection from this file is capped at wwx +2 (the soup), jl +1 (a shared `jl_treated` gate for food
  and money), and lxc +2 (Find My share +1, ask to follow +1). `ops_morale` gets +1 at most (a shared `ops_treated`
  gate for food and money). Suspicion bumps are +1 or +2. In the test run, every app action at once added up to 5
  suspicion with Nie Huaisang and about 13 in total.

## New acts

| act | payload | emitted by |
|---|---|---|
| `order` (payload extended) | `{ rest, total, to, id, items:[item ids], names:[item names], qty, anon, note, sched, card }` | Lotus Eats `placeOrder` (also when an order is scheduled) |
| `order_delivered` | `{ id, rest, to }` | Lotus Eats: the live order reaches "Delivered". No reaction uses it yet; it's there for others. |
| `ride_book` | `{ tier, from, to, price, reserve?, at?, id? }` | Swift Ride: a driver is assigned (immediate ride), or a reservation is made (`reserve: true`, `at` = pickup ms, `id`) |
| `ride_arrive` | `{ id, tier, from, to }` | Swift Ride `finishTrip` |
| `ride_cancel` | `{ id, tier, from, to, reserve: true, at }` | Swift Ride › Activity › Reserved › Cancel Reservation |
| `phone_dropoff` | `{ place: 'golden-peony', leave }` | Swift Ride: the arrival sheet at the Golden Peony (`leave` true = "Leave It at the Front Desk"; false = "Not Yet" or swiped away) |
| `wallet_send` | `{ to, amount, note, card, tx }` | Wallet › Cash › Send (after Pay succeeds) |
| `findmy_share` / `findmy_unshare` / `findmy_ask` | `{ to, dur }` / `{ to }` / `{ to }` | Find My (these already existed; they now also log) |

Place ids: Swift `from`/`to` are map place ids (`player-home`, `golden-peony`, `koi-tower`, `koi-residences`,
`cloud-recesses`, …). Lotus Eats `to` is an address id (`here`, `gp`, `koires`, `lp`, `ymj`, `wh`, `jingshi`, or a
custom `a_…`).

## Reactions

### Lotus Eats (`order`)
| scene | trigger | effect |
|---|---|---|
| `r_eats_soup_anon` / `r_eats_soup_named` | `to: jingshi` and the lotus root & pork rib soup (`al1`/`lr1`), sent anonymously (gift toggle or the "Don't say who it's from." note) or with his name | **WWX** (25 s, after Lotus Eats texts him about a gift arriving in the morning; Auntie Lu's is closed at night): Dec 2024, the flu, *"it was u in 2024 too wasn't it"*. **"It was me. Both times."** → `wwx_thanked`, `soup_owned`, aff wwx +2, log, hint *"Wei Wuxian will remember that."*, the realisation that the 2024 soup was JC's wordless thank-you for the liver, and **Lan Wangji** (`lwj`): *"He is crying. It is the good kind."* If he isn't invited yet: *"can i bring it home. the real one. in her pot"* → "Six-thirty. Bring her pot." sets `wwx_invited` (no extra aff) → **Lotus Pier, Reunited** is now reachable without the memo. **"I don't know what you're talking about."** → aff wwx +1, log (the named variant: *"ur NAME is on it"*). Sets `soup_sent`. Skipped if `burned`. |
| `r_eats_radish` | from `yiling-popup` (WWX's own pop-up, closed tonight) | WWX as the vendor: *"customer: jiang cheng"*, *"u have NEVER bought a radish"*. sus wwx +1 |
| `r_eats_jingshi` | `to: jingshi`, not the soup | WWX: *"at this hour. who does that / …i know who does that"*; Lan Wangji checks the smoke alarm |
| `r_eats_ops_root` / `r_eats_ops` | `to: ymj` or `wh`. The `_root` variant is for any lotus-root item. | **Ops group**: Old Huang, Liu Qian's bullets, A-Bai, Tang Mei; the lotus-root variant gets *"We have 400 KG of Lotus Root. 👍👍"*. `ops_morale` +1 once (gate `ops_treated`, shared with money to Ops), hint *"The Ops team will remember that."* Only one of the two variants plays. |
| `r_eats_jl_pets` | `to: koires`, from Pet Kingdom | **Jin Ling**: *"u ordered fairy stuff at this hour??"*. aff jl +1 once (gate `jl_treated`) |
| `r_eats_jl_cake` | `to: koires`, from Peony Bakery or any cake | Jin Ling: *"is this a hint about sunday"* (if the bday group has planned: *"why are there TWO cakes"*) → "It's not for Sunday." / "Act surprised." Same aff gate. |
| `r_eats_jl_food` | `to: koires`, anything else | Jin Ling: *"the gala food was all foam"*. The Grandma Qin's variant: *"if the note says eat the vegetables…"* (the `r_qin` flag is set by `r_eats_jl_qin_flag`). Same aff gate. |
| `r_eats_gp` | `to: gp`, delivered now | Lotus Eats SMS (`eats`) from the rider: the guest in Room 1808 opened the door in a bathrobe, asked who sent it, said *"Tch."* and took it in. `fed_jc: true` |
| `r_eats_gp_later` | `to: gp`, scheduled | `fed_jc: 'later'` (breakfast arrives at his door) |
| `r_eats_here` | `to: here`, under ¥400 on his personal card | `ate_on_card` (the app logs *"Bought yourself … on his card (¥…)"*) |
| `r_eats_here_lavish` | `to: here`, ≥ ¥400 or on the YMJ corporate card | **Tang Mei** (the Lotus Eats spending alert she set after the 38 milk teas): *"Who lives at 27 Jinxing Road?"*. sus ea +2, hint *"Tang Mei noticed."* → "Expense it." / "A friend." (+1 more: *"You have four friends. I have all of their addresses."*). `ate_on_card` |
| `r_eats_lp` | `to: lp` | **Old Huang** (DM): he signed for it at the Residence gate; if Boss isn't home by tomorrow, he eats it. `huang_fridge` |

### Swift Ride
| scene | trigger | effect |
|---|---|---|
| `r_ride_desk` | `phone_dropoff` with `leave: true` (arrival sheet at the Golden Peony) | `phone_at_desk`, `knows_hotel`, log *"Took the phone back to the Golden Peony yourself"*, then a time-skip card (Mr. Liang takes the purple phone in both hands, writes "Room 1808" on an envelope, does not ask your name) → **ending `honest`**. Works at any time. |
| `r_ride_desk_not_yet` | `phone_dropoff` with `leave: false` | `knows_hotel`, log *"Rode all the way to the Golden Peony with his phone, and didn't go in"* |
| `r_ride_pet_fairy_to` | `ride_arrive`, Swift Pet **to** Koi Tower (`koi-tower`, `koi-residences`, `koi-pond`, `koi-cafe`) while Fairy still needs a bed | Settles Jin Ling's open "can she stay with u tonight" question, `fairy_taken`, log, hint, Jin Ling: *"is that a swift PET pulling up at the east gate… jiujiu did u come URSELF??"* → starts `fairy_meet` → **Fairy's New Favorite** |
| `r_ride_pet_fairy_from` | `ride_book`, Swift Pet **from** Koi Tower (sending her a car), same condition, 14 s (the driver's approach) | Same as above; Jin Ling: *"u sent fairy a CAR??… i'm coming too"* → `fairy_meet` |
| `r_ride_pet_odd_to` / `_from` | a Swift Pet at Koi Tower when Fairy doesn't need one (not asked yet, or `fairy_ok`) | Jin Ling: *"why is a swift PET car outside koi tower with ur name on it"*. sus jl +1 |
| `r_ride_gusu` | `ride_book` reservation to any Gusu place, pickup Sat 17 Oct 06:00–16:00 | `ride_gusu`. Log by situation: with `tea_yes`, *"Booked him a car to Cloud Recesses, in time for tea at three"* (and if Tang Mei has already texted about tea, *"Swift Ride just copied me… Grey coat."*, or she cancels her 12:30 car); after "I'm busy tomorrow", *"Told Zewu-jun he was busy tomorrow, then booked a car to Gusu…"*; otherwise *"…in case anyone asked him to tea"* |
| `r_ride_gusu_cancel` | `ride_cancel` of that reservation | `ride_gusu: false`, log |

**Fairy: only one way plays.** The three Fairy paths (Swift Pet to Koi Tower, Swift Pet from it, Find My share)
each check `fairyNeeds` and the other two scene ids in `when`. `fairyNeeds` means: night, no `fairy_ok` and no
`fairy_taken`, `fairy_meet` not started, and Jin Ling has sent *"can she stay with u tonight"*. Retiring
`jl_fairy`'s open question goes through the `run` escape hatch (see "Requests" below).

### Wallet (`wallet_send`)
The app posts the payment bubble into the contact's thread itself, via `JC.story.incoming` as `me`, so the
engine's generic "?" reply doesn't fire. The reaction answers instead (12–25 s later). Each contact's first
transfer gets one of their variants; the second gets a one-line `r_pay2_<cid>`.

| contact | scenes | effect |
|---|---|---|
| Jin Ling | `r_pay_jl_18` (18.18 / 181.8 / 1818), `r_pay_jl_88` (8.88 … 8888), `r_pay_jl` | *"18 on the 18th. that's SO corny"*, *"that's my NEW YEAR amount"*, or *"is this a bribe so i don't tell wei wuxian about the balcony"* (if Sandu is still in the pond: *"is this for the TOW??"*). aff jl +1 once (shared `jl_treated` gate with food), hint |
| Wei Wuxian | `r_pay_wwx_520` (5.2 / 52 / 520 / 5200), `r_pay_wwx` | 520: *"it means I LOVE YOU… u sent me 5200 for the wedding… was that an accident"*, sus +1. Other amounts: *"why did u send me money… are u dying"* (if invited: *"ur paying for shijie's soup?? that's illegal"*), sus +2, hint *"Wei Wuxian noticed."* |
| Wen Ning | `r_pay_wn_tow` (towed, > ¥50), `r_pay_wn_petrol` (towed, ≤ ¥50), `r_pay_wn` (not towed) | *"It was only a rope… I kept ¥50 for petrol. Because you'd be angry if I sent all of it back."* → `JC.wallet.sendBack('wn', { keep: 50 })`, `wn_paid`. ≤ ¥50: he keeps it for petrol (and a towel: Fairy was in the van). Not towed: *"I think you sent this to the wrong person"*, sends it back, sus wn +1 |
| Old Huang / Liu Qian / A-Bai | `r_pay_huang` (DM voice message, then the Ops group: *"boss can i also be old huang 🙇"*), `r_pay_liu` (logged as the canteen soup fund or the Dog Friday fund), `r_pay_bai` (*"is this my severance 🙇"* if fired) | `ops_morale` +1 **only if** food for the Ops floor hasn't already given it (shared `ops_treated` gate), hint |
| Tang Mei | `r_pay_ea` | *"Is this a bonus, or hush money?"* sus ea +1 |
| Nie Huaisang | `r_pay_nhs_88` (88: *"Like my hotpot money!!… Brother Jiang has never paid anyone BACK"*), `r_pay_nhs` (*"Is this HUSH MONEY?? 👀"*) | sus nhs +2, hint *"Nie Huaisang noticed."* |
| Lan Xichen | `r_pay_lxc` | *"I think this was meant for someone else. I've sent it back. 🙂"* (with `tea_yes`: *"Guests don't pay at the Hanshi."*). Sends it back, sus lxc +1 |
| Lan Wangji | `r_pay_lwj` | *"Why."* … *"Returned."* Sends it back, sus +1 |
| Sizhui / Jingyi / Mianmian | `r_pay_sz` (the cake fund), `r_pay_jy` (*"i'll do it… balloons"*, sus +1), `r_pay_mian` (refuses to let JC pay her bet with Huaisang, sends it back, sus +1) | |

### Find My
| scene | trigger | effect |
|---|---|---|
| `r_fm_jl_fairy` | `findmy_share` to A-Ling while Fairy needs a bed | Settles his question, `fairy_taken`, `loc_shared`, log, hint. Jin Ling: *"jinxing road?? that's not the golden peony… sizhui's driving us. omw"* → `fairy_meet` → **Fairy's New Favorite** |
| `r_fm_jl` | `findmy_share` to A-Ling otherwise | *"u NEVER share… why r u in jinxing. the golden peony is on riverside"*. sus jl +2, hint |
| `r_fm_wwx` | share with Wei Wuxian | *"he shared back"* … *"why is the little purple dot on jinxing road"*. sus wwx +1, hint → "I'm fine. Go to sleep." / "Walking." |
| `r_fm_nhs` | share with Nie Huaisang | Delighted: *"Whose house is it?? 👀👀… (I'm telling Mianmian)"*. sus nhs +2, hint, `loc_nhs` |
| `r_fm_lxc` | share with Lan Xichen | *"I'll take good care of it. 🙂… Jinxing Road."* aff lxc +1, sus lxc +1, hint |
| `r_fm_huang`, `r_fm_wn`, `r_fm_ea` | share with Old Huang / Wen Ning / Tang Mei (after unsharing) | Old Huang's umbrella voice message; Wen Ning *"I won't look. (I looked. Sorry.)"* sus wn +1; Tang Mei *"Location sharing resumed. Noted."* |
| `r_fm_unshare_ea` (sus +1), `r_fm_unshare_wwx`, `r_fm_unshare_nhs`, `r_fm_unshare_jl` | `findmy_unshare` (the last three only after the matching share reaction) | Tang Mei *"I will assume you are alive until Monday at nine."*; WWX *"the little dot is gone :("*; NHS *"I took a screenshot 👀 (Of a map.)"*; Jin Ling *"weirdo"* |
| `r_fm_ask_lxc` | `findmy_ask` Lan Xichen | Accepts (`JC.findmy.answer`): *"I'm not a very interesting dot. 🙂"* (with `tea_yes`: *"Tomorrow at three, I hope it will say the same place as yours."*). aff lxc +1, sus +1, hint. He then appears in Find My › People at the Hanshi. |
| `r_fm_ask_nhs` / `r_fm_ask_lwj` / `r_fm_ask_wn` | `findmy_ask` | NHS declines (*"A chairman must remain mysterious 🪭"*, sus +1); LWJ *"Why."* then *"Accepted. I am where Wei Ying is."* (sus +1); Wen Ning accepts (Koi Tower car park, or the Golden Peony garage if he towed Sandu) |

### Maps (and the Wallet passes that give away the same facts)
| scene | trigger | effect |
|---|---|---|
| `r_maps_hotel` / `r_wallet_hotel` | `directions` to `golden-peony` / `wallet_view` of the `hotel` pass | `knows_hotel` + log |
| `r_maps_laoma` / `r_wallet_laoma` | `place_view` of `laoma-hotpot` (his Gusu guide says "Summer ’07 — after the exams. I paid.") / `wallet_tx` of `tx_laoma` | `knows_laoma` (the answer to Nie Huaisang's quiz) + one log (shared `once` key) |
| `r_maps_lp` | `directions` to `lotus-pier` / `lp-residence` | log *"Looked up the way to Lotus Pier, as if Sunday needed a map"* |
| `r_maps_gusu` | `directions` to Cloud Recesses, the Hanshi, the Jingshi, the tea shop or the guesthouse | log (with `tea_yes`: *"…for tea at three"*) |

## New flags
`soup_sent`, `soup_owned`, `ops_treated` (gate), `jl_treated` (gate), `r_qin`, `fed_jc` (`true` | `'later'`),
`ate_on_card`, `huang_fridge`, `phone_at_desk`, `knows_hotel`, `knows_laoma`, `ride_gusu`, `wn_paid`, `loc_shared`,
`loc_nhs`. Existing flags set from here: `wwx_thanked`, `wwx_invited`, `wwx_done`, `fairy_taken`, counter
`ops_morale`, and the `busy_*` locks.

## New UI
- **Wallet**
  - Cash › Send / Request opens an iOS-style sheet: a contact picker (search; main cast; the last transfer as the
    subtitle), then an amount keypad (¥ display, ¥20,000 limit, shake on bad input), a note field, Request and
    Send buttons, and the Cash balance.
  - Send goes through the existing Pay sheet. If Cash is too low, the card on file pays. The transaction lands in
    the Cash card's list, and the payment bubble is posted in Messages.
  - p2p transactions get a "Send Money to …" row.
  - Face ID now honours the alternate appearance from Settings › Face ID for Pay (it used to always fail).
  - `JC.wallet.sendBack(cid, { keep, note })` credits Cash when a contact returns a transfer, with a credit
    transaction and a notification.
- **Swift Ride**
  - The arrival sheet at the Golden Peony shows the lobby art, Room 1808, his iPhone in the purple case, and
    *"Leave the phone at the front desk for Room 1808?"* with **Leave It at the Front Desk** / **Not Yet**. If Swift
    isn't on screen when the ride arrives, a notification goes out and the sheet waits for the app to come forward.
  - Reservations are stored and listed under Activity › Reserved, where they can be cancelled. The confirmation
    alert now says the day and time.
- **Find My**
  - JC shares his location with **Tang Mei only** by default (`sharingWith: ['ea']`). He follows A-Ling; A-Ling
    can't follow him ("i know where u are. that's the point"). Before this change A-Ling could have seen the
    phone at Jinxing Road all night.
  - "Share My Location" now includes A-Ling.
  - People you've asked to follow are listed: waiting, not sharing, or (once accepted) with a location.
  - `JC.findmy.answer(cid, ok)`.
- **Lotus Eats**
  - Night Owl Congee (both branches) adds *Lotus root & pork rib congee* and *Osmanthus lotus root*, so lotus root
    can reach the Ops floor: only Yunmeng restaurants deliver to Yunmeng.

## FINALE: notes for the morning call / ending text
- **`phone_at_desk`** — the `honest` ending text has Tang Mei ring *your* doorbell at ten for the purple case.
  When the player left it at the Golden Peony, that paragraph should change, e.g.: *"At ten the next morning your
  own phone rings, a number you don't know. "Tang Mei," says a woman's voice. "Mr. Liang described you. Thank you.
  He won't say it, so I'm saying it now, and he can owe me.""* Jiang Cheng's epilogue could open: *"When Jiang
  Cheng got his phone back, it was in an envelope at the front desk, with "Room 1808" on it in very careful
  characters."*
- **`soup_owned`**: the call already says *"And you thanked him."* via `wwx_thanked`. It could add *"…You told
  him about the soup. Both times. He wasn't supposed to know about the first one."* For **`soup_sent`** without
  owning it: *"And there's a pot of Auntie Lu's going to the Jingshi at ten-thirty. …It's the right soup."*
- **`fed_jc`**: *"And somebody sent food to my room at one in the morning. From my account. …It was good."*
  For `'later'`: *"…and breakfast is coming to my room. From my own account."*
- **`ate_on_card`**: *"You ate on my card."* … *"Did you eat enough."* (his "Did you eat." habit)
- **`ride_gusu`** with `tea_yes`: *"And there's a car booked to Cloud Recesses."* … *"I'll take it."* (in `r_tea2`
  after *"I was going to go."*)
- **`loc_nhs`**: *"You shared my location with Nie Huaisang. He's going to ask about Jinxing Road for the rest of
  my life."*
- **`wn_paid`**: *"You paid Wen Ning for the tow. He kept fifty for petrol. …Good."*
- **`huang_fridge`**: *"Old Huang says thank you for whatever you sent the house. He ate it. That's the rule."*
- **`knows_hotel` without `phone_at_desk`**: optional *"You knew where I was. Six kilometres."*

## Requests for the lead (core / other scenes)
1. **`JC.story.cancel(sceneId)`** (end another scene's run and clear its open question). The three Fairy paths
   retire `jl_fairy`'s pending choice through a `run` step that splices `state.runs`, the same thing `finishRun`
   does. An engine call would be cleaner.
2. **docs/DEV.md**: add the new acts to both act tables: `order` (extended payload), `order_delivered`,
   `ride_book`, `ride_arrive`, `ride_cancel`, `phone_dropoff`, `wallet_send`.
3. **endings.js / finale.js**: the FINALE notes above, especially the `honest` text when `phone_at_desk`.
4. The `fairy` ending text sets the meeting at Koi Tower's east gate. That fits the Swift Pet *to* Koi Tower path.
   The Find My path and the pet car *from* Koi Tower bring Jin Ling to Jinxing Road instead, which is the same
   mismatch as jinling.js's existing "Jinxing Road 27" branch. A flag-based variant would fix all three.
5. **docs/STORY.md "Facts added"**, proposed:
   - JC shares his location only with Tang Mei. He follows A-Ling, who can't follow him back.
   - Tang Mei set a Lotus Eats spending alert after the 38 milk teas, and she reads the YMJ corporate card.
   - Night Owl Congee sells lotus root & pork rib congee.
   - Jiang Cheng has never bought anything from Yiling Radish Co.
   - The 2024 soup was sent six months after Guanyin Temple: his thank-you for the liver, unsigned.

## Testing
- `node tools/storytest.js 0`: 0 static errors. The warnings are the same 14 as before this file (the existing
  `bday_oops` / manual-scene warnings). `PAGE ERRORS: none`.
- Scratch Playwright test, 4 sessions: 67/67 checks pass, no console or page errors. Main scenes were marked done
  so the threads were free, `JC.story._ff` was on, and `eng` was fast-forwarded.
  - **Real UI:**
    - Lotus Eats: anonymous soup order to the Jingshi, through checkout, Pay and Face ID with the alternate
      appearance.
    - Wallet: ¥1,818 to A-Ling, and ¥300 to Wen Ning, which he sends back (Cash credited).
    - Find My: share with NHS, ask Lan Xichen to follow (he then shows at the Hanshi).
    - Swift: a Gusu reservation, which shows under Activity › Reserved; a ride to the Golden Peony ending in the
      arrival sheet (Not Yet); in another session, Leave It, which reaches the `honest` ending; a Swift Pet from
      Koi Tower during the Fairy question, which reaches the `fairy` ending.
  - **Via `JC.story.act`:** every other variant above, including the Find My Fairy path (`fairy` ending, and only
    one Fairy path ran) and both morale/affection gates.
  - **Screenshots** checked in light and dark: the Wallet send picker and amount keypad, the Swift arrival sheet,
    Activity › Reserved, Find My People.
