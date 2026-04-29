import React from 'react'
import { Text, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import { Checkbox } from '../../../components/ui/Checkbox'
import Select from '../../../components/ui/Select'
import { useDarkMode } from '../../../context/DarkModeContext'

const privacyOptions = [
  { value: 'public', label: 'Public - Everyone can see' },
  { value: 'friends', label: 'Friends Only - Connections can see' },
  { value: 'private', label: 'Private - Only you can see' },
]

const messageOptions = [
  { value: 'everyone', label: 'Everyone - Anyone can message' },
  { value: 'friends', label: 'Friends Only - Only connections' },
  { value: 'nobody', label: 'Nobody - Disable messages' },
]

const PrivacySettingsSection = ({ formData, onChange }) => {
  const { isDarkMode } = useDarkMode()
  const colors = {
    saffron: '#FF9933',
    textPrimary: isDarkMode ? '#F9FAFB' : '#111827',
  }

  return (
    <View
      className="rounded-xl p-4 md:p-6 lg:p-8 mt-4"
      style={{
        backgroundColor: isDarkMode ? '#1f2937' : '#fff',
        borderWidth: 1,
        borderColor: isDarkMode ? '#374151' : '#f3f4f6',
        top: 40
      }}
    >
      <View className="flex-row items-center gap-3 mb-6">
        <View
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <Icon
            name="Shield"
            size={20}
            style={{
              color: isDarkMode ? '#60A5FA' : '#3B82F6',
            }}
          />
        </View>
        <Text
          className="text-lg md:text-xl font-semibold"
          style={{
            color: isDarkMode ? '#f9fafb' : '#111827',
          }}
        >
          Privacy & Notifications
        </Text>
      </View>

      <View className="gap-6">
        <Select
          label="Profile Visibility"
          description="Who can see your profile details?"
          options={privacyOptions}
          value={formData?.profileVisibility}
          onChange={(v) => onChange('profileVisibility', v)}
          searchable
          placeholder="Select visibility"
        />

        <Select
          label="Message Privacy"
          description="Who can send you messages?"
          options={messageOptions}
          value={formData?.messagePrivacy}
          onChange={(v) => onChange('messagePrivacy', v)}
          searchable
          placeholder="Select privacy"
        />

        {/* Privacy info box */}
        <View
          style={{
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(255,153,51,0.2)",
            backgroundColor: "rgba(255,153,51,0.05)",
            gap: 10,
          }}
        >
          {[
            { color: colors.saffron, label: "Public", desc: "Visible to all community members" },
            { color: isDarkMode ? "#9CA3AF" : "#6B7280", label: "Friends Only", desc: "Only your connections can see" },
            { color: "#f97316", label: "Private", desc: "Only visible to you" },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
              <Text style={{ fontSize: 13, color: colors.textPrimary }}>
                <Text style={{ fontWeight: "600", color: item.color }}>{item.label}: </Text>
                {item.desc}
              </Text>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <Text
            className="text-sm font-medium"
            style={{
              color: isDarkMode ? '#f9fafb' : '#111827',
            }}
          >
            Notification Preferences
          </Text>
          <View className="gap-2">
            <Checkbox label="New followers" description="Get notified when someone follows you" checked={formData?.emailFollowers} onChange={() => onChange('emailFollowers', !formData?.emailFollowers)} />
            <Checkbox label="Friend requests" description="Get notified about new friend requests" checked={formData?.emailFriendRequests} onChange={() => onChange('emailFriendRequests', !formData?.emailFriendRequests)} />
            <Checkbox label="Messages" description="Get notified about new messages" checked={formData?.emailMessages} onChange={() => onChange('emailMessages', !formData?.emailMessages)} />
            <Checkbox label="Post interactions" description="Get notified about likes/comments" checked={formData?.emailPostInteractions} onChange={() => onChange('emailPostInteractions', !formData?.emailPostInteractions)} />
          </View>
        </View>

        <View className="gap-3">
          <Text
            className="text-sm font-medium"
            style={{
              color: isDarkMode ? '#f9fafb' : '#111827',
            }}
          >
            Discovery Settings
          </Text>
          <View className="gap-2">
            <Checkbox label="City discovery" description="Let travelers in your city find you" checked={formData?.showInDiscovery} onChange={() => onChange('showInDiscovery', !formData?.showInDiscovery)} />
            <Checkbox label="Online status" description="Let others see when you're active" checked={formData?.showOnlineStatus} onChange={() => onChange('showOnlineStatus', !formData?.showOnlineStatus)} />
            <Checkbox label="Profile sharing" description="Let others share your profile" checked={formData?.allowProfileSharing} onChange={() => onChange('allowProfileSharing', !formData?.allowProfileSharing)} />
          </View>
        </View>

        <View className="flex-row items-start gap-2 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
          <Icon name="Info" size={14} color="#3B82F6" />
          <Text className="text-xs text-gray-500 dark:text-slate-400 flex-1">Your privacy is important to us. These settings help you control your community experience.</Text>
        </View>
      </View>
    </View>
  )
}

export default PrivacySettingsSection
