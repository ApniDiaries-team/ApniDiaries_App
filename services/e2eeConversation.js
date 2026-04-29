/**
 * services/e2eeConversation.js — React Native version
 *
 * FIX vs previous version:
 *   - Removed `uploadMyPublicKey(myUserId)` call from _doEnsureConversationKey.
 *     The web version does NOT call this — it only calls getUserKeys() directly.
 *     The native version was making an extra API call (POST /api/keys/me) on
 *     every single message load, which is redundant — AppContext already handles
 *     key upload during restoreE2EEKeys. This extra call was also causing
 *     timing issues when keysReady was set but the upload hadn't completed yet.
 *
 *   - Everything else mirrors the web version exactly.
 */

import api from "../api/axios";
import {
  decryptConversationKey,
  encryptConversationKey,
  generateConversationKey,
  getUserKeys,
} from "../utils/encryption.js";

// Dedup map: prevents multiple concurrent negotiations for the same thread+user pair
const _pendingKeys = {};

// Fetch another user's stored public key from the backend
async function fetchUserPublicKey(userId) {
  const res = await api.get(`api/keys/${userId}`);
  return res.data.publicKey;
}

// Fetch my encrypted conversation key row from the backend
async function getMyEncryptedConversationKey(threadId) {
  const res = await api.get(`api/chat/${threadId}/my-key`);
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Key not found");
  }
  return res.data.key;
  /**
   * Expected shape:
   * { threadId, encryptedKey, keyNonce, senderPublicKey }
   */
}

// Save conversation keys for both participants
async function saveConversationKeysForThread(threadId, payload) {
  const res = await api.post(`api/chat/${threadId}/keys`, payload);
  return res.data;
}

/**
 * Inner implementation — mirrors web _doEnsureConversationKey exactly.
 */
async function _doEnsureConversationKey(threadId, myUserId, otherUserId) {
  // ✅ FIXED: was calling initUserKeys() + uploadMyPublicKey() here.
  // Web only calls getUserKeys() — the upload is handled by AppContext on login.
  console.log(`[E2EE_TRACE] _doEnsureConversationKey started for thread: ${threadId}`);
  const myKeys = await getUserKeys(myUserId);

  if (!myKeys) {
    console.log(`[E2EE_TRACE] _doEnsureConversationKey failed: NO_LOCAL_KEYS for user ${myUserId}`);
    throw new Error(
      "NO_LOCAL_KEYS: Please log out and log in again to restore your encryption keys.",
    );
  }
  console.log(`[E2EE_TRACE] Local keys found for user ${myUserId}. Checking backend for thread key...`);

  let serverKeyRow = null;
  try {
    serverKeyRow = await getMyEncryptedConversationKey(threadId);
  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err.message || "";

    const isNotFound =
      status === 404 ||
      status === 400 ||
      msg.toLowerCase().includes("not found") ||
      msg.toLowerCase().includes("keys not set") ||
      msg.toLowerCase().includes("not authorized");

    if (isNotFound) {
      serverKeyRow = null;
    } else {
      throw err;
    }
  }

  if (serverKeyRow) {
    console.log(`[E2EE_TRACE] Found thread key on server for thread ${threadId}. Decrypting...`);
    try {
      const conversationKeyBytes = decryptConversationKey(
        serverKeyRow.encryptedKey,
        serverKeyRow.keyNonce,
        serverKeyRow.senderPublicKey,
        myKeys.privateKey,
      );
      console.log(`[E2EE_TRACE] Successfully decrypted server key for thread ${threadId}`);
      return conversationKeyBytes;
    } catch {
      console.warn(
        "[E2EE] Conversation key decrypt failed — keys were rotated." +
          " Regenerating conversation key for thread:",
        threadId,
      );
    }
  }

  // Step 2: no conversation key exists yet — generate and save for both users
  console.log(`[E2EE_TRACE] No valid server key for thread ${threadId}. Processing new key exchange...`);
  const conversationKeyBytes = generateConversationKey();
  const otherPublicKey = await fetchUserPublicKey(otherUserId);

  const forMe = encryptConversationKey(
    conversationKeyBytes,
    myKeys.publicKey,
    myKeys.privateKey,
  );
  const forOther = encryptConversationKey(
    conversationKeyBytes,
    otherPublicKey,
    myKeys.privateKey,
  );

  await saveConversationKeysForThread(threadId, {
    keys: [
      {
        userId: myUserId,
        encryptedKey: forMe.encryptedKey,
        keyNonce: forMe.nonce,
        senderPublicKey: myKeys.publicKey,
      },
      {
        userId: otherUserId,
        encryptedKey: forOther.encryptedKey,
        keyNonce: forOther.nonce,
        senderPublicKey: myKeys.publicKey,
      },
    ],
  });

  console.log(`[E2EE_TRACE] Key exchange completed and saved to server for thread ${threadId}`);
  return conversationKeyBytes;
}

/**
 * MAIN EXPORT — mirrors web version exactly.
 * Deduplicates concurrent calls for the same threadId+myUserId pair.
 */
export async function ensureConversationKey(threadId, myUserId, otherUserId) {
  if (!threadId || !myUserId || !otherUserId) {
    throw new Error(
      "ensureConversationKey: missing threadId, myUserId, or otherUserId",
    );
  }

  const key = `${threadId}:${myUserId}`;

  if (_pendingKeys[key]) return _pendingKeys[key];

  _pendingKeys[key] = _doEnsureConversationKey(
    threadId,
    myUserId,
    otherUserId,
  ).finally(() => {
    delete _pendingKeys[key];
  });

  return _pendingKeys[key];
}
