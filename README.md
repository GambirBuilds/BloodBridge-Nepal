# BLOODBRIDGE Nepal — Voluntary Blood Donor & Hospital Network

> **"Connecting Lives, One Donation at a Time."**

BLOODBRIDGE is a Nepal-focused blood donor coordination platform that connects voluntary blood donors, patients, hospitals and blood banks through a secure and accessible digital network.

---

## 1. Project Introduction

In Nepal, family members and caretakers of hospitalized patients frequently face urgent crises searching for compatible voluntary blood donors. Traditional blood donation drives and informal social media appeals lack clinical verification, patient confidentiality, geographic coordination, and real-time hospital requisition tracking.

**BLOODBRIDGE** addresses this challenge with a unified digital ecosystem designed specifically for Nepal's healthcare system. It respects Nepal's federal administrative structure (7 provinces, 77 districts, and municipal units), provides interactive Leaflet/OpenStreetMap geographic donor discovery, enforces strict privacy protections, and establishes an authorized hospital requisition workflow.

---

## 2. Problem Statement

1. **Fragmented Emergency Search**: Patients' attendants often scramble across social media groups or personal phone directories seeking donors during surgery or trauma emergencies.
2. **Donor Privacy Vulnerability**: Unregulated public broadcasts frequently leak voluntary donors' private phone numbers and home addresses to spam and harassment.
3. **Unverified Clinical Requisitions**: Without hospital verification, false alarms and fraudulent donation appeals circulate unchecked, straining voluntary donors.
4. **Geographic Inefficiencies**: Lack of regional mapping across Nepal's terrain makes it difficult to discover donors near the treating hospital.
5. **Absence of Coordinated Audit Trails**: Transfusion desks lack centralized audit logs to trace requisition approvals, donor invitations, and component inventory.

---

## 3. Project Objectives

- Connect voluntary donors and licensed hospital blood banks across all 7 provinces of Nepal.
- Enforce strict privacy projection: never expose voluntary donor phone numbers, email addresses, or residential street coordinates publicly.
- Provide interactive OpenStreetMap & Leaflet mapping with approximate district donor clusters and verified hospital markers.
- Implement an authoritative hospital verification queue requiring authorized clinicians to confirm inpatient ward requisition slips before alerting donors.
- Deliver a production-grade full-stack architecture with PostgreSQL, Prisma ORM, JWT authentication, and comprehensive end-to-end testing.

---

## 4. Main Features

- **Interactive Nepal Locator Map**: Leaflet & OpenStreetMap visualization with district-level aggregate donor clusters and verified hospital blood bank locations.
- **Privacy-First Donor Directory**: Public search and filter by blood group (A+, A-, B+, B-, AB+, AB-, O+, O-), province, district, municipality, and availability status. Personal credentials remain strictly protected.
- **Inpatient Requisition Coordination**: Submit blood requests with automated duplicate detection, hospital ward matching, and urgency classification.
- **Hospital Blood Bank Workspace**: Review inpatient requisition slips, verify ward admissions, coordinate voluntary donors, and manage regulated ABO/Rh cross-match inventory.
- **Voluntary Donor Workspace**: Toggle real-time availability (`Available Now`, `Emergency Only`, `Paused`), view clinical ABO/Rh compatibility, and track donation certificates.
- **Administrative Console**: National oversight dashboard with Recharts analytics, user account management (suspension/reactivation), hospital permit review, trust/abuse reporting queue, and system audit logs.
- **Multi-Channel Notifications**: In-app alert tracking with transactional email (Resend) and Nepal SMS (Sparrow SMS) gateway adapters.
- **Trust & Abuse Prevention**: Built-in reporting pipeline for suspicious requests, anti-spam duplicate detection, and tamper-evident audit logging.

---

## 5. User Roles & Permissions

BLOODBRIDGE implements granular Role-Based Access Control (RBAC):

| Role | Target User | Capabilities |
|---|---|---|
| `DONOR` | Voluntary Blood Donor | Manage availability status, pause request alerts, receive direct hospital invitations, update display preferences, view donation certificate history. |
| `REQUESTER` | Patient or Attendant | Submit inpatient blood requests, track hospital verification progress in real time, coordinate with consented donors, cancel unfulfilled requests. |
| `HOSPITAL` | Transfusion Desk Clinician | Verify inpatient requisition slips, initiate direct donor invitations, manage component stock levels, log cross-match outcomes. |
| `ADMIN` | Platform Oversight Official | Inspect national metrics, review and approve hospital licensing permits, suspend abusive accounts, review trust reports, inspect audit trails. |

