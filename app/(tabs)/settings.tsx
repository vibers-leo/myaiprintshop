import { View, Text, ScrollView, Pressable } from "react-native";
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react-native";

const MENU_ITEMS = [
  { icon: User, label: "프로필 관리", color: "#f59e0b" },
  { icon: Bell, label: "알림 설정", color: "#3b82f6" },
  { icon: Shield, label: "개인정보 보호", color: "#10b981" },
  { icon: HelpCircle, label: "고객센터", color: "#8b5cf6" },
  { icon: FileText, label: "이용약관", color: "#64748b" },
];

export default function SettingsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="pb-8"
    >
      {/* 프로필 카드 */}
      <View className="mx-4 mt-4 bg-surface rounded-2xl p-6 items-center">
        <View className="w-16 h-16 bg-primary rounded-full items-center justify-center mb-3">
          <User size={28} color="#ffffff" />
        </View>
        <Text className="text-text font-bold text-lg">로그인이 필요합니다</Text>
        <Text className="text-text-muted text-sm mt-1">
          로그인하고 나만의 굿즈를 만들어보세요
        </Text>
        <Pressable className="bg-primary rounded-xl mt-4 py-3 px-8">
          <Text className="text-white font-bold">로그인</Text>
        </Pressable>
      </View>

      {/* 메뉴 */}
      <View className="mx-4 mt-6">
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            className="flex-row items-center py-4 border-b border-border"
          >
            <View
              className="w-9 h-9 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: item.color + "15" }}
            >
              <item.icon size={18} color={item.color} />
            </View>
            <Text className="flex-1 text-text font-medium">{item.label}</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </Pressable>
        ))}
      </View>

      {/* 로그아웃 */}
      <Pressable className="mx-4 mt-6 flex-row items-center justify-center py-3">
        <LogOut size={18} color="#ef4444" />
        <Text className="text-error font-medium ml-2">로그아웃</Text>
      </Pressable>

      {/* 앱 정보 */}
      <Text className="text-text-muted text-xs text-center mt-6">
        굿쯔 v1.0.0
      </Text>
    </ScrollView>
  );
}
