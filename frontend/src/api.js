import axios from 'axios';

const API = axios.create({
  // This uses the Vercel Environment Variable we set up earlier
  baseURL: import.meta.env.VITE_API_URL || 'https://elitesync-backend.onrender.com/api',
});

// Automatically sends your login token if you have one
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;