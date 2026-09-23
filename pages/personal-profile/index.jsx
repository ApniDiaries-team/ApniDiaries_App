import { useScroll } from "@/context/ScrollContext";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import Icon from "../../components/AppIcon";
import ConnectionStatusBar from "../../components/ui/ConnectionStatusBar";
import { AppContext } from "../../context/AppContext";
import { useDarkMode } from "../../context/DarkModeContext";
import { deletePost } from "../../services/posts.api";
import { getPersonalDetails, getUserPosts } from "../../services/user.api";
import AboutSection from "./components/AboutSection";
import CoverPhotoSection from "./components/CoverPhotoSection";
import PostsSection from "./components/PostsSection";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import ShareProfileModal from "./components/ShareProfileModal";
import TravelStatsSection from "./components/TravelStatsSection";
import { AudioManager } from "./components/PostCard";

const showToast = (message) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

const PersonalProfile = () => {
  const router = useRouter();
  const { user } = useContext(AppContext);
  const { isDarkMode } = useDarkMode();

  const [activeTab, setActiveTab] = useState("posts");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleScroll } = useScroll();

  const colors = {
    background: isDarkMode ? "#0B0E14" : "#ffff", // Matched Premium branding from SearchUser
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    border: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)",
  };

  const [travelStats] = useState({
    citiesVisited: 47,
    countriesExplored: 3,
    travelDays: 156,
    travelBuddies: 89,
    recentDestinations: [
      { city: "Rishikesh", country: "India", visitDate: "2026-01-28" },
      { city: "Jaipur", country: "India", visitDate: "2026-01-26" },
      { city: "Goa", country: "India", visitDate: "2026-01-24" },
      { city: "Udaipur", country: "India", visitDate: "2026-01-20" },
      { city: "Manali", country: "India", visitDate: "2026-01-15" },
    ],
    achievements: [
      { title: "Mountain Explorer", description: "Visited 10+ hill stations" },
      { title: "Beach Lover", description: "Explored 15+ beaches" },
      {
        title: "Culture Enthusiast",
        description: "Visited 20+ heritage sites",
      },
      { title: "Foodie Traveler", description: "Tried 50+ local cuisines" },
    ],
  });

  const getUserDetail = async () => {
    try {
      setIsLoading(true);
      const res = await getPersonalDetails();
      if (res?.data?.success) {
        const data = res?.data?.data;
        if (data?.user) {
          // Merge top-level fields into user object for component consistency
          data.user.city = data.city || data.user.current_city;
          data.user.phone = data.mobile_number || data.user.phone;
        }
        setProfileData(data);
        await getPosts(data?.user?.id);
      }
    } catch (error) {
      console.log("error in getting user detail", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPosts = async (id) => {
    if (!id) return;
    try {
      const res = await getUserPosts(id);
      setPosts(res?.data?.posts || []);
    } catch (error) {
      console.log("error in getting the posts feed", error);
    }
  };

  const handlePostDelete = async (id) => {
    if (!id) return;
    try {
      const res = await deletePost(id);
      if (res?.data) {
        showToast("Post deleted");
        getPosts(user?.id);
      }
    } catch (error) {
      console.log("error in delete post", error);
    }
  };

  const handleCoverPhotoChange = (newPhoto) => {
    setProfileData((prev) => ({ ...prev, coverPhoto: newPhoto }));
  };

  const handleEditProfile = () => {
    router.push("/edit-personal-details");
  };

  const handleShareProfile = () => {
    setIsShareModalOpen(true);
  };

  const handleComment = (postId, comment) => {
    console.log("Comment on post:", postId, comment);
  };

  const handleFollowersClick = () => {
    console.log("Navigate to followers list");
  };

  const handleFollowingClick = () => {
    console.log("Navigate to following list");
  };

  const handleBackClick = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/chat-list");
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserDetail();
      return () => {
        // ✅ Stop all audio when leaving this profile page
        AudioManager.pauseAll();
      };
    }, [])
  );

  const profileUrl = `https://apnidiaries.com/profile/${profileData?.user?.name
    ?.toLowerCase()
    ?.replace(/\s+/g, "-")}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ConnectionStatusBar visible={true} />

      {/* Sub-header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          height: 60,
          backgroundColor: isDarkMode ? "#1E242F" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          elevation: 2,
        }}
      >
        <Pressable
          onPress={handleBackClick}
          style={({ pressed }) => ({
            padding: 8,
            borderRadius: 12,
            backgroundColor: pressed
              ? isDarkMode
                ? "#2D3748"
                : "#F1F5F9"
              : "transparent",
          })}
        >
          <Icon name="ArrowLeft" size={24} color={colors.textPrimary} />
        </Pressable>

        <Text
          style={{
            fontSize: 18,
            fontFamily: "PlayfairDisplay_700Bold",
            color: colors.textPrimary,
          }}
        >
          My Profile
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ pb: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <CoverPhotoSection
          coverPhoto={profileData?.user?.cover_photo}
          onCoverPhotoChange={handleCoverPhotoChange}
          isEditing={true}
        />

        {isLoading ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 64,
            }}
          >
            <ActivityIndicator size="large" color="#FF9933" />
          </View>
        ) : (
          <>
            <ProfileHeader
              profileData={profileData}
              onEditProfile={handleEditProfile}
              onShareProfile={handleShareProfile}
              onFollowersClick={handleFollowersClick}
              onFollowingClick={handleFollowingClick}
            />

            <View style={{ marginTop: 24 }}>
              <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                postCount={profileData?.stats?.totalPosts}
              />

              <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
                {activeTab === "posts" && (
                  <PostsSection
                    posts={posts}
                    onComment={handleComment}
                    onDeletePost={handlePostDelete}
                  />
                )}
                {activeTab === "about" && (
                  <AboutSection userData={profileData?.user} />
                )}
                {activeTab === "stats" && (
                  <TravelStatsSection stats={travelStats} />
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profileUrl={profileUrl}
        userName={profileData?.user?.name}
      />
    </View>
  );
};

export default PersonalProfile;
