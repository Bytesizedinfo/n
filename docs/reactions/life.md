# App reactions — the "life" apps

Notes, Calendar, Reminders, Health, Voice Memos, Phone (voicemails), Contacts, Settings (Focus, Airplane Mode,
wallpaper) and Clock. Scenes: `js/story/scenes/react-life.js` (52 reactions, ids `r_*`). Facts: `docs/STORY.md`.

## How these reactions behave

- **Polite and turn-taking.** Every reaction is `polite`. Reactions that post several messages also wait until no main
  scene holds the thread (`busy_<thread>`), lock it while they talk, and free it afterwards. They give up at the end of
  the night (`night_done`). Their log lines are written first, so the ending card records the action even after the night.
- **Replies are offered only while the player is reading the thread.** Reactions with a question (the letter to Lan
  Xichen, Wei Wuxian's voicemail, the skipped dose, A-Ling's heart-rate tease) post their messages and then wait until the
  player has that thread open and nobody else holds it. Only then do they show their options, so a pending reaction never
  blocks a main scene in a thread the player isn't reading. A reply option sets `r_reply_<thread>` as soon as it is
  chosen, and the wait loops respect it, so a second waiting reaction can't cut in before the answer.
- **Affection cap.** All reactions together add at most **+2 affection per contact** (counted in `r_aff_<cid>`; a hint
  only shows when affection actually changed). In practice: Lan Xichen +1 (tea in the calendar) and +2 (the letter), capped
  at 2. Wei Wuxian +1 (the skipped dose) and +1 (the voicemail). A-Ling +1 (health sharing) and +1 ("It's hot in here.").
- Suspicion bumps are +1 to +2, only for things Jiang Cheng would never do.

## Reactions (trigger → effect)

### Notes: the locked "Private" note (`n_private`, "Xichen — / On the balcony you said")
| id | trigger | effect |
|---|---|---|
| `r_note_private` | `note_open` `n_private` | `xichen_draft_read`; log *Unlocked his note marked "Private"*. Then, the next time the player opens Lan Xichen's thread (at night, when the thread is free), two options appear: **"Xichen — … [Send the unfinished draft]"** (or **[Send the letter]** if the player finished it in Notes; the option sends the note's current text) and **[Leave it unsent]**. They are offered twice (timeout 90 s), then the letter counts as left unsent. **Send:** `xichen_draft_sent`, aff lxc +2 (capped), hint *Lan Xichen will remember that.*, log *Sent Lan Xichen the letter he never finished* / *Finished his letter to Lan Xichen and sent it*. Then Lan Xichen's reply, the high point of the arc: long typing, then "Wanyin." There is an unfinished version ("I can wait for the end of one sentence.") and a finished version ("I'd like to answer this properly, in person…"). The "Xichen" line changes if `lxc_first_name` is already set. An emoji in a finished letter gives sus lxc +1 and "I've decided Wei Wuxian borrowed your phone for that part." He hearts the letter. The goodnight line depends on `tea_yes`. **Leave:** `xichen_draft_kept`, log. |
| `r_note_shared` | `send` to `lxc` with draft-like text (Notes share sheet, "Send a Copy", or typed). Only fires if the letter wasn't sent yet and the in-thread offer isn't open. | Claims the message (no generic "?" reply, no suspicion) and has the same effects and reply as above. If he had to finish another conversation first (more than 15 s), he opens with "Forgive me. I've been reading the other thing you sent, over and over, while we talked." |
| `r_note_wwx` | `note_open` `n_wwx` ("Things I will not say to Wei Wuxian") | `wwx_list_read`, log |
| `r_note_del_private` / `r_note_del_wwx` | `note_delete` | `xichen_draft_deleted` / `wwx_list_deleted`, log ("(It said to.)") |

### Calendar
"Tea? — Hanshi" (`ev_tea_q`) is now **Lan Xichen's invitation**: he sent it after Wednesday's call so that Jiang Cheng
could say no without saying it to him, and Jiang Cheng answered "Maybe". Accepting or declining it there tells him.

