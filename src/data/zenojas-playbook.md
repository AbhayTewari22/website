> Research output, not investment advice. Every number on the ZENOJAS page comes from a single backtest of twelve hold-out quarters plus a handful of live quarters, before costs, dividends and slippage. Read the diagnostics before the returns.

## 1. What the model is for

ZENOJAS is a quarterly stock-selection engine for Indian equities. Each quarter-end it scores every stock in a universe of roughly 940 NSE-listed companies and buys the 25 highest-scoring names in equal weight (4% each), holding them for one quarter. It sits *underneath* the ZENOJAS business-cycle and sector-allocation rulebook: the rulebook decides which sectors deserve a lean, the model decides which names inside the universe look best right now. In the published outputs the sector tilts are not yet applied, because the current data set carries no sector classification.

The model answers one narrow question: *is this stock likely to finish in the top fifth of the universe by price return next quarter?* It is a classifier that produces a probability, not a forecast of how much a stock will return. Only the ordering of those probabilities matters.

## 2. The playbook, step by step

**Step 1 — Assemble the quarterly panel.** One row per stock per quarter-end, from 2005 onward, with quarterly fundamentals and prices from Bloomberg. Every row carries the eleven inputs below, the stock's market cap, and its realised price return over the *following* quarter (the label).

**Step 2 — Compute the eleven features.** They survived a VIF and correlation screen of a wider panel of about thirty ratios (ROCE, ROE, growth rates, EV/EBITDA, PEG and others were dropped for multicollinearity):

| Group | Feature | Definition |
|---|---|---|
| Price | TMR | Three-month price return |
| Price | Momentum | 200-day minus 50-day moving average |
| Price | Zscore | Industry-relative price z-score |
| Risk | Beta | Beta versus NIFTY Midcap 100 |
| Risk | Alpha | Jensen alpha versus NIFTY Midcap 100 |
| Value | EP, BP, SP | Earnings, book and sales yields (E/P, B/P, S/P) |
| Quality | Dividend_Flag | Pays a dividend (0/1) |
| Leverage | DE | Debt-to-equity |
| Earnings | EPS | Earnings per share |

**Step 3 — Label.** Rank every stock in the quarter by its next-quarter return. Label = 1 if the rank is 200 or better, else 0. The base rate is about 21%.

**Step 4 — Clean and transform.** Infinite values become zero; missing E/P and S/P become zero; any other missing input is imputed with the universe median for that quarter (97 of 942 stocks needed this in the latest run; the original notebook left them unscored). Skewed features are power-transformed (Yeo-Johnson, Box-Cox for E/P and S/P) and standardised.

**Step 5 — Split by time, never at random.** Training uses every quarter through December 2021 (about 34,000 stock-quarters). The hold-out is the twelve quarters from March 2022 to December 2024 (about 10,800 stock-quarters). Quarters after that are scored fully out-of-time as they arrive and shown separately as *live*. No row from a later quarter ever influences a score for an earlier one.

**Step 6 — Train the network.** A learned embedding vector per ticker is concatenated with the eleven standardised features and passed through a single bidirectional LSTM layer (16 units per direction, ReLU, dropout 0.2) into a sigmoid output. Loss is binary cross-entropy, optimiser Adam. The network sees one time step per stock-quarter; the "16-quarter" tag in the model's name refers to the lagged feature window used in data preparation, not to a 16-step sequence.

**Step 7 — Score and build the portfolio.** At each quarter-end, apply the same cleaning and transforms to that quarter's feature table, score every stock, rank by probability, buy the top 25 at 4% each on the first trading day of the next quarter, and hold for the quarter. Turnover runs at roughly half the book per quarter.

**Step 8 — Evaluate on two levels.** *Portfolio level*: CAGR, volatility, Sharpe (risk-free 6.5%), maximum drawdown, quarterly hit rate, tracking error and information ratio against the NIFTY Midcap 100, Jensen's alpha and beta against both the Midcap 100 and the NIFTY 50, and the equal-weight universe as the fairer yardstick for a small-cap-tilted book. *Signal level*: pooled AUC on the hold-out, Spearman rank IC between score and next-quarter return each quarter, precision of the top 25 against the top-200 target, and return by score decile. The portfolio metrics tell you what happened to 25 names; the signal metrics tell you whether the ranking of all 940 means anything.

**Step 9 — Refresh.** Each new quarter-end: build the input file, re-run the scoring recipe with the frozen weights, append the realised return of the previous quarter's portfolio to the live series, recompute the statistics, and republish the single output file that drives this page.

## 3. How to read the results

The current outputs say two things at once and both are true. The top-25 portfolio compounded at about 36% a year over fourteen quarters against 25% for the NIFTY Midcap 100 and 27% for the equal-weight universe, with a 57% quarterly hit rate. And the hold-out AUC is 0.52, the mean rank IC is roughly zero, and decile returns are not monotonic — the bottom decile earned as much as the top.

