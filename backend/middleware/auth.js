const admin = require('firebase-admin');
const db = admin.firestore();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    req.userProfile = userDoc.exists ? userDoc.data() : null;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    req.userProfile = userDoc.exists ? userDoc.data() : null;
  } catch (error) {
    // Token invalid, continue without user
  }

  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.userProfile) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.userProfile.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { verifyToken, optionalAuth, requireRole };
