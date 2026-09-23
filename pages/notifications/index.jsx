import React, { useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useDarkMode } from '../../context/DarkModeContext'
import { useNotifications } from '../../context/NotificationContext'
import { clearAllNotifications, markAllRead as apiMarkAllRead } from '../../services/notification.api'
import { acceptFriend, declineFriend } from '../../services/user.api'
import EmptyNotifications from './components/EmptyNotifications'
import NotificationActions from './components/NotificationActions'
import NotificationCard from './components/NotificationCard'
import NotificationFilter from './components/NotificationFilter'

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    markAllRead,
    markOneRead,
    respondToFriendRequest,
    clearAll,
    isLoading,
  } = useNotifications()

  const { isDarkMode } = useDarkMode()
  const [activeFilter, setActiveFilter] = useState('all')

  const colors = {
    background: isDarkMode ? "#0B0E14" : "#ffff",
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    border: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.05)",
  }

  const filteredNotifications =
    activeFilter === 'all'
      ? notifications
      : activeFilter === 'engagement'
        ? notifications.filter((n) => n.type === 'like' || n.type === 'comment')
        : notifications.filter((n) => n.type === activeFilter)

  const handleAcceptRequest = async (notification) => {
    try {
      const res = await acceptFriend(notification.friendRequestId)
      if (res?.data?.success) {
        respondToFriendRequest(notification.id, true)
      }
    } catch (error) {
      console.log('accept request error', error)
    }
  }

  const handleDeclineRequest = async (notification) => {
    try {
      const res = await declineFriend(notification.friendRequestId)
      if (res?.data?.success) {
        respondToFriendRequest(notification.id, false)
      }
    } catch (error) {
      console.log('decline request error', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await apiMarkAllRead()
      markAllRead()
    } catch (error) {
      console.log('mark all read error', error)
    }
  }

  const handleClearAll = async () => {
    try {
      await clearAllNotifications()
      clearAll()
    } catch (error) {
      console.log('clear all error', error)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          <View style={{ marginBottom: 24 }}>
            <Text 
              style={{ 
                fontSize: 28, 
                fontFamily: "PlayfairDisplay_700Bold", 
                color: colors.textPrimary,
                marginBottom: 4
              }}
            >
              Notifications
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Stay updated with your community activities
            </Text>
          </View>

          <View style={{ gap: 20 }}>
            <NotificationFilter
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={{
                all: notifications.length,
                friend_request: notifications.filter((n) => n.type === 'friend_request' && !n.isResponded).length,
                follow: notifications.filter((n) => n.type === 'follow').length,
                message: notifications.filter((n) => n.type === 'message').length,
                engagement: notifications.filter((n) => n.type === 'like' || n.type === 'comment').length,
              }}
            />

            <NotificationActions
              unreadCount={unreadCount}
              onMarkAllRead={handleMarkAllRead}
              onClearAll={handleClearAll}
            />

            {isLoading ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64 }}>
                <ActivityIndicator size="large" color="#FF9933" />
              </View>
            ) : filteredNotifications.length === 0 ? (
              <EmptyNotifications filterType={activeFilter} />
            ) : (
              <View style={{ gap: 12 }}>
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAccept={() => handleAcceptRequest(notification)}
                    onDecline={() => handleDeclineRequest(notification)}
                    onMarkAsRead={(id) => markOneRead(id)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default Notifications