A 25-name portfolio drawn from the extreme top of a 940-name ranking can outperform for three years even when the ranking has no overall skill: the sample is tiny and dominated by a few large winners, the book is small-cap tilted and 2022–2024 rewarded Indian small caps, and twelve quarters cannot separate skill from luck at these effect sizes. The rank IC and decile tests use the whole universe every quarter and are far more powerful. They say the signal is weak. The honest reading is that the outperformance is a hypothesis worth testing further, not a demonstrated edge.

## 4. The comparison protocol: does the network earn its complexity?

A deep model is only justified if it beats simpler models on the same terms. The ZENOJAS comparison holds everything fixed except the learner:

- **Same inputs.** The eleven features above, same cleaning, same transforms, fitted on the training window only.
- **Same target and split.** Top-200 label; train through December 2021, hold-out March 2022 to December 2024, later quarters live.
- **Same portfolio rule.** Top 25 by score, equal weight, quarterly rebalance, price returns, no costs.
- **Same benchmarks.** NIFTY Midcap 100, NIFTY 50, equal-weight universe.

The contenders are the BiLSTM (using the scores from its published run, so its numbers match this page exactly), Logistic Regression, Random Forest, XGBoost and LightGBM, plus two reference rankings that any real model must beat: the raw three-month momentum rank, and a random ranking. The tree models are deliberately shallow and heavily regularised (depth 3, minimum 50 samples per leaf) because the training set is small for financial data and the base rate is low.

Every model is reported on the same leaderboard: pooled hold-out AUC, mean quarterly rank IC with its t-statistic, top-25 precision, annualised decile spread (top decile minus bottom), CAGR, Sharpe, information ratio, maximum drawdown, hit rate and alpha versus the Midcap 100. Because a leaderboard of point estimates invites over-reading, each baseline is also tested *pairwise* against the BiLSTM: a paired t-test on the quarterly portfolio-return differences, a bootstrap 95% confidence interval on the CAGR difference (quarters resampled), and a paired t-test on the quarterly rank IC differences. A model has only "beaten" another when those intervals exclude zero.

An optional walk-forward variant refits every tabular model each quarter on all data whose labels were known at the time, from 2015 onward, giving roughly forty out-of-sample quarters instead of twelve. The BiLSTM is not refit in that variant (its weights are frozen), so its row is shown for the fixed split only.

What the comparison is designed to reveal:

1. **If Logistic Regression matches the BiLSTM** on rank IC and AUC, the signal in these eleven features is essentially linear and the network adds nothing but variance.
2. **If XGBoost or LightGBM clearly leads**, there are non-linear interactions worth keeping, but a tree ensemble captures them with far fewer parameters, no ticker embedding, and the ability to score IPOs the network has never seen.
3. **If the momentum rank alone is within noise of every model**, the whole panel is a momentum factor in disguise and the right next step is a better feature set, not a better learner.
4. **If the BiLSTM leads on the portfolio metrics but not on the signal metrics**, its edge is coming from the ticker embedding — memorised stock identities from 2005–2021 — which is the least likely thing to persist.

**Results (fixed split, scored out-of-sample from Mar-2021; every model is in the [Backtest Explorer](/tools/zenojas/explorer/) Model selector and its comparison table).** On the 15-quarter Mar-2022 → Sep-2025 window with a top-30 book against the NIFTY 50, the ordering by CAGR is Random Forest (≈49%), Logistic Regression (≈48%), the raw momentum rank (≈47%), LightGBM (≈46%), XGBoost (≈41%), then the BiLSTM (≈37%); the random ranking earns ≈21%. On mean quarterly rank IC the gap is wider: the tabular models and the momentum rank sit around 0.08–0.10 while the BiLSTM is ≈0.01, indistinguishable from random. Read against the four cases above, this is case 1 and case 3 together: the signal in these features is essentially linear, and most of it is momentum. The network's portfolio return is respectable only because a top-30 book from any of these rankings caught the 2022–24 small-cap run; its ranking of the full universe carries no measurable information. The pairwise tests and walk-forward series will be added to the file as they are produced.

## 5. Known limitations

A single hold-out window of twelve quarters plus a few live quarters, so every statistic carries wide uncertainty. No transaction costs, dividends, slippage or liquidity constraints; several small-cap names may not be tradeable at the size an AIF would need. The small-cap tilt inflates returns against a cap-weighted benchmark. The ticker embedding cannot score names that were not in the training universe (IPOs since 2021) and shows negative permutation importance, which suggests memorisation. No sector field yet, so the rulebook's sector constraints and per-sector caps are not applied. The target is a one-quarter rank, while the ZENOJAS strategy actually targets a multi-year horizon.

## 6. What comes next

Ablate the ticker embedding and retrain. Extend the hold-out with walk-forward retraining so every year from 2012 onward is tested out-of-sample. Add a sector field and apply the rulebook tilts. Report returns net of a realistic cost model (40–60 bp per side for small caps) with a liquidity filter. Test two- and four-quarter forward targets, closer to the intended holding period. And, if the comparison shows the tabular models at parity, promote the better-regularised one to the production ranker and keep the network as a research branch.

---

*All figures on the ZENOJAS page and in this playbook come from one output file produced by the scoring run; the page and the model documentation are two views of the same numbers. Weights, raw data and feature tables are not published.*
