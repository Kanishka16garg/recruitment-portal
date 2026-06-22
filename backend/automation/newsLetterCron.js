import cron from "node-cron";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

export const newsLetterCron = () => {
  console.log("[CRON] ✓ Cron job scheduler initialized");
  cron.schedule("*/1 * * * *", async () => {
    console.log("\n[CRON] ========================================");
    console.log("[CRON] Running Cron Automation for job notifications");
    console.log("[CRON] Time:", new Date().toISOString());
    try {
      const jobs = await Job.find({ newsLettersSent: false });
      console.log(`[CRON] Found ${jobs.length} new jobs to notify about`);
      
      if (jobs.length === 0) {
        console.log("[CRON] No new jobs to process");
        return;
      }
      
      for (const job of jobs) {
        try {
          console.log(`[CRON] Processing job: "${job.title}" (ID: ${job._id})`);
          console.log(`[CRON] Job niche: "${job.jobNiche}"`);
          
          // Find users whose niches match this job
          const filteredUsers = await User.find({
            role: "Job Seeker",
            $or: [
              { "niches.firstNiche": job.jobNiche },
              { "niches.secondNiche": job.jobNiche },
              { "niches.thirdNiche": job.jobNiche },
            ],
          });
          
          console.log(`[CRON] Found ${filteredUsers.length} users to notify for job: ${job.title}`);
          
          // Debug: Log user details if found
          if (filteredUsers.length > 0) {
            console.log(`[CRON] Users to notify:`, filteredUsers.map(u => ({ name: u.name, email: u.email, niches: u.niches })));
          } else {
            // Debug: Check if there are any job seekers at all
            const allJobSeekers = await User.find({ role: "Job Seeker" });
            console.log(`[CRON] Total Job Seekers in database: ${allJobSeekers.length}`);
            if (allJobSeekers.length > 0) {
              console.log(`[CRON] Sample Job Seeker niches:`, allJobSeekers[0].niches);
            }
          }
          
          if (filteredUsers.length === 0) {
            console.log(`[CRON] No users found with matching niche: ${job.jobNiche}`);
            job.newsLettersSent = true;
            await job.save();
            continue;
          }
          
          // Send emails to all matching users
          const emailPromises = filteredUsers.map(async (user) => {
            try {
              const subject = `Hot Job Alert: ${job.title} in ${job.jobNiche} Available Now`;
              const message = `Hi ${user.name},

Great news! A new job that fits your niche has just been posted. The position is for a ${job.title} with ${job.companyName}, and they are looking to hire immediately.

Job Details:
- Position: ${job.title}
- Company: ${job.companyName}
- Location: ${job.location}
- Salary: ${job.salary}
- Job Type: ${job.jobType}

Don't wait too long! Job openings like these are filled quickly.

We're here to support you in your job search. Best of luck!

Best Regards,
NicheNest Team`;

              console.log(`[CRON] Sending job notification email to: ${user.email}`);
              await sendEmail({
                email: user.email,
                subject,
                message,
              });
              console.log(`[CRON] Job notification email sent successfully to: ${user.email}`);
            } catch (emailError) {
              console.error(`[CRON] Failed to send email to ${user.email}:`, emailError.message);
              // Continue with other users even if one fails
            }
          });

          // Wait for all emails to be sent
          const results = await Promise.allSettled(emailPromises);
          const successCount = results.filter(r => r.status === 'fulfilled').length;
          const failCount = results.filter(r => r.status === 'rejected').length;
          console.log(`[CRON] Email results: ${successCount} sent, ${failCount} failed`);
          
          // Mark job as notified
          job.newsLettersSent = true;
          await job.save();
          console.log(`[CRON] ✓ Marked job "${job.title}" as notified`);
        } catch (jobError) {
          console.error(`[CRON] Error processing job ${job._id}:`, jobError.message);
          // Continue with next job even if one fails
        }
      }
    } catch (error) {
      console.error("[CRON] ✗✗✗ ERROR IN CRON JOB ✗✗✗");
      console.error("[CRON] Error message:", error.message);
      console.error("[CRON] Error stack:", error.stack);
    }
    console.log("[CRON] ========================================\n");
  });
  console.log("[CRON] ✓ Cron job scheduled to run every minute");
};
