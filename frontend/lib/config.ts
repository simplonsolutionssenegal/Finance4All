export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  endpoints: {
    clerkRegister: '/api/v1/users/register',
  },
};
