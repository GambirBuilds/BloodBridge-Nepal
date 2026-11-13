import { getPrismaClient } from '../config/database.js';
import {
  AVAILABILITY_MAP,
  BLOOD_GROUP_MAP,
  CONTACT_METHOD_MAP,
  ROLES,
} from '../constants/index.js';
import {
  comparePassword,
  generateTokens,
  hashPassword,
  sanitizeUser,
  verifyRefreshToken,
} from '../utils/index.js';

export async function register(req, res) {
  try {
    const data = req.validatedBody;
    const prisma = await getPrismaClient();

    // Check existing email or phone
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists.',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
        district: data.district,
        province: data.province,
      },
    });

    // Create role-specific profile
    if (data.role === ROLES.DONOR) {
      const dbBloodGroup = BLOOD_GROUP_MAP[data.bloodGroup] || 'O_POSITIVE';
      const dbAvailability = AVAILABILITY_MAP[data.availabilityPreference] || 'AVAILABLE_NOW';
      const dbContactMethod = CONTACT_METHOD_MAP[data.preferredContactMethod] || 'PLATFORM_NOTIFICATION';

      await prisma.donorProfile.create({
        data: {
          userId: user.id,
          bloodGroup: dbBloodGroup,
          province: data.province,
          district: data.district,
          municipality: data.municipality || `${data.district} Municipality`,
          approximateLocation: data.approximateLocation || null,
          shareMunicipalityPublicly: data.shareMunicipalityPublicly !== false,
          preferredContactMethod: dbContactMethod,
          availabilityPreference: dbAvailability,
          notificationsPaused: dbAvailability === 'TEMPORARILY_PAUSED',
          consentDonorRequests: true,
          consentPrivacy: true,
        },
      });

      // Welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to BLOODBRIDGE Nepal',
          message: `Your voluntary donor profile for ${data.bloodGroup || 'O+'} in ${data.district} is now active.`,
          category: 'Account',
          actionPath: '/dashboard/donor',
        },
      });
    } else if (data.role === ROLES.REQUESTER) {
      await prisma.requesterProfile.create({
        data: {
          userId: user.id,
          district: data.district,
          province: data.province,
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Requester workspace ready',
          message: 'Submit blood requests and track hospital verification status in real time.',
          category: 'Account',
          actionPath: '/dashboard/requester',
        },
      });
    } else if (data.role === ROLES.HOSPITAL) {
      // Create hospital profile in PENDING verification state
      const hospital = await prisma.hospital.create({
        data: {
          hospitalName: data.hospitalName || `${data.fullName}'s Clinic (Demo Institution)`,
          institutionType: data.institutionType || 'Public Hospital',
          registrationNumber: data.registrationNumber || `REG-${Date.now()}`,
          address: data.address || `${data.district} Health Complex`,
          province: data.province,
          district: data.district,
          municipality: data.municipality || `${data.district} Municipality`,
          officialEmail: data.officialEmail || data.email,
          contactNumber: data.contactNumber || data.phone,
          authorizedRepresentative: data.authorizedRepresentative || data.fullName,
          representativeDesignation: data.representativeDesignation || 'Blood Bank Officer',
          verificationStatus: 'PENDING',
          verificationDocReference: data.verificationDocReference || 'DOC-SUBMITTED-2083',
        },
      });

      await prisma.hospitalStaff.create({
        data: {
          userId: user.id,
          hospitalId: hospital.id,
          roleTitle: data.representativeDesignation || 'Blood Bank Officer',
          shift: 'Day Shift',
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Hospital onboarding submitted',
          message: 'Your hospital registration is currently pending administrator verification.',
          category: 'Institutional Review',
          actionPath: '/dashboard/hospital',
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'USER_REGISTERED',
        targetType: 'User',
        targetId: user.id,
        details: { email: user.email, role: user.role, district: user.district },
        ipAddress: req.ip,
      },
    });

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        donorProfile: true,
        requesterProfile: true,
        hospitalStaff: { include: { hospital: true } },
      },
    });

    const tokens = generateTokens({ userId: user.id, role: user.role });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        user: sanitizeUser(fullUser),
        ...tokens,
      },
    });
  } catch (err) {
    console.error('[RegisterError]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to complete registration.',
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.validatedBody;
    const prisma = await getPrismaClient();

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        donorProfile: true,
        requesterProfile: true,
        hospitalStaff: { include: { hospital: true } },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact platform administration.',
      });
    }

    const validPassword = await comparePassword(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const tokens = generateTokens({ userId: user.id, role: user.role });

    // Set secure cookie for refresh token if supported
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'USER_LOGIN',
        targetType: 'User',
        targetId: user.id,
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: sanitizeUser(user),
        ...tokens,
      },
    });
  } catch (err) {
    console.error('[LoginError]', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during sign-in.',
    });
  }
}

export async function refresh(req, res) {
  try {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
    }

    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      include: {
        donorProfile: true,
        requesterProfile: true,
        hospitalStaff: { include: { hospital: true } },
      },
    });

    if (!user || user.status === 'SUSPENDED') {
      return res.status(401).json({
        success: false,
        message: 'User no longer active.',
      });
    }

    const newTokens = generateTokens({ userId: user.id, role: user.role });

    return res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        user: sanitizeUser(user),
        ...newTokens,
      },
    });
  } catch (err) {
    console.error('[RefreshError]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh authentication session.',
    });
  }
}

export async function logout(req, res) {
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function getMe(req, res) {
  return res.json({
    success: true,
    data: sanitizeUser(req.user),
  });
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.validatedBody;
    const prisma = await getPrismaClient();

    const valid = await comparePassword(currentPassword, req.user.passwordHash);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: 'PASSWORD_CHANGED',
        targetType: 'User',
        targetId: req.user.id,
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    console.error('[ChangePasswordError]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password.',
    });
  }
}
