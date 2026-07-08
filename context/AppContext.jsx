import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import api from "../api/axios";
import { initSocket, socket } from "../lib/sockets.js";
import {
  initPushNotifications,
  removePushSubscription,
} from "../services/push.service.js";
import {
  clearUserKeysLocally,
  decryptPrivateKey,
  encryptPrivateKey,
  generateNewKeyPair,
  getUserKeys,
  saveUserKeysLocally,
} from "../utils/encryption.js";

export const AppContext = createContext(null);

const SESSION_PWD_KEY = "__apni_e2ee_pwd__";

const cachePassword = async (userId, pwd, email = null) => {
  try {
    await AsyncStorage.setItem(
      SESSION_PWD_KEY,
      JSON.stringify({ userId: String(userId), pwd, email: email || null }),
    );
  } catch { }
};

const getCachedPassword = async (userId) => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_PWD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.userId === String(userId) ? parsed.pwd : null;
  } catch {
    return null;
  }
};

// Used by the forgot-password flow: if this device still has a cached
// password for this account from a previous logged-in session, we can
// silently reuse it to decrypt + re-encrypt the E2EE private key during a
// password reset — no visible "enter current password" field needed. This
// only ever succeeds on a device where the user was previously logged in
// with the (still-correct-at-the-time) password; on any other device, or if
// nothing is cached, it simply returns null and the reset proceeds without
// migrating old encrypted messages (same outcome as today's "skip" option).
export const getCachedPasswordForEmail = async (email) => {
  try {
    if (!email) return null;
    const raw = await AsyncStorage.getItem(SESSION_PWD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.email && parsed.email.toLowerCase() === email.toLowerCase()
      ? parsed.pwd
      : null;
  } catch {
    return null;
  }
};

const clearCachedPassword = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_PWD_KEY);
  } catch { }
};

