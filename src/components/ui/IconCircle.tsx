import { View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

type IconCircleProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  bgColor: string;
  iconColor?: string;
  size?: number;
};

export function IconCircle({
  icon,
  bgColor,
  iconColor = "#FFFFFF",
  size = 40,
}: IconCircleProps) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: bgColor }}
    >
      <Feather name={icon} size={size * 0.5} color={iconColor} />
    </View>
  );
}
