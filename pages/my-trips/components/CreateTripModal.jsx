import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { Fonts, Palette } from "../../../constants/theme";
import { ViewField } from "./ViewField";

// ── ViewField — matches web: import { ViewField } from './ViewField' ──
// const ViewField = ({ label, value }) => {
//   const { isDarkMode } = useDarkMode();
//   return (
//     <View style={{ gap: 4 }}>
//       <Text
//         style={{
//           fontSize: 14,
//           fontWeight: "500",
//           color: isDarkMode ? "#A0AEC0" : "#594137",
//         }}
//       >
//         {label}
//       </Text>
//       <Text style={{ fontSize: 16, color: isDarkMode ? "#FFFFFF" : "#261913" }}>
//         {value || "—"}
//       </Text>
//     </View>
//   );
// };
// ── TripTypeDropdown ───────────────────────────────────────
const TripTypeDropdown = ({ options, value, onChange, isDarkMode }) => {
  const [open, setOpen] = useState(false);
  const palette = isDarkMode ? Palette.dark : Palette.light;
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: 6, zIndex: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontFamily: Fonts.inter.medium,
          color: palette.text,
        }}
      >
        Trip Type
      </Text>

      {/* Trigger */}
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: open ? palette.primary : palette.outlineVariant,
          backgroundColor: isDarkMode ? Palette.dark.surfaceLow : Palette.light.surfaceLowest,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: Fonts.inter.regular,
            color: selected ? palette.text : palette.outline,
          }}
        >
          {selected ? selected.label : "Select trip type"}
        </Text>
        <Icon
          name={open ? "ChevronUp" : "ChevronDown"}
          size={16}
          color={isDarkMode ? "#A0AEC0" : "#594137"}
        />
      </Pressable>

      {/* Dropdown list */}
      {open && (
        <View
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: palette.outlineVariant,
            backgroundColor: isDarkMode ? Palette.dark.surfaceLowest : Palette.light.surfaceLowest,
            overflow: "hidden",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
          }}
        >
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor:
                  value === opt.value ? (isDarkMode ? "rgba(237,137,54,0.14)" : "#FCE8DC") : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: value === opt.value ? Fonts.inter.semibold : Fonts.inter.regular,
                  color: value === opt.value ? palette.primary : palette.text,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

// ── InputField — matches web: <Input label required error description> ──
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  required,
  description,
  isDarkMode,
}) => (
  <View style={{ gap: 6 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Text
        style={{
          fontSize: 14,
          fontFamily: Fonts.inter.medium,
          color: isDarkMode ? Palette.dark.text : Palette.light.text,
        }}
      >
        {label}
      </Text>
      {required && <Text style={{ color: "#ef4444" }}>*</Text>}
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={isDarkMode ? Palette.dark.textVariant : Palette.light.outline}
      keyboardType={keyboardType || "default"}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: error ? "#ef4444" : isDarkMode ? Palette.dark.outlineVariant : Palette.light.outlineVariant,
        backgroundColor: isDarkMode ? Palette.dark.surfaceLow : Palette.light.surfaceLowest,
        fontSize: 14,
        color: isDarkMode ? Palette.dark.text : Palette.light.text,
        fontFamily: Fonts.inter.regular,
      }}
    />
    {description && !error && (
      <Text style={{ fontSize: 12, color: isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant, fontFamily: Fonts.inter.regular }}>
        {description}
      </Text>
    )}
    {error && <Text style={{ fontSize: 12, color: "#ef4444" }}>{error}</Text>}
  </View>
);

