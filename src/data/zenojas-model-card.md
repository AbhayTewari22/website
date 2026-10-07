# ZENOJAS XGBoost v2 — model card

**Status.** XGBoost is now the first-choice ZENOJAS stock-selection model. It replaces the BiLSTM v1 as the headline ranker after a like-for-like comparison on the same data, features, split and portfolio rule (see *Why not BiLSTM* below). The portfolio, ranked-universe and predicted-stock tables elsewhere on this site were produced by the earlier BiLSTM run and are labelled as such; XGBoost picks will replace them after the next scoring run.

**What it does.** Each quarter the model scores every stock in a ~940-name NSE universe with the probability that it belongs to the top 200 of the universe. (The audit below found that this training label refers to the quarter just ended, not the holding quarter, so in practice the model ranks mainly on momentum.) The 30 highest-probability names form an equal-weight portfolio, rebalanced quarterly. Only the ordering of the scores matters.

**Learner.** Gradient-boosted decision trees (XGBoost), deliberately shallow and heavily regularised because the training set is small for financial data and the base rate is low: maximum tree depth 3, at least 50 samples per leaf, random seed 42. No ticker embedding, so the model can score names it never saw in training (IPOs since 2020).

**Inputs (the same 11 quarterly features as the BiLSTM v1).** Three-month price return (TMR), momentum (200-day minus 50-day moving average), beta and Jensen alpha versus the NIFTY Midcap 100, industry-relative price z-score, earnings yield (E/P), book-to-price (B/P), sales-to-price (S/P), a dividend-payer flag, debt-to-equity and EPS. These survived a VIF / correlation screen of a wider 30-ratio panel. Skewed features are power-transformed (Yeo-Johnson; Box-Cox for E/P and S/P) and standardised, with transforms fitted on the training rows only.

**Data and split.** Quarterly fundamentals and prices from Bloomberg. Training uses 2005 – 2020 (64 quarters); every quarter from Mar-2021 to Mar-2026 (21 quarters) is scored out-of-sample with the frozen model. Each scoring quarter is held after a 60-day reporting lag.

**Target.** 1 if the stock's next-quarter return rank is ≤ 200, else 0.

**Primary metrics.** Signal quality first: mean quarterly **rank IC** (Spearman correlation of score with next-quarter return across the whole universe) and **precision@30** (share of the top 30 that land in the top 200; see the audit below for which top 200). Portfolio returns come second, because a 30-name book over 21 quarters can outperform by luck or by factor tilt.

### Out-of-sample record (21 quarters, Mar-2021 → Mar-2026, top 30, equal weight, gross, rf 6.5%)

| Ranking | CAGR | Notes |
|---|---:|---|
| **XGBoost** | **64.9%** | vol 30.8%, Sharpe 1.90, Sortino 5.8, max drawdown −22.0%, beta 1.53, beat NIFTY 50 in 90% of quarters |
| Logistic Regression | 64.2% | |
| LightGBM | 61.9% | |
| Random Forest | 59.3% | |
| BiLSTM v1 | 36.4% | Sharpe 1.12, max drawdown −24.5% |
| Universe equal-weight | 25.5% | no selection, every scored stock |
| Random ranking | 24.4% | reference |
| 3-month momentum rank | 15.4% | reference |
| NIFTY 50 | 8.6% | |

### In-sample vs out-of-sample

| Model | Window | CAGR | Rank IC | Precision@30 |
|---|---|---:|---:|---:|
| XGBoost | In-sample 2005–2020 (64 q) | 60.4% | 0.091 | 0.80 |
| XGBoost | Out-of-sample 2021–2026 (21 q) | 64.9% | 0.098 | 0.68 |
| BiLSTM v1 | In-sample 2005–2020 (64 q) | 129.4% | 0.246 | 0.60 |
| BiLSTM v1 | Out-of-sample 2021–2026 (21 q) | 36.4% | 0.009 | 0.34 |

