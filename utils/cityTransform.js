/**
 * utils/cityTransform.js — React Native compatible
 *
 * Pure data transformation utility — no DOM or browser APIs used.
 * No changes needed from the web version.
 */
export const transformCity = (data) => ({
  id: data.id,
  name: data.name,
  country: data.country || "India",
  region: data.region || "north",
  travelStyle: data.travel_style || "adventure",
  climate: data.climate || "temperate",
  description: data.description,
  image: data.image,
  imageAlt: data.image_alt || "",
  activeTravelers: data.active_travelers || 0,
  recentPosts: data.recent_posts || 0,
  packages: data.packages || 0,
  weather: data.weather || "N/A",
  rating: data.rating || 0,
  // matches web: use value directly — API already returns an array, no JSON.parse needed
  popularActivities: data.popular_activities ? data.popular_activities : [],
  isFeatured: data.is_featured || false,
  isTrending: data.is_trending || false,
  activeMembers: data.active_travelers,
  activityLevel: data.activity_level || "Medium",
});
