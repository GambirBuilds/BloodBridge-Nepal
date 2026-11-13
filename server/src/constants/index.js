export const ROLES = {
  DONOR: 'DONOR',
  REQUESTER: 'REQUESTER',
  HOSPITAL: 'HOSPITAL',
  ADMIN: 'ADMIN',
};

export const BLOOD_GROUPS = {
  A_POSITIVE: 'A_POSITIVE',
  A_NEGATIVE: 'A_NEGATIVE',
  B_POSITIVE: 'B_POSITIVE',
  B_NEGATIVE: 'B_NEGATIVE',
  AB_POSITIVE: 'AB_POSITIVE',
  AB_NEGATIVE: 'AB_NEGATIVE',
  O_POSITIVE: 'O_POSITIVE',
  O_NEGATIVE: 'O_NEGATIVE',
};

export const BLOOD_GROUP_MAP = {
  'A+': 'A_POSITIVE',
  'A-': 'A_NEGATIVE',
  'B+': 'B_POSITIVE',
  'B-': 'B_NEGATIVE',
  'AB+': 'AB_POSITIVE',
  'AB-': 'AB_NEGATIVE',
  'O+': 'O_POSITIVE',
  'O-': 'O_NEGATIVE',
};

export const REVERSE_BLOOD_GROUP_MAP = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
};

export const AVAILABILITY_PREFERENCE = {
  AVAILABLE_NOW: 'AVAILABLE_NOW',
  WEEKENDS_AND_EVENINGS: 'WEEKENDS_AND_EVENINGS',
  EMERGENCY_ONLY: 'EMERGENCY_ONLY',
  TEMPORARILY_PAUSED: 'TEMPORARILY_PAUSED',
};

export const AVAILABILITY_MAP = {
  'Available Now': 'AVAILABLE_NOW',
  'Weekends & Evenings': 'WEEKENDS_AND_EVENINGS',
  'Emergency Only': 'EMERGENCY_ONLY',
  'Temporarily Paused': 'TEMPORARILY_PAUSED',
};

export const REVERSE_AVAILABILITY_MAP = {
  AVAILABLE_NOW: 'Available Now',
  WEEKENDS_AND_EVENINGS: 'Weekends & Evenings',
  EMERGENCY_ONLY: 'Emergency Only',
  TEMPORARILY_PAUSED: 'Temporarily Paused',
};

export const CONTACT_METHOD_MAP = {
  'Platform Notification': 'PLATFORM_NOTIFICATION',
  'Hospital Desk Call': 'HOSPITAL_DESK_CALL',
  'SMS Alert': 'SMS_ALERT',
};

export const REVERSE_CONTACT_METHOD_MAP = {
  PLATFORM_NOTIFICATION: 'Platform Notification',
  HOSPITAL_DESK_CALL: 'Hospital Desk Call',
  SMS_ALERT: 'SMS_ALERT',
};

export const URGENCY_MAP = {
  'Critical (Within 6 hrs)': 'CRITICAL',
  'Urgent (Within 24 hrs)': 'URGENT',
  'Scheduled Surgery': 'SCHEDULED_SURGERY',
};

export const REVERSE_URGENCY_MAP = {
  CRITICAL: 'Critical (Within 6 hrs)',
  URGENT: 'Urgent (Within 24 hrs)',
  SCHEDULED_SURGERY: 'Scheduled Surgery',
};

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  UNDER_VERIFICATION: 'UNDER_VERIFICATION',
  VERIFIED: 'VERIFIED',
  DONOR_COORDINATION: 'DONOR_COORDINATION',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
};

export const REQUEST_STATUS_MAP = {
  Pending: 'PENDING',
  'Under Verification': 'UNDER_VERIFICATION',
  Verified: 'VERIFIED',
  'Donor Coordination': 'DONOR_COORDINATION',
  Fulfilled: 'FULFILLED',
  Cancelled: 'CANCELLED',
  Rejected: 'REJECTED',
};

export const REVERSE_REQUEST_STATUS_MAP = {
  PENDING: 'Pending',
  UNDER_VERIFICATION: 'Under Verification',
  VERIFIED: 'Verified',
  DONOR_COORDINATION: 'Donor Coordination',
  FULFILLED: 'Fulfilled',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

export const HOSPITAL_VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

export const REVERSE_HOSPITAL_VERIFICATION_MAP = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

export const BLOOD_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};
