// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
import api from "../api/axios";

const normalizeTrip = (t = {}) => ({
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
  chatThreadId: t.chat_thread_id || t.chatThreadId || null,
  memberCount: t.member_count || t.memberCount || t.participants || 1,
  myRole: t.my_role || t.myRole || null,
  isMember: t.is_member ?? t.isMember ?? false,
  isRemoved: t.is_removed ?? t.isRemoved ?? false,
  userId: t.user_id || t.userId,
  duration: t.duration || (() => {
    const s = new Date(t.start_date || t.startDate);
    const e = new Date(t.end_date || t.endDate);
    return isNaN(s) || isNaN(e) ? 0 : Math.max(1, Math.ceil((e - s) / 86400000));
  })(),
  image: t.image || `https://source.unsplash.com/800x600/?travel,${encodeURIComponent(t.destination || "travel")}`,
  imageAlt: t.imageAlt || `${t.destination || "Trip"} travel photo`,
  createdAt: t.created_at || t.createdAt,
});

const normalizeList = (response, keys = ["trips", "data"]) => {
  const raw = keys.map((key) => response?.data?.[key]).find(Array.isArray)
    || (Array.isArray(response?.data) ? response.data : []);
  return { ...response, data: raw.map(normalizeTrip) };
};

export const getTrips = async (page = 1) => normalizeList(await api.get(`api/trips?page=${page}`));
export const getJoinedTrips = async () => normalizeList(await api.get("api/trips/joined"));
export const getPublicTrips = async () => normalizeList(await api.get("api/trips/public"));
export const createTrip = (data) => api.post("api/trips", data);
export const updateTrip = (id, data) => api.patch(`api/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`api/trips/${id}`);
