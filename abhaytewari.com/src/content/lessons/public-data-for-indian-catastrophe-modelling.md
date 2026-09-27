---
title: "Public data for Indian catastrophe modelling"
course: catastrophe-pricing-with-generative-ai
order: 2
description: "The datasets that exist, where they live, what they cover, and what they are good for."
---

There is more public data for Indian catastrophe modelling than most practitioners assume. The difficulty is not availability but assembly: the data live in a dozen agencies, in PDFs and portals, with different units, currencies and reporting conventions. This lesson catalogues the sources by the role they play in a model.

## Hazard

- **IMD gridded rainfall** (0.25°, daily, 1901–present) and temperature grids from IMD Pune. The foundation for flood and drought hazard and for parametric triggers.
- **IMD cyclone e-Atlas and best-track data** (RSMC New Delhi) and NOAA **IBTrACS** for tracks, intensities and landfall points.
- **CWC flood forecasting** and **India-WRIS** for river levels and discharge.
- **NCS / USGS** earthquake catalogues; **GEM** hazard and exposure models; the BIS seismic zoning map.
- **Copernicus ERA5**, **CHIRPS** and **GloFAS** for global reanalysis and flood forecasts where Indian series are thin.

## Losses

- **CWC state-wise flood damage statistics** 1953 onwards: area, population, crops, houses, cattle, lives, public utilities, total damage. The single best long series in the country.
- **EM-DAT** for events meeting its thresholds; **DesInventar** state databases (largely frozen around 2011–13).
- **Parliamentary answers** (Lok Sabha and Rajya Sabha) for SDRF/NDRF disbursements and state-reported damages.
- **Event pages and press** for cyclones and earthquakes, with the usual caveats about scope and currency.

## Agriculture

- **PMFBY** season and state aggregates: sum insured, premium, claims.
- **DES / UPAg** crop statistics and the **ICRISAT district-level database**.

## Exposure and vulnerability

- **Census houselisting** tables (wall and roof material by district), **SECC**, **WorldPop** and **GHSL** population grids, **VIIRS night lights** as an asset proxy, **OpenStreetMap** and open building footprints, and the **BMTPC Vulnerability Atlas**.

## Industry and macro

- **IRDAI** annual reports and handbook, **IIB** reports, **GIC Re** disclosures; **Swiss Re sigma**, **Munich Re NatCatSERVICE**, Aon and Gallagher Re reports for global loss references; **RBI** and **MOSPI** for deflators and GDP.

The course repository contains a catalogue of 73 sources with URLs, resolution, coverage, format and access notes, and the cleaned event tables used by the pricing lab.

**Exercise.** Pick one peril. List the three datasets you would use for frequency, severity and exposure, and write down the one gap you would have to fill with an assumption.
