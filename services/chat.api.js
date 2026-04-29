// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
import api from "../api/axios";

export const getInbox = () => api.get("/api/chat/threads");

export const getChatList = () => api.get("/api/chat/list");

// ── Group ─────────────────────────────────────────────────────────────────
export const createGroup = (data) => api.post("/api/chat/group", data);

export const getGroupMembers = (groupId) =>
  api.get(`/api/chat/group/${groupId}/members`);

export const addGroupMember = (groupId, data) =>
  api.post(`/api/chat/group/${groupId}/members`, data);

export const removeGroupMember = (groupId, memberId) =>
  api.delete(`/api/chat/group/${groupId}/members/${memberId}`);

// ── Messages — matches web: supports limit + before cursor for pagination ──
export const getMessages = (threadId, { limit = 30, before = null } = {}) => {
  const params = new URLSearchParams({ limit });
  if (before) params.set("before", before);
  return api.get(`/api/chat/${threadId}/messages?${params}`);
};

export const markSeen = (threadId) => api.patch(`/api/chat/${threadId}/seen`);

export const clearChatMessages = (threadId) =>
  api.post(`/api/chat/clear/${threadId}`);

// ── Direct thread ─────────────────────────────────────────────────────────
export const createOrGetDirectThread = (userId) =>
  api.post(`/api/chat/direct/${userId}`);

// ── Media upload — React Native FormData compatible ───────────────────────
export const uploadChatMedia = (threadId, file, signal) => {
  const formData = new FormData();
  formData.append("media", {
    uri: file.uri,
    type: file.type || "image/jpeg",
    name: file.name || "upload.jpg",
  });
  return api.post(`/api/chat/${threadId}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });
};
