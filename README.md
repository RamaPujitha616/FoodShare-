# FOODSHARE+ — Food Donation Management System

FOODSHARE+ is a production-ready, full-stack food donation ecosystem designed to connect surplus food donors (restaurants, events, hotels, households) with local NGOs and volunteer networks to feed people in need and reduce waste.

## Alignment with Sustainable Development Goals (SDGs)
- **SDG 2: Zero Hunger**: Fosters distribution channels to salvage unused nutritional foods to feed hungry communities.
- **SDG 3: Good Health and Well-being**: Focuses on food quality validation via freshness tracking to ensure healthy consumption.
- **SDG 12: Responsible Consumption and Production**: Reclaims retail and household surplus, minimizing carbon footprint and food loss.

---

## Tech Stack

### Frontend
- **React + Vite** (Fast build system)
- **Tailwind CSS** (Emerald NGO theme, dark/light toggle, glassmorphism UI)
- **React Router** (Protected layouts and authorization routing)
- **Context API** (State sync for theme, authentication sessions, and dynamic toast notifications)
- **Axios** (Proxy integration for REST endpoint calls)
- **Recharts** (Visual indicators for monthly counts and points milestones)
- **Framer Motion** (Subtle premium card animations and entrance effects)

### Backend
- **Node.js & Express.js** (REST API)
- **MongoDB Atlas & Mongoose** (Persistent schemas: Users, Donations, Notifications)
- **JWT Auth & BcryptJS** (Secure tokens & password hashing)
- **Swagger Docs** (OpenAPI documentation generated at `/api-docs`)
- **CSV Export** (Exporting donation history spreadsheets)

---

## Folder Structure

```
foodshare-plus/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js, swagger.js)
│   │   ├── controllers/ (auth, donation, dashboard, leaderboard, admin, notification)
│   │   ├── middleware/ (authMiddleware.js)
│   │   ├── models/ (User, Donation, Notification)
│   │   ├── routes/ (auth, donation, dashboard, leaderboard, admin, notification)
│   │   ├── scripts/ (seed.js)
│   │   └── index.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, Footer, CountdownTimer, BadgeIcon, NotificationCenter)
│   │   ├── context/ (AuthContext, ThemeContext, ToastContext)
│   │   ├── pages/ (Home, Login, Register, ForgotPassword, ResetPassword, dashboards, Leaderboard)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
└── package.json (Root orchestrator)
```

---

## Installation & Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- [MongoDB](https://www.mongodb.com/) running locally (`mongodb://127.0.0.1:27017/foodshare`) OR a MongoDB Atlas URI.

### Step 1: Install Dependencies
From the project root directory, install all dependencies in one command:
```bash
npm run install-all
```

### Step 2: Seed the Database
Run the seed script to wipe active database collections and load demo accounts/donations:
```bash
npm run seed
```

### Step 3: Run the Application
Start both the backend server and frontend development server. Open two separate terminals:

**Terminal 1 (Backend)**:
```bash
npm run dev:backend
```
*Note: Starts the Express API at http://localhost:5000. Docs available at http://localhost:5000/api-docs.*

**Terminal 2 (Frontend)**:
```bash
npm run dev:frontend
```
*Note: Starts the Vite dev server at http://localhost:5173.*

---

## Demo Accounts (Preseeded)

### 1. System Admin
- **Email**: `admin@foodshare.com`
- **Password**: `Admin@123456`

### 2. Donor (Priya Sharma)
- **Email**: `priya@demo.com`
- **Password**: `Demo@12345`

### 3. NGO (Robin Hood Army)
- **Email**: `ngo@demo.com`
- **Password**: `Demo@12345`

---

## Core Systems & Rules

### Food Expiry Ticker
- **Fresh**: Expiry time is > 3 hours.
- **Expiring Soon**: Expiry time is 1 to 3 hours left.
- **Expired**: Expiry time is < 1 hour. Acceptance is disabled.
- Countdown values tick in real-time.

### Impact Point Formula
- **Points Awarded** = Meals Delivered count (awarded to both Donor and NGO upon status set to `Delivered`).
- **Bonus 1 (Quick Delivery)**: `+10 pts` if delivery is within 2 hours of donation creation.
- **Bonus 2 (Saving Expiring Food)**: `+5 pts` if the food was "Expiring Soon" at acceptance.

### Badge Ranks
- **Bronze**: 100+ points
- **Silver**: 500+ points
- **Gold**: 1000+ points
- **Platinum**: 2500+ points
Progress bar tracker is displayed on the Donor profile.
