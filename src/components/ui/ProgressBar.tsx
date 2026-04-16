import { View } from "react-native";

type ProgressBarProps = {
  value: number;
  max: number;
  color?: string;
};

export function ProgressBar({
  value,
  max,
  color = "#3538F8",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View className="h-3 rounded-full bg-surface overflow-hidden">
      <View
        className="h-full rounded-full"
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
