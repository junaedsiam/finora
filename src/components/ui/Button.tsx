import { Text, Pressable } from "react-native";

type ButtonProps = {
  label: string;
  variant?: "primary" | "outline";
  onPress?: () => void;
  disabled?: boolean;
};

export function Button({
  label,
  variant = "primary",
  onPress,
  disabled,
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`items-center justify-center rounded-2xl py-4 ${
        isPrimary ? "bg-primary" : "border border-border bg-background"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <Text
        className={`text-base ${isPrimary ? "text-white" : "text-foreground"}`}
        style={{ fontFamily: "Inter_600SemiBold" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
