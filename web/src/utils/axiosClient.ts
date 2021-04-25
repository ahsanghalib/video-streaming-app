import axios, { AxiosRequestConfig } from "axios";
import { useTokenStore } from "../stores";
import { apiBaseUrl } from "./apiQueries";

export function axiosClient() {
  const defaultOptions: AxiosRequestConfig = {
    baseURL: apiBaseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Create instance
  let instance = axios.create(defaultOptions);

  // Set the AUTH token for any request
  instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("token");
    config.headers.Authorization = token;
    return config;
  });

  instance.defaults.headers.common[
    "Authorization"
  ] = useTokenStore.getState().accessToken;

  return instance;
}
