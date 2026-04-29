import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import { useDarkMode } from '../../../context/DarkModeContext'
import { Fonts } from '../../../constants/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const NotificationFilter = ({ activeFilter, onFilterChange, counts }) => {
  const { isDarkMode } = useDarkMode()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  const colors = {
    card: isDarkMode ? "#1E242F" : "#EDF2F7",
    primary: isDarkMode ? "#0B0E14" : "#ffff", // Background for active item
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    accent: ["#FF9933", "#E87722"], // Saffron gradient
    barBg: isDarkMode ? "#2D3748" : "#FFF5E6", // Light cream for background bar
    border: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.05)",
  }

  const filters = [
    { id: 'all', label: 'All', icon: 'Bell', count: counts?.all },
    { id: 'friend_request', label: 'Requests', icon: 'UserPlus', count: counts?.friend_request },
    { id: 'follow', label: 'Follows', icon: 'UserCheck', count: counts?.follow },
    { id: 'message', label: 'Messages', icon: 'MessageCircle', count: counts?.message },
    { id: 'engagement', label: 'Activity', icon: 'Heart', count: counts?.engagement },
  ]

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const padding = 0
    const totalScrollableWidth = contentSize.width - layoutMeasurement.width
    if (totalScrollableWidth > 0) {
      const progress = (contentOffset.x / totalScrollableWidth) * 100
      setScrollProgress(Math.min(100, Math.max(0, progress)))
    }
  }

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: colors.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border
      }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <View style={{ padding: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={(w) => setContentWidth(w)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {filters.map((filter) => {
              const isActive = activeFilter === filter.id
              return (
                <Pressable
                  key={filter.id}
                  onPress={() => onFilterChange(filter.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 14,
                    backgroundColor: isActive ? colors.primary : 'transparent',
                    shadowColor: isActive ? "#000" : "transparent",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isActive ? 0.1 : 0,
                    shadowRadius: 14,
                    elevation: isActive ? 4 : 0,
                  }}
                >
                  <Icon
                    name={filter.icon}
                    size={18}
                    color={isActive ? colors.textPrimary : colors.textSecondary}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: isActive ? Fonts.playfair.bold : Fonts.inter.medium,
                      color: isActive ? colors.textPrimary : colors.textSecondary,
                    }}
                  >
                    {filter.label}
                  </Text>
                  {filter.count > 0 && (
                    <View
                      style={{
                        minWidth: 20,
                        height: 20,
                        paddingHorizontal: 6,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isActive ? colors.card : 'rgba(59,130,246,0.15)',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: isActive ? colors.textPrimary : '#3b82f6'
                        }}
                      >
                        {filter.count > 99 ? '99+' : filter.count}
                      </Text>
                    </View>
                  )}
                </Pressable>
              )
            })}
          </View>
        </ScrollView>
      </View>

      {/* Progress Bar Scroller Indicator */}
      <View style={{ height: 6, backgroundColor: colors.barBg, width: '100%' }}>
        <LinearGradient
          colors={colors.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: '100%',
            width: contentWidth > containerWidth ? '60%' : '100%', // Approximate width of the thumb
            transform: [
              {
                translateX: contentWidth > containerWidth
                  ? (scrollProgress / 100) * (containerWidth * 0.4)
                  : 0
              }
            ],
            borderRadius: 3
          }}
        />
      </View>
    </View>
  )
}

export default NotificationFilter
