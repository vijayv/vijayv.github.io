---
layout: post
title: House Price Recovery Analysis
type: project
---

The housing crisis in the United States between 2007 and 2009 devastated many communities across the country. Over the last several years, however, the housing market has slowly recovered to its previous level. Most conclusions in support of this argument are drawn at a country, region, or state level; there are not many tools to see how the rate of recovery varies by specific counties and zip codes. This project seeks to give more insight into the recovery of the housing market in various zipcodes around the country.

## Data
Our primary dataset is research data provided Zillow. It consists of 20 separate csv files; each file has a single feature, aggregated at the zip code level. We wanted to use this data instead of housing data from the U.S. Census or the American Community Survey because much of the feature engineering had already been done for us. For example, the Zillow dataset includes metrics, such as "Percent of Homes Selling for Loss" and “Number of Foreclosed Home Sales”, that would have been difficult and time consuming to reproduce using other sources. However, this decision had some drawbacks because the Zillow data only covered a subset of the country where Zillow operates(see figures 2.1 and 2.2).

*Figure 2.1: This map shows which states were at least partially covered by the data that Zillow Provided.*
<img alt="Figure 2.1" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_0.png"/>

*Figure 2.2: However, within each state, Zillow did not provide housing information for every zip code.*
<img alt="Figure 2.2" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_1.png"/>

## Data Manipulation
In order to make subsequent work with the data more simple, we combined all of the CSV files into one master file by using Pandas and Numpy. *Note: Due to an error in git, we lost our IPython notebook that generated this master file. However, we were able to recover the csv file output from our email history.*

The dataset was fairly robust and did not require much cleaning. The major hurdle that we faced was that for some of the metrics, the data extended to a larger date range than others. However, for this analysis, I decided to focus on one specific composite metric, which allowed me to circumvent the issue.

# Visualizing differences
The dataset tracked different features about the real estate market over time. The grain for each feature dataset was zip code by month. Before I started trying to do any machine learning on the data, I had some concerns that due to the fact that Zillow is based in Seattle Washington, there might be a bias towards the west coast in their data. Therefore, I created a Tableau visualization that shows the number of records per state in the dataset.

*Figure 3.1: Number of records by state in the Zillow dataset.*
<img alt="Figure 3.1" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_2.png"/>

Figure 3.1 shows that California has more than double the number of records than any other state in the dataset. The top five states in the total number of records were: California, Arizona, Washington, Maryland, and Virginia. Given this finding, I made the assumption that states that had only a few records were areas where Zillow data was less reliable. Therefore, I limited my analysis to only states where I had more than a thousand records. This subset consisted of 18 states.

*Figure 3.2: the 18 states that were kept for the analysis*
<img alt="Figure 3.2" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_3.png"/>

Using this smaller set of states, I created various Tableau visualizations to try to gain a better understanding of the data. While there were many interesting trends that surfaced through this analysis, one of the most interesting was the fact that the housing recovery seemed to happen at different rates in different states and zip codes.

*Figure 3.3: The number of homes sold for less than they were purchased for by state during February 2015.*
<img alt="Figure 3.3" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_4.png"/>

In figure 3.3, it is clear that there are some geographical differences between states in how they recovered from the housing market crash of 2008, especially when viewing the trend of this metric over time.

*Figure 3.4: Note the difference in recoveries between California and Ohio. Despite being at the same point at one time, each state recovered at a completely different pace.*
<img alt="Figure 3.4" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_5.png"/>

The same trend is observed within the state, where different zip codes show different rates of improvement.

*Figure 3.5: Within the state of California, more affluent places like Beverly Hills show a different rate of recovery than more rural, less economically well off places, such as zip codes associated with the city of Chico.*

<img alt="Figure 3.5" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_6.png"/>

