import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getCoverPhotoUrl, getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

const CoverPhotoSection = ({
  currentCover,
  currentProfile,
  onCoverChange,
  onProfileChange,
}) => {
  const { isDarkMode } = useDarkMode();

  const [coverPreview, setCoverPreview] = useState(currentCover);
  const [profilePreview, setProfilePreview] = useState(currentProfile);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  useEffect(() => {
    setCoverPreview(currentCover);
  }, [currentCover]);

  useEffect(() => {
    setProfilePreview(currentProfile);
  }, [currentProfile]);

  // ── Validation — mirrors validateImageFile() in Doc 12 ──
  const validateImageFile = (asset) => {
    if (asset?.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert("File too large", "File size must be less than 5MB");
      return false;
    }
    return true;
  };

  // ── Cover Photo — pick from library ─────────────────────
  const handleCoverFileSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!validateImageFile(asset)) return;

    setIsUploadingCover(true);
    const photoData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
    setCoverPreview(photoData);
    setIsUploadingCover(false);
    if (onCoverChange) onCoverChange(photoData);
  };

  // ── Cover Photo — take with camera ──────────────────────
  const handleCoverCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera access is needed to take a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!validateImageFile(asset)) return;

    setIsUploadingCover(true);
    const photoData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
    setCoverPreview(photoData);
    setIsUploadingCover(false);
    if (onCoverChange) onCoverChange(photoData);
  };

  // ── Cover Photo — remove ─────────────────────────────────
  const handleRemoveCover = () => {
    setCoverPreview("");
    if (onCoverChange) onCoverChange("");
  };

  // ── Profile Photo — pick from library ───────────────────
  const handleProfileFileSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!validateImageFile(asset)) return;

    setIsUploadingProfile(true);
    const photoData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
    setProfilePreview(photoData);
    setIsUploadingProfile(false);
    if (onProfileChange) onProfileChange(photoData);
  };

  // ── Profile Photo — take with camera ────────────────────
  const handleProfileCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera access is needed to take a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!validateImageFile(asset)) return;

    setIsUploadingProfile(true);
    const photoData = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
    setProfilePreview(photoData);
    setIsUploadingProfile(false);
    if (onProfileChange) onProfileChange(photoData);
  };

  // ── Profile Photo — remove ───────────────────────────────
  const handleRemoveProfile = () => {
    setProfilePreview("");
    if (onProfileChange) onProfileChange("");
  };

  return (
    <View
      style={{
        borderRadius: 12,
        padding: 16,
        backgroundColor: isDarkMode ? "#1f2937" : "#fff",
        borderWidth: 1,
        borderColor: isDarkMode ? "#374151" : "#f3f4f6",
        top: 10,
      }}
    >
      {/* ── Section Header — matches: <div className='flex items-center justify-between mb-4'> */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: isDarkMode ? "#f9fafb" : "#111827",
          }}
        >
          Profile Photos
        </Text>
        <Icon
          name="Image"
          size={20}
          color={isDarkMode ? "#60A5FA" : "#3B82F6"}
        />
      </View>

      <View style={{ gap: 32 }}>
        {/* ══ COVER PHOTO ══════════════════════════════════ */}
        <View style={{ gap: 16 }}>
          {/* Label row — matches: <div className='flex items-center justify-between'> */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: isDarkMode ? "#f9fafb" : "#111827",
              }}
            >
              Cover Photo
            </Text>
            {/* "Optional" badge */}
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: isDarkMode
                  ? "rgba(59,130,246,0.2)"
                  : "rgba(59,130,246,0.1)",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: isDarkMode ? "#60A5FA" : "#3B82F6",
                }}
              >
                Optional
              </Text>
            </View>
          </View>

          {/* Cover preview — matches: <div className='relative w-full h-48 ...'> */}
          <View
            style={{
              width: "100%",
              height: 192,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {coverPreview ? (
              <Image
                source={{ uri: getCoverPhotoUrl(coverPreview) }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              // Empty state — matches: <div className='w-full h-full flex flex-col items-center justify-center'>
              <View style={{ alignItems: "center", gap: 8 }}>
                <Icon
                  name="ImagePlus"
                  size={48}
                  color={isDarkMode ? "#6b7280" : "#9ca3af"}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: isDarkMode ? "#6b7280" : "#9ca3af",
                  }}
                >
                  No cover photo uploaded
                </Text>
              </View>
            )}
          </View>

          {/* Cover action buttons — matches: <div className='flex flex-col sm:flex-row gap-3'> */}
          <View style={{ gap: 10 }}>
            {/* Upload / Change Cover button */}
            <Pressable
              onPress={handleCoverFileSelect}
              disabled={isUploadingCover}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 11,
                borderRadius: 15,
                borderWidth: 1.5,
                borderColor: "#FF9933",
                backgroundColor: "#ffff",
                opacity: isUploadingCover ? 0.6 : 1,
              }}
            >
              <Icon name="Upload" size={16} color="#FF9933" />
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#FF9933" }}
              >
                {isUploadingCover
                  ? "Uploading..."
                  : coverPreview
                    ? "Change Cover Photo"
                    : "Upload Cover Photo"}
              </Text>
            </Pressable>

            {/* Take Photo button */}
            <Pressable
              onPress={handleCoverCamera}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 11,
                borderRadius: 10,
                backgroundColor: "transparent",
              }}
            ></Pressable>

            {/* Remove Cover — only shows when cover exists */}
            {coverPreview ? (
              <Pressable
                onPress={handleRemoveCover}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 11,
                  borderRadius: 10,
                  backgroundColor: "transparent",
                }}
              >
                <Icon
                  name="X"
                  size={16}
                  color={isDarkMode ? "#9ca3af" : "#6b7280"}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: isDarkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Remove Cover
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* ══ PROFILE PHOTO ════════════════════════════════ */}
        <View style={{ gap: 16 }}>
          {/* Label row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: isDarkMode ? "#f9fafb" : "#111827",
              }}
            >
              Profile Photo
            </Text>
            {/* "Recommended" badge */}
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: isDarkMode
                  ? "rgba(59,130,246,0.2)"
                  : "rgba(59,130,246,0.1)",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: isDarkMode ? "#60A5FA" : "#3B82F6",
                }}
              >
                Recommended
              </Text>
            </View>
          </View>

          {/* Profile photo + actions row — matches: <div className='flex flex-col md:flex-row items-start md:items-center gap-6'> */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            {/* Profile photo circle — matches: w-32 h-32 rounded-full */}
            <View style={{ flexShrink: 0 }}>
              <View
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                  overflow: "hidden",
                  borderWidth: 4,
                  borderColor: isDarkMode ? "#1f2937" : "#fff",
                  backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {profilePreview ? (
                  <Image
                    source={{ uri: getProfilePhotoUrl(profilePreview) }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  // Empty state — matches: <Icon name='User' size={64} />
                  <Icon
                    name="User"
                    size={64}
                    color={isDarkMode ? "#6b7280" : "#9ca3af"}
                  />
                )}
              </View>
            </View>

            {/* Profile photo action buttons — matches: <div className='flex-1 space-y-4'> */}
            <View style={{ flex: 1, gap: 10 }}>
              {/* Upload / Change Profile Photo button */}
              <Pressable
                onPress={handleProfileFileSelect}
                disabled={isUploadingProfile}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 11,
                  borderRadius: 15,
                  backgroundColor: "#FF9933",
                  opacity: isUploadingProfile ? 0.6 : 1,
                }}
              >
                <Icon name="Upload" size={16} color="#fff" />
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}
                >
                  {isUploadingProfile
                    ? "Uploading..."
                    : profilePreview
                      ? "Change Photo"
                      : "Upload Photo"}
                </Text>
              </Pressable>

              {/* Remove Profile Photo — only shows when profile exists */}
              {profilePreview ? (
                <Pressable
                  onPress={handleRemoveProfile}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingVertical: 11,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                    backgroundColor: "transparent",
                  }}
                >
                  <Icon
                    name="Trash2"
                    size={16}
                    color={isDarkMode ? "#f9fafb" : "#374151"}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: isDarkMode ? "#f9fafb" : "#374151",
                    }}
                  >
                    Remove Photo
                  </Text>
                </Pressable>
              ) : null}

              {/* Take a Photo button — matches: <Button variant='ghost'> Take a Photo */}
              <Pressable
                onPress={handleProfileCamera}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 11,
                  borderRadius: 10,
                  backgroundColor: "transparent",
                }}
              >
                <Icon name="Camera" size={16} color="#FF9933" />
                <Text
                  style={{ fontSize: 14, fontWeight: "500", color: "#FF9933" }}
                >
                  Take a Photo
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Helper text — matches: <p className='text-xs md:text-sm'> */}
          <Text
            style={{
              fontSize: 12,
              color: isDarkMode ? "#9ca3af" : "#6b7280",
              lineHeight: 18,
            }}
          >
            Use a clear photo of yourself. This helps other travelers recognize
            you and builds trust in the community.
          </Text>
        </View>

        {/* Guidelines — commented out, kept as comment to match original */}
        {/* <View style={{ borderRadius: 8, padding: 12, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
          ...Photo Guidelines...
        </View> */}
      </View>
    </View>
  );
};

export default CoverPhotoSection;
