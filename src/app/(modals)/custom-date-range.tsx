import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import { useColors } from "@/constants/colors";
import { useTransactionFilter } from "@/stores/transaction-filter.store";

export default function CustomDateRangeModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { startDate, endDate, setCustomRange } = useTransactionFilter();

  const [start, setStart] = React.useState(dayjs(startDate).toDate());
  const [end, setEnd] = React.useState(dayjs(endDate).toDate());

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top + 16,
      }}
    >
      <View className="flex-row items-center justify-between px-6 pb-4">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text
            className="text-base text-primary"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Cancel
          </Text>
        </Pressable>
        <Text
          className="text-base text-foreground"
          style={{ fontFamily: "Inter_600SemiBold" }}
        >
          Custom Range
        </Text>
        <Pressable
          onPress={() => {
            setCustomRange(
              dayjs(start).toISOString(),
              dayjs(end).toISOString(),
            );
            router.back();
          }}
          hitSlop={8}
        >
          <Text
            className="text-base text-primary"
            style={{ fontFamily: "Inter_600SemiBold" }}
          >
            Done
          </Text>
        </Pressable>
      </View>

      <View className="flex-1 px-6">
        <Text
          className="mb-2 text-sm text-muted"
          style={{ fontFamily: "Inter_400Regular" }}
        >
          Start Date
        </Text>
        <View className="mb-6 overflow-hidden bg-surface rounded-2xl">
          <DatePicker
            date={start}
            onDateChange={setStart}
            mode="date"
            maximumDate={end}
            textColor={colors.foreground}
          />
        </View>

        <Text
          className="mb-2 text-sm text-muted"
          style={{ fontFamily: "Inter_400Regular" }}
        >
          End Date
        </Text>
        <View className="overflow-hidden bg-surface rounded-2xl">
          <DatePicker
            date={end}
            onDateChange={setEnd}
            mode="date"
            minimumDate={start}
            textColor={colors.foreground}
          />
        </View>
      </View>
    </View>
  );
}

import React from "react";
