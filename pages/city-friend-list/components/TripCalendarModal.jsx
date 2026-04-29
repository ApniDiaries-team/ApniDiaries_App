import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const SAFFRON = "#E87722";

const TripCalendarModal = ({ isOpen, onClose, trips = [] }) => {
  const { isDarkMode } = useDarkMode();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const colors = {
    bgCard: isDarkMode ? "#1E242F" : "#FFFFFF",
    bgSecondary: isDarkMode ? "#1A1F29" : "#F7FAFC",
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    border: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)",
    overlay: "rgba(0,0,0,0.5)",
  };

  // ── Pre-calculate trips — mirrors web's startDateMap + rangeSet ───────────
  const { startDateMap, rangeSet } = useMemo(() => {
    const map = {};
    const set = new Set();
    const safeTrips = Array.isArray(trips) ? trips : [];

    safeTrips.forEach((trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      if (isNaN(start) || isNaN(end)) return;

      const startStr = start.toDateString();
      if (!map[startStr]) map[startStr] = [];
      map[startStr].push(trip);

      const cur = new Date(start);
      while (cur <= end) {
        set.add(cur.toDateString());
        cur.setDate(cur.getDate() + 1);
      }
    });

    return { startDateMap: map, rangeSet: set };
  }, [trips]);

  // ── Trips on selected date — mirrors web's tripsOnSelected filter ─────────
  const tripsOnSelected = useMemo(() => {
    const safeTrips = Array.isArray(trips) ? trips : [];
    return safeTrips.filter((t) => {
      const s = new Date(t.startDate);
      const e = new Date(t.endDate);
      if (isNaN(s) || isNaN(e)) return false;
      return selectedDate >= s && selectedDate <= e;
    });
  }, [trips, selectedDate]);

  // ── Calendar logic ────────────────────────────────────────────────────────
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++)
    calendarDays.push(new Date(year, month, i));

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // ── Date locale string — mirrors web's toLocaleDateString('en-IN') ────────
  const formatDate = (date, opts) => date.toLocaleDateString("en-IN", opts);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: "center",
          padding: 16,
        }}
      >
        <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 12,
              overflow: "hidden",
              maxHeight: "90%",
            }}
          >
            {/* ── Header — mirrors web's sticky top-0 header ── */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: colors.bgCard,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: Fonts.playfair.bold,
                  color: colors.textPrimary,
                }}
              >
                Trip Calendar
              </Text>
              <Pressable
                onPress={onClose}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: "transparent",
                }}
              >
                <Icon name="X" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={{ padding: 16 }}>
              {/* ── Month navigation ── */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Pressable
                  onPress={handlePrevMonth}
                  style={{
                    padding: 8,
                    opacity: 1,
                  }}
                >
                  <Icon
                    name="ChevronLeft"
                    size={24}
                    color={colors.textPrimary}
                  />
                </Pressable>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: Fonts.inter.bold,
                    color: colors.textPrimary,
                  }}
                >
                  {monthNames[month]} {year}
                </Text>
                <Pressable
                  onPress={handleNextMonth}
                  style={{
                    padding: 8,
                    opacity: 1,
                  }}
                >
                  <Icon
                    name="ChevronRight"
                    size={24}
                    color={colors.textPrimary}
                  />
                </Pressable>
              </View>

              {/* ── Weekday headers ── */}
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                {dayNames.map((day) => (
                  <View key={day} style={{ flex: 1, alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: Fonts.inter.medium,
                        color: colors.textSecondary,
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* ── Days grid — mirrors web's tileClassName + tileContent ── */}
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return (
                      <View
                        key={`empty-${index}`}
                        style={{ width: "14.28%", height: 52 }}
                      />
                    );
                  }

                  const dateStr = date.toDateString();
                  const isSelected = selectedDate.toDateString() === dateStr;
                  const isToday = new Date().toDateString() === dateStr;
                  const dayTrips = startDateMap[dateStr];
                  const isStart = !!dayTrips?.length;
                  const isInRange = rangeSet.has(dateStr);

                  // mirrors web tileClassName logic
                  let bgColor = "transparent";
                  if (isSelected) bgColor = SAFFRON;
                  else if (isToday) bgColor = "rgba(232,119,34,0.1)";
                  else if (isStart) bgColor = "rgba(232,119,34,0.18)";
                  else if (isInRange) bgColor = "rgba(232,119,34,0.07)";

                  const textColor = isSelected ? "#FFFFFF" : colors.textPrimary;

                  return (
                    <Pressable
                      key={index}
                      onPress={() => setSelectedDate(date)}
                      style={{
                        width: "14.28%",
                        height: 52,
                        alignItems: "center",
                        justifyContent: "flex-start",
                        paddingTop: 6,
                        backgroundColor: bgColor,
                        borderRadius: isSelected || isStart || isToday ? 8 : 0,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily:
                            isSelected || isStart
                              ? Fonts.inter.bold
                              : Fonts.inter.regular,
                          color: textColor,
                        }}
                      >
                        {date.getDate()}
                      </Text>

                      {/* ── Trip title chips — mirrors web's tileContent ── */}
                      {isStart && !isSelected && (
                        <View
                          style={{ alignItems: "center", gap: 2, marginTop: 2 }}
                        >
                          {dayTrips.slice(0, 2).map((t, i) => (
                            <View
                              key={i}
                              style={{
                                backgroundColor: SAFFRON,
                                borderRadius: 3,
                                paddingHorizontal: 3,
                                maxWidth: 48,
                              }}
                            >
                              <Text
                                numberOfLines={1}
                                style={{
                                  fontSize: 8,
                                  fontFamily: Fonts.inter.semibold,
                                  color: "#FFFFFF",
                                }}
                              >
                                {t.title.length > 7
                                  ? t.title.slice(0, 6) + "…"
                                  : t.title}
                              </Text>
                            </View>
                          ))}
                          {dayTrips.length > 2 && (
                            <Text
                              style={{
                                fontSize: 8,
                                fontFamily: Fonts.inter.regular,
                                color: colors.textSecondary,
                              }}
                            >
                              +{dayTrips.length - 2}
                            </Text>
                          )}
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* ── Legend — mirrors web exactly ── */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  marginTop: 12,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: "rgba(232,119,34,0.18)",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.inter.regular,
                      color: colors.textSecondary,
                    }}
                  >
                    Trip starts
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: "rgba(232,119,34,0.07)",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.inter.regular,
                      color: colors.textSecondary,
                    }}
                  >
                    In progress
                  </Text>
                </View>
              </View>

              {/* ── Selected date trips — mirrors web's trips list ── */}
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: Fonts.inter.semibold,
                    color: colors.textPrimary,
                    marginBottom: 12,
                  }}
                >
                  {tripsOnSelected.length
                    ? `${tripsOnSelected.length} trip${tripsOnSelected.length > 1 ? "s" : ""} on ${formatDate(selectedDate, { day: "numeric", month: "long", year: "numeric" })}`
                    : `No trips on ${formatDate(selectedDate, { day: "numeric", month: "long" })}`}
                </Text>

                <View style={{ gap: 8 }}>
                  {tripsOnSelected.map((trip) => (
                    <View
                      key={trip.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: colors.bgSecondary,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      {/* ── Saffron left bar ── */}
                      <View
                        style={{
                          width: 4,
                          alignSelf: "stretch",
                          borderRadius: 4,
                          backgroundColor: SAFFRON,
                          flexShrink: 0,
                        }}
                      />

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 14,
                            fontFamily: Fonts.inter.semibold,
                            color: colors.textPrimary,
                          }}
                        >
                          {trip.title}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 12,
                            fontFamily: Fonts.inter.regular,
                            color: colors.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {trip.destination}
                        </Text>
                        {/* ── Date range — mirrors web's en-IN locale format ── */}
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: Fonts.inter.regular,
                            color: SAFFRON,
                            marginTop: 4,
                          }}
                        >
                          {formatDate(new Date(trip.startDate), {
                            day: "2-digit",
                            month: "short",
                          })}
                          {" → "}
                          {formatDate(new Date(trip.endDate), {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          {" · "}
                          {trip.duration} day{trip.duration !== 1 ? "s" : ""}
                        </Text>
                      </View>

                      {/* ── Status badge — mirrors web's conditional classes ── */}
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          alignSelf: "flex-start",
                          flexShrink: 0,
                          backgroundColor:
                            trip.status === "ongoing"
                              ? "#dcfce7"
                              : trip.status === "completed"
                                ? "#f3f4f6"
                                : "#dbeafe",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontFamily: Fonts.inter.medium,
                            textTransform: "capitalize",
                            color:
                              trip.status === "ongoing"
                                ? "#15803d"
                                : trip.status === "completed"
                                  ? "#4b5563"
                                  : "#1d4ed8",
                          }}
                        >
                          {trip.status}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default TripCalendarModal;
