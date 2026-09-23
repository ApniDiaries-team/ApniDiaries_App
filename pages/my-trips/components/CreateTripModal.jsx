import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts, Shadow } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { ViewField } from "./ViewField";

// Mirrors web pages/my-trips/components/CreateTripModal.jsx (mobile/single-
// column rendering of its responsive grid).
const VISIBILITY_OPTIONS = [
  { value: "only_me", label: "Only Me", desc: "Just for you — private journal", icon: "Eye" },
  { value: "private", label: "Private", desc: "Friends can see & join", icon: "Lock" },
  { value: "public", label: "Public", desc: "Anyone can discover & join", icon: "Globe2" },
];

const TRIP_TYPE_OPTIONS = [
  { value: "solo", label: "Solo Trip" },
  { value: "couple", label: "Couple Trip" },
  { value: "family", label: "Family Trip" },
  { value: "friends", label: "Friends Trip" },
  { value: "group", label: "Group Trip" },
];

const IndexField = ({ index, label, theme, children, sub, error }) => (
  <View style={{ gap: 8 }}>
    <Text
      style={{
        fontSize: 10,
        fontFamily: Fonts.body.bold,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.onSurfaceVariant,
      }}
    >
      {index}. {label}
    </Text>
    {children}
    {sub && <Text style={{ fontSize: 12, color: theme.onSurfaceVariant }}>{sub}</Text>}
    {error && <Text style={{ fontSize: 12, color: theme.error }}>{error}</Text>}
  </View>
);

const UnderlineInput = ({ theme, style, ...props }) => (
  <TextInput
    placeholderTextColor={theme.outline}
    style={[
      {
        borderBottomWidth: 1,
        borderBottomColor: theme.outlineVariant,
        paddingVertical: 8,
        fontSize: 15,
        color: theme.onSurface,
      },
      style,
    ]}
    {...props}
  />
);

