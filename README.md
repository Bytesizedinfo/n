# Skin Ritual

A personal skincare app. You take a short adaptive quiz and get a routine built for your skin: morning, night
and weekly steps, the reason for each one, example products sold in Singapore, and a slow ramp-up for strong
actives. It also checks that the products you already own work together and can build your routine from them.
A daily checklist and a skin journal track how it's going.

The recommendations come from built-in rules (no AI, no API keys). Everything runs in the browser.

## What's inside

- **Quiz**: 21 core questions plus follow-ups that only appear when relevant (e.g. acne type only if you pick
  breakouts). Covers skin type and concerns, sensitivity, pregnancy and prescriptions, conditions such as rosacea,
  eczema and fungal acne, climate and lifestyle, makeup and sunscreen habits, time and budget, and preferences.
- **Routine**: AM and PM steps, a weekly plan, weekly extras (masks), "as needed" spot care, a week-by-week
  ramp-up for retinoids, acids and benzoyl peroxide, notes, and "see a doctor" prompts where they apply.
  Every step explains why it's there and suggests 2–3 example products (budget / mid / splurge, approximate SGD).
- **My Shelf**: add products by searching the catalogue (88 products sold in Singapore), pasting an ingredients
  list, taking a photo of the label (read on the phone with Tesseract), or ticking ingredients by hand.
  The checker flags clashing pairs, duplicates, overload and anything that doesn't suit you (fragrance when
  you're sensitive, retinoids in pregnancy, pore-cloggers when you're acne-prone, fungal-acne triggers…).
  **Build from my shelf** turns your own products into a routine, schedules around clashes, benches what you
  don't need and suggests what's missing.
- **Today**: tick off each step. AM or PM is picked by the time of day; rotating treatments, the ramp-up week
  and weekly extras are all handled for you. Streaks and a week view.
- **Journal**: daily ratings, tags, notes and an optional progress photo (stays on the device). A 30-day trend
  chart, photo comparison, and pattern hints such as "breakouts went up after you added X".
- **More**: sync, retake the quiz, compare past routines, calendar reminders (.ics), light/dark theme, backup
  export/import and reset.

## Open it as a website

The app is plain HTML, CSS and JavaScript with no build step, so GitHub Pages can serve it straight from
this branch.

1. On GitHub, open the repository → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Pick the branch **`skincare-app`** and the folder **`/ (root)`**, then **Save**.
4. After a minute or two the site is live at **https://bytesizedinfo.github.io/n/**.

On your phone, open that address and use **Share → Add to Home Screen** to get an app icon.

Until sync is turned on, everything is saved in that browser on that device.

## Turn on sync

Sync uses a free Firebase project and Google sign-in. Your data goes into your own Firebase project, and the
security rules only let you read and write your own data. Takes about 5–10 minutes.

1. Go to <https://console.firebase.google.com> and click **Create a project**. Name it e.g. `skin-ritual`.
   Google Analytics isn't needed. The free **Spark** plan is plenty.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable**, choose your support email,
   **Save**.
3. Still in Authentication: **Settings → Authorized domains → Add domain** → `bytesizedinfo.github.io`.
4. **Build → Firestore Database → Create database**. Pick location **asia-southeast1 (Singapore)**, start in
   **production mode**, then **Create**.
5. In Firestore open the **Rules** tab, replace everything with the contents of [`firestore.rules`](firestore.rules),
   and **Publish**.
6. Click the gear icon → **Project settings** → **General** → **Your apps** → the **Web** icon (`</>`).
   Give it a nickname, leave Firebase Hosting unticked, **Register app**, and copy the `firebaseConfig` object.
7. Paste it into [`js/firebase-config.js`](js/firebase-config.js), replacing `null`
   (on GitHub: open the file on the `skincare-app` branch, click the pencil, paste, **Commit changes**).
   These values are designed to be public; the rules from step 5 are what protect your data.
8. Open the site → **More** → **Sign in with Google**. Do the same on your other phones and browsers.

The first sign-in on a device merges what's already on that device with your account (newer changes win).
After that, changes save automatically and show up live on your other devices, and the app keeps working
offline. Journal **photos never leave the device** they were taken on; everything else syncs.

If sign-in doesn't open from the home-screen icon on an iPhone, open the site in Safari once and sign in there.

## How the recommendations work

- `js/data/ingredients.js`: 53 ingredients and flags, each with the names it appears under on labels, an
  irritation score, pregnancy safety and the concerns it helps.
- `js/data/interactions.js`: 30 pair rules (e.g. retinoid + AHA → different nights; vitamin C + benzoyl
  peroxide → different routines; niacinamide + vitamin C → fine, it's a myth).
- `js/engine/profile.js` turns answers into a profile: weighted concerns, sensitivity, an "irritation budget",
  safety flags and step limits.
- `js/engine/select.js` scores the 20 recommendable actives against your concerns, drops anything unsafe for you
  (pregnancy, isotretinoin, tretinoin, rosacea, eczema, past reactions…), and picks one per job.
- `js/engine/scheduler.js` places them on a 7-day AM/PM grid: clashing actives never share a routine, each
  routine stays within your step limit and irritation budget, and days are spread evenly.
- `js/engine/rampup.js` builds the week-by-week ramp-up, bringing in one strong active at a time.
- `js/engine/shelf.js` does the same for products you own, plus duplicate/overload checks and gap-filling.
- `js/data/products.js`: the example catalogue. Prices are approximate SGD list prices (checked Nov 2026)
  and change with promotions. Fragrance status marked "check label" means it couldn't be confirmed.

This is general skincare guidance based on common dermatology advice, not medical advice.

## Develop

No build step. Serve the folder and open it:

```
npm run serve            # python3 -m http.server 8080 → http://localhost:8080
npm test                 # engine, parser and sync-merge unit tests (node --test)
npm run smoke            # full click-through in a phone-sized Chromium; screenshots in ./shots
OCR=1 npm run smoke      # also reads a photographed label (downloads Tesseract, needs internet)
```

```
index.html, css/app.css            page and styles (light + dark)
js/main.js, js/app.js, js/ui.js    routing, app state, UI helpers
js/screens/                        welcome, quiz, today, routine, shelf, journal, more, compare, chart
js/engine/                         profile, select, routine, scheduler, rampup, shelf, parse, examples,
                                   compare, ics, progress, dates
js/data/                           questions, ingredients, interactions, products
js/store/                          local storage, Firestore sync, merge, on-device photos
js/ocr.js                          label photo → text (Tesseract.js, loaded on demand)
firestore.rules                    per-user security rules for Firestore
tests/                             unit tests, fixtures and the smoke test
```
