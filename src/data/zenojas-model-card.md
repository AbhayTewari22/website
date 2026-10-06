# ZENOJAS XGBoost v2 — model card

**Status.** XGBoost is now the first-choice ZENOJAS stock-selection model. It replaces the BiLSTM v1 as the headline ranker after a like-for-like comparison on the same data, features, split and portfolio rule (see *Why not BiLSTM* below). The portfolio, ranked-universe and predicted-stock tables elsewhere on this site were produced by the earlier BiLSTM run and are labelled as such; XGBoost picks will replace them after the next scoring run.

**What it does.** Each quarter the model scores every stock in a ~940-name NSE universe with the probability that its price return over the *next* quarter will rank in the top 200 of the universe. The 30 highest-probability names form an equal-weight portfolio, rebalanced quarterly. Only the ordering of the scores matters.

**Learner.** Gradient-boosted decision trees (XGBoost), deliberately shallow and heavily regularised because the training set is small for financial data and the base rate is low: maximum tree depth 3, at least 50 samples per leaf, random seed 42. No ticker embedding, so the model can score names it never saw in training (IPOs since 2020).

**Inputs (the same 11 quarterly features as the BiLSTM v1).** Three-month price return (TMR), momentum (200-day minus 50-day moving average), beta and Jensen alpha versus the NIFTY Midcap 100, industry-relative price z-score, earnings yield (E/P), book-to-price (B/P), sales-to-price (S/P), a dividend-payer flag, debt-to-equity and EPS. These survived a VIF / correlation screen of a wider 30-ratio panel. Skewed features are power-transformed (Yeo-Johnson; Box-Cox for E/P and S/P) and standardised, with transforms fitted on the training rows only.

**Data and split.** Quarterly fundamentals and prices from Bloomberg. Training uses 2005 – 2020 (64 quarters); every quarter from Mar-2021 to Mar-2026 (21 quarters) is scored out-of-sample with the frozen model. Each scoring quarter is held after a 60-day reporting lag.

**Target.** 1 if the stock's next-quarter return rank is ≤ 200, else 0.

**Primary metrics.** Signal quality first: mean quarterly **rank IC** (Spearman correlation of score with next-quarter return across the whole universe) and **precision@30** (share of the top 30 that land in the top 200). Portfolio returns come second, because a 30-name book over 21 quarters can outperform by luck or by factor tilt.

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

XGBoost's rank IC and return hold up out of sample (precision@30 falls from 0.80 to 0.68 but stays well above the ~0.21 base rate). The BiLSTM's do not.

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

- **Selection bias.** The choice of XGBoost over the other tabular models was informed by the same 21-quarter test window, so its lead over Logistic Regression, LightGBM and Random Forest is not an independent test. A walk-forward re-test with a separate validation window is in progress.
- **Backtest, not a track record.** Returns are simulated, gross of costs unless stated, price returns without dividends; survivorship and the point-in-time construction of the universe have not been fully audited.
- **Risk.** High beta (1.53 vs NIFTY 50) and a strong small/mid-cap tilt; liquidity and capacity for an institutional-sized book are not modelled. No sector constraints are applied.
- **Research output, not investment advice.**
