# User Interaction and Feature Usage Analytics / Feature Pulse 📊

> **A full-stack product analytics platform that turns raw user interaction data into actionable product insights.**

FeaturePulse enables product teams, analysts, and engineers to upload application event data and explore **user behaviour, feature adoption, funnels, retention cohorts, platform usage, and AI-powered insights** through an interactive analytics dashboard.

The platform combines a **React + TypeScript frontend**, **FastAPI backend**, **Pandas analytics engine**, **SQLite database**, and **locally hosted Llama 3.2 model through Ollama**.

---

## ✨ Key Features

### 📥 Data Ingestion

* CSV and Excel dataset support
* Event schema validation
* Dataset parsing and processing using Pandas
* Dataset management
* Dataset preview
* Structured validation errors
* Support for large event datasets

### 📈 Product Analytics

Analyze application usage through:

* Active Users
* Total Events
* Total Sessions
* Average Session Duration
* Bounce Rate
* Retention Rate
* Average Events per User

### 🚀 Feature Adoption

Understand how users interact with individual product features.

* Most-used features
* Feature adoption
* Feature usage trends
* Feature growth
* Feature comparison

### 👥 Platform Analytics

Analyze user behaviour across:

* Device type
* Browser
* Operating system
* Time of day

### 🔀 Funnel Analysis

Create custom event funnels and identify user drop-offs.

Example:

```text
Landing Page
      ↓
Sign Up
      ↓
Onboarding
      ↓
First Action
```

The funnel analysis provides:

* Conversion rate
* Completion rate
* Step-by-step drop-off
* User progression

### ♻️ Cohort Retention

Analyze how users continue interacting with a product after their initial activity.

* Day 1 retention
* Day 7 retention
* Day 30 retention
* Cohort retention matrix
* Retention visualization

---

# 🤖 Local AI Insights

FeaturePulse integrates a **locally hosted Llama 3.2 model through Ollama** to provide AI-powered analytics insights.

Instead of sending raw event data to an external AI provider, FeaturePulse first processes the data through its analytics engine.

```text
Raw Event Data
      │
      ▼
Pandas Analytics Engine
      │
      ├── KPIs
      ├── Feature Metrics
      ├── Funnel Metrics
      ├── Retention Metrics
      └── Platform Metrics
              │
              ▼
       Structured Metrics
              │
              ▼
       Ollama / Llama 3.2
              │
              ▼
      AI-Generated Insights
```

This architecture keeps the deterministic analytics calculations separate from the generative AI layer.

### AI capabilities

The AI layer can generate:

* Executive summaries
* Product usage observations
* Feature adoption insights
* Trend explanations
* Potential friction points
* Product recommendations
* Natural-language answers to analytics questions

### Example

A user can ask:

```text
Which feature is performing the best?

Why did user engagement decrease?

Which platform has the highest engagement?

Where are users dropping off?

What should the product team investigate?
```

The analytics engine provides the relevant aggregated metrics to Llama 3.2, which then converts those metrics into a human-readable response.

> **Privacy-oriented design:** FeaturePulse uses local LLM inference through Ollama, allowing analytics context to remain within the local environment rather than requiring an external LLM API.

---

# 🧠 AI Architecture

FeaturePulse deliberately does **not** allow the LLM to calculate core analytics metrics.

For example:

```text
                 ┌─────────────────────┐
                 │    Raw Event Data   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Pandas Analytics  │
                 │       Engine        │
                 └──────────┬──────────┘
                            │
                    Deterministic
                      calculations
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Aggregated Metrics │
                 │       JSON          │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Ollama / Llama    │
                 │        3.2          │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Human-readable     │
                 │     Insights        │
                 └─────────────────────┘
```

This approach provides:

* More reliable metric calculations
* Smaller AI prompts
* Lower inference overhead
* Better separation of responsibilities
* Reduced exposure of raw event data
* More explainable analytics

---

# 🛠️ Tech Stack

## Frontend

| Technology    | Purpose                |
| ------------- | ---------------------- |
| React         | User interface         |
| TypeScript    | Type-safe development  |
| Vite          | Frontend build tooling |
| Material UI   | UI components          |
| Recharts      | Data visualization     |
| Axios         | REST API communication |
| React Context | Application state      |

## Backend

| Technology | Purpose               |
| ---------- | --------------------- |
| Python     | Backend and analytics |
| FastAPI    | REST API framework    |
| Pydantic   | Data validation       |
| Pandas     | Data processing       |
| SQLAlchemy | Database ORM          |
| JWT        | Authentication        |
| bcrypt     | Password hashing      |

## Database

### SQLite

SQLite is currently used as the application's database.

It stores application data such as:

* Users
* Datasets
* Events
* Analytics-related metadata

SQLite was selected for the current version because it provides:

* Zero database server configuration
* Simple local development
* Easy project setup
* Lightweight persistence

A production deployment could migrate to PostgreSQL without requiring major changes to the application's ORM layer.

## AI

### Ollama + Llama 3.2

FeaturePulse uses:

* **Ollama** — local LLM runtime
* **Llama 3.2** — language model used for analytics insights

The model runs locally and communicates with the FastAPI backend.

---

# 🏗️ System Architecture

