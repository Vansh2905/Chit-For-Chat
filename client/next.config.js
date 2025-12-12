/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://chit-for-chat.onrender.com'
      : 'http://localhost:5000'
  }
};

export default nextConfig;