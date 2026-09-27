---
title: "Why rare risks break traditional pricing"
course: catastrophe-pricing-with-generative-ai
order: 1
description: "The credibility problem, margins for adverse deviation, and the protection gap."
---

## The credibility problem

Classical ratemaking rests on the law of large numbers. Given enough independent claims, the sample mean converges on the true expected loss, the sample variance tells you how much to load, and credibility theory tells you how to blend a thin sample with a prior. Motor and health books satisfy these conditions comfortably.

Catastrophe books do not. The events are few, dependent within a year, and the losses that matter for capital are the ones that have not happened yet. India's flood record is 64 annual observations; its damaging-cyclone record is 45 events with a loss figure; its earthquake loss record is ten events. No credibility formula turns ten points into an estimate of the 1-in-200 loss.

## What actuaries do instead

Three things, usually in combination.

1. **Fit a parametric distribution** (lognormal, Pareto, Weibull) to the losses and read the tail off the fitted curve. The tail is then entirely a property of the family you picked.
2. **Buy a vendor catastrophe model** that simulates the hazard physically and applies vulnerability curves to an exposure database. Excellent where hazard, exposure and vulnerability data are rich; in India, the exposure and vulnerability layers are the weak links.
3. **Load a margin for adverse deviation** large enough to sleep at night. In practice this is where the price of catastrophe cover in emerging markets comes from, and it is why so little of the risk is insured.

The dissertation this course is drawn from quotes an interviewee: a 2% error in a vulnerability assumption can swing the probable maximum loss by 50%.

## The protection gap

When the margin is the price, cover becomes unaffordable, penetration stays low, and the state ends up as the insurer of last resort. India's flood insurance penetration is in single digits as a share of economic loss. The gap is not a marketing problem; it is a pricing-under-uncertainty problem.

## What this course proposes

Split the extrapolation into two parts that can each be examined. Let a generative model learn the body of the distribution and its dependence on physical hazard, where the data are informative. Let extreme value theory, which has a theorem behind it, decide the shape of the tail, fitted on real data the generator never saw. Price with a capital charge on the tail so that the uncertainty is visible in the premium rather than buried in a margin. Then show all of it to someone who does not want to believe you.

**Exercise.** Download the CWC flood damage statement (link in lesson 2). Fit a lognormal to the 1953–2016 real-terms series and compute its 99.5th percentile. Then compute the empirical 99.5th percentile. Write two sentences on which you would show a regulator, and why.
