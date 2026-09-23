import { usePathname, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import Icon from '../AppIcon'

const GlobalChatIndicator = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(3)
  const [latestMessage, setLatestMessage] = useState(null)
  const slideAnim = useState(new Animated.Value(0))[0]

  useEffect(() => {
    const interval = setInterval(() => {
      if (pathname !== '/chat-interface' && Math.random() > 0.7) {
        setUnreadCount((p) => p + 1)
        const msg = { sender: 'Sarah', text: 'Hey! Are you free tomorrow?' }
        setLatestMessage(msg)
        Animated.sequence([
          Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.delay(4700),
          Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => setLatestMessage(null))
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [pathname])

  useEffect(() => {
    if (pathname === '/chat-interface') setUnreadCount(0)
  }, [pathname])

  if (pathname === '/chat-interface') return null

  const translateY = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] })

  return (
    <View style={{ position: 'absolute', bottom: 80, right: 16, zIndex: 150 }} pointerEvents="box-none">
      {/* Message preview */}
      {latestMessage && (
        <Animated.View
          style={{
            opacity: slideAnim,
            transform: [{ translateY }],
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
            maxWidth: 240,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="flex-row items-start gap-3">
            <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
              <Icon name="User" size={18} color="#9ca3af" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-800">{latestMessage.sender}</Text>
              <Text className="text-xs text-gray-400" numberOfLines={1}>{latestMessage.text}</Text>
            </View>
            <Pressable onPress={() => setLatestMessage(null)} className="p-1">
              <Icon name="X" size={14} color="#9ca3af" />
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Chat FAB */}
      <Pressable
        onPress={() => router.push('/chat-interface')}
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-end',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <Icon name="MessageCircle" size={24} color="#374151" />
        {unreadCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#ef4444',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  )
}

export default GlobalChatIndicator
