// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
// Mirrors web services/trips.api.js exactly so both apps share the same trip
// shape (visibility, memberCount, myRole, isMember, etc.) and endpoints.
import api from "../api/axios";

const normalizeTrip = (t) => ({
  id: t.id,
  title: t.title,
  destination: t.destination,
  startDate: t.start_date || t.startDate,
  endDate: t.end_date || t.endDate,
  status: t.trip_status || t.status || "planned",
  tripType: t.trip_type || t.tripType,
  budget: t.budget,
  description: t.description,
  visibility: t.visibility || "only_me",
  chatThreadId: t.chat_thread_id || null,
  memberCount: t.member_count || 1,
  myRole: t.my_role || null,
  isMember: t.is_member ?? false,
  isRemoved: t.is_removed ?? false,
  userId: t.user_id,
  duration:
    t.duration ||
    (() => {
      const s = new Date(t.start_date || t.startDate);
      const e = new Date(t.end_date || t.endDate);
      return isNaN(s) || isNaN(e)
        ? 0
        : Math.max(1, Math.ceil((e - s) / 86400000));
    })(),
  image:
    t.image ||
    `https://source.unsplash.com/800x600/?travel,${encodeURIComponent(t.destination || "travel")}`,
  imageAlt: t.imageAlt || `${t.destination || "Trip"} travel photo`,
  createdAt: t.created_at || t.createdAt,
});

export const getTrips = async () => {
  const res = await api.get("api/trips");
  const raw = res.data?.trips || res.data || [];
  return { ...res, data: Array.isArray(raw) ? raw.map(normalizeTrip) : [] };
};

export const getJoinedTrips = async () => {
  const res = await api.get("api/trips/joined");
  const raw = res.data?.trips || [];
  return { ...res, data: raw.map(normalizeTrip) };
};

export const getPublicTrips = async () => {
  const res = await api.get("api/trips/public");
  const raw = res.data?.trips || [];
  return { ...res, data: raw.map(normalizeTrip) };
};

export const getTripDetail = async (id) => {
  const res = await api.get(`api/trips/${id}`);
  return {
    trip: normalizeTrip(res.data.trip),
    members: res.data.members || [],
    myJoinRequest: res.data.my_join_request || null,
  };
};

export const createTrip = (data) => api.post("api/trips", data);
export const updateTrip = (id, data) => api.patch(`api/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`api/trips/${id}`);

export const joinTrip = (id) => api.post(`api/trips/${id}/join`);
export const leaveTrip = (id) => api.post(`api/trips/${id}/leave`);

export const removeTripMember = (tripId, userId) =>
  api.delete(`api/trips/${tripId}/members/${userId}`);

export const assignTripRole = (tripId, userId, role) =>
  api.patch(`api/trips/${tripId}/members/${userId}/role`, { role });

export const getJoinRequests = (tripId) =>
  api.get(`api/trips/${tripId}/join-requests`);

export const respondJoinRequest = (tripId, requestId, action) =>
  api.patch(`api/trips/${tripId}/join-requests/${requestId}`, { action });

export const getTripChatThread = (tripId) =>
  api.get(`api/trips/${tripId}/chat-thread`);
