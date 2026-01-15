# Niche Nest (Recruitment Portal)

A MERN job portal project (backend + frontend) for employers and job seekers.

This repository contains:

- `backend/` - Express.js server, MongoDB models and controllers.
- `frontend/` - React + Vite frontend (Redux Toolkit for state management).

---

**Project Summary:**

This app lets employers post jobs and manage applications, and lets job seekers apply to jobs. Applications now include a status field (`pending` | `accepted` | `rejected`) which employers can update from the Employer dashboard. Job seekers see friendly messages based on the status of their applications.

---

**Tech Stack**

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React, Vite, Redux Toolkit
- Authentication: JSON Web Tokens (cookies used for credentials)
- File uploads: Cloudinary (for resumes)

---

**What's New / Important Feature**

- Application Status System
  - New `status` field on `Application` model: enum `"pending" | "accepted" | "rejected"` (default `pending`).
  - API to update status: `PUT /api/v1/application/:id/status` (Employer-only). Employer must be owner of application to update it.
  - Employer UI: dropdown to change status instantly in `Applications` component.
  - Job Seeker UI: shows current status and friendly message in `MyApplications` component.

---

**Repository Structure (top-level)**

- `backend/`
  - `app.js`, `server.js`
  - `controllers/`, `models/`, `routes/`, `middlewares/`, `config/`
- `frontend/`
  - `src/` (React app)
  - `package.json`, `vite.config.js`

---

**Prerequisites**

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (Atlas or local)
- Cloudinary account (for resume uploads)

---

**Environment Variables**

Create a `.env` (or `config.env`) for backend and `VITE` env for frontend as needed.

Example `backend/config/config.env` values used in the project:

```env
PORT=4000
FRONTEND_URL=http://localhost:5173
MONGO_URI=<your_mongo_uri>
JWT_SECRET_KEY=<your_jwt_secret>
JWT_EXPIRE=5d
COOKIE_EXPIRE=5
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<cloud_key>
CLOUDINARY_API_SECRET=<cloud_secret>
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_MAIL=<your_email>
SMTP_PASSWORD=<your_smtp_password>
```

Frontend (optional) - if you want a custom API base URL in Vite create `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

If not provided, frontend falls back to `http://localhost:4000/api/v1` by default.

---

**How to Run (local)**

1. Backend

```powershell
cd backend
npm install
# start with nodemon or node depending on your setup
npm run dev    # or: node server.js
```

2. Frontend

```powershell
cd frontend
npm install
npm run dev
# open http://localhost:5173 (Vite default) in your browser
```

Notes:

- Backend uses cookie-based auth. Ensure `FRONTEND_URL` matches the origin at which you open the frontend so CORS + credentials work.
- Resume uploads use Cloudinary; set Cloudinary env variables before starting backend.

---

**Key API Endpoints (summary)**

- Auth / User:

  - `POST /api/v1/user/register`
  - `POST /api/v1/user/login`
  - `GET /api/v1/user/getuser` (protected)
  - `GET /api/v1/user/logout`

- Jobs:

  - `POST /api/v1/job/post` (Employer)
  - `GET /api/v1/job/getall`
  - `GET /api/v1/job/get/:id`
  - `GET /api/v1/job/getmyjobs` (Employer)
  - `DELETE /api/v1/job/delete/:id` (Employer)

- Applications:
  - `POST /api/v1/application/post/:jobId` (Job Seeker)
  - `GET /api/v1/application/employer/getall` (Employer)
  - `GET /api/v1/application/jobseeker/getall` (Job Seeker)
  - `DELETE /api/v1/application/delete/:id` (Job Seeker or Employer)
  - `PUT /api/v1/application/:id/status` (Employer only) <-- new

---

**Frontend Notes**

- Redux slices live in `frontend/src/store/slices/`:
  - `userSlice.js`, `jobSlice.js`, `applicationSlice.js`, `updateProfileSlice.js`
- API endpoints are centralized in `frontend/src/config/apiConfig.js`.
- Employer view for applications: `frontend/src/components/Applications.jsx` (dropdown to update status)
- Job seeker view for own applications: `frontend/src/components/MyApplications.jsx` (shows status + friendly messages)

---

**Testing the Application Status Flow**

- As a Job Seeker:

  - Apply to a job via the Job page or `POST /api/v1/application/post/:jobId`.
  - By default application `status` = `pending`.
  - Visit `My Applications` to view status and message.

- As the Employer who posted the job:
  - Visit `Applications` on the employer dashboard.
  - Use the `Update Status` dropdown to set `Accepted` or `Rejected`.
  - Status updates are saved to the database and reflected in both employer and job seeker dashboards.

---

**Contributing**

- Create an issue describing the change or bug.
- Open a pull request with a clear description and tests where applicable.

---

**License**

This repository does not contain a license file. Add a `LICENSE` if you want to open-source the project.

---

## Next Steps / Improvements
- Add a short `DEVELOPMENT.md` with common commands and debugging tips.
- Add example `.env` files (separate for backend/frontend).
- Add unit/integration tests for critical backend and frontend flows.
- Set up GitHub Actions CI to run tests on push.
- Deploy to production using Render/Railway (backend) and Vercel/Netlify (frontend).
