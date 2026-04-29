// components/common/SlidingModal.jsx — React Native version
import React, { useContext, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { AppContext } from '../../context/AppContext'
import { getUsersByPostLike } from '../../services/posts.api'
import { followUser, unFollowUser } from '../../services/user.api'
import Icon from '../AppIcon'

const SlidingModal = ({ isOpen, onClose, postId, postTitle = 'Recent Likes' }) => {
  const { user } = useContext(AppContext)
  const myId = user?.id
  const [likedUsers, setLikedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const translateY = useState(new Animated.Value(0))[0]

  // PanResponder for swipe-down-to-close
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
    onPanResponderMove: (_, gs) => {
      if (gs.dy > 0) translateY.setValue(gs.dy)
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dy > 100) {
        onClose()
        translateY.setValue(0)
      } else {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start()
      }
    },
  })

  const fetchUserList = async () => {
    if (!postId) return
    try {
      setLoading(true)
      const res = await getUsersByPostLike(postId)
      if (res?.data?.success) setLikedUsers(res.data.users || [])
    } catch {
      setLikedUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      translateY.setValue(0)
      fetchUserList()
    } else {
      setLikedUsers([])
    }
  }, [isOpen])

  const handleFollowUser = async (userId, followStatus) => {
    try {
      const res = followStatus === 'following'
        ? await unFollowUser(userId)
        : await followUser(userId)
      if (res?.data?.success) {
        setLikedUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, followStatus: followStatus === 'following' ? 'not_following' : 'following' }
              : u
          )
        )
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getFollowLabel = (status) => {
    if (status === 'following') return 'Following'
    if (status === 'follow_back') return 'Follow Back'
    return 'Follow'
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      />

      {/* Sheet */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '85%',
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          transform: [{ translateY }],
        }}
        {...panResponder.panHandlers}
      >
        {/* Drag handle */}
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
          <View style={{ width: 48, height: 6, borderRadius: 3, backgroundColor: '#d1d5db' }} />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pb-3 border-b border-gray-100">
          <Text className="text-lg font-semibold text-gray-900">{postTitle}</Text>
          <Pressable onPress={onClose} className="p-2 rounded-full bg-gray-100">
            <Icon name="X" size={18} color="#374151" />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView style={{ maxHeight: '80%' }}>
          {loading ? (
            <View className="py-16 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : likedUsers.length === 0 ? (
            <View className="py-16 items-center">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Icon name="Heart" size={32} color="#d1d5db" />
              </View>
              <Text className="text-base font-medium text-gray-600">No likes yet</Text>
              <Text className="text-sm text-gray-400 mt-1">Be the first to like this post</Text>
            </View>
          ) : (
            likedUsers.map((u) => (
              <View key={u.id} className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <Image
                  source={{ uri: u.profile_photo }}
                  style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900">{u.username}</Text>
                  <Text className="text-xs text-gray-400">{u.name}</Text>
                </View>
                {u.id === myId ? (
                  <Text className="text-sm text-gray-400 mr-2">You</Text>
                ) : (
                  <Pressable
                    onPress={() => handleFollowUser(u.id, u.followStatus)}
                    style={{ backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>
                      {getFollowLabel(u.followStatus)}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  )
}

export default SlidingModal
