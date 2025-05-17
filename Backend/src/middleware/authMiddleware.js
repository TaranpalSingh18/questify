const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  console.log('Auth middleware called');
  console.log('Request headers:', req.headers);
  
  let token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    console.log('No token or invalid token format');
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    token = token.split(" ")[1]; // Remove "Bearer" prefix
    console.log('Verifying token:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: "Token invalid" });
  }
};

module.exports = { protect };