XGBoost's rank IC and return hold up out of sample. The BiLSTM's do not. Precision@30 in this table is measured against the workbook label and overstates skill (see the audit below).

### Walk-forward test and audit (October 2026)

Every model was re-trained each quarter on an expanding window (training data ending two quarters before each scoring date, transforms re-fitted each time) and scored on the next quarter only.

| Model or reference | CAGR 2012–26 | Rank IC 2012–26 (t) | CAGR 2021–26 | Rank IC 2021–26 (t) | Precision@30 vs actual top 200, 2021–26 |
|---|---:|---:|---:|---:|---:|
| XGBoost | 60.4% | 0.084 (5.8) | 61.8% | 0.092 (5.0) | 35.7% |
| Logistic Regression | 59.4% | 0.082 (5.5) | 65.4% | 0.097 (5.4) | 36.2% |
| Random Forest | 64.0% | 0.082 (5.8) | 66.6% | 0.089 (4.8) | 37.0% |
| LightGBM | 63.2% | 0.083 (5.7) | 62.6% | 0.091 (4.9) | 34.9% |
| Rank by trailing 12-month return (no model) | 58.9% | 0.081 (4.3) | 57.8% | 0.092 (5.0) | 35.2% |
| Equal-weight universe | 26.8% | – | 25.5% | – | 24.7% (base rate) |
| NIFTY 50 | 12.2% | – | 8.6% | – | – |

What this shows:

- **Not a product of picking the model on the test window.** Walk-forward XGBoost earns about 62% a year for 2021–26, close to the fixed-split 64.9%.
- **The tabular models are statistically tied.** Logistic Regression does as well as XGBoost. XGBoost is kept as the first choice for robustness and practicality (missing-data handling, exact SHAP explanations), not because it is demonstrably better.
- **Most of the edge is momentum.** Ranking by the trailing 12-month return alone gets the same rank IC; the models add a few points of return on top.
- **The training label is the quarter just ended.** The audit found that the workbook "top 200" label marks the best performers of the three months ending at the start of the holding period, not of the holding period. There is no look-ahead in the returns, but precision against that label (the 0.68 above) overstates skill; against the actual top 200 it is about 36%.
- **The universe is survivors only.** All 485 stocks present in 2005 are still present in 2026, so absolute returns are inflated. Compare the models with the equal-weight universe, not the NIFTY 50.
- **No skill in a crash.** Trained to June 2007 and tested over 2007–09, the models' rank IC was about zero and the portfolio tracked the universe down.


### Equal weight against maximum-Sharpe weighting (October 2026)

The walk-forward XGBoost picks were also re-weighted each quarter to maximise the expected Sharpe ratio: Ledoit–Wolf shrinkage covariance on each stock's 36 trailing monthly returns, long-only, at most 10% per stock, using only data available at the buy date. Costs are 50 bp on each side of the weight traded. All rows use the same holding windows (31 May 2021 to 31 Aug 2026), so the Nifty 500 and Nifty Smallcap 250 Total Return Indices are directly comparable.

| Portfolio, 2021–26 | CAGR gross | CAGR net | Volatility | Sharpe (net) | Sortino (net) | Max drawdown (net) | Turnover / quarter |
|---|---:|---:|---:|---:|---:|---:|---:|
| Equal weight, top 10 | 79.6% | 75.3% | 45.7% | 1.36 | 5.29 | −25.9% | 69% |
| Equal weight, top 15 | 76.9% | 72.7% | 44.3% | 1.35 | 5.10 | −27.2% | 69% |
| Equal weight, top 30 | 61.8% | 58.1% | 32.6% | 1.43 | 4.36 | −23.0% | 63% |
| Maximum Sharpe, top 30 (score-based) | 79.5% | 75.1% | 33.5% | 1.74 | 6.92 | −17.4% | 71% |
| Maximum Sharpe, top 30 (shrunk mean) | 80.8% | 76.6% | 38.3% | 1.59 | 5.37 | −22.4% | 66% |
| Equal-weight universe | 25.5% | 25.1% | 22.3% | 0.84 | 1.63 | −23.6% | 9% |
| Nifty 500 TRI | 12.7% | 12.7% | 14.5% | 0.46 | 0.76 | −16.0% | – |
| Nifty Smallcap 250 TRI | 18.0% | 18.0% | 20.4% | 0.61 | 1.04 | −23.6% | – |

