import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  limit,
  addDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import AnimatedRN, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// --- 1. CẤU HÌNH HỆ THỐNG MÀU CHUYÊN NGHIỆP ---
const THEME = {
  primary: "#3D5CFF", // Indigo
  secondary: "#FFD643", // Yellow
  success: "#89A54E", // Green
  bg: "#F8F9FE", // Light Gray BG
  white: "#FFFFFF",
  text: "#1F1F39", // Deep Dark
  textSecondary: "#858597",
  accent: "#E8EBFF",
  danger: "#FF7675",
};

// --- 2. CẤU HÌNH FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDogzW9Icuveaoec77wyCBcA_vurPLwxaU",
  authDomain: "cnpmapp-f30dc.firebaseapp.com",
  projectId: "cnpmapp-f30dc",
  storageBucket: "cnpmapp-f30dc.firebasestorage.app",
  messagingSenderId: "364828607363",
  appId: "1:364828607363:web:a05641af603232f3346cb6",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Dữ liệu mẫu ban đầu
const SEED_DATA = [
  {
    word: "先生",
    reading: "せんせい",
    meaning: "Giáo viên",
    example: "先生は親切です。",
    level: "N5",
  },
  {
    word: "学生",
    reading: "がくせい",
    meaning: "Học sinh",
    example: "私は学生です。",
    level: "N5",
  },
  {
    word: "学校",
    reading: "がっこう",
    meaning: "Trường học",
    example: "学校へ行きます。",
    level: "N5",
  },
];

