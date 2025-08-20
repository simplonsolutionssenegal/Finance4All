import { randomBytes } from 'crypto';

export const generatePassword = () => {
  return randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 19);
};
