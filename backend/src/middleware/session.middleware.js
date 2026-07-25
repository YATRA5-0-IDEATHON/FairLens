import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fairlens-prototype-secret-change-before-production';

export function createSessionToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '8h' },
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.auth?.role !== role) return res.status(403).json({ error: `${role} access required` });
    return next();
  };
}
