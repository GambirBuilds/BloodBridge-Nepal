# BLOODBRIDGE Nepal — REST API Documentation

BLOODBRIDGE exposes a comprehensive, RESTful backend API designed to coordinate voluntary blood donors, patients, hospitals, and platform administrators across Nepal.

- **Base URL**: `/api` (or `http://localhost:3000/api` in local development)
- **Protocol**: HTTP/1.1 & HTTPS, JSON request/response
- **Security**: Rate-limited, Helmet-hardened, Bearer JWT authentication, Role-Based Access Control (RBAC)

---

## 1. Authentication & Security

### Bearer Token Authentication
Protected endpoints require an `Authorization` header containing a valid JSON Web Token:
```http
Authorization: Bearer <accessToken>
```

Tokens use standard claims:
- `userId`: Internal UUID of the authenticated user
- `role`: One of `DONOR`, `REQUESTER`, `HOSPITAL`, `ADMIN`
- `exp`: 15-minute access expiration; 7-day refresh token rotation

---

## 2. API Endpoints

### 2.1 Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new `DONOR`, `REQUESTER`, or `HOSPITAL` account. |
| `POST` | `/api/auth/login` | Public | Authenticate with email/password, returning access and refresh tokens. |
| `POST` | `/api/auth/refresh` | Public | Rotate refresh token and obtain new short-lived access token. |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate session tokens. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve sanitized profile of current user. |
| `POST` | `/api/auth/change-password` | Authenticated | Change account password with current verification. |

#### Sample Registration Payload:
```json
{
  "fullName": "Anisha Gurung",
  "email": "anisha.gurung@demo.bloodbridge.np",
  "phone": "+977 9846023402",
  "password": "securePassword123",
  "role": "DONOR",
  "bloodGroup": "B+",
  "province": "Gandaki Province",
  "district": "Kaski",
  "municipality": "Pokhara Metropolitan City",
  "consentDonorRequests": true,
  "consentPrivacy": true
}
```

---

### 2.2 Donor Discovery & Management (`/api/donors`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/donors` | Public | Discover voluntary donors with strict privacy projection. |
| `GET` | `/api/donors/:id` | Public | Retrieve anonymized donor summary by ID. |
| `PATCH` | `/api/donors/profile` | `DONOR` | Update personal contact preference and public display settings. |
| `PATCH` | `/api/donors/availability` | `DONOR` | Toggle availability preference (`Available Now`, `Emergency Only`, `Paused`). |
| `GET` | `/api/donors/requests` | `DONOR` | Retrieve incoming direct invitations. |
| `GET` | `/api/donors/history` | `DONOR` | Retrieve verified past donation certificates. |

*Privacy Guarantee*: `/api/donors` strictly projects out phone numbers, email addresses, and exact residential addresses from public query results.

---

### 2.3 Blood Requests (`/api/requests`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/requests` | Public | List blood requests with filter by blood group, province, district, urgency. |
| `GET` | `/api/requests/my` | `REQUESTER` | Retrieve requests created by the authenticated patient/attendant. |
| `GET` | `/api/requests/:id` | Public | Retrieve full request details and clinical timeline. |
| `POST` | `/api/requests` | Authenticated | Submit inpatient blood request (enforces duplicate prevention). |
| `PATCH` | `/api/requests/:id/cancel` | Requester/Admin | Cancel an unfulfilled request. |
| `PATCH` | `/api/requests/:id/status` | Hospital/Admin | Update request status (`VERIFIED`, `DONOR_COORDINATION`, `FULFILLED`). |

---

### 2.4 Hospital Operations (`/api/hospitals`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/hospitals/register` | Public | Submit institutional onboarding application with MoHP permit reference. |
| `GET` | `/api/hospitals` | Public | List registered hospitals and verified blood component centers. |
| `GET` | `/api/hospitals/:id` | Public | Retrieve institution details, emergency desk hotline, and operating hours. |
| `PATCH` | `/api/hospitals/profile` | `HOSPITAL` | Update institution profile and emergency desk phone. |
| `PATCH` | `/api/hospitals/inventory` | `HOSPITAL` | Update available blood unit inventory by ABO/Rh group. |
| `GET` | `/api/hospitals/requests` | `HOSPITAL` | View incoming requisition queue for assigned hospital. |

---

### 2.5 Administration (`/api/admin`)

*Strictly requires `ADMIN` role.*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | `ADMIN` | National metrics, active donors, verification queues, and recent audit logs. |
| `GET` | `/api/admin/users` | `ADMIN` | List all registered accounts with role and status filtering. |
| `PATCH` | `/api/admin/users/:id/status`| `ADMIN` | Suspend or reactivate user accounts. |
| `PATCH` | `/api/admin/hospitals/:id/verification` | `ADMIN` | Approve (`VERIFIED`) or decline (`REJECTED`) hospital permit. |
| `GET` | `/api/admin/reports` | `ADMIN` | Retrieve trust and abuse investigation reports. |
| `GET` | `/api/admin/audit-logs` | `ADMIN` | Query tamper-evident system audit trail. |

---

### 2.6 Trust & Safety Reports (`/api/reports`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reports` | Authenticated | Submit report regarding suspicious request, commercial blood selling, or abuse. |
| `PATCH` | `/api/reports/:id/review` | `ADMIN` | Review report and mark status (`RESOLVED`, `DISMISSED`) with audit notes. |

---

### 2.7 In-App Notifications (`/api/notifications`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Authenticated | Retrieve in-app notifications for current user. |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Mark a notification as read. |
| `PATCH` | `/api/notifications/read-all`| Authenticated | Mark all notifications as read for current user. |

---

### 2.8 Nepal Administrative Hierarchy (`/api/locations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/locations/provinces` | Public | All 7 provinces of Nepal. |
| `GET` | `/api/locations/districts` | Public | 77 districts, filterable by `?province=...`. |
| `GET` | `/api/locations/municipalities`| Public | Municipal units, filterable by `?province=...&district=...`. |
| `GET` | `/api/locations/hierarchy` | Public | Complete nested Nepal administrative tree. |
