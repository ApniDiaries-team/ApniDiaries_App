import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Icon from '../../../components/AppIcon';
import { Fonts, Palette } from '../../../constants/theme';
import { useDarkMode } from '../../../context/DarkModeContext';

const SearchBar = ({ onSearch, placeholder = 'Search travelers by name, city, or interests…' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode } = useDarkMode();
  const bg = isDarkMode ? Palette.dark.surfaceLowest : Palette.light.surfaceLowest;
  const border = isDarkMode ? Palette.dark.outlineVariant : Palette.light.outlineVariant;
  const text = isDarkMode ? Palette.dark.text : Palette.light.text;
  const muted = isDarkMode ? Palette.dark.outline : Palette.light.outline;
  const primary = isDarkMode ? Palette.dark.primary : Palette.light.primary;

  useEffect(() => {
    const timer = setTimeout(() => onSearch?.(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  return (
    <View style={{ position: 'relative', width: '100%', justifyContent: 'center' }}>
      <Icon name="Search" size={18} color={muted} style={{ position: 'absolute', left: 20, zIndex: 1 }} />
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={placeholder}
        placeholderTextColor={muted}
        returnKeyType="search"
        onSubmitEditing={() => onSearch?.(searchQuery)}
        style={{ width: '100%', minHeight: 58, paddingLeft: 50, paddingRight: 50, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: border, backgroundColor: bg, color: text, fontFamily: Fonts.inter.regular, fontSize: 14 }}
      />
      {!!searchQuery && (
        <Pressable onPress={() => setSearchQuery('')} hitSlop={10} style={{ position: 'absolute', right: 18, height: '100%', justifyContent: 'center' }}>
          <Icon name="X" size={16} color={primary} />
        </Pressable>
      )}
    </View>
  );
};

export default SearchBar;
