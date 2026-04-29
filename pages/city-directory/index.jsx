import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Icon from "../../components/AppIcon";
import { Fonts } from "../../constants/theme";
import { useDarkMode } from "../../context/DarkModeContext";
import { getAllCities } from "../../services/cityDetails.api";
import { transformCity } from "../../utils/cityTransform";
import CityCard from "./components/CityCard";
import EmptyState from "./components/EmptyState";
import FeaturedSection from "./components/FeaturedSection";
import FilterPanel from "./components/FilterPanel";
import SearchBar from "./components/SearchBar";

const CitiesDirectory = () => {
  const { isDarkMode } = useDarkMode();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    region: "all",
    travelStyle: "all",
    climate: "all",
    activity: "all",
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch cities — matches web useEffect exactly ───────────
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await getAllCities();
        const transformed = data.map(transformCity);
        setCities(transformed);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch cities:", err);
        setError("Could not load cities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  // ── Filter effect — matches web useEffect exactly ──────────
  useEffect(() => {
    let results = cities;

    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (city) =>
          city.name.toLowerCase().includes(query) ||
          city.country.toLowerCase().includes(query) ||
          city.description.toLowerCase().includes(query) ||
          city.popularActivities.some((activity) =>
            activity.toLowerCase().includes(query),
          ),
      );
    }

    if (filters.region !== "all") {
      results = results.filter((city) => city.region === filters.region);
    }
    if (filters.travelStyle !== "all") {
      results = results.filter(
        (city) => city.travelStyle === filters.travelStyle,
      );
    }
    if (filters.climate !== "all") {
      results = results.filter((city) => city.climate === filters.climate);
    }
    if (filters.activity !== "all") {
      results = results.filter((city) =>
        city.popularActivities.some((activity) =>
          activity.toLowerCase().includes(filters.activity.toLowerCase()),
        ),
      );
    }

    setFilteredCities(results);
  }, [cities, searchQuery, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({
      region: "all",
      travelStyle: "all",
      climate: "all",
      activity: "all",
    });
  };

  const featuredCities = cities.filter((city) => city.isFeatured);
  const trendingCities = filteredCities.filter((city) => city.isTrending);
  const regularCities = filteredCities.filter((city) => !city.isTrending);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: "#ef4444", textAlign: "center" }}>{error}</Text>
      </View>
    );
  }

  return (
    // matches web: bg-[var(--color-bg-primary)]
    <View
      style={{ flex: 1, backgroundColor: isDarkMode ? "#111827" : "#f9fafb" }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          {/* ── Header — matches web: mb-6 sm:mb-8 md:mb-12 ── */}
          <View style={{ marginBottom: 32 }}>
            {/* matches web: text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold */}
            <Text
              style={{
                fontSize: 28,
                fontFamily: Fonts.playfair.bold,
                color: isDarkMode ? "#f9fafb" : "#111827",
                marginBottom: 8,
              }}
            >
              Discover Amazing Destinations
            </Text>
            {/* matches web: text-sm sm:text-base md:text-lg text-[var(--color-text-secondary)] max-w-3xl */}
            <Text
              style={{
                fontSize: 14,
                color: isDarkMode ? "#9ca3af" : "#6b7280",
                lineHeight: 20,
              }}
            >
              Explore incredible cities across India, connect with travelers,
              find travel packages, and plan your perfect adventure.
            </Text>
          </View>

          {/* ── Search Bar — SearchBar has its own mb-6 (marginBottom: 24) ── */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultCount={filteredCities.length}
          />

          {/* ── Featured Cities — matches web: !searchQuery && featuredCities.length > 0 ── */}
          {!searchQuery && featuredCities.length > 0 && (
            <FeaturedSection featuredCities={featuredCities} />
          )}

          {/* ── Filter Panel + Cities — matches web: grid grid-cols-1 lg:grid-cols-4 ── */}
          <View style={{ gap: 16 }}>
            {/* Filter Panel — matches web: lg:col-span-1 */}
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              isOpen={isFilterPanelOpen}
              onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            />

            {/* Cities — matches web: lg:col-span-3 */}
            {filteredCities.length > 0 ? (
              <View style={{ gap: 24 }}>
                {/* Trending Destinations — matches web: mb-6 sm:mb-8 block */}
                {trendingCities.length > 0 && (
                  <View style={{ marginBottom: 8 }}>
                    {/* matches web: <h2> text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 mb-3 sm:mb-4 */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      <Icon name="TrendingUp" size={20} color="#3b82f6" />
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: isDarkMode ? "#f9fafb" : "#111827",
                        }}
                      >
                        Trending Destinations
                      </Text>
                    </View>
                    {/* matches web: grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 */}
                    <View style={{ gap: 12 }}>
                      {trendingCities.map((city) => (
                        <CityCard key={city.id} city={city} />
                      ))}
                    </View>
                  </View>
                )}

                {/* All Destinations — matches web: regularCities.length > 0 block */}
                {regularCities.length > 0 && (
                  <View>
                    {/* matches web: <h2> text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 mb-3 sm:mb-4 */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      <Icon name="MapPin" size={20} color="#3b82f6" />
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: isDarkMode ? "#f9fafb" : "#111827",
                        }}
                      >
                        All Destinations
                      </Text>
                    </View>
                    {/* matches web: grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 */}
                    <View style={{ gap: 12 }}>
                      {regularCities.map((city) => (
                        <CityCard key={city.id} city={city} />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              // matches web: <EmptyState onClearFilters={handleClearFilters} />
              <EmptyState onClearFilters={handleClearFilters} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CitiesDirectory;
