+++
date = '2025-12-22T12:44:47+10:00'
draft = false
title = 'Anomaly Detection'
tags = ['Anomaly Detection', 'Outlier Detection', 'Machine learning']
summary = "Comprehensive Guide to mastering Anomaly Detection in Machine Learning"
+++

## Statistical Measures - Descriptive Statistics

### Mean
- **What:** Average of all values (sum ÷ count)
- **Use when:** Normal distributions, no outliers, need interpretability
- **Don't use when:** Outliers present, skewed data (income, response times)

### Median
- **What:** Middle value when sorted (50th percentile)
- **Use when:** Outliers exist, skewed distributions, need robust center
- **Don't use when:** Perfect normal data, need mathematical operations, very small samples

### Variance
- **What:** Average squared distance from mean
- **Use when:** Measuring spread, normal data, statistical modeling
- **Don't use when:** Outliers present, need interpretable units, heavy-tailed distributions

### Percentiles
- **What:** Value below which X% of data falls (e.g., 25th, 95th)
- **Use when:** Setting thresholds, skewed data, SLA monitoring (p99 latency)
- **Don't use when:** Small datasets (<30), need smooth math properties

---

## Robust Statistical Methods
The below is used for univariate outlier detection and spread measurement when data is non-normal or contains outliers.

### Standard Deviation
- **What:** Square root of variance (spread in original units)
- **Use when:** Describing spread, normal data, Z-scores, confidence intervals
- **Don't use when:** Outliers present, skewed data (use IQR/MAD instead)
- **Details**
  - Uses mean as the center
  - Measures average distance from mean
  - Sensitive to outliers - one extreme value can inflate it dramatically
  - Assumes roughly normal distribution
- **Formula**:

![std_dev.png](../img/std_dev.png)

### Median Absolute Deviation (MAD) ⭐
- **What:** Median of absolute deviations from median (robust spread measure)
- **Use when:** Outliers present, skewed data, production systems, finance/manufacturing
- **Don't use when:** Perfect normal data where standard deviation suffices
- **Details**
  - Uses median as the center
  - Measures median distance from median
  - Robust to outliers - extreme values don't distort it
  - Works with any distribution shape

- **Formula**:

![mad.png](../img/mad.png)

### Interquartile Range (IQR)
- **What:** Distance between 75th and 25th percentiles (middle 50% spread)
- **Use when:** Outlier detection, box plots, skewed distributions, quick EDA
- **Don't use when:** Small samples (<20), need precise statistical modeling

### Tukey's Fences
- **What:** Outlier boundaries at Q1 - 1.5×IQR and Q3 + 1.5×IQR
- **Use when:** Quick outlier flagging, exploratory analysis, box plot rules
- **Don't use when:** Need domain-specific thresholds, multivariate data
- Box Plot is one of the visualization that often uses Tukey's fences

### Z-Score (Standard Score)
- **What**: Number of standard deviations a value is from the mean: (x - mean) / SD
- **Use when**: Normal data, standardizing features, detecting outliers in clean data (|z| > 3)
- **Don't use when**: Outliers present (use Modified Z-score), skewed data, small samples
- **Formula**

![img.png](../img/z.png)

### Modified Z-Score
- **What:** Z-score using median and MAD instead of mean and SD
- **Use when:** Outliers contaminate mean/SD, need robust standardization
- **Don't use when:** Clean normal data, classical Z-score works fine
- **Forumla**

![modified_z.png](../img/modified_z.png)

## Visualization

### **Univariate Visualization**
- [Histograms](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/histogram.ipynb) ⭐ - spot distribution shape, outliers at tails. 
- [Box plots](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/boxplot.ipynb) ⭐ - immediate visual of IQR outlier
- [Violin plots](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/boxplot.ipynb) - density + outliers combined
- [Q-Q](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/qq.ipynb) plots - check normality assumptions
- [Time series plots](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/timeseries.ipynb) ⭐ - contextual anomalies, trends, seasonality

### **Multivariate Visualization**
- [Scatter plots & pair plots](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/scatter_n_pair.ipynb) ⭐ - bivariate outliers
- [Parallel coordinates](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/parallel.ipynb)  - high-dimensional patterns
- [Heatmaps & correlation matrices](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/heatmap_n_correlation_mat.ipynb) - relationship anomalies
- [Andrews curves](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/andrews.ipynb) - multivariate data as curves

### **Distribution Comparison**
- [Empirical CDF plots](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/empherical_cdf.ipynb)  - compare distributions
- [Kernel Density Estimation (KDE)](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/kde.ipynb) ⭐ - smooth distribution view
- [Lag plots](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/lag.ipynb) - time series autocorrelation patterns

### **Advanced Visual Techniques**
- Control charts ⭐⭐ (Shewhart, CUSUM, EWMA)
  - Used extensively in manufacturing
  - Real-time visual monitoring
  - Statistical control limits
