import { Linking, Pressable, Text, View } from 'react-native';
import Icon from '../../../components/AppIcon';
import { Fonts } from '../../../constants/theme';

const ContactCard = ({ icon, title, details, link, linkText, isDarkMode }) => {
  const bg = isDarkMode ? '#131c2b' : '#fff';
  const border = isDarkMode ? '#1e2d42' : '#e5e7eb';
  const textPrimary = isDarkMode ? '#f1f5f9' : '#111827';
  const textSecondary = isDarkMode ? '#64748b' : '#6b7280';
  const borderBottom = isDarkMode ? '#1e2d42' : '#f3f4f6';

  return (
    <View
      style={{
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 14,
        padding: 18,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        {/* Icon circle */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: 'rgba(249,115,22,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={22} color="#F97316" />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: Fonts.playfair?.bold,
              fontSize: 16,
              color: textPrimary,
              marginBottom: 8,
            }}
          >
            {title}
          </Text>
          <View style={{ gap: 3 }}>
            {details?.map((detail, index) => (
              <Text key={index} style={{ fontSize: 13, color: textSecondary, lineHeight: 20 }}>
                {detail}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {link && (
        <View
          style={{
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: borderBottom,
          }}
        >
          <Pressable
            onPress={() => Linking.openURL(link)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#F97316' }}>{linkText}</Text>
            <Icon name="ExternalLink" size={14} color="#F97316" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default ContactCard;
