> This page is for readers who are not statisticians or programmers. It explains what the model does, how we checked whether it works, and what the numbers on the Backtest Explorer mean. The technical version, with all the parameters, is on the [Playbook](/tools/zenojas/playbook/) page. Nothing here is investment advice.

## The idea in one paragraph

Every three months, the model looks at roughly a thousand companies listed on the National Stock Exchange and asks one question about each: *is this share likely to be among the best performers over the next three months?* It gives each company a score between 0 and 1, we sort the list from highest score to lowest, and we buy the top 30 in equal amounts. Three months later we do it again. That is the whole strategy. There is no forecasting of the index, no guessing about interest rates, no reading of the news. The model only ranks companies against each other.

## What the model looks at

For each company, the model sees eleven numbers, updated every quarter. They fall into four families.

**How the share price has been behaving.** Its return over the last three months, whether its price is above or below its longer-term average, and how it has moved compared with similar companies.

**How risky it has been.** How much the share swings with the wider market, and whether it has been earning more or less than that market exposure would explain.

**Whether it looks cheap or expensive.** Earnings, book value and sales, each compared with the share price. These are the same ratios a value investor reads off a company's accounts.

**Whether the business looks sound.** Whether it pays a dividend, how much debt it carries relative to its equity, and its earnings per share.

That is all. The model does not know the company's name, its sector or what it makes. It learns purely from the relationship between these eleven numbers and what happened to the share price afterwards.

## How the model learned

We have quarterly data for these companies going back to March 2005. We showed the model the first seventeen years, from 2005 to the end of 2021, and for each company in each quarter we told it two things: here are the eleven numbers, and here is whether the share ended up in the top fifth of performers over the following three months. Over sixty-eight quarters and about 45,000 such examples, the model adjusted itself until its scores lined up as well as they could with the actual outcomes.

The model is a type of neural network. The name (a bidirectional LSTM) matters less than the idea: it is a very flexible pattern-finder, capable of picking up combinations of the eleven numbers that a simple rule of thumb would miss. That flexibility is also its weakness, which is why the testing described next matters more than the architecture.

## How we tested it

This is the part most worth understanding, because it is where honest and dishonest backtests part ways.

Once the model had learned from 2005 to 2021, we froze it. From March 2022 onwards it never learned anything new. Each quarter we gave it the eleven numbers for every company, took its top 30, and recorded what those shares actually did over the following three months. The model was making predictions about a future it had never seen, exactly as it would if we were running real money.

Two further precautions. First, a company's quarterly accounts are published about two months after the quarter ends, so a ranking made "as of 31 March" could not actually have been made on 31 March. We therefore buy on 1 June and measure to 1 September, and so on through the year. Every return you see on this site is on that lagged basis. Second, we kept the companies that later failed or were delisted in the data set. Removing them would make the past look safer than it was.

## Why some quarters are shaded on the Explorer

The [Backtest Explorer](/tools/zenojas/explorer/) lets you pick any run of quarters from 2005 to 2025, including the years the model learned from. When your selection includes those years, the chart is shaded amber and a warning appears. The returns in those quarters are real prices, but the model had already seen how those quarters turned out when it was being built, so its picks there are flattered. A sixteen-quarter run starting in September 2008, for example, shows a compound return above 100% a year. That is not skill; it is memory. The shading is there so that nobody, including us, quotes an in-sample number as if it were a test result.

The test period, March 2022 to September 2025, is unshaded. Those are the numbers to judge the model on. It is fifteen quarters today; the sixteenth, December 2025, will be added once its holding-period prices are in. Starting a sixteen-quarter window one or two quarters earlier, in the training period, lifts the compound return to about 43% a year, and the page will tell you so rather than let the number stand.

## How to read the numbers

**CAGR** is the compound annual growth rate: what the portfolio grew by each year, on average, over the selected period. If a portfolio turns 100 into 200 in three years, its CAGR is about 26%, because 26% a year compounded three times gets you there. It is the fairest single summary of return, but it hides how bumpy the ride was.

**Volatility** measures the bumpiness. A portfolio with 30% volatility will routinely have years 30 points above or below its average. The model's portfolio is roughly twice as volatile as the NIFTY 50; that is the price of holding 30 shares chosen for their potential rather than 50 chosen for their size.

**Sharpe ratio** is return per unit of bumpiness, after subtracting what you could have earned risk-free (we use 6.5%, a rough government-bond yield). Above 1 is good for an equity strategy. It lets you compare a volatile strategy with a calm one on equal terms.

**Maximum drawdown** is the worst peak-to-trough fall in the period. If you had invested at the worst possible moment, this is how much you would have been down before recovering. For the model over the test period it is about 29%, which happened in the September 2024 quarter. Anyone considering the strategy should be comfortable with a fall of that size.

**Beta** says how much the portfolio moves when the market moves. A beta of 2 means that when the NIFTY 50 falls 10%, the portfolio tends to fall 20%. The model's portfolio has a beta of about 2, so a good part of its outperformance in rising markets is simply that it is a higher-octane portfolio. **Alpha** is what is left after accounting for that: the return the portfolio earned beyond what its market exposure alone would explain. Alpha is the number that measures selection skill, and it is annualised so it can be read like a CAGR.

**Hit rate** is the share of quarters in which the portfolio beat the benchmark. **Information ratio** is the average outperformance divided by how erratic that outperformance was; above 1 is strong.

**The t-statistic** answers a question people rarely ask of a backtest: could this outperformance be luck? It compares the average quarterly gap over the benchmark with how much that gap bounces around. A t-statistic above about 2 means the outperformance would be unlikely to occur by chance; below 1 means the data cannot distinguish the strategy from a coin flip. Over the fifteen test quarters from March 2022 the model's t-statistic against the NIFTY 50 is about 2.5.

## What the test period showed

Over the fifteen quarters from March 2022 to September 2025 the model's top-30 portfolio compounded at about 37% a year before costs, against 12% for the NIFTY 50 and 24% for an equal-weighted basket of every company the model looked at. It beat the NIFTY 50 in 80% of quarters. After allowing for its higher market exposure, the alpha was about 19% a year.

Two comparisons keep that in proportion. The equal-weighted basket, which involves no selection at all, earned 24%, so about half of the model's gap over the NIFTY 50 comes from simply owning a broad, equal-weighted mix of mid and small companies rather than the fifty largest. And a ready-made index, the NIFTY 200 Value 30, earned 34% over the same period with a third less volatility. The model beat it, but not by a wide margin, and that index can be bought as a fund for a few basis points a year.

## What we are still working on

The model uses eleven inputs, most of them about price. Adding the measures value investors actually use (return on capital, cash conversion, margins, promoter holding, and so on) is the next stage of development, and we expect it to help more than any change to the model's architecture. We have also compared the network against simpler methods (a logistic regression, a random forest, two gradient-boosted tree models) trained on identical data, and the results are on the Explorer under the Model selector and in its comparison table. They are humbling: over the test period every one of the simpler methods matched or beat the network, and a ranking on nothing but three-month price momentum did about as well as the best of them. The honest conclusion is that the eleven inputs, not the network, are what carry the signal, and that most of that signal is momentum. That is exactly the kind of finding the test framework exists to surface, and it is why the next stage is better inputs rather than a bigger model. Finally, all returns shown are before dealing costs and taxes, which for a portfolio that replaces roughly half its holdings each quarter are not trivial.

---

*All figures on this site come from one output file produced by the model's scoring run. The Backtest Explorer computes every statistic from the quarterly returns in that file, in your browser, so what you see is exactly what the data say.*