const AppContextProvider = ({ children }) => {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [keysReady, setE2eeReady] = useState(false);
  const [keysNeedPassword, setKeysNeedPassword] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const socketInitRef = useRef(null);

  // ── Socket lifecycle ───────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.id) {
      if (socketInitRef.current === user.id && socket.connected) return;
      socketInitRef.current = user.id;
      initSocket();
    } else {
      socketInitRef.current = null;
      if (socket.connected) {
        console.log("[Socket] Disconnecting due to logout/missing user...");
        socket.disconnect();
      }
    }
  }, [user?.id]);

  // ── AppState Fore/Background Handling ─────────────────────────────────────
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active" && user?.id) {
        console.log("[AppContext] App came to foreground, reconnecting socket...");
        if (!socket.connected) {
          socket.connect();
        } else {
          socket.emit("setup", { userId: user.id });
          socket.emit("heartbeat");
        }
      }
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [user?.id]);

  // ── Emit heartbeat/setup right after every (re)connect ────────────────────
  // This ensures the server registers the user as online immediately.
  // The web browser sends cookies automatically; on Android we supplement with
  // an explicit setup event so the server can update its online-user map.
  useEffect(() => {
    if (!user?.id) return;

    const handleConnect = () => {
      console.log("[Socket] Sending setup/heartbeat after connect, userId:", user.id);
      // Try both — some servers use 'setup', some rely only on heartbeat
      socket.emit("setup", { userId: user.id });
      socket.emit("heartbeat");
    };

    socket.on("connect", handleConnect);

    // Also fire immediately if already connected
    if (socket.connected) handleConnect();

    return () => socket.off("connect", handleConnect);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      if (socket.connected) socket.emit("heartbeat");
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // ── E2EE key restoration ───────────────────────────────────────────────────
  const restoreE2EEKeys = async (userId, password = null, email = null) => {
    try {
      setKeysNeedPassword(false);
      const pwd = password || (await getCachedPassword(userId));

      const existing = await getUserKeys(userId);
      if (existing?.publicKey && existing?.privateKey) {
        if (pwd) {
          try {
            console.log(`[E2EE_TRACE] Encrypting existing local private key to sync with server...`);
            const {
              encryptedPrivateKey,
              nonce: privateKeyNonce,
              salt: privateKeySalt,
            } = await encryptPrivateKey(existing.privateKey, pwd);
            console.log(`[E2EE_TRACE] Uploading encrypted private key to server...`);
            await api.post("/api/keys/me", {
              publicKey: existing.publicKey,
              encryptedPrivateKey,
              privateKeyNonce,
              privateKeySalt,
            });
            await cachePassword(userId, pwd, email);
            console.info("[E2EE] Keys synced to server from local storage.");
          } catch (syncErr) {
            console.warn(
              "[E2EE] Server sync failed (non-fatal):",
              syncErr.message,
            );
          }
        }
        setE2eeReady(true);
        return;
      }

      if (!pwd) {
        console.info("[E2EE] No local keys and no password — prompting user.");
        setKeysNeedPassword(true);
        setE2eeReady(false);
        return;
      }

      let serverRow = null;
      try {
        const res = await api.get("/api/keys/me");
        if (res.data?.success) serverRow = res.data;
      } catch (err) {
        if (err?.response?.status !== 404) {
          console.warn("[E2EE] Could not reach server:", err.message);
          setE2eeReady(false);
          return;
        }
      }

      if (
        serverRow?.encryptedPrivateKey &&
        serverRow?.privateKeyNonce &&
        serverRow?.privateKeySalt
      ) {
        try {
          console.log(`[E2EE_TRACE] Found encrypted keys on server. Attempting to decrypt with local password...`);
          const privateKey = await decryptPrivateKey(
            serverRow.encryptedPrivateKey,
            serverRow.privateKeyNonce,
            serverRow.privateKeySalt,
            pwd,
          );
          console.log(`[E2EE_TRACE] Decryption successful. Saving to local storage...`);
          await saveUserKeysLocally(userId, serverRow.publicKey, privateKey);
          await cachePassword(userId, pwd, email);
          setE2eeReady(true);
          console.info("[E2EE] Keys restored from server into local storage.");
          return;
        } catch {
          console.warn("[E2EE] Could not decrypt server key — regenerating.");
        }
      }

      console.log(`[E2EE_TRACE] Generating completely new keypair...`);
      const { publicKey, privateKey } = generateNewKeyPair();
      console.log(`[E2EE_TRACE] Encrypting new keypair...`);
      const {
        encryptedPrivateKey,
        nonce: privateKeyNonce,
        salt: privateKeySalt,
      } = await encryptPrivateKey(privateKey, pwd);
      console.log(`[E2EE_TRACE] Saving new keypair locally and uploading to server...`);
      await saveUserKeysLocally(userId, publicKey, privateKey);
      await api.post("/api/keys/me", {
        publicKey,
        encryptedPrivateKey,
        privateKeyNonce,
        privateKeySalt,
      });
      await cachePassword(userId, pwd, email);
      setE2eeReady(true);
      console.info("[E2EE] Fresh keypair generated and saved.");
    } catch (err) {
      console.warn("[E2EE] Unexpected error in restoreE2EEKeys:", err.message);
      setE2eeReady(false);
    }
  };

  // ── Unlock keys via password prompt ───────────────────────────────────────
  const unlockKeysWithPassword = async (password) => {
    if (!user?.id) throw new Error("Not logged in");

    let serverRow = null;
    try {
      const res = await api.get("/api/keys/me");
      if (res.data?.success) serverRow = res.data;
    } catch {
      throw new Error("Could not reach server. Please check your connection.");
    }

    if (
      !serverRow?.encryptedPrivateKey ||
      !serverRow?.privateKeyNonce ||
      !serverRow?.privateKeySalt
    ) {
      console.log(`[E2EE_TRACE] unlockKeysWithPassword failed: No encrypted key found on server.`);
      throw new Error("No encrypted key found on server.");
    }

    console.log(`[E2EE_TRACE] Attempting to unlock server keys with provided password...`);
    const privateKey = await decryptPrivateKey(
      serverRow.encryptedPrivateKey,
      serverRow.privateKeyNonce,
      serverRow.privateKeySalt,
      password,
    );

    console.log(`[E2EE_TRACE] Keys unlocked successfully! Saving to local storage...`);
    await saveUserKeysLocally(user.id, serverRow.publicKey, privateKey);
    await cachePassword(user.id, password, user.email);
    setKeysNeedPassword(false);
    setE2eeReady(true);
    console.info("[E2EE] Keys unlocked via password and saved to local storage.");
  };

  // ── Auth check ────────────────────────────────────────────────────────────
  const checkAuth = async (password = null, silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
        setIsAuthenticating(true);
      }
      const res = await api.get("/api/user/is-auth", {
        withCredentials: true,
      });

      if (res.data?.success && res.data?.user) {
        const u = res.data.user;
        setUser(u);
        await AsyncStorage.setItem(
          "apniDiariesUser",
          JSON.stringify({
            id: u.id,
            name: u.name,
            email: u.email,
            avatar: u.image_url || u.avatar || null,
          }),
        );
        await restoreE2EEKeys(u.id, password, u.email);
        initPushNotifications().catch(() => { });
        return true;
      } else {
        setUser(null);
        setE2eeReady(false);
        setKeysNeedPassword(false);
        await AsyncStorage.removeItem("apniDiariesUser");
        await clearCachedPassword();
        return false;
      }
    } catch {
      if (!silent) {
        setUser(null);
        setE2eeReady(false);
        setKeysNeedPassword(false);
        await AsyncStorage.removeItem("apniDiariesUser");
      }
      return false;
    } finally {
      if (!silent) {
        setIsAuthenticating(false);
        setIsLoading(false);
      }
    }
  };

  const login = async (password = null) => {
    await clearCachedPassword();
    if (user?.id) {
      await clearUserKeysLocally(user.id).catch(() => { });
    }
    const ok = await checkAuth(password);
    // iOS persists the login cookie into its native cookie jar
    // asynchronously relative to the login response resolving in JS. If the
    // very first is-auth check right after login loses that race, give it a
    // brief moment to settle and try once more instead of stranding the user
    // on the wrong screen. Android doesn't rely on this native cookie jar
    // timing at all, so it's left untouched.
    if (!ok && Platform.OS === "ios") {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await checkAuth(password);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    const userId = user?.id;
    try {
      await api.post("/api/user/logout", {}, { withCredentials: true });
    } catch {
    } finally {
      if (userId) await clearUserKeysLocally(userId).catch(() => { });
      setUser(null);
      setE2eeReady(false);
      setKeysNeedPassword(false);
      await AsyncStorage.removeItem("apniDiariesUser");
      await AsyncStorage.removeItem("token");
      await clearCachedPassword();
      removePushSubscription().catch(() => { });
    }
  };

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        const saved = await AsyncStorage.getItem("apniDiariesUser");
        if (saved) {
          setUser(JSON.parse(saved));
          await checkAuth(null, true);
        } else {
          await checkAuth(null, false);
        }
      } catch {
        await AsyncStorage.removeItem("apniDiariesUser");
        await checkAuth(null, false);
      } finally {
        setIsBootstrapped(true);
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  return (
    <AppContext.Provider
      value={{
        backendUrl,
        user,
        setUser,
        checkAuth,
        login,
        logout,
        isLoading,
        isAuthenticating,
        keysReady,
        keysNeedPassword,
        unlockKeysWithPassword,
        isBootstrapped,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;