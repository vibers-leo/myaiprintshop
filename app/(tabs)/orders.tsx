import { View, Text, ScrollView, Pressable } from "react-native";
import { Package, ChevronRight, Clock, CheckCircle } from "lucide-react-native";

const MOCK_ORDERS = [
  {
    id: "ORD-2026-001",
    date: "2026.03.25",
    status: "배송중",
    items: "커스텀 아크릴 키링 외 1건",
    total: "21,300원",
  },
  {
    id: "ORD-2026-002",
    date: "2026.03.20",
    status: "배송완료",
    items: "AI 일러스트 스티커팩",
    total: "3,500원",
  },
  {
    id: "ORD-2026-003",
    date: "2026.03.15",
    status: "배송완료",
    items: "포토카드 세트 (5장)",
    total: "12,000원",
  },
];

function StatusBadge({ status }: { status: string }) {
  const isComplete = status === "배송완료";
  return (
    <View
      className={`flex-row items-center px-2 py-1 rounded-full ${
        isComplete ? "bg-green-100" : "bg-amber-100"
      }`}
    >
      {isComplete ? (
        <CheckCircle size={12} color="#10b981" />
      ) : (
        <Clock size={12} color="#f59e0b" />
      )}
      <Text
        className={`text-xs font-medium ml-1 ${
          isComplete ? "text-green-700" : "text-amber-700"
        }`}
      >
        {status}
      </Text>
    </View>
  );
}

export default function OrdersScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="pb-8"
    >
      {MOCK_ORDERS.length === 0 ? (
        <View className="items-center justify-center pt-32">
          <Package size={48} color="#94a3b8" />
          <Text className="text-text-muted mt-4 text-base">
            주문 내역이 없습니다
          </Text>
        </View>
      ) : (
        MOCK_ORDERS.map((order) => (
          <Pressable
            key={order.id}
            className="mx-4 mt-4 bg-surface rounded-xl p-4"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-text-muted text-sm">{order.id}</Text>
              <StatusBadge status={order.status} />
            </View>
            <Text className="text-text font-semibold">{order.items}</Text>
            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-text-muted text-sm">{order.date}</Text>
              <View className="flex-row items-center">
                <Text className="text-primary font-bold">{order.total}</Text>
                <ChevronRight size={16} color="#94a3b8" className="ml-1" />
              </View>
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
