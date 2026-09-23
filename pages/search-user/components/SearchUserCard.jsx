import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '../../../components/AppIcon';
import { Fonts, Palette } from '../../../constants/theme';
import { useDarkMode } from '../../../context/DarkModeContext';
import { getProfilePhotoUrl } from '../../../helper/DefaultImageUrl';

const SearchUserCard = ({ userList = [], searchQuery }) => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const text = isDarkMode ? Palette.dark.text : Palette.light.text;
  const muted = isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant;
  const border = isDarkMode ? 'rgba(255,255,255,0.15)' : Palette.light.outlineVariant;
  const surfaceLow = isDarkMode ? Palette.dark.surfaceLow : Palette.light.surfaceLow;

  if (!searchQuery?.trim()) return null;
  if (!userList.length) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 48, marginTop: 8 }}>
        <Icon name="Users" size={28} color={muted} style={{ marginBottom: 12, opacity: 0.55 }} />
        <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 14, color: muted, textAlign: 'center' }}>No travelers found for “{searchQuery}”</Text>
      </View>
    );
  }

  const openProfile = (person) => {
    const id = person?.id ?? person?._id;
    if (id != null) router.push({ pathname: '/other-user-profile', params: { userId: String(id) } });
  };

  return (
    <View style={{ width: '100%', marginTop: 16 }}>
      {userList.map((person, index) => {
        const name = person?.name || 'Traveler';
        const location = person?.city || person?.location;
        const key = person?.id ?? person?._id ?? person?.username ?? `${name}-${index}`;
        return (
          <Pressable
            key={String(key)}
            onPress={() => openProfile(person)}
            accessibilityRole="button"
            accessibilityLabel={`View ${name}'s profile`}
            style={{ width: '100%', minHeight: 96, flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: 16, paddingVertical: 20, borderBottomWidth: index < userList.length - 1 ? 1 : 0, borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(225,191,178,0.5)' }}
          >
            <Image source={{ uri: getProfilePhotoUrl(person?.profile_photo) }} accessibilityLabel={`${name}'s profile photo`} style={{ width: 56, height: 56, borderRadius: 28, flexShrink: 0, backgroundColor: surfaceLow }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontFamily: Fonts.playfair.semibold, fontSize: 18, color: text }}>{name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                {location ? <><Icon name="MapPin" size={13} color={muted} /><Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: Fonts.inter.regular, fontSize: 14, color: muted }}>{location}</Text></> : <Text numberOfLines={1} style={{ fontFamily: Fonts.inter.regular, fontSize: 14, color: muted }}>@{person?.username || ''}</Text>}
              </View>
            </View>
            <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="ArrowRight" size={16} color={text} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default SearchUserCard;
