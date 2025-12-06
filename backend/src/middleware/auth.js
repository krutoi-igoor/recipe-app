import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newToken = jwt.sign({ userId: decoded.userId, email: decoded.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return newToken;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid token' });
  }

  const token = authHeader.slice(7); // Remove "Bearer "
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded has { userId, email }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
