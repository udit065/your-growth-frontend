const DEV_API_URL = "http://192.168.1.33:5000"; // local backend
const PROD_API_URL = "https://your-growth-backend.onrender.com"; // Render backend

export const API_URL =
    process.env.NODE_ENV === "development" ? DEV_API_URL : PROD_API_URL;