---

## 6. Technology Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS, React Router DOM, Lucide React, Recharts, Leaflet, React Leaflet
- **Backend**: Node.js, Express.js (ES Modules), Helmet, CORS, Express Rate Limit, Cookie Parser
- **Database & ORM**: PostgreSQL, Prisma ORM (with dual-mode fallback adapter for instant sandbox execution)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing, Refresh Token rotation
- **Validation**: Zod schema validation across client and server
- **Testing**: Node.js native test runner (`server/tests/api.test.js`) with 16 comprehensive integration & security tests

---

## 7. Architecture Overview

```
                          ┌───────────────────────────┐
                          │   React 19 SPA (Vite)     │
                          │   Tailwind CSS + Leaflet  │
                          └─────────────┬─────────────┘
                                        │ HTTP / JSON
                                        ▼
                          ┌───────────────────────────┐
                          │    Express.js Backend     │
                          │  Helmet · CORS · RateLimit│
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Prisma ORM Engine   │    │  Resend Email API    │    │  Sparrow SMS API     │
│  PostgreSQL Database │    │  (Transactional)     │    │  (+977 Nepal Telco)  │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

---

## 8. Folder Structure

```
├── server/
│   ├── prisma/
│   │   ├── schema.prisma          # 12-model normalized PostgreSQL schema
│   │   └── seed.js                # Standalone database seeder
│   ├── src/
│   │   ├── config/                # Database and environment configurations
│   │   ├── constants/             # Enums, mappings, blood compatibility tables
│   │   ├── controllers/           # Auth, Donor, Request, Hospital, Admin, Report controllers
│   │   ├── middleware/            # JWT authentication, RBAC, Zod validation, error handler
│   │   ├── routes/                # Express API route modules
│   │   ├── services/              # Notification delivery, seeding, and business logic
│   │   ├── utils/                 # Password hashing, JWT token helpers, formatting
│   │   ├── validators/            # Server-side Zod input validation schemas
│   │   └── app.js                 # Express application factory
│   └── tests/
│       └── api.test.js            # 16-test comprehensive E2E integration test suite
├── src/
│   ├── components/
│   │   ├── common/                # NepalLocatorMap (Leaflet), ReportDialog, UI primitives
│   │   ├── dashboard/             # StatStrip, ChartsPanel (Recharts), ActivityFeed
│   │   ├── donors/                # DonorCard, DonorFilterBar
│   │   ├── forms/                 # BloodRequestForm, DonorRegistrationForm, HospitalForm
│   │   ├── hospitals/             # HospitalCard
│   │   ├── layout/                # WorkspaceHeader, Footer
│   │   ├── navigation/            # Navbar, Sidebar
│   │   └── requests/              # RequestCard, RequestStatusTimeline
│   ├── context/                   # AuthContext, PlatformDataContext, ToastContext
│   ├── data/                      # Nepal administrative locations, initial demonstration seeds
│   ├── pages/                     # Public, Donor, Requester, Hospital, and Admin pages
│   ├── services/                  # Axios API clients for Auth, Donor, Request, Hospital, Admin
│   └── utils/                     # Blood compatibility matrix, formatters, storage helpers
├── server.ts                      # Unified full-stack server mounting Vite in dev & static in prod
├── API_DOCUMENTATION.md           # Exhaustive REST API endpoint specifications
├── DEPLOYMENT.md                  # Cloud deployment guide for Vercel, Render, and PostgreSQL
└── package.json                   # Project scripts and dependencies
```

---

## 9. Database Overview (12 Models)

1. **User**: Core account identity with role (`DONOR`, `REQUESTER`, `HOSPITAL`, `ADMIN`), password hash, status (`ACTIVE`, `SUSPENDED`).
2. **DonorProfile**: Voluntary donor profile linked to User with blood group, geographic location, availability, and privacy settings.
3. **RequesterProfile**: Linked patient/attendant profile tracking submitted blood requests.
4. **Hospital**: Verified healthcare institution with MoHP permit reference, address, emergency desk phone, and regulated fee schedule.
5. **HospitalStaff**: Authorized hospital clinicians permitted to verify requests and coordinate donors.
6. **BloodRequest**: Inpatient blood request with patient details, required date, units, urgency, and verification status.
7. **DonorRequest**: Direct invitation records connecting verified blood requests to specific opted-in donors.
8. **DonationRecord**: Verified past donation events with certificate reference and hospital acknowledgements.
9. **HospitalVerification**: Audit records tracking administrative review of hospital licenses and permits.
10. **Notification**: In-app notification queue linked to specific users.
11. **AuditLog**: Tamper-evident administrative audit trail with actor name, role, IP address, and change payload.
12. **Report**: User-submitted trust and safety reports flagging suspicious activity for administrative review.

---

## 10. Installation & Setup

### Prerequisites
- Node.js 20+ (Node.js 22 LTS recommended)
- npm 10+
- (Optional) PostgreSQL 16+ server if connecting an external database

### Step-by-Step Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/bloodbridge-nepal.git
cd bloodbridge-nepal

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

---

## 11. Local Development Commands

| Command | Action |
|---|---|
| `npm run dev` | Starts the unified full-stack server on `http://localhost:3000` with Express API and Vite SPA. |
| `npm test` | Runs the 16-test comprehensive E2E integration and security test suite. |
| `npm run seed` | Re-seeds the database with realistic Nepal demonstration data across all 7 provinces. |
| `npm run build` | Compiles the production frontend bundle into `dist`. |
| `npm start` | Launches the production full-stack server serving the compiled frontend bundle. |
| `npm run lint` | Runs TypeScript type and syntax validation without emitting code. |

