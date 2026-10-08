import axios from "axios";
import { server } from "./config";
import { clearUserStorageOnLogout } from "../utils/userStorage";

const instance = axios.create({
  baseURL: server,
  withCredentials: true, // Crucial for HttpOnly cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.request.use(
  (config) => {
    // If active branch exists in localStorage, attach header
    const activeBranchStr = localStorage.getItem("activeBranch");
    if (activeBranchStr) {
      try {
        const activeBranch = JSON.parse(activeBranchStr);
        const branchId = typeof activeBranch === "string" ? activeBranch : activeBranch?._id;
        if (branchId) {
          config.headers["x-branch-id"] = branchId;
        }
      } catch (e) {
        if (activeBranchStr.length === 24) {
          config.headers["x-branch-id"] = activeBranchStr;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    // Ignore refresh attempts on auth endpoints themselves to avoid infinite loops
    const isAuthEndpoint =
      url.includes("/user/google-login") ||
      url.includes("/user/refresh-token") ||
      url.includes("/user/logout");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => instance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent refresh via HttpOnly cookie
        await axios.post(
          `${server}/user/refresh-token`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;
        processQueue(null);
        return instance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        // Session is expired or superseded on another device
        clearUserStorageOnLogout();

        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    if (status === 403 && (error.response?.data?.message?.includes("deactivated") || error.response?.data?.message?.includes("blocked"))) {
      clearUserStorageOnLogout();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
