/* eslint-disable import/no-extraneous-dependencies */
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import User from '../models/user';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not found. Please login again.'
        });
      }
      
      // Check if user is active
      if (user.status !== 'ACTIVE') {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: 'Account is not active. Please contact support.'
        });
      }
      
      req.user = user;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }
      
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
  } catch (error) {
    return next(error);
  }
};

// Role-based access control
export const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.accountType)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    
    return next();
  };