---

## 12. Testing Instructions

Execute the automated backend test suite:
```bash
npm test
```

The test runner validates:
- **Workflow A (Donor)**: Registration, JWT issuance, profile updates, availability preferences.
- **Workflow B (Requester)**: Requester onboarding, blood request creation, requester queue listing.
- **Workflow C (Hospital)**: Authorized hospital staff login, inpatient requisition slip verification (`VERIFIED`).
- **Workflow D (Admin)**: Admin console authentication, national dashboard metrics, trust report review (`RESOLVED`).
- **Workflow E (Security)**: Unauthenticated access rejection (401), invalid JWT rejection (401), RBAC authorization guards (403), public donor privacy credential projection, duplicate request prevention (409).

---

## 13. Pre-Configured Demonstration Accounts

To test the application across different user roles, use these seeded demonstration credentials (password: `demoPassword123` for all demo accounts):

| Role | Name | Email | Focus Area |
|---|---|---|---|
| **Donor** | Suman Thapa (O+) | `suman.thapa@demo.bloodbridge.np` | Availability toggle, request alerts, donation history |
| **Requester** | Ramesh Adhikari | `ramesh.adhikari@demo.bloodbridge.np` | Submit requests, real-time hospital verification tracking |
| **Hospital** | Dr. Bikash Poudel | `bloodbank@bagmatiteaching.demo.np` | Inpatient requisition review, donor coordination, inventory |
| **Admin** | Aarav Khadka | `aarav.khadka@demo.bloodbridge.np` | Hospital permit approvals, national metrics, audit logs |

---

## 14. Security and Privacy Principles

- **Zero Credential Exposure**: Private donor phone numbers and email addresses are never returned in public search endpoints.
- **No Residential Coordinates**: Maps display approximate district centroid clusters only; home addresses are never plotted.
- **Authoritative Verification**: Only verified hospital staff or administrators can mark an inpatient requisition verified or fulfilled.
- **Duplicate Request Guard**: Algorithms detect and block duplicate active requests for the same patient and blood group within 24 hours.
- **Tamper-Evident Auditing**: Administrative actions, hospital verifications, and report investigations are permanently recorded in `AuditLog`.

---

## 15. Medical Disclaimer

BLOODBRIDGE is a digital coordination and discovery platform. It is **not** a substitute for licensed medical practitioners, clinical diagnostic laboratories, or official hospital blood banks. All clinical eligibility assessments, hemoglobin screenings, cross-matching, and transfusions must be conducted in person by qualified healthcare professionals adhering to Ministry of Health and Population (MoHP) guidelines.

---

## 16. License

This project is licensed under the Apache 2.0 License.
