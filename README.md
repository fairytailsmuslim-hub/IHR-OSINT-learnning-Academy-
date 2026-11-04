# IHR OSINT — Open Source Intelligence Academy

A complete, production-ready, self-hostable Open Source Intelligence (OSINT) and Cyber Threat Intelligence (CTI) learning academy taking students worldwide from **Zero to Pro** across a strictly gated two-stage curriculum.

---

## Curriculum Architecture (Two Gated Stages)

1. **STAGE A — PASSIVE OSINT FRAMEWORK (Certificate Level)**
   - **5 Phases · 20 Modules (Modules 1–20) · 40 Structured Topics**
   - Teaches strictly **zero-touch passive reconnaissance** (OPSEC sock-puppet isolation, DNS/HTTP/TLS fundamentals, search operators & dorking, Wayback CDX archives, ICANN RDAP, `crt.sh` Certificate Transparency, passive DNS, Shodan/Censys historical datasets, username corroboration, EXIF/C2PA verification, Overpass geospatial queries, and SunCalc chronolocation).
   - **Stage A Capstone & Final Exam**: 40 MCQs + 10 Fill-in-the-Blank + 1 Scenario Investigation Report (70% pass mark). Awards the verifiable **Passive OSINT Certificate (PDF)** and unlocks Stage B.

2. **STAGE B — ADVANCED INVESTIGATION (Threat Intel / SOC / Advanced OSINT)**
   - **3 Phases (Phases 6–8) · 10 Modules (Modules 21–30) · 20 Structured Topics**
   - **LOCKED** until the learner earns the Stage A Passive OSINT Certificate (or signs in with Instructor/Admin privileges).
   - Covers Diamond Model, MITRE ATT&CK Reconnaissance (`TA0043`), STIX 2.1 / TAXII / TLP 2.0, SIEM alert enrichment, phishing kit & CISA KEV triage, GLEIF/OpenCorporates corporate due diligence, ACH bias mitigation, and NATO Admiralty BLUF reporting.
   - **Stage B Capstone & Final Exam**: 40 MCQs + 10 Fill-in-the-Blank + 1 Scenario Investigation Report (70% pass mark). Awards the verifiable **Advanced OSINT & Threat Intel Certificate (PDF)**.

---

## Seeded Demo Accounts (Local & Docker Self-Hosted)

| Role | Email | Password | Pre-Seeded State |
| :--- | :--- | :--- | :--- |
| **Student** | `student@ihr-osint.local` | `Student@12345` | Stage A in progress (Modules 1–2 completed), due Spaced Repetition cards queued, Stage B locked |
| **Admin / Instructor** | `admin@ihr-osint.local` | `Admin@12345` | Full Stage A + Stage B access, Instructor Console unlocked, sample certificates issued |

Learners can also sign in with **Google** for cloud persistence via Firestore and 1-click export of study notes, capstone reports, and progress trackers to **Google Docs** and **Google Sheets**.

---

## Self-Hosted Deployment via Docker (`docker compose up`)

IHR OSINT runs on any Linux/macOS/Windows server or VPS with a single Docker Compose command—no proprietary static hosting required.

```bash
# 1. Start the application and PostgreSQL container
docker compose up --build -d

# 2. Open the academy in your browser
# http://localhost:3000
```

All container environment variables (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `SESSION_SECRET`) have sensible built-in defaults in `docker-compose.yml` and `server.ts`, and can be overridden via environment variables or a local `.env` file when deploying to a public VPS.

---

## Local Development Setup (Without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Verify structured curriculum content seed
npm run seed

