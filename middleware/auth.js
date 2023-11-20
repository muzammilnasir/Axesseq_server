// // authMiddleware.js

// const jwt = require('jsonwebtoken');
// const User = require('../models/userSchema'); // Import your User schema

// // Middleware function to authenticate user
// exports.isAuthenticated = (req, res, next) => {
//   const token = req.headers.authorization; // Get the token from request headers

//   if (!token) {
//     console.log({ message: 'Authentication failed: Token missing' });
//     return res.status(401).json({ message: 'Authentication failed: Token missing' });
//   }

//   // Verify the token
//   jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: 'Authentication failed: Invalid token' });
//     }

//     // Check if the user exists (you may need to customize this part based on your user schema)
//     try {
//       const user = await User.findById(decoded._id);

//       if (!user) {
//         return res.status(401).json({ message: 'Authentication failed: User not found' });
//       }

//       // Attach the user object to the request for further processing in route handlers
//       req.user = user;
//       next();
//     } catch (error) {
//       return res.status(500).json({ message: 'Internal server error' });
//     }
//   });
// };



// authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/userSchema'); // Import your User schema

// Middleware function to authenticate user
exports.isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization; // Get the token from request headers

  // Check if the request is for a specific route that allows guest access
  if (req.path === '/add-to-cart' && !token) {
    // For the /add-to-cart route, allow guest access without authentication
    return next();
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: Token missing' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }

    // Check if the user exists (you may need to customize this part based on your user schema)
    try {
      const user = await User.findById(decoded._id);

      if (!user) {
        return res.status(401).json({ message: 'Authentication failed: User not found' });
      }

      // Attach the user object to the request for further processing in route handlers
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
};
