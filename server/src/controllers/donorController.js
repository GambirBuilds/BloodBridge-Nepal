import { getPrismaClient } from '../config/database.js';
import {
  AVAILABILITY_MAP,
  BLOOD_GROUP_MAP,
  CONTACT_METHOD_MAP,
  REVERSE_AVAILABILITY_MAP,
  REVERSE_BLOOD_GROUP_MAP,
  REVERSE_CONTACT_METHOD_MAP,
} from '../constants/index.js';

export async function getDonors(req, res) {
  try {
    const { bloodGroup, province, district, municipality, availability, q } = req.query;
    const prisma = await getPrismaClient();

    const where = {};
    if (bloodGroup && BLOOD_GROUP_MAP[bloodGroup]) {
      where.bloodGroup = BLOOD_GROUP_MAP[bloodGroup];
    }
    if (province) {
      where.province = province;
    }
    if (district) {
      where.district = district;
    }
    if (availability && AVAILABILITY_MAP[availability]) {
      where.availabilityPreference = AVAILABILITY_MAP[availability];
    }

    // Only discoverable donors: active account, consented, and optionally not paused
    const profiles = await prisma.donorProfile.findMany({
      where,
      include: { user: true, donationRecords: true },
    });

    const sanitizedList = profiles
      .filter((p) => {
        // Enforce privacy & discovery rules:
        if (!p.user || p.user.status === 'SUSPENDED') return false;
        if (!p.consentDonorRequests || !p.consentPrivacy) return false;
        if (municipality && p.shareMunicipalityPublicly && p.municipality !== municipality) return false;
        if (q) {
          const search = q.toLowerCase();
          const matchName = p.user.fullName.toLowerCase().includes(search);
          const matchDist = p.district.toLowerCase().includes(search);
          if (!matchName && !matchDist) return false;
        }
        return true;
      })
      .map((p) => {
        // Privacy projection: NEVER expose phone, email, or exact approximate location
        const parts = p.user.fullName.trim().split(/\s+/);
        let displayName = parts[0];
        if (p.publicDisplayMode === 'first_initial' && parts.length > 1) {
          displayName = `${parts[0]} ${parts[parts.length - 1][0]}.`;
        } else if (p.publicDisplayMode === 'full_consented') {
          displayName = p.user.fullName;
        }

        return {
          id: p.id,
          fullName: displayName,
          bloodGroup: REVERSE_BLOOD_GROUP_MAP[p.bloodGroup] || 'O+',
          province: p.province,
          district: p.district,
          municipality: p.shareMunicipalityPublicly ? p.municipality : null,
          shareMunicipalityPublicly: p.shareMunicipalityPublicly,
          availabilityPreference: REVERSE_AVAILABILITY_MAP[p.availabilityPreference] || 'Available Now',
          notificationsPaused: p.notificationsPaused,
          preferredContactMethod: REVERSE_CONTACT_METHOD_MAP[p.preferredContactMethod] || 'Platform Notification',
          registeredAt: p.createdAt,
          totalDonationsRecorded: p.donationRecords?.length || 0,
        };
      });

    return res.json({
      success: true,
      count: sanitizedList.length,
      data: sanitizedList,
    });
  } catch (err) {
    console.error('[GetDonorsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch donors.' });
  }
}

