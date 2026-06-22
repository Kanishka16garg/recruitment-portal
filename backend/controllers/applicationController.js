import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { sendEmail } from "../utils/sendEmail.js";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone, address, coverLetter } = req.body;
  if (!name || !email || !phone || !address || !coverLetter) {
    return next(new ErrorHandler("All fields are required.", 400));
  }
  const jobSeekerInfo = {
    id: req.user._id,
    name,
    email,
    phone,
    address,
    coverLetter,
    role: "Job Seeker",
  };
  const jobDetails = await Job.findById(id);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found.", 404));
  }
  const isAlreadyApplied = await Application.findOne({
    "jobInfo.jobId": id,
    "jobSeekerInfo.id": req.user._id,
  });
  if (isAlreadyApplied) {
    return next(
      new ErrorHandler("You have already applied for this job.", 400)
    );
  }
  if (req.files && req.files.resume) {
    const { resume } = req.files;
    try {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {
          folder: "Job_Seekers_Resume",
        }
      );
      if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(
          new ErrorHandler("Failed to upload resume to cloudinary.", 500)
        );
      }
      jobSeekerInfo.resume = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    } catch (error) {
      return next(new ErrorHandler("Failed to upload resume", 500));
    }
  } else {
    if (req.user && !req.user.resume.url) {
      return next(new ErrorHandler("Please upload your resume.", 400));
    }
    jobSeekerInfo.resume = {
      public_id: req.user && req.user.resume.public_id,
      url: req.user && req.user.resume.url,
    };
  }
  const employerInfo = {
    id: jobDetails.postedBy,
    role: "Employer",
  };
  const jobInfo = {
    jobId: id,
    jobTitle: jobDetails.title,
  };
  const application = await Application.create({
    jobSeekerInfo,
    employerInfo,
    jobInfo,
  });
  res.status(201).json({
    success: true,
    message: "Application submitted.",
    application,
  });
});

export const employerGetAllApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { _id } = req.user;
    const applications = await Application.find({
      "employerInfo.id": _id,
      "deletedBy.employer": false,
    });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobSeekerGetAllApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { _id } = req.user;
    const applications = await Application.find({
      "jobSeekerInfo.id": _id,
      "deletedBy.jobSeeker": false,
    });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found.", 404));
  }
  const { role } = req.user;
  switch (role) {
    case "Job Seeker":
      application.deletedBy.jobSeeker = true;
      await application.save();
      break;
    case "Employer":
      application.deletedBy.employer = true;
      await application.save();
      break;

    default:
      console.log("Default case for application delete function.");
      break;
  }

  if (
    application.deletedBy.employer === true &&
    application.deletedBy.jobSeeker === true
  ) {
    await application.deleteOne();
  }
  res.status(200).json({
    success: true,
    message: "Application Deleted.",
  });
});

