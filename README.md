# Spend & Save, Steady Pots & Steady Budget

Three phone-first budgeting apps in Singapore dollars, each a single-file claude.ai Artifact. The claude.ai
versions save to your account and sync across devices. The website copies save only in the browser you use.

## Spend & Save

S$800 a month in two groups: **Spending S$200** and **Savings S$600**.

Open it here (private to you): https://claude.ai/artifact/RzpoUebu3QvdeWomi6G3EL ·
website copy: **https://bytesizedinfo.github.io/n/spend-save/**

- **Spending** is one amount each month. **Spending categories** (Food & drinks, Transport, ...) record what it
  went on and never hold money. View them by **Today / Week / Month**, and tap one for its history.
- **Savings categories** hold money: Other, Shanghai trip, Emergency fund, General savings, Investments.
  Pay's S$600 and any money you don't sort lands in **Other** until you move it. Each one can be viewed
  **for the month or in total**, and can have a starting balance and a target.
- **Create your own categories** of either kind:
  - with "+ New category" on the Spending and Savings cards
  - while adding spending, adding money or moving money
  - in Plan → Categories, where you can also rename, recolour or delete them
- **Saved from income** counts only money that comes in from your income (pay, or other money logged as
  money in and sent straight to savings). Leftover spending, moves from Spending and money taken out change
  your balances but don't count as saving. Insights → "Where savings came from" shows the breakdown.
- **Month end:** unspent Spending moves to Savings → Other on the 1st. Overspending is taken from Other.
  This is worked out from your entries, so editing an old expense updates it.
- **Available to spend now** is the Spending left this month. Under it, "If you pay the bills still due this
  month" lists each unpaid bill paid from Spending (overdue ones included) and what would be left after them.
- **Bills & subscriptions** (Plan → Bills, plus a card on Home):
  - each has a fixed amount, weekly / monthly / every 3 months / yearly, a category, and is paid from Spending
    or a savings category
  - nothing is recorded until you tap **Paid**, which records it on its due date and moves the next date on;
    **Skip** moves the date on without recording
- **Projected after bills & planned spending** sits under Available now, at the same size: available now − bills
  still due − what's left of each category's **planned monthly amount** (set in Plan → Pay or on a spending
  category). A bill in a planned category isn't counted twice.
- **Goals** are savings categories with a target and a date (Goals card on Home, Plan → Categories). Logging pay
  suggests each goal's amount for the month: (target − balance at month start) ÷ months left. Reached goals are
  marked done, and their money stays put.
- **Income categories** (Salary, Side income, Allowance / family, Gifts & ang bao, plus your own). Pay is Salary,
  and Other money asks which kind. Insights shows money in by category. All income counts towards saved from income.
- Spending from savings, or moving savings into Spending, needs a second tap. Insights show money in, spent, how much savings grew, total savings, and charts.
- Data: `data/users/<id>/settings` plus `m-YYYY-MM`. Entries are `in` (`spend` + `save` per savings category),
  `out` (`label` = spending category, `from`) and `move` (`from`/`to`, where `spend` means Spending).

## Steady Pots

S$800 monthly pay split into pots: **Savings S$400**, **Shanghai trip S$200** and **Misc S$200**.

Open it here (private to you): https://claude.ai/artifact/MiH71Upwi3PbjQBE1zqvHp

It's also a website: **https://bytesizedinfo.github.io/n/**, served by GitHub Pages from `/docs` on this branch.
The website saves in your phone's browser (localStorage) instead of your claude.ai account, so the two versions
keep separate data. A backup from either one restores into the other. Add the website to your Home Screen so it
opens like an app, works offline, and Safari doesn't clear its data.
Rebuild both websites after changing an app with `python3 tools/build_site.py`.

- **Misc is the spending pot.** The big number is what's left in it. Unspent money rolls over to next month.
- **Log pay** puts S$800 into the pots by your plan. If the amount differs, the remainder goes to Misc.
- **Other money** (an ang bao, a refund) asks which pot it goes into, or lets you split it.
- **Savings and Shanghai trip only grow.** Spending from them, or moving money out, shows a warning and needs a
  second tap. If Misc runs over after payday, it offers to cover the gap from savings.
- **Categories you create** (in Plan → Categories, or "+ New category" while adding spending). Each one can
  have a budget **per day, per week or per month**.
- **Monitor each category with a Today / Week / Month toggle** on the Pots screen: what you spent, what's left,
  and a warning at 80% and when you go over. A budget set for one period is spread evenly for the others,
  so S$5 a day shows as S$35 a week. Weeks run Monday to Sunday.
- **Tap a category** for its own page: the same toggle, a chart of the last 14 days / 8 weeks / 6 months against
  its budget, the average, what's left per day, and the spending in that period.
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

- `spend-save.html`, `steady-pots.html` and `steady-budget.html`: each app is one file (HTML, CSS and JS). The Artifact publisher adds the
  `<!doctype html>` skeleton when it publishes, which is why the file starts at `<title>`.
