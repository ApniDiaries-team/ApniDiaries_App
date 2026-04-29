import { useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import { getFeed } from '../../../services/posts.api'
import PostCard from './PostCard'

const SkeletonCard = () => (
  <View className="rounded-xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mb-4 shadow-sm opacity-60">
    <View className="flex-row items-start gap-4 mb-4">
      <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <View className="flex-1">
        <View className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mb-2 animate-pulse" />
        <View className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
      </View>
    </View>
    <View className="gap-3 mb-5">
      <View className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse" />
      <View className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/5 animate-pulse" />
    </View>
    <View className="flex-row items-center gap-6 pt-3 border-t border-slate-50 dark:border-slate-800">
      <View className="h-8 bg-slate-100 dark:bg-slate-800 rounded-full w-20 animate-pulse" />
      <View className="h-8 bg-slate-100 dark:bg-slate-800 rounded-full w-20 animate-pulse" />
    </View>
  </View>
)

const PostsFeed = ({ selectedCity, searchQuery }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const normalizeCityName = (cityName) => {
    if (!cityName) return ''
    return cityName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '')
      .replace('ladakh', 'leh')
      .replace('andamanandnicobar', 'andaman')
  }

  const doesCityMatch = (postCity, selectedCity) => {
    if (!selectedCity || selectedCity === "all") return true
    if (!postCity) return false

    const nPost = normalizeCityName(postCity)
    const nSel = normalizeCityName(selectedCity)

    if (nPost === nSel || nPost.includes(nSel) || nSel.includes(nPost)) return true

    const specialCases = {
      leh: ['ladakh', 'leh-ladakh', 'leh ladakh'],
      goa: ['goa', 'goa beach'],
      manali: ['manali', 'solang', 'kullu manali'],
      varanasi: ['varanasi', 'kashi', 'banaras'],
      rishikesh: ['rishikesh', 'harki pauri', 'shivpuri'],
      jaipur: ['jaipur', 'pink city', 'jaipur city'],
    }

    for (const [key, variations] of Object.entries(specialCases)) {
      if (nSel.includes(key) || key.includes(nSel)) {
        if (variations.some((v) => nPost.includes(v) || v.includes(nPost))) return true
      }
    }
    return false
  }

  const getPostFeed = async (p = 1) => {
    try {
      setLoading(true)
      const res = await getFeed(p)
      if (p === 1) {
        setPosts(res?.data?.posts || [])
      } else {
        setPosts((prev) => [...prev, ...(res?.data?.posts || [])])
      }
      setHasMore(res?.data?.hasMore)
    } catch (error) {
      console.log('error in getting posts feed', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = (postsArray) => {
    let filtered = postsArray
    if (selectedCity && selectedCity !== 'all') {
      filtered = filtered?.filter((post) => doesCityMatch(post?.city || post?.destination, selectedCity))
    }
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered?.filter(
        (post) =>
          post?.content?.toLowerCase().includes(query) ||
          post?.user?.name?.toLowerCase().includes(query) ||
          (post?.city || post?.destination)?.toLowerCase().includes(query) ||
          post?.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    return filtered
  }

  useEffect(() => {
    setPage(1)
    getPostFeed(1)
  }, [selectedCity, searchQuery])

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      getPostFeed(nextPage)
    }
  }

  const filteredPosts = filterPosts(posts)

  if (loading && filteredPosts.length === 0 && page === 1) {
    return (
      <View>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    )
  }

  if (filteredPosts.length === 0) {
    return (
      <View
        className="items-center justify-center py-16 rounded-[32px] border-[1.2px] bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-100 shadow-sm"
      >
        <View className="mb-6 opacity-80">
          <Icon name="Compass" size={56} color="#FF9933" />
        </View>

        <Text className="text-2xl font-playfair-bold text-slate-900 dark:text-slate-100 mb-3 text-center">
          {selectedCity === 'all' ? 'No Travel Stories Yet' : `No Stories from ${selectedCity} Yet`}
        </Text>

        <Text className="text-base font-poppins-regular text-slate-500 dark:text-slate-400 text-center px-10 leading-relaxed max-w-xs">
          {selectedCity === 'all'
            ? 'Be the first to share your travel experience and inspire others!'
            : `Be the first to share your adventures from ${selectedCity}!`}
        </Text>
      </View>
    )
  }

  return (
    <View>
      {searchQuery !== '' && (
        <View className="flex-row items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mb-4 shadow-sm">
          <Icon name="Search" size={18} color="#FF9933" />
          <Text className="text-sm text-slate-700 dark:text-slate-300">
            Results for{' '}
            <Text className="font-semibold" style={{ color: '#FF9933' }}>
              "{searchQuery}"
            </Text>
            {selectedCity !== 'all' ? ` in ${selectedCity}` : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => <PostCard post={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        scrollEnabled={false}
        ListFooterComponent={
          loading ? (
            <View className="py-6 flex-row items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl mb-4">
              <View className="w-2 h-2 rounded-full bg-[#FF9933] animate-pulse" />
              <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading more stories...</Text>
            </View>
          ) : !hasMore && filteredPosts.length > 0 ? (
            <View className="py-8 flex-row items-center justify-center gap-2">
              <Icon name="CheckCircle" size={18} color="#FF9933" />
              <Text className="text-sm font-medium text-slate-400 dark:text-slate-500">You've reached the end of the feed</Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

export default PostsFeed
