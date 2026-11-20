// Set EXPO_PUBLIC_API_URL (e.g. in a .env.local file) to use a local backend,
// for example EXPO_PUBLIC_API_URL=http://192.168.1.33:5000
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'https://your-growth-backend.onrender.com'
).replace(/\/+$/, '');