export const updateApplicationStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return next(new ErrorHandler("Invalid status provided.", 400));
    }

    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found.", 404));
    }

    // Ensure only the employer who received the application can update it
    if (
      !application.employerInfo ||
      application.employerInfo.id.toString() !== req.user._id.toString()
    ) {
      return next(new ErrorHandler("Not authorized to update this.", 403));
    }

    const previousStatus = application.status;
    console.log("\n[APPLICATION STATUS UPDATE] ========================================");
    console.log("[APPLICATION STATUS UPDATE] Application ID:", id);
    console.log("[APPLICATION STATUS UPDATE] Previous Status:", previousStatus);
    console.log("[APPLICATION STATUS UPDATE] New Status:", status);
    console.log("[APPLICATION STATUS UPDATE] Job Seeker Email:", application.jobSeekerInfo?.email);
    console.log("[APPLICATION STATUS UPDATE] Job Title:", application.jobInfo?.jobTitle);
    
    application.status = status;
    await application.save();
    console.log("[APPLICATION STATUS UPDATE] Status saved to database");

    // Send acceptance email to the candidate FIRST (before job deletion)
    if (status === "accepted" && previousStatus !== "accepted") {
      console.log("[APPLICATION STATUS UPDATE] ✓ Condition met: Sending acceptance email");
      
      // Validate email address exists
      if (!application.jobSeekerInfo || !application.jobSeekerInfo.email) {
        console.error("[EMAIL] ✗✗✗ CANNOT SEND ACCEPTANCE EMAIL: Job seeker email not found ✗✗✗");
      } else {
        try {
          const job = await Job.findById(application.jobInfo.jobId);
          const jobTitle = job ? job.title : (application.jobInfo?.jobTitle || "the position");
          
          const message = `Congratulations!

We are pleased to inform you that your application for the position of "${jobTitle}" has been ACCEPTED!

You have been selected for the interview round. We were impressed with your qualifications and experience, and we would like to proceed with the next steps in our hiring process.

📅 Interview Round:
You have been selected for the interview round. Further details regarding the interview schedule, format, and location will be shared with you via email shortly.

Important Information:
- All interview-related communications and details will be shared via email only.
- Please ensure you check your email regularly, including your spam/junk folder.
- You will receive detailed information about the interview date, time, format (in-person, video call, or phone), and any preparation materials via email.

What to Expect:
- Interview date and time confirmation via email
- Interview format and platform details (if virtual)
- Any documents or materials you need to prepare
- Contact information for the interview coordinator

We look forward to meeting you and learning more about your qualifications and experience.

Best regards,
The Hiring Team`;

          console.log("[EMAIL] ===== SENDING ACCEPTANCE EMAIL =====");
          console.log("[EMAIL] Recipient:", application.jobSeekerInfo.email);
          console.log("[EMAIL] Job Title:", jobTitle);
          
          await sendEmail({
            email: application.jobSeekerInfo.email,
            subject: "Congratulations! Your Application Has Been Accepted",
            message,
          });
          
          console.log("[EMAIL] ✓✓✓ Acceptance email sent successfully! ✓✓✓");
        } catch (error) {
          console.error("[EMAIL] ✗✗✗ FAILED TO SEND ACCEPTANCE EMAIL ✗✗✗");
          console.error("[EMAIL] Error Message:", error.message);
          console.error("[EMAIL] Error Code:", error.code);
          console.error("[EMAIL] Recipient:", application.jobSeekerInfo?.email);
          console.error("[EMAIL] Full Error Stack:", error.stack);
          // Re-throw to see the error in response (optional, or keep silent)
        }
      }
    } else if (status === "accepted") {
      console.log("[APPLICATION STATUS UPDATE] ⚠ Status is 'accepted' but email condition not met");
      console.log("[APPLICATION STATUS UPDATE] Previous status was:", previousStatus);
    }

    // Send rejection email to the candidate
    if (status === "rejected" && previousStatus !== "rejected") {
      console.log("[APPLICATION STATUS UPDATE] ✓ Condition met: Sending rejection email");
      
      // Validate email address exists
      if (!application.jobSeekerInfo || !application.jobSeekerInfo.email) {
        console.error("[EMAIL] ✗✗✗ CANNOT SEND REJECTION EMAIL: Job seeker email not found ✗✗✗");
      } else {
        try {
          const job = await Job.findById(application.jobInfo.jobId);
          const jobTitle = job ? job.title : (application.jobInfo?.jobTitle || "the position");
          const jobSeekerName = application.jobSeekerInfo?.name || "Candidate";
          
          const message = `Dear ${jobSeekerName},

Thank you for your interest in the position of "${jobTitle}" and for taking the time to apply with us.

After careful consideration of all applications, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current requirements.

We appreciate the time and effort you invested in your application. We encourage you to continue exploring opportunities with us, as we frequently post new positions that may be a better fit for your skills and experience.

We wish you the very best in your job search and future career endeavors.

Thank you again for your interest in joining our team.

Best regards,
The Hiring Team`;

          console.log("[EMAIL] ===== SENDING REJECTION EMAIL =====");
          console.log("[EMAIL] Recipient:", application.jobSeekerInfo.email);
          console.log("[EMAIL] Job Title:", jobTitle);
          
          await sendEmail({
            email: application.jobSeekerInfo.email,
            subject: "Update on Your Application",
            message,
          });
          
          console.log("[EMAIL] ✓✓✓ Rejection email sent successfully! ✓✓✓");
        } catch (error) {
          console.error("[EMAIL] ✗✗✗ FAILED TO SEND REJECTION EMAIL ✗✗✗");
          console.error("[EMAIL] Error Message:", error.message);
          console.error("[EMAIL] Error Code:", error.code);
          console.error("[EMAIL] Recipient:", application.jobSeekerInfo?.email);
          console.error("[EMAIL] Full Error Stack:", error.stack);
          // Re-throw to see the error in response (optional, or keep silent)
        }
      }
    } else if (status === "rejected") {
      console.log("[APPLICATION STATUS UPDATE] ⚠ Status is 'rejected' but email condition not met");
      console.log("[APPLICATION STATUS UPDATE] Previous status was:", previousStatus);
    }

    // Auto-remove job if hiring capacity = 1 and one candidate is accepted
    if (status === "accepted") {
      const job = await Job.findById(application.jobInfo.jobId);
      if (job && job.hiringMultipleCandidates === "No") {
        // Count accepted applications for this job
        const acceptedCount = await Application.countDocuments({
          "jobInfo.jobId": application.jobInfo.jobId,
          status: "accepted",
        });

        // If one candidate is accepted and capacity is 1, remove the job
        if (acceptedCount >= 1) {
          await job.deleteOne();
          console.log(`[JOB] Auto-removed job "${job.title}" as capacity is full`);
        }
      }
    }

    console.log("[APPLICATION STATUS UPDATE] ========================================\n");
    res.status(200).json({ success: true, application });
  }
);
