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
- ![img.png](../img/z.png)

### Modified Z-Score
- **What:** Z-score using median and MAD instead of mean and SD
- **Use when:** Outliers contaminate mean/SD, need robust standardization
- **Don't use when:** Clean normal data, classical Z-score works fine
- **Forumla**
- ![modified_z.png](../img/modified_z.png)

---

## Univariate Visualization**
### Histograms ⭐ - spot distribution shape, outliers at tails

A histogram represents the frequency distribution of continuous data by dividing it into bins (intervals) and counting how many values fall into each bin. Unlike bar charts that show categorical data, histograms display numerical distributions.

#### Libraries Overview

following explores histogram creation using:
- **Matplotlib** - The foundational plotting library
- **Seaborn** - Statistical visualization built on Matplotlib
- **Plotly** - Interactive web-based visualizations
- **Pandas** - Quick plotting from DataFrames
- **NumPy** - Computing histogram data

## 1. Matplotlib

Matplotlib is the most fundamental plotting library in Python and provides fine-grained control over histogram appearance.

### Basic Histogram


```python
import matplotlib.pyplot as plt
import numpy as np

# Generate sample data
data = np.random.normal(100, 15, 1000)

# Create histogram
plt.hist(data, bins=30, color='skyblue', edgecolor='black')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.title('Basic Histogram with Matplotlib')
plt.show()
```


    
![png](../img/blog_3_0.png)
    

