# Steady Budget

A phone-first budgeting app in Singapore dollars, built around one question: **how much can I spend today?**

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

- `steady-budget.html`: the whole app (HTML, CSS and JS in one file). The Artifact publisher adds the
  `<!doctype html>` skeleton when it publishes, which is why the file starts at `<title>`.
