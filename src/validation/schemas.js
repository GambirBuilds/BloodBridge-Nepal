import { z } from 'zod';
import { BLOOD_GROUPS } from '../utils/bloodCompatibility';

const nepaliPhoneRegex = /^(\+977[-\s]?)?(98|97|96|01)\d{7,8}$/;

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['donor', 'requester', 'hospital', 'admin']),
});

export const donorRegistrationSchema = z.object({
  fullName: z.string().trim().min(3, 'Enter your full name (at least 3 characters)'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(nepaliPhoneRegex, 'Enter a valid Nepalese phone number (e.g. +977 9841234567)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/\d/, 'Include at least one number'),
  bloodGroup: z.enum(BLOOD_GROUPS, {
    errorMap: () => ({ message: 'Select a blood group' }),
  }),
  province: z.string().min(1, 'Select your province'),
  district: z.string().min(1, 'Select your district'),
  municipality: z.string().min(1, 'Select your municipality'),
  approximateLocation: z.string().trim().max(120, 'Keep location note under 120 characters').optional().or(z.literal('')),
  preferredContactMethod: z.enum(['Platform Notification', 'Hospital Desk Call', 'SMS Alert'], {
    errorMap: () => ({ message: 'Choose a preferred contact method' }),
  }),
  availabilityPreference: z.enum(['Available Now', 'Weekends & Evenings', 'Emergency Only', 'Temporarily Paused'], {
    errorMap: () => ({ message: 'Choose your availability preference' }),
  }),
  shareMunicipalityPublicly: z.boolean().default(true),
  consentDonorRequests: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to receive verified blood request alerts' }),
  }),
  consentPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the privacy policy and data handling terms' }),
  }),
});

export const bloodRequestSchema = z.object({
  requesterName: z.string().trim().min(3, 'Enter the requester or patient attendant name'),
  patientName: z.string().trim().min(3, 'Enter the patient name').optional().or(z.literal('')),
  contactPhone: z
    .string()
    .trim()
    .regex(nepaliPhoneRegex, 'Enter a valid Nepalese contact number (e.g. +977 9851023456)'),
  contactEmail: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  bloodGroup: z.enum(BLOOD_GROUPS, {
    errorMap: () => ({ message: 'Select the required blood group' }),
  }),
  unitsRequired: z.coerce
    .number({ invalid_type_error: 'Enter whole units between 1 and 10' })
    .int('Units must be a whole number')
    .min(1, 'At least 1 unit is required')
    .max(10, 'For more than 10 units, coordinate directly with the regional blood bank'),
  urgency: z.enum(['Critical (Within 6 hrs)', 'Urgent (Within 24 hrs)', 'Scheduled Surgery']),
  hospitalName: z.string().trim().min(3, 'Select or enter the treating hospital'),
  province: z.string().min(1, 'Select the hospital province'),
  district: z.string().min(1, 'Select the hospital district'),
  municipality: z.string().min(1, 'Select the hospital municipality'),
  requiredDate: z.string().min(1, 'Select the date blood is required'),
  requestDetails: z
    .string()
    .trim()
    .min(12, 'Provide brief clinical context (ward, requisition slip reference, or procedure)')
    .max(600, 'Keep details under 600 characters'),
  consentProcessInfo: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required to process and verify this blood request' }),
  }),
});

export const hospitalRegistrationSchema = z.object({
  hospitalName: z.string().trim().min(4, 'Enter the official institution or blood bank name'),
  institutionType: z.enum(['Public Hospital', 'Teaching Hospital', 'Community Blood Bank', 'Specialty Hospital']),
  registrationNumber: z
    .string()
    .trim()
    .min(4, 'Enter MoHP / NHRC / NRCS registration reference'),
  address: z.string().trim().min(4, 'Enter street/ward address'),
  province: z.string().min(1, 'Select province'),
  district: z.string().min(1, 'Select district'),
  municipality: z.string().min(1, 'Select municipality'),
  officialEmail: z.string().trim().email('Enter an official institutional email'),
  contactNumber: z
    .string()
    .trim()
    .regex(nepaliPhoneRegex, 'Enter a valid Nepalese landline or mobile (+977 01-4xxxxxx or 98xxxxxxxx)'),
  authorizedRepresentative: z.string().trim().min(3, 'Enter the name of the authorized focal person'),
  representativeDesignation: z.string().trim().min(2, 'Enter designation (e.g. Blood Bank Officer)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  verificationDocReference: z.string().trim().min(3, 'Provide operating license / blood bank permit reference'),
  consentVerification: z.literal(true, {
    errorMap: () => ({ message: 'Confirm that submitted institutional credentials are accurate' }),
  }),
});

export const requesterRegistrationSchema = z.object({
  fullName: z.string().trim().min(3, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(nepaliPhoneRegex, 'Enter a valid Nepalese phone number (+977 98xxxxxxxx)'),
  province: z.string().min(1, 'Select your province'),
  district: z.string().min(1, 'Select your district'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  consentTerms: z.literal(true, {
    errorMap: () => ({ message: 'Accept the platform terms to create a requester account' }),
  }),
});

export const contactSchema = z.object({
  fullName: z.string().trim().min(3, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().optional().or(z.literal('')),
  category: z.enum([
    'Hospital Onboarding Inquiry',
    'Donor Account Support',
    'Blood Request Coordination',
    'Data Privacy Request',
    'General Partnership',
  ]),
  message: z.string().trim().min(15, 'Enter a message of at least 15 characters').max(800),
});
