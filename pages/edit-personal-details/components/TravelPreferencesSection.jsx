import React, { useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import { Checkbox } from '../../../components/ui/Checkbox'
import { useDarkMode } from '../../../context/DarkModeContext'

// ─── Options defined inside component — matches original Doc 7 ───
const TravelPreferencesSection = ({ formData, errors, onChange }) => {
  const { isDarkMode } = useDarkMode()

  // Exactly as in original
  const cityOptions = [
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'pune', label: 'Pune' },
    { value: 'ahmedabad', label: 'Ahmedabad' },
    { value: 'jaipur', label: 'Jaipur' },
    { value: 'lucknow', label: 'Lucknow' },
    { value: 'goa', label: 'Goa' },
    { value: 'kochi', label: 'Kochi' },
  ]

  const interestOptions = [
    { value: 'adventure', label: 'Adventure Sports' },
    { value: 'photography', label: 'Photography' },
    { value: 'food', label: 'Food & Cuisine' },
    { value: 'culture', label: 'Culture & Heritage' },
    { value: 'nature', label: 'Nature & Wildlife' },
    { value: 'backpacking', label: 'Backpacking' },
    { value: 'luxury', label: 'Luxury Travel' },
    { value: 'spiritual', label: 'Spiritual Tourism' },
    { value: 'beach', label: 'Beach & Coastal' },
    { value: 'mountains', label: 'Mountains & Trekking' },
    { value: 'nightlife', label: 'Nightlife & Entertainment' },
    { value: 'shopping', label: 'Shopping & Markets' },
  ]

  const languageOptions = [
    { value: 'hindi', label: 'Hindi' },
    { value: 'english', label: 'English' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'gujarati', label: 'Gujarati' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'malayalam', label: 'Malayalam' },
    { value: 'punjabi', label: 'Punjabi' },
  ]

  // Kept from original — commented out in usage but array still exists
  const travelStyleOptions = [
    { value: 'budget', label: 'Budget Traveler' },
    { value: 'moderate', label: 'Moderate Spender' },
    { value: 'luxury', label: 'Luxury Seeker' },
    { value: 'flexible', label: 'Flexible' },
  ]

  return (
    // No marginTop — matches original which has no margin on the card
    <View
      style={{
        borderRadius: 12,
        padding: 16,
        backgroundColor: isDarkMode ? '#1f2937' : '#fff',
        borderWidth: 1,
        borderColor: isDarkMode ? '#374151' : '#f3f4f6',
        top: 40
      }}
    >
      {/* Header — matches: <div className='flex items-center gap-3 mb-6'> */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDarkMode
              ? 'rgba(59, 130, 246, 0.2)'
              : 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <Icon
            name="Compass"
            size={20}
            color={isDarkMode ? '#60A5FA' : '#3B82F6'}
          />
        </View>
        {/* matches: <h3 className='text-lg md:text-xl font-semibold'> */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: isDarkMode ? '#f9fafb' : '#111827',
          }}
        >
          Travel Preferences
        </Text>
      </View>

      {/* Fields — matches: <div className='space-y-4 md:space-y-6'> */}
      <View style={{ gap: 16 }}>

        {/* Current City — Single Select */}
        <SingleDropdown
          label="Current City"
          description="Where are you currently based?"
          placeholder="Select your city"
          options={cityOptions}
          value={formData?.currentCity}
          onChange={(value) => onChange('currentCity', value)}
          error={errors?.currentCity}
          required
          isDarkMode={isDarkMode}
        />

        {/* Travel Interests — Multi Select */}
        <MultiDropdown
          label="Travel Interests"
          description="What kind of travel experiences do you enjoy?"
          placeholder="Select your interests (multiple)"
          options={interestOptions}
          value={formData?.travelInterests}
          onChange={(value) => onChange('travelInterests', value)}
          error={errors?.travelInterests}
          required
          isDarkMode={isDarkMode}
        />

        {/* Languages Spoken — Multi Select */}
        <MultiDropdown
          label="Languages Spoken"
          description="Languages you can communicate in"
          placeholder="Select languages"
          options={languageOptions}
          value={formData?.languages}
          onChange={(value) => onChange('languages', value)}
          error={errors?.languages}
          required
          isDarkMode={isDarkMode}
        />

        {/* Travel Style — commented out exactly as in original */}
        {/* <SingleDropdown
          label="Travel Style"
          description="How do you prefer to travel?"
          placeholder="Select your travel style"
          options={travelStyleOptions}
          value={formData?.travelStyle}
          onChange={(value) => onChange('travelStyle', value)}
          error={errors?.travelStyle}
          isDarkMode={isDarkMode}
        /> */}

        {/* Travel Availability — matches: <div className='space-y-3'> */}
        <View style={{ gap: 12 }}>
          {/* matches: <label className='block text-sm font-medium'> */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: isDarkMode ? '#ffff' : '#111827',
            }}
          >
            Travel Availability
          </Text>
          {/* matches: <div className='space-y-2'> */}
          <View style={{ gap: 8 }}>
            {/* onChange matches original: e?.target?.checked pattern
                In RN there's no event object so we pass the value directly */}
            <Checkbox
              label="Available for weekend trips"
              checked={formData?.weekendTrips}
              onChange={(checked) => onChange('weekendTrips', checked)}
            />
            <Checkbox
              label="Open to spontaneous travel plans"
              checked={formData?.spontaneousTravel}
              onChange={(checked) => onChange('spontaneousTravel', checked)}
            />
            <Checkbox
              label="Interested in group travel"
              checked={formData?.groupTravel}
              onChange={(checked) => onChange('groupTravel', checked)}
            />
          </View>
        </View>

      </View>
    </View>
  )
}