| id | trigger | effect |
|---|---|---|
| `r_cal_tea_yes` | `event_add` `{id:'ev_tea_q', accepted}` | The title loses its "?" immediately. The reaction then waits until his own `lxc_home` conversation has finished (and the thread is free), or the night is over, so the invitation is never asked twice. If `tea_yes` is already set (accepted in Messages meanwhile), it only logs *Accepted tea at the Hanshi twice: once in Messages, once in the calendar* (no double count). Otherwise: `tea_yes`, `tea_cal`, aff lxc +1 (capped), hint, log, and at night Lan Xichen texts: "My calendar has just informed me, very formally, that Jiang Wanyin has accepted an invitation to tea." Then either "…so that you could say no without having to say it to me" or, if he had already asked in Messages (`lxc_invited`), "Earlier, I think, the answer was no. I'm very glad it changed its mind." In the morning: flags, hint and log only (the morning scene speaks for him). |
| `r_cal_tea_no` | `event_decline` `ev_tea_q` | Same wait. If tea isn't on: `tea_declined`, log, and he's gracious ("A no is kinder than a maybe that never ends…"). `tea_yes` is not set. |
| `r_cal_sunday` | new event (`isNew`) on Sunday 18 Oct, or titled A-Ling/birthday/dinner/soup/Lotus Pier | log *Put "…" in his calendar, for Sunday*; Tang Mei (she gets his calendar notifications): "I've kept the weekend of A-Ling's birthday clear every year since 2017. You've never asked why." |
| `r_cal_new` | any other new event | log; Tang Mei: "You added an event yourself. You haven't added an event yourself since 2019." sus ea +1 |
| `r_inv_wwx_yes` / `_maybe` / `_no` | inbox reply to Wei Wuxian's birthday radish harvest (`inv_wwx`) | Wei Wuxian ("HE PRESSED ACCEPT. ON PURPOSE", sus wwx +1 / "a maybe is a yes wearing a hat" / "ok rude"); log |
| `r_inv_nhs_yes` | `inv_nhs` accepted or maybe | Nie Huaisang ("I have a spreadsheet"), sus nhs +2; log |
| `r_inv_qr` | `inv_qr` reply | Lan Qiren, by the book; log |

### Reminders
The **A-Ling** list is shared with Sizhui, **Groceries** with Old Huang (he does the Lotus Pier market run) and **Work**
with Tang Mei. Those people see what gets ticked off. The **Reminders** list is private.

| id | trigger | effect |
|---|---|---|
| `r_rem_bell` | `reminder_done` `a_box` (new: "The bell — purple velvet box (not gold)") | Sizhui (DM): "Is it his mother's bell? … I won't tell anyone. Especially not Jingyi." If `gift_bell` is set: "…Then he isn't going to take it off. 😊". Log. |
| `r_rem_aling` | the first other A-Ling item | Sizhui, one line per item (e.g. *Do NOT let him drive Sandu*: "I'm not sure that one can be ticked off anymore."); log |
| `r_rem_lotus` | `g_lotus` | Old Huang, voice message: "We have FOUR HUNDRED KILO in the warehouse. I bring you two section. Free." 👍👍; log |
| `r_rem_soup` | `g_ribs`/`g_ginger`/`g_dates`/`g_goji`/`g_wine` | Old Huang: "Boss. This is Miss Yanli soup. … I tell nobody." 👍; log |
| `r_rem_groc` | the first other grocery | Old Huang (white peony: "Tang Mei say it is not for you."; dog treats: "For Miss Fairy."); log |
| `r_rem_work` | the first Work item | Tang Mei, one line per item (deck: "Slide 7 is fine."; Lan Qiren: "I can see your sent folder."); log |
| `r_rem_wwx` / `r_rem_huang` / `r_rem_tea` | private reminders | log only, worded by state ("…without actually replying" / "The answer was yes.") |

### Health
New fact: since **July 2024** (after Guanyin Temple) Jiang Cheng has shared **Medications only** with Wei Wuxian. Neither
of them has ever mentioned it, and Wei Wuxian checks it every night at 8:05. This is seeded as `hlprefs.wwxShare` and shows
in Health → Sharing.

