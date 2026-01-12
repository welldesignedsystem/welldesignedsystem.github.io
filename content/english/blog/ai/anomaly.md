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

#### Matplotlib

Matplotlib is the most fundamental plotting library in Python and provides fine-grained control over histogram appearance.


```python
# Basic Histogram with Matplotlib
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
    



```python
data = np.random.normal(100, 15, 1000)
# Fixed number of bins - Divides the data range into exactly 20 equal-width bins
plt.hist(data, bins=20)

# Custom bin edges -  Custom bin edges (list/array)
plt.hist(data, bins=[50, 70, 90, 110, 130, 150])

# Automatic bin selection methods
plt.hist(data, bins='auto')  # Options: 'auto', 'sturges', 'fd', 'scott'

```

```text
(array([  1.,   7.,   2.,   6.,  10.,  26.,  31.,  53.,  58.,  65.,  88.,
         98.,  93., 107.,  99.,  70.,  68.,  45.,  31.,  14.,   9.,   9.,
          5.,   3.,   1.,   1.]),
 array([ 51.50394014,  55.30463748,  59.10533482,  62.90603217,
         66.70672951,  70.50742685,  74.30812419,  78.10882154,
         81.90951888,  85.71021622,  89.51091356,  93.3116109 ,
         97.11230825, 100.91300559, 104.71370293, 108.51440027,
        112.31509762, 116.11579496, 119.9164923 , 123.71718964,
        127.51788699, 131.31858433, 135.11928167, 138.91997901,
        142.72067636, 146.5213737 , 150.32207104]),
 <BarContainer object of 26 artists>)
```


    
![png](../img/blog_4_1.png)
    


#### Probability Dentsity and Cumulative Histograms


```python
data = np.random.normal(100, 15, 1000)

# Density histogram (probability density) -
plt.hist(data, bins=30, density=True, alpha=0.7)

# Cumulative histogram
plt.hist(data, bins=30, cumulative=True)

# Step histogram
plt.hist(data, bins=30, histtype='step', linewidth=2)

# Multiple histograms
data2 = np.random.normal(110, 20, 1000)
plt.hist([data, data2], bins=30, label=['Group A', 'Group B'], alpha=0.6)
plt.legend()
```

```text
<matplotlib.legend.Legend at 0x10dd159a0>
```


    
![png](../img/blog_6_1.png)
    


#### Seaborn

Seaborn provides a higher-level interface with attractive default styles and additional statistical features.


```python
# Basic Histogram with KDE
import seaborn as sns

# Histogram with Kernel Density Estimate overlay
sns.histplot(data, bins=30, kde=True)
plt.title('Seaborn Histogram with KDE')
plt.show()
```


    
![png](../img/blog_8_0.png)
    



```python
# Histogram with rug plot (individual data points)
sns.histplot(data, bins=30, kde=True)
sns.rugplot(data, color='red', alpha=0.5)

# Multiple distributions
sns.histplot(data={'Group A': data, 'Group B': data2}, bins=30, kde=True)

# Using a DataFrame
import pandas as pd
df = pd.DataFrame({'values': data, 'category': np.random.choice(['A', 'B'], 1000)})
sns.histplot(data=df, x='values', hue='category', bins=30, kde=True)
```

```text
<Axes: xlabel='values', ylabel='Count'>
```


    
![png](../img/blog_9_1.png)
    



```python
# Note: distplot is deprecated in favor of histplot
sns.displot(data, bins=30, kde=True, height=5, aspect=1.5)
```

```text
<seaborn.axisgrid.FacetGrid at 0x10f13ba10>
```


    
![png](../img/blog_10_1.png)
    


#### Plotly


```python
import plotly.graph_objects as go
import numpy as np

# Sample data
data = np.random.randn(1000)

fig = go.Figure(data=[go.Histogram(x=data, nbinsx=30)])
fig.update_layout(
    title='Interactive Plotly Histogram',
    xaxis_title='Value',
    yaxis_title='Frequency'
)
fig.show()

```



#### Overlay Multiple Histograms


```python
import plotly.graph_objects as go
import numpy as np

fig = go.Figure()
data = np.random.randn(1000)
data2 = np.random.randn(1000)

