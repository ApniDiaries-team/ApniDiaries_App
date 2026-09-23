import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Icon from '../../../components/AppIcon';
import { useDarkMode } from '../../../context/DarkModeContext';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode } = useDarkMode();

  const colors = {
    bgInput: isDarkMode ? '#1E242F' : '#FFFFFF',
    border: isDarkMode ? '#2D3748' : '#E2E8F0',
    text: isDarkMode ? '#FFFFFF' : '#1A202C',
    placeholder: isDarkMode ? '#A0AEC0' : '#64748B',
    accent: '#FF9933', // Brand orange
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <Icon
          name="Search"
          size={20}
          color={colors.placeholder}
        />
      </View>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.bgInput,
            borderColor: colors.border,
            color: colors.text,
          }
        ]}
        placeholder="Search User"
        placeholderTextColor={colors.placeholder}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {searchQuery.length > 0 && (
        <Pressable
          onPress={() => setSearchQuery('')}
          style={styles.clearButton}
        >
          <Icon name="X" size={18} color={colors.placeholder} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 60,
    paddingLeft: 48, // pl-12 equivalent (assuming 4px units)
    paddingRight: 48,
    borderRadius: 12, // rounded-xl
    borderWidth: 2,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
    height: '100%',
    justifyContent: 'center',
    padding: 4,
  },
});

export default SearchBar;
