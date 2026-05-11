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
  Alert,
} from "react-native";
import LottieView from "lottie-react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
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
  {
    word: "午後",
    reading: "ごご",
    meaning: "Buổi chiều",
    example: "午後三時に会いましょう。",
    level: "N4",
  },
  {
    word: "映画",
    reading: "えいが",
    meaning: "Phim",
    example: "映画を見に行きます。",
    level: "N4",
  },
  {
    word: "疲れた",
    reading: "つかれた",
    meaning: "Bị mệt",
    example: "今日はとても疲れた。",
    level: "N4",
  },
];

const listeningExercises = [
  {
    question: "Nghe và chọn nghĩa đúng",
    audioText: "おはようございます",
    subtitle: "Ohayou gozaimasu",
    choices: ["Chào buổi sáng", "Chúc ngủ ngon", "Xin lỗi"],
    answer: "Chào buổi sáng",
  },
  {
    question: "Nghe và chọn nghĩa đúng",
    audioText: "すみません",
    subtitle: "Sumimasen",
    choices: ["Xin lỗi", "Cảm ơn", "Vâng"],
    answer: "Xin lỗi",
  },
  {
    question: "Nghe và chọn nghĩa đúng",
    audioText: "これは何ですか？",
    subtitle: "Kore wa nan desu ka?",
    choices: ["Đây là cái gì?", "Bạn khỏe không?", "Tôi đói"],
    answer: "Đây là cái gì?",
  },
  {
    question: "Nghe và chọn nghĩa đúng",
    audioText: "映画を見に行きます。",
    subtitle: "Eiga o mi ni ikimasu.",
    choices: ["Tôi đi xem phim.", "Tôi ăn cơm.", "Tôi đi học."],
    answer: "Tôi đi xem phim.",
  },
];

const speakingExercises = [
  {
    prompt: "Nói to: 'おはようございます。今日はいい天気ですね。'",
    hint: "Chào buổi sáng và nhận xét thời tiết.",
  },
  {
    prompt: "Nói to: 'すみません、駅はどこですか？'",
    hint: "Hỏi đường đến nhà ga.",
  },
  {
    prompt: "Nói to: '私は学生です。日本語を勉強しています。'",
    hint: "Giới thiệu bản thân và nói đang học tiếng Nhật.",
  },
];

const dialogExercises = [
  {
    left: "A: こんにちは、今日は何をしますか？",
    right: "B: 映画に行きます。あなたは？",
  },
  {
    left: "A: すみません、この道はどこですか？",
    right: "B: まっすぐ行って、二つ目の角を右です。",
  },
  {
    left: "A: 明日は忙しいですか？",
    right: "B: いいえ、午後は暇です。",
  },
];

