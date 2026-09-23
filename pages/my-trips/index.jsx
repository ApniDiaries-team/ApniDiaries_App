import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useDarkMode } from "../../context/DarkModeContext";
import { Fonts, Palette } from "../../constants/theme";
import Icon from "../../components/AppIcon";
import Toast from "react-native-toast-message";
import { createTrip, deleteTrip, getJoinedTrips, getPublicTrips, getTrips, updateTrip } from "../../services/trips.api";
import CreateTripModal from "./components/CreateTripModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EmptyState from "./components/EmptyState";
import FilterControls from "./components/FilterControls";
import TripCard from "./components/TripCard";
import TripListItem from "./components/TripListItem";
import TripStats from "./components/TripStats";

const TABS = [
  { id: "mine", label: "My Trips", icon: "Luggage" },
  { id: "joined", label: "Joined", icon: "Users" },
  { id: "public", label: "Discover", icon: "Globe2" },
];

const MyTrips = () => {
  const { isDarkMode } = useDarkMode();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [activeTab, setActiveTab] = useState("mine");
  const [trips, setTrips] = useState([]);
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [publicTrips, setPublicTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [action, setAction] = useState("Create");

  const sourceList = activeTab === "mine" ? trips : activeTab === "joined" ? joinedTrips : publicTrips;
  const colors = {
    surface: isDarkMode ? Palette.dark.surface : Palette.light.surface,
    surfaceCard: isDarkMode ? Palette.dark.surfaceLowest : Palette.light.surfaceLowest,
    surfaceLow: isDarkMode ? Palette.dark.surfaceLow : Palette.light.surfaceLow,
    text: isDarkMode ? Palette.dark.text : Palette.light.text,
    muted: isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant,
    border: isDarkMode ? Palette.dark.outlineVariant : Palette.light.outlineVariant,
    primary: isDarkMode ? Palette.dark.primary : Palette.light.primary,
  };

  const filteredTrips = useMemo(() => {
    let result = [...(Array.isArray(sourceList) ? sourceList : [])];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((trip) => trip?.title?.toLowerCase().includes(q) || trip?.destination?.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter((trip) => trip?.status === statusFilter);
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc": return new Date(b.startDate) - new Date(a.startDate);
        case "date-asc": return new Date(a.startDate) - new Date(b.startDate);
        case "title-asc": return a?.title?.localeCompare(b?.title);
        case "title-desc": return b?.title?.localeCompare(a?.title);
        case "duration-desc": return (b?.duration || 0) - (a?.duration || 0);
        case "duration-asc": return (a?.duration || 0) - (b?.duration || 0);
        default: return 0;
      }
    });
    return result;
  }, [sourceList, searchQuery, statusFilter, sortBy]);

  const loadTrips = async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      const [mine, joined, publicResult] = await Promise.all([getTrips(), getJoinedTrips(), getPublicTrips()]);
      setTrips(Array.isArray(mine?.data) ? mine.data : []);
      setJoinedTrips(Array.isArray(joined?.data) ? joined.data : []);
      setPublicTrips(Array.isArray(publicResult?.data) ? publicResult.data : []);
    } catch (error) {
      console.log("Error loading trips", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { loadTrips(); }, []);

  const openCreate = () => { setAction("Create"); setSelectedTrip(null); setIsCreateModalOpen(true); };
  const handleEditTrip = (trip) => { setAction("Update"); setSelectedTrip(trip); setIsCreateModalOpen(true); };
  const handleDeleteTrip = (trip) => { setSelectedTrip(trip); setIsDeleteModalOpen(true); };
  const handleViewTrip = (trip) => { setAction("View"); setSelectedTrip(trip); setIsCreateModalOpen(true); };

  const handleCreateTrip = async (formData, nextAction) => {
    const start = new Date(formData?.startDate);
    const end = new Date(formData?.endDate);
    const duration = Math.max(1, Math.ceil((end - start) / 86400000));
    const payload = {
      title: formData?.title,
      destination: formData?.destination,
      start_date: formData?.startDate,
      end_date: formData?.endDate,
      duration,
      trip_type: formData?.tripType,
      budget: formData?.budget === "" ? undefined : Number(formData.budget),
      trip_status: "planned",
      participants: 1,
      description: formData?.description || "",
      visibility: formData?.visibility || "only_me",
    };
    try {
      const response = nextAction === "Update"
        ? await updateTrip(selectedTrip.id, payload)
        : await createTrip(payload);
      if (response?.data?.success) Toast.show({ type: "success", text1: nextAction === "Update" ? "Trip updated!" : "Trip created!" });
    } catch (error) {
      console.log("Error saving trip", error);
    }
    setSelectedTrip(null);
    await loadTrips(true);
    setIsCreateModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedTrip?.id) return;
    try {
      await deleteTrip(selectedTrip.id);
      Toast.show({ type: "success", text1: "Trip deleted" });
      await loadTrips(true);
    } catch (error) { console.log("Error deleting trip", error); }
    setIsDeleteModalOpen(false);
    setSelectedTrip(null);
  };

  const hasActiveFilters = !!searchQuery.trim() || statusFilter !== "all";

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32, paddingTop: 40 }}>
        <View style={{ width: "100%", maxWidth: 1280, alignSelf: "center", paddingHorizontal: isDesktop ? 64 : 20 }}>
          <View style={{ flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "flex-start", justifyContent: "space-between", gap: 16, paddingBottom: 32, marginBottom: 32, borderBottomWidth: 1, borderBottomColor: isDarkMode ? "rgba(255,255,255,0.1)" : colors.border }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: width >= 768 ? 48 : 36, lineHeight: width >= 768 ? 56 : 43, color: colors.text }}>My Trips</Text>
              <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 8 }}>Plan, organize, and explore travel adventures</Text>
            </View>
            {isDesktop && <Pressable onPress={openCreate} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.primary }}><Icon name="Plus" size={18} color="#FFFFFF" /><Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 14, color: "#FFFFFF" }}>Create New Trip</Text></Pressable>}
          </View>

          <View style={{ flexDirection: isDesktop ? "row" : "column", alignItems: "flex-start", gap: 32 }}>
            <View style={{ width: isDesktop ? 280 : "100%", gap: 24, flexShrink: 0 }}>
              <View style={{ padding: 6, borderRadius: 16, backgroundColor: colors.surfaceLow, gap: 4 }}>
                {TABS.map((tab) => {
                  const selected = activeTab === tab.id;
                  return <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: selected ? colors.surfaceCard : "transparent" }}><Icon name={tab.icon} size={16} color={selected ? colors.primary : colors.muted} /><Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 14, color: selected ? colors.primary : colors.muted }}>{tab.label}</Text></Pressable>;
                })}
              </View>
              {activeTab === "mine" && trips.length > 0 && <TripStats trips={trips} />}
            </View>

            <View style={{ flex: 1, width: isDesktop ? undefined : "100%", minWidth: 0 }}>
              {filteredTrips.length > 0 && <FilterControls searchQuery={searchQuery} onSearchChange={setSearchQuery} statusFilter={statusFilter} onStatusChange={setStatusFilter} sortBy={sortBy} onSortChange={setSortBy} viewMode={viewMode} onViewModeChange={setViewMode} />}

              {isLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 64 }}><ActivityIndicator size="large" color={colors.primary} /></View>
              ) : filteredTrips.length === 0 ? (
                <EmptyState onCreateTrip={activeTab === "mine" ? openCreate : null} onClearFilters={() => { setSearchQuery(""); setStatusFilter("all"); }} hasFilters={hasActiveFilters} message={activeTab === "joined" ? "You haven't joined any trips yet. Discover public trips!" : activeTab === "public" ? "No public trips available right now." : undefined} />
              ) : viewMode === "grid" ? (
                <View style={{ flexDirection: isDesktop ? "row" : "column", flexWrap: isDesktop ? "wrap" : "nowrap", gap: 24 }}>
                  {filteredTrips.map((trip) => <View key={trip.id} style={{ width: isDesktop ? "48%" : "100%" }}><TripCard trip={trip} onEdit={activeTab === "mine" ? handleEditTrip : null} onDelete={activeTab === "mine" ? handleDeleteTrip : null} onView={handleViewTrip} /></View>)}
                  {activeTab === "mine" && <Pressable onPress={openCreate} style={{ width: isDesktop ? "48%" : "100%", minHeight: 280, alignItems: "center", justifyContent: "center", gap: 16, padding: 32, borderRadius: 20, borderWidth: 2, borderStyle: "dashed", borderColor: isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(162,63,0,0.25)", backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : colors.surfaceLow }}><View style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceCard }}><Icon name="Plus" size={22} color={colors.primary} /></View><View style={{ alignItems: "center" }}><Text style={{ fontFamily: Fonts.playfair.bold, fontSize: 20, color: colors.text, textAlign: "center" }}>Plan a New Adventure</Text><Text style={{ fontFamily: Fonts.inter.regular, fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 4 }}>Start crafting your next journey today.</Text></View></Pressable>}
                </View>
              ) : (
                <View style={{ gap: 16 }}>{filteredTrips.map((trip) => <TripListItem key={trip.id} trip={trip} onEdit={activeTab === "mine" ? handleEditTrip : null} onDelete={activeTab === "mine" ? handleDeleteTrip : null} onView={handleViewTrip} />)}</View>
              )}
              <View style={{ height: 80 }} />
            </View>
          </View>
        </View>
      </ScrollView>

      {!isDesktop && <Pressable onPress={openCreate} accessibilityRole="button" accessibilityLabel="Create new trip" style={{ position: "absolute", bottom: 84, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}><Icon name="Plus" size={26} color="#FFFFFF" /></Pressable>}

      <CreateTripModal isOpen={isCreateModalOpen} action={action} tripData={selectedTrip} onClose={() => { setIsCreateModalOpen(false); setSelectedTrip(null); }} onSubmit={handleCreateTrip} />
      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setSelectedTrip(null); }} onConfirm={confirmDelete} tripTitle={selectedTrip?.title || ""} />
    </View>
  );
};

export default MyTrips;

