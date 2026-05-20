# TN Welfare Connect — Full Stack App

A Tamil Nadu Charity & Welfare Platform with **Flask (Python) backend** and **React + Tailwind CSS frontend**.

---

## 📁 Project Structure

```
tn-welfare/
├── backend/
│   ├── app.py              # Flask REST API
│   └── requirements.txt    # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx         # All React components
    │   ├── main.jsx        # Entry point
    │   └── index.css       # Tailwind base styles
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## 🚀 Setup & Run

### Step 1: Backend (Flask)

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
# → Runs on http://localhost:5000
```

### Step 2: Frontend (React + Vite)

Open a **new terminal**:

```bash
cd frontend

# Install Node dependencies
npm install

# Start dev server
npm run dev
# → Runs on http://localhost:3000
```

### Step 3: Open App
Visit **http://localhost:3000** in your browser.

---

## 🔌 API Endpoints (Flask)

| Method | Endpoint           | Description                  |
|--------|--------------------|------------------------------|
| GET    | /api/stats         | Dashboard statistics         |
| GET    | /api/updates       | Recent platform updates      |
| GET    | /api/schemes       | List schemes (filter/search) |
| POST   | /api/schemes       | Create new scheme (admin)    |
| POST   | /api/applications  | Submit scheme application    |
| GET    | /api/services      | List local services          |
| POST   | /api/services      | Create new service (admin)   |
| GET    | /api/causes        | Donation causes              |
| POST   | /api/donate        | Make a donation              |
| POST   | /api/help-requests | Submit help request          |
| POST   | /api/volunteers    | Register as volunteer        |
| GET    | /api/impact        | Transparency ledger          |

---

## 👤 Roles

| Role  | Access |
|-------|--------|
| **Admin** | Create/manage schemes & services, view all data |
| **Citizen** | Browse, apply, donate, volunteer, request help |

---

## 🛠 Tech Stack

- **Backend**: Python 3.8+, Flask 3.0, Flask-CORS
- **Frontend**: React 18, Vite 5, Tailwind CSS 3
- **Data**: In-memory (no database setup needed — upgrade to SQLite/PostgreSQL easily)

---

## 📦 Production Build

```bash
# Build frontend
cd frontend
npm run build
# Output in frontend/dist/

# Serve with Flask (optional)
# Copy dist/ to backend/static/ and serve via Flask
```

---

## 💡 Upgrade Ideas

- Add SQLite/PostgreSQL with SQLAlchemy for persistent data
- Add JWT authentication for real login
- Integrate RazorPay for real payments
- Add Aadhaar OTP verification
- Deploy on Railway (backend) + Vercel (frontend)
