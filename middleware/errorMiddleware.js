const ApiError = require('../utils/apiError');


// Handle Mongoose validation errors

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => val.message);
  const message = `Validation Error: ${errors.join(', ')}`;
  return new ApiError(message, 400);
};


// Handle Mongoose duplicate key errors

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field} already exists`;
  return new ApiError(message, 400);
};


// Handle Mongoose cast errors
 
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(message, 400);
};

// Handle JWT errors

const handleJWTError = () => {
  return new ApiError('Invalid token, please login again', 401);
};

const handleJWTExpiredError = () => {
  return new ApiError('Your token has expired, please login again', 401);
};

//  Development error response
 
const sendErrorDev = (err, res) => {
  console.error(err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

//  Production error response

const sendErrorProd = (err, res) => {
    console.error(err);
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

// Global error handling middleware

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.code === 11000) error = handleDuplicateKeyError(error);
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};


// Handle unhandled routes

const notFound = (req, res, next) => {
  const error = new ApiError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
