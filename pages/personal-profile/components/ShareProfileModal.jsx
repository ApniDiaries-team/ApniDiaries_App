import { useState } from 'react'
import { Clipboard, Modal, Pressable, Share, Text, View } from 'react-native'
import Icon from '../../../components/AppIcon'

const ShareProfileModal = ({ isOpen, onClose, profileUrl, userName }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    Clipboard.setString(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `Check out ${userName}'s travel profile: ${profileUrl}`,
        url: profileUrl,
      })
    } catch (err) {
      console.log(err)
    }
  }

  const shareOptions = [
    { id: 'share', name: 'Share', icon: 'Share2', action: handleNativeShare },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', action: handleNativeShare },
    { id: 'copy', name: 'Copy Link', icon: 'Link', action: handleCopyLink },
    { id: 'email', name: 'Email', icon: 'Mail', action: handleNativeShare },
  ]

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white rounded-t-2xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-playfair-bold text-gray-900">Share Profile</Text>
              <Pressable onPress={onClose} className="p-2 rounded-lg bg-gray-100">
                <Icon name="X" size={20} color="#374151" />
              </Pressable>
            </View>

            {/* Profile URL */}
            <View className="flex-row items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 mb-6">
              <Text className="flex-1 text-sm text-gray-600" numberOfLines={1}>{profileUrl}</Text>
              <Pressable onPress={handleCopyLink} className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: copied ? '#10B981' : '#374151' }}>
                <Text className="text-white text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</Text>
              </Pressable>
            </View>

            {/* Share via */}
            <Text className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Share via</Text>
            <View className="flex-row flex-wrap gap-3">
              {shareOptions.map((opt) => (
                <Pressable key={opt.id} onPress={opt.action} className="items-center gap-2 flex-1">
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
                    <Icon name={opt.icon} size={22} color="#374151" />
                  </View>
                  <Text className="text-xs text-gray-600">{opt.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default ShareProfileModal
