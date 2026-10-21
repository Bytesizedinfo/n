# Sunday at Lotus Pier: Writer B (Jin Ling, the birthday group, Ops, Nie Huaisang, commerce reactions)

Files: `js/story-sunday/scenes/jinling.js`, `ops.js`, `nhs.js`, `react-commerce.js`.
None of these files ends the game. Each old `{ ending }` is now a set of flags plus a `start` of a consequence scene.
A consequence scene that belongs to writer C (`early_return`) is started through a small `goOn(id)` run step, which
only logs a console warning if the scene is missing.

Shared helpers (defined locally in each file):
- `TBL(s)` / `seat(s, k)` read `JC.sunday.table(s)`.
- `say(fn, {from})` is a message whose text is computed when it is sent, using a getter on `m`, as react-life.js does.
- The gate's `[Send him the guest list]` option uses a getter on `t` in the same way.
- `JC.sundayB.seatingPlan(s, title)` is exported in case the dinner wants Sizhui's plan.

## The storylines, as rewritten

### Jin Ling (`jl`)

**1. `jl_car`, Sandu in the koi pond (~00:03).**
- The scene is unchanged up to "calm".
- New beat `board`: "is this going to ruin sunday", because the Jin board already wants a "press moment" at Koi Tower. This sets up the scandal threat.
- The answers are:
  - "Sunday is at Lotus Pier. Nobody moves it."
  - "No more ponds."
  - If `car_cover` is set, a second chance: "Nobody will know it was you." Then "…Fine. Go and tell him it was you." clears `car_cover` before anything leaks.

**2. `jl_fairy`, Fairy needs a bed.**
- The branches are the same as before.
- After the manager, towel, or Sizhui's-car outcomes, Jin Ling adds: "if anyone says she has to stay in the garden i'm staying in the garden too". "She can come in." sets `fairy_inside`.
- "I'll come get her" and the bath/address branch both lead to `fairy_meet`.

**3. `fairy_meet`, Fairy's New Favorite.**
- He texts "who r u", then a time card covers the meeting and ends with him holding out his hand.
- It sets `jl_knows`, `told_truth`, `returned_early`, `returned_how:'fairy'` and `fairy_taken`, plus `fairy_where`: `'gate'` if you went to him, `'home'` if he came to Jinxing Road.
- Then it starts `early_return` (C), which continues with "He takes the phone…".

**4. `bday_plan`, the birthday group (~00:50).**
- Order: cake → venue → gift → **box** → **Rule 3** → **seating plan** → `bday_oops`.
- Cake: lotus seed paste (`cake_ok`). Chocolate now really stays chocolate unless you correct it, so the table's `'chocolate'` cake is reachable.
- Venue:
  - "Lotus Pier" sets `venue_lp`.
  - "Koi Tower" sets **`party_moved`** (and `venue_kt`). The party goes to the Jin board and dinner at Lotus Pier comes after, which gives `jl` the seat state `late`.
  - "Let the birthday boy decide" makes Sizhui pick Lotus Pier.
- Gift: the bell sets `gift_bell`. The "watch" and "group gift" branches can still reach the bell.
- **Box (beat 10):** Sizhui asks what it will be wrapped in. "Purple velvet. Not gold." sets `bell_ready`. That is the answer in JC's Notes and Reminders. Gold or "the jeweller's box" leave it unset. If `bell_ready` is already set, he just says so.
- **Rule 3 ("fairy stays OUTSIDE"):** "Fairy comes in" sets `fairy_inside`. If `fairy_inside` or `dog_friday` is already set, Wei Wuxian protests and Lan Wangji "will sit between you and the dog".
- **Seating plan (beat 9):** this step sets `bday_planned`. Then Sizhui posts "Seating plan for Sunday (draft 1)", built from `JC.sunday.table(s)`:
  - Jin Ling, late or not.
  - Wei Wuxian and Lan Wangji, with the soup in the middle.
  - Zewu-jun, at dinner or with tea after.
  - Wen Ning, inside, or "waiting in the van".
  - Nie Huaisang.
  - The kids.
  - Fairy, under the table or in the garden.
  - "one bowl at the end, for his mother".

