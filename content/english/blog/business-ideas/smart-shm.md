---
date: '2022-03-21T12:44:47+10:00'
draft: true
title: 'Business Requirements Document'
tags: ['SEO', 'GEO', 'AEO']
summary: "Smart SHM"
---
## Introduction

A vessel-specific load and operation-based structural health estimation. The following are the requirements for, data collection and analysis to be employed:

- Vessel-specific **environmental and sea loads**. Can be:
  - Obtained through direct onboard measurements,
  - Derived from hindcast weather data by using vessel routing or position history.
- Vessel-specific **operational data** such as:
  - History of Cargo and other payload and loading pattern,
  - Vessel speed, heading, draft and trim.
- **Empirical Analysis** for structural strength assessment and damage prediction, using the data collected above.
- **Accumulated Fatigue Damage and Damage Rate Estimation** using the Collected Data and Analysis.

![](../img/workflow.png)

1. No sensor (strain gauge, accelerometer ...) is required.
2. The notation makes sense for ships designed for limited weather conditions or limited navigation area (i.e. non-sea-going) e.g.
   - a. High speed ships: HSC, Crew boats, FSIV, launch, OPV, etc.
   - b. Coastal navigation, Inland navigation, operation in port or in estuaries.
3. We understand that the notation relies on a monitoring system to ensure that the ship is operated within its design assumptions typically a ship-tracking digital solution (based on AIS) associated with hindcast weather data (the digital weather routing solutions available on the market would provide the expected functionalities)
4. Practically, no impact on shipyard and limited impact on ship-owner: just subscribing to a digital ship tracking solution; there are many on the market and the cost is reasonable
5. The notation applies to ships for which no FEM and no fatigue assessment is required.
   → In this sense, we do not understand the last step *"Empirical analysis – Accumulated fatigue damage & damage rate estimation"*.