- **The return gain is concentration.** The optimiser ends up with about 14–15 effective names tilted to the top scores; an equal-weight top 10 earns the same net return.
- **The real benefit is risk control.** At the same return as the top 10, maximum Sharpe has lower volatility and drawdown and the best Sharpe and Sortino ratios, in 2021–26 and 2012–26 alike (2012–26: 66.4% net, −19.8% drawdown, against 57.0% and −23.0% for equal-weight top 30).
- **Smaller with the corrected label.** With the label defined on the holding-period return, maximum Sharpe earns 55.2% net against 45.4% for equal weight over 2021–26, and no more than equal weight over 2012–26.
- **Benchmarks.** Over the same windows the Nifty 500 TRI returned 12.7% a year and the Nifty Smallcap 250 TRI 18.0% (11.9% and 16.3% on calendar dates 31 Mar 2021 to 30 Mar 2026). The equal-weight universe remains the fair benchmark because the universe contains survivors only.


### Net of costs

| Model | Turnover / quarter | Gross CAGR | 50 bp per side | 100 bp per side |
|---|---:|---:|---:|---:|
| XGBoost | 61% | 64.9% | 61.3% | 57.7% |
| BiLSTM v1 | 44% | 36.4% | 34.1% | 31.9% |

### Factor attribution and significance

- **Five-factor regression** (market, size = equal-weight universe minus NIFTY 50, value, momentum, quality): XGBoost alpha 30.6% a year, t = 2.44, p = 0.03, R² = 0.72. The size beta is 1.25, so much of the headline return is a small/mid-cap tilt rather than stock selection. BiLSTM alpha 10.6% a year, t = 1.21, not significant.
- **XGBoost vs BiLSTM, paired:** +5.5% per quarter on average, t = 4.26, p = 0.0004; CAGR gap 28.5 pp with a bootstrap 95% interval of 14.5 – 45.5 pp; XGBoost ahead in 16 of 21 quarters.
- **Deflated Sharpe ratio** (allowing for 15 trials): XGBoost 0.994, BiLSTM 0.939.

### Why not BiLSTM

The BiLSTM v1 (a learned ticker embedding plus 11 features through one bidirectional LSTM layer, 2.5 M parameters, mostly the embedding) fitted history far better than it predicted the future: 129.4% CAGR and rank IC 0.246 in-sample, against 36.4% and rank IC 0.009 out-of-sample. That collapse is classic overfitting. The ticker embedding lets the network memorise which stocks did well in 2005–2020 rather than learn a relationship between features and returns; it cannot score new listings and showed negative permutation importance. Its out-of-sample portfolio return is mostly the small-cap tilt any top-30 book from this universe picked up in 2022–24. It is kept as a research branch, not as the production ranker.

### Caveats

- **Selection bias.** The choice of XGBoost over the other tabular models was informed by the same 21-quarter test window, so its lead over Logistic Regression, LightGBM and Random Forest is not an independent test. The walk-forward test above confirms the result but shows the tabular models are tied.
- **Backtest, not a track record.** Returns are simulated, gross of costs unless stated, price returns without dividends; the universe is not point-in-time and contains survivors only, which inflates absolute returns.
- **Risk.** High beta (1.53 vs NIFTY 50) and a strong small/mid-cap tilt; liquidity and capacity for an institutional-sized book are not modelled. No sector constraints are applied.
- **Research output, not investment advice.**
