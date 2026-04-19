import { View, Text, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useColors } from "@/constants/colors";

type DropdownFieldProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  flex?: boolean;
};

export function DropdownField({
  icon,
  label,
  value,
  onPress,
  flex = true,
}: DropdownFieldProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      className={`${flex ? "flex-1" : ""} flex-row items-center rounded-xl border border-border px-3 py-3`}
    >
      <Feather name={icon} size={18} color={colors.muted} />
      <Text className="flex-1 text-base font-sans-medium text-foreground ml-2" numberOfLines={1}>
        {value || label}
      </Text>
      <Feather name="chevron-down" size={16} color={colors.muted} />
    </Pressable>
  );
}
