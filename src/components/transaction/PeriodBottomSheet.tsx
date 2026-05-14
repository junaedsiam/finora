import { View, Text, Pressable } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  useTransactionFilter,
  type Period,
} from "@/stores/transaction-filter.store";
import { useCallback } from "react";

const OPTIONS: { label: string; value: Period }[] = [
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
  { label: "Quarterly", value: "quarter" },
  { label: "Yearly", value: "year" },
  { label: "All Time", value: "all" },
  { label: "Custom Range", value: "custom" },
];

const SHEET_BG = "#1C1C24";
const SHEET_TEXT = "#F1F1F4";
const SHEET_MUTED = "#9898A6";
const SHEET_INACTIVE_BG = "#2C2C38";
const SHEET_ACTIVE_BG = "#6366F1";

type PeriodBottomSheetProps = {
  sheetRef: React.RefObject<BottomSheet | null>;
  onCustomPress: () => void;
};

export function PeriodBottomSheet({
  sheetRef,
  onCustomPress,
}: PeriodBottomSheetProps) {
  const { period, isCustom, setPeriod } = useTransactionFilter();

  const handleSelect = useCallback(
    (p: Period) => {
      if (p === "custom") {
        sheetRef.current?.close();
        onCustomPress();
      } else {
        setPeriod(p);
        sheetRef.current?.close();
      }
    },
    [sheetRef, onCustomPress, setPeriod],
  );

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={[420]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: SHEET_BG }}
      handleIndicatorStyle={{ backgroundColor: SHEET_MUTED }}
    >
      <BottomSheetView className="px-6 pb-8">
        <Text
          className="mb-6 text-lg"
          style={{ fontFamily: "Inter_600SemiBold", color: SHEET_TEXT }}
        >
          Select Period
        </Text>
        <View className="gap-2">
          {OPTIONS.map((opt) => {
            const isActive =
              opt.value === period || (opt.value === "custom" && isCustom);
            return (
              <Pressable
                key={opt.value}
                onPress={() => handleSelect(opt.value)}
                className="flex-row items-center justify-between px-4 py-3.5 rounded-xl"
                style={{
                  backgroundColor: isActive ? SHEET_ACTIVE_BG : null,
                }}
              >
                <Text
                  className="text-base"
                  style={{
                    fontFamily: "Inter_500Medium",
                    color: isActive ? "#FFFFFF" : SHEET_TEXT,
                  }}
                >
                  {opt.label}
                </Text>
                {isActive && (
                  <Text style={{ color: "#FFFFFF", fontSize: 18 }}>✓</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
