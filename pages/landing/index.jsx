import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Palette } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { useDarkMode } from '../../context/DarkModeContext';

const journeys = [
  {
    title: 'Find Solo Buddy',
    subtitle: 'Connect with travelers',
    action: 'Find Now',
    path: '/community-posts',
    colors: ['#2874D0', '#174EA6'],
    icon: 'account-group-outline',
  },
  {
    title: 'Book Hostels',
    subtitle: 'Find your stay',
    action: 'Book Now',
    path: '/hostels',
    colors: ['#148A5B', '#087348'],
    icon: 'home-city-outline',
  },
  {
    title: 'Rent Bikes',
    subtitle: 'Ride your adventure',
    action: 'Rent Now',
    path: '/bike-rentals',
    colors: ['#D95C18', '#B6400D'],
    icon: 'motorbike',
  },
];

const JourneyCard = ({ item, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${item.action}: ${item.title}`} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
    <LinearGradient colors={item.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ minHeight: 184, borderRadius: 22, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingLeft: 22, paddingRight: 8, paddingVertical: 20 }}>
      <View style={{ position: 'absolute', width: 150, height: 150, borderRadius: 75, right: -26, top: -66, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, right: 64, bottom: -88, backgroundColor: 'rgba(255,255,255,0.07)' }} />
      <View style={{ flex: 1, alignItems: 'flex-start', zIndex: 1 }}>
        <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: 22, lineHeight: 28, color: '#FFFFFF' }}>{item.title}</Text>
        <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 13, color: 'rgba(255,255,255,0.82)', marginTop: 5 }}>{item.subtitle}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFF8F6' }}>
          <Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 13, color: item.colors[1] }}>{item.action}</Text>
          <Feather name="arrow-right" size={15} color={item.colors[1]} />
        </View>
      </View>
      <View style={{ width: 132, height: 132, alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
        <View style={{ position: 'absolute', width: 112, height: 112, borderRadius: 56, backgroundColor: 'rgba(255,255,255,0.13)' }} />
        <MaterialCommunityIcons name={item.icon} size={item.icon === 'motorbike' ? 100 : 92} color="rgba(255,255,255,0.94)" />
      </View>
    </LinearGradient>
  </Pressable>
);

export default function LandingPage() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { user } = useContext(AppContext) || {};
  const palette = isDarkMode ? Palette.dark : Palette.light;
  const name = user?.name?.trim()?.split(/\s+/)[0] || 'Explorer';

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: palette.surface }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 26, paddingBottom: 28, gap: 18 }}>
        <View style={{ marginBottom: 4 }}>
          <Text style={{ fontFamily: Fonts.inter.medium, fontSize: 14, color: palette.textVariant }}>YOUR NEXT ADVENTURE STARTS HERE</Text>
          <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: 30, lineHeight: 38, color: palette.text, marginTop: 8 }}>Hi, {name} <Text>👋</Text></Text>
          <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 16, color: palette.textVariant, marginTop: 5 }}>Where will you go today?</Text>
        </View>
        {journeys.map((item) => <JourneyCard key={item.title} item={item} onPress={() => router.push(item.path)} />)}
      </ScrollView>
    </SafeAreaView>
  );
}
