import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import {
  addNotificationResponseListener,
  addPushTokenRefreshListener,
  getLastNotificationResponse,
} from "../services/push.service";

const PENDING_DESTINATION_KEY = "apniDiariesPendingPushDestination";
const HANDLED_RESPONSE_KEY = "apniDiariesLastPushResponse";

function destinationFor(data = {}) {
  const type = String(data.type || "").toUpperCase();
  const threadId = data.threadId || data.thread_id;
  const actorId = data.actorId || data.senderId || data.actor_id;
  const postId = data.postId || data.post_id;

  if (["NEW_MESSAGE", "MESSAGE"].includes(type)) {
    return threadId
      ? { pathname: "/(protected)/chat-interface", params: { threadId: String(threadId) } }
      : { pathname: "/(protected)/chat-list" };
  }
  if (["FRIEND_REQUEST", "FRIEND_REQUEST_ACCEPTED"].includes(type)) {
    if (type === "FRIEND_REQUEST_ACCEPTED" && actorId) {
      return { pathname: "/(protected)/other-user-profile", params: { id: String(actorId) } };
    }
    return { pathname: "/(protected)/notifications" };
  }
  if (["FRIEND_ACCEPTED", "NEW_FOLLOWER", "FOLLOW"].includes(type) && actorId) {
    return { pathname: "/(protected)/other-user-profile", params: { id: String(actorId) } };
  }
  if (["POST_LIKE", "NEW_COMMENT", "LIKE", "COMMENT"].includes(type)) {
    return { pathname: "/(protected)/community-posts", params: postId ? { postId: String(postId) } : {} };
  }
  if (["MISSED_CALL", "INCOMING_CALL"].includes(type)) return { pathname: "/(protected)/calls" };
  if (type.startsWith("TRIP") || type.startsWith("TRAVEL")) return { pathname: "/(protected)/trips" };
  return { pathname: "/(protected)/notifications" };
}

export default function PushNotificationBridge() {
  const router = useRouter();
  const { user, isBootstrapped } = useContext(AppContext);
  const pendingRef = useRef(null);

  const openWhenReady = useCallback(async (destination) => {
    if (!isBootstrapped) {
      pendingRef.current = destination;
      await AsyncStorage.setItem(PENDING_DESTINATION_KEY, JSON.stringify({ destination, savedAt: Date.now() }));
      return;
    }
    if (!user?.id) {
      pendingRef.current = destination;
      await AsyncStorage.setItem(PENDING_DESTINATION_KEY, JSON.stringify({ destination, savedAt: Date.now() }));
      return;
    }
    pendingRef.current = null;
    await AsyncStorage.removeItem(PENDING_DESTINATION_KEY);
    router.push(destination);
  }, [isBootstrapped, router, user?.id]);

  const handleResponse = useCallback(async (data, identifier) => {
    if (!identifier) return;
    if (await AsyncStorage.getItem(HANDLED_RESPONSE_KEY) === identifier) return;
    await AsyncStorage.setItem(HANDLED_RESPONSE_KEY, identifier);
    await openWhenReady(destinationFor(data));
  }, [openWhenReady]);

  useEffect(() => addPushTokenRefreshListener(), []);

  useEffect(() => {
    let active = true;
    const removeListener = addNotificationResponseListener(handleResponse);
    getLastNotificationResponse().then((response) => {
      if (active && response) handleResponse(response.data, response.identifier);
    }).catch(() => {});
    return () => {
      active = false;
      removeListener();
    };
  }, [handleResponse]);

  useEffect(() => {
    if (!isBootstrapped || !user?.id) return;
    let active = true;
    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem(PENDING_DESTINATION_KEY);
        if (!saved || !active) return;
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
          await AsyncStorage.removeItem(PENDING_DESTINATION_KEY);
          return;
        }
        await openWhenReady(parsed.destination);
      } catch {
        await AsyncStorage.removeItem(PENDING_DESTINATION_KEY);
      }
    };
    restore();
    return () => { active = false; };
  }, [isBootstrapped, openWhenReady, user?.id]);

  return null;
}
