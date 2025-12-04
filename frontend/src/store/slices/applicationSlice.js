import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/apiConfig.js";

const applicationSlice = createSlice({
  name: "applications",
  initialState: {
    applications: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    requestForAllApplications(state, action) {
      state.loading = true;
      state.error = null;
    },
    successForAllApplications(state, action) {
      state.loading = false;
      state.error = null;
      state.applications = action.payload;
    },
    failureForAllApplications(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    requestForMyApplications(state, action) {
      state.loading = true;
      state.error = null;
    },
    successForMyApplications(state, action) {
      state.loading = false;
      state.error = null;
      state.applications = action.payload;
    },
    failureForMyApplications(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    requestForPostApplication(state, action) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    successForPostApplication(state, action) {
      state.loading = false;
      state.error = null;
      state.message = action.payload;
    },
    failureForPostApplication(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },
    requestForDeleteApplication(state, action) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    successForDeleteApplication(state, action) {
      state.loading = false;
      state.error = null;
      state.message = action.payload;
    },
    failureForDeleteApplication(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    clearAllErrors(state, action) {
      state.error = null;
      state.applications = state.applications;
    },
    resetApplicationSlice(state, action) {
      state.error = null;
      state.applications = state.applications;
      state.message = null;
      state.loading = false;
    },
  },
});

export const fetchEmployerApplications = () => async (dispatch) => {
  dispatch(applicationSlice.actions.requestForAllApplications());
  try {
    const response = await axios.get(
      API_ENDPOINTS.APPLICATION_EMPLOYER_GET_ALL,
      {
        withCredentials: true,
      }
    );
    dispatch(
      applicationSlice.actions.successForAllApplications(
        response.data.applications
      )
    );
    dispatch(applicationSlice.actions.clearAllErrors());
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    dispatch(applicationSlice.actions.failureForAllApplications(msg));
  }
};

export const fetchJobSeekerApplications = () => async (dispatch) => {
  dispatch(applicationSlice.actions.requestForMyApplications());
  try {
    const response = await axios.get(
      API_ENDPOINTS.APPLICATION_JOBSEEKER_GET_ALL,
      {
        withCredentials: true,
      }
    );
    dispatch(
      applicationSlice.actions.successForMyApplications(
        response.data.applications
      )
    );
    dispatch(applicationSlice.actions.clearAllErrors());
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    dispatch(applicationSlice.actions.failureForMyApplications(msg));
  }
};

export const postApplication = (data, jobId) => async (dispatch) => {
  dispatch(applicationSlice.actions.requestForPostApplication());
  try {
    const response = await axios.post(
      `${API_ENDPOINTS.APPLICATION_POST}/${jobId}`,
      data,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    dispatch(
      applicationSlice.actions.successForPostApplication(response.data.message)
    );
    dispatch(applicationSlice.actions.clearAllErrors());
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    dispatch(applicationSlice.actions.failureForPostApplication(msg));
  }
};

export const deleteApplication = (id) => async (dispatch) => {
  dispatch(applicationSlice.actions.requestForDeleteApplication());
  try {
    const response = await axios.delete(
      `${API_ENDPOINTS.APPLICATION_DELETE}/${id}`,
      { withCredentials: true }
    );
    dispatch(
      applicationSlice.actions.successForDeleteApplication(
        response.data.message
      )
    );
    dispatch(clearAllApplicationErrors());
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    dispatch(applicationSlice.actions.failureForDeleteApplication(msg));
  }
};

export const updateApplicationStatus =
  (id, status) => async (dispatch, getState) => {
    dispatch(applicationSlice.actions.requestForAllApplications());
    try {
      const response = await axios.put(
        `${API_ENDPOINTS.APPLICATION_UPDATE_BASE}/${id}/status`,
        { status },
        { withCredentials: true }
      );

      const updatedApp = response.data.application;
      const { applications: currentApps } = getState().applications;
      const newApps = Array.isArray(currentApps)
        ? currentApps.map((a) => (a._id === updatedApp._id ? updatedApp : a))
        : [updatedApp];

      dispatch(applicationSlice.actions.successForAllApplications(newApps));
      dispatch(applicationSlice.actions.clearAllErrors());
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";
      dispatch(applicationSlice.actions.failureForAllApplications(msg));
    }
  };

export const clearAllApplicationErrors = () => (dispatch) => {
  dispatch(applicationSlice.actions.clearAllErrors());
};

export const resetApplicationSlice = () => (dispatch) => {
  dispatch(applicationSlice.actions.resetApplicationSlice());
};

export default applicationSlice.reducer;