export async function getDonorById(req, res) {
  try {
    const { id } = req.params;
    const prisma = await getPrismaClient();

    const profile = await prisma.donorProfile.findUnique({
      where: { id },
      include: { user: true, donationRecords: true },
    });

    if (!profile || profile.user.status === 'SUSPENDED') {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const parts = profile.user.fullName.trim().split(/\s+/);
    let displayName = parts[0];
    if (profile.publicDisplayMode === 'first_initial' && parts.length > 1) {
      displayName = `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }

    return res.json({
      success: true,
      data: {
        id: profile.id,
        fullName: displayName,
        bloodGroup: REVERSE_BLOOD_GROUP_MAP[profile.bloodGroup] || 'O+',
        province: profile.province,
        district: profile.district,
        municipality: profile.shareMunicipalityPublicly ? profile.municipality : null,
        availabilityPreference: REVERSE_AVAILABILITY_MAP[profile.availabilityPreference] || 'Available Now',
        notificationsPaused: profile.notificationsPaused,
        registeredAt: profile.createdAt,
        totalDonationsRecorded: profile.donationRecords?.length || 0,
      },
    });
  } catch (err) {
    console.error('[GetDonorByIdError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve donor.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const prisma = await getPrismaClient();
    const data = req.validatedBody;

    if (req.user.role !== 'DONOR' || !req.user.donorProfile) {
      return res.status(403).json({ success: false, message: 'Only voluntary donors have a donor profile.' });
    }

    const updateData = {};
    if (data.province) updateData.province = data.province;
    if (data.district) updateData.district = data.district;
    if (data.municipality) updateData.municipality = data.municipality;
    if (data.approximateLocation !== undefined) updateData.approximateLocation = data.approximateLocation;
    if (data.preferredContactMethod && CONTACT_METHOD_MAP[data.preferredContactMethod]) {
      updateData.preferredContactMethod = CONTACT_METHOD_MAP[data.preferredContactMethod];
    }
    if (data.publicDisplayMode) updateData.publicDisplayMode = data.publicDisplayMode;
    if (typeof data.shareMunicipalityPublicly === 'boolean') {
      updateData.shareMunicipalityPublicly = data.shareMunicipalityPublicly;
    }

    const updatedProfile = await prisma.donorProfile.update({
      where: { id: req.user.donorProfile.id },
      data: updateData,
    });

    if (data.fullName || data.phone) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(data.fullName ? { fullName: data.fullName } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
        },
      });
    }

    return res.json({
      success: true,
      message: 'Donor profile updated successfully.',
      data: updatedProfile,
    });
  } catch (err) {
    console.error('[UpdateDonorProfileError]', err);
    return res.status(500).json({ success: false, message: 'Failed to update donor profile.' });
  }
}

export async function updateAvailability(req, res) {
  try {
    const prisma = await getPrismaClient();
    const { availabilityPreference, notificationsPaused } = req.validatedBody;

    if (req.user.role !== 'DONOR' || !req.user.donorProfile) {
      return res.status(403).json({ success: false, message: 'Only voluntary donors can toggle availability.' });
    }

    const updateData = {};
    if (availabilityPreference && AVAILABILITY_MAP[availabilityPreference]) {
      updateData.availabilityPreference = AVAILABILITY_MAP[availabilityPreference];
    }
    if (typeof notificationsPaused === 'boolean') {
      updateData.notificationsPaused = notificationsPaused;
      if (notificationsPaused) {
        updateData.availabilityPreference = 'TEMPORARILY_PAUSED';
      }
    }

    const updated = await prisma.donorProfile.update({
      where: { id: req.user.donorProfile.id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Donor availability updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('[UpdateAvailabilityError]', err);
    return res.status(500).json({ success: false, message: 'Failed to update availability.' });
  }
}

export async function getDonorRequests(req, res) {
  try {
    const prisma = await getPrismaClient();
    if (req.user.role !== 'DONOR' || !req.user.donorProfile) {
      return res.status(403).json({ success: false, message: 'Donor profile required.' });
    }

    const invitations = await prisma.donorRequest.findMany({
      where: { donorProfileId: req.user.donorProfile.id },
      include: { bloodRequest: true },
    });

    return res.json({
      success: true,
      data: invitations,
    });
  } catch (err) {
    console.error('[GetDonorRequestsError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve donor invitations.' });
  }
}

export async function getDonationHistory(req, res) {
  try {
    const prisma = await getPrismaClient();
    if (req.user.role !== 'DONOR' || !req.user.donorProfile) {
      return res.status(403).json({ success: false, message: 'Donor profile required.' });
    }

    const history = await prisma.donationRecord.findMany({
      where: { donorProfileId: req.user.donorProfile.id },
    });

    return res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    console.error('[GetDonationHistoryError]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve donation history.' });
  }
}
