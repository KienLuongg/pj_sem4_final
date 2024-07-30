import axios from 'axios';
import { getCookie, setCookie } from '../utils/storage/cookie-storage';
import { Storage } from '../contstants/storage';

const baseURL = 'http://113.178.34.234:4869';

const mainAxios = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

mainAxios.interceptors.request.use(
  (config) => {
    const token = getCookie(Storage.token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  } // Remove the comma here
);

// Thêm interceptor để xử lý refresh token
mainAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu phản hồi lỗi là 401 Unauthorized và không phải là yêu cầu refresh token đầu tiên
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gửi yêu cầu refresh token
        const refreshToken = getCookie(Storage.refresh_token);
        const refreshResponse = await mainAxios.post(
          '/api/v1/auth/refresh-token',
          {
            token: refreshToken,
          }
        );

        // Cập nhật token mới và refresh token trong cookie
        setCookie(Storage.token, refreshResponse.data.token);
        setCookie(Storage.refresh_token, refreshResponse.data.refresh_token);

        // Thực hiện lại yêu cầu gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
        return axios(originalRequest);
      } catch (refreshError) {

        console.error('Could not refresh token:', refreshError);
        // Đăng xuất người dùng hoặc xử lý lỗi một cách phù hợp
        // Ví dụ: dispatch một hành động để đăng xuất người dùng
        // logoutUser();
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

export default mainAxios;