const DateField = ({ label, value, onChange, theme, error, minDate }) => {
  const [show, setShow] = useState(false);
  const parsed = value ? new Date(value) : new Date();

  const handleChange = (event, selectedDate) => {
    setShow(Platform.OS === "ios");
    if (selectedDate) onChange(selectedDate.toISOString().split("T")[0]);
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={() => setShow(true)}>
        <UnderlineInput
          theme={theme}
          value={value}
          placeholder="YYYY-MM-DD"
          editable={false}
          pointerEvents="none"
        />
      </Pressable>
      {error && <Text style={{ fontSize: 12, color: theme.error, marginTop: 4 }}>{error}</Text>}
      {show && (
        <DateTimePicker
          value={parsed}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={minDate}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const CreateTripModal = ({ isOpen, onClose, onSubmit, tripData, action }) => {
  const { theme } = useDarkMode();
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    description: "",
    tripType: "solo",
    budget: "",
    visibility: "only_me",
  });
  const [errors, setErrors] = useState({});
  const [tripTypeOpen, setTripTypeOpen] = useState(false);

  useEffect(() => {
    if (tripData && action !== "Create") {
      setFormData({
        title: tripData.title || "",
        destination: tripData.destination || "",
        startDate: tripData.startDate?.slice(0, 10) || tripData.start_date?.slice(0, 10) || "",
        endDate: tripData.endDate?.slice(0, 10) || tripData.end_date?.slice(0, 10) || "",
        tripType: tripData.tripType || tripData.trip_type || "",
        tripStatus: tripData.status || "planned",
        budget: tripData.budget || "",
        description: tripData.description || "",
        visibility: tripData.visibility || "only_me",
      });
    } else {
      setFormData({
        title: "",
        destination: "",
        startDate: "",
        endDate: "",
        tripType: "",
        tripStatus: "planned",
        budget: "",
        description: "",
        visibility: "only_me",
      });
    }
  }, [tripData, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.title?.trim()) newErrors.title = "Trip title is required";
    if (!formData?.destination?.trim()) newErrors.destination = "Destination is required";
    if (!formData?.startDate) newErrors.startDate = "Start date is required";
    if (!formData?.endDate) newErrors.endDate = "End date is required";
    if (formData?.startDate && formData?.endDate && new Date(formData.endDate) < new Date(formData.startDate))
      newErrors.endDate = "End date must be after start date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () =>
    setFormData({
      title: "",
      destination: "",
      startDate: "",
      endDate: "",
      description: "",
      tripType: "solo",
      budget: "",
      visibility: "only_me",
    });

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData, action);
      reset();
      setErrors({});
    }
  };

  const handleClose = () => {
    reset();
    setErrors({});
    onClose();
  };

  const isView = action === "View";
  const visLabel = VISIBILITY_OPTIONS.find((v) => v.value === formData.visibility)?.label || formData.visibility;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={handleClose} />

        <View
          style={{
            backgroundColor: theme.surfaceContainerLowest,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "92%",
            borderWidth: 1,
            borderColor: theme.outlineVariant,
            overflow: "hidden",
            ...Shadow.soft,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.outlineVariant,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Icon name="Map" size={22} color={theme.primary} />
              <Text style={{ fontFamily: Fonts.display.semibold, fontSize: 20, color: theme.onSurface }}>
                {action} Trip
              </Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={10}>
              <Icon name="X" size={22} color={theme.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 32 }}>
            {isView ? (
              <ViewField label="Trip Title" value={formData.title} />
            ) : (
              <IndexField index="01" label="Trip Title" theme={theme} error={errors?.title}>
                <UnderlineInput
                  theme={theme}
                  placeholder="e.g., Summer Adventure in Himalayas"
                  value={formData.title}
                  onChangeText={(v) => handleChange("title", v)}
                />
              </IndexField>
            )}

            {isView ? (
              <ViewField label="Destination" value={formData.destination} />
            ) : (
              <IndexField index="02" label="Destination" theme={theme} error={errors?.destination}>
                <UnderlineInput
                  theme={theme}
                  placeholder="e.g., Manali, Himachal Pradesh"
                  value={formData.destination}
                  onChangeText={(v) => handleChange("destination", v)}
                />
              </IndexField>
            )}

            {isView ? (
              <View style={{ flexDirection: "row", gap: 16 }}>
                <View style={{ flex: 1 }}><ViewField label="Start Date" value={formData.startDate} /></View>
                <View style={{ flex: 1 }}><ViewField label="End Date" value={formData.endDate} /></View>
              </View>
            ) : (
              <View style={{ flexDirection: "row", gap: 20 }}>
                <View style={{ flex: 1 }}>
                  <IndexField index="03" label="Start Date" theme={theme}>
                    <DateField
                      label="Start Date"
                      value={formData.startDate}
                      onChange={(v) => handleChange("startDate", v)}
                      theme={theme}
                      error={errors?.startDate}
                    />
                  </IndexField>
                </View>
                <View style={{ flex: 1 }}>
                  <IndexField index="04" label="End Date" theme={theme}>
                    <DateField
                      label="End Date"
                      value={formData.endDate}
                      onChange={(v) => handleChange("endDate", v)}
                      theme={theme}
                      error={errors?.endDate}
                    />
                  </IndexField>
                </View>
              </View>
            )}

            {isView ? (
              <ViewField label="Trip Type" value={formData.tripType} />
            ) : (
              <IndexField index="05" label="Trip Type" theme={theme}>
                <Pressable
                  onPress={() => setTripTypeOpen((o) => !o)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottomWidth: 1,
                    borderBottomColor: theme.outlineVariant,
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ fontSize: 15, color: formData.tripType ? theme.onSurface : theme.outline }}>
                    {TRIP_TYPE_OPTIONS.find((t) => t.value === formData.tripType)?.label || "Select classification"}
                  </Text>
                  <Icon name="ChevronDown" size={16} color={theme.outline} />
                </Pressable>
                {tripTypeOpen && (
                  <View
                    style={{
                      marginTop: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.outlineVariant,
                      overflow: "hidden",
                    }}
                  >
                    {TRIP_TYPE_OPTIONS.map((t) => (
                      <Pressable
                        key={t.value}
                        onPress={() => {
                          handleChange("tripType", t.value);
                          setTripTypeOpen(false);
                        }}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          backgroundColor:
                            formData.tripType === t.value ? theme.primaryFixed : "transparent",
                        }}
                      >
                        <Text style={{ fontSize: 14, color: theme.onSurface }}>{t.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </IndexField>
            )}

            {/* Visibility */}
            {isView ? (
              <ViewField label="Visibility" value={visLabel} />
            ) : (
              <View style={{ gap: 12 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: Fonts.body.bold,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: theme.onSurfaceVariant,
                  }}
                >
                  06. Security Clearance
                </Text>
                {VISIBILITY_OPTIONS.map((opt) => {
                  const active = formData.visibility === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleChange("visibility", opt.value)}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: active ? theme.primary : theme.outlineVariant,
                        backgroundColor: active ? theme.primaryFixed : "transparent",
                      }}
                    >
                      <Icon name={opt.icon} size={18} color={active ? theme.primary : theme.onSurfaceVariant} />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ fontSize: 14, fontFamily: Fonts.body.semibold, color: theme.onSurface }}>
                          {opt.label}
                        </Text>
                        <Text style={{ fontSize: 12, color: theme.onSurfaceVariant, marginTop: 2 }}>
                          {opt.desc}
                        </Text>
                      </View>
                      {active && <Icon name="Check" size={18} color={theme.primary} />}
                    </Pressable>
                  );
                })}
              </View>
            )}

            {isView ? (
              <ViewField label="Budget" value={formData.budget ? `₹${formData.budget}` : "—"} />
            ) : (
              <IndexField index="07" label="Estimated Budget (Opt)" theme={theme}>
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
                  <Text style={{ fontSize: 15, color: theme.onSurfaceVariant, paddingBottom: 8 }}>₹</Text>
                  <UnderlineInput
                    theme={theme}
                    style={{ flex: 1 }}
                    placeholder="25,000"
                    keyboardType="numeric"
                    value={String(formData.budget || "")}
                    onChangeText={(v) => handleChange("budget", v)}
                  />
                </View>
              </IndexField>
            )}

            {isView ? (
              <ViewField label="Description" value={formData.description || "—"} />
            ) : (
              <IndexField index="08" label="Notes (Opt)" theme={theme}>
                <TextInput
                  value={formData.description}
                  onChangeText={(v) => handleChange("description", v)}
                  placeholder="Add trip details, highlights, or special notes..."
                  placeholderTextColor={theme.outline}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: theme.outlineVariant,
                    paddingVertical: 8,
                    fontSize: 15,
                    color: theme.onSurface,
                    minHeight: 72,
                  }}
                />
              </IndexField>
            )}
          </ScrollView>

          {/* Footer */}
          {!isView && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 16,
                alignItems: "center",
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: theme.outlineVariant,
              }}
            >
              <Pressable onPress={handleClose} style={{ paddingVertical: 12, paddingHorizontal: 8 }}>
                <Text style={{ fontSize: 14, fontFamily: Fonts.body.semibold, color: theme.onSurfaceVariant }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 24,
                  paddingVertical: 13,
                  borderRadius: 12,
                  backgroundColor: theme.primary,
                }}
              >
                <Icon name={action === "Update" ? "Save" : "Plus"} size={16} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontFamily: Fonts.body.semibold }}>
                  {action === "Update" ? "Update Trip" : "Create Trip"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CreateTripModal;
