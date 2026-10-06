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

We have quarterly data for these companies going back to March 2005. We showed the model the first sixteen years, from 2005 to the end of 2020, and for each company in each quarter we told it two things: here are the eleven numbers, and here is whether the share ended up in the top 200 performers over the following three months. Over sixty-four quarters and about 40,000 such examples, the model adjusted itself until its scores lined up as well as they could with the actual outcomes.

The model is XGBoost, a collection of small decision trees, each asking a few yes/no questions about the eleven numbers ("is the three-month return above this level? is debt-to-equity below that one?"), with every tree correcting the mistakes of the ones before it. We keep the trees deliberately shallow so the model cannot memorise individual companies. An earlier version of ZENOJAS used a far more flexible neural network (a bidirectional LSTM) that also learned an identity code for each company; it fitted the past brilliantly and the future poorly, which is why it was replaced. The testing described next is what told the two apart.

## How we tested it

This is the part most worth understanding, because it is where honest and dishonest backtests part ways.

Once the model had learned from 2005 to 2020, we froze it. From March 2021 onwards it never learned anything new. Each quarter we gave it the eleven numbers for every company, took its top 30, and recorded what those shares actually did over the following three months. The model was making predictions about a future it had never seen, exactly as it would if we were running real money.

Two further precautions. First, a company's quarterly accounts are published about two months after the quarter ends, so a ranking made "as of 31 March" could not actually have been made on 31 March. We therefore buy on 1 June and measure to 1 September, and so on through the year. Every return you see on this site is on that lagged basis. Second, we kept the companies that later failed or were delisted in the data set. Removing them would make the past look safer than it was.

## Why some quarters are shaded on the Explorer

The [Backtest Explorer](/tools/zenojas/explorer/) lets you pick any run of quarters from 2005 to 2026, including the years the model learned from. When your selection includes those years, the chart is shaded amber and a warning appears. The returns in those quarters are real prices, but the model had already seen how those quarters turned out when it was being built, so its picks there are flattered. A sixteen-quarter run starting in September 2008, for example, shows a compound return above 100% a year. That is not skill; it is memory. The shading is there so that nobody, including us, quotes an in-sample number as if it were a test result.

The test period, March 2021 to March 2026, is unshaded: twenty-one scoring quarters, the last of them held from the end of May to the end of August 2026. Those are the numbers to judge the model on. Starting a window inside the training period lifts the compound return well above 100% a year, and the page will tell you so rather than let the number stand.

## How to read the numbers

**CAGR** is the compound annual growth rate: what the portfolio grew by each year, on average, over the selected period. If a portfolio turns 100 into 200 in three years, its CAGR is about 26%, because 26% a year compounded three times gets you there. It is the fairest single summary of return, but it hides how bumpy the ride was.

**Volatility** measures the bumpiness. A portfolio with 30% volatility will routinely have years 30 points above or below its average. The model's portfolio (about 31% volatility) is more than twice as volatile as the NIFTY 50; that is the price of holding 30 shares chosen for their potential rather than 50 chosen for their size.

**Sharpe ratio** is return per unit of bumpiness, after subtracting what you could have earned risk-free (we use 6.5%, a rough government-bond yield). Above 1 is good for an equity strategy. It lets you compare a volatile strategy with a calm one on equal terms.

**Maximum drawdown** is the worst peak-to-trough fall in the period. If you had invested at the worst possible moment, this is how much you would have been down before recovering. For the model over the test period it is about 22%, over the June and September 2024 quarters. Anyone considering the strategy should be comfortable with a fall of that size.

**Beta** says how much the portfolio moves when the market moves. A beta of 2 means that when the NIFTY 50 falls 10%, the portfolio tends to fall 20%. The model's portfolio has a beta of about 1.5, so a good part of its outperformance in rising markets is simply that it is a higher-octane portfolio. **Alpha** is what is left after accounting for that: the return the portfolio earned beyond what its market exposure alone would explain. Alpha is the number that measures selection skill, and it is annualised so it can be read like a CAGR.

**Hit rate** is the share of quarters in which the portfolio beat the benchmark. **Information ratio** is the average outperformance divided by how erratic that outperformance was; above 1 is strong.

**The t-statistic** answers a question people rarely ask of a backtest: could this outperformance be luck? It compares the average quarterly gap over the benchmark with how much that gap bounces around. A t-statistic above about 2 means the outperformance would be unlikely to occur by chance; below 1 means the data cannot distinguish the strategy from a coin flip. Over the twenty-one test quarters from March 2021, the model's alpha after allowing for market, size, value, momentum and quality has a t-statistic of about 2.4.

## What the test period showed

Over the twenty-one quarters from March 2021 to March 2026 the XGBoost model's top-30 portfolio compounded at about 65% a year before costs, against 9% for the NIFTY 50 and 25% for an equal-weighted basket of every company the model looked at. It beat the NIFTY 50 in 19 of the 21 quarters. Allowing for dealing costs of 0.5% each time a share is bought or sold, the figure falls to about 61%; at 1% it is about 58%.

Just as important, the model did about as well in the test period as it had on the years it learned from (about 60% a year in 2005–2020). A model that has only memorised the past usually falls away sharply once it meets new data. The earlier neural network did exactly that: about 129% a year on the years it learned from, but only 36% in the test period, and its ranking of the whole universe carried almost no information.

Three things keep the headline number in proportion. First, the equal-weighted basket, which involves no selection at all, earned 25%, and the model's portfolio leans heavily towards mid and small companies, so a large part of its gap over the NIFTY 50 is simply owning smaller companies in a period when they did well. After allowing for that and other common investment styles, the remaining outperformance is about 31% a year, and statistically it is significant but not overwhelming. Second, the portfolio swings about one and a half times as much as the market. Third, we chose XGBoost after seeing how all the candidate models did over this same test period, which flatters the winner; a fresh test with a separate validation period is under way.

## What we are still working on

The model uses eleven inputs, most of them about price. Adding the measures value investors actually use (return on capital, cash conversion, margins, promoter holding, and so on) is the next stage of development. We compared the earlier neural network against simpler methods (a logistic regression, a random forest and two gradient-boosted tree models) trained on identical data; every one of the simpler methods beat the network over the test period, and XGBoost did best by a small margin over logistic regression. The stock-by-stock picks on the Predicted stocks page still come from the earlier neural network; XGBoost picks will replace them after the next scoring run. Finally, the returns shown are a backtest: before costs and taxes unless stated, and we have not yet fully audited the history for companies that dropped out of the data.

---

*All figures on this site come from one output file produced by the model's scoring run. The Backtest Explorer computes every statistic from the quarterly returns in that file, in your browser, so what you see is exactly what the data say.*
