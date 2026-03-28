# Project Scope: Virtual Structural Health Monitor (V-SHM) Software

This project scope outlines the development of a software solution for **Virtual Structural Health Monitoring (V-SHM)**, designed to compete with ARGUS-VM and NAPA Fleet Intelligence SHM TIER 1 solutions. The system will adhere strictly to the requirements of the ABS Guide for Smart Functions for Marine Vessels and Offshore Units to achieve ABS SMART (SHM) Tier 1 approval.

---

## 1. Project Goal

To deliver a reliable, cloud-based software solution that monitors the structural health of marine vessels using existing operational data (a "sensorless" approach), provides actionable insights to crew and shore personnel, and achieves ABS Product Design Assessment (PDA) certification for the SMART (SHM) Tier 1 notation.

---

## 2. Functional Requirements

The software must perform the following core functions:

- **Data Ingestion & Validation:** Automatically collect, validate, and timestamp operational, navigational, and environmental data streams.
- **Vessel-Specific Digital Twin:** Host and run a unique physics-based model (digital twin) for each enrolled vessel, simulating structural behaviour based on real-time inputs.
- **Real-time Stress Calculation:** Continuously calculate virtual hull stresses, bending moments, and fatigue accumulation rates.
- **Alerting Mechanism:** Generate automated alerts when calculated stress levels approach or exceed predefined class-approved limits and operational thresholds.
- **Reporting & Analytics:** Provide customisable dashboards and historical data logging for long-term trend analysis, maintenance planning, and class survey verification.

---

## 3. Performance Requirements

- **Availability:** The cloud platform shall maintain 99.9% uptime.
- **Latency:** Data processing and alert generation must occur with minimal latency (e.g., within 60 seconds of data ingestion) to support timely decision-making.
- **Scalability:** The architecture must be scalable to monitor hundreds of vessels simultaneously.
- **Data Integrity:** Strong measures must be implemented to ensure data is tamper-proof and authentic.

---

## 4. Data Sources and Data Points (Inputs)

The system will ingest data from existing sources on the vessel:

- **AIS/GPS:** Position (Lat/Long), Speed Over Ground (SOG), Course Over Ground (COG), Heading, Time Stamp.
- **Environmental Data Feeds:** Third-party API integration for localised real-time and forecasted data:
  - Wave height, period, and direction
  - Wind speed and direction
  - Sea current data and bathymetry
- **Vessel Systems Integration:** Interfaces with the vessel's data collection systems to obtain:
  - Draft (Fwd/Aft/Mid)
  - Cargo/Ballast loading conditions
  - Engine power/load data

---

## 5. Analysis Methodology

The methodology will be a hybrid approach combining data analytics with physics-based modelling:

- **Physics-based Digital Twin:** Leveraging naval architecture principles, a high-fidelity hydrodynamic model of each ship will be used to simulate structural responses to environmental and operational loads.
- **Data-driven Calibration:** Machine learning algorithms will be trained and tested with extensive data sets to refine and verify the digital twin's accuracy against actual operational data.
- **Risk-Informed Analytics:** Applying the models to identify critical performance parameters and potential failure points, providing risk assessments in real-time.

---

## 6. System Output and User Interface

The output will be delivered via a secure web portal and a light onboard client (for local alerts).

- **Sample Dashboard View:** A geographical map displaying fleet location with colour-coded vessel icons (Green: Normal, Yellow: Watch, Red: Alert). Clicking a vessel reveals a detailed panel with current hull stress indicators and operational limits.
- **Alerting Interface:** A dedicated alerts log, categorised by severity, with timestamps and suggested actions/context.
- **Fatigue Life Module:** A graphical representation of estimated accumulated fatigue life consumption over time for key structural areas.

---

## 7. ABS Certification Plan

The project plan includes a dedicated phase for certification:

- **Documentation Submission:** Preparation and submission of all design, functional, and performance requirement documents to ABS for review.
- **Prototype Validation:** Conducting a detailed Inspection Test Plan (ITP) for ABS review during a validation stage.
- **Software Provider Certification:** Notifying ABS for assessment for conformity to the ABS Software Provider Conformity Program (ISQM USC or ISQM PDA) Tier 1 requirements, asserting an ISO 9001 quality management program in place.
- **Cybersecurity Compliance:** Ensuring the software and data infrastructure (SMART (INF) notation readiness) meet IACS Unified Requirements E26 and E27 for cyber resilience.

---

## Data Sources and Data Points (Inputs)

The V-SHM system is entirely reliant on existing data infrastructure. We categorise inputs into three primary streams:

