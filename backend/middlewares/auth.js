import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  // Debug logging
  console.log("[AUTH] Checking authentication...");
  console.log("[AUTH] Request origin:", req.get("origin"));
  console.log("[AUTH] Cookies received:", Object.keys(req.cookies));
  console.log("[AUTH] Token present:", !!token);

  if (!token) {
    console.log("[AUTH] No token found in cookies");
    return next(new ErrorHandler("User is not authenticated.", 400));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("[AUTH] Token verified for user:", decoded.id);
    req.user = await User.findById(decoded.id);
    console.log("[AUTH] User found:", req.user?.email);
    next();
  } catch (err) {
    console.log("[AUTH] Token verification failed:", err.message);
    throw err;
  }
});

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this resource.`
        )
      );
    }
    next();
  };
};
