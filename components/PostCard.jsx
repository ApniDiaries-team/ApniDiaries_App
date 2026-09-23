import { Image, Pressable, Text, View } from 'react-native'
import Icon from './AppIcon'

const PostCard = ({ profileImage, name, time, content, likes = 2, comments = 3, saves = 4 }) => {
  return (
    <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      {/* Author row */}
      <View className="flex-row items-center gap-3 mb-3">
        {profileImage ? (
          <Image source={{ uri: profileImage }} className="w-10 h-10 rounded-full" resizeMode="cover" />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
            <Icon name="User" size={18} color="#9ca3af" />
          </View>
        )}
        <View>
          <Text className="text-sm font-medium text-gray-900">{name}</Text>
          <Text className="text-xs text-gray-500">{time}</Text>
        </View>
      </View>

      {/* Content */}
      <Text className="text-sm text-gray-800 leading-relaxed mb-4">{content}</Text>

      {/* Actions */}
      <View className="flex-row items-center gap-6">
        <Pressable className="flex-row items-center gap-1">
          <Icon name="Heart" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500">{likes}</Text>
        </Pressable>
        <Pressable className="flex-row items-center gap-1">
          <Icon name="MessageCircle" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500">{comments}</Text>
        </Pressable>
        <Pressable className="flex-row items-center gap-1">
          <Icon name="Bookmark" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500">{saves}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default PostCard
