import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { INITIAL_DONORS } from '../data/donors';
import { INITIAL_HOSPITALS } from '../data/hospitals';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';
import { INITIAL_REQUESTS } from '../data/requests';
import { RECENT_ADMIN_ACTIVITIES } from '../data/statistics';
import { DEMO_USERS } from '../data/users';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import { donorService } from '../services/donorService';
import { hospitalService } from '../services/hospitalService';
import { requestService } from '../services/requestService';
import { clearAllPlatformStorage, readStorage, writeStorage } from '../utils/storage';

export const PlatformDataContext = createContext(null);

const DEFAULT_SETTINGS = {
  requireHospitalSlipForCritical: true,
  allowMunicipalityPublicOptIn: true,
  donorCooldownReminderDays: 90,
  emergencyDeskHotline: '+977 01-4200100 (Demo Coordination Desk)',
  maintenanceNotice: '',
};

export function PlatformDataProvider({ children }) {
  const [donors, setDonors] = useState(() => readStorage('donors', INITIAL_DONORS));
  const [requests, setRequests] = useState(() => readStorage('requests', INITIAL_REQUESTS));
  const [hospitals, setHospitals] = useState(() => readStorage('hospitals', INITIAL_HOSPITALS));
  const [users, setUsers] = useState(() => readStorage('users', DEMO_USERS));
  const [notifications, setNotifications] = useState(() =>
    readStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [activities, setActivities] = useState(() =>
    readStorage('activities', RECENT_ADMIN_ACTIVITIES)
  );
  const [platformSettings, setPlatformSettings] = useState(() =>
    readStorage('settings', DEFAULT_SETTINGS)
  );
  const [contactMessages, setContactMessages] = useState(() =>
    readStorage('contact_messages', [])
  );

  // Synchronize with real backend endpoints when available
  useEffect(() => {
    let isMounted = true;
    async function syncBackendData() {
      try {
        const [donorsRes, requestsRes, hospitalsRes] = await Promise.allSettled([
          donorService.listPublicDonors(),
          requestService.listRequests(),
          hospitalService.listHospitals(),
        ]);
        if (!isMounted) return;
        if (donorsRes.status === 'fulfilled' && donorsRes.value?.data?.length > 0) {
          setDonors(donorsRes.value.data);
          writeStorage('donors', donorsRes.value.data);
        }
        if (requestsRes.status === 'fulfilled' && requestsRes.value?.data?.length > 0) {
          setRequests(requestsRes.value.data);
          writeStorage('requests', requestsRes.value.data);
        }
        if (hospitalsRes.status === 'fulfilled' && hospitalsRes.value?.data?.length > 0) {
          setHospitals(hospitalsRes.value.data);
          writeStorage('hospitals', hospitalsRes.value.data);
        }
      } catch (err) {
        console.warn('Initial backend sync skipped:', err);
      }
    }
    syncBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  const appendActivity = useCallback((actor, role, summary) => {
    const entry = {
      id: `ACT-${Date.now()}`,
      timestamp: '11 Nov 2026 · Just now',
      actor,
      role,
      summary,
    };
    setActivities((prev) => {
      const next = [entry, ...prev.slice(0, 19)];
      writeStorage('activities', next);
      return next;
    });
  }, []);

  const pushNotification = useCallback((payload) => {
    const item = {
      id: `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      createdAt: '2026-11-11 · Just now',
      read: false,
      ...payload,
    };
    setNotifications((prev) => {
      const next = [item, ...prev];
      writeStorage('notifications', next);
      return next;
    });
  }, []);

  const registerDonorAccount = useCallback(
    async (formValues) => {
      await donorService.registerDonor(formValues);
      const newDonorId = `DNR-NP-${221 + donors.length}`;
      const newUserId = `USR-DONOR-${10 + users.length}`;
      const newDonor = {
        id: newDonorId,
        isDemonstrationRecord: true,
        fullName: formValues.fullName,
        publicDisplayMode: 'first_initial',
        email: formValues.email,
        phone: formValues.phone,
        bloodGroup: formValues.bloodGroup,
        province: formValues.province,
        district: formValues.district,
        municipality: formValues.municipality,
        shareMunicipalityPublicly: Boolean(formValues.shareMunicipalityPublicly),
        approximateLocation: formValues.approximateLocation || '',
        preferredContactMethod: formValues.preferredContactMethod,
        availabilityPreference: formValues.availabilityPreference,
        notificationsPaused: formValues.availabilityPreference === 'Temporarily Paused',
        consentDonorRequests: true,
        consentPrivacy: true,
        registeredAt: '2026-11-11',
        totalDonationsRecorded: 0,
        donationHistory: [],
      };
      const newUser = {
        id: newUserId,
        role: 'donor',
        roleLabel: 'Voluntary Donor',
        linkedRecordId: newDonorId,
        name: formValues.fullName,
        email: formValues.email,
        phone: formValues.phone,
        bloodGroup: formValues.bloodGroup,
        district: formValues.district,
        province: formValues.province,
        status: 'Active',
        createdAt: '2026-11-11',
      };

      setDonors((prev) => {
        const next = [newDonor, ...prev];
        writeStorage('donors', next);
        return next;
      });
      setUsers((prev) => {
        const next = [newUser, ...prev];
        writeStorage('users', next);
        return next;
      });
      pushNotification({
        targetRole: 'donor',
        targetUserId: newUserId,
        title: 'Welcome to BLOODBRIDGE Nepal (Demo Mode)',
        message: `Your voluntary ${formValues.bloodGroup} donor profile for ${formValues.district} is active.`,
        category: 'Account',
        actionPath: '/dashboard/donor',
      });
      appendActivity(
        formValues.fullName,
        'Donor',
        `Registered as voluntary ${formValues.bloodGroup} donor in ${formValues.district}.`
      );
      return { donor: newDonor, user: newUser };
    },
    [donors.length, users.length, appendActivity, pushNotification]
  );

  const registerRequesterAccount = useCallback(
    async (formValues) => {
      const newUserId = `USR-REQ-${10 + users.length}`;
      const newUser = {
        id: newUserId,
        role: 'requester',
        roleLabel: 'Patient / Requester',
        linkedRecordId: newUserId,
        name: formValues.fullName,
        email: formValues.email,
        phone: formValues.phone,
        district: formValues.district,
        province: formValues.province,
        status: 'Active',
        createdAt: '2026-11-11',
      };
      setUsers((prev) => {
        const next = [newUser, ...prev];
        writeStorage('users', next);
        return next;
      });
      pushNotification({
        targetRole: 'requester',
        targetUserId: newUserId,
        title: 'Requester workspace ready (Demo Mode)',
        message: 'Submit blood requests and track hospital verification status in real time.',
        category: 'Account',
        actionPath: '/dashboard/requester',
      });
      appendActivity(
        formValues.fullName,
        'Requester',
        `Created requester account in ${formValues.district}.`
      );
      return newUser;
    },
    [users.length, appendActivity, pushNotification]
  );

  const registerHospitalAccount = useCallback(
    async (formValues) => {
      await hospitalService.registerHospital(formValues);
      const newHospId = `HOSP-NP-${110 + hospitals.length}`;
      const newUserId = `USR-HOSP-${10 + users.length}`;
      const newHospital = {
        id: newHospId,
        isDemonstrationRecord: true,
        hospitalName: `${formValues.hospitalName.replace(/\(Demo.*\)/i, '').trim()} (Demo Institution)`,
        institutionType: formValues.institutionType,
        registrationNumber: formValues.registrationNumber,
        address: formValues.address,
        province: formValues.province,
        district: formValues.district,
        municipality: formValues.municipality,
        officialEmail: formValues.officialEmail,
        contactNumber: formValues.contactNumber,
        emergencyDeskPhone: formValues.contactNumber,
        authorizedRepresentative: formValues.authorizedRepresentative,
        representativeDesignation: formValues.representativeDesignation,
        verificationStatus: 'Pending',
        verifiedAt: null,
        verificationDocReference: formValues.verificationDocReference,
        operatingHours: 'Pending Institutional Verification',
        regulatedCrossMatchFeeNPR: 750,
        availableBloodUnits: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 },
        staff: [
          {
            id: `STF-${Date.now()}`,
            name: formValues.authorizedRepresentative,
            role: formValues.representativeDesignation,
            email: formValues.officialEmail,
            shift: 'Primary Focal Desk',
            active: true,
          },
        ],
      };
      const newUser = {
        id: newUserId,
        role: 'hospital',
        roleLabel: 'Hospital / Blood Bank',
        linkedRecordId: newHospId,
        name: formValues.authorizedRepresentative,
        institutionName: newHospital.hospitalName,
        email: formValues.officialEmail,
        phone: formValues.contactNumber,
        district: formValues.district,
        province: formValues.province,
        status: 'Pending Verification',
        createdAt: '2026-11-11',
      };

      setHospitals((prev) => {
        const next = [newHospital, ...prev];
        writeStorage('hospitals', next);
        return next;
      });
      setUsers((prev) => {
        const next = [newUser, ...prev];
        writeStorage('users', next);
        return next;
      });
      pushNotification({
        targetRole: 'admin',
        targetUserId: 'USR-ADMIN-01',
        title: `New hospital verification submission: ${newHospital.hospitalName}`,
        message: `${formValues.authorizedRepresentative} submitted permit reference ${formValues.verificationDocReference}.`,
        category: 'Institutional Review',
        actionPath: '/dashboard/admin?tab=verifications',
      });
      appendActivity(
        formValues.authorizedRepresentative,
        'Hospital Applicant',
        `Submitted institutional onboarding for ${newHospital.hospitalName}.`
      );
      return { hospital: newHospital, user: newUser };
    },
    [hospitals.length, users.length, appendActivity, pushNotification]
  );

  const updateDonorProfile = useCallback(
    async (donorId, updates) => {
      await donorService.updateProfile(donorId, updates);
      setDonors((prev) => {
        const next = prev.map((d) => (d.id === donorId ? { ...d, ...updates } : d));
        writeStorage('donors', next);
        return next;
      });
    },
    []
  );

  const toggleDonorAvailability = useCallback(
    async (donorId, { availabilityPreference, notificationsPaused }) => {
      await donorService.updateAvailability(donorId, {
        availabilityPreference,
        notificationsPaused,
      });
      setDonors((prev) => {
        const next = prev.map((d) =>
          d.id === donorId
            ? {
                ...d,
                ...(availabilityPreference !== undefined ? { availabilityPreference } : {}),
                ...(notificationsPaused !== undefined ? { notificationsPaused } : {}),
              }
            : d
        );
        writeStorage('donors', next);
        return next;
      });
    },
    []
  );

  const createBloodRequest = useCallback(
    async (formValues, requesterId = 'USR-REQ-01') => {
      await requestService.createRequest(formValues);
      const matchedHospital = hospitals.find(
        (h) => h.hospitalName.toLowerCase() === formValues.hospitalName.toLowerCase()
      );
      const newReq = {
        id: `REQ-NP-${2084 + requests.length}`,
        isDemonstrationRecord: true,
        requesterId,
        requesterName: formValues.requesterName,
        patientName: formValues.patientName || formValues.requesterName,
        contactPhone: formValues.contactPhone,
        contactEmail: formValues.contactEmail || '',
        bloodGroup: formValues.bloodGroup,
        unitsRequired: Number(formValues.unitsRequired),
        urgency: formValues.urgency,
        hospitalId: matchedHospital?.id || 'HOSP-NP-101',
        hospitalName: formValues.hospitalName,
        province: formValues.province,
        district: formValues.district,
        municipality: formValues.municipality,
        requiredDate: formValues.requiredDate,
        createdAt: '2026-11-11',
        status: 'Pending',
        hospitalVerificationNote: 'Submitted in demo mode; awaiting hospital blood bank ward check.',
        requestDetails: formValues.requestDetails,
        pledgedDonors: [],
      };
      setRequests((prev) => {
        const next = [newReq, ...prev];
        writeStorage('requests', next);
        return next;
      });
      pushNotification({
        targetRole: 'hospital',
        targetUserId: 'USR-HOSP-01',
        title: `New ${newReq.bloodGroup} request submitted (${newReq.id})`,
        message: `${newReq.unitsRequired} unit(s) requested at ${newReq.hospitalName} for ${newReq.requiredDate}.`,
        category: 'Verification Queue',
        actionPath: '/dashboard/hospital?tab=requests',
      });
      appendActivity(
        formValues.requesterName,
        'Requester',
        `Submitted blood request ${newReq.id} (${newReq.unitsRequired}u ${newReq.bloodGroup}) at ${newReq.district}.`
      );
      return newReq;
    },
    [hospitals, requests.length, appendActivity, pushNotification]
  );

  const updateBloodRequestStatus = useCallback(
    async (requestId, nextStatus, note = '', actorName = 'Coordinator') => {
      await requestService.updateRequestStatus(requestId, nextStatus, note);
      setRequests((prev) => {
        const next = prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: nextStatus,
                hospitalVerificationNote: note || req.hospitalVerificationNote,
              }
            : req
        );
        writeStorage('requests', next);
        return next;
      });
      pushNotification({
        targetRole: 'requester',
        targetUserId: 'USR-REQ-01',
        title: `Request ${requestId} updated to ${nextStatus}`,
        message: note || `Status changed to ${nextStatus}.`,
        category: 'Status Update',
        actionPath: '/dashboard/requester?tab=requests',
      });
      appendActivity(actorName, 'Coordination', `Updated request ${requestId} status to ${nextStatus}.`);
    },
    [appendActivity, pushNotification]
  );

  const pledgeDonorToRequest = useCallback(
    async (requestId, donorId, donorName = 'Voluntary Donor') => {
      await requestService.pledgeDonorResponse(requestId, donorId);
      setRequests((prev) => {
        const next = prev.map((req) => {
          if (req.id !== requestId) return req;
          const existing = req.pledgedDonors || [];
          if (existing.includes(donorId)) return req;
          const updatedStatus = req.status === 'Verified' ? 'Donor Coordination' : req.status;
          return {
            ...req,
            status: updatedStatus,
            pledgedDonors: [...existing, donorId],
          };
        });
        writeStorage('requests', next);
        return next;
      });
      pushNotification({
        targetRole: 'hospital',
        targetUserId: 'USR-HOSP-01',
        title: `Donor availability confirmed for ${requestId}`,
        message: `${donorName} confirmed readiness to visit the hospital transfusion desk.`,
        category: 'Donor Coordination',
        actionPath: '/dashboard/hospital?tab=coordination',
      });
      appendActivity(donorName, 'Donor', `Responded to blood request ${requestId}.`);
    },
    [appendActivity, pushNotification]
  );

  const updateHospitalVerification = useCallback(
    async (hospitalId, verificationStatus, rejectionReason = '', actorName = 'Administrator') => {
      await adminService.updateHospitalVerification(hospitalId, verificationStatus, rejectionReason);
      setHospitals((prev) => {
        const next = prev.map((h) =>
          h.id === hospitalId
            ? {
                ...h,
                verificationStatus,
                verifiedAt: verificationStatus === 'Verified' ? '2026-11-11' : null,
                rejectionReason: verificationStatus === 'Rejected' ? rejectionReason : '',
              }
            : h
        );
        writeStorage('hospitals', next);
        return next;
      });
      appendActivity(
        actorName,
        'Administrator',
        `Set hospital ${hospitalId} verification state to ${verificationStatus}.`
      );
    },
    [appendActivity]
  );

  const updateHospitalBloodUnits = useCallback(async (hospitalId, updatedUnits) => {
    await hospitalService.updateInventory(hospitalId, updatedUnits);
    setHospitals((prev) => {
      const next = prev.map((h) =>
        h.id === hospitalId ? { ...h, availableBloodUnits: updatedUnits } : h
      );
      writeStorage('hospitals', next);
      return next;
    });
  }, []);

  const addHospitalStaff = useCallback(async (hospitalId, staffMember) => {
    await hospitalService.addStaffMember(hospitalId, staffMember);
    const created = {
      id: `STF-${Date.now()}`,
      active: true,
      ...staffMember,
    };
    setHospitals((prev) => {
      const next = prev.map((h) =>
        h.id === hospitalId ? { ...h, staff: [...(h.staff || []), created] } : h
      );
      writeStorage('hospitals', next);
      return next;
    });
  }, []);

  const removeHospitalStaff = useCallback((hospitalId, staffId) => {
    setHospitals((prev) => {
      const next = prev.map((h) =>
        h.id === hospitalId
          ? { ...h, staff: (h.staff || []).filter((s) => s.id !== staffId) }
          : h
      );
      writeStorage('hospitals', next);
      return next;
    });
  }, []);

  const toggleUserStatus = useCallback(async (userId) => {
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id !== userId) return u;
        const nextStatus = u.status === 'Suspended' ? 'Active' : 'Suspended';
        adminService.updateUserStatus(userId, nextStatus);
        return { ...u, status: nextStatus };
      });
      writeStorage('users', next);
      return next;
    });
  }, []);

  const markNotificationRead = useCallback((notificationId) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
      writeStorage('notifications', next);
      return next;
    });
  }, []);

  const markAllNotificationsRead = useCallback((role) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.targetRole === role ? { ...n, read: true } : n));
      writeStorage('notifications', next);
      return next;
    });
  }, []);

  const savePlatformSettings = useCallback((updates) => {
    setPlatformSettings((prev) => {
      const next = { ...prev, ...updates };
      writeStorage('settings', next);
      return next;
    });
  }, []);

  const submitContactInquiry = useCallback((values) => {
    const entry = {
      id: `INQ-${Date.now()}`,
      submittedAt: '2026-11-11',
      ...values,
    };
    setContactMessages((prev) => {
      const next = [entry, ...prev];
      writeStorage('contact_messages', next);
      return next;
    });
    return entry;
  }, []);

  const resetDemonstrationData = useCallback(() => {
    clearAllPlatformStorage();
    setDonors(INITIAL_DONORS);
    setRequests(INITIAL_REQUESTS);
    setHospitals(INITIAL_HOSPITALS);
    setUsers(DEMO_USERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivities(RECENT_ADMIN_ACTIVITIES);
    setPlatformSettings(DEFAULT_SETTINGS);
    setContactMessages([]);
  }, []);

  const value = useMemo(
    () => ({
      donors,
      requests,
      hospitals,
      users,
      notifications,
      activities,
      platformSettings,
      contactMessages,
      registerDonorAccount,
      registerRequesterAccount,
      registerHospitalAccount,
      updateDonorProfile,
      toggleDonorAvailability,
      createBloodRequest,
      updateBloodRequestStatus,
      pledgeDonorToRequest,
      updateHospitalVerification,
      updateHospitalBloodUnits,
      addHospitalStaff,
      removeHospitalStaff,
      toggleUserStatus,
      markNotificationRead,
      markAllNotificationsRead,
      savePlatformSettings,
      submitContactInquiry,
      resetDemonstrationData,
    }),
    [
      donors,
      requests,
      hospitals,
      users,
      notifications,
      activities,
      platformSettings,
      contactMessages,
      registerDonorAccount,
      registerRequesterAccount,
      registerHospitalAccount,
      updateDonorProfile,
      toggleDonorAvailability,
      createBloodRequest,
      updateBloodRequestStatus,
      pledgeDonorToRequest,
      updateHospitalVerification,
      updateHospitalBloodUnits,
      addHospitalStaff,
      removeHospitalStaff,
      toggleUserStatus,
      markNotificationRead,
      markAllNotificationsRead,
      savePlatformSettings,
      submitContactInquiry,
      resetDemonstrationData,
    ]
  );

  return <PlatformDataContext.Provider value={value}>{children}</PlatformDataContext.Provider>;
}
