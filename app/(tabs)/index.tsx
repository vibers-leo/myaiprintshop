import { View, Text, ScrollView, Pressable } from "react-native";
import { Sparkles, ArrowRight, Star, TrendingUp } from "lucide-react-native";

// 목업 굿즈 데이터
const MOCK_GOODS = [
  {
    id: "1",
    title: "커스텀 아크릴 키링",
    price: "8,900원",
    rating: 4.8,
    reviews: 128,
    category: "키링",
  },
  {
    id: "2",
    title: "AI 일러스트 스티커팩",
    price: "3,500원",
    rating: 4.9,
    reviews: 256,
    category: "스티커",
  },
  {
    id: "3",
    title: "포토카드 세트 (5장)",
    price: "12,000원",
    rating: 4.7,
    reviews: 89,
    category: "포토카드",
  },
  {
    id: "4",
    title: "캔버스 액자 (A4)",
    price: "25,000원",
    rating: 4.6,
    reviews: 45,
    category: "액자",
  },
];

const CATEGORIES = ["전체", "키링", "스티커", "포토카드", "액자", "의류", "폰케이스"];

export default function HomeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="pb-8"
    >
      {/* 히어로 배너 */}
      <View className="mx-4 mt-4 bg-primary rounded-2xl p-6">
        <View className="flex-row items-center mb-2">
          <Sparkles size={20} color="#ffffff" />
          <Text className="text-white text-sm font-medium ml-2">
            AI 굿즈 디자인
          </Text>
        </View>
        <Text className="text-white text-xl font-bold">
          나만의 굿즈를 만들어보세요
        </Text>
        <Text className="text-white text-sm mt-2 opacity-80">
          AI가 디자인하고, 우리가 만들어 드립니다
        </Text>
        <Pressable className="bg-white rounded-xl mt-4 py-3 px-4 flex-row items-center justify-center">
          <Text className="text-primary font-bold">디자인 시작하기</Text>
          <ArrowRight size={16} color="#f59e0b" className="ml-1" />
        </Pressable>
      </View>

      {/* 카테고리 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6"
        contentContainerClassName="px-4 gap-2"
      >
        {CATEGORIES.map((cat, i) => (
          <Pressable
            key={cat}
            className={`px-4 py-2 rounded-full ${
              i === 0 ? "bg-primary" : "bg-surface"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                i === 0 ? "text-white" : "text-text-muted"
              }`}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 인기 굿즈 */}
      <View className="mx-4 mt-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TrendingUp size={18} color="#f59e0b" />
            <Text className="text-lg font-bold text-text ml-2">인기 굿즈</Text>
          </View>
          <Pressable>
            <Text className="text-primary text-sm font-medium">전체보기</Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap gap-3">
          {MOCK_GOODS.map((item) => (
            <Pressable
              key={item.id}
              className="bg-surface rounded-xl p-4 flex-1 min-w-[45%]"
            >
              {/* 이미지 영역 (플레이스홀더) */}
              <View className="bg-white rounded-lg h-28 items-center justify-center mb-3">
                <Sparkles size={28} color="#f59e0b" />
              </View>
              <Text className="text-xs text-primary font-medium">
                {item.category}
              </Text>
              <Text
                className="text-text font-semibold mt-1"
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text className="text-primary font-bold mt-1">
                {item.price}
              </Text>
              <View className="flex-row items-center mt-1">
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text className="text-text-muted text-xs ml-1">
                  {item.rating} ({item.reviews})
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