**5. `bday_oops`:** unchanged.

**6. `jl_soft` (after the oops; beat 7).**
- If `party_moved`: "it's at koi tower?? … i always want lotus pier". "Then it's at Lotus Pier." clears `party_moved` and sets `venue_lp`.
- Then "is wei wuxian coming. like REALLY coming":
  - If `burned` is set: the dead-radish post, and "I'll fix it."
  - If he's invited: "mom's soup? … the jingshi smoke alarm went off four times".
    - If `told_recipe`: "u TOLD him??".
    - Otherwise you can tell Jin Ling "Two hours. Low fire. Don't rush it." This sets **`jl_recipe`**.
  - If `ops_keep`: "20 kilos … 'SUNDAY — DO NOT TOUCH'".
  - Otherwise: "Do you want him to?", which sets `jl_wants_wwx`.

**7. `bday_seats` (~01:25, new).**
- Requires `bday_planned`.
- Sizhui posts "draft 2", the table as it stands now.
- If Wen Ning is only driving: "I'll wait in the van" / "WEN NING NO".
- If Nie Huaisang isn't settled yet: "Sizhui… I am not on it 😭". "You're on the list. Post nothing." sets **`nhs_ally`**.

**8. `jl_score`, the beeps (`polite`), and `jl_night` (~01:40).**
- `jl_night` mentions the board (scandal unfixed: "koi tower, sunday, 5 pm, press"; fixed: "the valet followed me").
- It also mentions Fairy coming inside and Wei Wuxian coming.
- New goodbye: "Six-thirty Sunday. Don't be late."

### Ops (`ops`) and Old Huang (`huang`)

**`ops_lotus`.**
- New option: "Keep twenty kilos for Sunday. The best ones." This sets **`ops_keep`** and +1 morale (beat 5).
- After "Make soup", Old Huang asks "Sunday young master birthday. Keep some?", so you can pick both soup and keep.
- Tang Mei sees the **Honghu invoice (¥4,800 for 400 kg)**: "twenty kilos go under 'Family'. The rest go under 'A-Bai'."
- If Wei Wuxian is invited: "He makes the soup? Then he need Good Root. (… I put in a fire blanket also.)"

**`ops_dogfriday`:** approving (all dogs, or only Fairy) adds Old Huang's "So Sunday Fairy come Inside also?" plus a hint. The table already counts `dog_friday`.

**`ops_tow`:** sets `car_handled`, with a log and a hint. If `car_cover` is set and nothing has leaked yet, Huang Er saw the sad valet. This is a nudge.

**`huang_gate` (new, ~01:10; beat 6).** Old Huang asks for Sunday's guest list for the guardhouse board. Choices:
- **"[Send him the guest list]"**: the text you send is whoever is coming, as of now, from the table. Example: "A-Ling. Sizhui and Jingyi. Wei Wuxian and Lan Wangji. Wen Ning. Lan Xichen. Fairy comes in. Nobody else." This sets `huang_list`. He answers person by person:
  - Mr. Wei: "This time I open the gate before he knock". This also sets `huang_wwx`.
  - Wen Ning's parking.
  - Zewu-jun ("I iron my shirt").
  - Mr. Nie's fans.
  - Fairy ("I roll up the good carpet").
  - The SUNDAY box.
- "And if Wei Wuxian comes to the gate, let him in. Not like last time." This answers the 2024 gate, when nobody told Wei Wuxian "next time, let him in". It sets `huang_list` and `huang_wwx`, and is offered only when Wei Wuxian isn't a yes and isn't `burned`.
- "Nobody gets in without asking me." No list.
- The scene can start early from `r_eats_lp` or `r_fm_huang`.

**`ops_goodnight`:** adds minutes lines for the 20 kg and for the press inquiry.

### Nie Huaisang (`nhs`, `alumni`)

