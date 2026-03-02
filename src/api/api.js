import axios from "axios";
import { getAuthService } from "../components/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const REISSUE_URL = process.env.REACT_APP_REISSUE_URL;

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authService = getAuthService();

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url === "/members" &&
        originalRequest.method === "post"
      ) {
        return Promise.reject(error);
      }

      if (originalRequest.url === "/api/auth/reissue") {
        if (error.response?.data?.customErrorCode === "UNAUTHORIZATION") {
          authService.logout(false);
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const reissueResponse = await axios.post(
          REISSUE_URL,
          {},
          { withCredentials: true }
        );
        const newAccessToken = reissueResponse.headers[
          "authorization"
        ]?.replace("Bearer ", "");

        if (!newAccessToken) {
          throw new Error("Access token was not included in the reissue response.");
        }

        authService.updateToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (reissueError) {
        processQueue(reissueError, null);
        authService.logout();
        return Promise.reject(reissueError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
