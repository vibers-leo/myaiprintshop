import { View, Text, ScrollView, Pressable } from "react-native";
import { Wand2, Upload, Type, Palette, ImagePlus } from "lucide-react-native";

const TOOLS = [
  {
    icon: Wand2,
    label: "AI 생성",
    description: "텍스트로 디자인 생성",
    color: "#f59e0b",
  },
  {
    icon: Upload,
    label: "이미지 업로드",
    description: "내 이미지로 굿즈 제작",
    color: "#10b981",
  },
  {
    icon: Type,
    label: "텍스트 추가",
    description: "원하는 문구 입력",
    color: "#3b82f6",
  },
  {
    icon: Palette,
    label: "배경 변경",
    description: "배경색/패턴 선택",
    color: "#8b5cf6",
  },
];

const TEMPLATES = [
  { id: "1", name: "미니멀 키링", category: "키링" },
  { id: "2", name: "일러스트 스티커", category: "스티커" },
  { id: "3", name: "포토 카드", category: "포토카드" },
  { id: "4", name: "캐릭터 폰케이스", category: "폰케이스" },
  { id: "5", name: "아트 프린트", category: "액자" },
  { id: "6", name: "커스텀 티셔츠", category: "의류" },
];

export default function StudioScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="pb-8"
    >
      {/* 디자인 캔버스 영역 */}
      <View className="mx-4 mt-4 bg-surface rounded-2xl h-64 items-center justify-center border-2 border-dashed border-border">
        <ImagePlus size={48} color="#94a3b8" />
        <Text className="text-text-muted mt-3 font-medium">
          디자인을 시작하세요
        </Text>
        <Text className="text-text-muted text-sm mt-1">
          AI 생성 또는 이미지 업로드
        </Text>
      </View>

      {/* 도구 모음 */}
      <View className="flex-row mx-4 mt-6 gap-3">
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.label}
            className="flex-1 bg-surface rounded-xl p-3 items-center"
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: tool.color + "20" }}
            >
              <tool.icon size={20} color={tool.color} />
            </View>
            <Text className="text-text text-xs font-medium">{tool.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* 템플릿 */}
      <View className="mx-4 mt-8">
        <Text className="text-lg font-bold text-text mb-4">
          인기 템플릿으로 시작
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {TEMPLATES.map((tpl) => (
            <Pressable
              key={tpl.id}
              className="bg-surface rounded-xl p-4 items-center flex-1 min-w-[30%]"
            >
              <View className="w-12 h-12 bg-white rounded-lg items-center justify-center mb-2">
                <Wand2 size={20} color="#f59e0b" />
              </View>
              <Text className="text-text text-xs font-medium text-center">
                {tpl.name}
              </Text>
              <Text className="text-text-muted text-xs">{tpl.category}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
