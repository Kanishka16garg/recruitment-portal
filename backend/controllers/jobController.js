import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";

export const postJob = catchAsyncErrors(async (req, res, next) => {
  const {
    title,
    jobType,
    location,
    companyName,
    introduction,
    responsibilities,
    qualifications,
    offers,
    salary,
    hiringMultipleCandidates,
    personalWebsiteTitle,
    personalWebsiteUrl,
    jobNiche,
  } = req.body;
  if (
    !title ||
    !jobType ||
    !location ||
    !companyName ||
    !introduction ||
    !responsibilities ||
    !qualifications ||
    !salary ||
    !jobNiche
  ) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }
  if (
    (personalWebsiteTitle && !personalWebsiteUrl) ||
    (!personalWebsiteTitle && personalWebsiteUrl)
  ) {
    return next(
      new ErrorHandler(
        "Provide both the website url and title, or leave both blank.",
        400
      )
    );
  }
  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    jobType,
    location,
    companyName,
    introduction,
    responsibilities,
    qualifications,
    offers,
    salary,
    hiringMultipleCandidates,
    personalWebsite: {
      title: personalWebsiteTitle,
      url: personalWebsiteUrl,
    },
    jobNiche,
    postedBy,
  });
  res.status(201).json({
    success: true,
    message: "Job posted successfully.",
    job,
  });
});

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const { city, niche, searchKeyword } = req.query;
  const query = {};
  
  // Handle multiple cities
  if (city) {
    const cities = Array.isArray(city) ? city : [city];
    if (cities.length > 0) {
      query.location = { $in: cities };
    }
  }
  
  // Handle multiple niches
  if (niche) {
    const niches = Array.isArray(niche) ? niche : [niche];
    if (niches.length > 0) {
      query.jobNiche = { $in: niches };
    }
  }
  
  if (searchKeyword) {
    query.$or = [
      { title: { $regex: searchKeyword, $options: "i" } },
      { companyName: { $regex: searchKeyword, $options: "i" } },
      { introduction: { $regex: searchKeyword, $options: "i" } },
    ];
  }
  const jobs = await Job.find(query);
  res.status(200).json({
    success: true,
    jobs,
    count: jobs.length,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const myJobs = await Job.find({ postedBy: req.user._id });
  res.status(200).json({
    success: true,
    myJobs,
  });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Oops! Job not found.", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job deleted.",
  });
});

export const getASingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }
  res.status(200).json({
    success: true,
    job,
  });
});

export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    jobType,
    location,
    companyName,
    introduction,
    responsibilities,
    qualifications,
    offers,
    salary,
    hiringMultipleCandidates,
    personalWebsiteTitle,
    personalWebsiteUrl,
    jobNiche,
  } = req.body;

  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  // Ensure only the job poster can update it
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to update this job.", 403));
  }

  if (
    (personalWebsiteTitle && !personalWebsiteUrl) ||
    (!personalWebsiteTitle && personalWebsiteUrl)
  ) {
    return next(
      new ErrorHandler(
        "Provide both the website url and title, or leave both blank.",
        400
      )
    );
  }

  job.title = title || job.title;
  job.jobType = jobType || job.jobType;
  job.location = location || job.location;
  job.companyName = companyName || job.companyName;
  job.introduction = introduction !== undefined ? introduction : job.introduction;
  job.responsibilities = responsibilities || job.responsibilities;
  job.qualifications = qualifications || job.qualifications;
  job.offers = offers !== undefined ? offers : job.offers;
  job.salary = salary || job.salary;
  job.hiringMultipleCandidates = hiringMultipleCandidates !== undefined ? hiringMultipleCandidates : job.hiringMultipleCandidates;
  job.jobNiche = jobNiche || job.jobNiche;
  
  if (personalWebsiteTitle !== undefined || personalWebsiteUrl !== undefined) {
    job.personalWebsite = {
      title: personalWebsiteTitle || job.personalWebsite?.title || "",
      url: personalWebsiteUrl || job.personalWebsite?.url || "",
    };
  }

  await job.save();

  res.status(200).json({
    success: true,
    message: "Job updated successfully.",
    job,
  });
});
