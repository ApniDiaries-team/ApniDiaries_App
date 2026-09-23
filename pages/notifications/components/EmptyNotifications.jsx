import React from 'react'
import { Text, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import { useDarkMode } from '../../../context/DarkModeContext'
import { Fonts } from '../../../constants/theme'

const EmptyNotifications = ({ filterType }) => {
  const { isDarkMode } = useDarkMode()

  const colors = {
    secondary: isDarkMode ? "#1A1F29" : "#F7FAFC",
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
  }

  const getEmptyMessage = () => {
    const messages = {
      all: {
        icon: 'Bell',
        title: 'No notifications yet',
        description: "When someone follows you, sends a friend request, or interacts with your posts, you'll see it here.",
      },
      friend_request: {
        icon: 'UserPlus',
        title: 'No friend requests',
        description: "You don't have any pending friend requests at the moment.",
      },
      follow: {
        icon: 'UserCheck',
        title: 'No new followers',
        description: "When someone follows you, you'll be notified here.",
      },
      message: {
        icon: 'MessageCircle',
        title: 'No message notifications',
        description: 'Message notifications will appear here when you receive new messages.',
      },
      engagement: {
        icon: 'Heart',
        title: 'No activity yet',
        description: 'Likes, comments, and other interactions with your posts will show up here.',
      },
    }

    return messages[filterType] || messages.all
  }

  const message = getEmptyMessage()

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64, px: 16 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.secondary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Icon name={message.icon} size={40} color={colors.textSecondary} />
      </View>

      <Text
        style={{
          fontSize: 18,
          fontFamily: Fonts.playfair.bold,
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: 8
        }}
      >
        {message.title}
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
          maxWidth: 280,
          fontFamily: "Poppins_400Regular"
        }}
      >
        {message.description}
      </Text>
    </View>
  )
}

export default EmptyNotifications