- Once `nhs_knows` is set, his gossip scenes (`nhs_balcony`, `nhs_quiz`, `nhs_post`, `nhs_tea_knows`) stand down.
- **`alumni_gossip`:** Mianmian's DM adds Tangtang's six-legged-dog card, "if Old Huang lets me in".
- **`nhs_post` (beat 8):**
  - After #BalconyGate part two he adds: "The Jin board reads that account … Treasurer Jin Zixun … A-Ling's 18th should be at Koi Tower. With press."
  - "Take it down, Huaisang. It's his birthday." makes him delete the post and ask "Am I… a 'few friends'?". "Six-thirty. Bring a fan. Post nothing." sets **`nhs_ally`**.
- **`koigate_leak`:**
  - Fires 200 s after `car_cover`, if `car_cover` is still set.
  - Posts #KoiPondGate and sets `scandal`, `scandal_kind:'koi'`.
  - Then it starts `scandal_breaks`, or `scandal_again` if there was already a scandal.
- **`caught_nhs`:** fires at suspicion ≥ 8, while he is still gossiping. It cancels his other scenes, accuses you, sets `nhs_knows`, and starts `nhs_bargain`.

## Consequence scenes (mine)

**`nhs_bargain`.**
- It works on its own, e.g. from `JC.sunday.consequence('busted')` after a confession. In that case it opens with "So you're NOT Brother Jiang 👀".
- He wants the Zewu-jun screenshots "for research". Your answers:
  - **Kindly.** "No. That's his. Not mine to give." Then "His nephew turns eighteen on Sunday. Don't ruin it for him." Then "I'll tell him you kept quiet" or "…you asked". This sets **`nhs_ally`**: no more posts tonight, and he asks about Sunday.
  - "He likes Lan Xichen. Obviously." or "No.": he keeps the secret, with no flag.
  - The threat about @teaspiller_qh: "mutually assured destruction". No flag; it logs.
  - **Badly.** You send him the balcony photo and the thread, or tell him "Get lost.". He posts `post_balconygate3` ("THE RECEIPTS"), which sets **`nhs_leak`**, `scandal`, `scandal_kind:'balcony'`, and starts `scandal_breaks`, or `scandal_again` if there was already a scandal.
- It always ends with `nhs_done`, so the night can settle.

**`scandal_breaks`.**
- **koi (Jin Ling):** "#KOIPONDGATE IS TRENDING", plus Nie Huaisang, Wei Wuxian (unless `burned`) and Tang Mei ("No comment" by 07:00). Then "the board just emailed me … they're moving my birthday". Choices:
  - "Go and find the valet. Tell him it was you. Then tell everyone." He apologises to Uncle Gao and posts under his own name (`post_jl_valet`). This sets **`scandal_fixed`**, clears `car_cover`, and adds aff +1. Hint: "The Jin board backed down."
  - "I'll deal with the board in the morning." The scandal is left for the Saturday call.
  - "Let them. It's one dinner." Aff −1: "i'll come to lotus pier after. for cake".
- **balcony (Tang Mei, then Jin Ling):** "The Jin board treasurer has called me twice … Koi Tower, 'where the press can be managed'". Choices:
  - "Tell the board Lotus Pier has a gate, and Old Huang." Old Huang: "I close the lake road. I have a stick." This sets **`scandal_fixed`**.
  - "No comment until the morning."
  - "Let them have it." Aff −1.
- **`scandal_again`:** a second hashtag after the first. Tang Mei holds the line. It sets `scandal_fixed:false` and `scandal_two`.

**Handed to writer C:** Fairy's New Favorite and the Golden Peony front desk both start `early_return`. See "Commerce" below.

## Commerce reactions (`react-commerce.js`)

