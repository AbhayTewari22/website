> Research output, not investment advice. Every number on the ZENOJAS page comes from a backtest: one 21-quarter out-of-sample record (Mar-2021 to Mar-2026), before costs, dividends and slippage unless stated. Read the diagnostics and caveats before the returns.

**Model update.** XGBoost v2 is now the first-choice ZENOJAS ranker. The BiLSTM v1 that this playbook originally described overfitted (see §3 and §4) and is kept as a research branch. Same eleven features, same target, same split; only the learner changed.

## 1. What the model is for

ZENOJAS is a quarterly stock-selection engine for Indian equities. Each quarter-end it scores every stock in a universe of roughly 940 NSE-listed companies and buys the 30 highest-scoring names in equal weight, holding them for one quarter (the BiLSTM v1 outputs still on the site used a 25-name book). It sits *underneath* the ZENOJAS business-cycle and sector-allocation rulebook: the rulebook decides which sectors deserve a lean, the model decides which names inside the universe look best right now. In the published outputs the sector tilts are not yet applied, because the current data set carries no sector classification.

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

**Step 5 — Split by time, never at random.** Training uses every quarter through December 2020 (64 quarters, 39,716 stock-quarters). Every quarter after that — twenty-one so far, March 2021 to March 2026 — is scored with the frozen model as it arrives. No row from a later quarter ever influences a score for an earlier one.

**Step 6 — Train the model.** The first-choice learner is XGBoost: gradient-boosted trees of maximum depth 3 with at least 50 samples per leaf, seed 42, fitted on the eleven transformed features only (no ticker identity), so it can score stocks it never saw in training. *Superseded BiLSTM v1, for reference:* a learned embedding vector per ticker is concatenated with the eleven standardised features and passed through a single bidirectional LSTM layer (16 units per direction, ReLU, dropout 0.2) into a sigmoid output. Loss is binary cross-entropy, optimiser Adam. The network sees one time step per stock-quarter; the "16-quarter" tag in the model's name refers to the lagged feature window used in data preparation, not to a 16-step sequence.

**Step 7 — Score and build the portfolio.** At each quarter-end, apply the same cleaning and transforms to that quarter's feature table, score every stock, rank by probability, buy the top 30 in equal weight after the 60-day reporting lag, and hold for the quarter. XGBoost turnover runs at about 61% of the book per quarter (BiLSTM v1: 44%).

**Step 8 — Evaluate on two levels.** *Portfolio level*: CAGR, volatility, Sharpe (risk-free 6.5%), maximum drawdown, quarterly hit rate, tracking error and information ratio against the NIFTY Midcap 100, Jensen's alpha and beta against both the Midcap 100 and the NIFTY 50, and the equal-weight universe as the fairer yardstick for a small-cap-tilted book. *Signal level*: pooled AUC on the hold-out, Spearman rank IC between score and next-quarter return each quarter, precision of the top 25 against the top-200 target, and return by score decile. The portfolio metrics tell you what happened to 25 names; the signal metrics tell you whether the ranking of all 940 means anything.

**Step 9 — Refresh.** Each new quarter-end: build the input file, re-run the scoring recipe with the frozen weights, append the realised return of the previous quarter's portfolio to the live series, recompute the statistics, and republish the single output file that drives this page.

## 3. How to read the results

**XGBoost v2, out of sample (21 quarters, Mar-2021 → Mar-2026, top 30, equal weight, gross, risk-free 6.5%).** CAGR 64.9% against 8.6% for the NIFTY 50 and 25.5% for the equal-weight universe; volatility 30.8%, Sharpe 1.90, Sortino 5.8, maximum drawdown −22.0%, beta 1.53, ahead of the NIFTY 50 in 90% of quarters. Net of costs: 61.3% at 50 bp per side and 57.7% at 100 bp per side.

**No decay from in-sample to out-of-sample.** In-sample (2005–2020, 64 quarters) XGBoost earned 60.4% with a mean rank IC of 0.091 and precision@30 of 0.80; out of sample, 64.9%, 0.098 and 0.68. The BiLSTM v1 went from 129.4% and a rank IC of 0.246 in-sample to 36.4% and 0.009 out of sample: classic overfitting, with the ticker embedding memorising which stocks did well.

**Where the return comes from.** A five-factor regression (market, size = equal-weight universe minus NIFTY 50, value, momentum, quality) leaves XGBoost an alpha of 30.6% a year (t = 2.44, p = 0.03, R² = 0.72), but its size beta is 1.25: a large part of the headline return is a small/mid-cap tilt that 2021–24 rewarded. The BiLSTM's alpha is 10.6% (t = 1.21), not significant.

**Caveats.** The choice of XGBoost was informed by the same test window. A walk-forward re-test, re-trained every quarter, confirms the out-of-sample result (about 62% a year for 2021–26, rank IC 0.092) but shows the tabular models are statistically tied and that ranking by trailing 12-month return alone captures most of the edge. The training label refers to the quarter just ended rather than the holding quarter, so precision figures overstate skill. Returns are a backtest, gross unless stated, on a survivors-only universe; the equal-weight universe is the fair benchmark. The book has high beta and a strong size tilt.

## 4. The comparison protocol: does the network earn its complexity?

A deep model is only justified if it beats simpler models on the same terms. The ZENOJAS comparison holds everything fixed except the learner:

