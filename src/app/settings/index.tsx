import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors } from "@/constants/colors";

type SettingsItemProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
};

function SettingsItem({ icon, label, value, onPress }: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3.5 active:opacity-70"
    >
      <View className="h-10 w-10 rounded-xl bg-background items-center justify-center mr-3">
        <Feather name={icon} size={20} color={colors.muted} />
      </View>
      <Text className="flex-1 text-lg font-sans-medium text-foreground">
        {label}
      </Text>
      {value && (
        <Text className="text-base font-sans text-muted mr-2">{value}</Text>
      )}
      <Feather name="chevron-right" size={18} color={colors.muted} />
    </Pressable>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <Text className="text-base font-sans-semibold text-muted uppercase tracking-wider mt-6 mb-2">
      {title}
    </Text>
  );
}

function Divider() {
  return <View className="h-px bg-border ml-12" />;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Settings" showBack showSettings={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Management */}
        <SectionLabel title="Management" />
        <View className="bg-surface rounded-2xl px-4">
          <SettingsItem icon="briefcase" label="Account" onPress={() => router.push("/settings/accounts")} />
          <Divider />
          <SettingsItem icon="credit-card" label="Wallet" onPress={() => router.push("/settings/wallets")} />
          <Divider />
          <SettingsItem icon="grid" label="Category" onPress={() => router.push("/settings/categories")} />
          <Divider />
          <SettingsItem icon="target" label="Budget" />
          <Divider />
          <SettingsItem icon="trending-down" label="Debt" />
          <Divider />
          <SettingsItem icon="repeat" label="Recurring" />
        </View>

        {/* Configuration */}
        <SectionLabel title="Configuration" />
        <View className="bg-surface rounded-2xl px-4">
          <SettingsItem icon="layout" label="Startup Screen" value="Home" />
          <Divider />
          <SettingsItem icon="moon" label="Theme" value="System Default" />
          <Divider />
          <SettingsItem
            icon="dollar-sign"
            label="Currency Format"
            value="$120"
          />
        </View>

        {/* Backup */}
        <SectionLabel title="Backup" />
        <View className="bg-surface rounded-2xl px-4">
          <SettingsItem icon="upload-cloud" label="Google Drive" />
          <Divider />
          <SettingsItem icon="smartphone" label="Device" />
        </View>
      </ScrollView>
    </View>
  );
}
