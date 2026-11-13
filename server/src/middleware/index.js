import { getPrismaClient } from '../config/database.js';
import { verifyAccessToken } from '../utils/index.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No bearer token or cookie provided.',
    });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token. Please log in again.',
    });
  }

  try {
    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      include: {
        donorProfile: true,
        requesterProfile: true,
        hospitalStaff: {
          include: { hospital: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account no longer exists.',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Account has been suspended by platform administration.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error finding user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate user.',
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This operation requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is ${req.user.role}.`,
      });
    }

    next();
  };
}

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: err.errors ? err.errors.map(e => ({ field: e.path.join('.'), message: e.message })) : err.message,
      });
    }
  };
}

export function errorHandler(err, req, res, next) {
  console.error('[GlobalErrorHandler]', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred.';
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
