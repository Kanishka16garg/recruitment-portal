export const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();

  // ✅ Cookie options - secure flag only in production
  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProduction, // true only for HTTPS (production)
    sameSite: isProduction ? "none" : "lax", // "lax" for localhost, "none" for cross-origin HTTPS
    path: "/",
  };

  console.log("[TOKEN] Setting cookie with options:", {
    secure: options.secure,
    sameSite: options.sameSite,
  });

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    message,
    token,
  });
};
