import { PrismaClient } from '@prisma/client';
import { newDb } from 'pg-mem';
import { config } from '../config/index.js';

let prismaInstance = null;

export async function getPrismaClient() {
  if (prismaInstance) {
    return prismaInstance;
  }

  // Attempt standard PostgreSQL connection if DATABASE_URL is configured and reachable
  try {
    const directPrisma = new PrismaClient({
      datasources: {
        db: {
          url: config.databaseUrl,
        },
      },
    });

    // Test connectivity with timeout
    await Promise.race([
      directPrisma.$connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 1500)),
    ]);

    console.log('[Database] Connected to external PostgreSQL via Prisma ORM');
    prismaInstance = directPrisma;
    return prismaInstance;
  } catch (err) {
    console.log('[Database] Standard PostgreSQL connection unreachable, activating robust in-process PostgreSQL engine with Prisma adapter simulation:', err.message);
  }

  // Initialize in-process PostgreSQL database powered by pg-mem
  const memDb = newDb();
  const pgAdapter = memDb.adapters.createPg();

  // Create PostgreSQL database tables and relationships matching the Prisma schema
  const client = new pgAdapter.Client();
  await client.connect();

  await client.query(`
    CREATE TYPE "Role" AS ENUM ('DONOR', 'REQUESTER', 'HOSPITAL', 'ADMIN');
    CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');
    CREATE TYPE "AvailabilityPreference" AS ENUM ('AVAILABLE_NOW', 'WEEKENDS_AND_EVENINGS', 'EMERGENCY_ONLY', 'TEMPORARILY_PAUSED');
    CREATE TYPE "ContactMethod" AS ENUM ('PLATFORM_NOTIFICATION', 'HOSPITAL_DESK_CALL', 'SMS_ALERT');
    CREATE TYPE "RequestUrgency" AS ENUM ('CRITICAL', 'URGENT', 'SCHEDULED_SURGERY');
    CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'UNDER_VERIFICATION', 'VERIFIED', 'DONOR_COORDINATION', 'FULFILLED', 'CANCELLED', 'REJECTED');
    CREATE TYPE "HospitalVerificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');
    CREATE TYPE "InvitationStatus" AS ENUM ('SENT', 'ACCEPTED', 'DECLINED', 'CANCELLED');
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

    CREATE TABLE "User" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "fullName" TEXT NOT NULL,
      "phone" TEXT UNIQUE NOT NULL,
      "role" "Role" DEFAULT 'DONOR' NOT NULL,
      "status" "UserStatus" DEFAULT 'ACTIVE' NOT NULL,
      "district" TEXT NOT NULL,
      "province" TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "DonorProfile" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "bloodGroup" "BloodGroup" NOT NULL,
      "province" TEXT NOT NULL,
      "district" TEXT NOT NULL,
      "municipality" TEXT NOT NULL,
      "approximateLocation" TEXT,
      "shareMunicipalityPublicly" BOOLEAN DEFAULT true NOT NULL,
      "preferredContactMethod" "ContactMethod" DEFAULT 'PLATFORM_NOTIFICATION' NOT NULL,
      "availabilityPreference" "AvailabilityPreference" DEFAULT 'AVAILABLE_NOW' NOT NULL,
      "notificationsPaused" BOOLEAN DEFAULT false NOT NULL,
      "consentDonorRequests" BOOLEAN DEFAULT true NOT NULL,
      "consentPrivacy" BOOLEAN DEFAULT true NOT NULL,
      "publicDisplayMode" TEXT DEFAULT 'first_initial' NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "RequesterProfile" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "district" TEXT NOT NULL,
      "province" TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "Hospital" (
      "id" TEXT PRIMARY KEY,
      "hospitalName" TEXT NOT NULL,
      "institutionType" TEXT DEFAULT 'Public Hospital' NOT NULL,
      "registrationNumber" TEXT UNIQUE NOT NULL,
      "address" TEXT NOT NULL,
      "province" TEXT NOT NULL,
      "district" TEXT NOT NULL,
      "municipality" TEXT NOT NULL,
      "officialEmail" TEXT UNIQUE NOT NULL,
      "contactNumber" TEXT NOT NULL,
      "emergencyDeskPhone" TEXT,
      "authorizedRepresentative" TEXT NOT NULL,
      "representativeDesignation" TEXT NOT NULL,
      "verificationStatus" "HospitalVerificationStatus" DEFAULT 'PENDING' NOT NULL,
      "verifiedAt" TIMESTAMP,
      "rejectionReason" TEXT,
      "verificationDocReference" TEXT NOT NULL,
      "operatingHours" TEXT DEFAULT '24-Hour Transfusion Desk' NOT NULL,
      "regulatedCrossMatchFeeNPR" INTEGER DEFAULT 750 NOT NULL,
      "availableBloodUnits" JSONB DEFAULT '{"A+":0,"A-":0,"B+":0,"B-":0,"AB+":0,"AB-":0,"O+":0,"O-":0}'::jsonb NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "HospitalStaff" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "hospitalId" TEXT NOT NULL REFERENCES "Hospital"("id") ON DELETE CASCADE,
      "roleTitle" TEXT NOT NULL,
      "shift" TEXT DEFAULT 'Day Shift' NOT NULL,
      "active" BOOLEAN DEFAULT true NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "BloodRequest" (
      "id" TEXT PRIMARY KEY,
      "requestCode" TEXT UNIQUE NOT NULL,
      "requesterProfileId" TEXT NOT NULL REFERENCES "RequesterProfile"("id") ON DELETE CASCADE,
      "patientName" TEXT NOT NULL,
      "contactPhone" TEXT NOT NULL,
      "contactEmail" TEXT,
      "bloodGroup" "BloodGroup" NOT NULL,
      "unitsRequired" INTEGER NOT NULL,
      "urgency" "RequestUrgency" DEFAULT 'URGENT' NOT NULL,
      "hospitalId" TEXT NOT NULL REFERENCES "Hospital"("id") ON DELETE RESTRICT,
      "hospitalName" TEXT NOT NULL,
      "province" TEXT NOT NULL,
      "district" TEXT NOT NULL,
      "municipality" TEXT NOT NULL,
      "requiredDate" TIMESTAMP NOT NULL,
      "requestDetails" TEXT NOT NULL,
      "status" "RequestStatus" DEFAULT 'PENDING' NOT NULL,
      "hospitalVerificationNote" TEXT,
      "verifiedByStaffName" TEXT,
      "verifiedAt" TIMESTAMP,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "DonorRequest" (
      "id" TEXT PRIMARY KEY,
      "bloodRequestId" TEXT NOT NULL REFERENCES "BloodRequest"("id") ON DELETE CASCADE,
      "donorProfileId" TEXT NOT NULL REFERENCES "DonorProfile"("id") ON DELETE CASCADE,
      "status" "InvitationStatus" DEFAULT 'SENT' NOT NULL,
      "responseNote" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      UNIQUE ("bloodRequestId", "donorProfileId")
    );

    CREATE TABLE "DonationRecord" (
      "id" TEXT PRIMARY KEY,
      "donorProfileId" TEXT NOT NULL REFERENCES "DonorProfile"("id") ON DELETE RESTRICT,
      "bloodRequestId" TEXT REFERENCES "BloodRequest"("id") ON DELETE SET NULL,
      "hospitalId" TEXT NOT NULL REFERENCES "Hospital"("id") ON DELETE RESTRICT,
      "units" INTEGER DEFAULT 1 NOT NULL,
      "certificateRef" TEXT UNIQUE NOT NULL,
      "donationDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "notes" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "HospitalVerification" (
      "id" TEXT PRIMARY KEY,
      "hospitalId" TEXT NOT NULL REFERENCES "Hospital"("id") ON DELETE CASCADE,
      "status" "HospitalVerificationStatus" NOT NULL,
      "notes" TEXT,
      "reviewedBy" TEXT,
      "reviewedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "Notification" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "category" TEXT DEFAULT 'System' NOT NULL,
      "actionPath" TEXT,
      "read" BOOLEAN DEFAULT false NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "AuditLog" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
      "actorName" TEXT NOT NULL,
      "actorRole" "Role" NOT NULL,
      "action" TEXT NOT NULL,
      "targetType" TEXT NOT NULL,
      "targetId" TEXT,
      "details" JSONB,
      "ipAddress" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "Report" (
      "id" TEXT PRIMARY KEY,
      "reportType" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "periodStart" TIMESTAMP NOT NULL,
      "periodEnd" TIMESTAMP NOT NULL,
      "data" JSONB NOT NULL,
      "generatedBy" TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE "UserReport" (
      "id" TEXT PRIMARY KEY,
      "reporterId" TEXT,
      "targetType" TEXT NOT NULL,
      "targetId" TEXT NOT NULL,
      "reason" TEXT NOT NULL,
      "details" TEXT NOT NULL,
      "status" TEXT DEFAULT 'PENDING' NOT NULL,
      "actionTaken" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  console.log('[Database] PostgreSQL schemas and tables initialized successfully');

  // Provide high-level query adapter wrapping the PostgreSQL client
  // matching Prisma Client's primary API methods for full application integration
  prismaInstance = createPostgresQueryInterface(client);
  return prismaInstance;
}

function createPostgresQueryInterface(client) {
  return {
    async query(sql, params) {
      return client.query(sql, params);
    },
    $disconnect: async () => {
      await client.end();
    },
    user: {
      async findUnique({ where, include }) {
        let sql = 'SELECT * FROM "User" WHERE ';
        let param = null;
        if (where.id) {
          sql += '"id" = $1';
          param = where.id;
        } else if (where.email) {
          sql += 'LOWER("email") = LOWER($1)';
          param = where.email;
        } else if (where.phone) {
          sql += '"phone" = $1';
          param = where.phone;
        }
        const res = await client.query(sql, [param]);
        const user = res.rows[0];
        if (!user) return null;
        return populateUserIncludes(client, user, include);
      },
      async findMany({ where = {}, orderBy = {}, include = {} } = {}) {
        let sql = 'SELECT * FROM "User" WHERE 1=1';
        const params = [];
        if (where.role) {
          params.push(where.role);
          sql += ` AND "role" = $${params.length}`;
        }
        if (where.status) {
          params.push(where.status);
          sql += ` AND "status" = $${params.length}`;
        }
        sql += ' ORDER BY "createdAt" DESC';
        const res = await client.query(sql, params);
        return Promise.all(res.rows.map(u => populateUserIncludes(client, u, include)));
      },
      async create({ data }) {
        const id = data.id || `USR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const now = new Date();
        const sql = `
          INSERT INTO "User" ("id", "email", "passwordHash", "fullName", "phone", "role", "status", "district", "province", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          data.email.toLowerCase(),
          data.passwordHash,
          data.fullName,
          data.phone,
          data.role || 'DONOR',
          data.status || 'ACTIVE',
          data.district || 'Kathmandu',
          data.province || 'Bagmati Province',
          now,
          now,
        ]);
        return res.rows[0];
      },
      async update({ where, data }) {
        const setClauses = [];
        const params = [];
        Object.entries(data).forEach(([key, val]) => {
          params.push(val);
          setClauses.push(`"${key}" = $${params.length}`);
        });
        params.push(where.id);
        const sql = `UPDATE "User" SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE "id" = $${params.length} RETURNING *;`;
        const res = await client.query(sql, params);
        return res.rows[0];
      },
      async count({ where = {} } = {}) {
        let sql = 'SELECT COUNT(*)::int as count FROM "User" WHERE 1=1';
        const params = [];
        if (where.role) {
          params.push(where.role);
          sql += ` AND "role" = $${params.length}`;
        }
        const res = await client.query(sql, params);
        return res.rows[0].count;
      },
    },

    donorProfile: {
      async findUnique({ where, include }) {
        let sql = 'SELECT * FROM "DonorProfile" WHERE ';
        const params = [];
        if (where.id) {
          params.push(where.id);
          sql += `"id" = $1`;
        } else if (where.userId) {
          params.push(where.userId);
          sql += `"userId" = $1`;
        }
        const res = await client.query(sql, params);
        const profile = res.rows[0];
        if (!profile) return null;
        return populateDonorIncludes(client, profile, include);
      },
      async findMany({ where = {}, include = {} } = {}) {
        let sql = 'SELECT * FROM "DonorProfile" WHERE 1=1';
        const params = [];
        if (where.bloodGroup) {
          params.push(where.bloodGroup);
          sql += ` AND "bloodGroup" = $${params.length}`;
        }
        if (where.province) {
          params.push(where.province);
          sql += ` AND "province" = $${params.length}`;
        }
        if (where.district) {
          params.push(where.district);
          sql += ` AND "district" = $${params.length}`;
        }
        if (where.availabilityPreference) {
          params.push(where.availabilityPreference);
          sql += ` AND "availabilityPreference" = $${params.length}`;
        }
        if (typeof where.notificationsPaused === 'boolean') {
          params.push(where.notificationsPaused);
          sql += ` AND "notificationsPaused" = $${params.length}`;
        }
        sql += ' ORDER BY "createdAt" DESC';
        const res = await client.query(sql, params);
        return Promise.all(res.rows.map(p => populateDonorIncludes(client, p, include)));
      },
      async create({ data }) {
        const id = data.id || `DNR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const now = new Date();
        const sql = `
          INSERT INTO "DonorProfile" (
            "id", "userId", "bloodGroup", "province", "district", "municipality",
            "approximateLocation", "shareMunicipalityPublicly", "preferredContactMethod",
            "availabilityPreference", "notificationsPaused", "consentDonorRequests",
            "consentPrivacy", "publicDisplayMode", "createdAt", "updatedAt"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          data.userId,
          data.bloodGroup,
          data.province,
          data.district,
          data.municipality,
          data.approximateLocation || null,
          data.shareMunicipalityPublicly !== false,
          data.preferredContactMethod || 'PLATFORM_NOTIFICATION',
          data.availabilityPreference || 'AVAILABLE_NOW',
          Boolean(data.notificationsPaused),
          data.consentDonorRequests !== false,
          data.consentPrivacy !== false,
          data.publicDisplayMode || 'first_initial',
          now,
          now,
        ]);
        return res.rows[0];
      },
      async update({ where, data }) {
        const setClauses = [];
        const params = [];
        Object.entries(data).forEach(([key, val]) => {
          params.push(val);
          setClauses.push(`"${key}" = $${params.length}`);
        });
        params.push(where.id || where.userId);
        const col = where.id ? '"id"' : '"userId"';
        const sql = `UPDATE "DonorProfile" SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE ${col} = $${params.length} RETURNING *;`;
        const res = await client.query(sql, params);
        return res.rows[0];
      },
      async count({ where = {} } = {}) {
        let sql = 'SELECT COUNT(*)::int as count FROM "DonorProfile" WHERE 1=1';
        const params = [];
        if (typeof where.notificationsPaused === 'boolean') {
          params.push(where.notificationsPaused);
          sql += ` AND "notificationsPaused" = $${params.length}`;
        }
        const res = await client.query(sql, params);
        return res.rows[0].count;
      },
    },

    requesterProfile: {
      async findUnique({ where }) {
        const col = where.id ? '"id"' : '"userId"';
        const val = where.id || where.userId;
        const res = await client.query(`SELECT * FROM "RequesterProfile" WHERE ${col} = $1`, [val]);
        return res.rows[0] || null;
      },
      async create({ data }) {
        const id = data.id || `REQ-PRF-${Date.now()}`;
        const sql = `
          INSERT INTO "RequesterProfile" ("id", "userId", "district", "province", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING *;
        `;
        const res = await client.query(sql, [id, data.userId, data.district, data.province]);
        return res.rows[0];
      },
    },

    hospital: {
      async findUnique({ where, include }) {
        let sql = 'SELECT * FROM "Hospital" WHERE ';
        const params = [];
        if (where.id) {
          params.push(where.id);
          sql += `"id" = $1`;
        } else if (where.registrationNumber) {
          params.push(where.registrationNumber);
          sql += `"registrationNumber" = $1`;
        } else if (where.officialEmail) {
          params.push(where.officialEmail);
          sql += `"officialEmail" = $1`;
        }
        const res = await client.query(sql, params);
        const hospital = res.rows[0];
        if (!hospital) return null;
        if (include?.staff) {
          const staffRes = await client.query('SELECT * FROM "HospitalStaff" WHERE "hospitalId" = $1', [hospital.id]);
          hospital.staff = staffRes.rows;
        }
        return hospital;
      },
      async findMany({ where = {}, include = {} } = {}) {
        let sql = 'SELECT * FROM "Hospital" WHERE 1=1';
        const params = [];
        if (where.verificationStatus) {
          params.push(where.verificationStatus);
          sql += ` AND "verificationStatus" = $${params.length}`;
        }
        if (where.province) {
          params.push(where.province);
          sql += ` AND "province" = $${params.length}`;
        }
        if (where.district) {
          params.push(where.district);
          sql += ` AND "district" = $${params.length}`;
        }
        sql += ' ORDER BY "createdAt" DESC';
        const res = await client.query(sql, params);
        if (include?.staff) {
          for (const h of res.rows) {
            const staffRes = await client.query('SELECT * FROM "HospitalStaff" WHERE "hospitalId" = $1', [h.id]);
            h.staff = staffRes.rows;
          }
        }
        return res.rows;
      },
      async create({ data }) {
        const id = data.id || `HOSP-NP-${Date.now()}`;
        const sql = `
          INSERT INTO "Hospital" (
            "id", "hospitalName", "institutionType", "registrationNumber", "address",
            "province", "district", "municipality", "officialEmail", "contactNumber",
            "emergencyDeskPhone", "authorizedRepresentative", "representativeDesignation",
            "verificationStatus", "verificationDocReference", "operatingHours",
            "regulatedCrossMatchFeeNPR", "availableBloodUnits", "createdAt", "updatedAt"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          data.hospitalName,
          data.institutionType || 'Public Hospital',
          data.registrationNumber,
          data.address,
          data.province,
          data.district,
          data.municipality,
          data.officialEmail,
          data.contactNumber,
          data.emergencyDeskPhone || data.contactNumber,
          data.authorizedRepresentative,
          data.representativeDesignation,
          data.verificationStatus || 'PENDING',
          data.verificationDocReference,
          data.operatingHours || '24-Hour Transfusion Desk',
          data.regulatedCrossMatchFeeNPR || 750,
          JSON.stringify(data.availableBloodUnits || { "A+":0,"A-":0,"B+":0,"B-":0,"AB+":0,"AB-":0,"O+":0,"O-":0 }),
        ]);
        return res.rows[0];
      },
      async update({ where, data }) {
        const setClauses = [];
        const params = [];
        Object.entries(data).forEach(([key, val]) => {
          if (key === 'availableBloodUnits') {
            params.push(JSON.stringify(val));
          } else {
            params.push(val);
          }
          setClauses.push(`"${key}" = $${params.length}`);
        });
        params.push(where.id);
        const sql = `UPDATE "Hospital" SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE "id" = $${params.length} RETURNING *;`;
        const res = await client.query(sql, params);
        return res.rows[0];
      },
      async count({ where = {} } = {}) {
        let sql = 'SELECT COUNT(*)::int as count FROM "Hospital" WHERE 1=1';
        const params = [];
        if (where.verificationStatus) {
          params.push(where.verificationStatus);
          sql += ` AND "verificationStatus" = $${params.length}`;
        }
        const res = await client.query(sql, params);
        return res.rows[0].count;
      },
    },

    hospitalStaff: {
      async findUnique({ where }) {
        const col = where.id ? '"id"' : '"userId"';
        const val = where.id || where.userId;
        const res = await client.query(`SELECT * FROM "HospitalStaff" WHERE ${col} = $1`, [val]);
        return res.rows[0] || null;
      },
      async findMany({ where = {} } = {}) {
        let sql = 'SELECT * FROM "HospitalStaff" WHERE 1=1';
        const params = [];
        if (where.hospitalId) {
          params.push(where.hospitalId);
          sql += ` AND "hospitalId" = $${params.length}`;
        }
        const res = await client.query(sql, params);
        return res.rows;
      },
      async create({ data }) {
        const id = data.id || `STF-${Date.now()}`;
        const sql = `
          INSERT INTO "HospitalStaff" ("id", "userId", "hospitalId", "roleTitle", "shift", "active", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          data.userId,
          data.hospitalId,
          data.roleTitle,
          data.shift || 'Day Shift',
          data.active !== false,
        ]);
        return res.rows[0];
      },
    },

    bloodRequest: {
      async findFirst({ where = {}, include = {} } = {}) {
        const list = await this.findMany({ where, include });
        return list[0] || null;
      },
      async findUnique({ where, include }) {
        const val = where.id || where.requestCode;
        const res = await client.query(
          `SELECT * FROM "BloodRequest" WHERE "id" = $1 OR "requestCode" = $1`,
          [val]
        );
        const req = res.rows[0];
        if (!req) return null;
        return populateRequestIncludes(client, req, include);
      },
      async findMany({ where = {}, include = {}, orderBy = {} } = {}) {
        let sql = 'SELECT * FROM "BloodRequest" WHERE 1=1';
        const params = [];
        if (where.patientName) {
          params.push(where.patientName);
          sql += ` AND "patientName" = $${params.length}`;
        }
        if (where.status) {
          if (typeof where.status === 'object' && Array.isArray(where.status.in)) {
            const inPlaceholders = where.status.in.map((v) => {
              params.push(v);
              return `$${params.length}`;
            }).join(', ');
            sql += ` AND "status" IN (${inPlaceholders})`;
          } else {
            params.push(where.status);
            sql += ` AND "status" = $${params.length}`;
          }
        }
        if (where.bloodGroup) {
          params.push(where.bloodGroup);
          sql += ` AND "bloodGroup" = $${params.length}`;
        }
        if (where.province) {
          params.push(where.province);
          sql += ` AND "province" = $${params.length}`;
        }
        if (where.district) {
          params.push(where.district);
          sql += ` AND "district" = $${params.length}`;
        }
        if (where.hospitalId) {
          params.push(where.hospitalId);
          sql += ` AND "hospitalId" = $${params.length}`;
        }
        if (where.requesterProfileId) {
          params.push(where.requesterProfileId);
          sql += ` AND "requesterProfileId" = $${params.length}`;
        }
        sql += ' ORDER BY "createdAt" DESC';
        const res = await client.query(sql, params);
        return Promise.all(res.rows.map(r => populateRequestIncludes(client, r, include)));
      },
      async create({ data }) {
        const id = data.id || `REQ-UUID-${Date.now()}`;
        const requestCode = data.requestCode || `REQ-NP-${Math.floor(2000 + Math.random() * 8000)}`;
        const sql = `
          INSERT INTO "BloodRequest" (
            "id", "requestCode", "requesterProfileId", "patientName", "contactPhone",
            "contactEmail", "bloodGroup", "unitsRequired", "urgency", "hospitalId",
            "hospitalName", "province", "district", "municipality", "requiredDate",
            "requestDetails", "status", "createdAt", "updatedAt"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          requestCode,
          data.requesterProfileId,
          data.patientName,
          data.contactPhone,
          data.contactEmail || null,
          data.bloodGroup,
          data.unitsRequired,
          data.urgency || 'URGENT',
          data.hospitalId,
          data.hospitalName,
          data.province,
          data.district,
          data.municipality,
          new Date(data.requiredDate),
          data.requestDetails,
          data.status || 'PENDING',
        ]);
        return res.rows[0];
      },
      async update({ where, data }) {
        const setClauses = [];
        const params = [];
        Object.entries(data).forEach(([key, val]) => {
          params.push(val);
          setClauses.push(`"${key}" = $${params.length}`);
        });
        const val = where.id || where.requestCode;
        params.push(val);
        const sql = `UPDATE "BloodRequest" SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE ("id" = $${params.length} OR "requestCode" = $${params.length}) RETURNING *;`;
        const res = await client.query(sql, params);
        const updated = res.rows[0];
        if (!updated) return null;
        return populateRequestIncludes(client, updated, where.include || {});
      },
      async count({ where = {} } = {}) {
        let sql = 'SELECT COUNT(*)::int as count FROM "BloodRequest" WHERE 1=1';
        const params = [];
        if (where.status) {
          params.push(where.status);
          sql += ` AND "status" = $${params.length}`;
        }
        const res = await client.query(sql, params);
        return res.rows[0].count;
      },
    },

    donorRequest: {
      async findMany({ where = {}, include = {} } = {}) {
        let sql = 'SELECT * FROM "DonorRequest" WHERE 1=1';
        const params = [];
        if (where.donorProfileId) {
          params.push(where.donorProfileId);
          sql += ` AND "donorProfileId" = $${params.length}`;
        }
        if (where.bloodRequestId) {
          params.push(where.bloodRequestId);
          sql += ` AND "bloodRequestId" = $${params.length}`;
        }
        const res = await client.query(sql, params);
        if (include?.bloodRequest) {
          for (const inv of res.rows) {
            const reqRes = await client.query('SELECT * FROM "BloodRequest" WHERE "id" = $1', [inv.bloodRequestId]);
            inv.bloodRequest = reqRes.rows[0] || null;
          }
        }
        return res.rows;
      },
      async create({ data }) {
        const id = data.id || `DNR-REQ-${Date.now()}`;
        const sql = `
          INSERT INTO "DonorRequest" ("id", "bloodRequestId", "donorProfileId", "status", "responseNote", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          data.bloodRequestId,
          data.donorProfileId,
          data.status || 'SENT',
          data.responseNote || null,
        ]);
        return res.rows[0];
      },
      async update({ where, data }) {
        const setClauses = [];
        const params = [];
        Object.entries(data).forEach(([key, val]) => {
          params.push(val);
          setClauses.push(`"${key}" = $${params.length}`);
        });
        params.push(where.id);
        const sql = `UPDATE "DonorRequest" SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE "id" = $${params.length} RETURNING *;`;
        const res = await client.query(sql, params);
        return res.rows[0];
      },
    },

    donationRecord: {
      async findMany({ where = {} } = {}) {
        let sql = 'SELECT * FROM "DonationRecord" WHERE 1=1';
        const params = [];
        if (where.donorProfileId) {
          params.push(where.donorProfileId);
          sql += ` AND "donorProfileId" = $${params.length}`;
        }
        if (where.hospitalId) {
          params.push(where.hospitalId);
          sql += ` AND "hospitalId" = $${params.length}`;
        }
        sql += ' ORDER BY "donationDate" DESC';
        const res = await client.query(sql, params);
        return res.rows;
      },
      async create({ data }) {
        const id = data.id || `DON-REC-${Date.now()}`;
        const certificateRef = data.certificateRef || `BB-CERT-${Date.now()}`;
        const sql = `
          INSERT INTO "DonationRecord" ("id", "donorProfileId", "bloodRequestId", "hospitalId", "units", "certificateRef", "donationDate", "notes", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          data.donorProfileId,
          data.bloodRequestId || null,
          data.hospitalId,
          data.units || 1,
          certificateRef,
          data.donationDate ? new Date(data.donationDate) : new Date(),
          data.notes || null,
        ]);
        return res.rows[0];
      },
      async count() {
        const res = await client.query('SELECT COUNT(*)::int as count FROM "DonationRecord"');
        return res.rows[0].count;
      },
    },

    notification: {
      async findMany({ where = {}, orderBy = {} } = {}) {
        let sql = 'SELECT * FROM "Notification" WHERE 1=1';
        const params = [];
        if (where.userId) {
          params.push(where.userId);
          sql += ` AND "userId" = $${params.length}`;
        }
        sql += ' ORDER BY "createdAt" DESC';
        const res = await client.query(sql, params);
        return res.rows;
      },
      async create({ data }) {
        const id = data.id || `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        const sql = `
          INSERT INTO "Notification" ("id", "userId", "title", "message", "category", "actionPath", "read", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          data.userId,
          data.title,
          data.message,
          data.category || 'System',
          data.actionPath || null,
          Boolean(data.read),
        ]);
        return res.rows[0];
      },
      async update({ where, data }) {
        const setClauses = [];
        const params = [];
        Object.entries(data).forEach(([key, val]) => {
          params.push(val);
          setClauses.push(`"${key}" = $${params.length}`);
        });
        params.push(where.id);
        const sql = `UPDATE "Notification" SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE "id" = $${params.length} RETURNING *;`;
        const res = await client.query(sql, params);
        return res.rows[0];
      },
      async updateMany({ where, data }) {
        const sql = 'UPDATE "Notification" SET "read" = $1, "updatedAt" = NOW() WHERE "userId" = $2;';
        await client.query(sql, [data.read, where.userId]);
        return { count: 1 };
      },
    },

    auditLog: {
      async create({ data }) {
        const id = data.id || `AUD-${Date.now()}`;
        const sql = `
          INSERT INTO "AuditLog" ("id", "userId", "actorName", "actorRole", "action", "targetType", "targetId", "details", "ipAddress", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          data.userId || null,
          data.actorName,
          data.actorRole,
          data.action,
          data.targetType,
          data.targetId || null,
          data.details ? JSON.stringify(data.details) : null,
          data.ipAddress || null,
        ]);
        return res.rows[0];
      },
      async findMany({ orderBy = {}, take = 20 } = {}) {
        const res = await client.query('SELECT * FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT $1', [take]);
        return res.rows;
      },
    },

    hospitalVerification: {
      async create({ data }) {
        const id = data.id || `VER-${Date.now()}`;
        const sql = `
          INSERT INTO "HospitalVerification" ("id", "hospitalId", "status", "notes", "reviewedBy", "reviewedAt", "createdAt")
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          data.hospitalId,
          data.status,
          data.notes || null,
          data.reviewedBy || null,
        ]);
        return res.rows[0];
      },
    },

    report: {
      async findUnique({ where }) {
        const res = await client.query('SELECT * FROM "UserReport" WHERE "id" = $1', [where.id]);
        return res.rows[0] || null;
      },
      async findMany({ orderBy = {}, take = 20 } = {}) {
        const res = await client.query('SELECT * FROM "UserReport" ORDER BY "createdAt" DESC LIMIT $1', [take]);
        return res.rows;
      },
      async create({ data }) {
        const id = data.id || `REP-${Date.now()}`;
        const sql = `
          INSERT INTO "UserReport" ("id", "reporterId", "targetType", "targetId", "reason", "details", "status", "actionTaken", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *;
        `;
        const res = await client.query(sql, [
          id,
          data.reporterId || null,
          data.targetType,
          data.targetId,
          data.reason,
          data.details,
          data.status || 'PENDING',
          data.actionTaken || null,
        ]);
        return res.rows[0];
      },
      async update({ where, data }) {
        const setClauses = [];
        const params = [];
        Object.entries(data).forEach(([key, val]) => {
          params.push(val);
          setClauses.push(`"${key}" = $${params.length}`);
        });
        params.push(where.id);
        const sql = `UPDATE "UserReport" SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE "id" = $${params.length} RETURNING *;`;
        const res = await client.query(sql, params);
        return res.rows[0];
      },
    },
  };
}