| id | trigger | effect |
|---|---|---|
| `r_hl_jl` | `health_share` `{to:'jl', accept:true, topics}` | A-Ling: "u ACCEPTED??" then, with Heart Rate shared, "UR HEART RATE WAS 121 ON THE BALCONY 👀" / "22:50…" (without it: "u turned off heart rate?? … is it the balcony"). aff jl +1 (hint *A-Ling will remember that.*). When the player opens his thread: **"It's hot in here."** (the running joke; aff jl +1) / "Stop looking at my heart rate." / [Leave him on read]. Log. |
| `r_hl_nhs` | the same act with heart rate (after 140 s) | "A little fish tells me your heart rate was 121 at 22:50 hehe~ … EXACTLY the balcony 🪭"; sus nhs +1 |
| `r_hl_jl_no` | A-Ling's request declined | A-Ling: "ok. but SLEEP"; log |
| `r_hl_inv_<cid>` | `health_share` `{to, invite:true}` for lxc, wwx, ea, nhs, sz, wn, huang | One short in-character reply each. Lan Xichen: "I was standing next to you at 22:50." (sets `lxc_saw_121`). Suspicion: lxc +1, wwx +2, ea +1, nhs +2, sz +1, wn +1, Old Huang 0. Log. |
| `r_med_skip` | `med_log` skipped | Wei Wuxian (Health told him): "not nagging / ok a little bit nagging". There is a separate line if the dose isn't due yet ("u cant skip a pill in advance"). Options: **"I took it. I forgot to log it."** ("it's not sweet. it's maintenance", aff wwx +1) / "Stop checking my pills." (he reveals the July 2024 share) / [Leave him on read]. Log. |
| `r_med_ahead` | `med_log` taken, not yet due | "jiang cheng that's not how pills work"; sus wwx +1; options "I logged it wrong." / "Mind your own business." → "it's a little bit my business"; log |
| `r_med_late` | Friday's 20:00 dose logged as taken | "good. i wasn't going to ask / i was going to ask"; log |
| `r_hl_wwx_stop` / `r_hl_wwx_back` | medication sharing stopped / resumed (Health → Sharing) | "u turned off the pills thing / that's ok. it's ur liver / (it's ur liver)"; `wwx_meds_stopped`; logs |
| `r_hl_mood` | `mood_log` while A-Ling can see State of Mind | A-Ling. With a positive feeling: "u have logged ANNOYED 47 times this year", sus jl +1. Log. |

### Voice Memos ("Untitled 14")
Deleting the memo doesn't change the ending conditions. `unsent`/`reunited` still read `memo_heard`/`memo_sent`/`wwx_thanked`,
the memo can be recovered for 30 days, and a real thank-you still counts.

| id | trigger | effect |
|---|---|---|
| `r_memo_del` | `memo_delete` memo14 | `memo_deleted`; log *Deleted "Untitled 14"*; hint *Some things can't be unsaid. Or said.* |
| `r_memo_recover` | `memo_recover` memo14 | `memo_deleted` false, `memo_recovered`; log |
| `r_memo_purge` | `memo_delete` memo14 `forever` (Delete Forever / Delete All) | `memo_purged`; log |
| `r_memo_jiujiu` | `memo_delete` `memo_jiujiu` | `jiujiu_memo_deleted`; log |

Duplicates of a memo carry `copy:true` and are ignored.

### Phone (voicemails)
| id | trigger | effect |
|---|---|---|
| `r_vm_wwx` | `voicemail_play` `vm_wwx` ("sunday. I'll bring the soup. I mean, if— okay bye") | `wwx_vm_heard`; log. When the player opens his thread: **"I got your voicemail."** → "u LISTENED to it?? … so u heard the 'if'". Then either "the if is still there. it's ur if." or, if invited, "there's no if anymore. lan zhan crossed it out." aff wwx +1, hint. Or "Stop leaving me voicemails." ("lan zhan speaks mn. i speak voicemail") / [Leave it]. |
| `r_vm_mom` / `r_vm_dad` / `r_vm_ajie` | the voicemails he kept (2008, 2008, 2009) | `mom_vm_heard` / `dad_vm_heard` / `ajie_vm_heard`; log |

