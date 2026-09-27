---
title: "Pricing catastrophes when the data are scarce: a Wasserstein GAN with an EVT tail"
description: "How the Gift Re Pricing Lab works: public Indian loss data, a conditional WGAN-GP for the body of the distribution, a Generalized Pareto tail fitted on real excesses, and an RBC-style capital charge."
date: 2026-09-27
tags: [reinsurance, catastrophe-modelling, generative-ai, extreme-value-theory]
readingTime: "12 min read"
---

A reinsurer pricing a 1-in-200-year flood layer in India faces a simple arithmetic problem. The Central Water Commission has published all-India flood damages every year since 1953. That is 64 usable data points. The 1-in-200 loss is, by definition, something those 64 years have almost certainly not seen. Every traditional approach to this problem is a way of choosing an extrapolation, and the choice is usually hidden inside a parametric family (a lognormal, a Pareto) that was picked for convenience.

The [Gift Re Pricing Lab](/tools/pricing-lab/) is my attempt to make that extrapolation explicit and testable. It splits the job in two: a generative model learns the *body* of the loss distribution and how it moves with physical hazard; extreme value theory decides the *shape of the tail*. Neither is asked to do the other's job. This article explains the pieces, what the data allow, and what the results do and do not show.

## What the data are

Everything in the lab is public.

| Peril | Source | Sample |
|---|---|---|
| Riverine flood | CWC annual damage statement, 1953–2016 (2017–21 held out) | 64 years |
| Tropical cyclone | Event losses for India landfalls, 1972–2025 | 45 events with a loss figure |
| Earthquake | USGS catalogue for frequency; damaging-event loss table for severity | 43 events (frequency), 10 (severity) |
| Drought | IMD sub-division rainfall 1901–2015, 21 agricultural sub-divisions | 115 years × 21 |

Losses are nominal economic damages. They are deflated to 2024 prices with India CPI and then scaled by the square root of real-GDP growth since the event, a compromise between pure inflation adjustment and full Pielke-style normalisation that allows for better flood defences and building codes. Economic loss becomes cedant loss through two assumptions the user controls: the insured share of economic loss (10–15%) and the cedant's market share.

The drought peril is different. It is parametric: a payout is a deterministic function of the monsoon rainfall deficit in each sub-division, so no claims data are needed, and the quantity to model is the joint distribution of 21 deficits in a year.

## Why a Wasserstein GAN

A generative adversarial network trains a generator to produce samples and a critic to tell them from real ones. The original formulation minimises a Jensen–Shannon divergence, which saturates when the two distributions barely overlap, exactly the situation with skewed, heavy-tailed loss data, and produces vanishing gradients and mode collapse. The Wasserstein GAN minimises the earth-mover distance instead, which is continuous and informative everywhere. The critic must be 1-Lipschitz, which WGAN-GP enforces with a gradient penalty on random interpolates.

One detail matters in practice. The standard two-sided penalty, $(\lVert\nabla D\rVert - 1)^2$, has a spurious minimum on one-dimensional data: the critic can satisfy $\lVert\nabla D\rVert = 1$ with the wrong sign, and moving to the right sign requires passing through zero gradient, which the penalty punishes. On the flood series the critic settled there, the Wasserstein estimate went negative, and the generator drifted by orders of magnitude. The fix is the one-sided penalty of Petzka, Fischer and Lukovnikov (2018), $\max(0, \lVert\nabla D\rVert - 1)^2$, after which the generator reproduces the real quantiles closely. If you are adapting WGAN-GP to tabular actuarial data, check this before anything else.

The generators are conditional: $G(z \mid c)$ with $c$ the monsoon departure (flood), maximum sustained wind (cyclone) or moment magnitude (earthquake). This is what lets the same model price a specific season or a stressed hazard climate without refitting. The networks are deliberately small, two hidden layers of 64 units, so the trained weights can be exported to JSON and executed in your browser.

## Why EVT owns the tail

A network trained on 45 cyclones cannot know the shape of the 1-in-500 loss. The Pickands–Balkema–de Haan theorem says what it should look like: excesses over a high threshold $u$ converge to the Generalized Pareto distribution,

$$P(X - u \le y \mid X > u) \approx 1 - \left(1 + \frac{\xi y}{\sigma}\right)^{-1/\xi}.$$

The shape $\xi$ is the tail index; $\xi > 0$ is a heavy, Fréchet-type tail. The lab fits $\xi$ and $\sigma$ by maximum likelihood on the *real* excesses, shows the mean-excess and threshold-stability plots that justify $u$, reports a bootstrap interval for $\xi$, and then replaces every synthetic value above $u$ with $u$ plus a GPD draw. The proportion of scenarios in the tail is inherited from the generator; the shape of the tail is not.

An earlier version fitted the GPD to the generator's own output. That is circular, since the fit can only re-describe what the generator already produced, and a reviewer will spot it immediately. The tail must be fitted to data the generator has not touched.

Where the data cannot identify $\xi$ at all, the earthquake case with five excesses, the lab fixes $\xi$ to an analogue prior of 0.5 and estimates only $\sigma$. The dashboard labels it as an assumption. It is.

## From scenarios to a premium

Cyclone and earthquake are per-occurrence perils: event counts are Poisson at the observed rate (about one damaging landfall a year since 1990; about 0.65 shallow on-land M ≥ 6 events a year since 1960), each event draws a covariate, a severity and a tail splice, and the layer recovers $\min(\max(L - A, 0), \text{Limit})$ with an annual cap set by reinstatements. Flood and drought are annual aggregate covers. Fifty thousand years are simulated.

The premium is the dissertation's RBC-aligned formula: expected layer loss, plus expenses, plus the cost of capital on $\text{TVaR}_{99.5\%} - E[L]$, less a small credit for investment income on the float. Every peril is priced four ways, WGAN + EVT, WGAN only, lognormal, and empirical bootstrap, side by side.

## What the results show

For flood and cyclone the lognormal benchmark prices 15–20% above the WGAN + EVT model, because the lognormal's log-scale tail over-states large losses relative to both the empirical distribution and the EVT-anchored one; its 99th percentiles are two to four times the empirical values. The GAN-based price sits close to the empirical bootstrap while still allowing losses beyond the historical maximum, which is the point.

For drought the GAN prices *above* the naive benchmark, by about 16%, because it reproduces the spatial correlation of drought across sub-divisions (mean absolute correlation error 0.095) and correlation fattens the portfolio tail. A model that treats sub-divisions as independent under-prices the layer.

For earthquake the four methods disagree by a factor of 1.4 in rate on line. That is a statement about ten data points, not about any method.

The honest summary for the dissertation's second hypothesis is narrower than the original claim. On one-dimensional severity with fewer than fifty points, the WGAN-GP is about as good as a lognormal fit at describing the body and does not by itself improve the tail. Its clear advantages appear where the problem is multivariate or conditional: spatially correlated drought, and pricing for a stated wind, magnitude or monsoon scenario. Synthetic data from WGAN-GP, combined with EVT, improves the stability and scenario-responsiveness of pricing for correlated, data-scarce perils. It is not a universal accuracy upgrade, and the tool is built so that anyone can check.

## Governance

Five controls are built in, and I would argue they matter more than the model choice. EVT is fitted on real data only. Every price is shown against two traditional benchmarks. Every diagnostic is on the same screen as the price. Every assumption is an input. And the generator is exported as plain weights and re-implemented in two languages with identical results, so the chain can be audited without a deep-learning framework.

The code, the data with source URLs, and the full model documentation are available on request; the interactive version is [here](/tools/pricing-lab/).
