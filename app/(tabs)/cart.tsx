import { View, Text, ScrollView, Pressable } from "react-native";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react-native";

// 목업 장바구니 데이터
const MOCK_CART = [
  {
    id: "1",
    title: "커스텀 아크릴 키링",
    price: 8900,
    quantity: 2,
    option: "투명 / 5cm",
  },
  {
    id: "2",
    title: "AI 일러스트 스티커팩",
    price: 3500,
    quantity: 1,
    option: "광택 / 10장",
  },
];

export default function CartScreen() {
  const total = MOCK_CART.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="pb-8"
    >
      {MOCK_CART.length === 0 ? (
        <View className="items-center justify-center pt-32">
          <ShoppingCart size={48} color="#94a3b8" />
          <Text className="text-text-muted mt-4 text-base">
            장바구니가 비어있습니다
          </Text>
          <Text className="text-text-muted text-sm mt-1">
            마음에 드는 굿즈를 담아보세요
          </Text>
        </View>
      ) : (
        <>
          {MOCK_CART.map((item) => (
            <View
              key={item.id}
              className="mx-4 mt-4 bg-surface rounded-xl p-4 flex-row"
            >
              {/* 이미지 플레이스홀더 */}
              <View className="w-20 h-20 bg-white rounded-lg items-center justify-center">
                <ShoppingCart size={24} color="#f59e0b" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-text font-semibold">{item.title}</Text>
                <Text className="text-text-muted text-sm mt-1">
                  {item.option}
                </Text>
                <Text className="text-primary font-bold mt-1">
                  {item.price.toLocaleString()}원
                </Text>
                <View className="flex-row items-center mt-2">
                  <Pressable className="w-7 h-7 bg-white rounded-md items-center justify-center">
                    <Minus size={14} color="#64748b" />
                  </Pressable>
                  <Text className="mx-3 font-medium text-text">
                    {item.quantity}
                  </Text>
                  <Pressable className="w-7 h-7 bg-white rounded-md items-center justify-center">
                    <Plus size={14} color="#64748b" />
                  </Pressable>
                  <Pressable className="ml-auto">
                    <Trash2 size={18} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

          {/* 합계 */}
          <View className="mx-4 mt-6 bg-surface rounded-xl p-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-muted">상품 금액</Text>
              <Text className="text-text font-medium">
                {total.toLocaleString()}원
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-muted">배송비</Text>
              <Text className="text-text font-medium">3,000원</Text>
            </View>
            <View className="h-px bg-border my-2" />
            <View className="flex-row justify-between">
              <Text className="text-text font-bold text-base">총 결제금액</Text>
              <Text className="text-primary font-bold text-base">
                {(total + 3000).toLocaleString()}원
              </Text>
            </View>
          </View>

          <Pressable className="mx-4 mt-4 bg-primary rounded-xl py-4 items-center">
            <Text className="text-white font-bold text-base">
              주문하기 (준비 중)
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
