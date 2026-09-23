// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { router } from "expo-router";

// const api = axios.create({
//   baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
//   withCredentials: true,
//   timeout: 15000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // ✅ Request Interceptor: Manually inject the token into the Cookie header
// api.interceptors.request.use(
//   async (config) => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (token) {
//         // Match the same logic used in lib/sockets.js
//         config.headers.Cookie = `token=${token}`;
//       }
//     } catch (e) {
//       console.warn("[axios] Could not inject token cookie:", e.message);
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ✅ Response Interceptor: Extract token cookie and manage auth state
// api.interceptors.response.use(
//   async (response) => {
//     try {
//       // 1. Check if the backend sent a "token" in the response body (Standard mobile API pattern)
//       const tokenFromBody = response.data?.token || response.data?.data?.token;
//       if (tokenFromBody) {
//         await AsyncStorage.setItem("token", tokenFromBody);
//       }

//       // 2. Check for Set-Cookie header (Fallback for cookie-only backends)
//       const setCookie = response.headers["set-cookie"];
//       if (setCookie && Array.isArray(setCookie)) {
//         const tokenCookie = setCookie.find((c) => c.startsWith("token="));
//         if (tokenCookie) {
//           const tokenValue = tokenCookie.split(";")[0].split("=")[1];
//           await AsyncStorage.setItem("token", tokenValue);
//         }
//       }
//     } catch (e) {
//       console.warn("[axios] Could not extract token cookie:", e.message);
//     }
//     return response;
//   },
//   async (error) => {
//     if (error.response?.status === 401) {
//       await AsyncStorage.removeItem("apniDiariesUser");
//       await AsyncStorage.removeItem("token");
//       const url = error.config?.url || "";
//       const isAuthPath =
//         url.includes("/api/user/login") ||
//         url.includes("/api/user/register") ||
//         url.includes("/api/user/send-verify-otp") ||
//         url.includes("/api/user/is-auth");
//       if (!isAuthPath) {
//         router.replace("/login");
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;


import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      if (Platform.OS === "android") {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          config.headers.Cookie = `token=${token}`;
        }
      }
    } catch (e) {
      console.warn("[axios] Could not inject token cookie:", e.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  async (response) => {
    try {
      const tokenFromBody = response.data?.token || response.data?.data?.token;
      if (tokenFromBody) {
        await AsyncStorage.setItem("token", tokenFromBody);
      }

      const setCookie = response.headers["set-cookie"];
      if (setCookie && Array.isArray(setCookie)) {
        const tokenCookie = setCookie.find((c) => c.startsWith("token="));
        if (tokenCookie) {
          const tokenValue = tokenCookie.split(";")[0].split("=")[1];
          await AsyncStorage.setItem("token", tokenValue);
        }
      }
    } catch (e) {
      console.warn("[axios] Could not extract token cookie:", e.message);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("apniDiariesUser");
      await AsyncStorage.removeItem("token");
      const url = error.config?.url || "";
      const isAuthPath =
        url.includes("/api/user/login") ||
        url.includes("/api/user/register") ||
        url.includes("/api/user/send-verify-otp") ||
        url.includes("/api/user/is-auth");
      if (!isAuthPath) {
        router.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;