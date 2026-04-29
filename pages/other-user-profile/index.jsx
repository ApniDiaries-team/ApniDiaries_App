import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import ProfileQuickActionsModal from "@/components/ui/ProfileQuickActionsModal";
import Icon from "../../components/AppIcon";
import PostCard, { AudioManager } from "./components/PostCard";
import ProfileHeader from "./components/ProfileHeader";
import ShareProfileModal from "./components/ShareProfileModal";

import {
  followUser,
  getUserDetails,
  getUserPosts,
  unFollowUser,
} from "../../services/user.api";

import { useDarkMode } from "../../context/DarkModeContext";

const OtherUserProfile = () => {
  const { theme } = useDarkMode();
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params?.userId;

  // ✅ Stop all audio when leaving this profile page
  useFocusEffect(
    useCallback(() => {
      return () => {
        AudioManager.pauseAll();
      };
    }, [])
  );

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const [activeTab, setActiveTab] = useState("posts");

  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [canViewProfile, setCanViewProfile] = useState(true);

  const getUserDetail = async () => {
    try {
      const res = await getUserDetails(userId);

      if (res?.data?.data) {
        const data = res.data.data;

        const visibility = data?.user?.profile_visibility;
        const isFriendAccepted = data?.friendStatus === "accepted";

        const canView =
          visibility === "public" ||
          (visibility === "friends" && isFriendAccepted);

        setCanViewProfile(canView);
        setUserData(data);

        setIsFollowing(data?.isFollowing || false);
        setIsFriend(data?.friendStatus === "accepted");
      }
    } catch (error) {
      console.log("error in getting user detail", error);
    } finally {
      setLoading(false);
    }
  };

  const getPosts = async (page = 1) => {
    if (!userId) return;

    try {
      const res = await getUserPosts(userId, page);
      setPosts(res?.data?.posts || []);
    } catch (error) {
      console.log("error in getting the posts feed", error);
    }
  };

  const handleFollowToggle = async () => {
    setIsFollowing(!isFollowing);
    try {
      if (!isFollowing) {
        await followUser(userId);
      } else {
        await unFollowUser(userId);
      }
    } catch (error) {
      console.log(error);
      setIsFollowing(isFollowing);
    }
  };

  const handleFriendToggle = async () => {
    setIsFriend(!isFriend);
  };

  const handleMessageClick = () =>
    router.push({
      pathname: "/chat-interface",
      params: {
        userId: userData?.user?.id,
        userName: userData?.user?.name,
        threadId: null,
        contact: JSON.stringify(userData?.user),
      },
    });

  const handleShareProfile = () => {
    setShowShareModal(true);
  };

  const handleMoreActions = () => {
    setShowQuickActions(true);
  };

  const handleQuickAction = (type) => {
    switch (type) {
      case "message":
        handleMessageClick();
        break;
      case "follow":
        handleFollowToggle();
        break;
      case "friend":
        handleFriendToggle();
        break;
      case "block":
        console.log("block user");
        break;
      default:
        break;
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  useEffect(() => {
    if (userId) {
      getUserDetail();
      getPosts();
    }
  }, [userId]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.bgPrimary,
        }}
      >
        <ActivityIndicator size="large" color="#FF9933" />
      </View>
    );
  }

  const joinedDate = userData?.user?.created_at
    ? new Date(userData.user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      {/* STICKY HEADER */}
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.bgCard,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            padding: 8,
            borderRadius: 8,
            backgroundColor: pressed ? theme.bgSecondary : "transparent",
          })}
          accessibilityLabel="Go back"
        >
          <Icon name="ArrowLeft" size={24} color={theme.textSecondary} />
        </Pressable>

        <Text
          numberOfLines={1}
          style={{
            fontSize: 18,
            fontFamily: "PlayfairDisplay_700Bold",
            color: theme.textPrimary,
            maxWidth: 200,
          }}
        >
          {userData?.user?.name}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE HEADER COMPONENT */}
        <ProfileHeader
          userData={userData}
          isFollowing={isFollowing}
          isFriend={isFriend}
          onFollowToggle={handleFollowToggle}
          onFriendToggle={handleFriendToggle}
          onMessageClick={handleMessageClick}
          onShareProfile={handleShareProfile}
          onMoreActions={handleMoreActions}
          canViewProfile={canViewProfile}
        />

        {!canViewProfile ? (
          /* PRIVATE PROFILE LOCK */
          <View style={{ paddingHorizontal: 16, paddingVertical: 40 }}>
            <View
              style={{
                backgroundColor: theme.bgCard,
                borderRadius: 12,
                padding: 32,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Icon name="Lock" size={28} color="#FF9933" />

              <Text
                style={{
                  marginTop: 16,
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.textPrimary,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                This profile is private
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Add Friend this user to see their posts.
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* TABS */}
            <View
              style={{
                marginTop: 24,
                flexDirection: "row",
                borderBottomWidth: 1,
                borderColor: theme.border,
                paddingHorizontal: 16,
                justifyContent: "center",
              }}
            >
              {[
                {
                  key: "posts",
                  label: `Posts (${userData?.stats?.totalPosts || 0})`,
                },
                { key: "about", label: "About" },
              ].map((tab) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: 2,
                    borderBottomColor:
                      activeTab === tab.key ? "#FF9933" : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color:
                        activeTab === tab.key
                          ? theme.textPrimary
                          : theme.textSecondary,
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* TAB CONTENT */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
              {/* POSTS TAB */}
              {activeTab === "posts" && (
                <View style={{ gap: 16 }}>
                  {posts?.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post?.id}
                        post={post}
                        onPostDeleted={handlePostDeleted}
                      />
                    ))
                  ) : (
                    <Text
                      style={{
                        textAlign: "center",
                        color: theme.textSecondary,
                        paddingVertical: 32,
                      }}
                    >
                      No posts yet.
                    </Text>
                  )}
                </View>
              )}

              {/* ABOUT TAB */}
              {activeTab === "about" && (
                <View style={{ gap: 24 }}>
                  {/* BIO CARD */}
                  {userData?.user?.bio && (
                    <View
                      style={{
                        backgroundColor: theme.bgCard,
                        borderRadius: 12,
                        padding: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 12,
                        }}
                      >
                        <Icon name="User" size={20} color="#FF9933" />
                        <Text
                          style={{
                            fontSize: 18,
                            fontFamily: "PlayfairDisplay_700Bold",
                            color: theme.textPrimary,
                          }}
                        >
                          About
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.textPrimary,
                          lineHeight: 22,
                        }}
                      >
                        {userData.user.bio}
                      </Text>
                    </View>
                  )}

                  {/* PERSONAL INFO CARD */}
                  <View
                    style={{
                      backgroundColor: theme.bgCard,
                      borderRadius: 12,
                      padding: 20,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <Icon name="Info" size={20} color="#FF9933" />
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: "PlayfairDisplay_700Bold",
                          color: theme.textPrimary,
                        }}
                      >
                        Personal Info
                      </Text>
                    </View>

                    <View style={{ gap: 16 }}>
                      {userData?.user?.current_city && (
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "flex-start",
                          }}
                        >
                          <Icon
                            name="MapPin"
                            size={20}
                            color={theme.textSecondary}
                          />
                          <View>
                            <Text
                              style={{
                                fontSize: 12,
                                color: theme.textSecondary,
                                marginBottom: 2,
                              }}
                            >
                              Current City
                            </Text>
                            <Text
                              style={{
                                color: theme.textPrimary,
                                fontWeight: "500",
                              }}
                            >
                              {userData.user.current_city}
                            </Text>
                          </View>
                        </View>
                      )}

                      {joinedDate && (
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "flex-start",
                          }}
                        >
                          <Icon
                            name="Calendar"
                            size={20}
                            color={theme.textSecondary}
                          />
                          <View>
                            <Text
                              style={{
                                fontSize: 12,
                                color: theme.textSecondary,
                                marginBottom: 2,
                              }}
                            >
                              Joined
                            </Text>
                            <Text
                              style={{
                                color: theme.textPrimary,
                                fontWeight: "500",
                              }}
                            >
                              {joinedDate}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* INTERESTS & LANGUAGES CARD */}
                  {(userData?.user?.interest?.length > 0 ||
                    userData?.user?.languages?.length > 0) && (
                    <View
                      style={{
                        backgroundColor: theme.bgCard,
                        borderRadius: 12,
                        padding: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 12,
                        }}
                      >
                        <Icon name="Heart" size={20} color="#FF9933" />
                        <Text
                          style={{
                            fontSize: 18,
                            fontFamily: "PlayfairDisplay_700Bold",
                            color: theme.textPrimary,
                          }}
                        >
                          Interests & Languages
                        </Text>
                      </View>

                      <View style={{ gap: 12 }}>
                        {userData?.user?.interest?.length > 0 && (
                          <View>
                            <Text
                              style={{
                                fontSize: 12,
                                color: theme.textSecondary,
                                marginBottom: 8,
                              }}
                            >
                              Interests
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                              }}
                            >
                              {userData.user.interest.map((interest, idx) => (
                                <View
                                  key={idx}
                                  style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    backgroundColor: "rgba(255,153,51,0.15)",
                                    borderRadius: 999,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#FF9933",
                                      fontSize: 12,
                                      fontWeight: "500",
                                    }}
                                  >
                                    {interest}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        {userData?.user?.languages?.length > 0 && (
                          <View>
                            <Text
                              style={{
                                fontSize: 12,
                                color: theme.textSecondary,
                                marginBottom: 8,
                              }}
                            >
                              Languages
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                              }}
                            >
                              {userData.user.languages.map((lang, idx) => (
                                <View
                                  key={idx}
                                  style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    backgroundColor: theme.bgSecondary,
                                    borderRadius: 999,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: theme.textPrimary,
                                      fontSize: 12,
                                    }}
                                  >
                                    {lang}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* TRAVEL PREFERENCES CARD */}
                  <View
                    style={{
                      backgroundColor: theme.bgCard,
                      borderRadius: 12,
                      padding: 20,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <Icon name="Compass" size={20} color="#FF9933" />
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: "PlayfairDisplay_700Bold",
                          color: theme.textPrimary,
                        }}
                      >
                        Travel Preferences
                      </Text>
                    </View>

                    <View style={{ gap: 12 }}>
                      {userData?.user?.travel_style && (
                        <View>
                          <Text
                            style={{
                              fontSize: 12,
                              color: theme.textSecondary,
                              marginBottom: 2,
                            }}
                          >
                            Travel Style
                          </Text>
                          <Text
                            style={{
                              color: theme.textPrimary,
                              fontWeight: "500",
                              textTransform: "capitalize",
                            }}
                          >
                            {userData.user.travel_style}
                          </Text>
                        </View>
                      )}

                      {userData?.stats?.destinationsVisited?.length > 0 && (
                        <View>
                          <Text
                            style={{
                              fontSize: 12,
                              color: theme.textSecondary,
                              marginBottom: 8,
                            }}
                          >
                            Destinations Visited
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            {userData.stats.destinationsVisited.map(
                              (dest, idx) => (
                                <View
                                  key={idx}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 4,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    backgroundColor: "rgba(255,153,51,0.15)",
                                    borderRadius: 999,
                                  }}
                                >
                                  <Icon
                                    name="MapPin"
                                    size={14}
                                    color="#FF9933"
                                  />
                                  <Text
                                    style={{
                                      color: "#FF9933",
                                      fontSize: 12,
                                      fontWeight: "500",
                                    }}
                                  >
                                    {dest}
                                  </Text>
                                </View>
                              ),
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* STATS CARD */}
                  <View
                    style={{
                      backgroundColor: theme.bgCard,
                      borderRadius: 12,
                      padding: 20,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <Icon name="BarChart2" size={20} color="#FF9933" />
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: "PlayfairDisplay_700Bold",
                          color: theme.textPrimary,
                        }}
                      >
                        Stats
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {[
                        {
                          label: "Posts",
                          value: userData?.stats?.totalPosts || 0,
                        },
                        {
                          label: "Followers",
                          value: userData?.stats?.followers || 0,
                        },
                        {
                          label: "Following",
                          value: userData?.stats?.following || 0,
                        },
                        {
                          label: "Friends",
                          value: userData?.stats?.friends || 0,
                        },
                      ].map((stat) => (
                        <View
                          key={stat.label}
                          style={{
                            flex: 1,
                            minWidth: "22%",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 24,
                              fontWeight: "700",
                              color: theme.textPrimary,
                            }}
                          >
                            {stat.value}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: theme.textSecondary,
                              marginTop: 2,
                            }}
                          >
                            {stat.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* MODALS */}
      <ProfileQuickActionsModal
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        userData={{
          ...userData?.user,
          ...userData,
          name: userData?.user?.name,
          username: userData?.user?.username,
          avatar: userData?.user?.profile_photo,
          currentCity: userData?.user?.current_city,
          isFollowing,
          isFriend,
        }}
        onAction={handleQuickAction}
      />

      <ShareProfileModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        userData={userData?.user}
      />
    </View>
  );
};

export default OtherUserProfile;
