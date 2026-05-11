import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { Image } from 'expo-image';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isFollowing, setIsFollowing] = useState(false);

  const colors = Colors[colorScheme ?? 'light'];

  const profileData = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    bio: 'Passionate about technology and design. Coffee enthusiast ☕',
    location: 'Ho Chi Minh City, Vietnam',
    website: 'www.example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    posts: 128,
    followers: 1243,
    following: 456,
    joinDate: 'Joined March 2023',
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Chuyển đến trang chỉnh sửa hồ sơ');
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', onPress: () => {} },
        { text: 'Đăng xuất', onPress: () => Alert.alert('Đã đăng xuất') },
      ]
    );
  };

  const handleSettings = () => {
    Alert.alert('Cài đặt', 'Chuyển đến trang cài đặt');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F4F8', dark: '#1A3A3A' }}
      headerImage={
        <View style={[styles.headerContainer, { backgroundColor: isDark ? '#2D5A5A' : '#B0E0E6' }]}>
          <IconSymbol size={100} color={isDark ? '#4A9DB0' : '#0077BE'} name="person.circle.fill" />
        </View>
      }
    >
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <Image
          source={{ uri: profileData.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
      </View>

      {/* User Info */}
      <ThemedView style={styles.infoContainer}>
        <ThemedText type="title" style={[styles.name, { fontFamily: Fonts.rounded }]}>
          {profileData.name}
        </ThemedText>

        <ThemedText style={[styles.email, { color: colors.tabIconDefault }]}>
          @{profileData.email.split('@')[0]}
        </ThemedText>

        <ThemedText style={[styles.bio, { color: colors.tabIconDefault }]}>
          {profileData.bio}
        </ThemedText>

        <View style={styles.locationContainer}>
          <IconSymbol size={16} name="mappin.and.ellipse" color={colors.tabIconDefault} />
          <ThemedText style={[styles.location, { color: colors.tabIconDefault }]}>
            {profileData.location}
          </ThemedText>
        </View>

        <View style={styles.websiteContainer}>
          <IconSymbol size={16} name="globe" color={colors.tint} />
          <ThemedText type="link" style={styles.website}>
            {profileData.website}
          </ThemedText>
        </View>

        <ThemedText style={[styles.joinDate, { color: colors.tabIconDefault }]}>
          {profileData.joinDate}
        </ThemedText>
      </ThemedView>

      {/* Stats Section */}
      <ThemedView style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {profileData.posts}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>
            Bài viết
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {profileData.followers}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>
            Người theo dõi
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {profileData.following}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>
            Đang theo dõi
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Action Buttons */}
      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton, { backgroundColor: colors.tint }]}
          onPress={handleEditProfile}
          activeOpacity={0.8}
        >
          <IconSymbol size={18} name="pencil" color="#FFFFFF" />
          <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
            Chỉnh sửa hồ sơ
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.followButton, { borderColor: colors.tint }]}
          onPress={() => setIsFollowing(!isFollowing)}
          activeOpacity={0.8}
        >
          <IconSymbol
            size={18}
            name={isFollowing ? 'checkmark' : 'person.badge.plus'}
            color={colors.tint}
          />
          <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
            {isFollowing ? 'Đã theo dõi' : 'Theo dõi'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Menu Section */}
      <ThemedView style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: colors.tabIconDefault }]}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconContainer}>
            <IconSymbol size={20} name="bookmark.fill" color={colors.tint} />
            <ThemedText style={styles.menuLabel}>Đã lưu</ThemedText>
          </View>
          <IconSymbol size={16} name="chevron.right" color={colors.tabIconDefault} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: colors.tabIconDefault }]}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconContainer}>
            <IconSymbol size={20} name="heart.fill" color={colors.tint} />
            <ThemedText style={styles.menuLabel}>Yêu thích</ThemedText>
          </View>
          <IconSymbol size={16} name="chevron.right" color={colors.tabIconDefault} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: colors.tabIconDefault }]}
          onPress={handleSettings}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconContainer}>
            <IconSymbol size={20} name="gearshape.fill" color={colors.tint} />
            <ThemedText style={styles.menuLabel}>Cài đặt</ThemedText>
          </View>
          <IconSymbol size={16} name="chevron.right" color={colors.tabIconDefault} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconContainer}>
            <IconSymbol size={20} name="door.left.hand.open" color="#FF6B6B" />
            <ThemedText style={[styles.menuLabel, { color: '#FF6B6B' }]}>
              Đăng xuất
            </ThemedText>
          </View>
          <IconSymbol size={16} name="chevron.right" color="#FF6B6B" />
        </TouchableOpacity>
      </ThemedView>

      {/* Footer Spacing */}
      <View style={styles.footer} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 13,
    marginLeft: 6,
  },
  websiteContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  website: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600',
  },
  joinDate: {
    fontSize: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    flex: 1.2,
  },
  followButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    height: 20,
  },
});
