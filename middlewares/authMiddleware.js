const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Blog = require('../models/Blog');

//auth middlewate to protect protected routes using JWT
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

//Auth Middleware to restrict access to blog owners
exports.restrictToOwner = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    if (blog.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to perform this action' });
    }
    next();
  } catch (error) {
    next(error);
  }
};