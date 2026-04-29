// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
import api from "../api/axios";

// ── Normalize — mirrors web exactly ──────────────────────────────────────
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
  duration:
    t.duration ||
    (() => {
      const s = new Date(t.start_date || t.startDate);
      const e = new Date(t.end_date || t.endDate);
      return isNaN(s) || isNaN(e)
        ? 0
        : Math.max(1, Math.ceil((e - s) / 86400000));
    })(),
  participants: t.participants || 1,
  image:
    t.image ||
    `https://source.unsplash.com/800x600/?travel,${encodeURIComponent(t.destination || "travel")}`,
  imageAlt: t.imageAlt || `${t.destination || "Trip"} travel photo`,
  createdAt: t.created_at || t.createdAt,
});

// ── API — mirrors web exactly ─────────────────────────────────────────────
export const getTrips = async (page = 1) => {
  const res = await api.get(`api/trips?page=${page}`);
  if (Array.isArray(res.data)) {
    return { ...res, data: res.data.map(normalizeTrip) };
  }
  if (Array.isArray(res.data?.data)) {
    return { ...res, data: res.data.data.map(normalizeTrip) };
  }
  return res;
};

export const createTrip = (data) => api.post("api/trips", data);

export const updateTrip = (id, data) => api.patch(`api/trips/${id}`, data);

export const deleteTrip = (id) => api.delete(`api/trips/${id}`);
