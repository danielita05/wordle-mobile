import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const baseURL = 'http://192.168.1.72:3000';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('token');

    if (token && config.headers?.set) {
      config.headers.set?.('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
