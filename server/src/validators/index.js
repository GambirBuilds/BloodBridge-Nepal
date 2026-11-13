import { z } from 'zod';

const nepaliPhoneRegex = /^(\+977[-\s]?)?(98|97|96|01)\d{7,8}$/;

export const registerSchema = z.object({
  fullName: z.string().trim().min(3, 'Full name must be at least 3 characters'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().regex(nepaliPhoneRegex, 'Invalid Nepali phone number (+977 98xxxxxxxx)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['DONOR', 'REQUESTER', 'HOSPITAL']), // Notice: ADMIN is excluded!
  district: z.string().trim().min(2, 'District is required'),
  province: z.string().trim().min(2, 'Province is required'),
  // Role specific optional fields:
  bloodGroup: z.string().optional(),
  municipality: z.string().optional(),
  approximateLocation: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  availabilityPreference: z.string().optional(),
  shareMunicipalityPublicly: z.boolean().optional(),
  consentDonorRequests: z.boolean().optional(),
  consentPrivacy: z.boolean().optional(),
  hospitalName: z.string().optional(),
  institutionType: z.string().optional(),
  registrationNumber: z.string().optional(),
  address: z.string().optional(),
  officialEmail: z.string().optional(),
  contactNumber: z.string().optional(),
  authorizedRepresentative: z.string().optional(),
  representativeDesignation: z.string().optional(),
  verificationDocReference: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const donorProfileUpdateSchema = z.object({
  fullName: z.string().trim().min(3).optional(),
  phone: z.string().trim().regex(nepaliPhoneRegex).optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  municipality: z.string().optional(),
  approximateLocation: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  publicDisplayMode: z.string().optional(),
  shareMunicipalityPublicly: z.boolean().optional(),
});

export const donorAvailabilitySchema = z.object({
  availabilityPreference: z.string().optional(),
  notificationsPaused: z.boolean().optional(),
});

export const bloodRequestSchema = z.object({
  patientName: z.string().trim().min(2, 'Patient name is required'),
  contactPhone: z.string().trim().regex(nepaliPhoneRegex, 'Invalid contact phone number'),
  contactEmail: z.string().trim().email().optional().or(z.literal('')),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  unitsRequired: z.coerce.number().int().min(1).max(10),
  urgency: z.string().optional(),
  hospitalId: z.string().optional(),
  hospitalName: z.string().min(2, 'Hospital name is required'),
  province: z.string().min(1, 'Province is required'),
  district: z.string().min(1, 'District is required'),
  municipality: z.string().min(1, 'Municipality is required'),
  requiredDate: z.string().min(1, 'Required date is required'),
  requestDetails: z.string().trim().min(10, 'Details must be at least 10 characters'),
});

export const requestStatusUpdateSchema = z.object({
  status: z.enum([
    'PENDING',
    'UNDER_VERIFICATION',
    'VERIFIED',
    'DONOR_COORDINATION',
    'FULFILLED',
    'CANCELLED',
    'REJECTED',
  ]),
  note: z.string().optional(),
});

export const hospitalRegisterSchema = z.object({
  hospitalName: z.string().trim().min(4, 'Hospital name is required'),
  institutionType: z.string().optional(),
  registrationNumber: z.string().trim().min(3, 'Registration number is required'),
  address: z.string().trim().min(3, 'Address is required'),
  province: z.string().min(1, 'Province is required'),
  district: z.string().min(1, 'District is required'),
  municipality: z.string().min(1, 'Municipality is required'),
  officialEmail: z.string().trim().email('Invalid official email'),
  contactNumber: z.string().trim().regex(nepaliPhoneRegex, 'Invalid contact number'),
  authorizedRepresentative: z.string().trim().min(2, 'Authorized representative required'),
  representativeDesignation: z.string().trim().min(2, 'Representative designation required'),
  verificationDocReference: z.string().trim().min(3, 'Verification document reference required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const hospitalVerifySchema = z.object({
  verificationStatus: z.enum(['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

export const hospitalProfileSchema = z.object({
  hospitalName: z.string().optional(),
  address: z.string().optional(),
  operatingHours: z.string().optional(),
  regulatedCrossMatchFeeNPR: z.coerce.number().optional(),
  availableBloodUnits: z.record(z.string(), z.number()).optional(),
});

export const userStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

export const reportSubmitSchema = z.object({
  targetType: z.enum(['BLOOD_REQUEST', 'DONOR_PROFILE', 'HOSPITAL', 'USER']),
  targetId: z.string().trim().min(1, 'Target ID is required'),
  reason: z.string().trim().min(3, 'Reason must be at least 3 characters'),
  details: z.string().trim().min(6, 'Details must be at least 6 characters'),
});

export const reportReviewSchema = z.object({
  status: z.enum(['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']),
  actionTaken: z.string().optional(),
});
