import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-text text-lg font-bold">페이지를 찾을 수 없습니다</Text>
      <Link href="/" className="mt-4">
        <Text className="text-primary font-medium">홈으로 돌아가기</Text>
      </Link>
    </View>
  );
}
