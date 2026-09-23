import { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '../../components/AppIcon';
import { AppContext } from '../../context/AppContext';
import { useDarkMode } from '../../context/DarkModeContext';
import { Fonts } from '../../constants/theme';
import { deleteAccount, getUserSettings, updateUserSettings } from '../../services/settings.api';

// ── Dropdown Select (matches web designs exactly) ─────────────────────────────
const Dropdown = ({ label, description, options, value, onChange, isDarkMode }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const bg = isDarkMode ? '#1a2233' : '#fff';
  const bgDropdown = isDarkMode ? '#1e2b3a' : '#fff';
  const border = isDarkMode ? '#2d3f55' : '#D8C2B6';
  const borderOpen = '#F97316';
  const textPrimary = isDarkMode ? '#FFF1EC' : '#261913';
  const textSecondary = isDarkMode ? '#A9917F' : '#8D7165';

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
          color={open ? '#F97316' : textSecondary}
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
                  backgroundColor: isSelected ? '#F97316' : 'transparent',
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: isDarkMode ? '#2d3f55' : '#FFE9E1',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isSelected ? '600' : '500',
                    color: isSelected ? '#fff' : textPrimary,
                  }}
                >
                  {opt.label}
                </Text>
                {opt.description && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: isSelected ? 'rgba(255,255,255,0.8)' : textSecondary,
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

// ── Toggle Switch + Item — matches web's ToggleSwitch/ToggleItem exactly ──────
const ToggleSwitch = ({ checked, onChange }) => (
  <Pressable
    onPress={() => onChange(!checked)}
    style={{
      width: 44,
      height: 24,
      borderRadius: 999,
      padding: 2,
      backgroundColor: checked ? '#A23F00' : '#E1BFB2',
      justifyContent: 'center',
    }}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 999,
        backgroundColor: '#FFFFFF',
        transform: [{ translateX: checked ? 20 : 0 }],
      }}
    />
  </Pressable>
);

const ToggleItem = ({ label, description, checked, onChange, isDarkMode }) => {
  const textPrimary = isDarkMode ? '#FFF1EC' : '#261913';
  const textSecondary = isDarkMode ? '#A9917F' : '#8D7165';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
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
      <ToggleSwitch checked={checked} onChange={onChange} />
    </View>
  );
};