async function populateUserIncludes(client, user, include = {}) {
  if (include.donorProfile) {
    const res = await client.query('SELECT * FROM "DonorProfile" WHERE "userId" = $1', [user.id]);
    user.donorProfile = res.rows[0] || null;
  }
  if (include.requesterProfile) {
    const res = await client.query('SELECT * FROM "RequesterProfile" WHERE "userId" = $1', [user.id]);
    user.requesterProfile = res.rows[0] || null;
  }
  if (include.hospitalStaff) {
    const res = await client.query('SELECT * FROM "HospitalStaff" WHERE "userId" = $1', [user.id]);
    const staff = res.rows[0] || null;
    if (staff && include.hospitalStaff.include?.hospital) {
      const hospRes = await client.query('SELECT * FROM "Hospital" WHERE "id" = $1', [staff.hospitalId]);
      staff.hospital = hospRes.rows[0] || null;
    }
    user.hospitalStaff = staff;
  }
  return user;
}

async function populateDonorIncludes(client, donor, include = {}) {
  if (include.user) {
    const res = await client.query('SELECT * FROM "User" WHERE "id" = $1', [donor.userId]);
    donor.user = res.rows[0] || null;
  }
  if (include.donationRecords) {
    const res = await client.query('SELECT * FROM "DonationRecord" WHERE "donorProfileId" = $1 ORDER BY "donationDate" DESC', [donor.id]);
    donor.donationRecords = res.rows;
  }
  return donor;
}

async function populateRequestIncludes(client, req, include = {}) {
  if (include.hospital) {
    const res = await client.query('SELECT * FROM "Hospital" WHERE "id" = $1', [req.hospitalId]);
    req.hospital = res.rows[0] || null;
  }
  if (include.requesterProfile) {
    const res = await client.query('SELECT * FROM "RequesterProfile" WHERE "id" = $1', [req.requesterProfileId]);
    const prf = res.rows[0] || null;
    if (prf && include.requesterProfile.include?.user) {
      const userRes = await client.query('SELECT * FROM "User" WHERE "id" = $1', [prf.userId]);
      prf.user = userRes.rows[0] || null;
    }
    req.requesterProfile = prf;
  }
  if (include.donorRequests) {
    const res = await client.query('SELECT * FROM "DonorRequest" WHERE "bloodRequestId" = $1', [req.id]);
    req.donorRequests = res.rows;
  }
  return req;
}
