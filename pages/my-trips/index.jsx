import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Icon from "../../components/AppIcon";
import { useDarkMode } from "../../context/DarkModeContext";
import {
  createTrip,
  deleteTrip,
  getTrips,
  updateTrip,
} from "../../services/trips.api";
import CreateTripModal from "./components/CreateTripModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EmptyState from "./components/EmptyState";
import FilterControls from "./components/FilterControls";
import TripCard from "./components/TripCard";
import TripListItem from "./components/TripListItem";
import Toast from "react-native-toast-message";
import TripStats from "./components/TripStats";

const MyTrips = () => {
  const { isDarkMode } = useDarkMode();

  const [trips, setTrips] = useState([]);
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

  // ── Filter + sort effect ───────────────────────────────────
  useEffect(() => {
    const safeTrips = Array.isArray(trips) ? trips : [];
    let result = [...safeTrips];

    if (searchQuery?.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t?.title?.toLowerCase().includes(q) ||
          t?.destination?.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((t) => t?.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.startDate) - new Date(a.startDate);
        case "date-asc":
          return new Date(a.startDate) - new Date(b.startDate);
        case "title-asc":
          return a?.title?.localeCompare(b?.title);
        case "title-desc":
          return b?.title?.localeCompare(a?.title);
        case "duration-desc":
          return (b?.duration || 0) - (a?.duration || 0);
        case "duration-asc":
          return (a?.duration || 0) - (b?.duration || 0);
        default:
          return 0;
      }
    });

    setFilteredTrips(result);
  }, [trips, searchQuery, statusFilter, sortBy]);

  // ── Fetch trips ────────────────────────────────────────────
  const getAllTrips = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await getTrips(page);
      if (res?.data) setTrips(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllTrips();
  }, []);

  // ── Handlers ───────────────────────────────────────────────
  const openCreate = () => {
    setAction("Create");
    setSelectedTrip(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateTrip = async (formData, action) => {
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
      participants: 1,
      description: formData?.description || "",
    };

    if (action === "Update") {
      try {
        const res = await updateTrip(selectedTrip.id, payload);
        if (res?.data?.success) {
          Toast.show({
            type: "success",
            text1: "Trip Updated Successfully",
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const res = await createTrip(payload);
        if (res?.data?.success) {
          Toast.show({
            type: "success",
            text1: "Trip created Successfully",
          });
        }
      } catch (error) {
        console.log(error);
      }
    }

    setSelectedTrip(null);
    await getAllTrips();
    setIsCreateModalOpen(false);
  };

  const handleEditTrip = (trip) => {
    setAction("Update");
    setSelectedTrip(trip);
    setIsCreateModalOpen(true);
  };
  const handleDeleteTrip = (trip) => {
    setSelectedTrip(trip);
    setIsDeleteModalOpen(true);
  };
  const handleViewTrip = (trip) => {
    setAction("View");
    setSelectedTrip(trip);
    setIsCreateModalOpen(true);
  };

  const confirmDelete = async () => {
    await deleteTrip(selectedTrip.id);
    await getAllTrips();
    setIsDeleteModalOpen(false);
    setSelectedTrip(null);
  };

  const hasActiveFilters = searchQuery?.trim() || statusFilter !== "all";

  return (
    <View
      style={{ flex: 1, backgroundColor: isDarkMode ? "#111827" : "#ffff" }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 60 }}
      >
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          {/* ── Header ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              gap: 16,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: isDarkMode ? "#f9fafb" : "#111827",
                  marginBottom: 4,
                }}
              >
                My Trips
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                Plan, organize, and manage all your travel adventures
              </Text>
            </View>

            {/* <Pressable
              onPress={openCreate}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: "#E87722",
              }}
            >
              <Icon name="Plus" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                New Trip
              </Text>
            </Pressable> */}
          </View>

          <View style={{ gap: 20 }}>
            {trips?.length > 0 && <TripStats trips={trips} />}

            {trips?.length > 0 && (
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
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 64,
                }}
              >
                <ActivityIndicator size="large" color="#E87722" />
              </View>
            ) : filteredTrips?.length === 0 ? (
              <EmptyState
                onCreateTrip={openCreate}
                hasFilters={hasActiveFilters}
              />
            ) : viewMode === "grid" ? (
              <View style={{ gap: 12 }}>
                {filteredTrips.map((trip) => (
                  <TripCard
                    key={trip?.id}
                    trip={trip}
                    onEdit={handleEditTrip}
                    onDelete={handleDeleteTrip}
                    onView={handleViewTrip}
                  />
                ))}
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                {filteredTrips.map((trip) => (
                  <TripListItem
                    key={trip?.id}
                    trip={trip}
                    onEdit={handleEditTrip}
                    onDelete={handleDeleteTrip}
                    onView={handleViewTrip}
                  />
                ))}
              </View>
            )}

            <View style={{ height: 96 }} />
          </View>
        </View>
      </ScrollView>

      {/* ── FAB ── */}
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
          backgroundColor: "#E87722",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        aria-label="Create new trip"
      >
        <Icon name="Plus" size={26} color="#fff" />
      </Pressable>

      {/* ── Modals ── */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        action={action}
        tripData={selectedTrip}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedTrip(null);
        }}
        onSubmit={handleCreateTrip}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTrip(null);
        }}
        onConfirm={confirmDelete}
        tripTitle={selectedTrip?.title || ""}
      />
    </View>
  );
};

export default MyTrips;
