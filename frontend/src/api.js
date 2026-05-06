import axios from 'axios';

const API = axios.create({
  // This line picks up the link you saved in the Vercel Dashboard
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// This helps send the token if you have one later
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;