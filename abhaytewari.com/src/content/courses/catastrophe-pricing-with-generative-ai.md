---
title: "Catastrophe Pricing with Generative AI"
description: "Build a working reinsurance pricing model from public data: from event tables to a conditional WGAN-GP, an EVT tail, compound simulation and an RBC-aligned premium."
level: Advanced
duration: "6 weeks · ~5 hrs/week"
status: open
audience: "Actuaries, catastrophe modellers, reinsurance underwriters and data scientists with working Python"
price: "Introductory cohort: register interest for pricing"
modules:
  - title: "The problem and the data"
    lessons: ["Why rare risks break traditional pricing", "Public data for Indian catastrophe modelling", "Trending losses to today's exposure"]
  - title: "Generative models for tabular losses"
    lessons: ["GANs, Wasserstein distance and the gradient penalty", "Conditioning on physical hazard", "Training on fifty data points without fooling yourself"]
  - title: "Extreme Value Theory"
    lessons: ["Peaks over threshold and the Generalized Pareto", "Threshold diagnostics and bootstrap uncertainty", "Splicing an EVT tail into synthetic scenarios"]
  - title: "From scenarios to a price"
    lessons: ["Frequency, severity and the compound distribution", "Excess-of-loss layers, reinstatements and aggregates", "VaR, TVaR and the RBC capital charge"]
  - title: "Validation and governance"
    lessons: ["Benchmarks, KS and Wasserstein distances", "Backtesting and hold-outs", "What a regulator will ask"]
  - title: "Capstone"
    lessons: ["Price a layer of your choice and defend it"]
---

This course teaches the method behind the [Gift Re Pricing Lab](/tools/pricing-lab/) by having you rebuild it. Each week pairs two or three lessons with a notebook that reproduces one stage of the pipeline on the same public data, so that by the capstone you have a model you built, understand, and can defend to an actuarial reviewer.

**What you will be able to do.** Assemble and trend a catastrophe loss dataset from public Indian sources; train a conditional Wasserstein GAN on tabular loss data and know when it has converged; fit and diagnose a Generalized Pareto tail; simulate compound losses to an excess-of-loss treaty; compute an RBC-aligned technical premium; and present the whole chain with the diagnostics a regulator expects.

**What you need.** Python at the level of pandas and a little PyTorch, and a working knowledge of insurance or reinsurance. The statistics are taught from the ground up; the code is provided.
