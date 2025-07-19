const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");
const { sendWelcomeEmail, resetPasswordEmail } = require("../utils/email");
const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, profile } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError("User already exists with this email", 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || "job_seeker",
    profile: profile || {},
  });

  // Generate token
  const token = generateToken(user.id);

  // Send welcome email (don't wait for it)
  sendWelcomeEmail(user).catch(console.error);

  res.status(201).json({
    success: true,
    data: {
      user,
      token,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new ApiError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // 2.1) If user is not active, return error
  if (!user.isActive) {
    return next(new ApiError("Account is deactivated", 401));
  }

  // 2.2) Update last login
  user.lastLogin = new Date();
  await user.save();
  const token = generateToken(user.id);
  res.status(200).json({
    status: "success",
    data: user,
    token,
  });
});

const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const updateProfile = catchAsync(async (req, res, next) => {
  const { name, profile } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: name || req.user.name,
      profile: { ...req.user.profile, ...profile },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: user,
  });
});

const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ApiError("Please provide current and new password", 400));
  }

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new ApiError("Current password is incorrect", 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

const deactivateAccount = catchAsync(async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
});

const forgotPassword = catchAsync(async (req, res, next) => {
  //  Get user based on email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("There is no user with email address.", 404));
  }

  //  Generate random reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //  Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/resetPassword/${resetToken}`;
  try {
    resetPasswordEmail(user, resetURL);
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new ApiError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the reset token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new ApiError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = generateToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    message: "Password updated successfully",
  });
});

const activateMe = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  if (!user) {
    return next(new ApiError("There is no user with email address.", 404));
  }
  if (user.isActive) {
    return next(new ApiError("Account is activated", 401));
  }
  await User.findByIdAndUpdate(req.user.id, { isActive: true }, { new: true });
  res.status(200).json({
    status: "success",
    message: "Account activated successfully",
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  if (!userId) {
    return next(new ApiError("Please provide a userId", 400));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

const searchUsers = catchAsync(async (req, res, next) => {
  const name = req.query.name;
  if (!name) {
    return next(new ApiError("Please provide a name to search", 400));
  }

  const users = await User.find({ name: { $regex: name, $options: "i" } });

  res.status(200).json({
    status: "success",
    data: users,
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  deactivateAccount,
  activateMe,
  getUser,
  searchUsers,
};
