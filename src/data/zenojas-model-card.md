# ZENOJAS BiLSTM v1 — model card

**What it does.** ZENOJAS scores every stock in a ~940-name NSE universe each quarter with the probability that its price return over the *next* quarter will rank in the top 200 of the universe. The 25 highest-probability names form an equal-weight portfolio, rebalanced quarterly. Sector tilts from the Business-Cycle rulebook sit on top of this ranking; they are not applied in the published outputs because the current data set carries no sector classification.

**Architecture.** A learned ticker embedding is concatenated with 11 standardised features and passed through a single Bidirectional LSTM layer (16 units per direction, ReLU, dropout 0.2) into a sigmoid output. Loss is binary cross-entropy with Adam; 2.5 M parameters in total, of which the embedding is the bulk. The recurrent layer sees one time step per stock-quarter; the "16-quarter" tag refers to the lagged feature window used in preparation, not to a 16-step sequence.

**Inputs (11 quarterly features per stock).** Three-month price return (TMR), momentum (200-day minus 50-day moving average), beta and Jensen alpha versus the NIFTY Midcap 100, industry-relative price z-score, earnings yield (E/P), book-to-price (B/P), sales-to-price (S/P), a dividend-payer flag, debt-to-equity and EPS. These survived a VIF / correlation screen of a wider 30-ratio panel (ROCE, ROE, growth rates, EV/EBITDA, PEG and others were dropped for multicollinearity). Skewed features are power-transformed (Yeo-Johnson; Box-Cox for E/P and S/P) and standardised.

**Data and training window.** Quarterly fundamentals and prices from Bloomberg, Q4 FY05 onward. Training uses 2005 – 2020 (64 quarters, 39,716 stock-quarters); the split is strictly time-based and every quarter from Mar-2021 to Mar-2026 (21 quarters, 19,237 stock-quarters) is scored out-of-sample with the frozen model.

**Target.** 1 if the stock's next-quarter return rank is ≤ 200, else 0 (base rate ≈ 21 %).

**Validation.** Hold-out AUC 0.52; at a 0.5 threshold precision is 0.29 against a 0.21 base rate. Ranking the universe by score and buying the top 25 each quarter returned 40.9 % CAGR on the hold-out versus 26.6 % for the NIFTY Midcap 100 and 33.8 % for the equal-weighted universe, with a 21 % maximum drawdown and 58 % quarterly hit rate. Mean quarterly rank IC is close to zero and decile returns are not monotonic, so the outperformance should be treated as weak evidence rather than demonstrated skill.

**Known limitations.** Single hold-out window; no transaction costs, dividends or slippage; small-cap tilt inflates returns relative to a cap-weighted benchmark; features are Bloomberg-derived and a few stocks have missing inputs each quarter (imputed with the universe median); the ticker embedding cannot score names that were not in the training universe; no sector or liquidity constraints are applied. Outputs are research, not investment advice.