// ── DateField — replaces web <Input type='date' min='2026-01-01'> ──
const DateField = ({ label, value, onChange, error, required, isDarkMode }) => {
  const palette = isDarkMode ? Palette.dark : Palette.light;
  const [show, setShow] = useState(false);
  const minDate = new Date("2026-01-01");
  const parsed = value ? new Date(value) : minDate;

  const handleChange = (event, selectedDate) => {
    setShow(Platform.OS === "ios");
    if (selectedDate) {
      onChange(selectedDate.toISOString().split("T")[0]);
    }
  };

  return (
    <View style={{ gap: 6, flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
        <Text
          style={{
          fontSize: 14,
          fontFamily: Fonts.inter.medium,
          color: palette.text,
          }}
        >
          {label}
        </Text>
        {required && <Text style={{ color: "#ef4444" }}>*</Text>}
      </View>
      <Pressable
        onPress={() => setShow(true)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: error ? "#ef4444" : palette.outlineVariant,
          backgroundColor: isDarkMode ? Palette.dark.surfaceLow : Palette.light.surfaceLowest,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: Fonts.inter.regular,
            color: value ? palette.text : palette.outline,
          }}
        >
          {value || "Select date"}
        </Text>
        <Icon
          name="Calendar"
          size={16}
          color={palette.outline}
        />
      </Pressable>
      {error && <Text style={{ fontSize: 12, color: "#ef4444" }}>{error}</Text>}
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

// ── Main Component ─────────────────────────────────────────
const CreateTripModal = ({ isOpen, onClose, onSubmit, tripData, action }) => {
  const { isDarkMode } = useDarkMode();
  const { width } = useWindowDimensions();
  const compact = width < 420;
  const palette = isDarkMode ? Palette.dark : Palette.light;

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

  // matches web tripTypeOptions exactly — label/value objects
  const tripTypeOptions = [
    { value: "solo", label: "Solo Trip" },
    { value: "couple", label: "Couple Trip" },
    { value: "family", label: "Family Trip" },
    { value: "friends", label: "Friends Trip" },
    { value: "group", label: "Group Trip" },
  ];

  // matches web useEffect exactly
  useEffect(() => {
    if (tripData && action !== "Create") {
      setFormData({
        title: tripData.title || "",
        destination: tripData.destination || "",
        startDate: (tripData.startDate || tripData.start_date)?.slice(0, 10),
        endDate: (tripData.endDate || tripData.end_date)?.slice(0, 10),
        tripType: tripData.tripType || tripData.trip_type || "",
        tripStatus: tripData.status || tripData.trip_status || "planned",
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
        visibility: "only_me",
        description: "",
      });
    }
  }, [tripData, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // matches web validateForm exactly
  const validateForm = () => {
    const newErrors = {};

    if (!formData?.title?.trim()) newErrors.title = "Trip title is required";
    if (!formData?.destination?.trim())
      newErrors.destination = "Destination is required";
    if (!formData?.startDate) newErrors.startDate = "Start date is required";
    if (!formData?.endDate) newErrors.endDate = "End date is required";

    if (formData?.startDate && formData?.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  // matches web handleSubmit exactly
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData, action);
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
      setErrors({});
    }
  };

  // matches web handleClose exactly
  const handleClose = () => {
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
    setErrors({});
    onClose();
  };

  // matches web: if (!isOpen) return null

  const isView = action === "View";

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      {/* matches web: fixed inset-0 z-[1100] flex items-center justify-center p-4 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}
      >
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.58)",
        }}
      />
        {/* Backdrop tap to close — matches web: onClick={handleClose} on overlay */}
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={handleClose}
        />

        {/* matches web: bg-[var(--color-bg-card)] rounded-xl max-w-2xl max-h-[90vh] border */}
        <View
          style={{
            backgroundColor: palette.surfaceLowest,
            borderRadius: 22,
            width: "100%",
            maxWidth: 672, // max-w-2xl
            maxHeight: "90%",
            borderWidth: 1,
            borderColor: palette.outlineVariant,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 12,
            overflow: "hidden",
          }}
        >
          {/* ── Sticky Header — matches web: sticky top-0 bg-card border-b px-6 py-4 ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: compact ? 18 : 24,
              paddingVertical: 17,
              borderBottomWidth: 1,
              borderBottomColor: palette.outlineVariant,
              backgroundColor: palette.surfaceLowest,
            }}
          >
            {/* matches web: flex items-center gap-3 */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {/* matches web: p-2 rounded-lg bg-blue-500/10 */}
              <View
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: isDarkMode ? "rgba(237,137,54,0.14)" : "#FCE8DC",
                }}
              >
                <Icon name="Plus" size={20} color={(isDarkMode ? "#ED8936" : "#A23F00")} />
              </View>
              {/* matches web: text-xl md:text-2xl font-semibold text-[var(--color-text-primary)] */}
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: Fonts.playfair.bold,
                  color: palette.text,
                }}
              >
                {action} Trip
              </Text>
            </View>

            {/* Close button — matches web: p-2 rounded-lg hover:bg-secondary */}
            <Pressable
              onPress={handleClose}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              }}
              aria-label="Close modal"
            >
              <Icon
                name="X"
                size={20}
                color={palette.textVariant}
              />
            </Pressable>
          </View>

          {/* ── Form — matches web: p-6 space-y-6 ── */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: compact ? 18 : 24, gap: 21, paddingBottom: 28 }}
          >
            {/* Trip Title */}
            {isView ? (
              <ViewField label="Trip Title" value={formData?.title} />
            ) : (
              <InputField
                label="Trip Title"
                value={formData?.title}
                onChangeText={(v) => handleChange("title", v)}
                placeholder="e.g., Summer Adventure in Himalayas"
                error={errors?.title}
                required
                isDarkMode={isDarkMode}
              />
            )}

            {/* Destination */}
            {isView ? (
              <ViewField label="Destination" value={formData?.destination} />
            ) : (
              <InputField
                label="Destination"
                value={formData?.destination}
                onChangeText={(v) => handleChange("destination", v)}
                placeholder="e.g., Manali, Himachal Pradesh"
                error={errors?.destination}
                required
                isDarkMode={isDarkMode}
              />
            )}

            {/* Date Range — matches web: grid grid-cols-1 md:grid-cols-2 gap-6 */}
            {isView ? (
              <View style={{ flexDirection: "row", gap: 24 }}>
                <View style={{ flex: 1 }}>
                  <ViewField label="Start Date" value={formData?.startDate} />
                </View>
                <View style={{ flex: 1 }}>
                  <ViewField label="End Date" value={formData?.endDate} />
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: compact ? "column" : "row", gap: 16 }}>
                <DateField
                  label="Start Date"
                  value={formData?.startDate}
                  onChange={(v) => handleChange("startDate", v)}
                  error={errors?.startDate}
                  required
                  isDarkMode={isDarkMode}
                />
                <DateField
                  label="End Date"
                  value={formData?.endDate}
                  onChange={(v) => handleChange("endDate", v)}
                  error={errors?.endDate}
                  required
                  isDarkMode={isDarkMode}
                />
              </View>
            )}

            {/* Trip Type — matches web: <Select options={tripTypeOptions}> */}
            {isView ? (
              <ViewField label="Trip Type" value={formData?.tripType} />
            ) : (
              <TripTypeDropdown
                options={tripTypeOptions}
                value={formData?.tripType}
                onChange={(v) => handleChange("tripType", v)}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Security Clearance / trip visibility */}
            {isView ? (
              <ViewField label="Visibility" value={{ only_me: "Only Me", private: "Private", public: "Public" }[formData?.visibility] || "Only Me"} />
            ) : (
              <View style={{ gap: 10 }}>
                <Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", color: palette.textVariant }}>06. Trip visibility</Text>
                {[
                  { value: "only_me", label: "Only Me", description: "Just for you — private journal", icon: "Eye" },
                  { value: "private", label: "Private", description: "Friends can see and join", icon: "Lock" },
                  { value: "public", label: "Public", description: "Anyone can discover and join", icon: "Globe2" },
                ].map((option) => {
                  const active = (formData?.visibility || "only_me") === option.value;
                  return (
                    <Pressable key={option.value} onPress={() => handleChange("visibility", option.value)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: active ? (isDarkMode ? "#ED8936" : "#A23F00") : isDarkMode ? "#2D3748" : "#E1BFB2", backgroundColor: active ? (isDarkMode ? "rgba(237,137,54,0.1)" : "rgba(162,63,0,0.05)") : "transparent" }}>
                      <Icon name={option.icon} size={18} color={active ? palette.primary : palette.textVariant} />
                      <View style={{ flex: 1 }}><Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 14, color: palette.text }}>{option.label}</Text><Text style={{ fontFamily: Fonts.inter.regular, fontSize: 12, color: palette.textVariant, marginTop: 3 }}>{option.description}</Text></View>
                      {active && <Icon name="Check" size={18} color={palette.primary} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
            {/* Budget — matches web: description='Estimated budget in ₹ INR' */}
            {isView ? (
              <ViewField label="Budget" value={formData?.budget} />
            ) : (
              <InputField
                label="Budget (Optional)"
                value={String(formData?.budget || "")}
                onChangeText={(v) => handleChange("budget", v)}
                placeholder="e.g., 25000"
                keyboardType="numeric"
                description="Estimated budget in ₹ INR"
                isDarkMode={isDarkMode}
              />
            )}

            {/* Description — matches web: textarea rows={4} */}
            {isView ? (
              <ViewField label="Description" value={formData?.description} />
            ) : (
              <View style={{ gap: 8 }}>
                {/* matches web: <label className='block text-sm font-medium text-[var(--color-text-primary)] mb-2'> */}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: palette.text,
                  }}
                >
                  Description (Optional)
                </Text>
                {/* matches web: textarea bg-[var(--color-bg-secondary)] border border-[var(--color-border)] */}
                <TextInput
                  value={formData?.description}
                  onChangeText={(v) => handleChange("description", v)}
                  placeholder="Add trip details, itinerary highlights, or special notes..."
                  placeholderTextColor={palette.outline}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: palette.outlineVariant,
                    backgroundColor: isDarkMode ? Palette.dark.surfaceLow : Palette.light.surfaceLowest,
                    fontSize: 14,
                    color: palette.text,
                    fontFamily: Fonts.inter.regular,
                    minHeight: 100,
                  }}
                />
              </View>
            )}

            {/* Action buttons — matches web: {action !== 'View' && ...}
                flex flex-col-reverse sm:flex-row gap-3 pt-4
                In RN: row layout, Cancel first */}
            {action !== "View" && (
              <View style={{ flexDirection: compact ? "column-reverse" : "row", gap: 12, paddingTop: 4 }}>
                {/* Submit — matches web: Button variant='default' iconName='Plus' */}
                <Pressable
                  onPress={handleSubmit}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: (isDarkMode ? "#ED8936" : "#A23F00"),
                    gap: 8,
                    paddingVertical: 13,
                    borderRadius: 14,
                    backgroundColor: (isDarkMode ? "#ED8936" : "#A23F00"),
                  }}
                >
                  <Icon name="Plus" size={16} color="#fff" />
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}
                  >
                    {action === "Update" ? "Update Trip" : "Create Trip"}
                  </Text>
                </Pressable>

                {/* Cancel — matches web: Button variant='outline' */}
                <Pressable
                  onPress={handleClose}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: (isDarkMode ? "#ED8936" : "#A23F00"),
                    alignItems: "center",
                    backgroundColor: "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: (isDarkMode ? "#ED8936" : "#A23F00"),
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateTripModal;





