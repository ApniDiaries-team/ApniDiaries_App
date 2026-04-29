import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import * as ExpoCrypto from "expo-crypto";
import "react-native-get-random-values";
import QuickCrypto from "react-native-quick-crypto";
import nacl from "tweetnacl";
import * as util from "tweetnacl-util";

const PRIV_KEY = (userId) => `e2ee_priv_${userId}`;
const PUB_KEY = (userId) => `e2ee_pub_${userId}`;

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

async function storageSet(key, value) {
  await AsyncStorage.setItem(key, value);
}

async function storageGet(key) {
  const val = await AsyncStorage.getItem(key);
  return val ?? null;
}

async function storageDel(key) {
  await AsyncStorage.removeItem(key);
}

// ---------------------------------------------------------------------------
// Key persistence
// ---------------------------------------------------------------------------

export async function getUserKeys(userId) {
  if (!userId) return null;
  try {
    console.log(`[E2EE_TRACE] Fetching keys from storage for user: ${userId}`);
    const [priv, pub] = await Promise.all([
      storageGet(PRIV_KEY(userId)),
      storageGet(PUB_KEY(userId)),
    ]);
    if (!priv || !pub) {
      console.log(`[E2EE_TRACE] Missing public or private key in storage for user: ${userId}`);
      return null;
    }
    console.log(`[E2EE_TRACE] Successfully retrieved keys from storage for user: ${userId}`);
    return { publicKey: pub, privateKey: priv };
  } catch (err) {
    console.log(`[E2EE_TRACE] Error retrieving keys for user: ${userId} - ${err.message}`);
    return null;
  }
}

export async function saveUserKeysLocally(userId, publicKey, privateKey) {
  console.log(`[E2EE_TRACE] Saving generated/decrypted keys to local storage for user: ${userId}`);
  await Promise.all([
    storageSet(PRIV_KEY(userId), privateKey),
    storageSet(PUB_KEY(userId), publicKey),
  ]);
  console.log(`[E2EE_TRACE] Keys successfully saved to local storage for user: ${userId}`);
}

export async function clearUserKeysLocally(userId) {
  try {
    console.log(`[E2EE_TRACE] Clearing keys from local storage for user: ${userId}`);
    await Promise.all([
      storageDel(PRIV_KEY(userId)),
      storageDel(PUB_KEY(userId)),
    ]);
  } catch {}
}

// ---------------------------------------------------------------------------
// Keypair generation
// ---------------------------------------------------------------------------

export function generateNewKeyPair() {
  console.log(`[E2EE_TRACE] Generating new NaCl keypair`);
  const keypair = nacl.box.keyPair();
  return {
    publicKey: util.encodeBase64(keypair.publicKey),
    privateKey: util.encodeBase64(keypair.secretKey),
  };
}

export async function initUserKeys(userId) {
  if (!userId) throw new Error("initUserKeys: userId required");
  const existing = await getUserKeys(userId);
  if (existing) return { ...existing, isNew: false };
  const kp = generateNewKeyPair();
  await saveUserKeysLocally(userId, kp.publicKey, kp.privateKey);
  return { publicKey: kp.publicKey, privateKey: kp.privateKey, isNew: true };
}

// ---------------------------------------------------------------------------
// Key derivation — MUST match web exactly.
//
// Web uses: crypto.subtle PBKDF2, SHA-256, 100,000 iterations
// Native uses: ExpoCrypto.pbkdf2Async — same algorithm, runs in native C++
// so it completes in ~200ms just like the browser, not 30+ seconds like
// a pure JS loop. This is the fix for encrypted messages — the previous
// single SHA-256 hash produced a completely different key than the web's
// PBKDF2, so decryptPrivateKey always failed and keysReady stayed false.
// ---------------------------------------------------------------------------

async function deriveKeyFromPassword(password, saltBytes) {
  console.log(`[E2EE_TRACE] Deriving key from password using PBKDF2...`);
  return new Promise((resolve, reject) => {
    // Matches web exactly: PBKDF2 + SHA-256 + 100,000 iterations + 32 bytes
    QuickCrypto.pbkdf2(
      password,
      Buffer.from(saltBytes),
      100000,
      32,
      "sha256",
      (err, derivedKey) => {
        if (err) {
          console.log(`[E2EE_TRACE] Key derivation failed: ${err.message}`);
          reject(err);
        } else {
          console.log(`[E2EE_TRACE] Key derivation successful.`);
          resolve(new Uint8Array(derivedKey));
        }
      }
    );
  });
}

