import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controller/userController.js";

const router = express.Router();

// Register user
router.post("/register", register);

// Login user
router.post("/login", login);

// Forgot password
router.post("/password/forgot", forgotPassword);

// Reset password
router.put("/password/reset/:token", resetPassword);

export default router;
