# ReactionFusion: Multimodal Sinhala Sentiment & Emotion Analysis Platform

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?style=flat&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3)

**ReactionFusion** is an end-to-end multimodal AI platform designed to decode complex social media discourse in **Sinhala**. By jointly fusing **Sinhala text semantics** (posts and comments) with the **complete 7-dimensional Facebook reaction distribution** (`Like`, `Love`, `Care`, `Haha`, `Wow`, `Sad`, `Angry`), ReactionFusion eliminates ambiguity surrounding sarcasm, satirical mockery, and collective social sentiment.

---

## Group Project Work Breakdown & Contribution Flow

This repository serves as the **central Git repository** for the 4-member group project. Members initialize and contribute to the repository chronologically:

| Member | Role & Specialization | Key Deliverables & Code | Handoff Artifact |
| :---: | :--- | :--- | :--- |
| **K.A.A Dilshan** | **Data Engineering, Human Annotation & Sinhala NLP Lead** | Facebook post scraping, 3-annotator protocol, zero-leakage splits (`data/releases/emotion_22_v2/`), Sinhala normalization, 5,000-d TF-IDF extraction | Frozen Dataset Release (`v2`) & Feature Extractors |
| **L.W.L Silva** | **Deep Learning & Multimodal Neural Network Lead** | PyTorch `MultimodalEmotionNet` (dual-branch text + reaction fusion), multi-label weighted BCE training, threshold calibration (0.40–0.90), 22-emotion benchmarks | Trained Model Checkpoint (`best_emotion_model.pt`) & Configs |
| **K.A.P.B Himaranshi** | **Explainable AI & Inference Microservice Lead** | Phase 10 Decision Tree Sentiment Mapper, clinical evidence sums ($S_{	ext{pos}}, S_{	ext{neg}}$), sarcasm resolution engine, asynchronous FastAPI microservice (`port 8000`), test suite | Live REST API (`/api/v1/analyze`) & Explainability Engine |
| **Tharindu Kothalawala** | **Full-Stack Platform, Mock Facebook & Extension UI/UX Lead** | Mock Facebook React 19 frontend (`port 3000`), Express/Prisma/SQLite backend (`port 4000`, 36 users seed), Grammarly-style Manifest V3 Chrome Extension, DOM body portal overlay | Deployed Social Media Platform & Browser Extension |

---

## System Architecture

```
[ Sinhala Text (5000-d TF-IDF) ] --------+
                                         |--> [ Multimodal Fusion Layer ] --> [ 22 Sigmoid Emotion Heads ]
[ Facebook Reactions (7-d Normalized) ] -+                    |
                                                              v
                                              [ Phase 10 Decision Tree Mapper ]
                                              (Clinical Evidence Sums + Sarcasm Logic)
                                                              |
                                                              v
                                              [ 4-Class Explainable Sentiment ]
                                              (POSITIVE | NEGATIVE | MIXED | NEUTRAL)
```

---

## Dataset & Benchmark Performance

* **Dataset Release (`emotion_22_v2`)**: 4,997 authentic public Sri Lankan Facebook posts, human-annotated across 22 fine-grained emotional categories:
  * **Train**: 3,486 posts (69.8%)
  * **Validation**: 756 posts (15.1%)
  * **Test**: 755 posts (15.1%)
* **Zero-Leakage Guarantee**: Group-aware text stratification ensures identical reposted text strings never cross split boundaries.

### Benchmark Metrics on Unseen Test Partition ($N = 755$)

| Metric | Score | Description |
| :--- | :---: | :--- |
| **Macro-AP (Average Precision)** | **0.612** | Mean area under Precision-Recall curve across all 22 emotion heads |
| **Macro-F1 (Unweighted)** | **0.558** | Balanced harmonic mean treating low and high support classes equally |
| **Micro-F1 (Instance-Weighted)** | **0.632** | Global multi-label instance classification effectiveness |
| **Hamming Loss** | **0.122** | Fraction of incorrectly predicted binary emotion labels (lower is better) |
| **Multimodal F1 Gain** | **+14.5%** | Performance lift of multimodal fusion over text-only unimodal baseline |
| **Sarcasm Resolution F1** | **0.608** | Precision: 0.527, Recall: 0.718 under negative emotional context |

---

## Chronological Project Setup & Contribution Guide

To rebuild or contribute to the project step-by-step:

### Step 1: Clone Repository
```bash
git clone https://github.com/waruna-2003/Reaction-Fusion.git
cd Reaction-Fusion
```

### Step 2: Member 1 Contribution (Data & NLP)
1. Add `data/` and `src/reactionfusion/features/`.
2. Verify dataset release:
   ```bash
   python scripts/prepare_emotion_dataset.py
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "feat(data): add emotion_22_v2 dataset release and Sinhala NLP extractors"
   git push origin main
   ```

### Step 3: Member 2 Contribution (Deep Learning)
1. Add `src/reactionfusion/models/`, `models/emotion_only/`, and `configs/emotion_model.yaml`.
2. Evaluate benchmark:
   ```bash
   python scripts/evaluate_emotion_model.py
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "feat(models): add MultimodalEmotionNet architecture and calibrated weights"
   git push origin main
   ```

### Step 4: Member 3 Contribution (Explainable AI & FastAPI)
1. Add `src/reactionfusion/mapping/`, `platform/backend/`, and `tests/test_api_server.py`.
2. Run test suite:
   ```bash
   pytest tests/test_api_server.py
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "feat(api): add Phase 10 sentiment mapper and FastAPI microservice"
   git push origin main
   ```

### Step 5: Member 4 Contribution (Platform & Chrome Extension)
1. Add `mock facebook/`, `mock-facebook-backend/`, and `platform/plugin/`.
2. Install and seed database:
   ```bash
   cd mock-facebook-backend && npm install && npm run seed && cd ..
   cd "mock facebook" && npm install && cd ..
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "feat(platform): add Mock Facebook platform and Manifest V3 Chrome Extension"
   git push origin main
   ```

---

## Running the Reconstructed Platform

Run the three core services concurrently:

1. **ML Inference Engine (Port 8000)**:
   ```bash
   python scripts/run_plugin_backend.py
   # Swagger docs: http://localhost:8000/docs
   ```
2. **Mock Facebook Backend (Port 4000)**:
   ```bash
   cd mock-facebook-backend && npm run dev
   # REST API: http://localhost:4000/api/posts
   ```
3. **Mock Facebook Frontend (Port 3000)**:
   ```bash
   cd "mock facebook" && npm run dev
   # Web App: http://localhost:3000
   ```
4. **Chrome Extension**:
   - Go to `chrome://extensions/` $	o$ Enable Developer Mode.
   - Click **Load unpacked** $	o$ Select `platform/plugin/`.
   - Open `http://localhost:3000` to analyze posts in real-time.

---

## Academic Reference & Thesis Mapping
* **K.A.A Dilshan**: Chapter 3 (*Data Acquisition, Corpus Linguistics & Annotation Governance*)
* **L.W.L Silva**: Chapter 4 (*Multimodal Deep Neural Architecture & Emotion Classification*)
* **K.A.P.B Himaranshi**: Chapter 5 (*Explainable AI Decision Systems & High-Performance Inference*)
* **Tharindu Kothlawala**: Chapter 6 (*Platform Architecture, External Social Emulation & Browser Extensions*)

*(c) 2026 ReactionFusion Team. All rights reserved.*
