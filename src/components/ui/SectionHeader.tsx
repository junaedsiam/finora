import { View, Text, Pressable } from "react-native";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-lg font-sans-bold text-foreground">{title}</Text>
      {actionLabel && (
        <Pressable onPress={onAction}>
          <Text className="text-sm font-sans-medium text-primary">
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