```text
┌──────────────────────────────────────────┐
│             React + TypeScript           │
│                  MUI                     │
│                                          │
│ Dashboard │ Analytics │ Events │ AI     │
└────────────────────┬─────────────────────┘
                     │
                 REST API
                     │
                     ▼
┌──────────────────────────────────────────┐
│                 FastAPI                  │
│                                          │
│ Auth │ Datasets │ Analytics │ AI         │
└───────┬──────────────┬──────────────┬────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌──────────────┐
│   SQLite    │ │   Pandas    │ │    Ollama    │
│  Database   │ │  Analytics  │ │   Llama 3.2  │
└─────────────┘ └─────────────┘ └──────────────┘
```

---

# 📁 Project Structure

```text
Feature_Pulse/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── routes/
│   │   │       ├── ai.py
│   │   │       ├── analytics.py
│   │   │       ├── auth.py
│   │   │       └── datasets.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   │
│   │   ├── models/
│   │   │   ├── dataset.py
│   │   │   ├── event.py
│   │   │   └── user.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── ai.py
│   │   │   ├── analytics.py
│   │   │   ├── dataset.py
│   │   │   ├── token.py
│   │   │   └── user.py
│   │   │
│   │   ├── services/
│   │   │   ├── ai_client.py
│   │   │   ├── analytics.py
│   │   │   ├── data_loader.py
│   │   │   ├── ingestion.py
│   │   │   └── insights.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── theme/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
├── data/
│   ├── analysis.ipynb
│   └── generate_data.py
│
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## Prerequisites

Install the following:

* Python 3.11+
* Node.js 18+
* npm
* Git
* Ollama

---

## 1. Clone the Repository

```bash
git clone https://github.com/itanishkaa/User-Interaction-Feature-Usage-Analytics.git

cd User-Interaction-Feature-Usage-Analytics
```

---

# 2. Install Ollama

Install Ollama from its official website and verify the installation:

```bash
ollama --version
```

Pull the Llama 3.2 model:

```bash
ollama pull llama3.2
```

Start Ollama:

```bash
ollama serve
```

The default Ollama API is:

```text
http://localhost:11434
```

---

# 3. Backend Setup

```bash
cd backend
```

Create a virtual environment.

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 4. Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL=sqlite:///./featurepulse.db

SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

> Do not commit `.env` files or secrets to GitHub.

---

# 5. Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

---

# 6. Start the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide the local frontend URL, typically:

```text
http://localhost:5173
```

---

# 🔄 Application Flow

```text
User
 │
 ▼
React Dashboard
 │
 │ REST + JWT
 ▼
FastAPI
 │
 ├───────────────┐
 ▼               ▼
SQLite         Pandas
Database       Analytics
 │               │
 │               ├── KPIs
 │               ├── Features
 │               ├── Funnels
 │               └── Retention
 │
 └───────────────┐
                 ▼
          Aggregated Metrics
                 │
                 ▼
         Ollama / Llama 3.2
                 │
                 ▼
           AI Insights
                 │
                 ▼
          React Dashboard
```

---

# 🗺️ Roadmap

### Foundation

* [x] FastAPI backend structure
* [x] React + TypeScript frontend
* [x] SQLite database
* [x] Authentication foundation
* [x] Dataset management foundation
* [x] Analytics service architecture
* [x] Local Ollama integration

### Analytics

* [ ] Dataset upload
* [ ] Schema validation
* [ ] KPI calculations
* [ ] Feature adoption analytics
* [ ] Platform analytics
* [ ] Event explorer
* [ ] Funnel analysis
* [ ] Retention cohorts

### AI

* [ ] Automated analytics summary
* [ ] Trend explanations
* [ ] Product recommendations
* [ ] Natural-language analytics Q&A
* [ ] Context-aware AI responses

---

# 🔮 Future Enhancements

The following capabilities may be added in future versions:

* PostgreSQL support
* Real-time event streaming
* Kafka integration
* Spark-based processing
* Predictive analytics
* Churn prediction
* Anomaly detection
* Session replay
* Saved dashboards
* Scheduled reports
* Team workspaces
* Role-based access control

---

# 🧠 Engineering Decisions

### Why FastAPI?

FastAPI provides a lightweight, type-safe API layer with automatic OpenAPI documentation and strong integration with Python's data ecosystem.

### Why Pandas?

Pandas provides efficient data manipulation and aggregation capabilities required for event analytics, funnels, retention calculations, and feature usage analysis.

### Why SQLite?

SQLite keeps the project simple to run locally while providing persistent relational storage. SQLAlchemy also keeps the persistence layer flexible for a future PostgreSQL migration.

### Why Ollama?

Ollama allows the application to run an LLM locally without requiring an external AI service.

This makes FeaturePulse useful for demonstrating **privacy-conscious AI integration** while keeping the AI infrastructure simple for local development.

### Why Llama 3.2?

Llama 3.2 provides a locally runnable language model suitable for generating summaries, explanations, and natural-language responses from structured analytics context.

### Why not send raw events to the LLM?

Raw event data can be large, noisy, and unnecessary for most analytical questions.

FeaturePulse therefore follows:

```text
Raw Events
    ↓
Deterministic Analytics
    ↓
Aggregated Metrics
    ↓
LLM Context
    ↓
AI Explanation
```

This keeps the AI layer focused on **reasoning and explanation**, while the analytics engine remains responsible for numerical calculations.

---

# ⚠️ AI Disclaimer

AI-generated insights are intended to assist with product analysis and should not be treated as definitive business conclusions.

Users should validate AI-generated recommendations against the underlying analytics and business context.

---

# 👩‍💻 Author

**Tanishka Goel**

---

License information will be added as the project is prepared for broader distribution.

---

## ⭐ FeaturePulse

**From raw user events → analytics → AI-powered product insights.**