**Lotus Eats.**
- To the Jingshi: the soup scenes are kept. They set `wwx_thanked`, and `wwx_invited` on "Six-thirty. Bring her pot.", as before.
- To the Ops floor: +1 morale, once (shared with money sent to Ops).
- To A-Ling: pets, cake and dinner give aff +1 once. **New:** a lotus seed cake (Peony Bakery `pb2`, "Lotus mousse") sets **`cake_ok`**. He saves it for Sunday.
- **To Lotus Pier (`lp`):** Old Huang signs for it. If it is lotus root, he keeps twenty kilos of the 400 for Sunday (**`ops_keep`**). Then he asks for the guest list (`huang_gate`).

**Swift Ride.**
- **Golden Peony front desk:** sets `told_truth`, `returned_early`, `returned_how:'desk'` (and `phone_at_desk`), then starts `early_return`.
- **Swift Pet to or from Koi Tower, and Find My shared with A-Ling, while Fairy needs a bed:** start `fairy_meet`. Same consequence as above, with `fairy_where` `'gate'` or `'home'`.
- **New, `r_ride_sunday_wwx`:** a reservation from Gusu to Lotus Pier on Sunday 10:00–19:00. "is this a yes". "It's a car. Get in it." sets `wwx_invited`. If he is already invited: "the soup gets its own seat".
- **New, `r_ride_sunday_jl`:** a reservation from Lanling to Lotus Pier on Sunday. If the party was moved or the scandal is unfixed: "over the BOARD'S HEAD??". This clears `party_moved` and sets `venue_lp`.
- The Gusu tea car is kept.

**Wallet.**
- Birthday money to A-Ling (1818 / 8888 / other): kept.
- **Money to Sizhui:** if Sunday isn't planned, he "takes it as a yes" and sets **`bday_planned`**, `cake_ok` and `venue_lp` (unless `party_moved`). Otherwise the money goes to the cake fund, and `cake_ok` if it wasn't set.

**Find My.**
- Sharing with Old Huang starts `huang_gate`.
- The rest is kept.

**Maps:** kept (`knows_hotel`, `knows_laoma`).

## Flags

