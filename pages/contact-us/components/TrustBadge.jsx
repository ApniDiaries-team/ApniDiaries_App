import { Text, View } from 'react-native';
import Icon from '../../../components/AppIcon';

const TrustBadge = ({ icon, text, description, isDarkMode }) => {
  const bg = isDarkMode ? '#1a2535' : '#FFF1EC';
  const border = isDarkMode ? '#1e2d42' : '#EDD6CD';
  const iconBg = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDarkMode ? '#e2e8f0' : '#261913';
  const textSecondary = isDarkMode ? '#8D7165' : '#8D7165';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 14,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={18} color={textPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: textPrimary, marginBottom: 2 }}>
          {text}
        </Text>
        <Text style={{ fontSize: 12, color: textSecondary, lineHeight: 18 }}>
          {description}
        </Text>
      </View>
    </View>
  );
};

export default TrustBadge;
