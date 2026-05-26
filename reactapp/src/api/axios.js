import axios from "axios";

export const API_BASE_URL = "http://127.0.0.1:8000";
export const RECORDS_API = "/api/records";
export const API_STATIC_MEDIA = "http://192.168.56.101:1337/";

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

export default axiosInstance;