### Contacts
| id | trigger | effect |
|---|---|---|
| `r_ct_wwx` | `contact_edit` wwx `display` | Warmer name: `renamed_wwx` = the new name, log *Renamed "🐶 DO NOT ANSWER" to "…"*. Still "do not answer"/"ignore"/"block"…: `renamed_wwx_cold`, log "…Somehow worse." The Messages thread title follows the saved name automatically. |
| `r_ct_lxc` | `contact_edit` lxc `display` | `renamed_lxc` = the new name; log |
| `r_ct_other` | first rename of anyone else | log |
| `r_ct_del_wwx` | `contact_delete` wwx | `deleted_wwx_contact`; log |
| `r_ct_block_wwx` | `contact_block` wwx | log ("It would have been the fifteenth time.") |

### Settings
| id | trigger | effect |
|---|---|---|
| `r_focus_wwx` | `setting` `{key:'focus', value}` while the Focus status is shared and Wei Wuxian isn't allowed through (the default) | "why does it say u have notifications silenced … am i the disturb … lan zhan says i am the disturb. rude. accurate"; sus wwx +1, hint; log *Turned on Do Not Disturb* |
| `r_focus_jl` | same, if A-Ling isn't allowed (by default he is allowed in DND/Sleep/Personal, not in Work) | "im pressing notify anyway / NOTIFY. ANYWAY." His notification breaks through the Focus as a banner. sus jl +1, hint, log. |
| `r_air_on` / `r_air_back` | Airplane Mode on, then off after ≥ 25 s | log; A-Ling: "my messages just sat there saying sent. not delivered. SENT" |
| `r_wallpaper` | `wallpaper` | `wallpaper_changed` = art id; log *Changed his wallpaper to Fairy* |

### Clock
| id | trigger | effect |
|---|---|---|
| `r_alarm_tea` | `alarm_set` between 11:30 and 15:00 (one-off or repeating on Saturday), or labelled tea/Xichen/Hanshi/Gusu… | `tea_alarm` = "12:30 ("Tea")"; log *…on Saturday. Gusu is two hours by train.* |
| `r_alarm_med` | `alarm_off` for a Tacrolimus alarm (switched off or deleted) | `med_alarm_off`; log *(A-Ling set it)* |

## New flags
`xichen_draft_read`, `xichen_draft_sent`, `xichen_draft_kept`, `xichen_draft_deleted`, `wwx_list_read`,
`wwx_list_deleted`, `tea_cal`, `tea_declined`, `lxc_saw_121`, `wwx_meds_stopped`, `memo_deleted`, `memo_recovered`,
`memo_purged`, `jiujiu_memo_deleted`, `wwx_vm_heard`, `mom_vm_heard`, `dad_vm_heard`, `ajie_vm_heard`, `renamed_wwx`
(the new name), `renamed_wwx_cold`, `renamed_lxc` (the new name), `deleted_wwx_contact`, `wallpaper_changed` (art id),
`tea_alarm` (string), `med_alarm_off`.
Internal: `r_aff_<cid>` (affection cap), `r_reply_<thread>` / `r_hold_<tag>` (turn-taking), `r_*` payload stashes.
Ending flags moved: `tea_yes` (calendar accept), `aff.lxc`, `aff.wwx`, `aff.jl`.

## New and extended acts
| act | payload | emitted from |
|---|---|---|
| `note_delete` | `{ id, title }` | Notes (any delete → Recently Deleted) |
| `event_add` | `{ id, title, accepted, status, invite?, isNew?, cal?, start?, allDay?, invitees? }` | Calendar: tentative Accept, inbox Accept/Maybe, new event |
| `event_decline` | `{ id, title, status:'declined', invite? }` | Calendar: tentative Decline, inbox Decline |
| `reminder_done` | `{ id, list, title }` | Reminders (circle, and bulk Complete) |
| `med_log` | `{ med, slot, status, day, due, when: 'ahead'\|'late'\|'ontime' }` | Health → Medications → Log |
| `health_share` | also `{ to:'jl', accept:false, stop:true }`, `{ to:'wwx', stop:true }`, `{ to:'wwx', resume:true }` | Health → Sharing |
| `memo_delete` / `memo_recover` | `{ id, forever?, copy? }` / `{ id, copy? }` | Voice Memos (Recover, Recover All, Delete Forever, Delete All) |
| `contact_edit` | `{ id, field, value, before }` (one per changed field; `display` = saved name) | Contacts editor (existing contacts) |
| `contact_delete` / `contact_block` | `{ id, name }` | Contacts |
| `setting` | `{ key: 'focus'\|'airplane'\|'silent', value }` | every source (Settings, Control Center, Action button), via `JC.bus` `setting:<key>` in `settings.js` |
| `alarm_set` | `{ id, label, time:'HH:MM', h, m, repeat, isNew }` | Clock (Save in the alarm sheet) |
| `alarm_off` | `{ id, label, deleted }` | Clock (toggle off, delete) |

