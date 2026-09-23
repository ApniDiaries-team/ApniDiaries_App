import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import Icon from '../../components/AppIcon';
import { Fonts, Palette } from '../../constants/theme';
import { useDarkMode } from '../../context/DarkModeContext';
import { searchUser } from '../../services/user.api';
import SearchBar from './components/SearchBar';
import SearchUserCard from './components/SearchUserCard';

const SUGGESTED_VIBES = ['Solo Traveler', 'Mountain Junkie', 'Foodie', 'Digital Nomad', 'Photographer'];

const SearchUser = () => {
  const { isDarkMode } = useDarkMode();
  const [userList, setUserList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const bg = isDarkMode ? Palette.dark.surface : Palette.light.surface;
  const text = isDarkMode ? Palette.dark.text : Palette.light.text;
  const muted = isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant;
  const primary = isDarkMode ? Palette.dark.primary : Palette.light.primary;

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) { setUserList([]); setLoading(false); return; }
    try {
      setLoading(true);
      const response = await searchUser(query);
      if (response?.data?.success) setUserList(response.data.data || []);
      else setUserList([]);
    } catch (error) {
      console.log('Search error:', error);
      setUserList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: 40, paddingBottom: 64 }}>
        <View style={{ width: '100%', maxWidth: 672, alignSelf: 'center', paddingHorizontal: 20 }}>
          {!searchQuery.trim() && (
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Icon name="Globe2" size={56} color={isDarkMode ? '#718096' : Palette.light.outline} strokeWidth={1.25} style={{ marginBottom: 24 }} />
              <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: 30, lineHeight: 38, textAlign: 'center', color: text }}>Find your next travel companion</Text>
              <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 15, lineHeight: 23, textAlign: 'center', color: muted, marginTop: 16, maxWidth: 440 }}>Search to discover travelers from around the world. Connect, share itineraries, and explore together.</Text>
            </View>
          )}

          <SearchBar onSearch={handleSearch} placeholder="Search travelers by name, city, or interests…" />

          {!searchQuery.trim() && (
            <View style={{ marginTop: 32 }}>
              <Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: muted, marginBottom: 12 }}>Suggested Vibes</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {SUGGESTED_VIBES.map((vibe) => (
                  <Pressable key={vibe} onPress={() => handleSearch(vibe)} style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#FCE8DC' }}>
                    <Text style={{ fontFamily: Fonts.inter.medium, fontSize: 13, color: isDarkMode ? '#D1D5DB' : '#6B351F' }}>{vibe}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {loading && <View style={{ alignItems: 'center', marginTop: 24 }}><ActivityIndicator color={primary} /><Text style={{ fontFamily: Fonts.inter.regular, fontSize: 13, color: muted, marginTop: 8 }}>Searching…</Text></View>}
          {!loading && <SearchUserCard userList={userList} searchQuery={searchQuery} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchUser;