// ---------------------------------------------------------------------------
// Password-based private key encryption
// ---------------------------------------------------------------------------

export async function encryptPrivateKey(privateKeyB64, password) {
  console.log(`[E2EE_TRACE] Encrypting private key with user password...`);
  const saltBytes = await ExpoCrypto.getRandomBytesAsync(16);
  const derived = await deriveKeyFromPassword(password, saltBytes);
  const privBytes = util.decodeBase64(privateKeyB64);
  const nonce = nacl.randomBytes(24);
  const encrypted = nacl.secretbox(privBytes, nonce, derived);
  console.log(`[E2EE_TRACE] Private key encrypted successfully.`);
  return {
    encryptedPrivateKey: util.encodeBase64(encrypted),
    nonce: util.encodeBase64(nonce),
    salt: util.encodeBase64(new Uint8Array(saltBytes)),
  };
}

export async function decryptPrivateKey(
  encryptedPrivateKeyB64,
  nonceB64,
  saltB64,
  password
) {
  console.log(`[E2EE_TRACE] Decrypting private key with user password...`);
  const saltBytes = util.decodeBase64(saltB64);
  const derived = await deriveKeyFromPassword(password, saltBytes);
  const encrypted = util.decodeBase64(encryptedPrivateKeyB64);
  const nonce = util.decodeBase64(nonceB64);
  const decrypted = nacl.secretbox.open(encrypted, nonce, derived);
  if (!decrypted) {
    console.log(`[E2EE_TRACE] Failed to decrypt private key: Wrong password or corrupted key`);
    throw new Error("Wrong password or corrupted key");
  }
  console.log(`[E2EE_TRACE] Private key decrypted successfully.`);
  return util.encodeBase64(decrypted);
}

// ---------------------------------------------------------------------------
// Symmetric conversation key
// ---------------------------------------------------------------------------

export function generateConversationKey() {
  console.log(`[E2EE_TRACE] Generating new conversation key...`);
  return nacl.randomBytes(32);
}

// ---------------------------------------------------------------------------
// Asymmetric encryption of the conversation key (NaCl box)
// ---------------------------------------------------------------------------

export function encryptConversationKey(
  conversationKeyBytes,
  receiverPublicKeyB64,
  senderPrivateKeyB64
) {
  const receiverPub = util.decodeBase64(receiverPublicKeyB64);
  const senderPriv = util.decodeBase64(senderPrivateKeyB64);
  const nonce = nacl.randomBytes(24);
  const encrypted = nacl.box(
    conversationKeyBytes,
    nonce,
    receiverPub,
    senderPriv
  );
  return {
    encryptedKey: util.encodeBase64(encrypted),
    nonce: util.encodeBase64(nonce),
  };
}

export function decryptConversationKey(
  encryptedKeyB64,
  nonceB64,
  senderPublicKeyB64,
  receiverPrivateKeyB64
) {
  console.log(`[E2EE_TRACE] Decrypting conversation key...`);
  const encrypted = util.decodeBase64(encryptedKeyB64);
  const nonce = util.decodeBase64(nonceB64);
  const senderPub = util.decodeBase64(senderPublicKeyB64);
  const receiverPriv = util.decodeBase64(receiverPrivateKeyB64);
  const decrypted = nacl.box.open(encrypted, nonce, senderPub, receiverPriv);
  if (!decrypted) {
    console.log(`[E2EE_TRACE] Failed to decrypt conversation key!`);
    throw new Error("Failed to decrypt conversation key");
  }
  console.log(`[E2EE_TRACE] Conversation key decrypted successfully!`);
  return decrypted;
}

// ---------------------------------------------------------------------------
// Symmetric message encryption (NaCl secretbox)
// ---------------------------------------------------------------------------

export function encryptMessage(plainText, conversationKeyBytes) {
  const nonce = nacl.randomBytes(24);
  const msgBytes = util.decodeUTF8(plainText);
  const encrypted = nacl.secretbox(msgBytes, nonce, conversationKeyBytes);
  return {
    ciphertext: util.encodeBase64(encrypted),
    nonce: util.encodeBase64(nonce),
  };
}

export function decryptMessage(ciphertextB64, nonceB64, conversationKeyBytes) {
  const ciphertext = util.decodeBase64(ciphertextB64);
  const nonce = util.decodeBase64(nonceB64);
  const decrypted = nacl.secretbox.open(ciphertext, nonce, conversationKeyBytes);
  if (!decrypted) return null;
  return util.encodeUTF8(decrypted);
}