# 3. Start full-stack Express + Vite server on port 3000
npm run dev
```

---

## Enabling Optional AI Study Assistant Providers

The curriculum Study Assistant (`POST /api/ai/study-assistant`) supports three automatic tiers:
1. **Google Search Grounding (`gemini-3.8-flash`)**: Enabled automatically when `GEMINI_API_KEY` is configured on the server; returns live grounded web citations.
2. **Self-Hosted Local Ollama RAG**: Set `OLLAMA_BASE_URL="http://localhost:11434"` and `OLLAMA_MODEL="llama3.2"` to run 100% offline/local LLM inference grounded in `/content`.
3. **Zero-LLM Offline Curriculum RAG**: If neither `GEMINI_API_KEY` nor `OLLAMA_BASE_URL` is set, the endpoint falls back cleanly to deterministic curriculum retrieval across topics, tools, and glossary definitions.

---

## Extending Curriculum Content (`/content`)

All academy content lives in clean, human-editable JSON files under `/content`:
- `/content/curriculum.json` — Stages, Phases, Modules, prerequisites, and topic slug mappings.
- `/content/topics/stage-a-part1.json`, `stage-a-part2.json`, `stage-b.json` — All 60 topics (each with all 9 pedagogical sections + 5 Fill-in-the-Blank quiz items).
- `/content/frameworks/frameworks.json` — 6 OSINT & CTI frameworks mapped to module IDs.
- `/content/tools/tools.json` — 55+ authentic OSINT tools with official `https://` URLs and ethical guardrails.
- `/content/labs/labs.json` — 30 lab-safe exercises using RFC 2606 / RFC 5737 / public transparency logs.
- `/content/case-studies/case-studies.json` — 10 documented ethical open-source investigations.
- `/content/glossary.json` — 155+ searchable OSINT & CTI terms.
- `/content/exams/capstones.json` — Stage A and Stage B 40-MCQ + 10-FIB + Scenario Capstone exams.

---

## Architectural Notes

- **Runtime Compatibility**: Built on a unified TypeScript full-stack server (`server.ts` + React 19 + Tailwind CSS v4) so both single-container preview environments and multi-container `docker compose up` deployments run identically on port `3000` with zero native binary build issues (password hashing uses Node's built-in `crypto.scryptSync` with timing-safe comparison).
- **Privacy & Security**: Zero third-party analytics, zero ad trackers, strict passive lab boundaries, and Firestore security rules enforcing owner-only learner progress (`npx eslint firestore.rules` verified). Please review `firestore.rules` before sharing a production deployment broadly.

---

## FULL TEST CHECKLIST

- [ ] **1. Landing Page & Theme Toggle**: Open `/`, verify Two-Stage curriculum overview renders cleanly in both Dark and Light modes, then click **Start Academy**.
- [ ] **2. Demo Student Login & Stage B Lock**: Sign in with `student@ihr-osint.local` / `Student@12345`. Confirm Stage A topics are open, while clicking any Stage B module/lab/exam displays the **Stage B Locked** gate requiring the Passive OSINT Certificate.
- [ ] **3. Adaptive Onboarding Calibration**: Click **Recalibrate Track** on the Dashboard, select a career goal (e.g., *SOC Analyst* or *Investigative Journalist*), save, and verify priority modules update on both the Dashboard and Skill Graph.
- [ ] **4. 9-Section Topic & TryHackMe Fill-in-the-Blank Quiz**: Open any Stage A topic (e.g., *Passive vs Active Recon*), verify all 9 sections appear, click **Hint** on one question, submit trimmed/mixed-case answers, and verify explanations appear after submission and missed/hinted items enter the **Spaced Repetition Queue**.
- [ ] **5. Spaced Repetition Review**: Return to the **Dashboard**, answer a due card in the Spaced Repetition Queue, and verify interval progression / reinforcement feedback.
- [ ] **6. Frameworks & Interactive Skill Graph**: Open **OSINT Frameworks** (verify all 6 SVG diagrams and module links) and **Skill Graph** (verify prerequisite status across Phases 1–8).
- [ ] **7. Verified Tools Directory, Labs, Case Studies & Glossary**: Test search and category filters in **Tools Directory** (55+ real `https://` links), complete a self-check in **Hands-On Labs**, inspect **Case Studies** (10 real investigations), and filter **Glossary** (155+ terms).
- [ ] **8. Full-Text Global Search (`Ctrl+K`)**: Press `Ctrl+K` (or click the top search bar), search `crt.sh` or `Admiralty`, and jump directly to matching topics/tools/frameworks.
- [ ] **9. Stage A Capstone Exam, PDF Certificate & Stage B Unlock**: Open **Stage A Capstone Exam**, submit >= 70% correct answers plus a 50+ word Scenario Report, verify **Stage B unlocks immediately**, and click **Download Passive OSINT Certificate (PDF)**.
- [ ] **10. Google Workspace Export & Instructor Admin Console**:
  - Sign in with Google and test **Export Brief to Google Docs** (from any Topic or Capstone) and **Export Tracker to Google Sheets** (confirming the explicit Workspace confirmation modal appears before creation).
  - Sign in as `admin@ihr-osint.local` / `Admin@12345`, open **Instructor Console**, verify curriculum counts (`2 stages · 8 phases · 30 modules · 60 topics`), and add a custom `https://` OSINT tool.
