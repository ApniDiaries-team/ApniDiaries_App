import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDarkMode } from '../../context/DarkModeContext';
import { searchUser } from '../../services/user.api';
import SearchBar from './components/SearchBar';
import SearchUserCard from './components/SearchUserCard';

const SearchUser = () => {
  const { isDarkMode } = useDarkMode();
  const [userList, setUserList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = {
    background: isDarkMode ? '#0B0E14' : '#ffff', // Matched bg-bg-cream (light cream/gray)
    textPrimary: isDarkMode ? '#FFFFFF' : '#1A202C',
    textSecondary: isDarkMode ? '#A0AEC0' : '#6B7280',
    accent: '#FF9933',
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setUserList([]);
      return;
    }

    try {
      setLoading(true);
      const response = await searchUser(query);
      if (response?.data?.success) {
        setUserList(response.data.data || []);
      }
    } catch (error) {
      console.log('Search error:', error);
      setUserList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Search User
          </Text>

          <View style={styles.searchSection}>
            <SearchBar onSearch={handleSearch} />
          </View>

          {loading && (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Searching...
            </Text>
          )}

          <ScrollView
            style={styles.resultsSection}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.cardWrapper}>
              <SearchUserCard userList={userList} searchQuery={searchQuery} />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    top: 16,
  },
  innerContainer: {
    flex: 1,
    maxWidth: 600, // Matched max-w-4xl (simulated for mobile)
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    paddingTop: 40, // Simulated pt-[76px] for mobile
  },
  title: {
    fontSize: 28, // Matched text-3xl
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 24, // mb-6
  },
  searchSection: {
    zIndex: 10,
  },
  loadingText: {
    marginTop: 16, // mt-4
    fontSize: 14, // text-sm
  },
  resultsSection: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  cardWrapper: {
    marginTop: 24, // mt-6
  },
});

export default SearchUser;
