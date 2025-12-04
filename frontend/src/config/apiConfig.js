// Frontend API endpoints configuration
// Uses `import.meta.env.VITE_API_URL` when available, otherwise falls back
// to the local backend address used by the project.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export const API_ENDPOINTS = {
  USER_REGISTER: `${API_BASE}/user/register`,
  USER_LOGIN: `${API_BASE}/user/login`,
  USER_GET: `${API_BASE}/user/getuser`,
  USER_LOGOUT: `${API_BASE}/user/logout`,

  JOB_GET_ALL: `${API_BASE}/job/getall`,
  JOB_GET_SINGLE: `${API_BASE}/job/get`,
  JOB_POST: `${API_BASE}/job/post`,
  JOB_GET_MY_JOBS: `${API_BASE}/job/getmyjobs`,
  JOB_DELETE: `${API_BASE}/job/delete`,

  APPLICATION_EMPLOYER_GET_ALL: `${API_BASE}/application/employer/getall`,
  APPLICATION_JOBSEEKER_GET_ALL: `${API_BASE}/application/jobseeker/getall`,
  APPLICATION_POST: `${API_BASE}/application/post`,
  APPLICATION_DELETE: `${API_BASE}/application/delete`,
  APPLICATION_UPDATE_BASE: `${API_BASE}/application`,
};

export default API_ENDPOINTS;