| Data Source Stream | Specific Source Systems | Data Points Acquired | Frequency |
|---|---|---|---|
| **1. Navigational & Positional** | AIS Transceiver, GPS Unit | Latitude, Longitude, Heading, SOG (Speed Over Ground), COG (Course Over Ground), UTC Timestamp | Continuous/Every seconds |
| **2. Environmental & Weather** | Third-Party Weather APIs (e.g., Meteomatics, StormGeo) | Significant Wave Height (H sub s), Wave Period (T sub p), Wave Direction, Wind Speed/Direction, Sea Current Velocity | Hourly Forecast / Real-time updates |
| **3. Operational & Loading** | Onboard Data Acquisition System (DAS), Manual Input/Logbooks | Fwd Draft, Aft Draft, Mid Draft, Cargo Weight/Distribution, Fuel Consumption, Trim/Heel Angle, Engine RPM/Load | Varies (Hourly/Per Voyage/Real-time) |

---

## Data Flow Explanation: A Real-World Scenario

**Scenario:** A large container vessel is crossing the North Atlantic, heading into an area of forecasted heavy weather.

### The Data Flow Process

1. **Data Generation (Onboard):**
   - The vessel's GPS unit generates a position data point every second.
   - The AIS transceiver broadcasts this position and speed.
   - The DAS records the current Fwd and Aft drafts (loading condition) every minute.

2. **Data Transmission (Ship-to-Shore):**
   - The onboard systems bundle this data. It is transmitted via satellite communication (e.g., Inmarsat Fleet Xpress) to the cloud environment hosting the V-SHM software.
   - Simultaneously, the cloud platform queries a third-party weather API for the exact location of the vessel (based on AIS data) to retrieve local wave height (H sub s) and period (T sub p) forecasts.

3. **Data Ingestion & Processing (Cloud/V-SHM Software):**
   - The V-SHM software validates all incoming data points, synchronising timestamps.
   - **Crucial Step:** The validated data points (speed, draft, wave height, wave direction, heading) are fed into the vessel's specific **Digital Twin model**.

4. **Analysis and "Virtual Measurement":**
   - The digital twin runs hydrodynamic simulations. It calculates the resulting virtual stress on critical hull sections (e.g., the main deck near the amidships area) based on the combined effect of the current speed through those specific waves at that specific draft.

5. **Output and Alerting:**
   - The calculated stress levels are compared against predefined ABS-approved operational limits.
   - **Sample Output:** The V-SHM dashboard updates in real-time, showing "Calculated Midship Bending Moment: 85% of Limit." An automated **Yellow Alert (Watch Condition)** is triggered because the limit has exceeded 80%. An email/dashboard notification is sent to the Master and the shore operations team.

6. **Action:**
   - The Master receives the alert and the system's suggestion: "Reduce speed to 14 knots to decrease bending moment below 70% limit." The crew adjust operations accordingly.

---

## Risks And Mitigations

### Risk 1: Data Completeness and Intermittency (Satellite Communication Loss)

- **Risk:** Satellite communication drops out due to bad weather or coverage gaps (e.g., polar routes), leading to missing input data points needed for the digital twin calculation.
- **Impact:** Inability to perform real-time SHM analysis, creating a safety gap during potentially high-risk periods.
- **Mitigation:**
  - **Data Buffering:** Implement robust onboard data acquisition units that buffer data locally during comms loss and upload automatically once connectivity resumes.
  - **Forecast-Based Projections:** If real-time data is missing, the system defaults to using recent confirmed data and forecasted environmental conditions to generate projected risk assessments until connectivity is restored, with a clear flag that the output is a projection.

---

### Risk 2: Data Quality and Integrity (Bad or Corrupt Data)

- **Risk:** A faulty GPS unit sends erroneous position data, or a manual entry for "Aft Draft" is incorrect, leading the digital twin to calculate wildly inaccurate (potentially dangerously low) stress levels.
- **Impact:** The V-SHM system provides a false sense of security or generates frequent false alarms, leading to operational inefficiency and distrust in the system.
- **Mitigation:**
  - **Data Validation Routines:** Implement strict validation checks upon ingestion (e.g., speed cannot exceed vessel maximum speed; drafts must be within design parameters).
  - **Redundancy Checks:** Cross-reference data points where possible (e.g., if GPS location is invalid, use previous AIS tracks for location interpolation).
  - **Anomaly Detection:** Use basic machine learning to flag data points that fall outside statistically normal operating ranges for that specific vessel.

---

### Risk 3: Model Accuracy (Digital Twin Calibration Error)

- **Risk:** The digital twin model, while physics-based, doesn't perfectly represent the actual vessel's unique structural behaviour or has drifted from reality over time due to wear and tear.
- **Impact:** The core analysis methodology is flawed, and the output is unreliable for critical safety decisions.
- **Mitigation:**
  - **ABS Certification & Validation:** The entire methodology and the digital twin creation process must be rigorously reviewed and approved by ABS (PDA approval).
  - **Periodic Recalibration:** Mandate periodic (e.g., annual or every 5 years) review and recalibration of the digital twin model based on physical surveys, maintenance records, and long-term performance data analysis.
  - **Operational Feedback Loop:** Implement a process for crew feedback on system alerts and actual observed conditions to continuously refine the model's accuracy.
