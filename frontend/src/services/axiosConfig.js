import axios from "axios";
import { server } from "./config";

const instance = axios.create({
  baseURL: server,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token !== null) {
      config.headers["Authorization"] = token;
    }
    
    const activeBranchStr = localStorage.getItem("activeBranch");
    if (activeBranchStr) {
        try {
            const activeBranch = JSON.parse(activeBranchStr);
            const branchId = typeof activeBranch === 'string' ? activeBranch : activeBranch?._id;
            if (branchId) {
                config.headers["x-branch-id"] = branchId;
            }
        } catch (e) {
            // If it's not a valid JSON, it might be the ID string itself
            if (activeBranchStr.length === 24) {
                config.headers["x-branch-id"] = activeBranchStr;
            }
        }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      // Only clear session if the failed request was to our user/auth endpoints
      if (url && (url.includes('/user/') || url.includes('/auth/'))) {
        localStorage.removeItem("accessToken");
      }
    }
    if (status === 403) {
      console.error("Session Expired or Access Forbidden! Failed URL:", url);

      if (window.__persistor) {
        window.__persistor.purge();
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
