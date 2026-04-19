import { View, Text } from "react-native";

type TransactionDateGroupProps = {
  day: string;
  dayName: string;
  monthYear: string;
  children: React.ReactNode;
};

export function TransactionDateGroup({
  day,
  dayName,
  monthYear,
  children,
}: TransactionDateGroupProps) {
  return (
    <View className="mt-4">
      {/* Date header */}
      <View className="flex-row items-center gap-2 mb-1">
        <Text
          className="text-2xl text-foreground"
          style={{ fontFamily: "Inter_700Bold" }}
        >
          {day}
        </Text>
        <Text
          className="text-base text-muted"
          style={{ fontFamily: "Inter_500Medium" }}
        >
          {dayName}
        </Text>
        <Text className="text-base text-muted">{monthYear}</Text>
      </View>
      <View className="h-px bg-border mb-1" />
      {children}
    </View>
  );
}
