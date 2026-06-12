import { View, Text, Pressable } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback } from "react";

const OPTIONS = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
  { label: "Custom", value: "custom" },
];

const SHEET_BG = "#1C1C24";
const SHEET_TEXT = "#F1F1F4";
const SHEET_MUTED = "#9898A6";
const SHEET_ACTIVE_BG = "#6366F1";

type BudgetPeriodBottomSheetProps = {
  sheetRef: React.RefObject<BottomSheet | null>;
  selectedValue: string;
  onSelect: (value: string) => void;
};

export function BudgetPeriodBottomSheet({
  sheetRef,
  selectedValue,
  onSelect,
}: BudgetPeriodBottomSheetProps) {
  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
      sheetRef.current?.close();
    },
    [sheetRef, onSelect]
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
    []
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={[320]}
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
            const isActive = opt.value === selectedValue;
            return (
              <Pressable
                key={opt.value}
                onPress={() => handleSelect(opt.value)}
                className="flex-row items-center justify-between px-4 py-3.5 rounded-xl"
                style={{
                  backgroundColor: isActive ? SHEET_ACTIVE_BG : undefined,
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
