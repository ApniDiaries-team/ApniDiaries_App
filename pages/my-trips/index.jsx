import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "../../components/AppIcon";
import { Fonts, Shadow } from "../../constants/theme";
import { useDarkMode } from "../../context/DarkModeContext";
import {
  createTrip,
  deleteTrip,
  getJoinedTrips,
  getPublicTrips,
  getTrips,
  updateTrip,
} from "../../services/trips.api";
import CreateTripModal from "./components/CreateTripModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EmptyState from "./components/EmptyState";
import FilterControls from "./components/FilterControls";
import TripCard from "./components/TripCard";
import TripListItem from "./components/TripListItem";
import TripStats from "./components/TripStats";

// Mirrors web pages/my-trips/index.jsx (mobile-width rendering: sidebar tabs
// collapse to a horizontal pill row above the content, desktop "Create New
// Trip" button hidden in favor of the floating action button).
const TABS = [
  { id: "mine", label: "My Trips", icon: "Luggage" },
  { id: "joined", label: "Joined", icon: "Users" },
  { id: "public", label: "Discover", icon: "Globe2" },
];

const MyTrips = () => {
  const { theme } = useDarkMode();

  const [activeTab, setActiveTab] = useState("mine");
  const [trips, setTrips] = useState([]);
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [publicTrips, setPublicTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [viewMode, setViewMode] = useState("grid");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [action, setAction] = useState("Create");
  const [isLoading, setIsLoading] = useState(true);

  const sourceList = activeTab === "mine" ? trips : activeTab === "joined" ? joinedTrips : publicTrips;

  useEffect(() => {
    const safe = Array.isArray(sourceList) ? sourceList : [];
    let result = [...safe];

    if (searchQuery?.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t?.title?.toLowerCase().includes(q) || t?.destination?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") result = result.filter((t) => t?.status === statusFilter);

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
    setFilteredTrips(result);
  }, [sourceList, searchQuery, statusFilter, sortBy]);

  const loadMyTrips = async () => {
    try {
      setIsLoading(true);
      const res = await getTrips();
      if (res?.data) setTrips(res.data);
    } catch (e) { console.log(e); } finally { setIsLoading(false); }
  };
  const loadJoinedTrips = async () => {
    try { const res = await getJoinedTrips(); if (res?.data) setJoinedTrips(res.data); } catch (e) { console.log(e); }
  };
  const loadPublicTrips = async () => {
    try { const res = await getPublicTrips(); if (res?.data) setPublicTrips(res.data); } catch (e) { console.log(e); }
  };

  useEffect(() => {
    loadMyTrips();
    loadJoinedTrips();
    loadPublicTrips();
  }, []);

  const openCreate = () => { setAction("Create"); setSelectedTrip(null); setIsCreateModalOpen(true); };
  const handleEditTrip = (trip) => { setAction("Update"); setSelectedTrip(trip); setIsCreateModalOpen(true); };
  const handleDeleteTrip = (trip) => { setSelectedTrip(trip); setIsDeleteModalOpen(true); };
  const handleViewTrip = (trip) => { setAction("View"); setSelectedTrip(trip); setIsCreateModalOpen(true); };

  const handleCreateTrip = async (formData, act) => {
    const startDate = new Date(formData?.startDate);
    const endDate = new Date(formData?.endDate);
    const duration = Math.max(1, Math.ceil((endDate - startDate) / 86400000));

    const payload = {
      title: formData?.title,
      destination: formData?.destination,
      start_date: formData?.startDate,
      end_date: formData?.endDate,
      duration,
      trip_type: formData?.tripType,
      budget: formData.budget === "" ? undefined : Number(formData.budget),
      trip_status: "planned",
      description: formData?.description || "",
      visibility: formData?.visibility || "only_me",
    };

    try {
      if (act === "Update") {
        const res = await updateTrip(selectedTrip.id, payload);
        if (res?.data?.success) Toast.show({ type: "success", text1: "Trip updated!" });
      } else {
        const res = await createTrip(payload);
        if (res?.data?.success) Toast.show({ type: "success", text1: "Trip created!" });
      }
    } catch (e) { console.log(e); }

    setSelectedTrip(null);
    await loadMyTrips();
    setIsCreateModalOpen(false);
  };

  const confirmDelete = async () => {
    await deleteTrip(selectedTrip.id);
    Toast.show({ type: "success", text1: "Trip deleted" });
    await loadMyTrips();
    setIsDeleteModalOpen(false);
    setSelectedTrip(null);
  };

  const hasActiveFilters = searchQuery?.trim() || statusFilter !== "all";
  const emptyMessage =
    activeTab === "joined" ? "You haven't joined any trips yet. Discover public trips!" :
    activeTab === "public" ? "No public trips available right now." : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop: 60 }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
          {/* Header */}
          <View
            style={{
              paddingBottom: 24,
              marginBottom: 24,
              borderBottomWidth: 1,
              borderBottomColor: theme.outlineVariant,
            }}
          >
            <Text style={{ fontFamily: Fonts.display.bold, fontSize: 32, color: theme.onSurface, marginBottom: 6 }}>
              My Trips
            </Text>
            <Text style={{ fontSize: 14, color: theme.onSurfaceVariant }}>
              Plan, organize, and explore travel adventures
            </Text>
          </View>

          {/* Tabs */}
          <View
            style={{
              flexDirection: "row",
              gap: 4,
              padding: 6,
              borderRadius: 16,
              marginBottom: 20,
              backgroundColor: theme.surfaceContainerLow,
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: isActive ? theme.surfaceContainerLowest : "transparent",
                    ...(isActive ? Shadow.soft : null),
                  }}
                >
                  <Icon name={tab.icon} size={15} color={isActive ? theme.primary : theme.onSurfaceVariant} />
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: Fonts.body.semibold,
                      color: isActive ? theme.primary : theme.onSurfaceVariant,
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {activeTab === "mine" && (
            <View style={{ marginBottom: 8 }}>
              <TripStats trips={trips} />
            </View>
          )}

          {filteredTrips?.length > 0 && (
            <FilterControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          )}

          {isLoading ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 64 }}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : filteredTrips?.length === 0 ? (
            <EmptyState
              onCreateTrip={activeTab === "mine" ? openCreate : null}
              hasFilters={hasActiveFilters}
              message={emptyMessage}
            />
          ) : viewMode === "grid" ? (
            <View style={{ gap: 16 }}>
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip?.id}
                  trip={trip}
                  onEdit={activeTab === "mine" ? handleEditTrip : null}
                  onDelete={activeTab === "mine" ? handleDeleteTrip : null}
                  onView={handleViewTrip}
                />
              ))}
              {activeTab === "mine" && (
                <Pressable
                  onPress={openCreate}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: theme.primaryFixedDim,
                    backgroundColor: theme.surfaceContainerLow,
                    paddingVertical: 40,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.surfaceContainerLowest,
                      ...Shadow.soft,
                    }}
                  >
                    <Icon name="Plus" size={22} color={theme.primary} />
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: Fonts.display.bold, fontSize: 18, color: theme.onSurface }}>
                      Plan a New Adventure
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.onSurfaceVariant, marginTop: 4 }}>
                      Start crafting your next journey today.
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {filteredTrips.map((trip) => (
                <TripListItem
                  key={trip?.id}
                  trip={trip}
                  onEdit={activeTab === "mine" ? handleEditTrip : null}
                  onDelete={activeTab === "mine" ? handleDeleteTrip : null}
                  onView={handleViewTrip}
                />
              ))}
            </View>
          )}

          <View style={{ height: 96 }} />
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={openCreate}
        style={{
          position: "absolute",
          bottom: 80,
          right: 20,
          zIndex: 40,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.primary,
          alignItems: "center",
          justifyContent: "center",
          ...Shadow.raised,
        }}
      >
        <Icon name="Plus" size={26} color="#FFFFFF" />
      </Pressable>

      <CreateTripModal
        isOpen={isCreateModalOpen}
        action={action}
        tripData={selectedTrip}
        onClose={() => { setIsCreateModalOpen(false); setSelectedTrip(null); }}
        onSubmit={handleCreateTrip}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedTrip(null); }}
        onConfirm={confirmDelete}
        tripTitle={selectedTrip?.title || ""}
      />
    </View>
  );
};

export default MyTrips;
