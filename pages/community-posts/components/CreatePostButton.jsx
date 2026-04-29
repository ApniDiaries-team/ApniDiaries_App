import { useRouter } from 'expo-router'
import { View } from 'react-native'
import Button from '../../../components/ui/Button'

const CreatePostButton = () => {
  const router = useRouter()

  const handleCreatePost = () => {
    router.push('/create-post')
  }

  return (
    <View className="mb-6">
      <Button
        variant="default"
        size="lg"
        iconName="Plus"
        iconPosition="left"
        onPress={handleCreatePost}
        fullWidth
        className="group"
      >
        Create New Post
      </Button>
    </View>
  )
}

export default CreatePostButton
