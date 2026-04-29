// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
import api from "../api/axios";

export const getCallHistory = () => api.get("/api/calls");
export const getCallLogsByThread = (threadId) =>
  api.get(`/api/calls/thread/${threadId}`);
export const markCallsAsSeen = (threadId) =>
  api.patch(`/api/calls/thread/${threadId}/seen`);
export const deleteCallLog = (callId) => api.delete(`/api/calls/${callId}`);
export const clearCallHistory = () => api.delete("/api/calls");
export const getUserById = (userId) => api.get(`/api/users/${userId}`);

export const getUnseenMissedCallCount = () =>
  api.get("/api/calls/missed-count");
export const markAllMissedCallsSeen = () => api.patch("/api/calls/missed-seen");
