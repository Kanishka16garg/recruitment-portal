import express from "express";
import { getUser, login, logout, register, updatePassword, updateProfile } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/getuser", isAuthenticated, getUser);
router.put("/update/profile", isAuthenticated, updateProfile)
router.put("/update/password", isAuthenticated, updatePassword)
// Test email endpoint (remove in production)
router.post("/test-email", async (req, res) => {
  try {
    const { sendEmail } = await import("../utils/sendEmail.js");
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    
    console.log("\n[TEST-EMAIL] ===== Manual Email Test =====");
    console.log("[TEST-EMAIL] Testing email configuration...");
    console.log("[TEST-EMAIL] SMTP_MAIL:", process.env.SMTP_MAIL);
    console.log("[TEST-EMAIL] SMTP_PASSWORD set:", process.env.SMTP_PASSWORD ? "YES" : "NO");
    console.log("[TEST-EMAIL] Sending test email to:", email);
    
    await sendEmail({
      email,
      subject: "Test Email from Job Portal",
      message: `Hello!

This is a test email from your Job Portal application.

If you received this email, it means your email configuration is working correctly!

Time sent: ${new Date().toLocaleString()}

Best regards,
Job Portal System`,
    });
    
    console.log("[TEST-EMAIL] ✓ Test email sent successfully");
    console.log("[TEST-EMAIL] =================================\n");
    
    res.json({ 
      success: true, 
      message: "Test email sent successfully. Please check your inbox (and spam folder).",
      recipient: email
    });
  } catch (error) {
    console.error("[TEST-EMAIL] ✗ Test email failed:", error.message);
    console.error("[TEST-EMAIL] =================================\n");
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: "Check server logs for detailed error information"
    });
  }
});

export default router;
