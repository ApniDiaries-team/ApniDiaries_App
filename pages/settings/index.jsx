import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import Icon from '../../components/AppIcon';
import { useDarkMode } from '../../context/DarkModeContext';
import { AppContext } from '../../context/AppContext';
import { Fonts } from '../../constants/theme';
import { deleteAccount, getUserSettings, updateUserSettings } from '../../services/settings.api';

// ── Dropdown Select (matches web designs exactly) ─────────────────────────────
const Dropdown = ({ label, description, options, value, onChange, isDarkMode }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const bg = isDarkMode ? '#1A1F29' : '#FFF1EC';
  const bgDropdown = isDarkMode ? '#1E242F' : '#FFFFFF';
  const border = isDarkMode ? '#2D3748' : '#E1BFB2';
  const borderOpen = isDarkMode ? '#ED8936' : '#A23F00';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#261913';
  const textSecondary = isDarkMode ? '#A0AEC0' : '#594137';

  return (
    <View style={{ gap: 6, zIndex: open ? 999 : 1 }}>
      {/* Label */}
      <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary, fontFamily: Fonts.inter?.semibold }}>
        {label}
      </Text>

      {/* Trigger */}
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: open ? borderOpen : border,
          backgroundColor: bg,
        }}
      >
        <Text style={{ fontSize: 15, color: textPrimary, fontWeight: '500' }}>
          {selected?.label || `Select ${label}`}
        </Text>
        <Icon
          name={open ? 'ChevronUp' : 'ChevronDown'}
          size={18}
          color={open ? borderOpen : textSecondary}
        />
      </Pressable>

      {/* Open dropdown panel */}
      {open && (
        <View
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: border,
            backgroundColor: bgDropdown,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: isSelected ? borderOpen : 'transparent',
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: isDarkMode ? '#2D3748' : '#FFF1EC',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isSelected ? '600' : '500',
                  color: isSelected ? (isDarkMode ? '#0B0E14' : '#fff') : textPrimary,
                  }}
                >
                  {opt.label}
                </Text>
                {opt.description && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: isSelected ? (isDarkMode ? 'rgba(11,14,20,0.8)' : 'rgba(255,255,255,0.8)') : textSecondary,
                      flexShrink: 1,
                      textAlign: 'right',
                      marginLeft: 8,
                    }}
                  >
                    {opt.description}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Description below trigger */}
      {description && !open && (
        <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>
          {description}
        </Text>
      )}
    </View>
  );
};

// ── Checkbox Item ─────────────────────────────────────────────────────────────
const CheckboxItem = ({ label, description, checked, onChange, isDarkMode }) => {
  const textPrimary = isDarkMode ? '#FFFFFF' : '#261913';
  const textSecondary = isDarkMode ? '#A0AEC0' : '#594137';

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, paddingVertical: 4 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary, lineHeight: 20 }}>
          {label}
        </Text>
        {description && (
          <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2, lineHeight: 18 }}>
            {description}
          </Text>
        )}
      </View>
      <View style={{ width: 46, height: 27, borderRadius: 14, justifyContent: 'center', padding: 3, backgroundColor: checked ? (isDarkMode ? '#ED8936' : '#A23F00') : (isDarkMode ? '#2D3748' : '#E1BFB2'), flexShrink: 0 }}>
        <View style={{ width: 21, height: 21, borderRadius: 11, backgroundColor: '#FFFFFF', alignSelf: checked ? 'flex-end' : 'flex-start', shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 2, elevation: 1 }} />
      </View>
    </Pressable>
  );
};

