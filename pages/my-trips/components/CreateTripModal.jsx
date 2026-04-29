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
import { useDarkMode } from "../../../context/DarkModeContext";
import { Fonts } from "../../../constants/theme";
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
//           color: isDarkMode ? "#9ca3af" : "#6b7280",
//         }}
//       >
//         {label}
//       </Text>
//       <Text style={{ fontSize: 16, color: isDarkMode ? "#f9fafb" : "#111827" }}>
//         {value || "—"}
//       </Text>
//     </View>
//   );
// };
// ── TripTypeDropdown ───────────────────────────────────────
const TripTypeDropdown = ({ options, value, onChange, isDarkMode }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: 6, zIndex: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: isDarkMode ? "#f9fafb" : "#111827",
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
          borderColor: open ? "#9ca3af" : isDarkMode ? "#374151" : "#e5e7eb",
          backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: selected
              ? isDarkMode
                ? "#f9fafb"
                : "#111827"
              : isDarkMode
                ? "#6b7280"
                : "#9ca3af",
          }}
        >
          {selected ? selected.label : "Select trip type"}
        </Text>
        <Icon
          name={open ? "ChevronUp" : "ChevronDown"}
          size={16}
          color={isDarkMode ? "#9ca3af" : "#6b7280"}
        />
      </Pressable>

      {/* Dropdown list */}
      {open && (
        <View
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            backgroundColor: isDarkMode ? "#1f2937" : "#fff",
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
                  value === opt.value ? "#FF9933" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: value === opt.value ? "600" : "400",
                  color:
                    value === opt.value
                      ? "#fff"
                      : isDarkMode
                        ? "#f9fafb"
                        : "#111827",
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
          fontWeight: "500",
          color: isDarkMode ? "#f9fafb" : "#111827",
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
      placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
      keyboardType={keyboardType || "default"}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: error ? "#ef4444" : isDarkMode ? "#374151" : "#e5e7eb",
        backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
        fontSize: 14,
        color: isDarkMode ? "#f9fafb" : "#111827",
      }}
    />
    {description && !error && (
      <Text style={{ fontSize: 12, color: isDarkMode ? "#9ca3af" : "#6b7280" }}>
        {description}
      </Text>
    )}
    {error && <Text style={{ fontSize: 12, color: "#ef4444" }}>{error}</Text>}
  </View>
);

// ── DateField — replaces web <Input type='date' min='2026-01-01'> ──
const DateField = ({ label, value, onChange, error, required, isDarkMode }) => {
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
            fontWeight: "500",
            color: isDarkMode ? "#f9fafb" : "#111827",
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
          borderColor: error ? "#ef4444" : isDarkMode ? "#374151" : "#e5e7eb",
          backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: value
              ? isDarkMode
                ? "#f9fafb"
                : "#111827"
              : isDarkMode
                ? "#6b7280"
                : "#9ca3af",
          }}
        >
          {value || "Select date"}
        </Text>
        <Icon
          name="Calendar"
          size={16}
          color={isDarkMode ? "#9ca3af" : "#6b7280"}
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

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    description: "",
    tripType: "solo",
    budget: "",
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
        startDate: tripData.start_date?.slice(0, 10),
        endDate: tripData.end_date?.slice(0, 10),
        tripType: tripData.trip_type || "",
        tripStatus: tripData.trip_status || "planned",
        budget: tripData.budget || "",
        description: tripData.description || "",
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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        {/* Backdrop tap to close — matches web: onClick={handleClose} on overlay */}
        <Pressable
          style={{
            position: "absolute",
            inset: 0,
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
            backgroundColor: isDarkMode ? "#1f2937" : "#fff",
            borderRadius: 12,
            width: "100%",
            maxWidth: 672, // max-w-2xl
            maxHeight: "90%",
            borderWidth: 1,
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            overflow: "hidden",
          }}
        >
          {/* ── Sticky Header — matches web: sticky top-0 bg-card border-b px-6 py-4 ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? "#374151" : "#e5e7eb",
              backgroundColor: isDarkMode ? "#1f2937" : "#fff",
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
                  backgroundColor: "rgba(59,130,246,0.1)",
                }}
              >
                <Icon name="Plus" size={20} color="#3b82f6" />
              </View>
              {/* matches web: text-xl md:text-2xl font-semibold text-[var(--color-text-primary)] */}
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: Fonts.playfair.bold,
                  color: isDarkMode ? "#f9fafb" : "#111827",
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
                color={isDarkMode ? "#9ca3af" : "#6b7280"}
              />
            </Pressable>
          </View>

          {/* ── Form — matches web: p-6 space-y-6 ── */}
          <ScrollView
            contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 32 }}
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
              <View style={{ flexDirection: "row", gap: 16 }}>
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
                    color: isDarkMode ? "#f9fafb" : "#111827",
                  }}
                >
                  Description (Optional)
                </Text>
                {/* matches web: textarea bg-[var(--color-bg-secondary)] border border-[var(--color-border)] */}
                <TextInput
                  value={formData?.description}
                  onChangeText={(v) => handleChange("description", v)}
                  placeholder="Add trip details, itinerary highlights, or special notes..."
                  placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                    backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
                    fontSize: 14,
                    color: isDarkMode ? "#f9fafb" : "#111827",
                    minHeight: 100,
                  }}
                />
              </View>
            )}

            {/* Action buttons — matches web: {action !== 'View' && ...}
                flex flex-col-reverse sm:flex-row gap-3 pt-4
                In RN: row layout, Cancel first */}
            {action !== "View" && (
              <View style={{ flexDirection: "flex", gap: 12, paddingTop: 16 }}>
                {/* Submit — matches web: Button variant='default' iconName='Plus' */}
                <Pressable
                  onPress={handleSubmit}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: "#FF9933",
                    gap: 8,
                    paddingVertical: 13,
                    borderRadius: 20,
                    backgroundColor: "#FF9933",
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
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: "#FF9933",
                    alignItems: "center",
                    backgroundColor: "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#FF9933",
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CreateTripModal;