- Mahalanobis distance plots - multivariate outliers
- Cook's distance - influence plots for regression
- Residual plots - model-based anomaly visualization

### **Dimensionality Reduction for Visualization**
- [PCA projection (2D/3D)](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/pca.ipynb)  - visualize high-dimensional outliers
- [UMAP](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/umap.ipynb) ⭐ - preserve local structure, great for clusters
- t-SNE - good for exploration (not detection)

### **Interactive Dashboards ⭐⭐**
- Plotly Dash - interactive anomaly exploration

_Why This Matters: Visual exploration is your first step before algorithms. Many production systems use visual dashboards for real-time monitoring. This is how you communicate findings to stakeholders and validate automated detections._
_Practice: EDA on various datasets, build interactive dashboards, practice "anomaly spotting by eye"_

---

## Phase 2: Distance and Density-Based Methods
### **Distance Metrics & Scaling**
- Euclidean, Manhattan, Mahalanobis distance
- Feature scaling and normalization (critical for production)
- Curse of dimensionality (why high-dimensional data breaks distance metrics)

### **Core Algorithms**
- [k-Nearest Neighbors (kNN)](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/knn_lof.ipynb) for outlier detection
- [Local Outlier Factor (LOF)](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/knn_lof.ipynb) - detects local anomalies
- [DBSCAN](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/dbscan.ipynb) for clustering-based detection

_Practice: Multivariate tabular data, customer behavior, transaction records. Always visualize results._

---

## Phase 3: Ensemble Methods & Isolation Forest
### **[Isolation Forest](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/isolation.ipynb) ⭐⭐⭐**
- How it works (isolation via random partitioning)
- Why it's fast and scalable
- When it excels vs when it fails
- Hyperparameter tuning

### **[Ensemble Strategies](https://github.com/welldesignedsystem/friendly-fortnight/blob/main/blog/ensemble.ipynb)**
- Feature bagging
- Score normalization techniques
- Combining multiple detectors for robustness

_Why This Matters: Isolation Forest is the most deployed tree-based anomaly detector in industry. Used by AWS, Azure, and countless companies._
_Practice: High-dimensional data, fraud detection datasets, log anomalies_

---

## Phase 4: One-Class Classification
### **Core Concepts**
- Novelty detection vs outlier detection vs rare class problems
- When you have "normal" examples but few/no anomaly examples

### **Key Algorithms**
- One-Class SVM (OC-SVM)
- Support Vector Data Description (SVDD)
- When to use vs two-class classification

### **Real Applications:**
- Manufacturing quality control (learning from "good" products)
- Network intrusion (training only on normal traffic)
- Equipment health monitoring (baseline from healthy operation)

### **Visualization Integration:**
- Decision boundary visualization
- Support vector plots
- Score distributions for normal vs novel data

_Practice: Imbalanced datasets, cases where anomalies are undefined during training_

---

## Phase 5: Dimensionality Reduction & Autoencoders
### **PCA for Anomaly Detection**
- Reconstruction error approach
- Hotelling's T² and SPE (Q-statistic)
- Incremental PCA for streaming data ⭐

### **Autoencoders ⭐⭐**
- Vanilla autoencoders
- Variational autoencoders (VAE)
- Reconstruction error as anomaly score
- Choosing architecture and bottleneck size

### **Visualization Integration:**
- PCA scatter plots (2D/3D projections)
- Reconstruction error histograms
- Original vs reconstructed comparisons
- Latent space visualization

_When to Use:_
- High-dimensional data (images, multi-sensor systems)
- Complex, non-linear patterns
- When you need feature learning

_Practice: Image anomalies, multi-sensor industrial data, network packet inspection_

---

## Phase 6: Time Series Anomaly Detection
### **Time Series Fundamentals**
- Stationarity, trend, seasonality
- Autocorrelation basics
- Moving averages and exponential smoothing

### **Classical & Statistical Methods**
- Control charts: CUSUM, EWMA ⭐⭐
- Seasonal decomposition (STL)
- ARIMA-based residual analysis

### **Probabilistic Methods **
- Bayesian change point detection
- Hidden Markov Models (HMM) for state-based anomalies
- Probabilistic forecasting with uncertainty bounds

### **ML Approaches ⭐**
- LSTM autoencoders
- Facebook Prophet anomaly detection
- Matrix Profile (exact motif/discord discovery)
- Isolation Forest on windowed features

### **Visualization Integration:**
- Time series plots with anomaly overlays
- Control charts with control limits
- Seasonal decomposition plots
- Lag plots and autocorrelation functions
- Prediction intervals with actual values

_Practice: Server logs, sensor streams, financial time series, DevOps metrics_

---

## Phase 7: Streaming & Online Detection ⭐⭐
### **Core Streaming Concepts**
- Sliding window techniques
- Fixed vs adaptive windows
- Memory vs accuracy tradeoffs