const fillExercises = [
  {
    prompt: "私は ____ です。 (I am a teacher)",
    answer: "先生",
  },
  {
    prompt: "彼は ____。 (He is tired)",
    answer: "疲れた",
  },
  {
    prompt: "明日、____ に行きます。 (Tomorrow I go to the station)",
    answer: "駅",
  },
  {
    prompt: "映画は ____ です。 (The movie is good)",
    answer: "いい",
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
  const [studyMode, setStudyMode] = useState<
    "flashcard" | "listening" | "speaking" | "dialog" | "fill"
  >("flashcard");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [fillAnswer, setFillAnswer] = useState("");
  const [showListeningFeedback, setShowListeningFeedback] = useState(false);
  const [listeningCorrect, setListeningCorrect] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speakingRecorded, setSpeakingRecorded] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [hardCount, setHardCount] = useState(0);
  const [profileTab, setProfileTab] = useState("PROGRESS");
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

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

  // Hàm cập nhật Streak vào Firestore
  const updateStreakInFirestore = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentStreak = userData.streak || 0;
      let lastLoginDate = userData.lastLoginDate?.toDate?.() || null;

      if (lastLoginDate) {
        lastLoginDate.setHours(0, 0, 0, 0);
      }

      // Kiểm tra xem user đã login hôm nay chưa
      const alreadyLoginToday =
        lastLoginDate && lastLoginDate.getTime() === today.getTime();

      if (!alreadyLoginToday) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Nếu login hôm qua, tăng streak
        if (lastLoginDate && lastLoginDate.getTime() === yesterday.getTime()) {
          currentStreak = (currentStreak || 0) + 1;
        } else {
          // Nếu hôm qua không login, reset streak
          currentStreak = 1;
        }
      }

      // Cập nhật lên Firestore
      await setDoc(
        userRef,
        {
          streak: currentStreak,
          lastLoginDate: new Date(),
          totalDays: (userData.totalDays || 0) + (alreadyLoginToday ? 0 : 1),
        },
        { merge: true },
      );

      setStreak(currentStreak);
      setTotalDays((userData.totalDays || 0) + (alreadyLoginToday ? 0 : 1));
    } catch (error) {
      console.error("Lỗi cập nhật Streak:", error);
    }
  };

  // Hàm lấy dữ liệu Streak từ Firestore
  const fetchStreakData = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setStreak(userData?.streak || 0);
        setTotalDays(userData?.totalDays || 0);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu Streak:", error);
    }
  };

  // --- 4. LOGIC NGHIỆP VỤ OLD ---

  // Tự động kiểm tra đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setScreen("DASHBOARD");
        // Cập nhật streak khi user login
        updateStreakInFirestore(user.uid);
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

  // Lấy dữ liệu Streak khi vào Profile screen
  useEffect(() => {
    if (screen === "PROFILE" && userId) {
      fetchStreakData(userId);
    }
  }, [screen, userId]);

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("Thông báo", "Vui lòng nhập đủ email và mật khẩu");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setScreen("DASHBOARD");
    } catch {
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
    } catch (error: any) {
      Alert.alert("Lỗi đăng ký", error.message);
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

  const handleCardFeedback = (type: "known" | "hard") => {
    if (!vocab.length) return;

    if (type === "known") {
      setKnownCount((count) => count + 1);
    } else {
      setHardCount((count) => count + 1);
    }

    const nextIdx = (index + 1) % vocab.length;
    if (nextIdx === 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    setIndex(nextIdx);
  };

  const startStudyMode = (
    mode: "flashcard" | "listening" | "speaking" | "dialog" | "fill",
  ) => {
    setStudyMode(mode);
    setExerciseIndex(0);
    setFillAnswer("");
    setShowListeningFeedback(false);
    setListeningCorrect(false);
    if (mode === "flashcard") {
      setIndex(0);
    }
    setScreen("STUDY");
  };

  const handleFillSubmit = () => {
    const current = fillExercises[exerciseIndex];
    if (fillAnswer.trim() === current.answer) {
      setFillAnswer("");
      const nextIdx = exerciseIndex + 1;
      if (nextIdx >= fillExercises.length) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        setExerciseIndex(0);
      } else {
        setExerciseIndex(nextIdx);
      }
    } else {
      Alert.alert("Sai rồi", "Hãy thử lại với từ đúng.");
    }
  };

  const handleListeningAnswer = (choice: string) => {
    const current = listeningExercises[exerciseIndex];
    const isCorrect = choice === current.answer;
    setListeningCorrect(isCorrect);
    setShowListeningFeedback(true);
    setTimeout(() => {
      setShowListeningFeedback(false);
      setListeningCorrect(false);
      handleListeningNext();
    }, 1400);
  };

  const handleReplayListening = () => {
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 1200);
  };

  const handleDialogNext = () => {
    const nextIdx = exerciseIndex + 1;
    setExerciseIndex(nextIdx >= dialogExercises.length ? 0 : nextIdx);
    if (nextIdx >= dialogExercises.length) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const handleSpeakingDone = () => {
    setSpeakingRecorded(true);
    setTimeout(() => {
      setSpeakingRecorded(false);
      handleSpeakingNext();
    }, 1200);
  };

  const handleListeningNext = () => {
    const nextIdx = exerciseIndex + 1;
    setExerciseIndex(nextIdx >= listeningExercises.length ? 0 : nextIdx);
    if (nextIdx >= listeningExercises.length) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const handleSpeakingNext = () => {
    setExerciseIndex((idx) =>
      idx + 1 >= speakingExercises.length ? 0 : idx + 1,
    );
  };

  // --- 5. GIAO DIỆN CÁC MÀN HÌNH ---

  // Bottom Navigation Component
  const renderBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setScreen("DASHBOARD")}
      >
        <Text
          style={{
            fontSize: 22,
            color: screen === "DASHBOARD" ? THEME.primary : THEME.textSecondary,
          }}
        >
          🏠
        </Text>
        {screen === "DASHBOARD" && <View style={styles.navDot} />}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setScreen("STUDY")}
      >
        <Text
          style={{
            fontSize: 22,
            color: screen === "STUDY" ? THEME.primary : THEME.textSecondary,
          }}
        >
          🎴
        </Text>
        {screen === "STUDY" && <View style={styles.navDot} />}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setScreen("PROFILE")}
      >
        <Text
          style={{
            fontSize: 22,
            color: screen === "PROFILE" ? THEME.primary : THEME.textSecondary,
          }}
        >
          👤
        </Text>
        {screen === "PROFILE" && <View style={styles.navDot} />}
      </TouchableOpacity>
    </View>
  );

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
          <View style={styles.bannerGlass}>
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
        </View>
        <Text style={styles.sectionTitle}>Bài tập luyện</Text>
        <View style={styles.modeCardRow}>
          {[
            { icon: "🀄️", label: "Flashcard", mode: "flashcard" },
            { icon: "🎧", label: "Nghe", mode: "listening" },
            { icon: "🎙️", label: "Nói", mode: "speaking" },
            { icon: "💬", label: "Hội thoại", mode: "dialog" },
            { icon: "✍️", label: "Điền từ", mode: "fill" },
          ].map((item) => (
            <TouchableOpacity
              key={item.mode}
              style={styles.modeCard}
              onPress={() => startStudyMode(item.mode as any)}
            >
              <Text style={styles.modeCardIcon}>{item.icon}</Text>
              <Text style={styles.modeCardText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Thống kê hành trình</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statsCard, styles.statsCardGlass]}>
            <Text style={styles.statsVal}>80%</Text>
            <Text style={styles.statsLabel}>Tiến độ</Text>
          </View>
          <View style={[styles.statsCard, styles.statsCardGlass]}>
            <Text style={styles.statsVal}>30</Text>
            <Text style={styles.statsLabel}>Phút mỗi ngày</Text>
          </View>
        </View>
        <View style={[styles.lessonListCard, styles.lessonCardGlass]}>
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
      {renderBottomNav()}
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
          <View style={styles.profileGradient}>
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
              <View style={[styles.miniStatCard, styles.miniStatCardGlass]}>
                <Text style={{ fontSize: 20 }}>🚀</Text>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.miniStatVal}>123</Text>
                  <Text style={styles.miniStatLabel}>Thử thách</Text>
                </View>
              </View>
              <View style={[styles.miniStatCard, styles.miniStatCardGlass]}>
                <Text style={{ fontSize: 20 }}>📁</Text>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.miniStatVal}>458</Text>
                  <Text style={styles.miniStatLabel}>Bài học</Text>
                </View>
              </View>
            </View>

            {/* Radar Chart Section */}
            <View style={[styles.chartCard, styles.chartCardGlass]}>
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
            <View style={[styles.streakCard, styles.streakCardGlass]}>
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Text style={styles.streakTitle}>
                  🔥 {streak} Ngày Liên Tiếp!
                </Text>
                <Text style={styles.streakSub}>
                  {streak > 0
                    ? "Giữ vững chuỗi học tập của bạn!"
                    : "Bắt đầu hành trình học tập hôm nay!"}
                </Text>
              </View>
              <View style={styles.streakStatsRow}>
                <View style={styles.streakStat}>
                  <Text style={styles.streakStatVal}>{streak}</Text>
                  <Text style={styles.streakStatLabel}>Ngày Streak</Text>
                </View>
                <View style={styles.streakStat}>
                  <Text style={styles.streakStatVal}>{totalDays}</Text>
                  <Text style={styles.streakStatLabel}>Tổng Ngày</Text>
                </View>
              </View>
              <Text
                style={[styles.streakSub, { marginTop: 20, marginBottom: 10 }]}
              >
                Tuần này
              </Text>
              <View style={styles.streakRow}>
                {["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"].map(
                  (d, i) => {
                    const today = new Date();
                    const dayOfWeek = today.getDay();
                    const isToday = (dayOfWeek || 7) - 1 === i;
                    const isCompleted = i < (streak > 6 ? 7 : streak);

                    return (
                      <View key={i} style={styles.streakDay}>
                        <Text
                          style={{
                            fontSize: 24,
                            color: isCompleted
                              ? THEME.secondary
                              : isToday
                                ? THEME.primary
                                : "#DDD",
                          }}
                        >
                          {isCompleted ? "⚡" : isToday ? "📍" : "◯"}
                        </Text>
                        <Text
                          style={[
                            styles.streakDayText,
                            {
                              color: isToday
                                ? THEME.primary
                                : THEME.textSecondary,
                              fontWeight: isToday ? "bold" : "normal",
                            },
                          ]}
                        >
                          {d}
                        </Text>
                      </View>
                    );
                  },
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            {/* Certificate Section */}
            <Text style={styles.sectionTitle}>Giấy chứng nhận</Text>
            <View style={[styles.certCard, styles.certCardGlass]}>
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
              <View key={idx} style={[styles.awardItem, styles.awardItemGlass]}>
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

  // 5.4. Màn hình Học bài (Flashcard + Nhiều chế độ)
  const renderStudy = () => {
    const currentStudyTitle = {
      flashcard: "Luyện tập Flashcard",
      listening: "Luyện nghe",
      speaking: "Luyện nói",
      dialog: "Luyện hội thoại",
      fill: "Điền từ",
    }[studyMode];

    const currentExercises =
      studyMode === "listening"
        ? listeningExercises
        : studyMode === "speaking"
          ? speakingExercises
          : studyMode === "dialog"
            ? dialogExercises
            : studyMode === "fill"
              ? fillExercises
              : vocab;

    const totalExercises = currentExercises.length;
    const currentExercise = currentExercises[exerciseIndex];

    return (
      <SafeAreaView style={styles.studyContainer}>
        <View style={styles.studyHeaderGradient}>
          <TouchableOpacity
            onPress={() => setScreen("DASHBOARD")}
            style={styles.backBtn}
          >
            <Text style={{ fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.studyHeaderTitle}>{currentStudyTitle}</Text>
          <Text style={styles.progressCounter}>
            {totalExercises ? `${exerciseIndex + 1}/${totalExercises}` : "0/0"}
          </Text>
        </View>
        <View style={styles.studyProgress}>
          <View
            style={[
              styles.studyProgressFill,
              {
                width: totalExercises
                  ? `${Math.round(((exerciseIndex + 1) / totalExercises) * 100)}%`
                  : "0%",
              },
            ]}
          />
        </View>

        {studyMode === "flashcard" ? (
          <View style={styles.flashcardContainer}>
            {vocab.length > 0 ? (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() =>
                  (spin.value =
                    spin.value === 0 ? withSpring(1) : withSpring(0))
                }
                style={[styles.flipWrapper, styles.flipWrapperGlass]}
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
              <LottieView
                source={require("../../assets/animations/loading.json")}
                autoPlay
                loop
                style={styles.lottieLoader}
              />
            )}
            <View style={styles.studyFeedbackRow}>
              <TouchableOpacity
                style={[styles.studyBadge, styles.knownBadge]}
                onPress={() => handleCardFeedback("known")}
              >
                <Text style={styles.studyBadgeText}>Đã nhớ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.studyBadge, styles.hardBadge]}
                onPress={() => handleCardFeedback("hard")}
              >
                <Text style={styles.studyBadgeText}>Còn khó</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.studyStatsRow}>
              <View style={styles.statBubble}>
                <Text style={styles.statBubbleValue}>{knownCount}</Text>
                <Text style={styles.statBubbleLabel}>Đã nhớ</Text>
              </View>
              <View style={styles.statBubble}>
                <Text style={styles.statBubbleValue}>{hardCount}</Text>
                <Text style={styles.statBubbleLabel}>Còn khó</Text>
              </View>
            </View>
            <View style={styles.studyFooter}>
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => {
                  spin.value = 0;
                  const nextIdx = (index + 1) % vocab.length;
                  if (nextIdx === 0) {
                    setShowCelebration(true);
                    setTimeout(() => setShowCelebration(false), 3000);
                  }
                  setIndex(nextIdx);
                }}
              >
                <Text style={styles.nextBtnText}>
                  {index + 1 === vocab.length
                    ? "🎉 Hoàn Thành!"
                    : "Từ tiếp theo"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : studyMode === "listening" ? (
          <View style={[styles.exerciseCard, styles.exerciseCardGlass]}>
            <Text style={styles.exercisePrompt}>
              {currentExercise.question}
            </Text>
            <Text style={styles.exerciseSubtitle}>
              {currentExercise.audioText}
            </Text>
            <Text style={styles.exerciseSubtitleSmall}>
              {currentExercise.subtitle}
            </Text>
            <TouchableOpacity
              style={[styles.playBtn, isPlayingAudio && styles.playBtnActive]}
              onPress={handleReplayListening}
            >
              <Text
                style={[
                  styles.playBtnText,
                  { color: isPlayingAudio ? "#fff" : THEME.primary },
                ]}
              >
                {isPlayingAudio ? "Đang phát lại..." : "Phát lại"}
              </Text>
            </TouchableOpacity>
            {currentExercise.choices.map((choice: string) => (
              <TouchableOpacity
                key={choice}
                style={styles.choiceBtn}
                onPress={() => handleListeningAnswer(choice)}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </TouchableOpacity>
            ))}
            {showListeningFeedback && (
              <Text
                style={[
                  styles.feedbackText,
                  { color: listeningCorrect ? THEME.success : THEME.danger },
                ]}
              >
                {listeningCorrect ? "Chính xác!" : "Sai rồi, thử lần sau."}
              </Text>
            )}
          </View>
        ) : studyMode === "speaking" ? (
          <View style={[styles.exerciseCard, styles.exerciseCardGlass]}>
            <Text style={styles.exercisePrompt}>{currentExercise.prompt}</Text>
            <TouchableOpacity
              style={[styles.choiceBtn, { backgroundColor: THEME.primary }]}
              onPress={handleSpeakingDone}
            >
              <Text style={[styles.choiceText, { color: "#fff" }]}>
                Đã nói xong
              </Text>
            </TouchableOpacity>
            {speakingRecorded && (
              <Text style={[styles.feedbackText, { color: THEME.success }]}>
                Đã ghi âm xong!
              </Text>
            )}
          </View>
        ) : studyMode === "dialog" ? (
          <View style={[styles.exerciseCard, styles.exerciseCardGlass]}>
            <View style={styles.dialogRow}>
              <Text style={styles.dialogLabel}>A</Text>
              <Text style={styles.dialogText}>{currentExercise.left}</Text>
            </View>
            <View style={[styles.dialogRow, styles.dialogRightRow]}>
              <Text style={styles.dialogLabel}>B</Text>
              <Text style={styles.dialogText}>{currentExercise.right}</Text>
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={handleDialogNext}>
              <Text style={styles.nextBtnText}>Câu tiếp theo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.exerciseCard, styles.exerciseCardGlass]}>
            <Text style={styles.exercisePrompt}>{currentExercise.prompt}</Text>
            <TextInput
              style={styles.fillInput}
              placeholder="Nhập từ còn thiếu"
              value={fillAnswer}
              onChangeText={setFillAnswer}
            />
            <TouchableOpacity style={styles.nextBtn} onPress={handleFillSubmit}>
              <Text style={styles.nextBtnText}>Kiểm tra</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  };

  // Celebration Overlay Component
  const renderCelebration = () => {
    if (!showCelebration) return null;

    return (
      <View style={styles.celebrationOverlay}>
        <LottieView
          source={require("../../assets/animations/confetti.json")}
          autoPlay
          loop={false}
          style={styles.celebrationAnimation}
        />
        <View style={styles.celebrationContent}>
          <Text style={styles.celebrationTitle}>🎉 Tuyệt Vời!</Text>
          <Text style={styles.celebrationText}>
            Bạn đã hoàn thành buổi học!
          </Text>
        </View>
      </View>
    );
  };

  // --- 6. RENDER ĐIỀU HƯỚNG ---
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {screen === "LOGIN" && renderAuth(true)}
      {screen === "REGISTER" && renderAuth(false)}
      {screen === "INFO" && renderSurvey("INFO")}
      {screen === "GOAL" && renderSurvey("GOAL")}
      {screen === "DASHBOARD" && renderDashboard()}
      {screen === "PROFILE" && renderProfile()}
      {screen === "STUDY" && renderStudy()}
      {loading && (
        <View style={styles.loadingOverlay}>
          <LottieView
            source={require("../../assets/animations/loading.json")}
            autoPlay
            loop
            style={styles.lottieLarge}
          />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )}
      {renderCelebration()}
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
    backgroundColor: "#2C3BFF",
    borderRadius: 28,
    padding: 28,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: THEME.primary,
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 26,
    marginBottom: 18,
  },
  bannerBtn: {
    backgroundColor: THEME.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignSelf: "flex-start",
    elevation: 4,
    shadowColor: THEME.primary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  bannerBtnText: {
    fontWeight: "bold",
    fontSize: 14,
    color: THEME.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
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
    padding: 22,
    borderRadius: 22,
    alignItems: "center",
    backgroundColor: THEME.white,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
  studyProgress: {
    height: 8,
    borderRadius: 12,
    backgroundColor: "#E9EDF7",
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  studyProgressFill: {
    height: "100%",
    backgroundColor: THEME.primary,
  },
  studyFeedbackRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  studyBadge: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 6,
  },
  knownBadge: {
    backgroundColor: "#D3F9E8",
  },
  hardBadge: {
    backgroundColor: "#FFE9E6",
  },
  studyBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.text,
  },
  studyStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statBubble: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    backgroundColor: THEME.white,
    alignItems: "center",
    marginHorizontal: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  statBubbleValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.primary,
  },
  statBubbleLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 6,
  },
  nextBtn: {
    backgroundColor: THEME.primary,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: THEME.primary,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
  },
  nextBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  exerciseCard: {
    backgroundColor: THEME.white,
    borderRadius: 28,
    padding: 26,
    marginTop: 24,
    marginHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  exercisePrompt: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 18,
  },
  choiceBtn: {
    backgroundColor: "#F4F5F7",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(28, 42, 70, 0.08)",
  },
  choiceText: {
    fontSize: 16,
    color: THEME.text,
    fontWeight: "600",
  },
  feedbackText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  dialogRow: {
    backgroundColor: "#F7F8FF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
  },
  dialogRightRow: {
    backgroundColor: "#FFF3E8",
  },
  dialogLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.primary,
    marginBottom: 6,
  },
  dialogText: {
    fontSize: 16,
    color: THEME.text,
    lineHeight: 24,
  },
  fillInput: {
    backgroundColor: "#F4F5F7",
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  exerciseSubtitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.text,
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  exerciseSubtitleSmall: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 18,
    textAlign: "center",
  },
  playBtn: {
    backgroundColor: "#F4F5F7",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  playBtnActive: {
    backgroundColor: THEME.primary,
  },
  playBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
  },

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
  lottieLoader: {
    width: 100,
    height: 100,
  },
  lottieLarge: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: THEME.primary,
    fontWeight: "600",
  },
  modeCardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  modeCard: {
    width: "48%",
    padding: 18,
    borderRadius: 20,
    backgroundColor: THEME.white,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: "rgba(63, 81, 181, 0.08)",
  },
  modeCardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  modeCardText: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
    textAlign: "center",
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  celebrationAnimation: {
    width: 300,
    height: 300,
  },
  celebrationContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: "50%",
    left: "50%",
    marginLeft: -100,
    marginTop: -50,
  },
  celebrationTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: THEME.secondary,
    marginBottom: 10,
  },
  celebrationText: {
    fontSize: 16,
    color: THEME.white,
    textAlign: "center",
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
  streakTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 5 },
  streakSub: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  streakStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "#F0F0F0",
    borderBottomColor: "#F0F0F0",
  },
  streakStat: {
    alignItems: "center",
  },
  streakStatVal: {
    fontWeight: "bold",
    fontSize: 24,
    color: THEME.primary,
  },
  streakStatLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 4,
  },
  streakRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    width: "100%",
  },
  streakDay: { alignItems: "center", flex: 1 },
  streakDayText: { fontSize: 10, marginTop: 5, color: THEME.textSecondary },

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

  // --- Gradient & Glassmorphism Styles ---
  profileGradient: {
    backgroundColor: THEME.primary,
    borderRadius: 28,
    padding: 30,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: THEME.primary,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  bannerGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 28,
    padding: 28,
    backdropFilter: "blur(10px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statsCardGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(8px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  lessonCardGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  miniStatCardGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(8px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  chartCardGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  streakCardGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  certCardGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  awardItemGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(8px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  studyHeaderGradient: {
    backgroundColor: THEME.primary,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: THEME.primary,
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  flipWrapperGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 32,
    backdropFilter: "blur(5px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  exerciseCardGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
});