- **Same inputs.** The eleven features above, same cleaning, same transforms, fitted on the training window only.
- **Same target and split.** Top-200 label; train through December 2020, score every quarter from March 2021.
- **Same portfolio rule.** Top 25 by score, equal weight, quarterly rebalance, price returns, no costs.
- **Same benchmarks.** NIFTY Midcap 100, NIFTY 50, equal-weight universe.

The contenders are the BiLSTM (using the scores from its published run, so its numbers match this page exactly), Logistic Regression, Random Forest, XGBoost and LightGBM, plus two reference rankings that any real model must beat: the raw three-month momentum rank, and a random ranking. The tree models are deliberately shallow and heavily regularised (depth 3, minimum 50 samples per leaf) because the training set is small for financial data and the base rate is low.

Every model is reported on the same leaderboard: pooled hold-out AUC, mean quarterly rank IC with its t-statistic, top-25 precision, annualised decile spread (top decile minus bottom), CAGR, Sharpe, information ratio, maximum drawdown, hit rate and alpha versus the Midcap 100. Because a leaderboard of point estimates invites over-reading, each baseline is also tested *pairwise* against the BiLSTM: a paired t-test on the quarterly portfolio-return differences, a bootstrap 95% confidence interval on the CAGR difference (quarters resampled), and a paired t-test on the quarterly rank IC differences. A model has only "beaten" another when those intervals exclude zero.

An optional walk-forward variant refits every tabular model each quarter on all data whose labels were known at the time, from 2015 onward, giving roughly forty out-of-sample quarters instead of twelve. The BiLSTM is not refit in that variant (its weights are frozen), so its row is shown for the fixed split only.

What the comparison is designed to reveal:

1. **If Logistic Regression matches the BiLSTM** on rank IC and AUC, the signal in these eleven features is essentially linear and the network adds nothing but variance.
2. **If XGBoost or LightGBM clearly leads**, there are non-linear interactions worth keeping, but a tree ensemble captures them with far fewer parameters, no ticker embedding, and the ability to score IPOs the network has never seen.
3. **If the momentum rank alone is within noise of every model**, the whole panel is a momentum factor in disguise and the right next step is a better feature set, not a better learner.
4. **If the BiLSTM leads on the portfolio metrics but not on the signal metrics**, its edge is coming from the ticker embedding — memorised stock identities from 2005–2020 — which is the least likely thing to persist.

**Results (same 64 training quarters, same transformed features, seed 42; every model is in the [Backtest Explorer](/tools/zenojas/explorer/) Model selector and its comparison table, scored on the same 21 quarters so the benchmark never moves).** On the full out-of-sample record, Mar-2021 → Mar-2026, with a top-30 book against the NIFTY 50, the ordering by CAGR is XGBoost (≈65%), Logistic Regression (≈64%), LightGBM (≈62%), Random Forest (≈59%), then the BiLSTM (≈36%); the random ranking earns ≈24% and a rank on the raw Momentum feature ≈15%. On mean quarterly rank IC the gap is wider: the tabular models sit around 0.09–0.10 while the BiLSTM is ≈0.01, indistinguishable from random. Read against the four cases above, this is case 1 and case 3 together: the signal in these features is essentially linear, and most of it is momentum. The network's portfolio return is respectable only because a top-30 book from any of these rankings caught the 2022–24 small-cap run; its ranking of the full universe carries no measurable information. **Pairwise and multiple-testing checks.** XGBoost minus BiLSTM averages +5.5% per quarter (paired t = 4.26, p = 0.0004); the CAGR gap is 28.5 pp with a bootstrap 95% interval of 14.5–45.5 pp, and XGBoost is ahead in 16 of 21 quarters. The deflated Sharpe ratio, allowing for 15 trials, is 0.994 for XGBoost and 0.939 for the BiLSTM. On this evidence XGBoost is promoted to the first-choice ranker and the BiLSTM becomes a research branch. The gap between XGBoost and the other tabular models (Logistic 64.2%, LightGBM 61.9%, Random Forest 59.3%) is small, and choosing among them on the same window is itself a source of selection bias; the walk-forward re-test with a separate validation window is in progress.

## 5. Known limitations

A single out-of-sample record of twenty-one quarters, so every statistic carries wide uncertainty, and the model choice was made on that same window. Returns are gross unless stated (cost sensitivity at 50 and 100 bp per side is reported above); no dividends, slippage or liquidity constraints; survivorship and the point-in-time universe are not fully audited; several small-cap names may not be tradeable at the size an AIF would need. The small-cap tilt inflates returns against a cap-weighted benchmark. The superseded BiLSTM's ticker embedding cannot score names that were not in the training universe (IPOs since 2020) and shows negative permutation importance, which suggests memorisation; XGBoost has no such embedding. No sector field yet, so the rulebook's sector constraints and per-sector caps are not applied. The target is a one-quarter rank, while the ZENOJAS strategy actually targets a multi-year horizon.

## 6. What comes next

Publish XGBoost picks and rankings from the next scoring run, replacing the BiLSTM v1 outputs still on the site. Complete the walk-forward re-test with a separate validation window, so the model choice is no longer made on the test window. Add a sector field and apply the rulebook tilts. Add a liquidity filter to the cost sensitivity already reported. Test two- and four-quarter forward targets, closer to the intended holding period. Keep the BiLSTM as a research branch (ablating the ticker embedding) rather than the production ranker.

---

*All figures on the ZENOJAS page and in this playbook come from one output file produced by the scoring run; the page and the model documentation are two views of the same numbers. Weights, raw data and feature tables are not published.*
