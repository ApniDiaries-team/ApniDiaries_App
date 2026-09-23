import React from 'react'
import { Text, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import Button from '../../../components/ui/Button'
import { useDarkMode } from '../../../context/DarkModeContext'
import { Fonts } from '../../../constants/theme'

const NotificationActions = ({ unreadCount, onMarkAllRead, onClearAll }) => {
  const { isDarkMode } = useDarkMode()

  const colors = {
    card: isDarkMode ? "#1E242F" : "#EDF2F7", // Matched with Profile cards
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    accent: "#3b82f6",
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'between',
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.card
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
        <Icon name='Bell' size={20} color={colors.accent} />
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>
          {unreadCount > 0 ? (
            <Text>
              <Text style={{ color: colors.accent, fontFamily: Fonts.playfair.bold }}>{unreadCount}</Text> unread
            </Text>
          ) : (
            'All caught up!'
          )}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {unreadCount > 0 && (
          <Button
            variant='outline'
            size='sm'
            iconName='Check'
            onPress={onMarkAllRead}
            style={{ height: 32, paddingHorizontal: 12 }}
          >
            Read
          </Button>
        )}
        <Button
          variant='ghost'
          size='sm'
          iconName='Trash2'
          onPress={onClearAll}
          style={{ height: 32, paddingHorizontal: 12 }}
        >
          Clear
        </Button>
      </View>
    </View>
  )
}

export default NotificationActions
