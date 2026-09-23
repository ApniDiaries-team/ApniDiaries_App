import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import Button from '../../../components/ui/Button'
import { useDarkMode } from '../../../context/DarkModeContext'
import { Fonts } from '../../../constants/theme'
import { getProfilePhotoUrl } from '../../../helper/DefaultImageUrl'

const NotificationCard = ({ notification, onAccept, onDecline, onMarkAsRead }) => {
  const router = useRouter()
  const { isDarkMode } = useDarkMode()

  const colors = {
    card: isDarkMode ? "#1E242F" : "#FFFFFF",
    secondary: isDarkMode ? "#1A1F29" : "#F7FAFC",
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    border: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.05)",
    primary: "#FF9933",
  }

  const getNotificationIcon = (type) => {
    const icons = {
      friend_request: 'UserPlus',
      follow: 'UserCheck',
      message: 'MessageCircle',
      like: 'Heart',
      comment: 'MessageSquare',
      missed_call: 'PhoneMissed',
      system: 'Bell',
    }
    return icons[type] || 'Bell'
  }

  const getAccentColor = (type) => {
    const colorsMap = {
      friend_request: '#3b82f6',
      follow: '#22c55e',
      message: '#6366f1',
      like: '#ef4444',
      comment: '#f97316',
      missed_call: '#ef4444',
      system: '#94a3b8',
    }
    return colorsMap[type] || '#94a3b8'
  }

  const handleCardPress = () => {
    if (!notification.isRead) onMarkAsRead(notification.id)
    switch (notification.type) {
      case 'follow':
      case 'like':
      case 'comment':
        router.push({ pathname: '/other-user-profile', params: { userId: notification.userId } })
        break
      case 'message':
        router.push({
          pathname: '/chat-interface',
          params: {
            userId: notification.userId,
            threadId: notification.threadId || null,
          }
        })
        break
      case 'missed_call':
        router.push('/chat-list') // Or call history if exists
        break
      default:
        break
    }
  }

  const accentColor = getAccentColor(notification.type)

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => ({
        padding: 16,
        borderRadius: 16,
        backgroundColor: notification.isRead ? colors.card : colors.secondary,
        borderLeftWidth: 4,
        borderLeftColor: notification.isRead ? 'transparent' : accentColor,
        opacity: pressed ? 0.9 : 1,
        borderWidth: 1,
        borderColor: colors.border
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'start', gap: 12 }}>
        <View style={{ position: 'relative', flexShrink: 0 }}>
          <Image
            source={{ uri: getProfilePhotoUrl(notification.avatar) }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.card,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: colors.card
            }}
          >
            <Icon name={getNotificationIcon(notification.type)} size={12} color={accentColor} />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'start', justifyContent: 'between', gap: 8, marginBottom: 4 }}>
            <Text style={{ fontSize: 14, color: colors.textPrimary, flex: 1 }}>
              <Text style={{ fontFamily: Fonts.playfair.bold }}>{notification.userName}</Text>
              {' '}{notification.message}
            </Text>
            {!notification.isRead && (
              <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 4, backgroundColor: accentColor }} />
            )}
          </View>

          {notification.previewText && (
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }} numberOfLines={2}>
              {notification.previewText}
            </Text>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="Clock" size={14} color={colors.textSecondary} />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {notification.timestamp && new Date(notification.timestamp).toLocaleString()}
            </Text>
          </View>

          {notification.type === 'friend_request' && !notification.isResponded && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Button
                variant="default"
                size="sm"
                fullWidth
                onPress={() => onAccept(notification.id)}
                style={{ flex: 1 }}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onPress={() => onDecline(notification.id)}
                style={{ flex: 1 }}
              >
                Decline
              </Button>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}

export default NotificationCard
