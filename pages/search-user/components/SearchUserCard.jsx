import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDarkMode } from '../../../context/DarkModeContext';
import { getProfilePhotoUrl } from '../../../helper/DefaultImageUrl';

const SearchUserCard = ({ userList = [], searchQuery }) => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  const colors = {
    bgCard: isDarkMode ? '#1E242F' : '#FFFFFF',
    bgSecondary: isDarkMode ? '#1A1F29' : '#F7FAFC',
    textPrimary: isDarkMode ? '#FFFFFF' : '#1A202C',
    textSecondary: isDarkMode ? '#A0AEC0' : '#6B7280',
    border: isDarkMode ? '#2D3748' : '#E2E8F0',
  };

  if (!searchQuery) return null;

  if (userList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No users found
        </Text>
      </View>
    );
  }

  const goToUserProfile = (id, name) => {
    router.push({
      pathname: '/other-user-profile',
      params: { userId: id },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>
        Search Results
      </Text>

      <View style={styles.list}>
        {userList.map((user) => (
          <Pressable
            key={user.id}
            onPress={() => goToUserProfile(user.id, user.name)}
            style={({ pressed }) => [
              styles.userItem,
              {
                backgroundColor: pressed ? colors.bgSecondary : 'transparent',
              }
            ]}
          >
            <Image
              source={{ uri: getProfilePhotoUrl(user.profile_photo || user.avatar) }}
              style={styles.avatar}
            />

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {user.name}
              </Text>
              <Text style={[styles.userHandle, { color: colors.textSecondary }]}>
                @{user.username || user.handle || user.name?.toLowerCase().replace(/\s/g, '')}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userHandle: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default SearchUserCard;
