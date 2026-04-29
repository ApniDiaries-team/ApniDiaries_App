import { Linking, Pressable, Text, View } from 'react-native';
import Icon from '../../../components/AppIcon';
import { Fonts } from '../../../constants/theme';

const SocialMediaCard = ({ platform, handle, followers, icon, link, color, isDarkMode }) => {
  const bg = isDarkMode ? '#131c2b' : '#fff';
  const border = isDarkMode ? '#1e2d42' : '#e5e7eb';
  const textPrimary = isDarkMode ? '#f1f5f9' : '#111827';
  const textSecondary = isDarkMode ? '#64748b' : '#6b7280';

  return (
    <Pressable
      onPress={() => Linking.openURL(link)}
      style={{
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 14,
        padding: 18,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${color}18`,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: Fonts.playfair?.bold,
              fontSize: 16,
              color: textPrimary,
              marginBottom: 3,
            }}
          >
            {platform}
          </Text>
          <Text style={{ fontSize: 13, color: textSecondary }} numberOfLines={1}>
            {handle}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="Users" size={14} color={textSecondary} />
          <Text style={{ fontSize: 13, color: textSecondary }}>
            {followers?.toLocaleString('en-US')} followers
          </Text>
        </View>
        <Icon name="ArrowRight" size={18} color="#F97316" />
      </View>
    </Pressable>
  );
};

export default SocialMediaCard;