// ── Section Card ──────────────────────────────────────────────────────────────
const Section = ({ title, icon, children, isDarkMode, zIndex = 1 }) => {
  const bg = isDarkMode ? '#131c2b' : '#fff';
  const border = isDarkMode ? '#1e2d42' : '#EDD6CD';
  const textPrimary = isDarkMode ? '#e2e8f0' : '#261913';
  const textSecondary = isDarkMode ? '#8D7165' : '#8D7165';

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: border,
        gap: 18,
        zIndex,
      }}
    >
      {/* Section header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name={icon} size={18} color={textSecondary} />
        <Text
          style={{
            fontSize: 17,
            fontFamily: Fonts.playfair?.bold,
            color: textPrimary,
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { logout } = useContext(AppContext) || {};
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

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

  const fetchSettings = async () => {
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      showToast('error', 'Please enter your password to confirm deletion.');
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await deleteAccount(deletePassword);
      if (res?.data?.success) {
        showToast('success', 'Your account has been permanently deleted.');
        setShowDeleteModal(false);
        await logout?.();
        router.replace('/home');
      } else {
        showToast('error', res?.data?.message || 'Failed to delete account.');
      }
    } catch (error) {
      showToast('error', error?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

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

  const bgPage = isDarkMode ? '#0b0e14' : '#FFF1EC';
  const bgCard = isDarkMode ? '#131c2b' : '#fff';
  const border = isDarkMode ? '#1e2d42' : '#EDD6CD';
  const textPrimary = isDarkMode ? '#FFF1EC' : '#261913';
  const textSecondary = isDarkMode ? '#8D7165' : '#8D7165';

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: bgPage, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#F97316" />
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
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Page Header ── */}
        <View
          style={{
            backgroundColor: bgCard,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: isDarkMode ? '#1e2b3a' : '#FFE9E1',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="ArrowLeft" size={20} color={textSecondary} />
          </Pressable>

          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              backgroundColor: isDarkMode ? 'rgba(237,137,54,0.18)' : 'rgba(162,63,0,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="Shield" size={24} color={isDarkMode ? '#ED8936' : '#A23F00'} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 22,
                fontFamily: Fonts.playfair?.bold,
                color: textPrimary,
                lineHeight: 28,
              }}
            >
              Privacy & Settings
            </Text>
            <Text style={{ fontSize: 13, color: textSecondary, marginTop: 3, lineHeight: 18 }}>
              Manage your profile visibility and notification preferences
            </Text>
          </View>
        </View>

        {/* ── Privacy Controls — high zIndex so dropdowns overlap below ── */}
        <Section title="Privacy Controls" icon="Lock" isDarkMode={isDarkMode} zIndex={20}>
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
        <Section title="Notification Preferences" icon="Bell" isDarkMode={isDarkMode} zIndex={10}>
          <ToggleItem
            label="Email notifications for new followers"
            description="Get notified when someone follows you"
            checked={formData.emailFollowers}
            onChange={(v) => handleChange('emailFollowers', v)}
            isDarkMode={isDarkMode}
          />
          <ToggleItem
            label="Email notifications for friend requests"
            description="Get notified about new friend requests"
            checked={formData.emailFriendRequests}
            onChange={(v) => handleChange('emailFriendRequests', v)}
            isDarkMode={isDarkMode}
          />
          <ToggleItem
            label="Email notifications for messages"
            description="Get notified about new messages"
            checked={formData.emailMessages}
            onChange={(v) => handleChange('emailMessages', v)}
            isDarkMode={isDarkMode}
          />
          <ToggleItem
            label="Email notifications for post interactions"
            description="Get notified when someone interacts with your posts"
            checked={formData.emailPostInteractions}
            onChange={(v) => handleChange('emailPostInteractions', v)}
            isDarkMode={isDarkMode}
          />
        </Section>

        {/* ── Discovery Settings ── */}
        <Section title="Discovery Settings" icon="Compass" isDarkMode={isDarkMode} zIndex={5}>
          <ToggleItem
            label="Show my profile in city-based discovery"
            description="Let travelers in your city find you"
            checked={formData.showInDiscovery}
            onChange={(v) => handleChange('showInDiscovery', v)}
            isDarkMode={isDarkMode}
          />
          <ToggleItem
            label="Show my online status"
            description="Let others see when you're active"
            checked={formData.showOnlineStatus}
            onChange={(v) => handleChange('showOnlineStatus', v)}
            isDarkMode={isDarkMode}
          />
          <ToggleItem
            label="Allow profile sharing"
            description="Let others share your profile"
            checked={formData.allowProfileSharing}
            onChange={(v) => handleChange('allowProfileSharing', v)}
            isDarkMode={isDarkMode}
          />
        </Section>

        {/* ── Travel Preferences — placeholder, matches web ── */}
        <Section title="Travel Preferences" icon="MapPinned" isDarkMode={isDarkMode} zIndex={4}>
          <Text style={{ fontSize: 13, color: textSecondary, lineHeight: 19 }}>
            Trip style, budget range, and companion preferences are coming soon.
          </Text>
        </Section>

        {/* ── Security / Danger Zone ── */}
        <View
          style={{
            backgroundColor: isDarkMode ? 'rgba(248,113,113,0.06)' : 'rgba(186,26,26,0.05)',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(248,113,113,0.25)' : 'rgba(186,26,26,0.2)',
            gap: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="Shield" size={18} color={isDarkMode ? '#F87171' : '#BA1A1A'} />
            <Text style={{ fontSize: 17, fontFamily: Fonts.playfair?.bold, color: isDarkMode ? '#F87171' : '#BA1A1A' }}>
              Security
            </Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon name="Trash2" size={15} color={isDarkMode ? '#F87171' : '#BA1A1A'} />
              <Text style={{ fontSize: 14, fontFamily: Fonts.inter?.semibold, color: isDarkMode ? '#F87171' : '#BA1A1A' }}>
                Danger Zone
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: textSecondary, lineHeight: 19, marginBottom: 14 }}>
              Once you delete your account, there is no going back. All your posts, trips, messages, and data will be permanently removed.
            </Text>
            <Pressable
              onPress={() => { setShowDeleteModal(true); setDeletePassword(''); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(248,113,113,0.35)' : 'rgba(186,26,26,0.35)',
              }}
            >
              <Icon name="Trash2" size={15} color={isDarkMode ? '#F87171' : '#BA1A1A'} />
              <Text style={{ fontSize: 14, fontFamily: Fonts.inter?.semibold, color: isDarkMode ? '#F87171' : '#BA1A1A' }}>
                Delete My Account
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Info note ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            backgroundColor: isDarkMode ? 'rgba(0,101,144,0.1)' : 'rgba(0,101,144,0.07)',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(0,101,144,0.25)' : 'rgba(0,101,144,0.16)',
            padding: 14,
          }}
        >
          <Icon name="Info" size={17} color={isDarkMode ? '#63B3ED' : '#006590'} />
          <Text style={{ flex: 1, fontSize: 13, color: textSecondary, lineHeight: 20 }}>
            Your privacy is important to us. You can change these settings anytime.
          </Text>
        </View>

        {/* ── Save / Discard ── */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={fetchSettings}
            style={{
              flex: 1,
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <Text style={{ fontSize: 14, fontFamily: Fonts.inter?.semibold, color: textPrimary }}>
              Discard
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={{
              flex: 2,
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 10,
              opacity: saving ? 0.7 : 1,
              backgroundColor: '#A23F00',
            }}
          >
            <Icon name={saving ? 'Loader' : 'Save'} size={18} color="#fff" />
            <Text
              style={{
                fontSize: 15,
                fontFamily: Fonts.inter?.semibold,
                color: '#fff',
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Delete Account Modal ── */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => !deleteLoading && setShowDeleteModal(false)}
          />
          <View
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 20,
              padding: 22,
              backgroundColor: bgCard,
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(248,113,113,0.3)' : 'rgba(186,26,26,0.25)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDarkMode ? 'rgba(248,113,113,0.15)' : 'rgba(186,26,26,0.1)',
                }}
              >
                <Icon name="Trash2" size={20} color={isDarkMode ? '#F87171' : '#BA1A1A'} />
              </View>
              <View>
                <Text style={{ fontSize: 17, fontFamily: Fonts.playfair?.semibold, color: textPrimary }}>
                  Delete Account
                </Text>
                <Text style={{ fontSize: 12, color: textSecondary }}>This action cannot be undone</Text>
              </View>
            </View>

            <Text style={{ fontSize: 13, color: textSecondary, lineHeight: 19, marginBottom: 16 }}>
              All your posts, trips, messages, and profile data will be permanently erased. Please enter your password to confirm.
            </Text>

            <Text style={{ fontSize: 13, fontFamily: Fonts.inter?.semibold, color: textPrimary, marginBottom: 6 }}>
              Confirm your password
            </Text>
            <View style={{ position: 'relative', marginBottom: 18 }}>
              <TextInput
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry={!showDeletePassword}
                placeholder="Enter your password"
                placeholderTextColor={textSecondary}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  paddingRight: 42,
                  borderRadius: 10,
                  fontSize: 14,
                  color: textPrimary,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#FFF1EC',
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(248,113,113,0.25)' : 'rgba(186,26,26,0.3)',
                }}
              />
              <Pressable
                onPress={() => setShowDeletePassword((p) => !p)}
                style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
              >
                <Icon name={showDeletePassword ? 'EyeOff' : 'Eye'} size={16} color={textSecondary} />
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                disabled={deleteLoading}
                onPress={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: border,
                }}
              >
                <Text style={{ fontSize: 14, fontFamily: Fonts.inter?.semibold, color: textPrimary }}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={deleteLoading || !deletePassword.trim()}
                onPress={handleDeleteAccount}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: '#BA1A1A',
                  opacity: deleteLoading || !deletePassword.trim() ? 0.4 : 1,
                }}
              >
                {deleteLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name="Trash2" size={15} color="#fff" />
                )}
                <Text style={{ fontSize: 14, fontFamily: Fonts.inter?.semibold, color: '#fff' }}>
                  {deleteLoading ? 'Deleting...' : 'Delete Forever'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsPage;
