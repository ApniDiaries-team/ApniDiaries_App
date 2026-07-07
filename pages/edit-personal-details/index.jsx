import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Icon from "../../components/AppIcon";
import { useDarkMode } from "../../context/DarkModeContext";
import { getPersonalDetails, updateUserDetails } from "../../services/user.api";
import BasicInfoSection from "./components/BasicInfoSection";
import CoverPhotoSection from "./components/CoverPhotoSection";
// import PrivacySettingsSection from './components/PrivacySettingsSection'
import TravelPreferencesSection from "./components/TravelPreferencesSection";
import UnsavedChangesModal from "./components/UnsavedChangesModal";

const EditPersonalDetails = () => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    coverPhoto: "",
    profilePhoto: "",
    name: "",
    username: "",
    bio: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    currentCity: "",
    travelInterests: [],
    languages: [],
    travelStyle: "",
    weekendTrips: true,
    spontaneousTravel: true,
    groupTravel: false,
    profileVisibility: "public",
    messagePrivacy: "friends",
    emailFollowers: true,
    emailFriendRequests: true,
    emailMessages: true,
    emailPostInteractions: false,
    showInDiscovery: true,
    showOnlineStatus: true,
    allowProfileSharing: true,
  });

  const mapBackendToFormData = (data) => {
    const user = data?.user || {};
    return {
      coverPhoto: user?.cover_photo || "",
      profilePhoto: user?.profile_photo || "",

      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",

      email: user?.email || "",
      phone: user?.mobile_number || "",

      dateOfBirth: user?.dob ? user.dob.split("T")[0] : "",

      languages: user?.languages || [],

      travelStyle: user?.travel_style || "",

      currentCity: data?.city || user?.current_city || "",
      travelInterests: user?.interest || [],

      // Keep existing defaults for other fields
      weekendTrips: true,
      spontaneousTravel: true,
      groupTravel: false,
      profileVisibility: "public",
      messagePrivacy: "friends",
      emailFollowers: true,
      emailFriendRequests: true,
      emailMessages: true,
      emailPostInteractions: false,
      showInDiscovery: true,
      showOnlineStatus: true,
      allowProfileSharing: true,
    };
  };

  const [errors, setErrors] = useState({});
  const [initialFormData, setInitialFormData] = useState(formData);

  const shallowEqual = (a, b) => {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => {
      if (Array.isArray(a[key]) && Array.isArray(b[key])) {
        return (
          a[key].length === b[key].length &&
          a[key].every((v, i) => v === b[key][i])
        );
      }
      return a[key] === b[key];
    });
  };

  useEffect(() => {
    setHasUnsavedChanges(!shallowEqual(formData, initialFormData));
  }, [formData, initialFormData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // const validateForm = () => {
  //   const newErrors = {}

  //   if (!formData?.name?.trim()) {
  //     newErrors.name = 'Name is required'
  //   }

  //   if (!formData?.username?.trim()) {
  //     newErrors.username = 'Username is required'
  //   } else if (!/^[a-zA-Z0-9_]+$/?.test(formData?.username)) {
  //     newErrors.username = 'Username can only contain letters, numbers, and underscores'
  //   }

  //   if (!formData?.bio?.trim()) {
  //     newErrors.bio = 'Bio is required'
  //   } else if (formData?.bio?.length < 50) {
  //     newErrors.bio = 'Bio must be at least 50 characters'
  //   }

  //   if (!formData?.email?.trim()) {
  //     newErrors.email = 'Email is required'
  //   } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
  //     newErrors.email = 'Please enter a valid email address'
  //   }

  //   if (!formData?.dateOfBirth) {
  //     newErrors.dateOfBirth = 'Date of birth is required'
  //   } else {
  //     const age = new Date()?.getFullYear() - new Date(formData.dateOfBirth)?.getFullYear()
  //     if (age < 18) {
  //       newErrors.dateOfBirth = 'You must be at least 18 years old'
  //     }
  //   }

  //   if (!formData?.currentCity) {
  //     newErrors.currentCity = 'Current city is required'
  //   }

  //   if (!formData?.travelInterests || formData?.travelInterests?.length === 0) {
  //     newErrors.travelInterests = 'Please select at least one travel interest'
  //   }

  //   if (!formData?.languages || formData?.languages?.length === 0) {
  //     newErrors.languages = 'Please select at least one language'
  //   }

  //   setErrors(newErrors)
  //   return Object.keys(newErrors)?.length === 0
  // }

  const getUserDetails = async () => {
    try {
      const res = await getPersonalDetails();
      if (res?.data?.success) {
        const mapped = mapBackendToFormData(res.data?.data);
        setFormData(mapped);
        setInitialFormData(mapped);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("mobile_number", formData.phone);
      data.append("dob", formData.dateOfBirth);
      data.append("username", formData.username);
      data.append("bio", formData.bio);
      data.append("current_city", formData.currentCity);
      data.append("travel_style", formData.travelStyle);

      // Handle arrays
      (formData.travelInterests || []).forEach((item) =>
        data.append("interest", item)
      );
      (formData.languages || []).forEach((item) =>
        data.append("languages", item)
      );

      // Handle images.
      // NOTE: previously the "removed photo" case (formData.profilePhoto === "")
      // fell through both branches below and the "profile_photo" field was
      // never appended to the FormData at all. Since the backend only updates
      // fields that are present in the request body, omitting the field meant
      // "remove photo" silently did nothing — the old photo stayed in place.
      // We now always send the field, including an explicit empty string,
      // which the backend correctly treats as "clear the photo" (falling
      // back to the default avatar).
      if (formData.profilePhoto && formData.profilePhoto.startsWith("file:")) {
        const uriParts = formData.profilePhoto.split(".");
        const fileType = uriParts[uriParts.length - 1];
        data.append("profile_photo", {
          uri: formData.profilePhoto,
          name: `profile.${fileType}`,
          type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
        });
      } else {
        data.append("profile_photo", formData.profilePhoto || "");
      }

      if (formData.coverPhoto && formData.coverPhoto.startsWith("file:")) {
        const uriParts = formData.coverPhoto.split(".");
        const fileType = uriParts[uriParts.length - 1];
        data.append("cover_photo", {
          uri: formData.coverPhoto,
          name: `cover.${fileType}`,
          type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
        });
      } else {
        data.append("cover_photo", formData.coverPhoto || "");
      }

      const res = await updateUserDetails(data);

      if (res?.data?.success) {
        setSaveSuccess(true);
        setInitialFormData(formData);
        setHasUnsavedChanges(false);
        Alert.alert("Success", "Profile updated!");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update profile";
      Alert.alert("Error", errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      router.push("/personal-profile");
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  return (
    <View
      style={{ flex: 1, backgroundColor: isDarkMode ? "#111827" : "#f9fafb" }}
    >
      {/* ── HEADER ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          backgroundColor: isDarkMode ? "#1f2937" : "#fff",
          borderBottomColor: isDarkMode ? "#374151" : "#e5e7eb",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => ({
              padding: 8,
              borderRadius: 8,
              backgroundColor: pressed
                ? isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)"
                : "transparent",
            })}
            aria-label="Go back"
          >
            <Icon
              name="ArrowLeft"
              size={24}
              color={isDarkMode ? "#f9fafb" : "#111827"}
            />
          </Pressable>

          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: isDarkMode ? "#f9fafb" : "#111827",
              }}
            >
              Edit Profile
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {hasUnsavedChanges && (
            <>
              <Icon
                name="AlertCircle"
                size={16}
                color={isDarkMode ? "#FBBF24" : "#D97706"}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: isDarkMode ? "#FBBF24" : "#D97706",
                }}
              >
                Unsaved changes
              </Text>
            </>
          )}
        </View>
      </View>

      {/* ── Success banner ── */}
      {saveSuccess && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: isDarkMode ? "#059669" : "#10B981",
          }}
        >
          <Icon name="CheckCircle2" size={20} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#fff" }}>
            Profile Updated successfully!
          </Text>
        </View>
      )}

      {/* ── SCROLLABLE CONTENT ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 65 }}
      >
        <CoverPhotoSection
          currentCover={formData?.coverPhoto}
          currentProfile={formData?.profilePhoto}
          onCoverChange={(url) => handleFieldChange("coverPhoto", url)}
          onProfileChange={(url) => handleFieldChange("profilePhoto", url)}
        />

        <BasicInfoSection
          formData={formData}
          errors={errors}
          onChange={handleFieldChange}
        />

        <TravelPreferencesSection
          formData={formData}
          errors={errors}
          onChange={handleFieldChange}
        />

        {/* <PrivacySettingsSection formData={formData} onChange={handleFieldChange} /> */}
      </ScrollView>

      {/* ── STICKY FOOTER ── */}
      <View
        style={{
          borderTopWidth: 1,
          padding: 16,
          backgroundColor: isDarkMode ? "#1f2937" : "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 12,
          width: "92%",
          alignSelf: "center",
          borderWidth: 1,
          borderColor: isDarkMode ? "#374151" : "#f3f4f6",
          bottom: 10,
        }}
      >
        <View style={{ flexDirection: "flex", gap: 12, height: 100 }}>
          {/* Cancel */}
          <Pressable
            onPress={handleCancel}
            disabled={isSaving}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 13,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: "#FF9933",
              backgroundColor: "#ffff",
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            <Icon name="X" size={16} color="#FF9933" />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#FF9933" }}>
              Cancel
            </Text>
          </Pressable>

          {/* Save Changes */}
          <Pressable
            onPress={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 13,
              borderRadius: 10,
              backgroundColor: "#FF9933",
            }}
          >
            <Icon name="Save" size={16} color={"#fff"} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </Text>
          </Pressable>
        </View>

        {hasUnsavedChanges && (
          <Text
            style={{
              fontSize: 12,
              textAlign: "center",
              marginTop: 12,
              color: isDarkMode ? "#9ca3af" : "#6b7280",
            }}
          >
            Don't forget to save your changes before leaving
          </Text>
        )}
      </View>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onDiscard={() => {
          setShowUnsavedModal(false);
          router.push("/personal-profile");
        }}
        onSave={async () => {
          setShowUnsavedModal(false);
          await handleSave();
        }}
      />

      {/* <GlobalChatIndicator /> */}
    </View>
  );
};

export default EditPersonalDetails;