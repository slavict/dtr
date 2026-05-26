import axios from "axios";

// Use ?? not || so an empty REACT_APP_API_BASE_URL means same-origin (production).
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:8000");
export const RECORDS_API = "/api/records";
export const API_STATIC_MEDIA = "http://192.168.56.101:1337/";
export const TOKEN_KEY = "auth_token";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

export function setAuthToken(token) {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Token ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
}

// Apply stored token before the first API request (AuthProvider useEffect runs later).
const storedToken = localStorage.getItem(TOKEN_KEY);
if (storedToken) {
  setAuthToken(storedToken);
}

export default axiosInstance;