### **Streaming Algorithms**
- Incremental PCA
- Online Isolation Forest variants
- Reservoir sampling for large streams
- Count-Min Sketch for frequency estimation

### **Concept Drift Detection ⭐**
- ADWIN (Adaptive Windowing)
- DDM (Drift Detection Method)
- Page-Hinkley test
- When to retrain models

### **Real-Time Scoring**
- Latency requirements
- Batch scoring vs real-time inference
- Feature computation in streaming context

### **Visualization Integration:**
- Real-time dashboards (Grafana, Kibana)
- Rolling statistics plots
- Drift detection visualizations
- Alert timelines

### **Applications:**
- Log monitoring and security
- IoT sensor networks
- Real-time fraud detection
- Network traffic analysis

_Practice: Kafka/streaming data, build real-time detection pipeline with live dashboard_

---

## Phase 8: Graph-Based Anomaly Detection ⭐
### **Graph Anomaly Types**
- Node anomalies (unusual entities)
- Edge anomalies (unusual relationships)
- Subgraph anomalies (unusual communities)

### **Classical Methods**
- Degree-based detection
- Community detection outliers
- Ego network features
- PageRank anomalies

### **Graph Neural Networks ⭐**
- Graph Convolutional Networks (GCN) basics
- Graph autoencoders
- Temporal graph networks
- When deep learning on graphs is worth it

### **Visualization Integration:**
- Network graphs with anomaly highlighting
- Degree distribution plots
- Community structure visualization
- Temporal graph evolution

### **Real Applications:**
- Fraud ring detection (financial networks)
- Cybersecurity (attack pattern graphs)
- Social network abuse detection
- Supply chain anomalies

_Practice: Transaction networks, social graphs, communication patterns_

---

## Phase 9: Production & Evaluation
### **Evaluation Without Ground Truth ⭐⭐**
- Precision at k
- Volume under surface (VUS)
- Expert validation workflows
- A/B testing anomaly systems

### **Evaluation With Labels**
- Why accuracy is misleading
- Precision, Recall, F1
- ROC-AUC, PR-AUC curves
- Point-adjust metrics for time series

### **Handling Label Uncertainty ⭐**
- Positive-Unlabeled (PU) learning
- Weak supervision strategies
- Noisy label handling
- Human-in-the-loop validation
- Active learning for labeling efficiency

### **Threshold Selection ⭐**
- Statistical approaches (percentile, MAD-based)
- Business-driven thresholds
- Dynamic thresholds
- Multi-threshold strategies

### **Production Challenges**
- Class imbalance (99.9% normal data)
- Alert fatigue management
- Explainability and debugging false positives
- Model monitoring and performance decay
- Retraining strategies
- Feature drift detection

### **Deployment Patterns**
- Batch vs streaming architectures
- Lambda architecture
- Feature stores
- Model serving infrastructure

### **Production Dashboards ⭐⭐**
- Monitoring system health
- Anomaly rate trends
- False positive/negative tracking
- Model performance metrics
- Alert management interfaces

_Practice: End-to-end production pipeline with monitoring dashboards and alerting_

---

## Key Libraries & Tools to Master
### **Python Ecosystem:**
- PyOD - 40+ algorithms, unified API
- scikit-learn - IsolationForest, LOF, OneClassSVM
- stumpy - Matrix Profile for time series
- river - Online/streaming ML
- scipy.stats - Statistical tests
- Facebook Prophet - Time series forecasting/anomalies
- PyTorch Geometric - Graph neural networks

### **Visualization Libraries ⭐⭐**
- Matplotlib/Seaborn - static plots, histograms, box plots
- Plotly ⭐ - interactive plots and dashboards
- Altair - declarative visualization
- hvPlot - easy interactive plots from pandas

### **Production Dashboards:**
- Grafana ⭐⭐ - time series monitoring (industry standard)
- Kibana - log visualization
- Streamlit - rapid ML app prototyping
- Plotly Dash - production-grade dashboards

### **Production Tools:**
- MLflow - experiment tracking
- Docker - containerization
- Apache Kafka - streaming
- FastAPI - model serving

### **Notebooks:**
- Jupyter - interactive exploration
- Observable - web-based viz notebooks

---

## Visual Detection Workflow (Core Practice)
### **Standard Workflow:**
- Histogram/box plot → identify distribution type
- Time series plot → spot temporal patterns
- Scatter/pair plots → find multivariate outliers
- Choose algorithm based on visual insights
- Run algorithm
- Visualize detections for validation
- Build dashboard for monitoring
- Domain experts review visual alerts

_This workflow should be practiced in every phase_

---

### Removed from Consideration (Not Practically Used)
- ❌ Grubbs' test, Dixon's Q test - rarely used at scale
- ❌ t-SNE as detection method - visualization only, not detection
- ❌ K-means as primary detector - pedagogical only
- ❌ GAN-based anomaly detection - unstable, low ROI in production
- ❌ Connectivity-based outlier factor - LOF is better


