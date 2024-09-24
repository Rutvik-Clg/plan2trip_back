import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import crypto from "crypto";

// Register a new user
export const register = catchAsyncErrors(async (req, res, next) => {
  const { fullName, email, phone, password } = req.body;

  // Create the new user
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
  });

  // Generate a token and send it to the user
  generateToken(user, "User registered successfully!", 201, res);
});

// Login a user
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password!", 400));
  }

  // Check if user exists and select password
  const user = await User.findOne({ email }).select("+password");

  // Check if the password matches
  if (!user || !(await user.comparePassword(password))) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Generate a token and send it to the user
  generateToken(user, "Login successful", 200, res);
});

// Forgot Password (without sending an email)
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Temporarily bypass sending the email and directly return the token for testing
  res.status(200).json({
    success: true,
    message: "Reset token generated successfully",
    resetToken, // Return the reset token in the response for now
  });
});

// Reset Password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired token", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, "Password reset successful", 200, res);
});
