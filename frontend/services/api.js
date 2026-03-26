import axios from 'axios';

// Khởi tạo instance của axios với URL gốc
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Interceptor: Tự động gắn token vào header trước khi gửi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;