These Tableau dashboards are available on my public Tableau profile at this [link](https://public.tableau.com/profile/vijay.velagapudi#!/).

## Time-Series Clustering

Given the findings presented in the previous section, I wanted to see if could cluster various zip codes based on how the "Percent of Homes Selling for Less" metric changed over time. The reason why I chose this metric is because, in essence, it is a composite metric that is a result of many other factors. For example, whether a house sells for more or less than its purchase price is determined by many factors such as macroeconomic reasons, changes in the neighborhood, and other many other factors. Therefore, despite using just this single metric as a feature, it would provide a metric that would provide a pretty good indication of the state of the housing market.

*Figure 3.6: The chart shows a simple illustration of the type of clustering that I wanted to perform on the Zillow data. Each line represents how the "Percent of Homes Selling for Loss" metric changed over time. The color of each line represents the cluster that it belonged to as determined by the algorithm.*
<img alt="Figure 3.6" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_7.png"/>

My primary tools of choice were Python and SciKit Learn. However, SciKit Learn does not have any built-in algorithms that would could perform time series clustering (at least at the time of this writing). After some deliberation, I decided to first define a Euclidean distance measure and perform clustering on the results. However, Euclidean distance in this use case has some shortcomings. For example, two lines can follow similar paths but the time the events occur may be misaligned. A simple Euclidean distance measure would wrongly penalize these differences. A more sophisticated algorithm needs to be more flexible. After further research, I decided to implement Dynamic Time Warping, explained well [here]((http://nbviewer.ipython.org/github/alexminnaar/time-series-classification-and-clustering/blob/master/Time%20Series%20Classification%20and%20Clustering.ipynb)).

After imputing missing values and replacing them with the mean for each zip code, I started experimenting with different number of clusters. A rough rule of thumb for K-means clustering is using sqrt(no_of_observations/2). However, this number was too large for my analysis and did not make the resulting clusters easy to explore. Therefore, I attempted the clustering with 10 clusters.

*Figure 3.7: Results from using 10 clusters. Each line represents a zip code and color represents the computed cluster.*
<img alt="Figure 3.7" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_8.png"/>

Early results of the data showed, that while the clustering algorithm worked relatively well, there was a lot of overlap in the clusters (Figure 3.7). Therefore, I attempted the clustering again with k=4 and the resulting clusters were much easier to explore.

*Figure 3.8: The four clusters were interpreted and identified as below*.
<img alt="Figure 3.8" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_9.png"/>

While there some zip codes that may have been miscategorized, to a large extent, the algorithm did relatively well in assigning zip codes to the correct clusters. For future analysis, I would be beneficial to explore how additional feature engineering, such as using the z-score, or the using difference in percentage difference between one time period to the next, instead of the raw percentage would have affected the overall clustering. However, I was generally happy with the results and instead wanted to focus exploring the geographical trends that I was originally interested in.

First, my initial suspicions that the more affluent zip codes were less affected was confirmed:

*Figure 3.9: The two clusters that recovered quickly from the housing market collapse had higher average home purchase and average rental prices.*
<img alt="Figure 3.9" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_10.png"/>

Visualizing these clusters on a map, it is clear that there are also some geographical differences between various counties and zip codes.

*Figure 3.10: These are the zipcodes of the San Francisco Bay Area where each color represents a different cluster. While most of the zip codes around the Bay Area were only lightly affected in this dataset, several counties do standout as being more affected than others. Furthermore, some of the zip codes that are further away from the metropolitan areas seem to be struggling and slower to recover than others.*
<img alt="Figure 3.10" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_11.png"/>

*Figure 3.11: Greater Los Angeles shows the same behavior where zip codes closer to the metropolitan areas seem to have been less affected than the zip codes that are further away.*
<img alt="Figure 3.11" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_12.png"/>

*Figure 3.12: There was a large group of zip codes along the Northeastern United States where it seems that houses are still being sold for less than than they were bought for.*
<img alt="Figure 3.12" class="materialboxed" src="{{ site.baseurl }}/assets/images/house_price_recovery_analysis_13.png"/>

The clustering and the resulting visualizations help raise some important questions that require further analysis. This may include more qualitative analysis that is outside the scope of this project but would be extremely insightful into why two counties that are in roughly in the same geographic area have two different recoveries. You can exlore the culstered data visualization [here](https://public.tableau.com/profile/vijay.velagapudi#!/).