fig.add_trace(go.Histogram(x=data, name='Group A', opacity=0.6))
fig.add_trace(go.Histogram(x=data2, name='Group B', opacity=0.6))
fig.update_layout(barmode='overlay')
fig.show()
```



#### Pandas


```python
import pandas as pd
import matplotlib.pyplot as plt
df = pd.DataFrame({'scores': data})

# Simple histogram
df['scores'].hist(bins=30)
plt.show()

# Using plot method
df['scores'].plot(kind='hist', bins=30, edgecolor='black')
plt.show()

# Multiple columns
df_multi = pd.DataFrame({
    'Group A': data,
    'Group B': data2
})
df_multi.hist(bins=30, alpha=0.6, figsize=(10, 5))
plt.show()
```


    
![png](../img/blog_16_0.png)
    



    
![png](../img/blog_16_1.png)
    



    
![png](../img/blog_16_2.png)
    


#### Numpy

NumPy doesn't create plots but computes histogram data, which is useful for custom visualizations or analysis.


```python
# Returns histogram values and bin edges
counts, bin_edges = np.histogram(data, bins=30)

print(f"Bin counts: {counts}")
print(f"Bin edges: {bin_edges}")

# Create custom plot
bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2
plt.bar(bin_centers, counts, width=bin_edges[1] - bin_edges[0], edgecolor='black')
plt.show()
```

```text
Bin counts: [ 2  3  4  5 16 21 13 39 43 48 55 75 77 71 73 75 65 63 50 51 34 27 32 24
 10 12  4  2  2  4]
Bin edges: [-2.76267982 -2.57031178 -2.37794374 -2.1855757  -1.99320766 -1.80083961
 -1.60847157 -1.41610353 -1.22373549 -1.03136745 -0.83899941 -0.64663137
 -0.45426332 -0.26189528 -0.06952724  0.1228408   0.31520884  0.50757688
  0.69994492  0.89231296  1.08468101  1.27704905  1.46941709  1.66178513
  1.85415317  2.04652121  2.23888925  2.4312573   2.62362534  2.81599338
  3.00836142]

```


    
![png](../img/blog_18_1.png)
    


#### 2d histogram


```python
import seaborn as sns

x = np.random.normal(0, 1, 1000)
y = np.random.normal(0, 1, 1000)

# NumPy 2D histogram
counts, xedges, yedges = np.histogram2d(x, y, bins=30)

# Visualize with Matplotlib
plt.hist2d(x, y, bins=30, cmap='Blues')
plt.colorbar(label='Frequency')
plt.show()

# Seaborn 2D histogram (hexbin)
sns.histplot(x=x, y=y, bins=30, cmap='viridis')
plt.show()
```


    
![png](../img/blog_20_0.png)
    



    
![png](../img/blog_20_1.png)
    



### Comparison Table

| Library | Best For | Interactivity | Learning Curve | Customization |
|---------|----------|---------------|----------------|---------------|
| Matplotlib | Full control, publication-quality | No | Medium | High |
| Seaborn | Statistical plots, beautiful defaults | No | Low | Medium |
| Plotly | Web apps, dashboards, exploration | Yes | Medium | High |
| Pandas | Quick DataFrame exploration | No | Low | Low |
| NumPy | Data computation, custom analysis | N/A | Low | N/A |

### Choosing the Right Library

- **Quick exploration**: Use Pandas `.hist()` or Seaborn `histplot()`
- **Publication/reports**: Use Matplotlib or Seaborn with custom styling
- **Interactive dashboards**: Use Plotly
- **Statistical analysis**: Use Seaborn for built-in KDE and statistical features
- **Custom calculations**: Use NumPy's `histogram()` function

### Best Practices

1. **Choose appropriate bin sizes**: Too few bins lose detail, too many create noise
2. **Label your axes**: Always include descriptive labels and titles
3. **Consider your audience**: Use interactive plots for exploration, static for reports
4. **Normalize when comparing**: Use `density=True` when comparing distributions with different sample sizes
5. **Show uncertainty**: Consider adding KDE curves or confidence intervals for better interpretation

### Common Bin Selection Methods

- **Sturges' Rule**: `bins = log₂(n) + 1` - Good for normal distributions
- **Freedman-Diaconis**: Based on IQR - Robust to outliers
- **Scott's Rule**: Based on standard deviation - Good for normal-like data
- **Auto**: Matplotlib automatically chooses based on data characteristics

