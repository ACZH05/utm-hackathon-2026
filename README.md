# 🌱 AgriTwin AI: Precision Urban Farming

> **UTMxHackathon '26 Submission**
> Empowering sustainable urban agriculture through real-time 3D visualization and intelligent Gemini-powered automation.

AgriTwin AI is a comprehensive **Digital Twin** and **AI-Driven Management System** for vertical farming. It bridges the gap between complex agricultural data and actionable insights, enabling anyone to manage high-yield urban farms with precision and ease.

---

## 📽️ System Showcase

### 🌐 Procedural 3D Digital Twin
Built with **Three.js** and **React Three Fiber**, our digital twin provides more than just a static view:
- **Procedural Growth:** Plants are procedurally generated with varying scales and rotations for a realistic representation.
- **Live Interaction:** The 3D model mirrors real-time device states—fans rotate when active, LED lights change spectrum and intensity, and pump status is reflected through emissive indicators.
- **Zone Awareness:** Supports a multi-tier architecture (Tiers A, B, and C) with independent lighting and monitoring.
- **Intelligent Zoom:** Use the `Bounds` API for cinematic, click-to-focus navigation on specific farm components.

### 🤖 Hybrid AI Intelligence Engine
Our AI Engine (FastAPI) utilizes a unique **Hybrid Inference Model**:
- **Primary Path:** Google **Gemini AI** generates complex, context-aware growth recommendations and automation schedules.
- **Adaptive Fallback:** A robust, **deterministic rule-based engine** takes over if the AI is unavailable, ensuring the farm remains safe 24/7.
- **Confidence Scoring:** Every AI decision is backed by a confidence score, calculated based on how closely sensor data aligns with plant profiles.

### ⚙️ Precision Monitoring & Simulation
AgriTwin AI goes beyond simple alerts with high-fidelity control logic:
- **5-Dimensional Monitoring:** Tracks and analyzes Temperature, Humidity, Soil Moisture, Water pH, and Water Levels simultaneously.
- **Suggested Action Engine:** Provides clear, actionable steps (e.g., "Refill Reservoir", "Adjust Spectrum") with associated severity and confidence.
- **Modulo-Based Simulation:** Our proprietary simulation engine uses modulo arithmetic on mock time to accurately predict pump cycles and irrigation windows based on custom intervals.
- **Pre-Validation:** All automation settings are strictly validated via a type-safe layer before being applied to the twin.

---

## 🏗️ Technical Architecture
AgriTwin AI is built on a scalable, decoupled architecture:

1.  **Frontend (Next.js 15):** Orchestrates the 3D scene, manages application state with **Zustand**, and provides a responsive UI for farm monitoring.
2.  **AI Engine (FastAPI):** A high-performance Python service dedicated to AI inference and agricultural rule processing.
3.  **Persistence Layer:** Supports both **SQL (PostgreSQL/Supabase)** for historical metrics and a **Mock-First State** for rapid prototyping and offline demos.

---

## 🛠️ Tech Stack
| Layer | Technologies |
| --- | --- |
| **Frontend** | Next.js 15, TypeScript, Three.js, React Three Fiber, Drei, Tailwind CSS, Lucide React |
| **Backend/AI** | Python 3.10+, FastAPI, Gemini AI, Pydantic, Uvicorn |
| **Data/State** | Supabase (PostgreSQL), Zustand, SWR |
| **DevOps** | Vercel, GitHub Actions, Docker (Optional) |

---

## 📁 Project Structure

```text
utm-hackathon-2026/
├── ai-engine/                  # 🤖 AI & Intelligence Service
│   ├── app/                    # FastAPI Application
│   │   ├── core/               # Config & Gemini Integration
│   │   └── features/           # Automation & Recommendation logic
│   ├── tests/                  # Pytest suite
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment template
├── digital-twin-farming-system/# 🌐 Frontend & Control Center
│   ├── app/                    # Next.js Pages & API Routes
│   ├── components/             # React & 3D (Three.js) Components
│   ├── db/                     # SQL Migrations
│   ├── lib/                    # Validation, Repository, & Mock logic
│   ├── public/                 # 3D Models & Static Assets
│   └── package.json            # Node.js dependencies
└── docs/                       # Project Documentation & Case Studies
```

---

## 🚦 Getting Started

### 1. Setup AI Engine (Backend)
```bash
cd ai-engine
python -m venv .venv
source .venv/bin/activate  # Or .\.venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
# Create .env and add your GEMINI_API_KEY
uvicorn app.main:app --reload
```

### 2. Setup Digital Twin System (Frontend)
```bash
cd digital-twin-farming-system
npm install
npm run dev
```

### 🧪 Running Tests
- **Backend:** `cd ai-engine && pytest`
- **Frontend:** `cd digital-twin-farming-system && npm test` (if configured)

---

## ⚙️ Environment Configuration

### AI Engine (`ai-engine/.env`)
| Variable | Description | Default |
| --- | --- | --- |
| `GEMINI_API_KEY` | Your Google Gemini API Key | Required for AI |
| `GEMINI_MODEL` | The Gemini model version to use | `gemini-2.5-flash-lite` |

### Frontend (`digital-twin-farming-system/.env`)
| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Optional (falls back to mock) |

---

## 🤖 AI Engine API Details

The AI Engine exposes high-performance endpoints for precision farming. It automatically falls back to deterministic rule-based logic if the Gemini API is unreachable.

---

## 🎯 Case Study Alignment: UTMxHackathon '26
AgriTwin AI was engineered specifically to solve the challenges outlined in **Case Study 1: Precision Urban Agriculture**:

| Requirement | Our Solution |
| --- | --- |
| **Real-time Monitoring** | 5D sensor dashboard (Temp, Humidity, Soil, pH, Water). |
| **Automated Control** | Hybrid AI/Rule-based engine for LED, Fans, and Pumps. |
| **Data-Driven Insights** | Actionable "Suggested Actions" with severity and confidence scores. |
| **Predictive Alerts** | Real-time threshold monitoring with visual 3D indicators. |
| **Scalability** | Decoupled Next.js/FastAPI architecture with multi-tray support. |
| **Resource Optimization** | Precision irrigation cycles to minimize water/electricity waste. |

---

## 👥 The Team
- **Member 1:** 3D Visualization & Graphics Engineer
- **Member 2:** AI Architect & Backend Developer
- **Member 3:** System Integrator & Frontend Lead

---

*AgriTwin AI: Cultivating the Future of Food.*
� Future Roadmap
- [ ] **Multi-Rack Scaling:** Expansion to support entire greenhouse facilities.
- [ ] **Computer Vision:** Real-time leaf analysis for nutrient deficiency detection.
- [ ] **Edge Computing:** Integration with physical IoT sensors (ESP32/Raspberry Pi).