// ─── Single Select Dropdown ────────────────────────────────
const SingleDropdown = ({
  label,
  description,
  placeholder,
  options,
  value,
  onChange,
  error,
  required,
  isDarkMode,
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.find((o) => o.value === value)
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkMode ? '#f9fafb' : '#111827' }}>
          {label}
        </Text>
        {required && <Text style={{ color: '#ef4444', fontSize: 14 }}>*</Text>}
      </View>

      {description && (
        <Text style={{ fontSize: 12, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
          {description}
        </Text>
      )}

      <Pressable
        onPress={() => { setOpen((prev) => !prev); setSearch('') }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: error
            ? '#ef4444'
            : open
              ? '#9ca3af'
              : isDarkMode ? '#374151' : '#e5e7eb',
          backgroundColor: isDarkMode ? '#0b0e14' : '#fff',
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: selected
              ? isDarkMode ? '#f9fafb' : '#111827'
              : isDarkMode ? '#6b7280' : '#9ca3af',
          }}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Icon
          name={open ? 'ChevronUp' : 'ChevronDown'}
          size={18}
          color={isDarkMode ? '#9ca3af' : '#6b7280'}
        />
      </Pressable>

      {open && (
        <View
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? '#374151' : '#f3f4f6',
              gap: 8,
            }}
          >
            <Icon name="Search" size={15} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search..."
              placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
              style={{
                flex: 1,
                fontSize: 13,
                color: isDarkMode ? '#f9fafb' : '#111827',
                paddingVertical: 2,
              }}
            />
          </View>

          <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
            {filtered.length === 0 ? (
              <Text style={{ padding: 14, fontSize: 13, color: isDarkMode ? '#6b7280' : '#9ca3af', textAlign: 'center' }}>
                No results found
              </Text>
            ) : (
              filtered.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => { onChange(opt.value); setOpen(false); setSearch('') }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 14,
                    paddingVertical: 13,
                    backgroundColor: value === opt.value ? '#FF9933' : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: value === opt.value ? '600' : '400',
                      color: value === opt.value ? '#fff' : isDarkMode ? '#f9fafb' : '#111827',
                    }}
                  >
                    {opt.label}
                  </Text>
                  {value === opt.value && <Icon name="Check" size={16} color="#fff" />}
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {error && (
        <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{error}</Text>
      )}
    </View>
  )
}

// ─── Multi Select Dropdown ─────────────────────────────────
const MultiDropdown = ({
  label,
  description,
  placeholder,
  options,
  value = [],
  onChange,
  error,
  required,
  isDarkMode,
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.filter((o) => (value || []).includes(o.value))
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (optValue) => {
    const current = value || []
    if (current.includes(optValue)) {
      onChange(current.filter((v) => v !== optValue))
    } else {
      onChange([...current, optValue])
    }
  }

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkMode ? '#f9fafb' : '#111827' }}>
          {label}
        </Text>
        {required && <Text style={{ color: '#ef4444', fontSize: 14 }}>*</Text>}
      </View>

      {description && (
        <Text style={{ fontSize: 12, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
          {description}
        </Text>
      )}

      <Pressable
        onPress={() => { setOpen((prev) => !prev); setSearch('') }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: error
            ? '#ef4444'
            : open
              ? '#9ca3af'
              : isDarkMode ? '#374151' : '#e5e7eb',
          backgroundColor: isDarkMode ? '#0b0e14' : '#fff',
          minHeight: 48,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {selected.length === 0 ? (
            <Text style={{ fontSize: 14, fontWeight: '500', color: isDarkMode ? '#6b7280' : '#9ca3af' }}>
              {placeholder}
            </Text>
          ) : (
            selected.map((s) => (
              <View
                key={s.value}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 20,
                  backgroundColor: isDarkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#3B82F6' }}>
                  {s.label}
                </Text>
                <Pressable onPress={(e) => { e.stopPropagation(); toggle(s.value) }} hitSlop={6}>
                  <Icon name="X" size={11} color="#3B82F6" />
                </Pressable>
              </View>
            ))
          )}
        </View>
        <Icon
          name={open ? 'ChevronUp' : 'ChevronDown'}
          size={18}
          color={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ marginLeft: 8 }}
        />
      </Pressable>

      {open && (
        <View
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? '#374151' : '#f3f4f6',
              gap: 8,
            }}
          >
            <Icon name="Search" size={15} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search..."
              placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
              style={{
                flex: 1,
                fontSize: 13,
                color: isDarkMode ? '#f9fafb' : '#111827',
                paddingVertical: 2,
              }}
            />
            {selected.length > 0 && (
              <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: '#FF9933' }}>
                <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>
                  {selected.length}
                </Text>
              </View>
            )}
          </View>

          <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
            {filtered.length === 0 ? (
              <Text style={{ padding: 14, fontSize: 13, color: isDarkMode ? '#6b7280' : '#9ca3af', textAlign: 'center' }}>
                No results found
              </Text>
            ) : (
              filtered.map((opt) => {
                const isSelected = (value || []).includes(opt.value)
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => toggle(opt.value)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 14,
                      paddingVertical: 13,
                      backgroundColor: isSelected ? '#FF9933' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isSelected ? '600' : '400',
                        color: isSelected ? '#fff' : isDarkMode ? '#f9fafb' : '#111827',
                      }}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && <Icon name="Check" size={16} color="#fff" />}
                  </Pressable>
                )
              })
            )}
          </ScrollView>

          {selected.length > 0 && (
            <Pressable
              onPress={() => setOpen(false)}
              style={{
                paddingVertical: 12,
                alignItems: 'center',
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? '#374151' : '#f3f4f6',
                backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FF9933' }}>
                Done  ({selected.length} selected)
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {error && (
        <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{error}</Text>
      )}
    </View>
  )
}

export default TravelPreferencesSection