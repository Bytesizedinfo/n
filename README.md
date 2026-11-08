# Steady Budget & Steady Pots

Two phone-first budgeting apps in Singapore dollars, each a single-file claude.ai Artifact.

## Steady Pots

S$800 monthly pay split into pots: **Savings S$400**, **Shanghai trip S$200** and **Misc S$200**.

Open it here (private to you): https://claude.ai/artifact/MiH71Upwi3PbjQBE1zqvHp

It's also a website: **https://bytesizedinfo.github.io/n/**, served by GitHub Pages from `/docs` on this branch.
The website saves in your phone's browser (localStorage) instead of your claude.ai account, so the two versions
keep separate data. A backup from either one restores into the other. Add the website to your Home Screen so it
opens like an app, works offline, and Safari doesn't clear its data.
Rebuild it after changing the app with `python3 tools/build_site.py`.

- **Misc is the spending pot.** The big number is what's left in it. Unspent money rolls over to next month.
- **Log pay** puts S$800 into the pots by your plan. If the amount differs, the remainder goes to Misc.
- **Other money** (an ang bao, a refund) asks which pot it goes into, or lets you split it.
- **Savings and Shanghai trip only grow.** Spending from them, or moving money out, shows a warning and needs a
  second tap. If Misc runs over after payday, it offers to cover the gap from savings.
- **Tags** (Food & drinks, Transport, Shopping, ...) show where spending went. They're labels, not limits.
- **Subscriptions** come out of Misc in one tap.
- **Insights:** money in, spent, saved and Misc left; a savings-growth line chart; spending each month against
  S$200; spending by tag; and changes from the same point last month.
- Plan lets you change the pay amount, add or rename pots, set starting balances and optional targets, and edit tags.
  You can also export CSV and back up or restore JSON.

Data lives in `data/users/<your id>/` (`settings` plus one `m-YYYY-MM` document per month). Entries are
`in` (with an `alloc` per pot), `out` (from one pot, with a tag) or `move` (between pots).
A pot's balance is its starting balance plus everything in, minus everything out.

## Steady Budget

The first app, built around one question: **how much can I spend today?**

Open it here (private to you): https://claude.ai/artifact/TsaD8paSASFNottdDWp1aG

## What it does

- **Safe to spend today.** Your everyday category limits, minus what you've spent, spread over the days left in the
  budget month. Fixed costs and savings are kept out of it. A 7-day strip shows which days stayed under the allowance.
- **Category limits.** Food & drinks, Groceries, Transport, Shopping, Fun & social, Personal care & health,
  Subscriptions, Other. All of them can be edited. Warnings appear at 80% of a limit and again when it goes over.
- **Pay yourself first.** When you log your salary, the amount you chose goes to a savings goal straight away.
- **Side income, your call.** Each time side income comes in, choose whether to spend it, save it or split it.
- **Savings goals.** Track progress, see the monthly amount needed to hit a target date, and get an
  emergency-fund guide (3–6 months of your real spending).
- **Subscriptions.** See what's due, log a payment in one tap (it moves the next due date), and see monthly and
  yearly totals.
- **Import bank statements.** UOB CSV or Excel files are matched automatically, and any bank's CSV can be matched
  by hand. It guesses categories for common Singapore merchants, skips card payments and transfers, flags
  transactions you already have, and remembers your category corrections.
- **Insights.** Income, spending, savings and savings rate compared with last month, a spending-pace chart,
  spending by category against limits, a 6-month trend, and income vs spending.
- **Search & filter** by text, type, category, dates and amount.
- **Backup.** Export transactions as CSV, download a full JSON backup, and restore from it.
- **Budget month** starts on the 1st by default. Change it in Plan → Limits to any day up to the 28th
  (for example, payday).

## Where the data lives

The page is a claude.ai Artifact with the `db`, `user` and `downloads` capabilities. Everything is stored under
`data/users/<your id>/`, which only you can read, even if you share the page:

- `settings`: limits, goals, subscriptions, accounts, pay-yourself-first and learned import rules
- `m-YYYY-MM`: one document per calendar month holding that month's transactions

Opened anywhere else, for example as a local file, the page runs with example data and saves nothing.

## Files

- `steady-pots.html` and `steady-budget.html`: each app is one file (HTML, CSS and JS). The Artifact publisher adds the
  `<!doctype html>` skeleton when it publishes, which is why the file starts at `<title>`.