// ── Section Card ──────────────────────────────────────────────────────────────
const Section = ({ title, icon, children, isDarkMode, zIndex = 1, onLayout, danger = false }) => {
  const bg = danger ? (isDarkMode ? 'rgba(252,129,129,0.06)' : '#FFF4F2') : (isDarkMode ? '#1E242F' : '#FFFFFF');
  const border = danger ? (isDarkMode ? 'rgba(252,129,129,0.25)' : '#E8B8B0') : (isDarkMode ? '#2D3748' : '#E1BFB2');
  const textPrimary = isDarkMode ? '#FFFFFF' : '#261913';
  const textSecondary = isDarkMode ? '#A0AEC0' : '#594137';
  const headingColor = danger ? (isDarkMode ? '#FC8181' : '#BA1A1A') : textPrimary;

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 18,
        padding: 20,
        borderWidth: 1,
        borderColor: border,
        gap: 18,
        zIndex,
      }}
      onLayout={onLayout}
    >
      {/* Section header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name={icon} size={18} color={danger ? headingColor : textSecondary} />
        <Text
          style={{
            fontSize: 17,
            fontFamily: Fonts.playfair?.bold,
            color: headingColor,
          }}
        >
          {title}
        </Text>
      </View>
      <View style={{ height: 1, backgroundColor: border, marginTop: -8 }} />
      {children}
    </View>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const router = useRouter();
  const { logout } = useContext(AppContext);
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState('privacy');
  const scrollRef = useRef(null);
  const sectionOffsets = useRef({});

  const [formData, setFormData] = useState({
    profileVisibility: 'public',
    messagePrivacy: 'friends',
    emailFollowers: true,
    emailFriendRequests: true,
    emailMessages: true,
    emailPostInteractions: false,
    showInDiscovery: true,
    showOnlineStatus: true,
    allowProfileSharing: true,
  });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getUserSettings();
        if (res?.data?.success) {
          const u = res.data.data;
          setFormData({
            profileVisibility: u.profile_visibility || 'public',
            messagePrivacy: u.message_visibility || 'friends',
            emailFollowers: u.notify_follows ?? true,
            emailFriendRequests: u.notify_friend_request ?? true,
            emailMessages: u.notify_messages ?? true,
            emailPostInteractions: u.notify_interactions ?? false,
            showInDiscovery: u.city_discovery ?? true,
            showOnlineStatus: u.online_status ?? true,
            allowProfileSharing: u.profile_sharing ?? true,
          });
        }
      } catch {
        showToast('error', 'Could not load settings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        profile_visibility: formData.profileVisibility,
        message_visibility: formData.messagePrivacy,
        notify_follows: formData.emailFollowers,
        notify_friend_request: formData.emailFriendRequests,
        notify_messages: formData.emailMessages,
        notify_interactions: formData.emailPostInteractions,
        city_discovery: formData.showInDiscovery,
        online_status: formData.showOnlineStatus,
        profile_sharing: formData.allowProfileSharing,
      };
      const res = await updateUserSettings(payload);
      if (res?.data?.success) {
        showToast('success', 'Settings updated!');
      } else {
        showToast('error', res?.data?.message || 'Update failed');
      }
    } catch {
      showToast('error', 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      showToast('error', 'Enter your password to confirm account deletion.');
      return;
    }
    setDeleteLoading(true);
    try {
      const response = await deleteAccount(deletePassword);
      if (response?.data?.success) {
        setShowDeleteModal(false);
        await logout?.();
        router.replace('/home');
      } else {
        showToast('error', response?.data?.message || 'Failed to delete account.');
      }
    } catch (error) {
      showToast('error', error?.response?.data?.message || 'Could not delete your account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const profileVisibilityOptions = [
    { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
    { value: 'friends', label: 'Friends Only', description: 'Only your friends can view' },
    { value: 'private', label: 'Private', description: 'Only you can view' },
  ];
  const messagePrivacyOptions = [
    { value: 'everyone', label: 'Everyone', description: 'Anyone can message you' },
    { value: 'friends', label: 'Friends Only', description: 'Only friends can message' },
    { value: 'nobody', label: 'Nobody', description: 'Disable messages' },
  ];

  const bgPage = isDarkMode ? '#0B0E14' : '#FFF8F6';
  const bgCard = isDarkMode ? '#1E242F' : '#FFFFFF';
  const border = isDarkMode ? '#2D3748' : '#E1BFB2';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#261913';
  const textSecondary = isDarkMode ? '#A0AEC0' : '#594137';
  const sections = [
    { id: 'privacy', label: 'Privacy', icon: 'Lock' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'discovery', label: 'Discovery', icon: 'Compass' },
    { id: 'travel', label: 'Travel', icon: 'MapPinned' },
    { id: 'security', label: 'Security', icon: 'Shield' },
  ];
  const scrollToSection = (id) => {
    setActiveSection(id);
    scrollRef.current?.scrollTo({ y: Math.max(0, (sectionOffsets.current[id] || 0) - 12), animated: true });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: bgPage, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#A23F00" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgPage }}>
      {/* Toast */}
      {toast && (
        <View
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            zIndex: 9999,
            backgroundColor: toast.type === 'success' ? '#16a34a' : '#dc2626',
            borderRadius: 10,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name={toast.type === 'success' ? 'CheckCircle2' : 'AlertCircle'} size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 }}>{toast.msg}</Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingRight: 12 }}
          >
            <Icon name="ArrowLeft" size={16} color={textSecondary} />
            <Text style={{ color: textSecondary, fontFamily: Fonts.inter.semibold, fontSize: 12 }}>Back</Text>
          </Pressable>
          <View style={{ flex: 1, height: 1, backgroundColor: border, marginLeft: 4 }} />
        </View>

        <View style={{ gap: 5 }}>
          <Text style={{ color: isDarkMode ? '#ED8936' : '#A23F00', fontFamily: Fonts.inter.bold, fontSize: 10, letterSpacing: 1.8 }}>
            ACCOUNT PREFERENCES
          </Text>
          <Text style={{ color: textPrimary, fontFamily: Fonts.playfair.bold, fontSize: 26 }}>
            Privacy & Settings
          </Text>
          <Text style={{ color: textSecondary, fontFamily: Fonts.inter.regular, fontSize: 13, lineHeight: 19 }}>
            Manage your profile visibility and notification preferences.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
          {sections.map((section) => {
            const selected = activeSection === section.id;
            return (
              <Pressable
                key={section.id}
                onPress={() => scrollToSection(section.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 22, backgroundColor: selected ? (isDarkMode ? '#1A1F29' : '#FFE9E1') : bgCard, borderWidth: 1, borderColor: selected ? (isDarkMode ? '#ED8936' : '#A23F00') : border }}
              >
                <Icon name={section.icon} size={14} color={selected ? (isDarkMode ? '#ED8936' : '#A23F00') : textSecondary} />
                <Text style={{ color: selected ? (isDarkMode ? '#ED8936' : '#A23F00') : textSecondary, fontSize: 12, fontFamily: Fonts.inter.semibold }}>{section.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Privacy Controls — high zIndex so dropdowns overlap below ── */}
        <Section title="Privacy Controls" icon="Lock" isDarkMode={isDarkMode} zIndex={20} onLayout={(event) => { sectionOffsets.current.privacy = event.nativeEvent.layout.y; }}>
          <Dropdown
            label="Profile Visibility"
            description="Control who can see your profile"
            options={profileVisibilityOptions}
            value={formData.profileVisibility}
            onChange={(v) => handleChange('profileVisibility', v)}
            isDarkMode={isDarkMode}
          />
          <Dropdown
            label="Message Privacy"
            description="Control who can send you messages"
            options={messagePrivacyOptions}
            value={formData.messagePrivacy}
            onChange={(v) => handleChange('messagePrivacy', v)}
            isDarkMode={isDarkMode}
          />
        </Section>

        {/* ── Notification Preferences ── */}
        <Section title="Notification Preferences" icon="Bell" isDarkMode={isDarkMode} zIndex={10} onLayout={(event) => { sectionOffsets.current.notifications = event.nativeEvent.layout.y; }}>
          <CheckboxItem
            label="Email notifications for new followers"
            description="Get notified when someone follows you"
            checked={formData.emailFollowers}
            onChange={(v) => handleChange('emailFollowers', v)}
            isDarkMode={isDarkMode}
          />
          <CheckboxItem
            label="Email notifications for friend requests"
            description="Get notified about new friend requests"
            checked={formData.emailFriendRequests}
            onChange={(v) => handleChange('emailFriendRequests', v)}
            isDarkMode={isDarkMode}
          />
          <CheckboxItem
            label="Email notifications for messages"
            description="Get notified about new messages"
            checked={formData.emailMessages}
            onChange={(v) => handleChange('emailMessages', v)}
            isDarkMode={isDarkMode}
          />
          <CheckboxItem
            label="Email notifications for post interactions"
            description="Get notified when someone interacts with your posts"
            checked={formData.emailPostInteractions}
            onChange={(v) => handleChange('emailPostInteractions', v)}
            isDarkMode={isDarkMode}
          />
        </Section>

        {/* ── Discovery Settings ── */}
        <Section title="Discovery Settings" icon="Compass" isDarkMode={isDarkMode} zIndex={5} onLayout={(event) => { sectionOffsets.current.discovery = event.nativeEvent.layout.y; }}>
          <CheckboxItem
            label="Show my profile in city-based discovery"
            description="Let travelers in your city find you"
            checked={formData.showInDiscovery}
            onChange={(v) => handleChange('showInDiscovery', v)}
            isDarkMode={isDarkMode}
          />
          <CheckboxItem
            label="Show my online status"
            description="Let others see when you're active"
            checked={formData.showOnlineStatus}
            onChange={(v) => handleChange('showOnlineStatus', v)}
            isDarkMode={isDarkMode}
          />
          <CheckboxItem
            label="Allow profile sharing"
            description="Let others share your profile"
            checked={formData.allowProfileSharing}
            onChange={(v) => handleChange('allowProfileSharing', v)}
            isDarkMode={isDarkMode}
          />
        </Section>

        <Section title="Travel Preferences" icon="MapPinned" isDarkMode={isDarkMode} zIndex={4} onLayout={(event) => { sectionOffsets.current.travel = event.nativeEvent.layout.y; }}>
          <Text style={{ fontSize: 13, color: textSecondary, lineHeight: 20 }}>
            Trip style, budget range, and companion preferences are coming soon.
          </Text>
        </Section>

        <Section title="Security" icon="Shield" isDarkMode={isDarkMode} zIndex={3} danger onLayout={(event) => { sectionOffsets.current.security = event.nativeEvent.layout.y; }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <Icon name="Trash2" size={15} color={isDarkMode ? '#FC8181' : '#BA1A1A'} />
              <Text style={{ color: isDarkMode ? '#FC8181' : '#BA1A1A', fontFamily: Fonts.inter.bold, fontSize: 13 }}>Danger Zone</Text>
            </View>
            <Text style={{ color: textSecondary, fontFamily: Fonts.inter.regular, fontSize: 12, lineHeight: 19, marginBottom: 14 }}>
              Account deletion permanently removes your posts, trips, messages, and profile data.
            </Text>
            <Pressable
              onPress={() => { setDeletePassword(''); setShowDeleteModal(true); }}
              style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: isDarkMode ? 'rgba(252,129,129,0.45)' : '#BA1A1A', borderRadius: 12 }}
            >
              <Icon name="Trash2" size={15} color={isDarkMode ? '#FC8181' : '#BA1A1A'} />
              <Text style={{ color: isDarkMode ? '#FC8181' : '#BA1A1A', fontFamily: Fonts.inter.semibold, fontSize: 12 }}>Delete my account</Text>
            </Pressable>
          </View>
        </Section>

        {/* ── Info note ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            backgroundColor: isDarkMode ? 'rgba(162,63,0,0.08)' : '#FFF1EC',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(162,63,0,0.2)' : '#E1BFB2',
            padding: 14,
          }}
        >
          <Icon name="Info" size={17} color={isDarkMode ? '#A23F00' : '#A23F00'} />
          <Text style={{ flex: 1, fontSize: 13, color: textSecondary, lineHeight: 20 }}>
            Your privacy is important to us. You can change these settings anytime.
          </Text>
        </View>

      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18, backgroundColor: bgCard, borderTopWidth: 1, borderTopColor: border }}>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, opacity: saving ? 0.7 : 1, backgroundColor: isDarkMode ? '#ED8936' : '#A23F00', shadowColor: isDarkMode ? '#ED8936' : '#A23F00', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 3 }}
        >
          <Icon name={saving ? 'Loader' : 'Save'} size={17} color={isDarkMode ? '#0B0E14' : '#fff'} />
          <Text style={{ fontSize: 15, fontFamily: Fonts.inter.bold, color: isDarkMode ? '#0B0E14' : '#fff' }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Text>
        </Pressable>
      </View>
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 22, backgroundColor: 'rgba(0,0,0,0.62)' }}>
          <View style={{ backgroundColor: bgCard, borderRadius: 22, borderWidth: 1, borderColor: isDarkMode ? 'rgba(252,129,129,0.3)' : '#E8B8B0', padding: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 }}>
              <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: isDarkMode ? 'rgba(252,129,129,0.14)' : '#FDE3D9', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="Trash2" size={19} color={isDarkMode ? '#FC8181' : '#BA1A1A'} />
              </View>
              <View>
                <Text style={{ color: textPrimary, fontFamily: Fonts.playfair.bold, fontSize: 19 }}>Delete account?</Text>
                <Text style={{ color: textSecondary, fontFamily: Fonts.inter.regular, fontSize: 11, marginTop: 2 }}>This action cannot be undone.</Text>
              </View>
            </View>
            <Text style={{ color: textSecondary, fontFamily: Fonts.inter.regular, fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
              Enter your password to permanently remove your ApniDiaries account and its data.
            </Text>
            <Text style={{ color: textPrimary, fontFamily: Fonts.inter.semibold, fontSize: 12, marginBottom: 7 }}>Confirm your password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor, backgroundColor: isDarkMode ? '#0B0E14' : '#FFF1EC', borderRadius: 12, paddingHorizontal: 12 }}>
              <TextInput
                value={deletePassword}
                onChangeText={setDeletePassword}
                placeholder="Enter your password"
                placeholderTextColor={textSecondary}
                secureTextEntry={!showDeletePassword}
                autoCapitalize="none"
                style={{ flex: 1, paddingVertical: 12, color: textPrimary, fontFamily: Fonts.inter.regular, fontSize: 14 }}
              />
              <Pressable onPress={() => setShowDeletePassword((value) => !value)} hitSlop={8}>
                <Icon name={showDeletePassword ? 'EyeOff' : 'Eye'} size={17} color={textSecondary} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Pressable onPress={() => setShowDeleteModal(false)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44, borderWidth: 1, borderColor, borderRadius: 12 }}>
                <Text style={{ color: textPrimary, fontFamily: Fonts.inter.semibold, fontSize: 13 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleDeleteAccount} disabled={deleteLoading} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44, backgroundColor: '#BA1A1A', borderRadius: 12, opacity: deleteLoading ? 0.6 : 1 }}>
                <Text style={{ color: '#FFFFFF', fontFamily: Fonts.inter.bold, fontSize: 13 }}>{deleteLoading ? 'Deleting…' : 'Delete account'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsPage;
