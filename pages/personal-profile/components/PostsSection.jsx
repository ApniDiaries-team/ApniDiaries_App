import { Text, View } from 'react-native';
import Icon from '../../../components/AppIcon';
import PostCard from './PostCard';

const PostsSection = ({ posts, onComment, onDeletePost }) => {
  if (!posts || posts.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <View className="w-16 h-16 rounded-full bg-profile-card dark:bg-profile-card-dark items-center justify-center mb-4">
          <Icon name="FileText" size={32} className="text-profile-text-secondary dark:text-profile-text-secondary-dark" />
        </View>
        <Text className="text-lg font-semibold text-profile-text-primary dark:text-profile-text-primary-dark mb-2">No posts yet</Text>
        <Text className="text-sm text-profile-text-secondary dark:text-profile-text-secondary-dark text-center">Share your travel experiences with the community</Text>
      </View>
    );
  }

  return (
    <View>
      {posts?.map((post) => (
        <PostCard key={post?.id} post={post} onComment={onComment} onDeletePost={onDeletePost} />
      ))}
    </View>
  );
};

export default PostsSection

