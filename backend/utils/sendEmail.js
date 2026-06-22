import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  try {
    console.log("[EMAIL] ===== Starting email send process =====");
    console.log("[EMAIL] Recipient:", email);
    console.log("[EMAIL] Subject:", subject);
    
    // Validate environment variables
    if (!process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
      const errorMsg = "SMTP credentials are not configured";
      console.error("[EMAIL] Configuration error:", errorMsg);
      console.error("[EMAIL] SMTP_MAIL:", process.env.SMTP_MAIL ? "SET" : "NOT SET");
      console.error("[EMAIL] SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "SET" : "NOT SET");
      throw new Error(errorMsg);
    }

    console.log("[EMAIL] SMTP_MAIL:", process.env.SMTP_MAIL);
    console.log("[EMAIL] SMTP_SERVICE:", process.env.SMTP_SERVICE);
    console.log("[EMAIL] SMTP_PASSWORD length (before cleanup):", process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.length : 0);

    // Create transporter - use service for Gmail, or host/port for other providers
    let transporterConfig;
    
    if (process.env.SMTP_SERVICE === "gmail" || !process.env.SMTP_HOST) {
      // Use service for Gmail (recommended)
      // Remove spaces from app password if present
      const password = process.env.SMTP_PASSWORD.replace(/\s+/g, '').trim();
      console.log("[EMAIL] Using Gmail service configuration");
      console.log("[EMAIL] Password length (after removing spaces):", password.length);
      console.log("[EMAIL] Password format check:", password.length === 16 ? "✓ Correct (16 chars)" : `⚠ Warning: Expected 16 chars, got ${password.length}`);
      
      if (password.length !== 16) {
        console.error("[EMAIL] ⚠⚠⚠ Gmail App Password should be exactly 16 characters (without spaces) ⚠⚠⚠");
        console.error("[EMAIL] Current password length:", password.length);
        console.error("[EMAIL] Please verify your App Password in Google Account settings");
      }
      
      // Log first 4 and last 4 chars for debugging (never log full password)
      const maskedPassword = password.length > 8 
        ? `${password.substring(0, 4)}...${password.substring(password.length - 4)}`
        : "***";
      console.log("[EMAIL] Password preview (masked):", maskedPassword);
      
      transporterConfig = {
        service: "gmail",
        auth: {
          user: process.env.SMTP_MAIL.trim(),
          pass: password,
        },
        // Additional Gmail-specific settings
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates if needed
        },
      };
    } else {
      // Use host/port for other email providers
      const password = process.env.SMTP_PASSWORD.replace(/\s+/g, '').trim();
      console.log("[EMAIL] Using custom SMTP host configuration");
      transporterConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_MAIL.trim(),
          pass: password,
        },
      };
    }

    console.log("[EMAIL] Creating transporter...");
    const transporter = nodeMailer.createTransport(transporterConfig);

    // Verify transporter configuration (optional - may fail in some environments)
    console.log("[EMAIL] Verifying SMTP connection...");
    try {
      await transporter.verify();
      console.log("[EMAIL] ✓ SMTP server is ready to send emails");
    } catch (verifyError) {
      console.warn("[EMAIL] ⚠ SMTP verification failed, but continuing:", verifyError.message);
      console.warn("[EMAIL] Verification error details:", {
        code: verifyError.code,
        command: verifyError.command,
        response: verifyError.response,
      });
      // Continue anyway - verification might fail but sending could still work
    }

    const options = {
      from: `"NicheNest Job Portal" <${process.env.SMTP_MAIL}>`,
      to: email,
      subject: subject,
      text: message,
    };

    console.log("[EMAIL] Sending email with options:", {
      from: options.from,
      to: options.to,
      subject: options.subject,
      messageLength: message.length,
    });

    const info = await transporter.sendMail(options);
    console.log("[EMAIL] ✓✓✓ Email sent successfully! ✓✓✓");
    console.log("[EMAIL] Message ID:", info.messageId);
    console.log("[EMAIL] Response:", info.response);
    console.log("[EMAIL] ===== Email send process completed =====");

    return info;
  } catch (error) {
    console.error("[EMAIL] ✗✗✗ ERROR SENDING EMAIL ✗✗✗");
    console.error("[EMAIL] Error message:", error.message);
    console.error("[EMAIL] Error code:", error.code);
    console.error("[EMAIL] Error command:", error.command);
    console.error("[EMAIL] Error response:", error.response);
    console.error("[EMAIL] Full error object:", {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });
    console.error("[EMAIL] Configuration check:", {
      smtpMail: process.env.SMTP_MAIL ? "SET" : "NOT SET",
      smtpPassword: process.env.SMTP_PASSWORD ? "SET (length: " + process.env.SMTP_PASSWORD.length + ")" : "NOT SET",
      smtpHost: process.env.SMTP_HOST,
      smtpService: process.env.SMTP_SERVICE,
      smtpPort: process.env.SMTP_PORT,
    });
    console.error("[EMAIL] ===== Email send process failed =====");
    throw error;
  }
};
