# Arogya AI — Telemedicine Platform (Phase 1: Frontend + MongoDB)

A premium-styled telemedicine web app: drug interaction checker, blood test
uploads, doctor booking, appointment tracking, and a persistent Emergency 108
button — with UI in English, Tamil, Telugu, Kannada, and Malayalam.

**This is Phase 1.** The frontend UI and MongoDB data layer are fully wired
and working. AI symptom-checking logic, real voice/phone calling, live 108
dispatch, and OCR parsing of lab values are intentionally out of scope here —
see "Roadmap" below.

---

## Project structure

```
telemedicine-app/
├── frontend/     React + Vite + Tailwind CSS
└── backend/      Node.js + Express + MongoDB (Mongoose)
```

## Prerequisites

- Node.js 18 or later
- A MongoDB database — either:
  - Local MongoDB (`brew install mongodb-community` / your OS equivalent), or
  - A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended if you don't want to install MongoDB locally)

## 1. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set `MONGODB_URI` to your connection string, e.g.:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/telemedicine
```

Optionally load sample doctors and medicines for demo purposes:

```bash
node seed.js
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`
— it should show `"db":"connected"` once MongoDB is reachable.

## 2. Set up the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

If your API runs somewhere other than `http://localhost:5000`, copy
`frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` accordingly.

## Using the app

1. **Sign up** with a name, phone number, and preferred language.
2. **Drug Checker** — try entering "Warfarin" and "Aspirin" (or "Metformin" and
   "Alcohol") to see the demo interaction logic flag a result.
3. **Health Records** — upload a PDF or image as a sample lab report.
4. **Find a Doctor** — book a slot with one of the seeded doctors.
5. **My Appointments** — see and cancel bookings.
6. The **Emergency 108** button is always visible in the bottom-right corner
   and dials `tel:108` on a phone.

## Roadmap (not built in this phase)

| Phase | What it adds |
|---|---|
| 2 | Replace the mock drug-interaction logic with a licensed clinical database/API |
| 3 | Real-time voice calling between patient and doctor (e.g., Twilio, Agora, or WebRTC) |
| 4 | Live 108 integration with geolocation capture and consent flow |
| 5 | OCR-based extraction of blood test values, with clinical validation, plus full multilingual AI responses (not just translated UI text) |

**Important:** the drug-interaction and emergency-dialing features carry real
regulatory and liability considerations in India. Have a licensed medical
professional and legal counsel review those integrations before any public
launch — this is independent of the engineering work itself.
