# 📊 User Interaction & Feature Usage Analytics

## 📌 Project Overview

This project analyzes **user interaction data** from a web application to understand how users engage with different features.
The goal is to identify **feature adoption, engagement patterns, and behavioral trends** using **Python-based data analysis and visualization**.

The project follows a **Python-first analytics workflow**:

> Raw data → Data cleaning → Exploratory analysis → Visualization → Insights

---

## 🎯 Problem Statement

Web applications offer multiple features, but not all features are equally useful or engaging.

This project answers key questions such as:

* Which features are most and least used?
* How does feature usage change over time?
* Which features show higher user engagement?
* How do user behaviors differ across devices and user types?

---

## 🛠 Tech Stack

* **Language:** Python
* **Libraries:** Pandas, Matplotlib
* **Data Format:** CSV

---

## 📂 Dataset Description

The dataset represents **user interaction events** within a web application.

### Columns

* `event_timestamp` – Time of interaction
* `user_id` – Unique user identifier
* `feature_name` – Application feature interacted with
* `action_type` – Type of interaction (click, view, download)
* `session_id` – User session identifier
* `session_duration_sec` – Session duration in seconds
* `device_type` – Web or mobile
* `user_type` – New or returning user

---

## ⚠️ Data Quality Challenges

The raw dataset intentionally included:

* Missing feature names
* Inconsistent feature naming (e.g., `Dashboard`, `dashboard`)
* Missing session durations
* Duplicate interaction records

These issues were handled during the data cleaning phase to reflect **real-world analytics scenarios**.

---

## 🧹 Data Cleaning & Preparation

Data cleaning was performed using **Pandas**, including:

* Removing duplicate interaction records
* Standardizing feature names to a consistent format
* Handling missing session duration values using median imputation
* Converting timestamps to datetime format
* Creating derived fields such as interaction date and session duration buckets

The cleaned dataset was saved for downstream analysis.

---

## 📈 Analysis Performed

### 🔹 Feature Usage Analysis

* Interaction count per feature
* Identification of most and least used features

### 🔹 Time-Series Analysis

* Daily feature usage trends
* Changes in feature adoption over time

### 🔹 Engagement Analysis

* Session duration distribution across features
* Comparison of engagement levels using box plots

### 🔹 Behavioral Segmentation

* Comparison of interaction patterns between new vs returning users
* Device-based usage analysis (web vs mobile)

---

## 📊 Visualizations (Python)

All visualizations were created using **Matplotlib**, including:

* Bar charts for feature usage distribution
* Line charts for daily usage trends
* Box plots for session duration analysis
* Pie charts for action-type distribution

These charts help communicate insights clearly without relying on BI tools.

---

## 🔍 Key Insights

* A small number of features account for the majority of user interactions
* Feature usage patterns vary significantly over time
* Certain features show higher engagement but greater variability in session duration
* Returning users contribute a larger share of interactions compared to new users
* Web usage dominates over mobile access

---

## 📌 Future Enhancements

* Add cohort-based user retention analysis
* Introduce feature-level funnel analysis
* Automate data refresh and reporting
* Extend analysis with interactive visualizations