**Set (table contract):**
- `bday_planned`, `cake_ok`, `gift_bell`, `bell_ready`, `venue_lp`
- `dog_friday`, `fairy_inside`, `fairy_taken`
- `ops_keep`, `ops_soup`, `ops_morale` (inc)
- `huang_list`
- `car_handled` (Ops tow; A's tow also sets it), `car_cover`
- `scandal`, `scandal_kind`, `scandal_fixed`
- `nhs_ally`, `nhs_leak`, `nhs_knows`, `jl_knows`
- `party_moved`: venue Koi Tower. Cleared by `jl_soft` and by `r_ride_sunday_jl`.
- In the consequences: `told_truth`, `returned_early`, `returned_how`.
- From commerce, as before: `wwx_invited`, `wwx_thanked`.

**New:**
- `huang_wwx`: Old Huang will open the gate for Wei Wuxian.
- `jl_recipe`: Jin Ling has the recipe.
- `fairy_where`: `'gate'` / `'home'`.
- `venue_kt`
- `scandal_two`
- `r_cake_seed`, `r_lp_root`: payload memos.
- Existing: `car_known`, `tow_huang`, `wn_asked`, `fairy_ok`, `jl_wants_wwx`, `jl_added_oops`, `ops_who`, `bai_fired`, `nhs_spilled`, `nhs_quiz_ok`, `jl_done`, `ops_done`, `nhs_done`, `busy_*`.

**Read from others:**
- `wwx_invited`, `burned`, `burned_mended`, `told_recipe`, `tea_yes`
- `wn_towed`, `wn_declined` (via the table), `dog_friday_mail`
- `night_done`
- `JC.sunday.table(s).seats.*`

## FINALE notes for writer C (what my flags should change at the table)

- **The gate (Old Huang):**
  - With `huang_list`, he has the names on the guardhouse board in big letters and greets each guest by name.
  - With `huang_wwx`, he opens before Wei Wuxian can knock, with tea and two eggs, which answers 29 Jun 2024.
  - With neither, he asks every guest "Boss knows you?".
  - With `scandal_kind 'balcony'` + `scandal_fixed`: the lake road is closed, and he has a stick.
- **Fairy:**
  - `in` via `dog_friday`: she wears her Head of Morale badge (if `'fairy'`).
  - `fairy_inside`: Jin Ling's promise, or Rule 3 overruled. Wei Wuxian sits with Lan Wangji between him and the dog.
  - `fairy_taken`: she goes straight to the stranger.
  - `garden`: Jin Ling sits outside with her for ten minutes.
- **The cake:**
  - `cake_ok` gives lotus seed paste from Jin's Cakes (Sizhui).
  - If `r_cake_seed`, there is a second lotus mousse cake that Jin Ling saved in his fridge.
  - Chocolate (`bday_planned` without `cake_ok`): he stares at it "like it owes him money" (fountain incident).
- **The bell:**
  - `bell_ready` gives the purple velvet box. "He complained about the colour for one whole minute, then didn't take it off." (Sizhui's line.)
  - `unboxed`: the jeweller's box, or gold.
- **Lotus root:** `ops_keep` means the box marked SUNDAY in Old Huang's handwriting. Long ones, nine holes.
- **Nie Huaisang's fan:**
  - With `nhs_ally`, he brings the purple nine-petal Lotus Pier fan, and his phone stays "in his sleeve".
  - With `nhs_leak`, he isn't there, but @teaspiller_qh's post gets a 🙂 from @zewujun.
  - With `nhs_knows` + `nhs_ally`, he winks at the stranger, if the stranger is there.
- **A party that moved:**
  - `party_moved` (Koi Tower venue) or an unfixed scandal: Jin Ling arrives late in a tux from the Koi Tower press call, escaping for cake.
  - If the scandal was fixed, the valet ("Uncle Gao") follows him on Wavelet.
- **The soup:** `jl_recipe` means Jin Ling passed his mother's recipe to Wei Wuxian.
- **Sizhui's seating plan:** `JC.sundayB.seatingPlan(s, 'Seating plan (final):')` gives the plan text, if a card wants it.
- **Mianmian:** Tangtang's six-legged-dog card is left at the gate on Sunday morning.

## Facts added (for STORY.md, if the lead agrees)
- The Honghu Cooperative invoice for the 400 kg: ¥4,800. Old Huang's 20 kg box is labelled "SUNDAY" in his handwriting.
- The 60-year-old Koi Tower valet is "Uncle Gao". Jin Ling's apology post: "it was me. not the valet…".
- @teaspiller_qh's third post tonight is `post_balconygate3`, "#BalconyGate: THE RECEIPTS" (art `p_balcony_moon`). It appears only if Nie Huaisang leaks.
- Board Treasurer Jin Zixun is the one pushing for a Koi Tower "press moment" on Sunday.

## Requests
- **C (`finale.js`, `early_return` `fairy`):** your card has Jin Ling "in your doorway" and Fairy "on your sofa". That holds for `fairy_where 'home'` (Swift Pet from, Find My, the address branch). For `fairy_where 'gate'` (you went to the Koi Tower east gate), it should happen at the gate. My card ends with him holding out his hand and leaves the invitation to you.
- **C (`react-life.js`):** please set `bell_ready` in `r_rem_bell` when `a_box` is ticked, and `ops_keep` in `r_rem_lotus` (Old Huang brings lotus root). Each gives a second app route.
- **C (Saturday call):** when JC fixes the scandal or "moves it back", also clear `party_moved` (I set it for the Koi Tower venue).
- **C (`night_end`):** `jl_done` is set only in `jl_night` (~1720 s), and `ops_done` in `ops_goodnight` (~1880 s). `nhs_done` is set by `nhs_post` or `nhs_bargain`.
- **A:** `jl_recipe` (Jin Ling now knows "two hours, low fire") could feed `wwx_practice`, e.g. "a-ling just texted me 'two hours low fire' at 1am. where did HE get that". It could also count as `soup_practiced`.
- **Lead (`tools/storytest.js`):** the "manual trigger but never started" check can't see `goOn` / `goTo` run steps, so `early_return` may warn.
