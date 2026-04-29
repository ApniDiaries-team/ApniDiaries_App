import { Modal, Pressable, Text, View } from 'react-native'
import Icon from '../../../components/AppIcon'

const UnsavedChangesModal = ({ isOpen, onClose, onDiscard, onSave }) => {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} className="justify-center items-center p-6">
        <View className="bg-white rounded-[32px] p-8 w-full shadow-2xl" style={{ maxWidth: 400 }}>
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-full bg-amber-50 items-center justify-center mb-4">
              <Icon name="AlertCircle" size={32} color="#F59E0B" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
              Unsaved Changes
            </Text>
            <Text className="text-sm text-gray-500 text-center leading-relaxed px-2" style={{ fontFamily: 'Poppins_400Regular' }}>
              You have progress that hasn't been saved yet. Would you like to save it before leaving?
            </Text>
          </View>

          {/* Actions */}
          <View className="gap-4">
            <Pressable
              onPress={onSave}
              className="flex-row items-center justify-center gap-3 py-4 rounded-2xl"
              style={{ backgroundColor: '#FF9933' }}
            >
              <Icon name="Save" size={20} color="#fff" />
              <Text className="text-base font-semibold text-white" style={{ fontFamily: 'Poppins_600SemiBold' }}>Save Changes</Text>
            </Pressable>

            <Pressable
              onPress={onDiscard}
              className="flex-row items-center justify-center gap-3 py-4 rounded-2xl bg-red-50"
            >
              <Icon name="Trash2" size={20} color="#EF4444" />
              <Text className="text-base font-semibold text-red-600" style={{ fontFamily: 'Poppins_600SemiBold' }}>Discard Changes</Text>
            </Pressable>

            <Pressable 
              onPress={onClose} 
              className="py-2 items-center"
            >
              <Text className="text-sm font-medium text-gray-400" style={{ fontFamily: 'Poppins_500Medium' }}>Continue Editing</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default UnsavedChangesModal
