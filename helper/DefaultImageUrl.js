/**
 * helper/DefaultImageUrl.js — React Native version
 *
 * Change from web version:
 *   import.meta.env.VITE_BACKEND_URL  →  process.env.EXPO_PUBLIC_BACKEND_URL
 *
 * In Expo, public env vars must be prefixed with EXPO_PUBLIC_ and are accessed
 * via `process.env.EXPO_PUBLIC_*` (works at build time via babel-plugin-transform-inline-env).
 * Make sure your .env file has:
 *   EXPO_PUBLIC_BACKEND_URL=https://your-api-url.com
 */

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

export const getProfilePhotoUrl = (photoName) => {
  if (!photoName) return `${API_URL}/public/images/default-male.jpeg`;
  if (photoName.startsWith('http') || photoName.startsWith('data:') || photoName.startsWith('file:')) {
    return photoName;
  }
  return `${API_URL}/public/images/${photoName}`;
};

export const getCoverPhotoUrl = (photoName) => {
  if (!photoName) return `${API_URL}/public/images/default-cover.jpeg`;
  if (photoName.startsWith('http') || photoName.startsWith('data:') || photoName.startsWith('file:')) {
    return photoName;
  }
  return `${API_URL}/public/images/${photoName}`;
};