## New UI and data
- **Calendar:** `ev_tea_q` has `organizer: 'Lan Xichen'`, `organizerId: 'lxc'`, so Invitees shows Lan Xichen. The Accept
  toast and the Decline confirmation say he'll be notified. The Invitees sheet shows the organizer's avatar (`ev_board` →
  Tang Mei).
- **Reminders:** lists have `shared: [cid]`. My Lists shows "Shared with …" and each shared list has a chip with avatars
  under its title. New reminder `a_box` "The bell — purple velvet box (not gold)" (it matches the Notes checklist).
- **Health:** Sharing → "Sharing With" lists 🐶 DO NOT ANSWER (Medications · since July 2024; Stop Sharing / Share
  Medications Again) and A-Ling once accepted. Medications → Details → "Shared With". In the Log sheet the gala label only
  applies to Friday's 20:00 dose, and future doses say "not due yet".
- **Settings:** `JC.settingsKit.focusAllows(focusId, cid)` / `focusShared(focusId)` (the same defaults as Focus → People).

## FINALE notes (the 07:41 call and the ending text)
- **Letter sent** (`xichen_draft_sent`): "You sent him the note. The locked one." … "I started that the night I first wrote
  to him. September, last year. It took me a year to write four more words." If he finished it (log says *Finished*):
  "…and you finished it. What did I say?" **Kept** (`xichen_draft_kept`): "You read it and didn't send it. Good. It isn't
  finished." **Deleted:** "It wasn't finished anyway."
- **Tea accepted in the calendar** (`tea_cal`): in `r_tea_yes` add "You answered his calendar invitation. He says it
  informed him very formally." If accepted twice: "You said yes twice. He'll have counted." **Declined** (`tea_declined`,
  no `tea_yes`): "And you declined Xichen's tea. In my calendar." (a pause) "…I might go anyway."
- **Contacts:** read the current name with `JC.contacts.name('wwx')`. "And Wei Wuxian is saved as 'A-Xian' in my phone
  now. … Leave it." Cold rename: "Somehow you made it worse." `renamed_lxc`: "Zewu-jun is 'Xichen' now. Leave that too."
  `deleted_wwx_contact`: "You deleted Wei Wuxian from my contacts. … I know the number."
- **Wallpaper** (`wallpaper_changed`): "You changed my wallpaper." (if Fairy: "…to the dog. Leave it.")
- **Untitled 14:** the *Unsent* ending text should say that if `memo_deleted` he found it in Recently Deleted, twenty-nine
  days from gone, and sent it anyway. If `memo_purged`, it wasn't there: he recorded it again, in the car, and sent that.
  `jiujiu_memo_deleted`: "You deleted A-Ling's first word. It's in Recently Deleted. Thirty days. Don't touch it again."
- **Voicemails:** `mom_vm_heard`: "You played my mother's voicemail." "…Did she sound angry?" "She always sounded angry.
  She wasn't." `wwx_vm_heard` + replied: Wei Wuxian's morning messages could add "u listened to my voicemail. he never
  listens to my voicemails".
- **Medication:** skipped or ahead logs: "You logged my medication. I took it at 8:07, in a bathroom at Koi Tower. Don't
  ask." `wwx_meds_stopped`: "You turned off the medication sharing. He checks it every night at 8:05. … I'll turn it back
  on." `med_alarm_off`: "You turned off my medication alarm. A-Ling set those."
- **Health shared with A-Ling:** "You showed A-Ling my heart rate." "…It was hot in there." `lxc_saw_121`: "…and Xichen."
- **Focus:** "You put my phone on Do Not Disturb. Wei Wuxian thinks he's the disturb. He's right."
- **Alarm** (`tea_alarm`): "There's an alarm on my phone for 12:30. Labelled 'Tea'. … I'll keep it."
