import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getFeed, toggleLike } from "../../../services/posts.api";

const filterOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "trending", label: "Trending" },
];

const CommunityPostsTab = ({ cityName, onCreatePost }) => {
  const { isDarkMode } = useDarkMode();
  const [selectedFilter, setSelectedFilter] = useState("recent");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bg = isDarkMode ? "#1f2937" : "#fff";
  const border = isDarkMode ? "#374151" : "#e5e7eb";
  const textPrimary = isDarkMode ? "#f9fafb" : "#111827";
  const textSecondary = isDarkMode ? "#9ca3af" : "#6b7280";
  const bgSecondary = isDarkMode ? "#374151" : "#f3f4f6";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getFeed(1);
        let postsData = response.data;
        if (
          postsData &&
          typeof postsData === "object" &&
          Array.isArray(postsData.posts)
        ) {
          postsData = postsData.posts;
        } else if (!Array.isArray(postsData)) {
          postsData = [];
        }
        const transformed = postsData.map((post) => ({
          id: post.id,
          author: post.user?.name || "Anonymous",
          authorAvatar: post.user?.avatar || null,
          timestamp: post.createdAt
            ? new Date(post.createdAt).toLocaleString()
            : "",
          content: post.content || "",
          image: post.media_urls?.[0] || null,
          likes: post.likes || 0,
          comments: post.comments || 0,
          shares: post.shares || 0,
          isLiked: post.isLiked || false,
          isSaved: false,
          destination: post.destination || "",
        }));
        setPosts(transformed);
        setError(null);
      } catch (err) {
        setError("Unable to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const cityPosts = posts.filter(
    (p) => p.destination?.toLowerCase() === cityName?.toLowerCase(),
  );

  const handleLike = useCallback(
    async (postId) => {
      const idx = posts.findIndex((p) => p.id === postId);
      if (idx === -1) return;
      const prev = [...posts];
      const updated = [...posts];
      updated[idx] = {
        ...updated[idx],
        isLiked: !updated[idx].isLiked,
        likes: updated[idx].isLiked
          ? updated[idx].likes - 1
          : updated[idx].likes + 1,
      };
      setPosts(updated);
      try {
        await toggleLike(postId);
      } catch {
        setPosts(prev);
      }
    },
    [posts],
  );

  const handleSave = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post,
      ),
    );
  };

  const getSortedPosts = () => {
    const s = [...cityPosts];
    if (selectedFilter === "popular") {
      s.sort((a, b) => b.likes - a.likes);
    } else if (selectedFilter === "trending") {
      s.sort((a, b) => b.likes + b.comments - (a.likes + a.comments));
    } else {
      // matches web 'recent' — sort by timestamp newest first
      s.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    return s;
  };

  // ── Loading — matches web: spinner + "Loading posts..." text ──
  if (loading) {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 48,
        }}
      >
        {/* matches web: animate-spin border-b-2 border-blue-500 */}
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginLeft: 12, fontSize: 14, color: textSecondary }}>
          Loading posts...
        </Text>
      </View>
    );
  }

  // ── Error — matches web: text-red-500 + Retry ──
  if (error) {
    return (
      <View style={{ alignItems: "center", paddingVertical: 48 }}>
        <Text style={{ color: "#ef4444", marginBottom: 16 }}>{error}</Text>
        <Pressable
          onPress={() => {
            setError(null);
            setLoading(true);
          }}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: border,
            backgroundColor: "transparent",
          }}
        >
          <Text style={{ fontSize: 14, color: textPrimary }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      {/* ── Header — matches web: flex justify-between items-center gap-3 ── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* Filter pills — RN equivalent of web's Select dropdown */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            {filterOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setSelectedFilter(opt.value)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  backgroundColor:
                    selectedFilter === opt.value ? "#FF9933" : "transparent",
                  borderColor:
                    selectedFilter === opt.value ? "#FF9933" : border,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color:
                      selectedFilter === opt.value ? "#fff" : textSecondary,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* matches web: Button variant='default' iconName='Plus' "Create Post" */}
        <Pressable
          onPress={onCreatePost}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: "#FF9933",
          }}
        >
          <Icon name="Plus" size={16} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
            Create Post
          </Text>
        </Pressable>
      </View>

      {/* ── Posts ── */}
      <View style={{ gap: 16 }}>
        {cityPosts.length === 0 ? (
          // matches web: bg-[var(--color-bg-card)] rounded-xl p-8 text-center border border-[var(--color-border)]
          <View
            style={{
              backgroundColor: bg,
              borderRadius: 12,
              padding: 32,
              alignItems: "center",
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <Icon
              name="MessageCircle"
              size={48}
              color={textSecondary}
              style={{ opacity: 0.5, marginBottom: 16 }}
            />
            {/* matches web: text-lg font-semibold text-[var(--color-text-primary)] mb-2 */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: textPrimary,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No posts from {cityName} yet
            </Text>
            {/* matches web: text-[var(--color-text-secondary)] mb-4 */}
            <Text
              style={{
                fontSize: 14,
                color: textSecondary,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Be the first to share your experience!
            </Text>
            <Pressable
              onPress={onCreatePost}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: "#FF9933",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                Create a Post
              </Text>
            </Pressable>
          </View>
        ) : (
          getSortedPosts().map((post) => (
            // matches web: bg-[var(--color-bg-card)] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-[var(--color-border)]
            <View
              key={post.id}
              style={{
                backgroundColor: bg,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              {/* Author Info — matches web: flex items-start gap-3 mb-4 */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {post.authorAvatar ? (
                  // matches web: w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[var(--color-bg-card)]
                  <Image
                    source={{ uri: post.authorAvatar }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      borderWidth: 2,
                      borderColor: bg,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: bgSecondary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="User" size={18} color={textSecondary} />
                  </View>
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  {/* matches web: text-sm md:text-base font-semibold text-[var(--color-text-primary)] */}
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: textPrimary,
                    }}
                  >
                    {post.author}
                  </Text>
                  {/* matches web: text-xs md:text-sm text-[var(--color-text-secondary)] */}
                  <Text
                    style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}
                  >
                    {post.timestamp}
                  </Text>
                </View>
                <Pressable style={{ padding: 4 }}>
                  <Icon name="MoreVertical" size={18} color={textSecondary} />
                </Pressable>
              </View>

              {/* Post Content — matches web: text-sm md:text-base text-[var(--color-text-primary)] mb-4 leading-relaxed */}
              <Text
                style={{
                  fontSize: 14,
                  color: textPrimary,
                  marginBottom: 16,
                  lineHeight: 22,
                }}
              >
                {post.content}
              </Text>

              {/* Post Image — matches web: h-48 md:h-64 lg:h-80 rounded-lg md:rounded-xl border border-[var(--color-border)] */}
              {post.image && (
                <View
                  style={{
                    width: "100%",
                    height: 192,
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: border,
                  }}
                >
                  <Image
                    source={{ uri: post.image }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Actions — matches web: flex items-center justify-between pt-4 border-t border-[var(--color-border)] */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: border,
                }}
              >
                <View style={{ flexDirection: "row", gap: 20 }}>
                  {/* Like — matches web: hover:text-blue-500, blue when liked */}
                  <Pressable
                    onPress={() => handleLike(post.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Icon
                      name="Heart"
                      size={18}
                      color={post.isLiked ? "#3b82f6" : textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: post.isLiked ? "#3b82f6" : textSecondary,
                      }}
                    >
                      {post.likes}
                    </Text>
                  </Pressable>
                  {/* Comment */}
                  <Pressable
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Icon
                      name="MessageCircle"
                      size={18}
                      color={textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: textSecondary,
                      }}
                    >
                      {post.comments}
                    </Text>
                  </Pressable>
                  {/* Share */}
                  <Pressable
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Icon name="Share2" size={18} color={textSecondary} />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: textSecondary,
                      }}
                    >
                      {post.shares}
                    </Text>
                  </Pressable>
                </View>

                {/* Save — matches web: blue when saved */}
                <Pressable
                  onPress={() => handleSave(post.id)}
                  style={{ padding: 4 }}
                >
                  <Icon
                    name="Bookmark"
                    size={18}
                    color={post.isSaved ? "#3b82f6" : textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default CommunityPostsTab;