export default function App() {
  // --- 3. QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [screen, setScreen] = useState("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vocab, setVocab] = useState([]);
  const [index, setIndex] = useState(0);
  const [profileTab, setProfileTab] = useState("PROGRESS");

  // Animation Hooks cho Flashcard
  const spin = useSharedValue(0);
  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(spin.value, [0, 1], [0, 180])}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${interpolate(spin.value, [0, 1], [180, 360])}deg` },
    ],
  }));

  // --- 4. LOGIC NGHIỆP VỤ ---

  // Tự động kiểm tra đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setScreen("DASHBOARD");
      }
    });
    return unsubscribe;
  }, []);

  // Nạp từ vựng từ Firestore khi vào màn hình học
  useEffect(() => {
    if (screen === "STUDY") {
      const fetchVocab = async () => {
        setLoading(true);
        try {
          const colRef = collection(db, "vocabularies");
          const snap = await getDocs(query(colRef, limit(20)));
          if (snap.empty) {
            // Nếu Firestore trống, nạp dữ liệu mẫu lên
            await Promise.all(SEED_DATA.map((item) => addDoc(colRef, item)));
            setVocab(SEED_DATA);
          } else {
            setVocab(snap.docs.map((doc) => doc.data()));
          }
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
      };
      fetchVocab();
    }
  }, [screen]);

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("Thông báo", "Vui lòng nhập đủ email và mật khẩu");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setScreen("DASHBOARD");
    } catch (e) {
      Alert.alert("Lỗi", "Email hoặc mật khẩu không chính xác");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password)
      return Alert.alert("Thông báo", "Vui lòng nhập đủ email và mật khẩu");
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      setUserId(res.user.uid);
      setScreen("INFO");
    } catch (e: any) {
      Alert.alert("Lỗi đăng ký", e.message);
    }
    setLoading(false);
  };

  const saveProfile = async (goal: string) => {
    setLoading(true);
    try {
      await setDoc(doc(db, "users", userId), {
        name,
        email,
        goal,
        createdAt: new Date(),
      });
      setScreen("DASHBOARD");
    } catch (e: any) {
      Alert.alert("Lỗi lưu thông tin", e.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setScreen("LOGIN");
  };

  // --- 5. GIAO DIỆN CÁC MÀN HÌNH ---

  // 5.1. Màn hình Auth (Đăng nhập/Đăng ký)
  const renderAuth = (isLogin: boolean) => (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authHeader}>
        <View style={styles.circleDecor} />
        <Text style={styles.authLogo}>LearnJ</Text>
        <Text style={styles.authSubTitle}>
          {isLogin ? "Chào mừng trở lại!" : "Bắt đầu hành trình học tập mới"}
        </Text>
      </View>
      <View style={styles.authForm}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          placeholder="example@gmail.com"
          style={styles.modernInput}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <Text style={styles.inputLabel}>Mật khẩu</Text>
        <TextInput
          placeholder="••••••••"
          style={styles.modernInput}
          secureTextEntry
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={isLogin ? handleLogin : handleRegister}
        >
          <Text style={styles.primaryBtnText}>
            {isLogin ? "Đăng nhập" : "Tiếp theo"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryLink}
          onPress={() => setScreen(isLogin ? "REGISTER" : "LOGIN")}
        >
          <Text style={styles.linkText}>
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <Text style={{ color: THEME.primary, fontWeight: "bold" }}>
              {isLogin ? "Đăng ký" : "Đăng nhập"}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // 5.2. Màn hình Khảo sát thông tin (Name/Goal)
  const renderSurvey = (type: "INFO" | "GOAL") => (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.surveyProgress}>
        <View
          style={[
            styles.progressFill,
            { width: type === "INFO" ? "50%" : "100%" },
          ]}
        />
      </View>
      <View style={styles.surveyContent}>
        <Text style={styles.surveyTitle}>
          {type === "INFO" ? "Tên của bạn là gì?" : "Mục tiêu của bạn là gì?"}
        </Text>
        {type === "INFO" ? (
          <>
            <TextInput
              placeholder="Nhập tên của bạn..."
              style={styles.modernInput}
              onChangeText={setName}
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setScreen("GOAL")}
            >
              <Text style={styles.primaryBtnText}>Tiếp tục</Text>
            </TouchableOpacity>
          </>
        ) : (
          ["Học tập", "Công việc", "Du lịch", "Giao tiếp"].map((g) => (
            <TouchableOpacity
              key={g}
              style={styles.optionBtn}
              onPress={() => saveProfile(g)}
            >
              <Text style={styles.optionText}>{g}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </SafeAreaView>
  );

  // 5.3. Màn hình Dashboard (Trang chủ)
  const renderDashboard = () => (
    <SafeAreaView style={styles.dashboardContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        <View style={styles.userHeader}>
          <View>
            <Text style={styles.helloText}>Chào mừng,</Text>
            <Text style={styles.userNameText}>{name || "Người bạn"}</Text>
          </View>
          <TouchableOpacity style={styles.avatarMini} onPress={handleLogout}>
            <Text>🚪</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.premiumBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              Tiếp tục hành trình học tập của bạn!
            </Text>
            <TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => setScreen("STUDY")}
            >
              <Text style={styles.bannerBtnText}>Học ngay</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 60 }}>🇯🇵</Text>
        </View>
        <Text style={styles.sectionTitle}>Thống kê hành trình</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statsCard, { backgroundColor: "#E8EBFF" }]}>
            <Text style={styles.statsVal}>80%</Text>
            <Text style={styles.statsLabel}>Tiến độ</Text>
          </View>
          <View style={[styles.statsCard, { backgroundColor: "#FFF1E0" }]}>
            <Text style={styles.statsVal}>30</Text>
            <Text style={styles.statsLabel}>Phút mỗi ngày</Text>
          </View>
        </View>
        <View style={styles.lessonListCard}>
          <Text style={styles.cardTitle}>Bài tập hàng ngày</Text>
          {["Tự vựng N5: Bài 1", "Ngữ pháp: Thì hiện tại"].map((item, i) => (
            <View key={i} style={styles.lessonItem}>
              <View style={styles.lessonIcon}>
                <Text>📖</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.lessonTitle}>{item}</Text>
                <Text style={styles.lessonSub}>Bấm để bắt đầu</Text>
              </View>
              <Text style={{ color: THEME.primary }}>→</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setScreen("DASHBOARD")}
        >
          <Text style={{ fontSize: 22, color: THEME.primary }}>🏠</Text>
          <View style={styles.navDot} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setScreen("STUDY")}
        >
          <Text style={{ fontSize: 22, color: THEME.textSecondary }}>🎴</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <Text style={{ fontSize: 22, color: THEME.textSecondary }}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderProfile = () => (
    <SafeAreaView style={styles.dashboardContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Profile */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.mainAvatar}>
              <Text style={{ fontSize: 40 }}>👤</Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>7.8</Text>
              <Text style={styles.scoreLabel}>Điểm</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{name || "Dang Thanh Yi"}</Text>
          <Text style={styles.profileSub}>Tài khoản miễn phí</Text>

          <View style={styles.profileActionRow}>
            <TouchableOpacity style={styles.btnGold}>
              <Text style={styles.btnGoldText}>Hồ sơ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOrange}>
              <Text style={styles.btnWhiteText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              profileTab === "PROGRESS" && styles.tabActive,
            ]}
            onPress={() => setProfileTab("PROGRESS")}
          >
            <Text
              style={[
                styles.tabText,
                profileTab === "PROGRESS" && styles.tabTextActive,
              ]}
            >
              Tiến trình
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, profileTab === "AWARD" && styles.tabActive]}
            onPress={() => setProfileTab("AWARD")}
          >
            <Text
              style={[
                styles.tabText,
                profileTab === "AWARD" && styles.tabTextActive,
              ]}
            >
              Thành tựu
            </Text>
          </TouchableOpacity>
        </View>

        {profileTab === "PROGRESS" ? (
          <View style={{ padding: 20 }}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.miniStatCard}>
                <Text style={{ fontSize: 20 }}>🚀</Text>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.miniStatVal}>123</Text>
                  <Text style={styles.miniStatLabel}>Thử thách</Text>
                </View>
              </View>
              <View style={styles.miniStatCard}>
                <Text style={{ fontSize: 20 }}>📁</Text>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.miniStatVal}>458</Text>
                  <Text style={styles.miniStatLabel}>Bài học</Text>
                </View>
              </View>
            </View>

            {/* Radar Chart Section */}
            <View style={styles.chartCard}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.cardTitle}>Tiến độ học tập</Text>
                <Text>•••</Text>
              </View>
              <View style={styles.placeholderChart}>
                <Text style={{ color: THEME.textSecondary }}>
                  {" "}
                  [ Biểu đồ Radar kỹ năng ]{" "}
                </Text>
              </View>
            </View>

            {/* Streak Card */}
            <View style={styles.streakCard}>
              <Text style={styles.streakTitle}>Đã đến lúc bắt đầu Streak!</Text>
              <Text style={styles.streakSub}>
                Hoàn thành bài học mỗi ngày để duy trì
              </Text>
              <View style={styles.streakRow}>
                {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
                  <View key={i} style={styles.streakDay}>
                    <Text
                      style={{
                        fontSize: 20,
                        color: i >= 2 ? THEME.secondary : "#DDD",
                      }}
                    >
                      ⚡
                    </Text>
                    <Text style={styles.streakDayText}>{d}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            {/* Certificate Section */}
            <Text style={styles.sectionTitle}>Giấy chứng nhận</Text>
            <View style={styles.certCard}>
              <Text style={styles.certText}>
                Mở khóa chứng chỉ hoàn thành của bạn
              </Text>
              <Text style={{ fontSize: 50 }}>📜</Text>
            </View>

            {/* Achievements List */}
            <Text style={styles.sectionTitle}>Thành tựu</Text>
            {[
              {
                title: "Người siêng năng",
                desc: "Một tuần học không ngừng",
                icon: "🏆",
                color: "#FFF9C4",
              },
              {
                title: "Thợ săn sao",
                desc: "Thu thập 10 ngôi sao",
                icon: "⭐",
                color: "#FFEBEE",
              },
              {
                title: "Thợ săn các vì sao",
                desc: "Thu thập 40 ngôi sao",
                icon: "🌌",
                color: "#E8EBFF",
              },
            ].map((item, idx) => (
              <View key={idx} style={styles.awardItem}>
                <View
                  style={[styles.awardIcon, { backgroundColor: item.color }]}
                >
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.awardTitle}>{item.title}</Text>
                  <Text style={styles.awardSub}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {renderBottomNav()}
    </SafeAreaView>
  );

  // 5.4. Màn hình Học bài (Flashcard)
  const renderStudy = () => (
    <SafeAreaView style={styles.studyContainer}>
      <View style={styles.studyHeader}>
        <TouchableOpacity
          onPress={() => setScreen("DASHBOARD")}
          style={styles.backBtn}
        >
          <Text style={{ fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.studyHeaderTitle}>Luyện tập Flashcard</Text>
        <Text style={styles.progressCounter}>
          {vocab.length > 0 ? `${index + 1}/${vocab.length}` : "0/0"}
        </Text>
      </View>
      <View style={styles.flashcardContainer}>
        {vocab.length > 0 ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              (spin.value = spin.value === 0 ? withSpring(1) : withSpring(0))
            }
            style={styles.flipWrapper}
          >
            <AnimatedRN.View
              style={[styles.mainCard, styles.frontCard, frontStyle]}
            >
              <Text style={styles.levelTag}>{vocab[index].level}</Text>
              <Text style={styles.kanjiText}>{vocab[index].word}</Text>
              <Text style={styles.readingText}>{vocab[index].reading}</Text>
              <Text style={styles.hintText}>Chạm để xem nghĩa</Text>
            </AnimatedRN.View>
            <AnimatedRN.View
              style={[styles.mainCard, styles.backCard, backStyle]}
            >
              <Text style={styles.meaningLabel}>Ý NGHĨA</Text>
              <Text style={styles.meaningText}>{vocab[index].meaning}</Text>
              <View style={styles.divider} />
              <Text style={styles.exampleLabel}>VÍ DỤ</Text>
              <Text style={styles.exampleText}>{vocab[index].example}</Text>
            </AnimatedRN.View>
          </TouchableOpacity>
        ) : (
          <ActivityIndicator color={THEME.primary} />
        )}
      </View>
      <View style={styles.studyFooter}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => {
            spin.value = 0;
            setIndex((i) => (i + 1) % vocab.length);
          }}
        >
          <Text style={styles.nextBtnText}>Từ tiếp theo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // --- 6. RENDER ĐIỀU HƯỚNG ---
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {screen === "LOGIN" && renderAuth(true)}
      {screen === "REGISTER" && renderAuth(false)}
      {screen === "INFO" && renderSurvey("INFO")}
      {screen === "GOAL" && renderSurvey("GOAL")}
      {screen === "DASHBOARD" && renderDashboard()}
      {screen === "STUDY" && renderStudy()}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      )}
    </View>
  );
}

// --- 7. HỆ THỐNG STYLES CHUYÊN NGHIỆP ---
const styles = StyleSheet.create({
  // Auth Styles
  authContainer: { flex: 1, backgroundColor: THEME.white },
  authHeader: { height: height * 0.3, justifyContent: "center", padding: 30 },
  circleDecor: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: THEME.accent,
  },
  authLogo: {
    fontSize: 36,
    fontWeight: "800",
    color: THEME.text,
    letterSpacing: -1,
  },
  authSubTitle: { fontSize: 16, color: THEME.textSecondary, marginTop: 10 },
  authForm: { padding: 30, flex: 1 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
    marginTop: 20,
  },
  modernInput: {
    backgroundColor: "#F4F5F7",
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  primaryBtn: {
    backgroundColor: THEME.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 40,
    elevation: 5,
  },
  primaryBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  secondaryLink: { marginTop: 25, alignItems: "center" },
  linkText: { color: THEME.textSecondary },

  // Survey Styles
  surveyProgress: { height: 6, backgroundColor: THEME.accent, width: "100%" },
  progressFill: { height: "100%", backgroundColor: THEME.primary },
  surveyContent: { flex: 1, padding: 30, justifyContent: "center" },
  surveyTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 40,
    textAlign: "center",
  },
  optionBtn: {
    backgroundColor: THEME.bg,
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  optionText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
  },

  // Dashboard Styles
  dashboardContainer: { flex: 1, backgroundColor: THEME.bg },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  helloText: { color: THEME.textSecondary, fontSize: 14 },
  userNameText: { fontSize: 24, fontWeight: "bold", color: THEME.text },
  avatarMini: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: THEME.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  premiumBanner: {
    backgroundColor: THEME.primary,
    borderRadius: 28,
    padding: 25,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 26,
    marginBottom: 15,
  },
  bannerBtn: {
    backgroundColor: THEME.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  bannerBtnText: { fontWeight: "bold", fontSize: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: THEME.text,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statsCard: {
    width: "48%",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  statsVal: { fontSize: 24, fontWeight: "800", color: THEME.text },
  statsLabel: { fontSize: 12, color: THEME.textSecondary, marginTop: 4 },
  lessonListCard: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 20,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 15 },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonTitle: { fontWeight: "600", fontSize: 14 },
  lessonSub: { fontSize: 12, color: THEME.textSecondary },

  // Study Styles
  studyContainer: { flex: 1, backgroundColor: THEME.bg },
  studyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  studyHeaderTitle: { fontWeight: "bold", fontSize: 16 },
  progressCounter: { color: THEME.primary, fontWeight: "bold" },
  flashcardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flipWrapper: { width: width * 0.85, height: height * 0.5 },
  mainCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    padding: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  frontCard: { backgroundColor: THEME.white },
  backCard: {
    backgroundColor: THEME.primary,
    transform: [{ rotateY: "180deg" }],
  },
  levelTag: {
    position: "absolute",
    top: 30,
    left: 30,
    color: THEME.primary,
    fontWeight: "bold",
    opacity: 0.5,
  },
  kanjiText: { fontSize: 80, fontWeight: "bold", color: THEME.text },
  readingText: { fontSize: 24, color: THEME.textSecondary, marginTop: 15 },
  hintText: {
    position: "absolute",
    bottom: 30,
    fontSize: 12,
    color: THEME.gray,
  },
  meaningLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 10,
  },
  meaningText: {
    color: "#FFF",
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
  divider: {
    width: 50,
    height: 4,
    backgroundColor: THEME.secondary,
    marginVertical: 30,
    borderRadius: 2,
  },
  exampleLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginBottom: 10,
  },
  exampleText: {
    color: "#FFF",
    fontSize: 18,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 26,
  },
  studyFooter: { padding: 40 },
  nextBtn: {
    backgroundColor: THEME.text,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  nextBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 90,
    backgroundColor: THEME.white,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
  },
  navItem: { alignItems: "center" },
  navDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.primary,
    marginTop: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  // --- Profile Styles ---
  profileHeader: {
    alignItems: "center",
    padding: 30,
    backgroundColor: THEME.white,
  },
  avatarContainer: { position: "relative" },
  mainAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: THEME.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: THEME.white,
    elevation: 5,
  },
  scoreBadge: {
    position: "absolute",
    right: -10,
    top: 0,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: THEME.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#FFF9C4",
    elevation: 3,
  },
  scoreText: { fontSize: 18, fontWeight: "800", color: THEME.text },
  scoreLabel: { fontSize: 10, color: THEME.success },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: THEME.text,
    marginTop: 15,
  },
  profileSub: { color: THEME.textSecondary, marginBottom: 20 },
  profileActionRow: { flexDirection: "row", gap: 15 },
  btnGold: {
    backgroundColor: "#FFF1E0",
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 20,
  },
  btnOrange: {
    backgroundColor: THEME.secondary,
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 20,
  },
  btnGoldText: { color: "#FFB02E", fontWeight: "bold" },
  btnWhiteText: { color: THEME.white, fontWeight: "bold" },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: THEME.white,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tabBtn: { flex: 1, paddingVertical: 15, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: THEME.secondary },
  tabText: { color: THEME.textSecondary, fontWeight: "600" },
  tabTextActive: { color: THEME.secondary },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  miniStatCard: {
    backgroundColor: THEME.white,
    width: "48%",
    padding: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  miniStatVal: { fontWeight: "bold", fontSize: 16 },
  miniStatLabel: { fontSize: 12, color: THEME.textSecondary },

  chartCard: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  placeholderChart: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },

  streakCard: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  streakTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  streakSub: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  streakRow: { flexDirection: "row", gap: 12 },
  streakDay: { alignItems: "center" },
  streakDayText: { fontSize: 12, marginTop: 5, color: THEME.textSecondary },

  certCard: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  certText: { flex: 1, fontWeight: "bold", color: THEME.text, marginRight: 20 },
  awardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.white,
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
  },
  awardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  awardTitle: { fontWeight: "bold", fontSize: 15 },
  awardSub: { fontSize: 12, color: THEME.textSecondary },
});
