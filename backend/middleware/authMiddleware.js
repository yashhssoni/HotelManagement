const jwt = require('jsonwebtoken');

// Protect routes & enforce Role-Based Access Control (RBAC)
const protect = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // 1. Check if Bearer token is provided
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access denied: No authentication token provided.',
        });
      }

      const token = authHeader.split(' ')[1];

      // 2. Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach authenticated user details to request object
      req.user = {
        id: decoded.id,
        role: decoded.role,
        hotelId: decoded.hotelId || null,
      };

      // 3. Verify Role Permissions (if specific roles are required)
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: `Access forbidden: Role '${decoded.role}' does not have permission to perform this action.`,
        });
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired: Please log in again.',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token.',
      });
    }
  };
};

module.exports = {
  protect,
};